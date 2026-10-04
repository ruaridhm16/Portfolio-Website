function initGlow(root) {
  if (initGlow.destroy) initGlow.destroy();
  const scope = root || document;
  const main = scope.querySelector('.rr-glow');
  if (!main) return;

  const scroller = root || window;
  const FADE_DISTANCE = 240;
  const STUCK_STRENGTH = 0.5;
  const update = () => {
    const y = root ? root.scrollTop : window.scrollY;
    const k = 1 - (1 - STUCK_STRENGTH) * Math.min(1, y / FADE_DISTANCE);
    main.style.setProperty('--glow-k', k);
  };

  scroller.addEventListener('scroll', update, { passive: true });
  update();
  initGlow.destroy = () => {
    scroller.removeEventListener('scroll', update);
    initGlow.destroy = null;
  };
}
