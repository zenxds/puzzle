# 关卡按难度分批 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 5 关线性结构改为 3 批难度分组（4×4 / 5×5 / 6×6），每批 4 关 = 3 普通 + 1 爱心萌可。

**Architecture:** 保留原 vanilla JS（无构建）结构。`data/levels.js` 重写为 12 关并新增 `LEVEL_BATCHES`；`storage.js` 升 v2 自动清空旧进度；`level-select.js` 加顶部 Tab 切换并按 batch 过滤；`main.js` 完成弹层「下一关」改用数组顺序。新增 4 张 SVG + 2 张 PNG 萌可图。

**Tech Stack:** HTML5 / Vanilla JS / CSS / SVG，macOS `curl` + `sips` 处理素材，浏览器手动验证（无单测）。

**No-tests rationale:** 此项目无测试框架（package.json 仅是元数据，无 npm test 脚本）。每个 task 末尾用浏览器手动验证作为「测试」。完成弹层与状态切换都是肉眼可见行为，单测 ROI 低。

---

### Task 1: 准备 mengke 图片素材

**Files:**
- Create: `assets/images/mengke-1.png`
- Create: `assets/images/mengke-2.png`
- Create: `assets/images/mengke-3.png`

- [ ] **Step 1: 下载第一张萌可图**

```bash
cd /Users/xiaodongshuang/my-repository/puzzle
curl -L -o /tmp/mengke-1-raw \
  "https://bkimg.cdn.bcebos.com/pic/b17eca8065380cd791231df5671dba345982b2b72b2b"
file /tmp/mengke-1-raw
```

期望：`file` 输出 `JPEG image data` 或 `PNG image data`。记下尺寸：

```bash
sips -g pixelWidth -g pixelHeight /tmp/mengke-1-raw
```

- [ ] **Step 2: 裁成正方形并保存为 PNG**

取宽高较小值 `S`，中心裁剪为 S×S，保存为 PNG：

```bash
SIZE=$(sips -g pixelWidth -g pixelHeight /tmp/mengke-1-raw | awk '/pixelWidth|pixelHeight/{print $2}' | sort -n | head -1)
sips -c $SIZE $SIZE /tmp/mengke-1-raw --out /tmp/mengke-1-square
sips -s format png /tmp/mengke-1-square --out assets/images/mengke-1.png
file assets/images/mengke-1.png
```

期望：`assets/images/mengke-1.png: PNG image data, NNN x NNN`，宽高相等。

- [ ] **Step 3: 下载第二张萌可图并裁正方形**

```bash
curl -L -o /tmp/mengke-2-raw \
  "https://c-ssl.dtstatic.com/uploads/blog/202401/17/3BS7jx28UzXZjBe.thumb.1000_0.jpg"
file /tmp/mengke-2-raw
SIZE=$(sips -g pixelWidth -g pixelHeight /tmp/mengke-2-raw | awk '/pixelWidth|pixelHeight/{print $2}' | sort -n | head -1)
sips -c $SIZE $SIZE /tmp/mengke-2-raw --out /tmp/mengke-2-square
sips -s format png /tmp/mengke-2-square --out assets/images/mengke-2.png
file assets/images/mengke-2.png
```

- [ ] **Step 4: mengke-3 用 mengke-1 占位**

```bash
cp assets/images/mengke-1.png assets/images/mengke-3.png
```

- [ ] **Step 5: 验证**

```bash
ls -la assets/images/mengke-*.png
```

期望：三个文件存在，均为 PNG，宽高相等。

- [ ] **Step 6: Commit**

```bash
git add assets/images/mengke-1.png assets/images/mengke-2.png assets/images/mengke-3.png
git commit -m "Add 爱心萌可 puzzle images for difficulty batches"
```

---

### Task 2: 重命名已有 SVG 并修正非方形 viewBox

**Files:**
- Rename: `level-1-pony.svg` → `level-pony.svg`
- Rename: `level-2-puppy.svg` → `level-puppy.svg`（同时改 viewBox）
- Rename: `level-3-capybara.svg` → `level-capybara.svg`
- Rename: `level-4-unicorn.svg` → `level-unicorn.svg`（同时改 viewBox）
- Rename: `level-5-party.svg` → `level-party.svg`

- [ ] **Step 1: 用 git mv 重命名 5 个文件**

```bash
cd /Users/xiaodongshuang/my-repository/puzzle
git mv assets/images/level-1-pony.svg assets/images/level-pony.svg
git mv assets/images/level-2-puppy.svg assets/images/level-puppy.svg
git mv assets/images/level-3-capybara.svg assets/images/level-capybara.svg
git mv assets/images/level-4-unicorn.svg assets/images/level-unicorn.svg
git mv assets/images/level-5-party.svg assets/images/level-party.svg
git status
```

期望：`renamed: ...` 共 5 条。

- [ ] **Step 2: 把 puppy 的 viewBox 改为 500×500**

打开 `assets/images/level-puppy.svg`。需要做三处修改让原画面在新方形视口里垂直居中且背景填满：

1. 第 1 行：把 `viewBox="0 0 500 400"` 改为 `viewBox="0 0 500 500"`
2. 背景 rect（约第 9 行 `<rect width="500" height="400" fill="url(#sky2)"/>`）：把 `height="400"` 改为 `height="500"`，让背景填满新方形视口
3. 在背景 rect 之后、其它内容（云、狗等）之前插入一行 `<g transform="translate(0, 50)">`，并在 `</svg>` 之前插入对应的 `</g>` 闭合，把所有非背景内容整体下移 50px 实现垂直居中

