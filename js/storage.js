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
