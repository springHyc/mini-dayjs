/**
 * 时间单位与毫秒换算表
 *
 * 设计说明（与 dayjs 思路一致）：
 * - 所有「加减」「对齐到某单位起点」最终都落到对原生 Date 的 setXXX / 时间戳运算
 * - 用毫秒作为内部统一粒度，便于 add/subtract 组合
 *
 * 注意：月、年不是固定毫秒数（28–31 天、闰年），因此 M / y 的运算
 * 不能简单用毫秒乘除，必须走 Date#setMonth / setFullYear（见 dayjs.js）
 */
export const MS = 1;
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
/** 一周按 7 天算（与多数库一致；ISO 周另算，本迷你版不实现） */
export const WEEK = 7 * DAY;

/**
 * 单位名 → 毫秒（仅用于可固定换算的单位）
 * 'M' / 'y' 不在此表做乘除，由专门分支处理
 */
export const UNIT_TO_MS = {
    ms: MS,
    s: SECOND,
    m: MINUTE,
    h: HOUR,
    d: DAY,
    w: WEEK,
};

/** 本库支持的单位字面量（字符串形式，与 dayjs 常用写法对齐） */
export const UNITS = ['ms', 's', 'm', 'h', 'd', 'w', 'M', 'y', 'Q'];
