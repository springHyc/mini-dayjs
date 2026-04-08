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
  Dayjs.prototype.fromNow = function fromNow() {
    return formatRelative(this.valueOf(), Date.now(), { nowLabel: '刚刚' })
  }

  /**
   * 与另一时刻的差：base 默认「现在」
   * @param {string|number|Date|import('../src/dayjs.js').Dayjs} [base]
   */
  Dayjs.prototype.from = function from(base) {
    const baseMs =
      base == null
        ? Date.now()
        : base instanceof Dayjs
          ? base.valueOf()
          : dayjs(base).valueOf()
    return formatRelative(this.valueOf(), baseMs, { nowLabel: '同一时刻' })
  }

  /** 方向相反：从「当前时刻」看向本实例（语义与 dayjs 的 to 系列类似，命名保持简短） */
  Dayjs.prototype.toNow = function toNow() {
    return formatRelative(Date.now(), this.valueOf(), { nowLabel: '刚刚' })
  }
}

/**
 * @param {number} selfMs 当前实例时间戳
 * @param {number} baseMs 参照时间戳
 * @param {{ nowLabel: string }} labels
 */
function formatRelative(selfMs, baseMs, labels) {
  const diff = baseMs - selfMs
  if (diff === 0) return labels.nowLabel

  const past = diff > 0
  const abs = Math.abs(diff)

  const sec = Math.floor(abs / 1000)
  if (sec < 60) {
    return past ? `${sec} 秒前` : `${sec} 秒后`
  }
  const min = Math.floor(sec / 60)
  if (min < 60) {
    return past ? `${min} 分钟前` : `${min} 分钟后`
  }
  const hour = Math.floor(min / 60)
  if (hour < 24) {
    return past ? `${hour} 小时前` : `${hour} 小时后`
  }
  const day = Math.floor(hour / 24)
  if (day < 30) {
    return past ? `${day} 天前` : `${day} 天后`
  }
  const month = Math.floor(day / 30)
  if (month < 12) {
    return past ? `${month} 个月前` : `${month} 个月后`
  }
  const year = Math.floor(month / 12)
  return past ? `${year} 年前` : `${year} 年后`
}
