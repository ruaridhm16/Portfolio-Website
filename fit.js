const FIT_DESIGN_WIDTH = 925;
const FIT_NARROW_SCREEN = '(max-width: 860px)';

function initFit(root) {
  if (initFit.destroy) initFit.destroy();
  const scope = root || document;
  const blocks = [...scope.querySelectorAll('.sg-fit')];
  if (!blocks.length) return;

  const narrow = window.matchMedia(FIT_NARROW_SCREEN);
  const apply = () => {
    blocks.forEach(block => {
      if (narrow.matches) {
        block.style.zoom = '';
        return;
      }
      const parent = block.parentElement;
      const style = getComputedStyle(parent);
      const width = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      block.style.zoom = Math.min(1.5, Math.max(0.8, width / FIT_DESIGN_WIDTH));
    });
  };

  const observer = new ResizeObserver(apply);
  blocks.forEach(block => observer.observe(block.parentElement));
  narrow.addEventListener('change', apply);
  apply();

  initFit.destroy = () => {
    observer.disconnect();
    narrow.removeEventListener('change', apply);
    initFit.destroy = null;
  };
}
