// 用 Web Audio API 合成所有音效（无需外部音频文件）
(function () {
  let ctx = null;
  let muted = false;
  let bgmGain = null;
  let bgmTimer = null;
  let bgmRunning = false;

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }

  function resume() {
    const c = ensureCtx();
    if (c && c.state === 'suspended') c.resume();
  }

  // 拼对时的"叮"
  function playDing() {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // 拿起碎片的"啵"
  function playPick() {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.05);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 通关时的小乐句 C-E-G-C
  function playWin() {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const start = c.currentTime;
    notes.forEach((freq, i) => {
      const t = start + i * 0.14;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // 轻柔的循环背景旋律
  function startBgm() {
    if (muted || bgmRunning) return;
    const c = ensureCtx();
    if (!c) return;
    bgmRunning = true;
    bgmGain = c.createGain();
    bgmGain.gain.value = 0.05;
    bgmGain.connect(c.destination);

    // 简单的"小星星"前 8 拍：C C G G A A G - F F E E D D C -
    const melody = [
      [261.63, 0.5], [261.63, 0.5], [392.0, 0.5], [392.0, 0.5],
      [440.0, 0.5], [440.0, 0.5], [392.0, 1.0],
      [349.23, 0.5], [349.23, 0.5], [329.63, 0.5], [329.63, 0.5],
      [293.66, 0.5], [293.66, 0.5], [261.63, 1.0],
    ];
    const beat = 0.5;
    const totalDur = melody.reduce((sum, [, d]) => sum + d * beat, 0);

    function scheduleLoop(startAt) {
      let t = startAt;
      melody.forEach(([freq, d]) => {
        const dur = d * beat;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.6, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur - 0.02);
        osc.connect(gain).connect(bgmGain);
        osc.start(t);
        osc.stop(t + dur);
        t += dur;
      });
    }

    let nextStart = c.currentTime + 0.1;
    scheduleLoop(nextStart);
    nextStart += totalDur;
    bgmTimer = setInterval(() => {
      if (!bgmRunning) return;
      if (nextStart - c.currentTime < totalDur) {
        scheduleLoop(nextStart);
        nextStart += totalDur;
      }
    }, 500);
  }

  function stopBgm() {
    bgmRunning = false;
    if (bgmTimer) clearInterval(bgmTimer);
    bgmTimer = null;
    if (bgmGain && ctx) {
      try {
        // 立即归零并断开，之前预排的音符不会再出声
        bgmGain.gain.cancelScheduledValues(ctx.currentTime);
        bgmGain.gain.setValueAtTime(0, ctx.currentTime);
        bgmGain.disconnect();
      } catch (e) {}
    }
    bgmGain = null;
  }

  function setMuted(m) {
    muted = m;
    if (muted) stopBgm();
  }

  function isMuted() {
    return muted;
  }

  window.SoundFX = { resume, playDing, playPick, playWin, startBgm, stopBgm, setMuted, isMuted };
})();
