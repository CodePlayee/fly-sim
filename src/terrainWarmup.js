/**
 * 地形定向预热：沿目标经纬度所在的四叉树链路，一次性把 z0 → zMax 的节点全部创建出来，
 * 使各级瓦片请求**并发**发出，而不是逐级串行等待。
 *
 * ## 为什么需要
 * geo-three 的 `MapNode.subdivide()` 有一道硬门槛：
 *   `if (... || parentNode !== null && parentNode.nodesLoaded < MapNode.childrens) return;`
 * 即「父节点的 4 个兄弟瓦片必须全部加载完毕（影像纹理 + DEM 几何）」才允许下一级细分；
 * 而 `subdivide()` 只在 `MapView.onBeforeRender` 的 LOD 遍历里触发，每级还要额外占一帧。
 *
 * 于是从 z0 细分到机场脚下的 z14/15 必须走 **14~15 个严格串行的网络波次**，
 * 每波 = 4 张卫星影像 PNG + 4 张 DEM PNG 的往返。实测十几秒起步，
 * 这正是 loadingMap 里那个 18s 兜底超时存在的原因。
 *
 * ## 做法
 * 直接调用 `createChildNodes()` 建链，跳过上述门槛：**15 个 RTT 压成 ~1 个**。
 * 每级仍连带创建 4 个兄弟瓦片——geo-three 的 `nodesLoaded` 计数依赖它们，
 * 少一个则父节点永远不会 ready、子节点永不可见；何况这些瓦片本来也要加载。
 * 可见性规则不变（某级节点可见 ⟺ 它和 3 个兄弟都 ready），
 * 但总耗时从 `sum(15 波)` 变成 `max(全部并发请求)`。
 *
 * 预热出的节点随后由 LODFrustum 正常接管（已有 children 的节点 subdivide 直接 return，
 * 距离过远时照常 simplify 回收），不会与原有 LOD 逻辑冲突。
 */

const DEG = Math.PI / 180;

/** 经纬度 -> 指定 zoom 的 slippy 瓦片坐标（与 geo-three createChildNodes 的 x/y 约定一致）。 */
function tileXY(lat, lon, z) {
  const n = 2 ** z;
  const latR = Math.max(-85.05, Math.min(85.05, lat)) * DEG;
  const clamp = (v) => Math.max(0, Math.min(n - 1, v));
  return {
    x: clamp(Math.floor(((lon + 180) / 360) * n)),
    y: clamp(Math.floor(((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n)),
  };
}

/**
 * 把四叉树建到目标瓦片 (tx,ty,tz)：逐级取该瓦片在本级的祖先坐标并下探。
 * 已存在的链路直接复用，故对同一区域的多次调用是幂等的、开销极小。
 */
function buildChain(mapView, tx, ty, tz) {
  let node = mapView.root;
  let created = 0;
  for (let level = node.level; level < tz; level++) {
    if (node.children.length === 0) {
      // 绕过 subdivide() 的 nodesLoaded 门槛，直接建 4 个子节点
      // （各自的 initialize() 立即发起影像 + DEM 请求，彼此并发）。
      node.createChildNodes();
      node.subdivided = true;
      created += node.children.length;
    }
    const shift = tz - (level + 1);
    const cx = tx >> shift, cy = ty >> shift;
    const next = node.children.find((c) => c.x === cx && c.y === cy);
    if (!next) break; // 理论不会发生；保险起见中断，交回 LOD 常规流程
    node = next;
  }
  return created;
}

/**
 * 沿 (lat,lon) 所在链路把地形四叉树预建到 maxLevel。
 *
 * 分两阶段，避免周边瓦片和正下方瓦片抢浏览器的连接额度（瓦片服务器都是 HTTP/1.1，
 * 单 origin 只有 6 条并发连接，多发的请求会把关键路径挤到后面的波次）：
 *   ① 立即：正下方那一条链路（决定「过渡层何时揭幕」的关键路径）
 *   ② 延后：周边 ring 圈末级瓦片（起飞抬头后才看得见，可以晚一点）
 *
 * @param {import('geo-three').MapView} mapView
 * @param {number} lat
 * @param {number} lon
 * @param {number} maxLevel 目标层级（默认 14；实际受 mapView.maxZoom() 限制，
 *                          本项目 = min(Esri 19, Terrarium 15) = 15）
 * @param {number} ring 延后预热周边几圈末级瓦片（0=关闭，1=3×3，2=5×5）
 * @returns {number} 第一阶段新建的节点数（0 = 链路已存在，无需重复预热）
 */
export function warmupTerrain(mapView, lat, lon, maxLevel = 14, ring = 1) {
  if (!mapView || !mapView.root) return 0;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 0;

  const tz = Math.max(0, Math.min(maxLevel, mapView.maxZoom()));
  const n = 2 ** tz;
  const { x, y } = tileXY(lat, lon, tz);

  const created = buildChain(mapView, x, y, tz); // ① 正下方链路（最要紧）

  if (ring >= 1) {
    // ② 周边圈：让出关键路径后再建（上层链路已复用，只补末级几格）
    const later = () => {
      for (let dy = -ring; dy <= ring; dy++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
          buildChain(mapView, nx, ny, tz);
        }
      }
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(later, { timeout: 4000 });
    else setTimeout(later, 2500);
  }
  return created;
}
