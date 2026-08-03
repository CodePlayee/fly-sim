/**
 * AWS Terrarium DEM 的多 origin 分片。
 *
 * ## 为什么需要
 * 瓦片服务器（S3 与 Esri）都只支持 **HTTP/1.1**，而浏览器对单个 origin 只开
 * **6 条并发连接**。地形起飞前要并发拉 100+ 张瓦片（见 terrainWarmup.js），
 * 单 origin 会把它们切成十几个串行波次，每波一个 TTFB（实测 ~1.2s），
 * 直接拖成十几秒。
 *
 * 同一份 elevation-tiles-prod 数据在 S3 上有多个**等价且都开放 CORS** 的
 * 主机名（path-style / virtual-hosted / region / dualstack），它们是不同的
 * origin，各自独享 6 条连接 —— 于是并发从 6 提到 24。
 *
 * ⚠️ 分片按瓦片坐标做**确定性**哈希，保证同一瓦片永远落在同一主机，
 *    否则会击穿浏览器 HTTP 缓存、反而重复下载。
 */
const HOSTS = [
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium',
  'https://elevation-tiles-prod.s3.amazonaws.com/terrarium',
  'https://elevation-tiles-prod.s3.us-east-1.amazonaws.com/terrarium',
  'https://elevation-tiles-prod.s3.dualstack.us-east-1.amazonaws.com/terrarium',
];

/** DEM 瓦片 URL（{z}/{x}/{y}.png），主机按坐标确定性分片。 */
export function demTileUrl(z, x, y) {
  const host = HOSTS[(x + y) % HOSTS.length];
  return `${host}/${z}/${x}/${y}.png`;
}
