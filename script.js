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

if (heroVisual && panels.length > 0) {
  const pointer = { x: 0, y: 0, inside: false };
  const dragState = {
    card: null,
    startPointerX: 0,
    startPointerY: 0,
    startDragX: 0,
    startDragY: 0,
  };
  let animationFrameId = 0;

  const panelStates = Array.from(panels).map((panel, index) => ({
    node: panel,
    intensity: Number(panel.dataset.intensity) || 0.65,
    amplitude: 3 + index * 2,
    duration: 7600 + index * 900,
    phase: index * 1.6,
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
    const minVisibleX = cardBounds.width * 0.35;
    const minVisibleY = cardBounds.height * 0.35;

    const minX = -baseLeft - cardBounds.width + minVisibleX;
    const maxX = heroBounds.width - baseLeft - minVisibleX;
    const minY = -baseTop - cardBounds.height + minVisibleY;
    const maxY = heroBounds.height - baseTop - minVisibleY;

    return {
      x: Math.min(maxX, Math.max(minX, nextX)),
      y: Math.min(maxY, Math.max(minY, nextY)),
    };
  };

  const animatePanels = (time) => {
    const heroBounds = heroVisual.getBoundingClientRect();

    panelStates.forEach((state) => {
      const { node, intensity, amplitude, duration, phase, dragX, dragY } = state;
      const cycle = ((time % duration) / duration) * Math.PI * 2;
      const floatY = Math.sin(cycle + phase) * amplitude;
      const cardBounds = node.getBoundingClientRect();

      let targetHoverX = 0;
      let targetHoverY = 0;
      if (pointer.inside) {
        const centerX = cardBounds.left + cardBounds.width / 2;
        const centerY = cardBounds.top + cardBounds.height / 2;
        const relativeX = (pointer.x - centerX) / heroBounds.width;
        const relativeY = (pointer.y - centerY) / heroBounds.height;
        targetHoverX = Math.max(-1, Math.min(1, relativeX));
        targetHoverY = Math.max(-1, Math.min(1, relativeY));
      }

      state.hoverX += (targetHoverX - state.hoverX) * 0.1;
      state.hoverY += (targetHoverY - state.hoverY) * 0.1;
      state.rotateY += (state.hoverX * (1.4 * intensity) - state.rotateY) * 0.14;
      state.rotateX += (state.hoverY * (-1.3 * intensity) - state.rotateX) * 0.14;

      const moveX = state.hoverX * (12 * intensity);
      const moveY = state.hoverY * (9 * intensity);

      node.style.setProperty('--float-y', `${floatY.toFixed(2)}px`);
      node.style.setProperty('--drag-x', `${dragX.toFixed(2)}px`);
      node.style.setProperty('--drag-y', `${dragY.toFixed(2)}px`);
      node.style.setProperty('--mx', `${moveX.toFixed(2)}px`);
      node.style.setProperty('--my', `${moveY.toFixed(2)}px`);
      node.style.setProperty('--rx', `${state.rotateX.toFixed(2)}deg`);
      node.style.setProperty('--ry', `${state.rotateY.toFixed(2)}deg`);
    });

    animationFrameId = requestAnimationFrame(animatePanels);
  };

  const onHeroMove = (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.inside = true;
  };

  const onHeroLeave = () => {
    pointer.inside = false;
  };

  const onPointerMove = (event) => {
    if (!dragState.card) return;

    const state = panelStates.find((item) => item.node === dragState.card);
    if (!state) return;

    const rawX = dragState.startDragX + (event.clientX - dragState.startPointerX);
    const rawY = dragState.startDragY + (event.clientY - dragState.startPointerY);
    const clamped = clampDrag(state, rawX, rawY);
    state.dragX = clamped.x;
    state.dragY = clamped.y;
    state.node.style.setProperty('--drag-x', `${state.dragX.toFixed(2)}px`);
    state.node.style.setProperty('--drag-y', `${state.dragY.toFixed(2)}px`);
  };

  const stopDragging = () => {
    if (!dragState.card) return;
    dragState.card.classList.remove('is-dragging');
    dragState.card = null;
  };

  panelStates.forEach((state) => {
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

  const clearPanelMotionVars = () => {
    panels.forEach((panel) => {
      panel.style.removeProperty('--float-y');
      panel.style.removeProperty('--mx');
      panel.style.removeProperty('--my');
      panel.style.removeProperty('--rx');
      panel.style.removeProperty('--ry');
    });
  };

  const startMotionLoop = () => {
    if (!animationFrameId && !prefersReducedMotion.matches) {
      animationFrameId = requestAnimationFrame(animatePanels);
    }
  };

  const stopMotionLoop = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
    clearPanelMotionVars();
  };

  heroVisual.addEventListener('mousemove', onHeroMove);
  heroVisual.addEventListener('mouseleave', onHeroLeave);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', stopDragging);
  startMotionLoop();

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      stopMotionLoop();
      return;
    }
    startMotionLoop();
  });
}
