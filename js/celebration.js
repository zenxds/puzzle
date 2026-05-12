// 撒花/星星粒子动画（canvas 实现）
(function () {
  let canvas = null;
  let ctx2d = null;
  let particles = [];
  let rafId = null;
  let running = false;

  const COLORS = ['#ff9bcc', '#ffd24d', '#a0e1ff', '#c8a8e9', '#b8e9c9', '#ffb6d9'];
  const SHAPES = ['star', 'circle', 'square'];

  function init() {
    if (canvas) return;
    canvas = document.getElementById('confetti');
    ctx2d = canvas.getContext('2d');
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnBurst() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const count = 120;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 7;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        ttl: 90 + Math.random() * 60,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.2,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      });
    }
  }

  function drawStar(x, y, r, rot) {
    ctx2d.save();
    ctx2d.translate(x, y);
    ctx2d.rotate(rot);
    ctx2d.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? r : r / 2.3;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx2d.moveTo(px, py); else ctx2d.lineTo(px, py);
    }
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.restore();
  }

  function tick() {
    if (!running) return;
    ctx2d.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    particles = particles.filter(p => p.life < p.ttl);

    for (const p of particles) {
      p.vy += 0.15; // 重力
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life++;
      const alpha = 1 - p.life / p.ttl;
      ctx2d.globalAlpha = Math.max(0, alpha);
      ctx2d.fillStyle = p.color;
      if (p.shape === 'star') {
        drawStar(p.x, p.y, p.size, p.rot);
      } else if (p.shape === 'circle') {
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx2d.fill();
      } else {
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rot);
        ctx2d.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx2d.restore();
      }
    }
    ctx2d.globalAlpha = 1;

    if (particles.length > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  function start() {
    init();
    resize();
    particles = [];
    spawnBurst();
    // 再来两轮延迟爆发，更热闹
    setTimeout(() => { if (running) spawnBurst(); }, 350);
    setTimeout(() => { if (running) spawnBurst(); }, 800);
    running = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (ctx2d) ctx2d.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    particles = [];
  }

  window.Celebration = { start, stop };
})();
