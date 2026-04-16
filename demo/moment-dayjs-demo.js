/**
 * 官方 moment 与 dayjs 对照演示（方便你在终端里改代码、看输出差异）
 *
 * 运行（项目根目录）：
 *   npm run demo:moment-dayjs
 *   或：node demo/moment-dayjs-demo.js
 */

import dayjs from 'dayjs';
import moment from 'moment';

const line = () => console.log('─'.repeat(60));
const line2 = () => console.log('- - '.repeat(15));

function title(t) {
    console.log();
    line();
    console.log(`  ${t}`);
    line2();
}

title('1. 不可变性（最常对比的点）');
{
    const m = moment('2024-01-10');
    const m2 = m.add(1, 'day'); // moment：多数操作会改 m 自身，并返回同一引用
    console.log('  moment: m 与 m2 同一引用？', m === m2);
    console.log('  moment: 改完后 m.format =>', m.format('YYYY-MM-DD'));

    console.log();

    const d = dayjs('2024-01-10');
    const d2 = d.add(1, 'day'); // dayjs：返回新实例，d 不变
    console.log('  dayjs:  d 与 d2 同一引用？', d === d2);
    console.log('  dayjs:  原 d.format =>', d.format('YYYY-MM-DD'));
    console.log('  dayjs:  新 d2.format =>', d2.format('YYYY-MM-DD'));
}

title('2. moment 想「不污染原对象」：用 clone()');
{
    const m = moment('2024-01-10');
    const next = m.clone().add(1, 'day');
    console.log('  moment 原对象 =>', m.format('YYYY-MM-DD'));
    console.log('  moment clone 后 add =>', next.format('YYYY-MM-DD'));
}

title('3. 格式化 format（常用 token 大多兼容，细节以各自文档为准）');
{
    const iso = '2024-06-15T14:30:00';
    console.log('  moment =>', moment(iso).format('YYYY年MM月DD日 HH:mm'));
    console.log('  dayjs  =>', dayjs(iso).format('YYYY年MM月DD日 HH:mm'));
}

title('4. 加减月：日历语义（1/31 +1 月 → 2 月末对齐）');
{
    const base = '2024-01-31';
    console.log('  moment =>', moment(base).add(1, 'month').format('YYYY-MM-DD'));
    console.log('  dayjs  =>', dayjs(base).add(1, 'month').format('YYYY-MM-DD'));
}

title('5. 毫秒时间戳 / 秒级 Unix');
{
    const m = moment('2024-01-01T00:00:00+08:00');
    const d = dayjs('2024-01-01T00:00:00+08:00');
    console.log('  moment .valueOf() =>', m.valueOf(), ' .unix() =>', m.unix());
    console.log('  dayjs  .valueOf() =>', d.valueOf(), ' .unix() =>', d.unix());
}

title('6. 合法性校验');
{
    // 用 NaN 避免 moment 对「非 ISO 字符串」的弃用告警刷屏；你也可以改成自己的坏数据做实验
    console.log('  moment(NaN).isValid() =>', moment(Number.NaN).isValid());
    console.log('  dayjs(NaN).isValid()  =>', dayjs(Number.NaN).isValid());
}

title('7. 比较：是否同一天（注意第二个参数粒度）');
{
    const a = '2024-01-01';
    const b = '2024-01-01T23:59:59';
    console.log('  moment.isSame(..., "day") =>', moment(a).isSame(moment(b), 'day'));
    console.log('  dayjs.isSame(..., "day")  =>', dayjs(a).isSame(dayjs(b), 'day'));
}

title('8. 链式调用风格速览');
{
    const m = moment('2024-06-15 12:00:00').startOf('month').add(2, 'weeks').endOf('day');
    const d = dayjs('2024-06-15 12:00:00').startOf('month').add(2, 'week').endOf('day');
    console.log('  moment =>', m.format('YYYY-MM-DD HH:mm:ss'));
    console.log('  dayjs  =>', d.format('YYYY-MM-DD HH:mm:ss'));
}

console.log();
line();
console.log('  结束：上面是「最小对照集」，你可以在本文件里继续加场景做实验。');
line();
console.log();
