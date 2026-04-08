/**
 * mini-dayjs 包入口
 *
 * 使用方式（与 dayjs 接近）：
 *   import dayjs, { extend } from './index.js'
 *   import relativeTime from './plugins/relativeTime.js'
 *   extend(relativeTime)
 *   dayjs().fromNow()
 */

export { dayjs, extend, Dayjs, parseToDate } from './src/dayjs.js'
export { MS, SECOND, MINUTE, HOUR, DAY, WEEK } from './src/constants.js'
/** 默认导出与 dayjs 一致：import dayjs from 'mini-dayjs' */
export { dayjs as default } from './src/dayjs.js'
