// 拼图核心：切块、拖拽、自由摆放与交换、完成判定
(function () {
  const MOVE_MS = 220;

  function getViewportInfo() {
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function clamp(min, value, max) {
    return Math.max(min, Math.min(max, value));
  }

  function computeBoardSize(cols, rows) {
    const vp = getViewportInfo();
    const isPad = Math.min(vp.w, vp.h) >= 768;
    const isLandscape = vp.w > vp.h;
    const aspect = cols / rows;

    const outerPad = clamp(24, vp.w * 0.04, isPad ? 64 : 32);
    const topbarH = clamp(70, vp.w * 0.08, isPad ? 96 : 78);
    const trayGap = clamp(14, vp.w * 0.02, 36);
    const trayH = clamp(isPad ? 150 : 140, vp.w * (isPad ? 0.16 : 0.32), isPad ? 210 : 280);

    const boardWRatio = isPad ? 0.82 : 1;
    const boardHReserve = isPad && isLandscape
      ? clamp(120, vp.w * 0.13, 170)
      : trayH;
    let maxW = vp.w * boardWRatio - outerPad;
    let maxH = vp.h - topbarH - boardHReserve - trayGap - outerPad;

    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    w = Math.floor(w / cols) * cols;
    h = Math.floor(h / rows) * rows;
    return { w, h, pieceW: w / cols, pieceH: h / rows };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let currentGame = null;

  class PuzzleGame {
    constructor(level, opts) {
      this.level = level;
      this.boardEl = opts.boardEl;
      this.trayEl = opts.trayEl;
      this.peekImageEl = opts.peekImageEl;
      this.onComplete = opts.onComplete || function () {};
      this.pieces = [];
      this.activeDrag = null;
      this.completed = false;
      // 棋盘格状态：slots[col][row] = piece 或 null
      this.slots = null;
      // 碎片区当前的展示队列（按显示顺序），位置由 trayPositions[index] 决定
      this.trayOrder = [];
      this.trayPositions = [];
    }

    async start() {
      const size = computeBoardSize(this.level.cols, this.level.rows);
      this.size = size;
      this.boardEl.style.width = size.w + 'px';
      this.boardEl.style.height = size.h + 'px';
      this.boardEl.style.backgroundSize = `${size.pieceW}px ${size.pieceH}px`;
      this.peekImageEl.src = this.level.image;

      this.slots = [];
      for (let c = 0; c < this.level.cols; c++) {
        this.slots.push(new Array(this.level.rows).fill(null));
      }

      try {
        await loadImage(this.level.image);
      } catch (e) {
        console.warn('image load failed', e);
      }

      this.createPieces();
      this.layoutTray();
    }

    createPieces() {
      const { cols, rows } = this.level;
      const { pieceW, pieceH, w, h } = this.size;
      const frag = document.createDocumentFragment();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const piece = document.createElement('div');
          piece.className = 'piece';
          piece.style.width = pieceW + 'px';
          piece.style.height = pieceH + 'px';
          piece.style.backgroundImage = `url("${this.level.image}")`;
          piece.style.backgroundPosition = `-${col * pieceW}px -${row * pieceH}px`;
          piece.style.setProperty('--bg-w', w + 'px');
          piece.style.setProperty('--bg-h', h + 'px');
          piece.dataset.col = String(col);
          piece.dataset.row = String(row);
          piece._slot = null; // 当前所在格子 { col, row } 或 null（在 tray）
          this.attachDrag(piece);
          this.pieces.push(piece);
          frag.appendChild(piece);
        }
      }
      this.trayEl.appendChild(frag);
    }

    layoutTray() {
      const trayRect = this.trayEl.getBoundingClientRect();
      const trayStyle = window.getComputedStyle(this.trayEl);
      const padding = parseFloat(trayStyle.paddingLeft) || 10;
      const { pieceW, pieceH } = this.size;
      const cellW = pieceW + 6;
      const cellH = pieceH + 6;
      const perRow = Math.max(1, Math.floor((trayRect.width - padding * 2) / cellW));
      const rowsNeeded = Math.ceil(this.pieces.length / perRow);

      const neededH = rowsNeeded * cellH + padding * 2;
      if (neededH > trayRect.height) {
        this.trayEl.style.minHeight = neededH + 'px';
      }

      const positions = [];
      for (let r = 0; r < rowsNeeded; r++) {
        for (let c = 0; c < perRow; c++) {
          if (positions.length >= this.pieces.length) break;
          positions.push({
            x: padding + c * cellW + (cellW - pieceW) / 2,
            y: padding + r * cellH + (cellH - pieceH) / 2,
          });
        }
      }
      this.trayPositions = positions;
      this.trayOrder = shuffleArray(this.pieces.slice());

      this.trayOrder.forEach((piece, idx) => {
        const p = positions[idx];
        piece.style.position = 'absolute';
        piece.style.left = p.x + 'px';
        piece.style.top = p.y + 'px';
      });
    }

    // 让 trayOrder 中所有碎片平滑过渡到它们当前 index 对应的位置
    refreshTrayLayout() {
      const fromRects = this.trayOrder.map(p => p.getBoundingClientRect());
      this.trayOrder.forEach((piece, i) => {
        const target = this.trayPositions[i];
        if (!target) return;
        piece.style.left = target.x + 'px';
        piece.style.top = target.y + 'px';
      });
      this.trayOrder.forEach((piece, i) => {
        if (!this.trayPositions[i]) return;
        this.animateFromTo(piece, fromRects[i]);
      });
    }

    attachDrag(piece) {
      piece.addEventListener('pointerdown', (e) => this.onPointerDown(e, piece));
    }

    onPointerDown(e, piece) {
      if (this.completed) return;
      if (this.activeDrag) return;
      e.preventDefault();

      window.SoundFX && SoundFX.resume();
      window.SoundFX && SoundFX.playPick();

      const rect = piece.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      // 记下"出发位置"，以便交换时另一块知道往哪去
      piece._origin = piece._slot
        ? { type: 'board', col: piece._slot.col, row: piece._slot.row }
        : { type: 'tray' };

      // 如果是从 board 上拿起，先把格子腾空
      if (piece._slot) {
        this.slots[piece._slot.col][piece._slot.row] = null;
      }

      // 移到 body 用 fixed 定位跟随指针
      document.body.appendChild(piece);
      piece.style.position = 'fixed';
      piece.style.left = rect.left + 'px';
      piece.style.top = rect.top + 'px';
      piece.classList.add('dragging');
      piece.classList.remove('returning', 'placed');

      const moveHandler = (ev) => {
        piece.style.left = (ev.clientX - offsetX) + 'px';
        piece.style.top = (ev.clientY - offsetY) + 'px';
      };
      const upHandler = (ev) => {
        piece.removeEventListener('pointermove', moveHandler);
        piece.removeEventListener('pointerup', upHandler);
        piece.removeEventListener('pointercancel', upHandler);
        try { piece.releasePointerCapture(ev.pointerId); } catch (err) {}
        this.activeDrag = null;
        this.onRelease(piece);
      };

      try { piece.setPointerCapture(e.pointerId); } catch (err) {}
      piece.addEventListener('pointermove', moveHandler);
      piece.addEventListener('pointerup', upHandler);
      piece.addEventListener('pointercancel', upHandler);
      this.activeDrag = piece;
    }

    // 算出"放手位置"落到哪个格子，返回 {col,row} 或 null
    pickCellAtCenter(piece) {
      const boardRect = this.boardEl.getBoundingClientRect();
      const { pieceW, pieceH, w, h } = this.size;
      const curX = parseFloat(piece.style.left);
      const curY = parseFloat(piece.style.top);
      const centerX = curX + pieceW / 2;
      const centerY = curY + pieceH / 2;
      const relX = centerX - boardRect.left;
      const relY = centerY - boardRect.top;
      const tol = 0.15;
      const overBoard =
        relX >= -pieceW * tol && relX < w + pieceW * tol &&
        relY >= -pieceH * tol && relY < h + pieceH * tol;
      if (!overBoard) return null;
      const col = Math.max(0, Math.min(this.level.cols - 1, Math.floor(relX / pieceW)));
      const row = Math.max(0, Math.min(this.level.rows - 1, Math.floor(relY / pieceH)));
      return { col, row };
    }

    onRelease(piece) {
      const cell = this.pickCellAtCenter(piece);
      const origin = piece._origin;
      piece._origin = null;
      piece.classList.remove('dragging');

      if (cell) {
        const occupier = this.slots[cell.col][cell.row];
        if (occupier && occupier !== piece) {
          // 落在另一块上 → 交换
          this.placeOnBoard(piece, cell.col, cell.row, true);
          if (origin.type === 'board') {
            this.placeOnBoard(occupier, origin.col, origin.row, false);
          } else {
            this.sendToTray(occupier, false);
          }
        } else {
          // 落在空格（或自己原来的格子）
          this.placeOnBoard(piece, cell.col, cell.row, true);
        }
      } else {
        // 没落到 board → 回到 tray
        this.sendToTray(piece, true);
      }

      this.checkWin();
    }

    placeOnBoard(piece, col, row, withSound) {
      const { pieceW, pieceH } = this.size;
      // 若从碎片区上去，先从队列里移除（剩余碎片会被自动前移）
      const trayIdx = this.trayOrder.indexOf(piece);
      if (trayIdx !== -1) this.trayOrder.splice(trayIdx, 1);

      const fromRect = piece.getBoundingClientRect();
      this.boardEl.appendChild(piece);
      piece.style.position = 'absolute';
      piece.style.left = (col * pieceW) + 'px';
      piece.style.top = (row * pieceH) + 'px';
      piece._slot = { col, row };
      this.slots[col][row] = piece;
      this.animateFromTo(piece, fromRect);

      const isCorrect = parseInt(piece.dataset.col, 10) === col && parseInt(piece.dataset.row, 10) === row;
      if (isCorrect) piece.classList.add('placed');
      else piece.classList.remove('placed');
      if (withSound && window.SoundFX) {
        if (isCorrect) SoundFX.playDing(); else SoundFX.playPick();
      }

      // 让剩下的碎片自动前移
      if (trayIdx !== -1) this.refreshTrayLayout();
    }

    sendToTray(piece, isUserDrop) {
      // 不在队列里说明是从板子上下来的，追加到队尾
      if (this.trayOrder.indexOf(piece) === -1) {
        this.trayOrder.push(piece);
      }
      const idx = this.trayOrder.indexOf(piece);
      const target = this.trayPositions[idx];

      const fromRect = piece.getBoundingClientRect();
      this.trayEl.appendChild(piece);
      piece.style.position = 'absolute';
      if (target) {
        piece.style.left = target.x + 'px';
        piece.style.top = target.y + 'px';
      }
      piece._slot = null;
      piece.classList.remove('placed');
      this.animateFromTo(piece, fromRect);
      if (isUserDrop && window.SoundFX) SoundFX.playPick();
    }

    // FLIP 动画：让元素从 fromRect 平滑过渡到现在的位置
    animateFromTo(piece, fromRect) {
      const toRect = piece.getBoundingClientRect();
      const dx = fromRect.left - toRect.left;
      const dy = fromRect.top - toRect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      piece.style.transition = 'none';
      piece.style.transform = `translate(${dx}px, ${dy}px)`;
      // 强制 reflow
      piece.getBoundingClientRect();
      piece.style.transition = `transform ${MOVE_MS}ms ease-out`;
      piece.style.transform = 'translate(0, 0)';
      setTimeout(() => {
        piece.style.transition = '';
        piece.style.transform = '';
      }, MOVE_MS + 30);
    }

    checkWin() {
      if (this.completed) return;
      for (const piece of this.pieces) {
        if (!piece._slot) return;
        const correctCol = parseInt(piece.dataset.col, 10);
        const correctRow = parseInt(piece.dataset.row, 10);
        if (piece._slot.col !== correctCol || piece._slot.row !== correctRow) return;
      }
      this.completed = true;
      setTimeout(() => this.onComplete(), 300);
    }

    destroy() {
      this.pieces.forEach(p => {
        if (p.parentNode) p.parentNode.removeChild(p);
      });
      this.pieces = [];
      this.boardEl.innerHTML = '';
      this.trayEl.innerHTML = '';
      this.trayEl.style.minHeight = '';
    }
  }

  function setCurrent(g) {
    if (currentGame) currentGame.destroy();
    currentGame = g;
  }

  function getCurrent() {
    return currentGame;
  }

  window.Puzzle = { PuzzleGame, setCurrent, getCurrent };
})();