最终结构应类似：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
  <defs>...</defs>
  <rect width="500" height="500" fill="url(#sky2)"/>   <!-- 已扩展 -->
  <g transform="translate(0, 50)">                      <!-- 新增包裹 -->
    <!-- 云、狗、草地等所有原内容 -->
  </g>                                                  <!-- 新增闭合 -->
</svg>
```

验证：

```bash
head -10 assets/images/level-puppy.svg
tail -3 assets/images/level-puppy.svg
```

期望：viewBox 为 500×500、bg rect height 为 500、有 `<g transform="translate(0, 50)">` 包裹其余内容。

- [ ] **Step 3: 把 unicorn 的 viewBox 改为 600×600**

同 Step 2 三处改：

1. 第 1 行 `viewBox="0 0 600 500"` → `viewBox="0 0 600 600"`
2. 第 1 个 `<rect width="600" height="500" fill="url(#sky4)"/>` → `<rect width="600" height="600" fill="url(#sky4)"/>`
3. 在背景 rect 之后插入 `<g transform="translate(0, 50)">`，在 `</svg>` 前插入 `</g>`

```bash
head -10 assets/images/level-unicorn.svg
tail -3 assets/images/level-unicorn.svg
```

- [ ] **Step 4: 浏览器验证 4 张 SVG 显示正常（不变形）**

```bash
open -a "Google Chrome" assets/images/level-puppy.svg
open -a "Google Chrome" assets/images/level-unicorn.svg
```

期望：图片在浏览器中显示为正方形，内容居中，无横向/纵向拉伸变形。

- [ ] **Step 5: Commit**

```bash
git add assets/images/
git commit -m "Rename level SVGs and normalize non-square viewBoxes

Drop the numeric prefix from level SVGs so they can be reordered into
batches. Pad puppy (500x400) and unicorn (600x500) viewBoxes to square
to fit the new uniform 4x4/5x5/6x6 grid layout without distortion."
```

---

### Task 3: 新增 4 张 SVG 关卡插图

**Files:**
- Create: `assets/images/level-kitten.svg` (400×400, 给 4×4)
- Create: `assets/images/level-ocean.svg` (500×500, 给 5×5)
- Create: `assets/images/level-forest.svg` (500×500, 给 5×5)
- Create: `assets/images/level-cake.svg` (600×600, 给 6×6)

**风格说明（参照 `level-pony.svg`）：**
- 顶部用 `<linearGradient>` 画浅色背景（粉/蓝/绿/黄等柔色）
- 主角用 ellipse / path 简笔画，色块平涂
- 加点缀：云朵 / 星星 / 爱心 / 小花
- 不使用阴影或复杂滤镜，保持扁平 cute 风
- 主角中心放在 viewBox 中心偏下，避免被切

下面给出完整 SVG 代码，可直接照搬。

- [ ] **Step 1: 创建 `level-kitten.svg`**

完整内容写入 `assets/images/level-kitten.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bgK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff3e0"/>
      <stop offset="1" stop-color="#ffd9ec"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgK)"/>
  <!-- 桌面 -->
  <rect x="0" y="320" width="400" height="80" fill="#e6c7a3"/>
  <rect x="0" y="312" width="400" height="10" fill="#c69f73"/>
  <!-- 咖啡杯 -->
  <ellipse cx="120" cy="305" rx="38" ry="10" fill="#7a4368"/>
  <path d="M 82 305 L 88 350 Q 90 358 100 360 L 140 360 Q 150 358 152 350 L 158 305 Z" fill="#f8e7d2"/>
  <path d="M 158 320 Q 180 320 180 340 Q 180 358 158 358" fill="none" stroke="#f8e7d2" stroke-width="6"/>
  <!-- 咖啡液面 -->
  <ellipse cx="120" cy="305" rx="34" ry="8" fill="#6b3a23"/>
  <!-- 蒸汽 -->
  <g stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.85">
    <path d="M 110 270 Q 105 250 115 230 Q 125 215 115 195"/>
    <path d="M 130 275 Q 138 255 128 235"/>
  </g>
  <!-- 小猫身体 -->
  <ellipse cx="260" cy="285" rx="60" ry="40" fill="#f4cba0"/>
  <!-- 小猫头 -->
  <circle cx="260" cy="230" r="48" fill="#f4cba0"/>
  <!-- 耳朵 -->
  <path d="M 222 198 L 215 165 L 245 188 Z" fill="#f4cba0"/>
  <path d="M 298 198 L 305 165 L 275 188 Z" fill="#f4cba0"/>
  <path d="M 226 192 L 222 175 L 240 188 Z" fill="#ff9bbf"/>
  <path d="M 294 192 L 298 175 L 280 188 Z" fill="#ff9bbf"/>
  <!-- 条纹 -->
  <g fill="#d39060" opacity="0.7">
    <ellipse cx="240" cy="195" rx="10" ry="3"/>
    <ellipse cx="280" cy="195" rx="10" ry="3"/>
    <ellipse cx="260" cy="190" rx="6" ry="3"/>
  </g>
  <!-- 眼睛 -->
  <ellipse cx="244" cy="232" rx="8" ry="10" fill="#3d3556"/>
  <ellipse cx="276" cy="232" rx="8" ry="10" fill="#3d3556"/>
  <circle cx="247" cy="229" r="2.5" fill="#fff"/>
  <circle cx="279" cy="229" r="2.5" fill="#fff"/>
  <!-- 鼻嘴 -->
  <path d="M 258 250 L 260 256 L 262 250 Z" fill="#7a4368"/>
  <path d="M 254 258 Q 260 264 266 258" fill="none" stroke="#7a4368" stroke-width="2.5" stroke-linecap="round"/>
  <!-- 腮红 -->
  <ellipse cx="232" cy="252" rx="8" ry="4" fill="#ff8fb6" opacity="0.7"/>
  <ellipse cx="288" cy="252" rx="8" ry="4" fill="#ff8fb6" opacity="0.7"/>
  <!-- 爪子 -->
  <ellipse cx="222" cy="310" rx="12" ry="10" fill="#f4cba0"/>
  <ellipse cx="298" cy="310" rx="12" ry="10" fill="#f4cba0"/>
  <!-- 心 -->
  <path d="M 80 100 q -8 -10 -16 -2 q -6 6 0 12 l 16 14 l 16 -14 q 6 -6 0 -12 q -8 -8 -16 2 z" fill="#ff5e8e"/>
  <!-- 星星 -->
  <polygon points="340,90 343,98 351,98 345,103 347,111 340,106 333,111 335,103 329,98 337,98" fill="#ffd24d"/>
