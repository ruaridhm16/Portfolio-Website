const FLIP_MS = 350;

function initFlipbooks(root) {
  if (initFlipbooks.destroy) initFlipbooks.destroy();
  const scope = root || document;
  const overlay = scope.querySelector('#guideOverlay');
  if (!overlay || !window.St || !window.St.PageFlip) return;

  const book = overlay.querySelector('[data-flipbook]');
  const stage = book.querySelector('.flipbook-stage');
  const closeBtn = overlay.querySelector('.gallery-close');
  const controls = book.nextElementSibling;
  const prevBtn = controls.querySelector('[data-flip="prev"]');
  const nextBtn = controls.querySelector('[data-flip="next"]');
  const total = parseInt(book.dataset.pages, 10);
  const back = parseInt(book.dataset.backCover, 10);
  const order = [...Array(total)].map((_, i) => i + 1).filter(n => n !== back);
  if (back) order.push(back);

  let flip = null;

  const portrait = () => flip.getOrientation() === 'portrait';
  const step = (i, d) => portrait() ? i + d : (d > 0 ? (i === 0 ? 1 : i + 2) : (i === 1 ? 0 : i - 2));
  const place = i => {
    book.classList.toggle('at-front', !portrait() && i === 0);
    book.classList.toggle('at-end', !portrait() && i === flip.getPageCount() - 1);
  };
  const sync = i => {
    if (i === undefined) i = flip.getCurrentPageIndex();
    place(i);
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i >= flip.getPageCount() - 1;
  };
  const turn = d => {
    if (!flip) return;
    place(Math.max(0, Math.min(flip.getPageCount() - 1, step(flip.getCurrentPageIndex(), d))));
    if (d > 0) flip.flipNext(); else flip.flipPrev();
  };

  const start = () => {
    const pages = order.map((file, i) => {
      const page = document.createElement('div');
      page.className = 'flip-page';
      if (i === 0 || i === total - 1) page.dataset.density = 'hard';
      const img = document.createElement('img');
      img.src = book.dataset.src.replace('{n}', String(file).padStart(2, '0'));
      img.alt = `Quick start guide, page ${file} of ${total}`;
      img.width = 1240; img.height = 1335; img.draggable = false;
      page.appendChild(img);
      stage.appendChild(page);
      return page;
    });
    flip = new window.St.PageFlip(stage, {
      width: 1240, height: 1335,
      size: 'stretch', minWidth: 200, maxWidth: 1240, minHeight: 215, maxHeight: 1335,
      showCover: true,
      flippingTime: FLIP_MS,
      maxShadowOpacity: 0.45,
      usePortrait: true,
      useMouseEvents: false
    });
    flip.loadFromHTML(pages);
    flip.on('flip', () => sync());
    flip.on('changeOrientation', () => sync());
    sync();
  };

  const open = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (!flip) start();
    closeBtn.focus();
  };
  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };

  const onKey = e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); e.stopImmediatePropagation(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
  };
  const onOverlayClick = e => { if (e.target === overlay) close(); };

  let sx = null, sy = null;
  book.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  book.addEventListener('touchend', e => {
    if (sx === null) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1);
    sx = sy = null;
  }, { passive: true });

  prevBtn.addEventListener('click', () => turn(-1));
  nextBtn.addEventListener('click', () => turn(1));
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onKey);
  document.addEventListener('open-guide', open);

  initFlipbooks.destroy = () => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('open-guide', open);
    if (flip) flip.destroy();
    initFlipbooks.destroy = null;
  };
}
