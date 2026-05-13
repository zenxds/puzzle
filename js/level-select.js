// 关卡选择界面
(function () {
  function render(onPick) {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    const progress = Storage.read();

    window.LEVELS.forEach(level => {
      const completed = progress.completed.includes(level.id);

      const card = document.createElement('div');
      card.className = 'level-card' + (completed ? ' completed' : '');

      const thumb = document.createElement('div');
      thumb.className = 'level-thumb';
      thumb.style.backgroundImage = `url("${level.image}")`;
      card.appendChild(thumb);

      const name = document.createElement('div');
      name.className = 'level-name';
      name.textContent = `第 ${level.id} 关 · ${level.name}`;
      card.appendChild(name);

      const meta = document.createElement('div');
      meta.className = 'level-meta';
      meta.textContent = `${level.cols} × ${level.rows} = ${level.cols * level.rows} 块`;
      card.appendChild(meta);

      if (completed) {
        const stars = document.createElement('div');
        stars.className = 'level-stars';
        stars.textContent = '⭐';
        card.appendChild(stars);
      }
      card.addEventListener('click', () => onPick(level));

      grid.appendChild(card);
    });
  }

  window.LevelSelect = { render };
})();
