function initDarkMode() {
  const logoBtn = document.getElementById('logoBtn');
  function syncLabel(isDark) {
    logoBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncLabel(document.documentElement.classList.contains('dark'));
  logoBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    if (isDark) localStorage.setItem('t', '');
    else localStorage.removeItem('t');
    syncLabel(isDark);
  });
}

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
initDarkMode();
initBackButton();
observeScrollReveal();
initGallery();
initFlipbooks();
