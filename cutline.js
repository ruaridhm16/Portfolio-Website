function initCutLine(root) {
  if (initCutLine.destroy) initCutLine.destroy();
  const scope = root || document;
  const line = scope.querySelector('.sc-cut');
  if (!line) return;

  const scroller = root || window;
  const FADE_DISTANCE = 240;
  const STUCK_STRENGTH = 0.5;
  const update = () => {
    const el = root || document.scrollingElement;
    const max = el.scrollHeight - el.clientHeight;
    line.style.setProperty('--cut', max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    line.style.setProperty('--cut-k', 1 - (1 - STUCK_STRENGTH) * Math.min(1, el.scrollTop / FADE_DISTANCE));
  };

  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
  initCutLine.destroy = () => {
    scroller.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    initCutLine.destroy = null;
  };
}