</svg>
```

- [ ] **Step 2: 创建 `level-ocean.svg`**

完整内容写入 `assets/images/level-ocean.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
  <defs>
    <linearGradient id="bgO" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bff0ff"/>
      <stop offset="1" stop-color="#5db6e5"/>
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(#bgO)"/>
  <!-- 海面波纹 -->
  <g fill="none" stroke="#ffffff" stroke-width="3" opacity="0.6" stroke-linecap="round">
    <path d="M 30 120 Q 60 110 90 120"/>
    <path d="M 380 90 Q 410 80 440 90"/>
    <path d="M 60 380 Q 100 370 140 380"/>
  </g>
  <!-- 海底沙地 -->
  <path d="M 0 420 Q 120 400 250 420 T 500 415 L 500 500 L 0 500 Z" fill="#f6e6b4"/>
  <!-- 海草 -->
  <path d="M 90 420 Q 80 380 95 350 Q 105 380 90 420 Z" fill="#6ec88a"/>
  <path d="M 420 420 Q 408 370 425 330 Q 438 370 420 420 Z" fill="#6ec88a"/>
  <!-- 小鱼身体 -->
  <ellipse cx="240" cy="260" rx="105" ry="70" fill="#ffb24d"/>
  <!-- 尾巴 -->
  <path d="M 130 260 L 70 200 L 80 260 L 70 320 Z" fill="#ff9020"/>
  <!-- 鳍 -->
  <path d="M 240 195 L 220 150 L 260 180 Z" fill="#ff9020"/>
  <path d="M 240 325 L 230 360 L 270 335 Z" fill="#ff9020"/>
  <!-- 鳞片 -->
  <g fill="#ffd991" opacity="0.85">
    <path d="M 200 240 Q 215 225 230 240 Q 215 255 200 240"/>
    <path d="M 240 240 Q 255 225 270 240 Q 255 255 240 240"/>
    <path d="M 280 240 Q 295 225 310 240 Q 295 255 280 240"/>
    <path d="M 220 270 Q 235 255 250 270 Q 235 285 220 270"/>
    <path d="M 260 270 Q 275 255 290 270 Q 275 285 260 270"/>
  </g>
  <!-- 眼睛 -->
  <circle cx="310" cy="240" r="16" fill="#fff"/>
  <circle cx="313" cy="243" r="9" fill="#3d3556"/>
  <circle cx="316" cy="240" r="3" fill="#fff"/>
  <!-- 嘴 -->
  <path d="M 340 270 Q 350 280 340 290" fill="none" stroke="#a04077" stroke-width="3" stroke-linecap="round"/>
  <!-- 气泡 -->
  <g fill="#ffffff" opacity="0.85">
    <circle cx="360" cy="170" r="10"/>
    <circle cx="380" cy="140" r="6"/>
    <circle cx="395" cy="120" r="4"/>
  </g>
  <!-- 星星海星 -->
  <g fill="#ff7da6" transform="translate(420 410) rotate(15)">
    <path d="M 0 -25 L 8 -8 L 25 -5 L 12 8 L 16 25 L 0 16 L -16 25 L -12 8 L -25 -5 L -8 -8 Z"/>
  </g>
</svg>
```

- [ ] **Step 3: 创建 `level-forest.svg`**

完整内容写入 `assets/images/level-forest.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
  <defs>
    <linearGradient id="bgF" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e7f5d8"/>
      <stop offset="1" stop-color="#c1e5a8"/>
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(#bgF)"/>
  <!-- 远山 -->
  <path d="M 0 280 Q 100 200 200 260 Q 320 200 500 270 L 500 500 L 0 500 Z" fill="#b6dca0" opacity="0.6"/>
  <!-- 草地 -->
  <path d="M 0 380 Q 150 360 280 380 T 500 375 L 500 500 L 0 500 Z" fill="#8fc97a"/>
  <!-- 大树1 -->
  <rect x="80" y="280" width="22" height="100" fill="#8b5a3a"/>
  <circle cx="91" cy="260" r="55" fill="#6ec88a"/>
  <circle cx="60" cy="240" r="35" fill="#7fd49c"/>
  <circle cx="125" cy="240" r="35" fill="#7fd49c"/>
  <!-- 大树2 -->
  <rect x="395" y="290" width="22" height="100" fill="#8b5a3a"/>
  <circle cx="406" cy="270" r="50" fill="#6ec88a"/>
  <circle cx="380" cy="255" r="30" fill="#7fd49c"/>
  <circle cx="435" cy="255" r="30" fill="#7fd49c"/>
  <!-- 精灵身体（兔子样小妖精） -->
  <ellipse cx="250" cy="370" rx="60" ry="45" fill="#fff5e0"/>
  <!-- 头 -->
  <circle cx="250" cy="290" r="55" fill="#fff5e0"/>
  <!-- 长耳朵 -->
  <ellipse cx="225" cy="210" rx="14" ry="38" fill="#fff5e0"/>
  <ellipse cx="275" cy="210" rx="14" ry="38" fill="#fff5e0"/>
  <ellipse cx="225" cy="215" rx="6" ry="26" fill="#ffd9ec"/>
  <ellipse cx="275" cy="215" rx="6" ry="26" fill="#ffd9ec"/>
  <!-- 翅膀 -->
  <path d="M 190 320 Q 140 290 130 350 Q 170 360 195 340 Z" fill="#fff" opacity="0.85" stroke="#a0c8e8" stroke-width="2"/>
  <path d="M 310 320 Q 360 290 370 350 Q 330 360 305 340 Z" fill="#fff" opacity="0.85" stroke="#a0c8e8" stroke-width="2"/>
  <!-- 眼睛 -->
  <ellipse cx="232" cy="290" rx="6" ry="9" fill="#3d3556"/>
  <ellipse cx="268" cy="290" rx="6" ry="9" fill="#3d3556"/>
  <circle cx="234" cy="287" r="2" fill="#fff"/>
  <circle cx="270" cy="287" r="2" fill="#fff"/>
  <!-- 腮红 -->
  <ellipse cx="218" cy="305" rx="8" ry="4" fill="#ff8fb6" opacity="0.7"/>
  <ellipse cx="282" cy="305" rx="8" ry="4" fill="#ff8fb6" opacity="0.7"/>
  <!-- 嘴 -->
  <path d="M 244 312 Q 250 318 256 312" fill="none" stroke="#7a4368" stroke-width="2.5" stroke-linecap="round"/>
  <!-- 魔法棒小星 -->
  <g fill="#ffd24d">
    <polygon points="360,150 364,162 376,162 366,170 370,182 360,174 350,182 354,170 344,162 356,162"/>
    <polygon points="80,170 83,178 91,178 85,183 87,191 80,186 73,191 75,183 69,178 77,178"/>
  </g>
  <!-- 小花 -->
  <g>
    <circle cx="140" cy="420" r="6" fill="#ff8fb6"/>
    <circle cx="380" cy="420" r="6" fill="#ffd24d"/>
    <circle cx="320" cy="430" r="5" fill="#b07eff"/>
  </g>
</svg>
```

- [ ] **Step 4: 创建 `level-cake.svg`**

完整内容写入 `assets/images/level-cake.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bgC" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff0d0"/>
      <stop offset="1" stop-color="#ffd9ec"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bgC)"/>
  <!-- 桌布 -->
  <rect x="0" y="450" width="600" height="150" fill="#ff9bbf"/>
  <g fill="#ffffff" opacity="0.6">
    <rect x="40" y="470" width="20" height="20"/>
    <rect x="180" y="500" width="20" height="20"/>
    <rect x="340" y="470" width="20" height="20"/>
    <rect x="500" y="500" width="20" height="20"/>
    <rect x="120" y="540" width="20" height="20"/>
    <rect x="430" y="540" width="20" height="20"/>
  </g>
  <!-- 蛋糕盘 -->
  <ellipse cx="300" cy="460" rx="220" ry="22" fill="#f4e6ff"/>
  <!-- 底层 -->
  <rect x="120" y="350" width="360" height="110" rx="10" fill="#fff5dc"/>
  <rect x="120" y="350" width="360" height="20" fill="#ffd0e8"/>
  <g fill="#ff7da6">
    <circle cx="170" cy="385" r="7"/>
    <circle cx="240" cy="385" r="7"/>
    <circle cx="310" cy="385" r="7"/>
    <circle cx="380" cy="385" r="7"/>
    <circle cx="450" cy="385" r="7"/>
  </g>
  <!-- 中层 -->
  <rect x="180" y="260" width="240" height="100" rx="8" fill="#ffd0e8"/>
  <rect x="180" y="260" width="240" height="18" fill="#fff5dc"/>
  <path d="M 180 278 Q 220 270 260 278 T 340 278 T 420 278" fill="none" stroke="#fff" stroke-width="4"/>
  <g fill="#ff5e8e">
    <circle cx="220" cy="295" r="6"/>
    <circle cx="300" cy="295" r="6"/>
    <circle cx="380" cy="295" r="6"/>
  </g>
  <!-- 顶层 -->
  <rect x="240" y="180" width="120" height="90" rx="8" fill="#fff5dc"/>
  <rect x="240" y="180" width="120" height="14" fill="#ff9bbf"/>
  <!-- 草莓 -->
  <g>
    <path d="M 290 170 Q 280 155 300 145 Q 320 155 310 170 Q 305 180 300 180 Q 295 180 290 170 Z" fill="#ff5e8e"/>
    <path d="M 294 145 L 296 138 L 300 142 L 304 138 L 306 145 Z" fill="#6ec88a"/>
    <circle cx="296" cy="158" r="1.4" fill="#fff"/>
    <circle cx="304" cy="162" r="1.4" fill="#fff"/>
    <circle cx="298" cy="170" r="1.4" fill="#fff"/>
  </g>
  <!-- 蜡烛 -->
  <rect x="296" y="100" width="8" height="50" fill="#b07eff"/>
  <path d="M 300 70 Q 290 85 300 100 Q 310 85 300 70 Z" fill="#ffd24d"/>
  <path d="M 300 78 Q 295 88 300 100 Q 305 88 300 78 Z" fill="#ff7d00"/>
  <!-- 闪光 -->
  <g fill="#ffd24d">
    <polygon points="100,120 104,132 116,132 106,140 110,152 100,144 90,152 94,140 84,132 96,132"/>
    <polygon points="500,90 503,98 511,98 505,103 507,111 500,106 493,111 495,103 489,98 497,98"/>
    <polygon points="80,260 83,268 91,268 85,273 87,281 80,276 73,281 75,273 69,268 77,268"/>
  </g>
  <!-- 气球 -->
  <g>
    <ellipse cx="450" cy="120" rx="32" ry="40" fill="#ff7da6"/>
    <path d="M 450 160 L 448 168 L 452 168 Z" fill="#ff7da6"/>
    <path d="M 450 168 Q 460 200 445 230" stroke="#a0a0a0" stroke-width="2" fill="none"/>
    <ellipse cx="510" cy="160" rx="26" ry="34" fill="#b07eff"/>
    <path d="M 510 194 L 508 202 L 512 202 Z" fill="#b07eff"/>
    <path d="M 510 202 Q 502 230 515 250" stroke="#a0a0a0" stroke-width="2" fill="none"/>
  </g>
  <!-- 小心 -->
  <path d="M 140 80 q -10 -12 -18 -4 q -8 8 0 16 l 18 16 l 18 -16 q 8 -8 0 -16 q -8 -8 -18 4 z" fill="#ff5e8e"/>
</svg>
```

- [ ] **Step 5: 浏览器验证 4 张新 SVG**

```bash
open -a "Google Chrome" assets/images/level-kitten.svg
open -a "Google Chrome" assets/images/level-ocean.svg
open -a "Google Chrome" assets/images/level-forest.svg
open -a "Google Chrome" assets/images/level-cake.svg
```

期望：四张图均能正常渲染，主角居中，整体风格与现有粉嫩简笔画一致。

- [ ] **Step 6: Commit**

```bash
git add assets/images/level-kitten.svg assets/images/level-ocean.svg assets/images/level-forest.svg assets/images/level-cake.svg
git commit -m "Add four new puzzle SVGs: kitten cafe, ocean, forest, cake party"
```

---

### Task 4: Storage v2 升级

**Files:**
- Modify: `js/storage.js`（整文件重写）

- [ ] **Step 1: 重写 `js/storage.js` 全文**

把 `js/storage.js` 替换为以下内容：

```js
// localStorage 读写关卡进度
(function () {
  const KEY = 'puzzle.progress.v1';
  const SCHEMA_VERSION = 2;

  function defaultProgress() {
    return { version: SCHEMA_VERSION, completed: [], lastBatch: 'easy' };
  }

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return defaultProgress();
      // 旧版本（无 version 或 < 2）：清空 completed
      if (typeof parsed.version !== 'number' || parsed.version < SCHEMA_VERSION) {
        const fresh = defaultProgress();
        write(fresh);
        return fresh;
      }
      return {
        version: SCHEMA_VERSION,
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        lastBatch: typeof parsed.lastBatch === 'string' ? parsed.lastBatch : 'easy',
      };
    } catch (e) {
      return defaultProgress();
    }
  }

  function write(progress) {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch (e) {
      // 隐私模式可能写不了，忽略
    }
  }

  function markCompleted(levelId) {
    const p = read();
    if (!p.completed.includes(levelId)) p.completed.push(levelId);
    write(p);
    return p;
  }

  function setLastBatch(batchId) {
    const p = read();
    p.lastBatch = batchId;
    write(p);
    return p;
  }

  function getLastBatch() {
    return read().lastBatch;
  }

  function reset() {
    write(defaultProgress());
  }

  window.Storage = { read, markCompleted, reset, setLastBatch, getLastBatch };
})();
```

- [ ] **Step 2: 浏览器验证迁移**

打开 Chrome DevTools Console（先 `open -a "Google Chrome" index.html` 启动），手动检查：

```js
// 先模拟旧存档
localStorage.setItem('puzzle.progress.v1', JSON.stringify({ completed: [1, 2, 3] }));
location.reload();
// 重载后查看
JSON.parse(localStorage.getItem('puzzle.progress.v1'));
```

期望：返回 `{ version: 2, completed: [], lastBatch: 'easy' }`，旧的 `completed: [1,2,3]` 已被清空。

注意：此时主页可能因 `data/levels.js` 还没更新而报错或显示旧关卡，没关系，只验证 storage 即可。

- [ ] **Step 3: Commit**

```bash
git add js/storage.js
git commit -m "Bump storage to v2 with lastBatch and auto-migration

