const revealItems = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const heroLayers = document.querySelectorAll('.hero-bg [data-depth]');
const heroVisual = document.querySelector('.hero-visual');
const cards = document.querySelectorAll('.floating-card');
const tiltCards = document.querySelectorAll('.tilt');
const parallaxItems = document.querySelectorAll('.project-media, .cta-inner');
const cursorGlow = document.querySelector('.cursor-glow');
const magneticElements = document.querySelectorAll('.magnetic');
const mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = window.matchMedia('(max-width: 980px)').matches;

sections.forEach((section) => {
  section.querySelectorAll('.reveal').forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${index * 80}ms`);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16, rootMargin: '0px 0px -30px 0px' },
);

revealItems.forEach((item) => observer.observe(item));

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
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
    parallaxItems.forEach((item, index) => {
      const strength = isMobile ? 0.005 : 0.012;
      item.style.setProperty('--parallax-y', `${window.scrollY * strength * (index + 1)}px`);
    });
  },
  { passive: true },
);

if (!mediaReduce.matches) {
  window.addEventListener(
    'mousemove',
    (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      const layerStrength = isMobile ? 24 : 52;

      heroLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0.1);
        layer.style.setProperty('--tx', `${x * depth * layerStrength}px`);
        layer.style.setProperty('--ty', `${y * depth * (layerStrength * 0.7)}px`);
      });

      if (cursorGlow) {
        cursorGlow.style.opacity = '1';
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      }

      tiltCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        const rotateX = -dy * (isMobile ? 2 : 4);
        const rotateY = dx * (isMobile ? 2.4 : 5);
        card.style.transform = `translateY(-2px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });

      magneticElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        const mx = Math.max(-1, Math.min(1, dx)) * 8;
        const my = Math.max(-1, Math.min(1, dy)) * 6;
        element.style.transform = `translate(${mx.toFixed(2)}px, ${my.toFixed(2)}px)`;
      });
    },
    { passive: true },
  );

  window.addEventListener('mouseleave', () => {
    cursorGlow?.style.setProperty('opacity', '0');
    tiltCards.forEach((card) => (card.style.transform = ''));
    magneticElements.forEach((element) => (element.style.transform = ''));
  });
}

if (heroVisual && cards.length) {
  const pointer = { x: 0, y: 0, active: false };
  const states = Array.from(cards).map((node, index) => ({
    node,
    amp: 2.5 + index * 1.6,
    duration: 7000 + index * 900,
    phase: index * 1.4,
    mx: 0,
    my: 0,
    rx: 0,
    ry: 0,
  }));

  const animate = (time) => {
    const heroRect = heroVisual.getBoundingClientRect();

    states.forEach((state) => {
      const rect = state.node.getBoundingClientRect();
      const cycle = ((time % state.duration) / state.duration) * Math.PI * 2;
      const floatY = Math.sin(cycle + state.phase) * state.amp;

      let targetX = 0;
      let targetY = 0;

      if (pointer.active) {
        targetX = Math.max(-1, Math.min(1, (pointer.x - (rect.left + rect.width / 2)) / heroRect.width));
        targetY = Math.max(-1, Math.min(1, (pointer.y - (rect.top + rect.height / 2)) / heroRect.height));
      }

      state.mx += (targetX * 9 - state.mx) * 0.12;
      state.my += (targetY * 8 - state.my) * 0.12;
      state.rx += (-targetY * 1.4 - state.rx) * 0.14;
      state.ry += (targetX * 1.6 - state.ry) * 0.14;

      state.node.style.setProperty('--float-y', `${floatY.toFixed(2)}px`);
      state.node.style.setProperty('--mx', `${state.mx.toFixed(2)}px`);
      state.node.style.setProperty('--my', `${state.my.toFixed(2)}px`);
      state.node.style.setProperty('--rx', `${state.rx.toFixed(2)}deg`);
      state.node.style.setProperty('--ry', `${state.ry.toFixed(2)}deg`);
    });

    requestAnimationFrame(animate);
  };

  heroVisual.addEventListener('mousemove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });

  heroVisual.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  if (!mediaReduce.matches) {
    requestAnimationFrame(animate);
  }
}
