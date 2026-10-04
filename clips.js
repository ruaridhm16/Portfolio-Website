const CLIP_NARROW_SCREEN = '(max-width: 860px)';

function playFullscreen(src) {
  const video = document.createElement('video');
  video.className = 'fs-video';
  video.src = src;
  video.controls = true;
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.setAttribute('controlsList', 'nodownload noplaybackrate');
  document.body.appendChild(video);

  const finish = () => {
    if (document.fullscreenElement) return;
    video.pause();
    video.remove();
    document.removeEventListener('fullscreenchange', finish);
  };
  const enter = () => {
    if (video.requestFullscreen) video.requestFullscreen().catch(finish);
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    else finish();
  };
  const leave = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(finish);
    else if (video.webkitExitFullscreen) video.webkitExitFullscreen();
    finish();
  };

  document.addEventListener('fullscreenchange', finish);
  video.addEventListener('webkitendfullscreen', finish);
  video.addEventListener('ended', leave);
  video.addEventListener('playing', enter, { once: true });
  video.play().catch(finish);
}

function playPopup(src) {
  const overlay = document.createElement('div');
  overlay.className = 'clip-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Video');
  overlay.innerHTML = `
    <div class="clip-frame">
      <video playsinline controls controlsList="nodownload noplaybackrate" disablePictureInPicture></video>
      <button class="clip-close" type="button" aria-label="Close video">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
    </div>`;
  document.body.appendChild(overlay);

  const video = overlay.querySelector('video');
  const closeButton = overlay.querySelector('.clip-close');
  const previousFocus = document.activeElement;

  const close = () => {
    document.removeEventListener('keydown', onKey);
    video.pause();
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 300);
    if (previousFocus) previousFocus.focus();
  };
  const onKey = e => {
    if (e.key === 'Escape') close();
  };

  video.src = src;
  video.addEventListener('ended', close);
  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', onKey);

  requestAnimationFrame(() => overlay.classList.add('open'));
  closeButton.focus();
  video.play().catch(() => {});
}

function initClips(root) {
  if (initClips.destroy) initClips.destroy();
  const scope = root || document;
  const clips = [...scope.querySelectorAll('video[data-autoplay]')];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, { threshold: 0.5 });
  clips.forEach(clip => observer.observe(clip));

  const onClick = e => {
    const link = e.target.closest('a[data-popup-video]');
    if (!link) return;
    e.preventDefault();
    const src = link.getAttribute('href');
    if (window.matchMedia(CLIP_NARROW_SCREEN).matches) playFullscreen(src);
    else playPopup(src);
  };
  scope.addEventListener('click', onClick);

  initClips.destroy = () => {
    observer.disconnect();
    scope.removeEventListener('click', onClick);
    clips.forEach(clip => clip.pause());
    initClips.destroy = null;
  };
}
