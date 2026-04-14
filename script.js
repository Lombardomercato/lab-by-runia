document.documentElement.classList.add('js');

const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const parallaxMedia = document.querySelectorAll('.project-media, .cta-inner');
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const heroVisual = document.querySelector('.hero-visual');
const cards = document.querySelectorAll('.floating-card');
const heroLayers = document.querySelectorAll('.hero-bg [data-depth]');
const tiltCards = document.querySelectorAll('.tilt, .project');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const pointerState = { x: 0, y: 0, active: false };
let pointerFrame = 0;

const setRevealSequence = () => {
  sections.forEach((section) => {
    const sequence = section.querySelectorAll('.reveal');
    sequence.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * 95}ms`);
    });
  });
});

setRevealSequence();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');

        const parentSection = entry.target.closest('.section');
        if (parentSection) parentSection.classList.add('is-inview');

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -32px 0px' },
);

revealElements.forEach((item) => revealObserver.observe(item));

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

const onScroll = () => {
  const scrollY = window.scrollY;

  if (navbar) {
    navbar.classList.toggle('is-scrolled', scrollY > 14);
  }

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const progress = 1 - Math.min(1, Math.abs(rect.top) / window.innerHeight);
    section.style.setProperty('--section-shift', `${(Math.max(0, progress) * 8).toFixed(2)}px`);
  });

  parallaxMedia.forEach((element, index) => {
    const depth = (index + 2) * 0.013;
    element.style.setProperty('--parallax-y', `${(scrollY * depth).toFixed(2)}px`);
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const updateMouseMotion = () => {
  pointerFrame = 0;

  if (prefersReducedMotion.matches || !pointerState.active) {
    return;
  }

  const x = pointerState.x / window.innerWidth - 0.5;
  const y = pointerState.y / window.innerHeight - 0.5;

  heroLayers.forEach((layer) => {
    const depth = Number(layer.dataset.depth) || 0.1;
    layer.style.setProperty('--tx', `${(x * depth * 58).toFixed(2)}px`);
    layer.style.setProperty('--ty', `${(y * depth * 44).toFixed(2)}px`);
  });

  tiltCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const dx = (pointerState.x - (rect.left + rect.width / 2)) / rect.width;
    const dy = (pointerState.y - (rect.top + rect.height / 2)) / rect.height;

    if (Math.abs(dx) > 1.2 || Math.abs(dy) > 1.2) {
      card.style.removeProperty('--hover-x');
      card.style.removeProperty('--hover-y');
      return;
    }

    card.style.setProperty('--hover-x', `${(dx * 4).toFixed(2)}px`);
    card.style.setProperty('--hover-y', `${(dy * 4).toFixed(2)}px`);
  });
};

const requestMouseMotion = () => {
  if (!pointerFrame) {
    pointerFrame = requestAnimationFrame(updateMouseMotion);
  }
};

window.addEventListener(
  'mousemove',
  (event) => {
    pointerState.x = event.clientX;
    pointerState.y = event.clientY;
    pointerState.active = true;
    requestMouseMotion();
  },
  { passive: true },
);

window.addEventListener('mouseleave', () => {
  pointerState.active = false;

  tiltCards.forEach((card) => {
    card.style.removeProperty('--hover-x');
    card.style.removeProperty('--hover-y');
  });
});

if (heroVisual && cards.length > 0) {
  const pointer = { x: 0, y: 0, inside: false };
  const dragState = { card: null, startPointerX: 0, startPointerY: 0, startDragX: 0, startDragY: 0 };
  let animationFrameId = 0;

  const cardStates = Array.from(cards).map((card, index) => ({
    node: card,
    intensity: Number(card.dataset.intensity) || 0.7,
    amplitude: 3 + index * 2,
    duration: 7200 + index * 850,
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
    const minVisibleX = cardBounds.width * 0.34;
    const minVisibleY = cardBounds.height * 0.34;

    return {
      x: Math.min(heroBounds.width - baseLeft - minVisibleX, Math.max(-baseLeft - cardBounds.width + minVisibleX, nextX)),
      y: Math.min(heroBounds.height - baseTop - minVisibleY, Math.max(-baseTop - cardBounds.height + minVisibleY, nextY)),
    };
  };

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

  document.addEventListener('mousemove', (event) => {
    if (!dragState.card) return;

    const state = cardStates.find((item) => item.node === dragState.card);
    if (!state) return;

    const nextX = dragState.startDragX + (event.clientX - dragState.startPointerX);
    const nextY = dragState.startDragY + (event.clientY - dragState.startPointerY);
    const clamped = clampDrag(state, nextX, nextY);
    state.dragX = clamped.x;
    state.dragY = clamped.y;
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
      dragState.startPointerX = event.clientX;
      dragState.startPointerY = event.clientY;
      dragState.startDragX = state.dragX;
      dragState.startDragY = state.dragY;
      state.node.classList.add('is-dragging');
    });
  });

  const stopMotionLoop = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
  };

  if (!prefersReducedMotion.matches) {
    animationFrameId = requestAnimationFrame(animateCards);
  }

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      stopMotionLoop();
      return;
    }

    animationFrameId = requestAnimationFrame(animateCards);
  });

  if (!mediaReduce.matches) {
    requestAnimationFrame(animate);
  }
}
