// 入口：连接关卡选择、游戏、完成弹层
(function () {
  const selectScreen = document.getElementById('level-select');
  const gameScreen = document.getElementById('game');
  const celebrateEl = document.getElementById('celebrate');
  const boardEl = document.getElementById('board');
  const trayEl = document.getElementById('tray');
  const peekImageEl = document.getElementById('peek-image');
  const levelTitleEl = document.getElementById('level-title');
  const backBtn = document.getElementById('back-btn');
  const peekBtn = document.getElementById('peek-btn');
  const muteBtn = document.getElementById('mute-btn');
  const againBtn = document.getElementById('again-btn');
  const nextBtn = document.getElementById('next-btn');
  const resetBtn = document.getElementById('reset-progress');

  let currentLevel = null;

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

  function showGame() {
    selectScreen.classList.remove('active');
    gameScreen.classList.add('active');
  }

  function startLevel(level) {
    currentLevel = level;
    const batch = window.LEVEL_BATCHES.find(b => b.id === level.batch);
    const indexInBatch = window.LEVELS.filter(l => l.batch === level.batch).findIndex(l => l.id === level.id) + 1;
    levelTitleEl.textContent = batch
      ? `${batch.size} ${batch.label} · 第 ${indexInBatch} 关 · ${level.name}`
      : level.name;
    showGame();
    // 等切换屏幕后 DOM 尺寸稳定再初始化
    requestAnimationFrame(() => {
      const game = new Puzzle.PuzzleGame(level, {
        boardEl,
        trayEl,
        peekImageEl,
        onComplete,
      });
      Puzzle.setCurrent(game);
      game.start();
      SoundFX.resume();
      SoundFX.startBgm();
    });
  }

  function onComplete() {
    SoundFX.playWin();
    Storage.markCompleted(currentLevel.id);
    celebrateEl.classList.remove('hidden');
    Celebration.start();
    // 隐藏"下一关"按钮如果已经是最后一关
    const idx = window.LEVELS.findIndex(l => l.id === currentLevel.id);
    const isLast = idx === window.LEVELS.length - 1;
    nextBtn.style.display = isLast ? 'none' : '';
  }

  function closeCelebrate() {
    celebrateEl.classList.add('hidden');
    Celebration.stop();
  }

  // ===== 事件 =====
  backBtn.addEventListener('click', () => {
    closeCelebrate();
    showSelect();
  });

  // 按住"看原图"显示遮罩
  const showPeek = () => peekImageEl.classList.add('show');
  const hidePeek = () => peekImageEl.classList.remove('show');
  peekBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); showPeek(); });
  peekBtn.addEventListener('pointerup', hidePeek);
  peekBtn.addEventListener('pointerleave', hidePeek);
  peekBtn.addEventListener('pointercancel', hidePeek);

  // 静音
  muteBtn.addEventListener('click', () => {
    const muted = !SoundFX.isMuted();
    SoundFX.setMuted(muted);
    muteBtn.textContent = muted ? '🔇' : '🔊';
    if (!muted) SoundFX.startBgm();
  });

  againBtn.addEventListener('click', () => {
    closeCelebrate();
    startLevel(currentLevel);
  });

  nextBtn.addEventListener('click', () => {
    closeCelebrate();
    const idx = window.LEVELS.findIndex(l => l.id === currentLevel.id);
    const next = idx >= 0 ? window.LEVELS[idx + 1] : null;
    if (next) startLevel(next); else showSelect();
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('确定要清空所有通关进度吗？')) {
      Storage.reset();
      LevelSelect.render(startLevel);
    }
  });

  // 首次进入
  showSelect();
})();
