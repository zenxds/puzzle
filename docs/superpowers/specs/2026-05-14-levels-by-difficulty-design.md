# 关卡按难度分批 · 设计文档

日期：2026-05-14
作者：zenxds（与 Claude 协作）

## 目标

把当前 5 关线性结构改为 **按难度分批** 的结构，每批包含若干普通关 + 1 关「爱心萌可」特别关。

## 决策摘要（已敲定）

| 项 | 决定 |
|---|---|
| 难度档 | 3 批：4×4（入门）/ 5×5（进阶）/ 6×6（挑战） |
| 每批关数 | 4 关 = 3 普通 + 1 爱心萌可 |
| 总关卡数 | 12 关 |
| 选关页 UI | 顶部 Tab 切换难度，每次只展示当前批的网格 |
| 关卡命名 | 按批重新编号：「4×4 入门 · 第 2 关」+ 主题名 |
| 旧进度 | 直接清空（storage 版本号 bump） |
| 萌可图格式 | PNG/JPG，裁成正方形，**不**转 SVG |
| 萌可第 1 关图 | 用户提供：`https://bkimg.cdn.bcebos.com/pic/b17eca8065380cd791231df5671dba345982b2b72b2b` |
| 萌可第 2 关图 | 用户提供：`https://c-ssl.dtstatic.com/uploads/blog/202401/17/3BS7jx28UzXZjBe.thumb.1000_0.jpg` |
| 萌可第 3 关图 | 暂用 mengke-1.png 占位，README 标 TODO |

## 关卡定义（`data/levels.js`）

每关字段：`id` / `batch` / `name` / `image` / `cols` / `rows` / `special?`

ID 编号用 `1xx / 2xx / 3xx` 三段，方便每批以后扩展。

```js
window.LEVELS = [
  // ===== 入门 4×4 =====
  { id: 101, batch: 'easy',   name: '彩虹小马',     image: 'assets/images/level-pony.svg',     cols: 4, rows: 4 },
  { id: 102, batch: 'easy',   name: '救援小狗',     image: 'assets/images/level-puppy.svg',    cols: 4, rows: 4 },
  { id: 103, batch: 'easy',   name: '小猫咖啡',     image: 'assets/images/level-kitten.svg',   cols: 4, rows: 4 },
  { id: 104, batch: 'easy',   name: '爱心萌可·初遇', image: 'assets/images/mengke-1.png',       cols: 4, rows: 4, special: true },

  // ===== 进阶 5×5 =====
  { id: 201, batch: 'medium', name: '卡皮巴拉',     image: 'assets/images/level-capybara.svg', cols: 5, rows: 5 },
  { id: 202, batch: 'medium', name: '海底朋友',     image: 'assets/images/level-ocean.svg',    cols: 5, rows: 5 },
  { id: 203, batch: 'medium', name: '森林精灵',     image: 'assets/images/level-forest.svg',   cols: 5, rows: 5 },
  { id: 204, batch: 'medium', name: '爱心萌可·重逢', image: 'assets/images/mengke-2.png',       cols: 5, rows: 5, special: true },

  // ===== 挑战 6×6 =====
  { id: 301, batch: 'hard',   name: '独角兽城堡',   image: 'assets/images/level-unicorn.svg',  cols: 6, rows: 6 },
  { id: 302, batch: 'hard',   name: '动物派对',     image: 'assets/images/level-party.svg',    cols: 6, rows: 6 },
  { id: 303, batch: 'hard',   name: '蛋糕生日会',   image: 'assets/images/level-cake.svg',     cols: 6, rows: 6 },
  { id: 304, batch: 'hard',   name: '爱心萌可·决战', image: 'assets/images/mengke-3.png',       cols: 6, rows: 6, special: true },
];

window.LEVEL_BATCHES = [
  { id: 'easy',   label: '入门',  size: '4 × 4' },
  { id: 'medium', label: '进阶',  size: '5 × 5' },
  { id: 'hard',   label: '挑战',  size: '6 × 6' },
];
```

### 与旧文件的差异

- 旧：`level-1-pony.svg` → 新：`level-pony.svg`（重命名去掉序号，避免编号绑定）
- 现有 SVG viewBox：pony 400×400 ✓、capybara 500×500 ✓、party 600×600 ✓ 已是正方形可直接用；**puppy 500×400 与 unicorn 600×500 不是正方形**，需要把 viewBox 改为正方形（增加高度并把图形垂直居中）以避免在新网格里被压扁
- 新增 4 张 SVG：`level-kitten.svg`（400×400 给 4×4） / `level-ocean.svg`（500×500 给 5×5） / `level-forest.svg`（500×500 给 5×5） / `level-cake.svg`（600×600 给 6×6），沿用现有简笔画粉嫩风格

