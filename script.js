const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const hero = document.querySelector('.hero');
const heroHeadline = document.querySelector('.hero h1');
const heroLead = document.querySelector('.hero .lead');
const heroActions = document.querySelector('.hero .hero-actions');
const heroEyebrow = document.querySelector('.hero .eyebrow');
const parallaxElements = document.querySelectorAll('.case-media, .cta-inner');

const splitWords = (element) => {
  if (!element) return;
  if (element.dataset.split === 'true') return;
  const text = element.textContent?.trim() ?? '';
  if (!text) return;

  const words = text.split(/\s+/);
  element.textContent = '';

  words.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.textContent = word;
    wordSpan.style.setProperty('--word-index', String(index));
    element.append(wordSpan);

    if (index < words.length - 1) {
      element.append(document.createTextNode(' '));
    }
  });

  element.dataset.split = 'true';
};

splitWords(heroHeadline);

const setRevealSequence = () => {
  sections.forEach((section) => {
    const sequence = section.querySelectorAll('.reveal');
    sequence.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * 85}ms`);
    });
  });
};

setRevealSequence();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  },
);

revealElements.forEach((item) => observer.observe(item));

if (hero) {
  const heroTimeline = [heroEyebrow, heroHeadline, heroLead, heroActions];

  heroTimeline.forEach((node, index) => {
    if (!node) return;
    node.classList.add('hero-enter');
    node.style.setProperty('--hero-delay', `${180 + index * 140}ms`);
  });

  requestAnimationFrame(() => {
    hero.classList.add('hero-is-ready');
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const heroCards = document.querySelectorAll('.hero-card');
const heroVisual = document.querySelector('.hero-visual');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

window.addEventListener(
  'scroll',
  () => {
    parallaxElements.forEach((element, index) => {
      const depth = (index + 2) * 0.015;
      const y = window.scrollY * depth;
      element.style.setProperty('--parallax-y', `${y}px`);
    });
  },
  { passive: true },
);

if (heroVisual && heroCards.length > 0) {
  const pointer = { x: 0, y: 0, inside: false };
  let animationFrameId = 0;

  const cardStates = Array.from(heroCards).map((card, index) => ({
    node: card,
    intensity: Number(card.dataset.intensity) || 0.65,
    amplitude: Number(card.dataset.amplitude) || 4 + index,
    duration: Number(card.dataset.duration) || 7000 + index * 1200,
    phase: Number(card.dataset.phase) || index * 1.5,
    hoverX: 0,
    hoverY: 0,
    rotateX: 0,
    rotateY: 0,
  }));

  const animateCards = (time) => {
    const heroBounds = heroVisual.getBoundingClientRect();

    cardStates.forEach((state) => {
      const cycle = ((time % state.duration) / state.duration) * Math.PI * 2;
      const floatY = Math.sin(cycle + state.phase) * state.amplitude;
      const cardBounds = state.node.getBoundingClientRect();

      let targetHoverX = 0;
      let targetHoverY = 0;
      if (pointer.inside) {
        const centerX = cardBounds.left + cardBounds.width / 2;
        const centerY = cardBounds.top + cardBounds.height / 2;
        targetHoverX = Math.max(-1, Math.min(1, (pointer.x - centerX) / heroBounds.width));
        targetHoverY = Math.max(-1, Math.min(1, (pointer.y - centerY) / heroBounds.height));
      }

      state.hoverX += (targetHoverX - state.hoverX) * 0.1;
      state.hoverY += (targetHoverY - state.hoverY) * 0.1;
      state.rotateY += (state.hoverX * (1.2 * state.intensity) - state.rotateY) * 0.14;
      state.rotateX += (state.hoverY * (-1.1 * state.intensity) - state.rotateX) * 0.14;

      const moveX = state.hoverX * (11 * state.intensity);
      const moveY = state.hoverY * (8 * state.intensity);

      state.node.style.setProperty('--float-y', `${floatY.toFixed(2)}px`);
      state.node.style.setProperty('--mx', `${moveX.toFixed(2)}px`);
      state.node.style.setProperty('--my', `${moveY.toFixed(2)}px`);
      state.node.style.setProperty('--rx', `${state.rotateX.toFixed(2)}deg`);
      state.node.style.setProperty('--ry', `${state.rotateY.toFixed(2)}deg`);
    });

    animationFrameId = requestAnimationFrame(animateCards);
  };

  heroVisual.addEventListener('mousemove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.inside = true;
  });

  heroVisual.addEventListener('mouseleave', () => {
    pointer.inside = false;
  });

  const clearMotionVars = () => {
    heroCards.forEach((card) => {
      card.style.removeProperty('--float-y');
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
    });
  };

  const startMotionLoop = () => {
    if (!animationFrameId && !prefersReducedMotion.matches) {
      animationFrameId = requestAnimationFrame(animateCards);
    }
  };

  const stopMotionLoop = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
    clearMotionVars();
  };

  startMotionLoop();

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      stopMotionLoop();
      return;
    }
    startMotionLoop();
  });
}
