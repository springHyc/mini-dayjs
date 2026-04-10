/**
 * relativeTime 插件（教学演示版）
 *
 * 在 dayjs 生态中：相对时间文案通常由本插件 + locale 共同完成，
 * 因为「几分钟前」每种语言词序、复数规则都不同。
 *
 * 本文件展示：如何通过 extend 向 Dayjs.prototype 注入方法，
 * 而不把相对时间逻辑写进核心 dayjs.js —— 这就是「内核小、按需扩展」。
 */

/**
 * @param {*} _option 与官方插件一致预留配置位；此处未使用
 * @param {import('../src/dayjs.js').Dayjs} Dayjs 构造函数，用于挂原型方法
 * @param {import('../src/dayjs.js').dayjs} dayjs 工厂，用于把任意输入包成实例
 */
export default function relativeTimePlugin(_option, Dayjs, dayjs) {
  /**
   * @description 相对于当前时刻的差值,base 默认「现在」,从当前时刻看
   * @returns {string} 相对时间
   */
  Dayjs.prototype.fromNow = function fromNow() {
    return formatRelative(this.valueOf(), Date.now(), { nowLabel: "刚刚" });
  };

  /**
   * @description 与另一时刻的差：base 默认「现在」,从当前时刻看向另一时刻
   * @param {string|number|Date|import('../src/dayjs.js').Dayjs} [base]
   */
  Dayjs.prototype.from = function from(base) {
    const baseMs =
      base == null
        ? Date.now()
        : base instanceof Dayjs
          ? base.valueOf()
          : dayjs(base).valueOf();
    return formatRelative(this.valueOf(), baseMs, { nowLabel: "同一时刻" });
  };

  /**
   * @description 与另一时刻的差：base 默认「现在」,从另一时刻看向本实例（语义与 dayjs 的 to 系列类似，命名保持简短）
   * @returns {string} 相对时间文案
   */
  Dayjs.prototype.toNow = function toNow() {
    return formatRelative(Date.now(), this.valueOf(), { nowLabel: "刚刚" });
  };
}

/**
 * @param {number} selfMs 当前实例时间戳
 * @param {number} baseMs 参照时间戳
 * @param {{ nowLabel: string }} labels
 *
 * 与 dayjs 官方 relativeTime 默认行为对齐（见其 plugin/relativeTime 里 thresholds + diff + Math.round）：
 * - 若用「总秒数 floor 再除以 60」当分钟数，119 秒会得到 1 分钟；
 * - dayjs 在超过「约 1 分钟」区间后，用「分钟」为单位的浮点差再四舍五入，119 秒 ≈ 1.98 分 → 2 分钟。
 * - 秒级展示上限约 44 秒、45～89 秒常显示为「1 分钟」等，与默认 thresholds 一致。
 * - 秒这一档的文案：dayjs 的 zh-cn 里 relativeTime.s 是固定「几秒」，不会显示「30 秒」这种具体数字
 *   （与 en 的 "a few seconds" 同理）；本演示与官方中文文案对齐。
 */
function formatRelative(selfMs, baseMs, labels) {
  const diff = baseMs - selfMs;
  if (diff === 0) return labels.nowLabel;

  const past = diff > 0;
  const absMs = Math.abs(diff);
  const secFloat = absMs / 1000;
  /** 与 dayjs 对 diff 结果取整方式一致（用于是否进入「秒 / 近一分钟」等档位） */
  const secRounded = Math.round(secFloat);

  if (secRounded <= 44) {
    return past ? "几秒前" : "几秒内";
  }
  if (secRounded <= 89) {
    return past ? "1 分钟前" : "1 分钟后";
  }

  const minRounded = Math.round(absMs / 60000);
  if (minRounded < 60) {
    return past ? `${minRounded} 分钟前` : `${minRounded} 分钟后`;
  }
  const hour = Math.floor(minRounded / 60);
  if (hour < 24) {
    return past ? `${hour} 小时前` : `${hour} 小时后`;
  }
  const day = Math.floor(hour / 24);
  if (day < 30) {
    return past ? `${day} 天前` : `${day} 天后`;
  }
  const month = Math.floor(day / 30);
  if (month < 12) {
    return past ? `${month} 个月前` : `${month} 个月后`;
  }
  const year = Math.floor(month / 12);
  return past ? `${year} 年前` : `${year} 年后`;
}
