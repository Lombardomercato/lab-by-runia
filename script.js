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
const panels = document.querySelectorAll('.panel');
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

if (heroVisual && panels.length > 0 && !prefersReducedMotion.matches) {
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let animationFrameId = 0;

  const floatConfigs = Array.from(panels).map((panel, index) => ({
    node: panel,
    intensity: Number(panel.dataset.intensity) || 0.65,
    amplitude: 3 + index * 2,
    duration: 7600 + index * 900,
    phase: index * 1.6,
  }));

  const animatePanels = (time) => {
    pointer.x += (pointer.targetX - pointer.x) * 0.08;
    pointer.y += (pointer.targetY - pointer.y) * 0.08;

    floatConfigs.forEach(({ node, intensity, amplitude, duration, phase }) => {
      const cycle = ((time % duration) / duration) * Math.PI * 2;
      const floatY = Math.sin(cycle + phase) * amplitude;
      const moveX = pointer.x * (10 * intensity);
      const moveY = pointer.y * (8 * intensity);
      const rotateY = pointer.x * (1.8 * intensity);
      const rotateX = pointer.y * (-1.6 * intensity);

      node.style.setProperty('--float-y', `${floatY.toFixed(2)}px`);
      node.style.setProperty('--mx', `${moveX.toFixed(2)}px`);
      node.style.setProperty('--my', `${moveY.toFixed(2)}px`);
      node.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
      node.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
    });

    animationFrameId = requestAnimationFrame(animatePanels);
  };

  const onMouseMove = (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
    pointer.targetX = Math.max(-1, Math.min(1, normalizedX));
    pointer.targetY = Math.max(-1, Math.min(1, normalizedY));
  };

  const onMouseLeave = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  };

  heroVisual.addEventListener('mousemove', onMouseMove);
  heroVisual.addEventListener('mouseleave', onMouseLeave);
  animationFrameId = requestAnimationFrame(animatePanels);

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      panels.forEach((panel) => {
        panel.style.removeProperty('--float-y');
        panel.style.removeProperty('--mx');
        panel.style.removeProperty('--my');
        panel.style.removeProperty('--rx');
        panel.style.removeProperty('--ry');
      });
    }
  });
}
