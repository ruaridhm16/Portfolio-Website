const SIM_NARROW_SCREEN = '(max-width: 860px)';

async function initSimulator(root) {
  if (initSimulator.destroy) initSimulator.destroy();
  const scope = root || document;
  const sim = scope.querySelector('[data-sim]');
  if (!sim) return;

  const narrow = window.matchMedia(SIM_NARROW_SCREEN).matches;
  let cleanup = null;
  let destroyed = false;
  let observer = null;
  initSimulator.destroy = () => {
    destroyed = true;
    if (observer) observer.disconnect();
    if (cleanup) cleanup();
    initSimulator.destroy = null;
  };

  const start = async () => {
    try {
      const module = await import('./misc/rhythm-rush/script.js?v=20261010a');
      if (!destroyed) cleanup = module.init(scope, { reserve: 96, preload: !narrow });
    } catch (err) {
      console.error(err);
    }
  };

  if (!narrow) {
    await start();
    return;
  }

  observer = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    observer.disconnect();
    start();
  }, { rootMargin: '400px' });
  observer.observe(sim);
}
