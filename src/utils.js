/**
 * 纯函数工具：不参与实例状态，便于单测与复用
 * moment 早期大量逻辑写在原型上；dayjs 把内核做薄，格式化等可拆到插件 —— 这里折中演示
 */

/** 数字左侧补零 */
export function pad(n, len = 2) {
  const s = String(Math.floor(Math.abs(n)))
  return s.length >= len ? s : '0'.repeat(len - s.length) + s
}

/**
 * 简易模板格式化（非完整 strftime）
 * 仅覆盖分享课常用 token，展示「扫描模板 → 替换片段」的典型实现
 *
 * token 含义与 dayjs 默认 format 对齐一小部分：
 * YYYY 年 | MM 月 | DD 日 | HH 时 | mm 分 | ss 秒 | SSS 毫秒 | d 星期(0-6)
 */
export function formatWithTemplate(date, template) {
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const H = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  const ms = date.getMilliseconds()
  const d = date.getDay()

  return template.replace(/YYYY|MM|DD|HH|mm|ss|SSS|d/g, (token) => {
    switch (token) {
      case 'YYYY':
        return pad(Y, 4)
      case 'MM':
        return pad(M)
      case 'DD':
        return pad(D)
      case 'HH':
        return pad(H)
      case 'mm':
        return pad(m)
      case 'ss':
        return pad(s)
      case 'SSS':
        return pad(ms, 3)
      case 'd':
        return String(d)
      default:
        return token
    }
  })
}

/**
 * 克隆一个 Date，避免可变 Date 被多处引用时互相污染
 * 不可变风格 API（dayjs）会在每次变更时 new Date，本质也是避免共享引用
 */
export function cloneDate(d) {
  return new Date(d.getTime())
}

/**
 * 日历语义加减月份，与 dayjs 一致（见 dayjs 源码 $set 里 M/Y 分支）
 * 先对齐到当月 1 号再改月份，再用 min(原「日」, 目标月天数) —— 避免原生 setMonth 把 1/31+1M 滚到 3 月初
 */
export function addCalendarMonths(date, amount) {
  const d = cloneDate(date)
  const originalDay = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + amount)
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(originalDay, maxDay))
  return d
}

/** 日历语义加减年份，闰年 2/29 等处理与 dayjs 一致 */
export function addCalendarYears(date, amount) {
  const d = cloneDate(date)
  const originalDay = d.getDate()
  d.setDate(1)
  d.setFullYear(d.getFullYear() + amount)
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(originalDay, maxDay))
  return d
}
