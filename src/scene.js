import maplibregl from 'maplibre-gl';

/**
 * 全部免费、无需 token/key/登录的数据源：
 * - 地形高程：AWS 开放数据集 elevation-tiles-prod 的 Terrarium 编码 DEM
 * - 卫星影像：Esri World Imagery
 * - 备用底图：Esri World Imagery 同源
 * MapLibre 原生支持 terrain-rgb / terrarium DEM，自动 LOD 流式加载全球地形。
 */
const DEM_TILES = [
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
];
const SAT_TILES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
];

export function buildStyle() {
  return {
    version: 8,
    // glyphs 用于将来加文字标注（指向免费公共字体）
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      satellite: {
        type: 'raster',
        tiles: SAT_TILES,
        tileSize: 256,
        maxzoom: 19,
        attribution: 'Imagery © Esri',
      },
      terrainDEM: {
        type: 'raster-dem',
        tiles: DEM_TILES,
        tileSize: 256,
        maxzoom: 15,
        encoding: 'terrarium',
        attribution: 'Elevation: AWS Terrain Tiles (open data)',
      },
    },
    layers: [
      {
        id: 'bg',
        type: 'background',
        paint: { 'background-color': '#0b1a2b' },
      },
      {
        id: 'satellite',
        type: 'raster',
        source: 'satellite',
        paint: { 'raster-fade-duration': 200 },
      },
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'terrainDEM',
        paint: {
          'hillshade-shadow-color': '#0a0f1a',
          'hillshade-highlight-color': '#ffffff',
          'hillshade-exaggeration': 0.45,
        },
      },
    ],
    // 3D 地形：用同一 DEM 源做实际高程起伏
    terrain: {
      source: 'terrainDEM',
      exaggeration: 1.3,
    },
    sky: {},
  };
}

/** 创建地图，返回 Promise（在 style+terrain 就绪后 resolve） */
export function createMap(containerId, startAirport) {
  const map = new maplibregl.Map({
    container: containerId,
    style: buildStyle(),
    center: [startAirport.lon, startAirport.lat],
    zoom: 14,
    pitch: 75,
    bearing: startAirport.runwayHeading,
    antialias: true,
    maxPitch: 85,
    attributionControl: { compact: true },
    // 截图需要
    preserveDrawingBuffer: true,
  });

  return new Promise((resolve) => {
    map.on('load', () => {
      // 启用 3D 地形
      map.setTerrain({ source: 'terrainDEM', exaggeration: 1.3 });
      resolve(map);
    });
  });
}
