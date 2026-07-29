// Reforço de autoplay para vídeos em navegadores móveis (iOS/Android)
const autoplayVideos = document.querySelectorAll('video[autoplay]');

function tryPlay(video) {
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  const attempts = (video.dataset.playAttempts = (Number(video.dataset.playAttempts) || 0) + 1);
  if (attempts > 4) return;
  const p = video.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => {
      // Autoplay bloqueado; tenta de novo no primeiro toque/clique do usuário
      const resume = () => {
        video.play().catch(() => {});
      };
      document.addEventListener('touchstart', resume, { once: true, passive: true });
      document.addEventListener('click', resume, { once: true });
    });
  }
}

autoplayVideos.forEach(video => {
  if (video.readyState >= 2) {
    tryPlay(video);
  } else {
    video.addEventListener('loadedmetadata', () => tryPlay(video), { once: true });
  }
  // Retoma a reprodução caso o navegador pause por economia de energia
  video.addEventListener('pause', () => {
    if (!document.hidden) tryPlay(video);
  });
});

// Menu mobile
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Revelar seções ao rolar a página
const revealEls = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('in-view'));
} else if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in-view'));
}
