# dayjs 原理与 mini-dayjs 对照

> **配套阅读**：纯概念版见 [`dayjs原理概述.md`](./dayjs原理概述.md)；**moment 与 dayjs 对比**见 [`moment与dayjs原理对比.md`](./moment与dayjs原理对比.md)。

> 教学笔记：官方 dayjs 概念 ↔ 本仓库对应代码位置。  
> 总览：**dayjs = `Date`（`$d`）+ 工厂解析 + 不可变式返回新实例 + 单位分岔（毫秒 vs 月年）+ 薄 `format` + `extend` 插件链**。  
> mini-dayjs 在同样骨架上裁掉 locale、时区、自定义解析和大量 token，用来把原理露出来。

---

## 1. 内部状态：`$d` 包一层 `Date`

**dayjs**：实例内部用 **`$d`** 存原生 `Date`（读时间、调试时一眼能认出）。

**本仓库**：`src/dayjs.js` —— `Dayjs` 构造函数里 `this.$d = d`。

**对应关系**：和官方一样——不另造「年月日结构体」，先信任 `Date`。

---

## 2. 解析：工厂 `dayjs(input)` 与 `parseToDate`

**dayjs**：入口 **`dayjs(any)`** 把多种输入统一成内部时间；解析规则比迷你版多（另有 `customParseFormat` 等插件）。

**本仓库**：

- `parseToDate`：`src/dayjs.js`
- `dayjs(input)`：同上，处理 `Dayjs` 实例时 `clone()`。

| 官方概念            | 本仓库                               |
| ------------------- | ------------------------------------ |
| 统一解析入口        | `parseToDate` + `dayjs()`            |
| 传入已是 dayjs 实例 | `input instanceof Dayjs` → `clone()` |
| 非法日期            | `new Date(NaN)` + `isValid()`        |

**差异**：官方还有 **自定义格式解析**（插件）；本仓库只演示 **`Date.parse` 能解析的字符串**。

---

## 3. 不可变：`add` / `subtract` 返回新实例

**dayjs**：`add`、`startOf` 等返回 **新实例**，避免长期共用可变 `Date` 引用。

**本仓库**：

- `add` / `subtract`：`src/dayjs.js`（`cloneDate(this.$d)` 再改，再 `new Dayjs(...)`）
- `cloneDate`：`src/utils.js`

**对应关系**：官方也是先拷贝再改，语义一致。

---

## 4. 加减单位：「固定时长」vs「日历单位」

**dayjs**：`d/h/m/s/ms` 等与 **毫秒换算**；`M`、`y`、`Q` 等走 **日历语义**（`setMonth` / `setFullYear` 等）。

**本仓库**：

- 毫秒表：`src/constants.js` —— `UNIT_TO_MS`
- 分支逻辑：`src/dayjs.js` —— `add` 里 `M` / `y` / `Q` 与 `UNIT_TO_MS` 两套

**对应关系**：同一套分层——表驱动毫秒 + **M/y/Q 单独分支**。

---

## 5. `startOf` / `endOf`

**dayjs**：按单位把时间对齐到该单位起点/终点；**周起始**依赖 **locale**（周几算一周头）。

**本仓库**：`src/dayjs.js` —— `startOf` / `endOf`；`w` 分支注释写明 **以周日为一周起点**（简化）。

**对应关系**：概念一致；本仓库 **写死周起点**，官方由 **locale** 可配。

---

## 6. `format`

**dayjs**：核心有基础 `format`；更多 token 多在 **`advancedFormat`** 等插件。

**本仓库**：

- `Dayjs.prototype.format`：`src/dayjs.js`
- 模板替换：`src/utils.js` —— `formatWithTemplate`（`pad` + `replace`）

**对应关系**：从 `$d` 取字段再按模板替换；本仓库 **只实现少量 token**。

---

## 7. 比较：`valueOf` / `isBefore` / `isSame(unit)`

**dayjs**：`isBefore`、`isAfter`、`isSame(unit, ...)` 等，本质是 **时间戳** 或 **按 unit 取字段** 比较。

**本仓库**：`src/dayjs.js` —— `isBefore`、`isAfter`、`isSame`。

**对应关系**：官方 `isSame` 支持的 **unit 更多**；本仓库足够说明「按单位比较 = 比较哪些字段」。

---

## 8. 插件：`extend(plugin, option)`

**dayjs**：`dayjs.extend(plugin)`，插件签名 **`(option, Dayjs, dayjs)`**，往原型或工厂挂能力；官方用内部标记防重复安装。

**本仓库**：`src/dayjs.js` —— `extend`（`loadedPluginIds` 去重）。

**对应关系**：三参数、链式返回 `dayjs` 与官方用法一致；去重实现与官方细节不同、思路同类。

---

## 9. `relativeTime` 插件

**dayjs**：**`relativeTime` 插件** + **`locale`** 才能做好各语言的「几分钟前」。

**本仓库**：`plugins/relativeTime.js` —— `fromNow` / `from` / `toNow`，文案固定为中文简化版。

**对应关系**：挂载在 `Dayjs.prototype` 的方式与官方一致；分享时可强调：**差值在插件，词表在 locale**。

---

## 10. 包入口

**dayjs**：`import dayjs from 'dayjs'` 默认导出工厂，并导出 **`extend`** 等。

**本仓库**：`index.js` —— 默认导出 `dayjs`，具名导出 `extend`、`Dayjs`、`parseToDate`、常量等。

**对应关系**：默认导出 = 工厂；额外暴露 **`Dayjs` / `parseToDate`** 便于教学。

---

## 11. 本仓库独有或需注意的点

- **`monthHuman()`**：官方 **`month()`** 为 **0–11**，无此方法；属演示用辅助，讲稿中可说明避免与官方 API 混淆。
- **周起点**：本仓库已注释——官方由 **locale** 决定一周从周几开始。

---

## 12. 一句话总对照（适合收尾）

**官方 dayjs** 在 **`Date`（`$d`）** 上做 **工厂解析**、**不可变式新实例**、**毫秒 vs 月年分岔**、**薄 format** 与 **`extend` 插件**；**mini-dayjs** 保留同一骨架，故意裁减能力，用于理解设计而非替代生产依赖。

---

## 演示入口（仓库内）

- 终端：`npm run demo` → `demo/demo.mjs`
- 浏览器：根目录 `npm run demo:web` 后打开 `demo/index.html`
