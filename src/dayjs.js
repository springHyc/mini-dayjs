/**
 * mini-dayjs 核心：对原生 Date 的轻量包装
 *
 * 为什么这样设计（与 dayjs 同方向）：
 * 1. 不可变语义：add/subtract/startOf 等返回「新实例」，旧实例不变，减少隐蔽 bug
 * 2. 内核保持极小：复杂能力通过 plugins 注入，避免 moment 那种「全家桶」体积
 * 3. 仍底层依赖 Date：不重复实现历法，闰年、时区夏令时等交给引擎（或另用插件）
 */

import {
  UNIT_TO_MS,
  MS,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  WEEK
} from './constants.js'
import {
  cloneDate,
  formatWithTemplate,
  addCalendarMonths,
  addCalendarYears
} from './utils.js'

/** 已加载插件去重，避免同一插件多次 patch 原型 */
const loadedPluginIds = new Set()

/**
 * @param {Date} d 内部只信任 Date；由工厂函数负责把各种 input 转成 Date
 */
export class Dayjs {
  constructor(d) {
    /** @type {Date} 与 dayjs 一样用 $d 存内部日期，便于调试时辨认 */
    this.$d = d
  }

  /** 时间戳毫秒，与 valueOf 一致，便于与 Number(dayjs()) 比较 */
  valueOf() {
    return this.$d.getTime()
  }

  unix() {
    return Math.floor(this.$d.getTime() / 1000)
  }

  toDate() {
    return new Date(this.$d.getTime())
  }

  clone() {
    return new Dayjs(cloneDate(this.$d))
  }

  isValid() {
    return !Number.isNaN(this.$d.getTime())
  }

  /**
   * 模板格式化 —— 核心思路：正则/扫描替换，而非 moment 早期那种超长 switch
   * 完整 i18n、时区缩写等通常由 locale / timezone 插件扩展
   */
  format(template = 'YYYY-MM-DDTHH:mm:ss.SSSZ') {
    if (!this.isValid()) return 'Invalid Date'
    return formatWithTemplate(this.$d, template)
  }

  year() {
    return this.$d.getFullYear()
  }

  month() {
    /** JS Date 的月份 0–11；对外 API 常做成 1–12，这里与 dayjs 一致返回 0–11 或 1–12？ dayjs: month() returns 0-11 */
    return this.$d.getMonth()
  }

  /** 返回 1–12，更符合人类读法（演示用；与 dayjs 的 month() 不同，注释写明） */
  monthHuman() {
    return this.$d.getMonth() + 1
  }

  date() {
    return this.$d.getDate()
  }

  day() {
    return this.$d.getDay()
  }

  hour() {
    return this.$d.getHours()
  }

  minute() {
    return this.$d.getMinutes()
  }

  second() {
    return this.$d.getSeconds()
  }

  millisecond() {
    return this.$d.getMilliseconds()
  }

  /**
   * 加减：可固定换算的单位走毫秒；月年季度走 Date API
   */
  add(amount, unit) {
    const n = Number(amount)
    const u = String(unit)
    const base = cloneDate(this.$d)

    if (u === 'M') {
      return new Dayjs(addCalendarMonths(base, n))
    }
    if (u === 'y') {
      return new Dayjs(addCalendarYears(base, n))
    }
    if (u === 'Q') {
      return new Dayjs(addCalendarMonths(base, n * 3))
    }

    const ms = UNIT_TO_MS[u]
    if (ms != null) {
      base.setTime(base.getTime() + n * ms)
      return new Dayjs(base)
    }

    return this.clone()
  }

  subtract(amount, unit) {
    return this.add(-Number(amount), unit)
  }

  /**
   * 对齐到单位起点 —— 「日历运算」典型场景：统计按天/按月聚合
   */
  startOf(unit) {
    const d = cloneDate(this.$d)
    const u = String(unit)

    if (u === 'y') {
      d.setMonth(0, 1)
      d.setHours(0, 0, 0, 0)
      return new Dayjs(d)
    }
    if (u === 'M') {
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      return new Dayjs(d)
    }
    if (u === 'd' || u === 'D') {
      d.setHours(0, 0, 0, 0)
      return new Dayjs(d)
    }
    if (u === 'w') {
      /** 简化：以周日为一周起点（美国习惯）；dayjs 可配 locale 一周从周几开始 */
      const day = d.getDay()
      d.setDate(d.getDate() - day)
      d.setHours(0, 0, 0, 0)
      return new Dayjs(d)
    }
    if (u === 'h') {
      d.setMinutes(0, 0, 0)
      return new Dayjs(d)
    }
    if (u === 'm') {
      d.setSeconds(0, 0)
      return new Dayjs(d)
    }
    if (u === 's') {
      d.setMilliseconds(0)
      return new Dayjs(d)
    }
    if (u === 'ms') {
      return new Dayjs(d)
    }

    return this.clone()
  }

