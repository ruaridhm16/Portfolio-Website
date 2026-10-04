const GALLERY_NARROW_SCREEN = '(max-width: 860px)';

function slidesFrom(template) {
  return [...template.content.querySelectorAll('figure')].map(f => {
    const img = f.querySelector('img');
    return {
      action: f.dataset.action || '',
      video: f.dataset.video || '',
      videoMobile: f.dataset.videoMobile || '',
      sound: f.hasAttribute('data-sound'),
      src: img.getAttribute('src'),
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
      caption: f.querySelector('figcaption').textContent
    };
  });
}

function createViewer(overlay, slides, { go: onGo, onClose, returnFocus } = {}) {
  const img = overlay.querySelector('.gallery-stage img');
  const clip = document.createElement('video');
  clip.autoplay = true;
  clip.loop = true;
  clip.muted = true;
  clip.playsInline = true;
  clip.hidden = true;
  img.after(clip);
  const caption = overlay.querySelector('.gallery-caption');
  const closeBtn = overlay.querySelector('.gallery-close');
  const n = slides.length;
  let index = 0;

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Go to ${i + 1} of ${n}`);
    b.addEventListener('click', () => go(i));
    overlay.querySelector('.gallery-dots').appendChild(b);
    return b;
  });

  function setFace(slide) {
    img.classList.remove('visible');
    clip.classList.remove('visible');
    clip.pause();
    if (slide.video) {
      img.hidden = true;
      clip.hidden = false;
      clip.poster = slide.src;
      clip.muted = !slide.sound;
      clip.controls = slide.sound;
      clip.src = window.matchMedia(GALLERY_NARROW_SCREEN).matches && slide.videoMobile ? slide.videoMobile : slide.video;
      caption.textContent = slide.caption;
      clip.play().catch(() => {});
      requestAnimationFrame(() => clip.classList.add('visible'));
      return;
    }
    img.hidden = false;
    clip.hidden = true;
    const preload = new Image();
    preload.onload = () => {
      img.src = slide.src;
      caption.textContent = slide.caption;
      requestAnimationFrame(() => img.classList.add('visible'));
    };
    preload.src = slide.src;
  }

  function show(i) {
    index = (i + n) % n;
    setFace(slides[index]);
    dots.forEach((d, k) => d.classList.toggle('active', k === index));
  }

  function go(i) {
    show(i);
    if (onGo) onGo(index);
  }

  function open() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    clip.pause();
    if (onClose) onClose(index);
    if (returnFocus) returnFocus.focus();
  }

  function onKey(e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); e.stopImmediatePropagation(); }
    else if (e.key === 'ArrowLeft') go(index - 1);
    else if (e.key === 'ArrowRight') go(index + 1);
  }

  closeBtn.addEventListener('click', close);
  overlay.querySelector('.gallery-prev').addEventListener('click', () => go(index - 1));
  overlay.querySelector('.gallery-next').addEventListener('click', () => go(index + 1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  show(0);
  return {
    show, go, open, close,
    index: () => index,
    isOpen: () => overlay.classList.contains('open'),
    destroy: () => document.removeEventListener('keydown', onKey)
  };
}

function initPhotoStrip(scope, cleanups) {
  const overlay = scope.querySelector('#galleryOverlay');
  const source = scope.querySelector('#gallerySource');
  const track = scope.querySelector('#galleryTrack');
  if (!overlay || !source || !track) return;

  const slides = slidesFrom(source);
  if (!slides.length) return;
  const n = slides.length;
  const photos = slides.filter(s => !s.action);
  const AUTOPLAY_MS = 4500;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const expandBtn = scope.querySelector('#galleryDisplayBtn');
  const narrow = window.matchMedia(GALLERY_NARROW_SCREEN).matches;
  const cells = [];
  let hovering = false;
  let touching = false;

  const clipObserver = narrow ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, { threshold: 0.25 }) : null;
  if (clipObserver) cleanups.push(() => clipObserver.disconnect());

  const viewer = createViewer(overlay, photos, {
    go: i => { if (!viewer.isOpen()) scrollToPhoto(i); },
    onClose: i => scrollToPhoto(i, 'instant'),
    returnFocus: expandBtn
  });
  cleanups.push(viewer.destroy);

  const copies = narrow ? 1 : 3;
  const mainCopy = narrow ? 0 : 1;

  for (let copy = 0; copy < copies; copy++) {
    slides.forEach((slide, i) => {
      const cell = document.createElement('div');
      cell.className = 'case-gallery-cell';
      cell.dataset.i = i;
      if (slide.action) cell.classList.add('case-gallery-cell--' + slide.action);
      if (copy !== mainCopy) cell.setAttribute('aria-hidden', 'true');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.tabIndex = copy === mainCopy ? 0 : -1;
      btn.setAttribute('aria-label', slide.action === 'guide' ? 'Read the user guide' : `Open photo ${i + 1} fullscreen`);
      const im = document.createElement(slide.video ? 'video' : 'img');
      if (slide.video) {
        im.src = narrow && slide.videoMobile ? slide.videoMobile : slide.video;
        im.poster = slide.src;
        im.autoplay = !narrow;
        if (narrow) {
          im.preload = 'none';
          clipObserver.observe(im);
        }
        im.loop = true;
        im.muted = true;
        im.controls = slide.sound && narrow;
        im.playsInline = true;
        im.setAttribute('aria-label', slide.caption);
      } else {
        im.src = slide.src;
        im.alt = slide.caption;
        im.draggable = false;
        im.decoding = 'async';
        im.loading = copy === mainCopy && !narrow ? 'eager' : 'lazy';
      }
      im.width = slide.width;
      im.height = slide.height;
      btn.appendChild(im);
      const cap = document.createElement('p');
      cap.className = 'case-gallery-caption';
      cap.textContent = slide.caption;
      cell.append(btn, cap);
      track.appendChild(cell);
      cells.push(cell);
    });
  }

  const setWidth = () => cells[n].offsetLeft - cells[0].offsetLeft;
  const nearestCell = () => {
    let best = 0;
    cells.forEach((c, k) => {
      if (Math.abs(c.offsetLeft - track.scrollLeft) < Math.abs(cells[best].offsetLeft - track.scrollLeft)) best = k;
    });
    return best;
  };
  const scrollToCell = (k, behavior) => {
    if (cells[k]) track.scrollTo({ left: cells[k].offsetLeft, behavior: behavior || 'smooth' });
  };
  function scrollToPhoto(i, behavior) {
    const here = nearestCell();
    let best = i;
    for (let k = i; k < cells.length; k += n) if (Math.abs(k - here) < Math.abs(best - here)) best = k;
    scrollToCell(best, behavior);
  }
  const step = d => scrollToCell(nearestCell() + d);

  let settle = null;
  const onScroll = () => {
    clearTimeout(settle);
    settle = setTimeout(() => {
      const w = setWidth();
      if (track.scrollLeft < w * 0.5) track.scrollLeft += w;
      else if (track.scrollLeft > w * 1.5) track.scrollLeft -= w;
      const i = nearestCell() % n;
      if (i < photos.length && i !== viewer.index()) viewer.show(i);
    }, 120);
  };
  track.addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('mouseenter', () => { hovering = true; });
  track.addEventListener('mouseleave', () => { hovering = false; });
  track.addEventListener('touchstart', () => { touching = true; }, { passive: true });
  track.addEventListener('touchend', () => { touching = false; }, { passive: true });
  track.addEventListener('click', e => {
    const cell = e.target.closest('.case-gallery-cell');
    if (!cell) return;
    if (cell.classList.contains('case-gallery-cell--guide')) { document.dispatchEvent(new CustomEvent('open-guide')); return; }
    if (narrow) return;
    viewer.go(Number(cell.dataset.i));
    viewer.open();
  });
  if (narrow) return;
  track.scrollLeft = cells[n].offsetLeft;
  requestAnimationFrame(() => { track.scrollLeft = cells[n].offsetLeft; });

  const prev = scope.querySelector('#galleryInlinePrev');
  const next = scope.querySelector('#galleryInlineNext');
  if (prev) prev.addEventListener('click', () => step(-1));
  if (next) next.addEventListener('click', () => step(1));
  if (expandBtn) expandBtn.addEventListener('click', viewer.open);

  if (!reduceMotion) {
    const timer = setInterval(() => {
      if (hovering || touching || document.hidden || scope.querySelector('.gallery-overlay.open')) return;
      if (track.contains(document.activeElement)) return;
      step(1);
    }, AUTOPLAY_MS);
    cleanups.push(() => clearInterval(timer));
  }
  cleanups.push(() => clearTimeout(settle));
}

function initGallery(root) {
  if (initGallery.destroy) initGallery.destroy();
  const scope = root || document;
  const cleanups = [];
  initPhotoStrip(scope, cleanups);
  initGallery.destroy = () => {
    cleanups.forEach(fn => fn());
    initGallery.destroy = null;
  };
}