Old progress (no version field) is wiped on next load. Adds
setLastBatch/getLastBatch APIs so the tab UI can remember which
difficulty batch the user last viewed."
```

---

### Task 5: 重写 `data/levels.js`

**Files:**
- Modify: `data/levels.js`（整文件重写）

- [ ] **Step 1: 替换 `data/levels.js` 全部内容**

```js
// 关卡配置：按难度分 3 批，每批 3 普通 + 1 爱心萌可
window.LEVELS = [
  // ===== 入门 4×4 =====
  { id: 101, batch: 'easy',   name: '彩虹小马',      image: 'assets/images/level-pony.svg',     cols: 4, rows: 4 },
  { id: 102, batch: 'easy',   name: '救援小狗',      image: 'assets/images/level-puppy.svg',    cols: 4, rows: 4 },
  { id: 103, batch: 'easy',   name: '小猫咖啡',      image: 'assets/images/level-kitten.svg',   cols: 4, rows: 4 },
  { id: 104, batch: 'easy',   name: '爱心萌可·初遇', image: 'assets/images/mengke-1.png',       cols: 4, rows: 4, special: true },

  // ===== 进阶 5×5 =====
  { id: 201, batch: 'medium', name: '卡皮巴拉',      image: 'assets/images/level-capybara.svg', cols: 5, rows: 5 },
  { id: 202, batch: 'medium', name: '海底朋友',      image: 'assets/images/level-ocean.svg',    cols: 5, rows: 5 },
  { id: 203, batch: 'medium', name: '森林精灵',      image: 'assets/images/level-forest.svg',   cols: 5, rows: 5 },
  { id: 204, batch: 'medium', name: '爱心萌可·重逢', image: 'assets/images/mengke-2.png',       cols: 5, rows: 5, special: true },

  // ===== 挑战 6×6 =====
  { id: 301, batch: 'hard',   name: '独角兽城堡',    image: 'assets/images/level-unicorn.svg',  cols: 6, rows: 6 },
  { id: 302, batch: 'hard',   name: '动物派对',      image: 'assets/images/level-party.svg',    cols: 6, rows: 6 },
  { id: 303, batch: 'hard',   name: '蛋糕生日会',    image: 'assets/images/level-cake.svg',     cols: 6, rows: 6 },
  { id: 304, batch: 'hard',   name: '爱心萌可·决战', image: 'assets/images/mengke-3.png',       cols: 6, rows: 6, special: true },
];

