document.documentElement.classList.add('js');

const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const parallaxTargets = document.querySelectorAll('.project-media, .cta-inner');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const heroVisual = document.querySelector('.hero-visual');
const floatCards = document.querySelectorAll('.float-card');
const interactiveCards = document.querySelectorAll('.tilt, .project');
const heroLayers = document.querySelectorAll('.hero-bg [data-depth]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setRevealDelay = () => {
  sections.forEach((section) => {
    const items = section.querySelectorAll('.reveal');
    items.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * 85}ms`);
    });
  });
};

setRevealDelay();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: '0px 0px -35px 0px',
  },
);

revealElements.forEach((node) => revealObserver.observe(node));

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

const applyScrollMotion = () => {
  if (navbar) {
    navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  parallaxTargets.forEach((element, index) => {
    const depth = (index + 2) * 0.012;
    element.style.setProperty('--parallax-y', `${(window.scrollY * depth).toFixed(2)}px`);
  });
};

window.addEventListener('scroll', applyScrollMotion, { passive: true });
applyScrollMotion();

let pointerRaf = 0;
const pointer = { x: 0, y: 0, active: false };

const updatePointerMotion = () => {
  pointerRaf = 0;
  if (!pointer.active || prefersReducedMotion.matches) return;

  const x = pointer.x / window.innerWidth - 0.5;
  const y = pointer.y / window.innerHeight - 0.5;

  heroLayers.forEach((layer) => {
    const depth = Number(layer.dataset.depth) || 0.1;
    layer.style.setProperty('--tx', `${(x * depth * 58).toFixed(2)}px`);
    layer.style.setProperty('--ty', `${(y * depth * 44).toFixed(2)}px`);
  });

  interactiveCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const dx = (pointer.x - (rect.left + rect.width / 2)) / rect.width;
    const dy = (pointer.y - (rect.top + rect.height / 2)) / rect.height;

    if (Math.abs(dx) > 1.2 || Math.abs(dy) > 1.2) {
      card.style.removeProperty('transform');
      return;
    }

    card.style.transform = `translateY(-2px) rotateX(${(-dy * 2.5).toFixed(2)}deg) rotateY(${(dx * 3).toFixed(2)}deg)`;
  });
};

const requestPointerMotion = () => {
  if (!pointerRaf) pointerRaf = requestAnimationFrame(updatePointerMotion);
};

window.addEventListener(
  'mousemove',
  (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    requestPointerMotion();
  },
  { passive: true },
);

window.addEventListener('mouseleave', () => {
  pointer.active = false;
  interactiveCards.forEach((card) => {
    card.style.removeProperty('transform');
  });
});

if (heroVisual && floatCards.length > 0) {
  const heroPointer = { x: 0, y: 0, inside: false };
  const dragState = { card: null, startX: 0, startY: 0, dragX: 0, dragY: 0 };
  let motionRaf = 0;

  const cardStates = Array.from(floatCards).map((card, index) => ({
    node: card,
    intensity: Number(card.dataset.intensity) || 0.7,
    amplitude: 3 + index * 2,
    duration: 7400 + index * 900,
    phase: index * 1.5,
    dragX: 0,
    dragY: 0,
    hoverX: 0,
    hoverY: 0,
    rotateX: 0,
    rotateY: 0,
  }));

  const clampDrag = (state, nextX, nextY) => {
    const heroBounds = heroVisual.getBoundingClientRect();
    const cardBounds = state.node.getBoundingClientRect();
    const baseLeft = state.node.offsetLeft;
    const baseTop = state.node.offsetTop;
    const visibleX = cardBounds.width * 0.34;
    const visibleY = cardBounds.height * 0.34;

    return {
      x: Math.min(heroBounds.width - baseLeft - visibleX, Math.max(-baseLeft - cardBounds.width + visibleX, nextX)),
      y: Math.min(heroBounds.height - baseTop - visibleY, Math.max(-baseTop - cardBounds.height + visibleY, nextY)),
    };
  };

  const animateCards = (time) => {
    const heroBounds = heroVisual.getBoundingClientRect();

    cardStates.forEach((state) => {
      const cycle = ((time % state.duration) / state.duration) * Math.PI * 2;
      const floatY = Math.sin(cycle + state.phase) * state.amplitude;
      const cardBounds = state.node.getBoundingClientRect();

      let targetX = 0;
      let targetY = 0;
      if (heroPointer.inside) {
        const centerX = cardBounds.left + cardBounds.width / 2;
        const centerY = cardBounds.top + cardBounds.height / 2;
        targetX = Math.max(-1, Math.min(1, (heroPointer.x - centerX) / heroBounds.width));
        targetY = Math.max(-1, Math.min(1, (heroPointer.y - centerY) / heroBounds.height));
      }

      state.hoverX += (targetX - state.hoverX) * 0.1;
      state.hoverY += (targetY - state.hoverY) * 0.1;
      state.rotateY += (state.hoverX * (1.3 * state.intensity) - state.rotateY) * 0.14;
      state.rotateX += (state.hoverY * (-1.2 * state.intensity) - state.rotateX) * 0.14;

      state.node.style.setProperty('--float-y', `${floatY.toFixed(2)}px`);
      state.node.style.setProperty('--drag-x', `${state.dragX.toFixed(2)}px`);
      state.node.style.setProperty('--drag-y', `${state.dragY.toFixed(2)}px`);
      state.node.style.setProperty('--mx', `${(state.hoverX * (10 * state.intensity)).toFixed(2)}px`);
      state.node.style.setProperty('--my', `${(state.hoverY * (8 * state.intensity)).toFixed(2)}px`);
      state.node.style.setProperty('--rx', `${state.rotateX.toFixed(2)}deg`);
      state.node.style.setProperty('--ry', `${state.rotateY.toFixed(2)}deg`);
    });

    motionRaf = requestAnimationFrame(animateCards);
  };

  heroVisual.addEventListener('mousemove', (event) => {
    heroPointer.x = event.clientX;
    heroPointer.y = event.clientY;
    heroPointer.inside = true;
  });

  heroVisual.addEventListener('mouseleave', () => {
    heroPointer.inside = false;
  });

  document.addEventListener('mousemove', (event) => {
    if (!dragState.card) return;

    const state = cardStates.find((item) => item.node === dragState.card);
    if (!state) return;

    const nextX = dragState.dragX + (event.clientX - dragState.startX);
    const nextY = dragState.dragY + (event.clientY - dragState.startY);
    const clamped = clampDrag(state, nextX, nextY);
    state.dragX = clamped.x;
    state.dragY = clamped.y;

    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
  });

  document.addEventListener('mouseup', () => {
    if (!dragState.card) return;
    dragState.card.classList.remove('is-dragging');
    dragState.card = null;
  });

  cardStates.forEach((state) => {
    state.node.addEventListener('mousedown', (event) => {
      event.preventDefault();
      dragState.card = state.node;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.dragX = state.dragX;
      dragState.dragY = state.dragY;
      state.node.classList.add('is-dragging');
    });
  });

  const stopMotion = () => {
    if (!motionRaf) return;
    cancelAnimationFrame(motionRaf);
    motionRaf = 0;
  };

  if (!prefersReducedMotion.matches) {
    motionRaf = requestAnimationFrame(animateCards);
  }

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      stopMotion();
      return;
    }

    if (!motionRaf) motionRaf = requestAnimationFrame(animateCards);
  });
}
