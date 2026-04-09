const revealElements = document.querySelectorAll('.reveal');

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
    rootMargin: '0px 0px -48px 0px',
  },
);

revealElements.forEach((item) => observer.observe(item));

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

const navbar = document.querySelector('.navbar');
const panels = document.querySelectorAll('.panel');
let ticking = false;

const updateScrollEffects = () => {
  const scrollY = window.scrollY;

  if (navbar) {
    navbar.classList.toggle('is-scrolled', scrollY > 16);
  }

  const offset = Math.min(scrollY * 0.055, 28);
  panels.forEach((panel, index) => {
    const depth = index + 1;
    panel.style.transform = `translate3d(0, ${offset / depth}px, 0)`;
  });

  ticking = false;
};

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  },
  { passive: true },
);

updateScrollEffects();