## 资源文件

```
assets/images/
├── level-pony.svg        (重命名自 level-1-pony.svg)
├── level-puppy.svg       (重命名自 level-2-puppy.svg)
├── level-capybara.svg    (重命名自 level-3-capybara.svg)
├── level-unicorn.svg     (重命名自 level-4-unicorn.svg)
├── level-party.svg       (重命名自 level-5-party.svg)
├── level-kitten.svg      (新增)
├── level-ocean.svg       (新增)
├── level-forest.svg      (新增)
├── level-cake.svg        (新增)
├── mengke-1.png          (下载自第 1 张 URL，裁成正方形)
├── mengke-2.png          (下载自第 2 张 URL，裁成正方形)
└── mengke-3.png          (= mengke-1.png 占位)
```

下载时用 `curl -o`，本地用 `sips`（macOS 内置）做正方形裁剪。

## 选关页 UI（`level-select.js` + `styles.css`）

### 结构

```html
<div id="batch-tabs" class="batch-tabs">
  <button class="batch-tab active" data-batch="easy">入门 · 4×4</button>
  <button class="batch-tab" data-batch="medium">进阶 · 5×5</button>
  <button class="batch-tab" data-batch="hard">挑战 · 6×6</button>
</div>
<div id="level-grid" class="level-grid"><!-- 当前批的 4 张卡片 --></div>
```

### 行为

- 进入选关页时，从 storage 读取 `lastBatch`（默认 `easy`），选中对应 Tab 并渲染该批
- 点击 Tab → 切换 active 状态，重新渲染网格，写回 `lastBatch`
- 每张卡片渲染：缩略图、关卡名（如「4×4 入门 · 第 2 关」）、主题副标题（"救援小狗"）、通关角标（普通用 ⭐，萌可用 ❤）

### 样式

- Tab 栏：横向 flex，居中，每个 Tab 圆角 `pill`、白底、选中态加粉色边框 + 阴影
- 移动端窄屏：Tab 字号缩小 + 横向滚动
- 网格：保留 `auto-fill, minmax(180px, 1fr)`，但只渲染当前批的 4 张

## 存档 / 进度（`storage.js`）

### 旧格式（v1，无版本号）

```js
{ completed: [1, 2, 3] }
```

### 新格式（v2）

```js
{ version: 2, completed: [101, 102, ...], lastBatch: 'easy' }
```

### 迁移策略

读取时：
- 没有 `version` 字段，或 `version < 2` → 重置为 `{ version: 2, completed: [], lastBatch: 'easy' }` 并写回
- 完全不清除 `localStorage`，只重写本 app 的 key

新增 API：
- `Storage.getLastBatch()`
- `Storage.setLastBatch(batchId)`

## 完成弹层逻辑（`main.js`）

旧逻辑 `LEVELS.find(l => l.id === currentLevel.id + 1)` 依赖 ID 连号，新结构不成立。改为：

```js
const idx = LEVELS.findIndex(l => l.id === currentLevel.id);
const next = LEVELS[idx + 1] || null;
```

跨批次自然过渡（萌可关打完后切到下一批第 1 关）。最后一关（`mengke-3`）隐藏「下一关」按钮，保留现有逻辑。

返回选关页时，自动切到当前关的 batch（让用户看到刚通关的星标）。

## 不做的事（YAGNI）

- 不做关卡解锁顺序（项目已经允许任意选关）
- 不做星级 1/2/3 颗
- 不动 `puzzle.js` 游戏内部
- 不做 SVG 自动 trace
- 不为爱心萌可定制不同的胜利动效（保留通用 celebration）

## 实施步骤概览（实际计划由 writing-plans 产出）

1. 下载并裁剪两张萌可图到 `assets/images/`
2. 重命名旧 SVG，绘制 4 张新 SVG
3. 重写 `data/levels.js`，加 `LEVEL_BATCHES`
4. 升级 `storage.js` 到 v2，新增 lastBatch API
5. 改写 `level-select.js` 支持 Tab + 单批渲染
6. CSS 加 `.batch-tabs` 样式
7. `main.js` 完成弹层「下一关」改为按数组顺序
8. 在浏览器里把 12 关都跑通验证
