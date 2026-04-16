/**
 * 原生 Date 的坑点演示（Node/浏览器都可跑）
 *
 * 运行（项目根目录）：
 *   node demo/date-js-demo.js
 */

const line = () => console.log('─'.repeat(68));

function title(t) {
    console.log();
    line();
    console.log(`  ${t}`);
    line();
}

// 讲解提示：ISO 8601 是国际通用的日期时间书写规范；下面三个字符串「长得像」但解析规则不同。
title('1) 字符串解析在不同环境可能不一致（浏览器差异 + 时区差异）');
{
    // s1：仅「年月日」、连字符 —— ECMAScript 把 YYYY-MM-DD 按「该日 UTC 午夜」解析。
    //     所以 toISOString() 常是 …T00:00:00.000Z（与机器在东几区无关，先定死在 UTC 那天 0 点）。
    const s1 = '2024-03-01';

    // s2：斜杠分隔 —— 不是标准 ISO 8601 写法，走 Date.parse 的实现/遗留规则，可能因浏览器而异；
    //     在常见引擎里往往按「本地时区某天 0 点」，故转成 UTC 后和 s1 可能差 8 小时（东八区为例）。
    const s2 = '2024/03/01';

    // s3：带 T 和时刻，但没有 Z 或 ±HH:mm —— 规范按「本地时区」解释这一刻（本地 0 点再换算成 UTC）。
    //     东八区本地 2024-03-01 00:00 对应 UTC 往往是前一天 16:00，故和「纯日期 s1」的 UTC 午夜不一致。
    const s3 = '2024-03-01T00:00:00';

    const d1 = new Date(s1);
    const d2 = new Date(s2);
    const d3 = new Date(s3);

    console.log('输入字符串：', s1, '|', s2, '|', s3);
    console.log('new Date("2024-03-01").toISOString() =>', d1.toISOString());
    console.log('new Date("2024/03/01").toISOString() =>', d2.toISOString());
    console.log('new Date("2024-03-01T00:00:00").toISOString() =>', d3.toISOString());
    // getTimezoneOffset：本地相对 UTC 的差（分钟）；中国常为 -480（东八区）。讲「为什么本地午夜换 UTC 会偏一天」时可指着这行说。
    console.log('本机时区偏移（分钟）=>', new Date().getTimezoneOffset());
    console.log(
        '说明：仅日期 vs 带时刻无时区 vs 非标准分隔符，解析路径不同；生产里应写全 ISO+时区（如 …Z 或 …+08:00）或统一用时间戳。'
    );
}

// 本节演示：setMonth 改月份时的日历进位（不是「时间差」计算）
title('2) setMonth 的“溢出”行为不直观（1/31 改到 2 月，可能跳到 3 月）');
{
    const d = new Date('2024-01-31T00:00:00');
    console.log('初始 =>', d.toString());

    // 你以为设置到 2 月（month=1）会得到“2/29”；
    // 实际 Date 会按“溢出进位”规则处理，常见结果是 3 月初。
    d.setMonth(1);
    console.log('setMonth(1) 后 =>', d.toString());
    console.log('说明：Date 内部会尝试保留“日=31”，但 2 月没有 31 日，超出的天数会进位到 3 月。');
}

// 讲解提示：同一时刻，不同方法「给人看的字符串」格式不一致；跨端比对或写日志时不要靠 toString。
title('3) toString 输出格式不可控（对前端展示/日志不友好）');
{
    const d = new Date('2024-06-15T14:30:00');
    console.log('toString()       =>', d.toString());
    console.log('toUTCString()    =>', d.toUTCString());
    console.log('toLocaleString() =>', d.toLocaleString());
    console.log('toISOString()    =>', d.toISOString());
    console.log(
        '说明：toString/toLocaleString 受运行环境、语言、时区影响，跨端展示和比对很难完全一致。'
    );
}

// 讲解提示：构造函数 new Date(y, m, d) 里 m 是 0～11，和日常「1～12 月」不一致，容易 off-by-one。
title('4) 月份从 0 开始，易写错（0=1月，11=12月）');
{
    const d = new Date(2024, 0, 1); // 注意 month=0 才是 1 月
    console.log('new Date(2024, 0, 1) =>', d.toDateString());
    console.log('说明：这类 API 细节增加了心智负担，业务代码容易出现隐式 bug。');
}

console.log();
line();
console.log('  结论：原生 Date 能用，但在“可读性、一致性、可维护性”上对前端不够友好。');
console.log('  这也是 dayjs/moment 这类库长期存在的原因之一。');
line();
console.log();
