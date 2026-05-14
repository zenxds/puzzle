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