  /**
   * 对齐到单位最后一刻 —— 与 startOf 成对，用于区间 [start, end] 右闭时常用
   */
  endOf(unit) {
    const d = cloneDate(this.$d)
    const u = String(unit)

    if (u === 'y') {
      /** 当年 12 月 31 日最后一刻；勿用「年+1 月0 日0」的 trick，可读性更差且易错 */
      const y = d.getFullYear()
      const end = new Date(y, 11, 31, 23, 59, 59, 999)
      return new Dayjs(end)
    }
    if (u === 'M') {
      d.setMonth(d.getMonth() + 1, 0)
      d.setHours(23, 59, 59, 999)
      return new Dayjs(d)
    }
    if (u === 'd' || u === 'D') {
      d.setHours(23, 59, 59, 999)
      return new Dayjs(d)
    }
    if (u === 'w') {
      const day = d.getDay()
      d.setDate(d.getDate() + (6 - day))
      d.setHours(23, 59, 59, 999)
      return new Dayjs(d)
    }
    if (u === 'h') {
      d.setMinutes(59, 59, 999)
      return new Dayjs(d)
    }
    if (u === 'm') {
      d.setSeconds(59, 999)
      return new Dayjs(d)
    }
    if (u === 's') {
      d.setMilliseconds(999)
      return new Dayjs(d)
    }
    if (u === 'ms') {
      return new Dayjs(d)
    }

    return this.clone()
  }

  isBefore(other) {
    const t = other instanceof Dayjs ? other.valueOf() : new Dayjs(parseToDate(other)).valueOf()
    return this.valueOf() < t
  }

  isAfter(other) {
    const t = other instanceof Dayjs ? other.valueOf() : new Dayjs(parseToDate(other)).valueOf()
    return this.valueOf() > t
  }

  isSame(other, unit = 'ms') {
    const a = this.$d
    const b = parseToDate(other instanceof Dayjs ? other.$d : other)
    const u = String(unit)
    if (u === 'y') return a.getFullYear() === b.getFullYear()
    if (u === 'M') return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
    if (u === 'd' || u === 'D') {
      return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
      )
    }
    return a.getTime() === b.getTime()
  }
}

/**
 * 将各种输入统一成 Date —— 工厂层职责；与「实例方法」分离，逻辑更清晰
 */
export function parseToDate(input) {
  if (input == null) return new Date()
  if (input instanceof Date) return cloneDate(input)
  if (typeof input === 'number') return new Date(input)
  if (typeof input === 'string') {
    const t = Date.parse(input)
    return Number.isNaN(t) ? new Date(NaN) : new Date(t)
  }
  return new Date(NaN)
}

/**
 * 默认导出工厂：dayjs() / dayjs('2020-01-01') / dayjs(timestamp)
 * 与 moment(dayjs) 一样，调用函数而非 new，对使用者更友好
 */
export function dayjs(input) {
  if (input instanceof Dayjs) {
    return input.clone()
  }
  return new Dayjs(parseToDate(input))
}

/**
 * 插件机制：对 Dayjs.prototype 或 dayjs 本身挂载能力
 * 三参数 (option, Dayjs, dayjs) 与 dayjs 官方插件签名接近，便于读者对照文档
 *
 * @param {Function} plugin (option, DayjsConstructor, dayjsFactory) => void
 * @param {*} [option] 传给插件的配置
 */
export function extend(plugin, option) {
  if (typeof plugin !== 'function') return dayjs
  const id = plugin.name || String(loadedPluginIds.size)
  if (loadedPluginIds.has(id)) return dayjs
  loadedPluginIds.add(id)
  plugin(option, Dayjs, dayjs)
  return dayjs
}

export { MS, SECOND, MINUTE, HOUR, DAY, WEEK } from './constants.js'