window.LEVEL_BATCHES = [
  { id: 'easy',   label: '入门',  size: '4 × 4' },
  { id: 'medium', label: '进阶',  size: '5 × 5' },
  { id: 'hard',   label: '挑战',  size: '6 × 6' },
];
```

- [ ] **Step 2: 浏览器验证关卡数据加载**

```bash
open -a "Google Chrome" index.html
```

在 DevTools Console 里：

```js
window.LEVELS.length          // 期望 12
window.LEVELS.filter(l => l.batch === 'easy').length    // 期望 4
window.LEVELS.filter(l => l.special).length              // 期望 3
window.LEVEL_BATCHES.length    // 期望 3
```

页面可能会有渲染问题（因为 `level-select.js` 还按旧结构假设），下一个任务里修。

- [ ] **Step 3: Commit**

```bash
git add data/levels.js
git commit -m "Restructure levels into 3 difficulty batches with 爱心萌可 specials

12 levels total: 3 normal + 1 爱心萌可 per batch (4x4, 5x5, 6x6). IDs
use 1xx/2xx/3xx prefixes so each batch can grow independently."
```

---

### Task 6: 重写 `js/level-select.js` 支持 Tab + 单批渲染

**Files:**
- Modify: `js/level-select.js`（整文件重写）
- Modify: `index.html`（在 `#level-grid` 上方插入 `#batch-tabs` 容器）

