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

console.log();
line();
console.log("  演示结束（可与 dayjs 官方 API 对照着讲设计取舍）");
line();
console.log();
