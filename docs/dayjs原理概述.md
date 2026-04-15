# dayjs 原理概述

> 通用说明：不绑定本仓库具体行号，便于单独阅读。  
> **代码对照**：与 mini-dayjs 各文件对应关系见 [`dayjs原理与mini-dayjs对照.md`](./dayjs原理与mini-dayjs对照.md)。  
> **插件查阅**：§10–§12（官网「仅核心」说明、核心为何小、官方插件分类与 **`src/plugin` 全量列表**）。  
> **moment 对比**：独立文档 [`moment与dayjs原理对比.md`](./moment与dayjs原理对比.md)。

---

## 1. 它本质上是什么？

**dayjs 不是重新实现一套日历**，而是一个 **对原生 `Date` 的薄封装**：

- 内部通常用 **`$d` 持有一个 `Date` 实例**（或等价的时间表示，视模式/插件而定）。
- 所有「算时间」最终都落到：**`Date` 的 API**（`setMonth`、`setHours`…）或 **时间戳加减**（毫秒）。

因此：**历法、闰年、月末进位** 等仍由 **JS 引擎里的 `Date`** 处理；dayjs 主要负责 **API 形态、边界封装、插件与 locale**。

---

## 2. 工厂函数 `dayjs()`：为什么不是到处 `new Dayjs()`？

对外只暴露 **`dayjs(input)`**：

- 在工厂里 **统一做输入归一化**：`undefined` → 现在、`string` / `number` / `Date` / 另一个 dayjs 实例等。
- 返回 **包装后的实例**。

好处：

- 用法与 **moment** 接近，迁移成本低。
- **解析逻辑集中**，实例方法只关心「已经是一个时间点」。

---

## 3. 「不可变」是怎么回事？

dayjs 对外语义是：**`add` / `subtract` / `startOf` 等会返回新实例**，一般不原地改内部 `Date`，避免像共享可变 `Date` 那样被悄悄改掉。

实现思路：**拷贝出新的时间或新实例再返回**。这与 React / 函数式里「减少共享可变状态」一致，也是对 moment 时代「隐式修改」常见吐槽的回应。

---

## 4. 单位分两路：固定毫秒 vs 月 / 年 / 季度

- **秒、分、时、天、周**：在「时长」意义上常可看成 **固定毫秒倍数**（本地场景下；跨 DST 时「一天」可能不是 24h，进阶话题另说）。
- **月、年、季度**：**不是**「30 天」这种固定长度，必须用 **`setMonth` / `setFullYear`** 等 **日历语义**。

所以 **`add(1, 'month')`** 和 **`add(24, 'hour')`** 在实现上会走 **不同分支**——前者不能用「乘一个月等于多少毫秒」简单替代。

---

## 5. `format`：模板字符串怎么变成展示文案？

常见实现是：**扫描模板字符串**，把 `YYYY`、`MM` 等 **token** 换成数字（常配合 **补零**）。

- **简单场景**：正则替换或逐段解析即可。
- **复杂场景**：多语言、序数词、时区缩写、ISO 周等 → 拆到 **locale / 插件**（如 `advancedFormat`）。

核心：**格式化是「视图层」**，不必全部塞进最小内核。

---

## 6. `extend` 插件：为什么核心可以很小？

dayjs 的设计是：

- **内核**：构造、读写时间、基础加减、基础 `startOf` / `endOf`、基础 `format`。
- **插件**：相对时间、自定义解析格式、UTC、时区、更多 token 等。

插件一般拿到 **`Dayjs` 构造函数** 和 **`dayjs` 工厂**，然后：

- 往 **`Dayjs.prototype`** 上挂方法（如 `fromNow`），或
- 往 **`dayjs` 上挂静态能力**。

这样 **按需引入** 才有意义：不用相对时间就不打包那部分逻辑。

---

## 7. Locale（国际化）大致怎么接？

**展示**依赖语言：月份名、周几、本地习惯的日期格式等——数据放在 **locale 对象**里。

**相对时间**（「几分钟前」）强依赖 **locale**（词序、复数、单位缩写），所以官方常见组合是 **relativeTime + locale**。

