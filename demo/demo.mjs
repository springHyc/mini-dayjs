/**
 * 终端演示脚本 —— 适合：分享时开终端跑一遍、或录屏
 *
 * 运行（在项目根目录）：
 *   npm run demo
 *   或：node demo/demo.mjs
 */

import dayjs, { extend } from "../index.js";
import relativeTime from "../plugins/relativeTime.js";

const line = () => console.log("─".repeat(56));

function title(t) {
  console.log();
  line();
  console.log(`  ${t}`);
}

title("1. 解析 + 格式化（模板替换 token）");
const d = dayjs("2024-06-15T14:30:00");
console.log('dayjs("2024-06-15T14:30:00").format(...)');
console.log("  =>", d.format("YYYY年MM月DD日 HH:mm"));

title("2. 不可变：add 返回新实例，原实例不变");
const a = dayjs("2024-01-10");
const b = a.add(1, "M");
console.log("a =", a.format("YYYY-MM-DD"));
console.log('b = a.add(1, "M") =>', b.format("YYYY-MM-DD"));

title(
  "3. 月/年：日历语义（与 dayjs 一致）—— 月末 +1 月落在目标月最后一天（如 1/31 +1M → 2/29）",
);
console.log('dayjs("2024-01-31").add(1, "M").format("YYYY-MM-DD")');
console.log("  =>", dayjs("2024-01-31").add(1, "M").format("YYYY-MM-DD"));

title("4. startOf / endOf —— 聚合统计常用");
console.log(
  'startOf("M"):',
  dayjs().startOf("M").format("YYYY-MM-DD HH:mm:ss"),
);
console.log(
  'endOf("y"):',
  dayjs("2024-06-15").endOf("y").format("YYYY-MM-DD HH:mm:ss"),
);

title("5. 插件：extend 之后再调用 fromNow");
extend(relativeTime);
const almost2minAgo = dayjs(Date.now() - 119000);
console.log("almost2minAgo.fromNow() =>", almost2minAgo.fromNow());

title("6. 比较");
const cmpA = dayjs("2024-01-01");
const cmpB = dayjs("2024-01-01T23:59:59");
const sameDay = cmpA.isSame(cmpB, "d");
console.log(
  'cmpA = dayjs("2024-01-01")        =>',
  cmpA.format("YYYY-MM-DD HH:mm:ss"),
);
console.log(
  'cmpB = dayjs("2024-01-01T23:59:59") =>',
  cmpB.format("YYYY-MM-DD HH:mm:ss"),
);
console.log('cmpA.isSame(cmpB, "d")（按「天」比较是否同一天）=>', sameDay);

title('7.1 subtract(1, "M")：月末减一月 → 对齐到上月最后一天');
console.log(
  'dayjs("2024-03-31").subtract(1, "M").format("YYYY-MM-DD")',
  "=>",
  dayjs("2024-03-31").subtract(1, "M").format("YYYY-MM-DD"),
);

title('7.2 add(1, "y")：闰年 2/29 加一年 → 非闰年 2/28');
console.log(
  'dayjs("2024-02-29").add(1, "y").format("YYYY-MM-DD")',
  "=>",
  dayjs("2024-02-29").add(1, "y").format("YYYY-MM-DD"),
);

title('7.3 add(1, "Q")：加一季度（日历三个月）');
console.log(
  'dayjs("2024-01-15").add(1, "Q").format("YYYY-MM-DD")',
  "=>",
  dayjs("2024-01-15").add(1, "Q").format("YYYY-MM-DD"),
);

title("7.4 isBefore：是否早于另一时刻");
console.log(
  'dayjs("2024-01-01").isBefore("2024-06-01")',
  "=>",
  dayjs("2024-01-01").isBefore("2024-06-01"),
);

title("7.5 isAfter：是否晚于另一时刻");
console.log(
  'dayjs("2024-06-01").isAfter("2024-01-01")',
  "=>",
  dayjs("2024-06-01").isAfter("2024-01-01"),
);

title('7.6 isSame(..., "M")：是否同一自然月');
console.log(
  'dayjs("2024-03-10").isSame(dayjs("2024-03-20"), "M")',
  "=>",
  dayjs("2024-03-10").isSame(dayjs("2024-03-20"), "M"),
);

title('7.7 startOf("d") / endOf("d")：当天起点与结尾（含时分秒）');
const dRange = dayjs("2024-06-15 12:00:00");
console.log(
  'dayjs("2024-06-15 12:00:00").startOf("d").format("HH:mm:ss")',
  "=>",
  dRange.startOf("d").format("HH:mm:ss"),
);
console.log(
  'dayjs("2024-06-15 12:00:00").endOf("d").format("HH:mm:ss")',
  "=>",
  dRange.endOf("d").format("HH:mm:ss"),
);

title("7.8 fromNow()：约 30 秒前（与 zh-cn 一致为「几秒前」，非「30 秒前」）");
const sec30Ago = dayjs(Date.now() - 30000);
console.log("dayjs(Date.now() - 30000).fromNow()", "=>", sec30Ago.fromNow());

title("7.9 fromNow()：约 55 秒前（relativeTime 阈值下常显示为「1 分钟」）");
const almost1minAgo = dayjs(Date.now() - 55000);
console.log(
  "dayjs(Date.now() - 55000).fromNow()",
  "=>",
  almost1minAgo.fromNow(),
);

title("7.10 unix()：秒级 Unix 时间戳");
console.log('dayjs("2024-01-01").unix()', "=>", dayjs("2024-01-01").unix());

console.log();
line();
console.log("  演示结束（可与 dayjs 官方 API 对照着讲设计取舍）");
line();
console.log();
