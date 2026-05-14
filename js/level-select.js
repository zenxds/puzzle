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