原理上仍是：**核心算时间差（毫秒）**，**文案与格式由 locale / 插件决定**。

---

## 8. moment 与 dayjs 对比（另文）

完整对比（架构、可变性、解析/format、体积、维护、antd 选型等）已单独成篇，避免与本概述重复：

→ **[`moment与dayjs原理对比.md`](./moment与dayjs原理对比.md)**

---

## 9. 一张总表（适合 PPT）

| 层次          | 作用                                           |
| ------------- | ---------------------------------------------- |
| `Date`        | 引擎提供的「时间点 + 日历运算」                |
| dayjs 核心    | 统一入口、不可变包装、单位分支、基础格式化     |
| 插件 / locale | 相对时间、自定义解析、复杂 token、时区相关能力 |

---

## 10. 官网说法：默认只有核心，没有安装任何插件

dayjs 文档里有一句大意如下：**默认情况下，Day.js 只包含核心代码，并没有安装任何插件**（英文原文类似 _By default, Day.js comes with core code only and no installed plugin_）。

这句话可以直接用来回答：**为什么 npm 上的「主包」体积很小**——因为 **相对时间、自定义解析、UTC/时区** 等都不在默认包里，需要时再 `import` 对应插件并 `dayjs.extend(...)`。

---

## 11. 核心为什么能小？（与官网说法配套的三点）

1. **核心职责少**  
   只做：**时间对象的构造与读写**、**基础加减**、**基础 `format` / `startOf` / `endOf`**、**简单比较** 等。不默认承担「业务里常见但非人人需要」的能力。

2. **能力拆成插件**  
   例如：**相对时间文案**、**按格式解析字符串**、**更多 `format` 占位符**、**UTC / IANA 时区**、**Duration** 等，都是 **独立模块**，和核心 **物理上分开**。

3. **工程上按需进包**  
   实际打包时，一般只有你 **显式 `import` 并 `extend` 的插件** 会进入最终 bundle（配合 tree-shaking）。因此：**体积小 ≈ 核心薄 + 插件可选 + 按需引入**。

> 与 mini-dayjs 的对应：你在仓库里把 **`relativeTime` 放在 `plugins/`**、用 **`extend` 注入**，就是在复刻「核心不包含插件」这条设计，便于分享时对照官网那句话。

---

## 12. 官方常见插件一览（按用途，便于日后查阅）

