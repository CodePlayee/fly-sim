/**
 * 矢量瓦片获取 + MVT 解码层（OpenFreeMap，免费、无 token、CORS:*）。
 * 为夜间城市灯网（cityNetwork.js）提供真实 OSM 路网/建筑/跑道/水体几何。
 *
 * 数据源：https://tiles.openfreemap.org/planet/{date}_pt/{z}/{x}/{y}.pbf （MVT, zoom 0–14）
 * 解码：@mapbox/vector-tile + pbf(PbfReader)。几何从瓦片内坐标(extent 4096)转为经纬度。
 *
 * 设计：
 *  - 启动拉一次 tilejson 获取最新瓦片 URL 模板（含日期前缀）。
 *  - fetchTileFeatures(z,x,y) 带 LRU 缓存 + 并发节流；失败抛错供上层回退 cityLights。
 *  - 仅提取 4 类目标图层，按 class 标注，便于 LOD 分级与材质区分。
 */
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';

const TILEJSON_URL = 'https://tiles.openfreemap.org/planet';
// 兜底模板（万一 tilejson 拉取失败，用已知可用的日期；运行时会被最新覆盖）
const FALLBACK_TEMPLATE =
  'https://tiles.openfreemap.org/planet/20260621_080001_pt/{z}/{x}/{y}.pbf';

// 道路 class → 分级（数字越小越主干），供 AGL LOD 过滤
const ROAD_RANK = {
  motorway: 0, trunk: 1, primary: 2, secondary: 3, tertiary: 4,
  minor: 5, service: 6, path: 7, track: 7,
};

// 瓦片内坐标(extent)→经纬度。Web Mercator 反算。
function makeTileToLonLat(z, x, y, extent) {
  const n = Math.pow(2, z);
  return (px, py) => {
    const lon = ((x + px / extent) / n) * 360 - 180;
    const ty = (y + py / extent) / n;
    const latR = Math.atan(Math.sinh(Math.PI * (1 - 2 * ty)));
    const lat = (latR * 180) / Math.PI;
    return [lon, lat];
  };
}

export function createVectorTileSource({ cacheSize = 180, maxConcurrent = 6 } = {}) {
  let template = FALLBACK_TEMPLATE;
  let templateReady = false;

  // 启动拉取最新瓦片模板
  const templateP = fetch(TILEJSON_URL, { mode: 'cors' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      if (j && j.tiles && j.tiles[0]) template = j.tiles[0];
      templateReady = true;
    })
    .catch(() => { templateReady = true; });

  const cache = new Map(); // key "z/x/y" -> features | 'pending' Promise | 'error'
  const order = []; // LRU 键顺序
  let inflight = 0;
  const queue = [];

  function touch(key) {
    const i = order.indexOf(key);
    if (i >= 0) order.splice(i, 1);
    order.push(key);
    while (order.length > cacheSize) {
      const old = order.shift();
      if (old !== key) cache.delete(old);
    }
  }

  function pump() {
    while (inflight < maxConcurrent && queue.length) {
      const job = queue.shift();
      job();
    }
  }

  // 解码一个瓦片的目标图层为经纬度几何要素
  function decode(buf, z, x, y) {
    const tile = new VectorTile(new PbfReader(new Uint8Array(buf)));
    const out = { roads: [], buildings: [], aeroways: [], water: [] };

    function extract(layerName, kind) {
      const L = tile.layers[layerName];
      if (!L) return;
      const toLL = makeTileToLonLat(z, x, y, L.extent);
      for (let i = 0; i < L.length; i++) {
        const f = L.feature(i);
        const cls = f.properties.class || '';
        // 几何：每个 ring/line 是点数组；转经纬度
        const geom = f.loadGeometry();
        const rings = [];
        for (const ring of geom) {
          const pts = new Array(ring.length);
          for (let k = 0; k < ring.length; k++) {
            pts[k] = toLL(ring[k].x, ring[k].y);
          }
          rings.push(pts);
        }
        if (kind === 'road') {
          out.roads.push({ cls, rank: ROAD_RANK[cls] ?? 6, type: f.type, rings });
        } else if (kind === 'building') {
          out.buildings.push({ rings, type: f.type });
        } else if (kind === 'aeroway') {
          out.aeroways.push({ cls, type: f.type, rings });
        } else if (kind === 'water') {
          out.water.push({ cls, type: f.type, rings });
        }
      }
    }

    extract('transportation', 'road');
    extract('building', 'building');
    extract('aeroway', 'aeroway');
    extract('water', 'water');
    return out;
  }

  /**
   * 取瓦片要素（经纬度几何）。返回 Promise<{roads,buildings,aeroways,water}>。
   * 已缓存则立即 resolve；失败 reject（上层据此回退）。
   */
  function fetchTileFeatures(z, x, y) {
    const key = `${z}/${x}/${y}`;
    const cached = cache.get(key);
    if (cached && cached.then) return cached; // pending
    if (cached === 'error') return Promise.reject(new Error('tile error ' + key));
    if (cached) { touch(key); return Promise.resolve(cached); }

    const p = new Promise((resolve, reject) => {
      const run = () => {
        inflight++;
        templateP.then(() => {
          const url = template
            .replace('{z}', z).replace('{x}', x).replace('{y}', y);
          return fetch(url, { mode: 'cors' });
        }).then((r) => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.arrayBuffer();
        }).then((buf) => {
          const feats = decode(buf, z, x, y);
          cache.set(key, feats);
          touch(key);
          resolve(feats);
        }).catch((e) => {
          cache.set(key, 'error');
          reject(e);
        }).finally(() => {
          inflight--;
          pump();
        });
      };
      queue.push(run);
    });
    cache.set(key, p);
    pump();
    return p;
  }

  /** 经纬度 → 指定 zoom 的瓦片 xy（用于上层算所需瓦片集）。 */
  function lonLatToTile(lon, lat, z) {
    const n = Math.pow(2, z);
    const x = Math.floor(((lon + 180) / 360) * n);
    const latR = (lat * Math.PI) / 180;
    const yf = ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n;
    return [x, Math.floor(yf)];
  }

  function isReady() { return templateReady; }

  return { fetchTileFeatures, lonLatToTile, isReady };
}
