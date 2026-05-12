// localStorage 读写关卡进度
(function () {
  const KEY = 'puzzle.progress.v1';

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return defaultProgress();
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        highestUnlocked: typeof parsed.highestUnlocked === 'number' ? parsed.highestUnlocked : 1,
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

  function defaultProgress() {
    return { completed: [], highestUnlocked: 1 };
  }

  function markCompleted(levelId, totalLevels) {
    const p = read();
    if (!p.completed.includes(levelId)) p.completed.push(levelId);
    const next = Math.min(levelId + 1, totalLevels);
    if (next > p.highestUnlocked) p.highestUnlocked = next;
    write(p);
    return p;
  }

  function reset() {
    write(defaultProgress());
  }

  window.Storage = { read, markCompleted, reset };
})();