下列均为 dayjs **官方插件**（路径多为 `dayjs/plugin/插件名`）；**具体 API 与依赖以 [day.js 文档](https://day.js.org/docs/en/plugin/plugin) 为准**，版本迭代时个别插件可能有增减或更名。

### 12.1 解析与展示格式

| 插件                   | 典型用途                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **customParseFormat**  | 按自定义格式解析字符串，例如 `dayjs('2020-01-01', 'YYYY-MM-DD')`（需配合此插件的写法以文档为准） |
| **advancedFormat**     | 扩展 `format` 的占位符（如序数 `Do` 等，以文档列表为准）                                         |
| **localizedFormat**    | 与 locale 相关的简写格式（如文档中的 `L` / `LL` 等）                                             |
| **preParsePostFormat** | 与解析/格式化前后处理相关（见官方文档）                                                          |

### 12.2 相对时间与「日历式」文案

| 插件             | 典型用途                                                      |
| ---------------- | ------------------------------------------------------------- |
| **relativeTime** | 「3 分钟前」「2 小时后」等；**通常与 locale 一起用**          |
| **calendar**     | 「昨天上午」「下周二」等日历式相对描述；同样强依赖 **locale** |

### 12.3 UTC 与时区

| 插件         | 典型用途                                                                            |
| ------------ | ----------------------------------------------------------------------------------- |
| **utc**      | `dayjs.utc()`、在 UTC 下读写；很多「跨日界线」场景的基础                            |
| **timezone** | IANA 时区名（如 `Asia/Shanghai`）；**一般需先引入 `utc`**（以官方文档依赖说明为准） |

### 12.4 比较与区间

| 插件                                   | 典型用途                                 |
| -------------------------------------- | ---------------------------------------- |
| **isBetween**                          | 判断是否在两个时刻之间（可带单位）       |
| **isSameOrBefore** / **isSameOrAfter** | 与 `isBefore` / `isAfter` 互补的边界比较 |

### 12.5 年、季、周与一年中的第几天

| 插件                             | 典型用途                                       |
| -------------------------------- | ---------------------------------------------- |
| **quarterOfYear**                | 季度读写                                       |
| **weekOfYear**                   | 一年中的第几周（规则以文档为准）               |
| **isoWeek** / **isoWeeksInYear** | ISO 周相关                                     |
| **weekYear**                     | 与「周所属年」相关的场景（ISO 年，以文档为准） |
| **weekday**                      | 强化「星期几」相关能力（与 locale 可能有关）   |
| **dayOfYear**                    | 一年中的第几天                                 |

### 12.6 时长、比较与其它工具

| 插件                                           | 典型用途                                               |
| ---------------------------------------------- | ------------------------------------------------------ |
| **duration**                                   | 表示一段时间（时长），与「某一时刻」互补               |
| **minMax**                                     | 从多个 dayjs 中取最早/最晚                             |
| **isLeapYear**                                 | 是否闰年                                               |
| **isToday** / **isTomorrow** / **isYesterday** | 与「今天 / 明天 / 昨天」相关的便捷判断                 |
| **isMoment**                                   | 与 moment 对象互操作类能力（以文档为准）               |
| **toArray** / **toObject**                     | 导出为数组或 `{ year, month, ... }` 形式（以文档为准） |
| **pluralGetSet**                               | 与复数形式 get/set 相关（以文档为准）                  |

### 12.7 Locale、历法与输入形态

| 插件              | 典型用途                                       |
| ----------------- | ---------------------------------------------- |
| **localeData**    | 读取当前 locale 的元数据（如一周从周几开始等） |
| **updateLocale**  | 运行时覆盖/扩展某 locale 的配置                |
| **arraySupport**  | 从数组构造时间                                 |
| **objectSupport** | 从 `{ y, M, d, ... }` 对象构造                 |
| **bigIntSupport** | 与大整数时间戳等场景相关（以文档为准）         |
| **buddhistEra**   | 佛历等（以文档为准）                           |
| **negativeYear**  | 负数年份相关（以文档为准）                     |
| **badMutable**    | 可变模式（兼容向；**新代码慎用**，以文档为准） |
| **devHelper**     | 开发辅助（一般仅开发环境，以文档为准）         |

### 12.8 使用时的通用提醒（分享可提）

- **插件不是「自动生效」**：必须 **`import` + `dayjs.extend(插件)`**（或项目里封装的统一入口里集中 extend）。
- **locale 与 relativeTime / calendar** 往往要 **一起讲**：文案语言、复数、词序都在 locale 里。
- **utc 与 timezone**：真实业务里的「上海时间 / 纽约时间」常要这两步；**不要默认以为装了 dayjs 就带时区**。

### 12.9 官方仓库 `src/plugin` 全量目录（核对用）

下列名称来自 **dayjs 源码** [`iamkun/dayjs` 的 `src/plugin`](https://github.com/iamkun/dayjs/tree/dev/src/plugin)（分支以 `dev` 为例；发版后若有增减，以你安装的版本为准）。**表格里是「有哪些插件文件」，不等于「每个项目都要用」**。

`advancedFormat` · `arraySupport` · `badMutable` · `bigIntSupport` · `buddhistEra` · `calendar` · `customParseFormat` · `dayOfYear` · `devHelper` · `duration` · `isBetween` · `isLeapYear` · `isMoment` · `isSameOrAfter` · `isSameOrBefore` · `isToday` · `isTomorrow` · `isYesterday` · `isoWeek` · `isoWeeksInYear` · `localeData` · `localizedFormat` · `minMax` · `negativeYear` · `objectSupport` · `pluralGetSet` · `preParsePostFormat` · `quarterOfYear` · `relativeTime` · `timezone` · `toArray` · `toObject` · `updateLocale` · `utc` · `weekOfYear` · `weekYear` · `weekday`

---

## 13. 一句话

**dayjs 的原理** 是在 **`Date` 之上做一层稳定 API + 按需扩展**，而不是重写一套日历系统。
