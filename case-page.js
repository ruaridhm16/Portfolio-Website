function initBackButton() {
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

let scrollRevealObserver = null;
function observeScrollReveal() {
  if (scrollRevealObserver) scrollRevealObserver.disconnect();
  scrollRevealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      scrollRevealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.scroll-reveal:not(.revealed)').forEach(el => scrollRevealObserver.observe(el));
}

document.getElementById('year').textContent = new Date().getFullYear();
initBackButton();
observeScrollReveal();
if (typeof initGallery === 'function') initGallery();
if (typeof initFlipbooks === 'function') initFlipbooks();
if (typeof initSimulator === 'function') initSimulator();
if (typeof initGlow === 'function') initGlow();
if (typeof initCutLine === 'function') initCutLine();
if (typeof initClips === 'function') initClips();
if (typeof initFit === 'function') initFit();

const hashTarget = location.hash && document.getElementById(location.hash.slice(1));
if (hashTarget) {
  const toTarget = () => hashTarget.scrollIntoView({ block: 'center', behavior: 'instant' });
  toTarget();
  window.addEventListener('load', toTarget);
}

window.matchMedia('(max-width: 860px)').addEventListener('change', () => {
  document.body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
});
