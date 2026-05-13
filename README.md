# 开心拼图 🧩

适合 5 岁小朋友的浏览器拼图游戏。纯静态站点，零依赖、零构建步骤。

## ✨ 特性

- 5 个可自由选择的递进难度关卡（4×4 → 6×6）
- 卡通风格 SVG 原图（彩虹小马 / 救援小狗 / 卡皮巴拉 / 独角兽 / 动物派对）
- 任意摆放 + 两块拼图可交换
- 按住"看原图"按钮辅助
- 完成后撒花 + 鼓励动画
- Web Audio 合成的"叮"声、"啵"声和轻柔背景音乐
- 通关记录本地保存（localStorage）
- 鼠标和触屏都支持，平板友好

## 🚀 本地运行

```bash
yarn
yarn dev
```

会在 `http://localhost:5173/` 自动打开浏览器。

> 也可以不用 yarn，直接双击 `index.html` 在浏览器打开即可（个别浏览器对 file:// 协议下的 SVG 资源有限制，推荐用 `yarn dev`）。

## 📦 部署

### GitHub Pages（自动）

仓库根目录已包含 `.github/workflows/deploy.yml`，push 到 `main` 分支后自动部署：

1. 进入仓库 **Settings → Pages**
2. **Source** 选 **GitHub Actions**
3. 等下一次 push 完成后访问 `https://<your-user>.github.io/<repo>/`

### Cloudflare Pages（手动连接）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → 新建 → Pages
2. 连接你的 GitHub 仓库
3. 构建设置：
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: `/`
4. 部署完成后访问 `https://<project>.pages.dev/`

## 📁 项目结构

```
puzzle/
├── index.html              入口 HTML
├── styles.css              样式
├── js/
│   ├── main.js             入口、屏幕切换
│   ├── level-select.js     关卡选择
│   ├── puzzle.js           拼图核心（切块、拖拽、交换、判定）
│   ├── audio.js            Web Audio 音效合成
│   ├── celebration.js      撒花动画
│   └── storage.js          localStorage
├── data/
│   └── levels.js           关卡配置
├── assets/images/          5 张 SVG 原图
├── docs/                   设计文档
└── .github/workflows/      自动部署
```

## 🎮 玩法

1. 任意选择一关 → 进入游戏
2. 把碎片区里的拼图块拖到拼图板上
3. 任意摆放：拖到空格子直接放进去；拖到已有拼图的格子会**交换**
4. 拖出板外会自动回到碎片区原位
5. 所有拼图都在正确位置时通关 🎉
6. 所有关卡都可直接点开，通关后会记录星标

顶部按钮：
- **←** 返回关卡选择
- **👁** 按住显示原图作参考
- **🔊/🔇** 切换音乐

## 📜 License

MIT