- [ ] **Step 1: 修改 `index.html`，在 `#level-grid` 前加 tabs 容器**

打开 `index.html`，在第 16 行 `<div id="level-grid" class="level-grid"></div>` **之前**插入一行：

```html
    <div id="batch-tabs" class="batch-tabs"></div>
```

完整片段应变为：

```html
    <div id="batch-tabs" class="batch-tabs"></div>
    <div id="level-grid" class="level-grid"></div>
```

- [ ] **Step 2: 重写 `js/level-select.js` 全文**

替换为以下内容：

```js
// 关卡选择界面：顶部 Tab 切换难度，下方只渲染当前批的关卡
(function () {
  let pickHandler = null;
  let currentBatch = 'easy';

  function render(onPick) {
    pickHandler = onPick;
    currentBatch = Storage.getLastBatch() || 'easy';
    renderTabs();
    renderGrid();
  }

  function renderTabs() {
    const tabs = document.getElementById('batch-tabs');
    tabs.innerHTML = '';
    const progress = Storage.read();

    window.LEVEL_BATCHES.forEach(batch => {
      const levelsInBatch = window.LEVELS.filter(l => l.batch === batch.id);
      const doneCount = levelsInBatch.filter(l => progress.completed.includes(l.id)).length;

      const btn = document.createElement('button');
      btn.className = 'batch-tab' + (batch.id === currentBatch ? ' active' : '');
      btn.dataset.batch = batch.id;

      const label = document.createElement('div');
      label.className = 'batch-tab-label';
      label.textContent = batch.label;
      btn.appendChild(label);

      const size = document.createElement('div');
      size.className = 'batch-tab-size';
      size.textContent = batch.size;
      btn.appendChild(size);

      const progressEl = document.createElement('div');
      progressEl.className = 'batch-tab-progress';
      progressEl.textContent = `${doneCount} / ${levelsInBatch.length}`;
      btn.appendChild(progressEl);

      btn.addEventListener('click', () => {
        if (currentBatch === batch.id) return;
        currentBatch = batch.id;
        Storage.setLastBatch(batch.id);
        renderTabs();
        renderGrid();
      });

      tabs.appendChild(btn);
    });
  }

  function renderGrid() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    const progress = Storage.read();
    const levelsInBatch = window.LEVELS.filter(l => l.batch === currentBatch);
    const batchInfo = window.LEVEL_BATCHES.find(b => b.id === currentBatch);

    levelsInBatch.forEach((level, indexInBatch) => {
      const completed = progress.completed.includes(level.id);

      const card = document.createElement('div');
      card.className = 'level-card'
        + (completed ? ' completed' : '')
        + (level.special ? ' special' : '');

      const thumb = document.createElement('div');
      thumb.className = 'level-thumb';
      thumb.style.backgroundImage = `url("${level.image}")`;
      card.appendChild(thumb);

      const name = document.createElement('div');
      name.className = 'level-name';
      name.textContent = `${batchInfo.size} ${batchInfo.label} · 第 ${indexInBatch + 1} 关`;
      card.appendChild(name);

      const sub = document.createElement('div');
      sub.className = 'level-subname';
      sub.textContent = level.name;
      card.appendChild(sub);

      if (completed) {
        const star = document.createElement('div');
        star.className = 'level-stars';
        star.textContent = level.special ? '❤' : '⭐';
        card.appendChild(star);
      }

      card.addEventListener('click', () => pickHandler && pickHandler(level));
      grid.appendChild(card);
    });
  }

  function setBatch(batchId) {
    currentBatch = batchId;
    Storage.setLastBatch(batchId);
  }

  window.LevelSelect = { render, setBatch };
})();
```

