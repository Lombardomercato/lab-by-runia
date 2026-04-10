const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const hero = document.querySelector('.hero');
const heroHeadline = document.querySelector('.hero h1');
const heroLead = document.querySelector('.hero .lead');
const heroActions = document.querySelector('.hero .hero-actions');
const heroEyebrow = document.querySelector('.hero .eyebrow');
const heroVisual = document.querySelector('.hero-visual');
const parallaxElements = document.querySelectorAll('.hero-visual, .case-media, .cta-inner');

const splitWords = (element) => {
  if (!element || element.dataset.split === 'true') return;

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
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
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


