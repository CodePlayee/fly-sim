/**
 * 带重试与「中止即重排队」语义的瓦片图片加载器，供两个 provider 共用。
 *
 * ## 为什么需要
 * geo-three 的 `MapNode.loadData()` 对失败的处理是**一次性**的：
 *   catch { this.material.map = MapNode.defaultTexture; }
 * 而 `MapNode.defaultTexture` 是 `createFillTexture('#000000')` —— **纯黑 1×1 纹理**，
 * 并且此后**永不重试**。所以任何一次瓦片加载失败，那块地形就永久变成**黑色矩形**。
 *
 * 换机场时我们会 `abortPending()` 取消旧机场的在途请求（HTTP/1.1 单 origin 只有 6 条
 * 连接，不取消的话新机场的关键路径会被几百个旧请求堵死）。但简单地 `img.src=''`
 * 会让这些请求以 `net::ERR_ABORTED` 失败，于是一次换机场就制造出几百个黑块。
 *
 * ## 语义
 * - **abort**：中止下载立刻释放连接，但 Promise **保持 pending**，稍后自动重发
 *   —— 调用方（geo-three 节点）永远等到真实数据，不会看到失败。
 * - **retry**：真实网络错误按指数退避重试若干次，耗尽才 reject（此时才会变黑）。
 */
export class RetryingImageLoader {
  /**
   * @param {object} opts
   * @param {number} opts.maxRetry   真实错误的重试次数
   * @param {number} opts.retryBaseMs 首次重试延迟（之后指数退避）
   * @param {number} opts.requeueMs  被 abort 后重新发起的延迟（给新机场的关键路径让路）
   */
  constructor({ maxRetry = 2, retryBaseMs = 400, requeueMs = 1500 } = {}) {
    this.maxRetry = maxRetry;
    this.retryBaseMs = retryBaseMs;
    this.requeueMs = requeueMs;
    this.pending = new Set(); // Set<task>
  }

  /**
   * 加载一张瓦片图。
   * @param {string} url
   * @returns {Promise<HTMLImageElement>}
   */
  load(url) {
    return new Promise((resolve, reject) => {
      this._start({ url, resolve, reject, tries: 0, img: null });
    });
  }

  _start(task) {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous'; // 否则 canvas 被污染、getImageData 抛 SecurityError
    task.img = img;
    img.onload = () => {
      this.pending.delete(task);
      task.resolve(img);
    };
    img.onerror = (e) => {
      this.pending.delete(task);
      if (task.tries < this.maxRetry) {
        task.tries++;
        setTimeout(() => this._start(task), this.retryBaseMs * 2 ** (task.tries - 1));
      } else {
        task.reject(e); // 重试耗尽，交给 geo-three 走它的黑色兜底
      }
    };
    this.pending.add(task);
    img.src = task.url;
  }

  /**
   * 中止所有在途请求并**重新排队**（Promise 不 reject，故不会产生黑块）。
   * @returns {number} 被中止并重排的请求数
   */
  abortPending() {
    const tasks = [...this.pending];
    this.pending.clear();
    for (const task of tasks) {
      const img = task.img;
      img.onload = null;
      img.onerror = null; // 先摘回调，避免 src='' 触发的 error 走进重试分支
      img.src = '';       // 中止下载，立刻释放连接
      setTimeout(() => this._start(task), this.requeueMs);
    }
    return tasks.length;
  }
}