- [ ] **Step 3: 浏览器手动测试**

```bash
open -a "Google Chrome" index.html
```

验证：
1. 页面顶部出现 3 个 Tab：「入门 4×4」「进阶 5×5」「挑战 6×6」（样式可能还很丑，后续 task 6.2 补 CSS）
2. 默认选中第一个 Tab，下方显示 4 张卡片（第 1-4 关）
3. 点击「进阶」Tab，下方切换为 5×5 那 4 张卡片
4. 点击任意一张卡片，能进游戏（虽然「下一关」还没改对，先不管）
5. 通关一关后回选关页，对应卡片右上角显示 ⭐；通关萌可关后显示 ❤
6. 刷新页面，记住的批次（last viewed）保留

如果 Tab 切换有视觉问题，记下来到 Task 7 用 CSS 修，但功能上要先跑通。

- [ ] **Step 4: Commit**

```bash
git add index.html js/level-select.js
git commit -m "Add difficulty tabs to level select; render single batch at a time

Tabs show batch label, grid size, and completion progress (e.g., 2/4).
Selected tab persists via Storage.lastBatch. Cards show ⭐ for normal
completions and ❤ for 爱心萌可 completions."
```

---

### Task 7: CSS 样式 —— Tab 和特别关角标

**Files:**
- Modify: `styles.css`（在合适位置插入 batch-tabs / level-card.special / level-subname 样式，并适配响应式）

- [ ] **Step 1: 在 `styles.css` 中 `.text-btn` 块**（约第 125-136 行）**之前**插入以下样式：

```css
/* ===== 难度 Tab ===== */
.batch-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 880px;
  padding: 0 8px 18px;
  flex-wrap: wrap;
}
.batch-tab {
  background: white;
  border: 3px solid transparent;
  border-radius: 18px;
  padding: 10px 18px;
  cursor: pointer;
  box-shadow: var(--shadow);
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: transform 0.1s, box-shadow 0.1s, border-color 0.1s;
  font-family: inherit;
  color: var(--text-soft);
}
.batch-tab:hover {
  transform: translateY(2px);
  box-shadow: var(--shadow-hover);
}
.batch-tab.active {
  border-color: #ff8fb6;
  color: var(--text);
}
.batch-tab-label {
  font-size: 18px;
  font-weight: 800;
}
.batch-tab-size {
  font-size: 12px;
  letter-spacing: 1px;
}
.batch-tab-progress {
  font-size: 12px;
  color: #b04a85;
  font-weight: 700;
}

/* ===== 萌可特别关 ===== */
.level-card.special {
  background: linear-gradient(155deg, #fff3f8, #ffe0ec);
  border-color: #ff8fb6;
}
.level-card.special .level-name {
  color: #b04a85;
}
.level-subname {
  font-size: 13px;
  color: var(--text-soft);
  margin-top: 2px;
  font-weight: 600;
}
```

注意：`.level-name` 字号已经在原 CSS 里，新增的 `.level-subname` 只用于副标题。

- [ ] **Step 2: 修改原有 `.level-meta` 块（移除或保留）**

由于新结构用 `.level-subname` 而不是 `.level-meta`，可以保留 `.level-meta` 样式（不会再被引用，无害）。不需要改。

- [ ] **Step 3: 响应式 —— 在 `@media (max-width: 480px)` 块里追加**

找到第 384-390 行附近的 `@media (max-width: 480px) { ... }`，在闭合 `}` 前插入：

```css
  .batch-tab { min-width: 90px; padding: 8px 12px; }
  .batch-tab-label { font-size: 16px; }
```

最终 `@media (max-width: 480px)` 块大致如下：

```css
@media (max-width: 480px) {
  .header h1 { font-size: 32px; letter-spacing: 4px; }
  .level-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .icon-btn { width: 42px; height: 42px; font-size: 18px; }
  .level-title { font-size: 18px; }
  .celebrate-card { padding: 28px 24px; }
  .celebrate-text { font-size: 28px; }
  .batch-tab { min-width: 90px; padding: 8px 12px; }
  .batch-tab-label { font-size: 16px; }
}
```

- [ ] **Step 4: 浏览器验证**

```bash
open -a "Google Chrome" index.html
```

验证：
1. Tab 居中，三个 pill 形按钮，间距整齐
2. 当前 active 的 Tab 有粉色边框
3. 鼠标 hover 时 Tab 有按下感
4. 卡片名两行：上行 `4×4 入门 · 第 N 关`，下行小字主题名（"小猫咖啡"）
5. 爱心萌可的卡片背景是淡粉渐变，与普通卡片有视觉区分
6. 切到窄屏（DevTools Toolbar 切 iPhone SE 375px），Tab 不挤、不溢出

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "Style difficulty tabs and 爱心萌可 special cards

Pill-shaped tabs with active pink border, completion ratio shown.
Special cards get a soft pink gradient background to mark them as the
batch's hero level."
```

---

### Task 8: 修复 `main.js` 的「下一关」逻辑

**Files:**
- Modify: `js/main.js`（第 93-97 行的 next 按钮逻辑；第 19-25 行 showSelect 切换 batch）

- [ ] **Step 1: 修改 `nextBtn` 的点击处理（约第 93-97 行）**

把：

```js
  nextBtn.addEventListener('click', () => {
    closeCelebrate();
    const next = window.LEVELS.find(l => l.id === currentLevel.id + 1);
    if (next) startLevel(next); else showSelect();
  });
```

替换为：

```js
  nextBtn.addEventListener('click', () => {
    closeCelebrate();
    const idx = window.LEVELS.findIndex(l => l.id === currentLevel.id);
    const next = idx >= 0 ? window.LEVELS[idx + 1] : null;
    if (next) startLevel(next); else showSelect();
  });
```

- [ ] **Step 2: 让返回选关页时自动切到当前关的 batch**

在 `showSelect()` 函数（约第 19-25 行）开头之前判断当前关属于哪个 batch。修改如下：

把：

```js
  function showSelect() {
    selectScreen.classList.add('active');
    gameScreen.classList.remove('active');
    Puzzle.setCurrent(null);
    SoundFX.stopBgm();
    LevelSelect.render(startLevel);
  }
```

替换为：

```js
  function showSelect() {
    selectScreen.classList.add('active');
    gameScreen.classList.remove('active');
    Puzzle.setCurrent(null);
    SoundFX.stopBgm();
    if (currentLevel && currentLevel.batch) {
      LevelSelect.setBatch(currentLevel.batch);
    }
    LevelSelect.render(startLevel);
  }
```

- [ ] **Step 3: 浏览器手动验证**

```bash
open -a "Google Chrome" index.html
```

完整跑一遍：

1. 进入「入门」第 1 关（彩虹小马，4×4），通关 → 弹层 → 点「下一关」 → 应进入第 2 关（救援小狗）
2. 通关到入门最后一关（爱心萌可·初遇，第 4 关），点「下一关」 → 应进入「进阶」第 1 关（卡皮巴拉，5×5）
3. 在 6×6 挑战的最后一关（爱心萌可·决战，第 12 关），完成弹层里「下一关」按钮应**隐藏**
4. 任意关游戏中点左上角 ← 返回，回到选关页时应自动切到当前关所在 batch
5. 通关任意关后，返回选关页对应卡片右上角应显示星标

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "Use array order for next-level navigation across batches

ID-arithmetic (currentLevel.id + 1) broke when IDs went from 1-5 to
batched 1xx/2xx/3xx. Switching to array.indexOf+1 keeps the next-level
button working across batch boundaries. Returning to level select now
auto-switches to the active level's batch."
```

---

### Task 9: 全流程验收

**Files:**
- 无新文件，纯验证

- [ ] **Step 1: 启动并完整跑通 12 关**

```bash
open -a "Google Chrome" /Users/xiaodongshuang/my-repository/puzzle/index.html
```

打开 DevTools Console，先清空进度模拟新用户：

```js
localStorage.clear();
location.reload();
```

依次：
1. 入门第 1-4 关全部通关，验证每关图都能加载、拼图能完成、弹层能弹、「下一关」按钮能跳
2. 进阶第 5-8 关同样跑一遍
3. 挑战第 9-12 关同样跑一遍
4. 最后一关（萌可·决战）通关时「下一关」按钮应不显示，只显示「再玩一次」

每关验收点：
- [ ] 关卡名标题正确（`5×5 进阶 · 第 2 关` 这种格式）
- [ ] 关卡图能完整加载（含 mengke PNG 与新增 SVG）
- [ ] 拼图碎片不变形（特别是 puppy / unicorn 改过 viewBox 的）
- [ ] 完成弹层正常
- [ ] 「下一关」跳关正确

- [ ] **Step 2: 验证 Tab 行为**

- [ ] 三个 Tab 上的 `N / 4` 完成数随通关变化
- [ ] 切 Tab 时网格瞬时切换（无白屏）
- [ ] 刷新页面后停留在上次的 Tab
- [ ] 点「重置进度」后所有 ⭐ ❤ 清除，Tab 上完成数归 0

- [ ] **Step 3: 验证旧存档迁移**

```js
localStorage.setItem('puzzle.progress.v1', JSON.stringify({ completed: [1, 2, 3] }));
location.reload();
JSON.parse(localStorage.getItem('puzzle.progress.v1'));
```

期望：`{ version: 2, completed: [], lastBatch: 'easy' }`，所有关卡都没有 ⭐ 标记。

- [ ] **Step 4: 验证响应式**

- [ ] DevTools Toolbar 切 iPhone SE（375×667）：Tab 不挤、不溢出，卡片 2 列
- [ ] iPad 横屏：Tab 一行排开，卡片 3-4 列
- [ ] 桌面 1440 宽：Tab 居中，卡片不超出 880px 宽

- [ ] **Step 5: 浏览器 Console 无错误**

通关一关后 DevTools Console 应无红色报错。

- [ ] **Step 6: 总结 commit（可选）**

如果前面所有 task 都 commit 了，本任务无需 commit。如果发现小问题就地修，并：

```bash
git add -p
git commit -m "Polish: <具体修了啥>"
```

---

## 自检清单

- ✅ Spec 中 12 关定义全部覆盖（Task 5）
- ✅ Spec 中 3 个 batch 元数据覆盖（Task 5）
- ✅ Spec 中 mengke 图下载与裁剪覆盖（Task 1）
- ✅ Spec 中旧 SVG 重命名与 viewBox 修正覆盖（Task 2）
- ✅ Spec 中 4 张新 SVG 创建覆盖（Task 3）
- ✅ Spec 中 storage v2 + lastBatch API 覆盖（Task 4）
- ✅ Spec 中 Tab UI + 单批渲染覆盖（Task 6）
- ✅ Spec 中 CSS 样式覆盖（Task 7）
- ✅ Spec 中 next-level 逻辑 + 自动切 batch 覆盖（Task 8）
- ✅ Spec 中"不做"事项（解锁顺序 / 星级 / SVG 自动 trace）—— 计划里无相关任务，符合 YAGNI
