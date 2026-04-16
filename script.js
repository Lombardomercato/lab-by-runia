document.documentElement.classList.add('js');

const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const parallaxTargets = document.querySelectorAll('.cta-inner');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const heroVisual = document.querySelector('.hero-visual');
const floatCards = document.querySelectorAll('.float-card');
const globalParticleField = document.querySelector('.global-particle-field');
const interactiveCards = document.querySelectorAll('.tilt, .project, .interactive-surface');
const magneticButtons = document.querySelectorAll('.magnetic');
const spotReactive = document.querySelectorAll('.interactive-surface');
const motionTitles = document.querySelectorAll('.motion-title');
const premiumSpotTitles = document.querySelectorAll('.hero h1, .section-head > h2, .showcase-content > h2, .cta h2');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileCardsMedia = window.matchMedia('(max-width: 980px), (pointer: coarse)');
const showcaseSlides = document.querySelectorAll('[data-showcase-slide]');

const splitTitles = () => {
  motionTitles.forEach((title) => {
    if (title.dataset.split === 'true' || title.dataset.noSplit === 'true') return;

    const text = title.textContent || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;

    title.textContent = '';
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.style.setProperty('--word-delay', `${index * 38}ms`);
      span.textContent = word;
      title.appendChild(span);
      if (index < words.length - 1) {
        title.append(' ');
      }
    });

    title.dataset.split = 'true';
  });
};

splitTitles();

const initInteractiveHighlights = () => {
  const highlights = document.querySelectorAll('.hero-highlight, .section-highlight, .subtle-highlight');
  highlights.forEach((highlight) => {
    const normalizedText = (highlight.textContent || '').trim().replace(/\s+/g, ' ');
    if (!normalizedText) return;

    highlight.classList.add('interactive-highlight');
    highlight.setAttribute('data-highlight-text', normalizedText);
    highlight.style.setProperty('--highlight-x', '50%');
    highlight.style.setProperty('--highlight-y', '50%');
    highlight.style.setProperty('--highlight-alpha', '0');
    highlight.style.setProperty('--highlight-glow-alpha', '0');

    if (prefersReducedMotion.matches) return;

    const styles = getComputedStyle(highlight);
    const followLerp = Number.parseFloat(styles.getPropertyValue('--highlight-follow')) || 0.16;
    const fadeLerpIn = Number.parseFloat(styles.getPropertyValue('--highlight-fade-in')) || 0.105;
    const fadeLerpOut = Number.parseFloat(styles.getPropertyValue('--highlight-fade-out')) || 0.075;
    const maxAlpha = Number.parseFloat(styles.getPropertyValue('--highlight-max-alpha')) || 0.92;
    const glowScale = Number.parseFloat(styles.getPropertyValue('--highlight-glow-scale')) || 0.72;
    const settleThreshold = Number.parseFloat(styles.getPropertyValue('--highlight-settle-threshold')) || 0.14;
    const state = { x: 0, y: 0, tx: 0, ty: 0, alpha: 0, targetAlpha: 0, raf: 0, initialized: false };

    const render = () => {
      state.raf = 0;
      const dx = state.tx - state.x;
      const dy = state.ty - state.y;
      const distance = Math.hypot(dx, dy);
      const adaptiveFollow = Math.min(0.24, followLerp + distance * 0.0012);
      const fadeLerp = state.targetAlpha > state.alpha ? fadeLerpIn : fadeLerpOut;

      state.x += dx * adaptiveFollow;
      state.y += dy * adaptiveFollow;
      state.alpha += (state.targetAlpha - state.alpha) * fadeLerp;

      highlight.style.setProperty('--highlight-x', `${state.x.toFixed(2)}px`);
      highlight.style.setProperty('--highlight-y', `${state.y.toFixed(2)}px`);
      highlight.style.setProperty('--highlight-alpha', state.alpha.toFixed(3));
      highlight.style.setProperty('--highlight-glow-alpha', (state.alpha * glowScale).toFixed(3));

      if (Math.abs(state.tx - state.x) > settleThreshold || Math.abs(state.ty - state.y) > settleThreshold || state.alpha > 0.015) {
        state.raf = requestAnimationFrame(render);
      }
    };

    const requestRender = () => {
      if (!state.raf) state.raf = requestAnimationFrame(render);
    };

    const syncFromEvent = (event) => {
      const rect = highlight.getBoundingClientRect();
      state.tx = event.clientX - rect.left;
      state.ty = event.clientY - rect.top;
      if (!state.initialized) {
        state.x = state.tx;
        state.y = state.ty;
        state.initialized = true;
      }
    };

    highlight.addEventListener('pointerenter', (event) => {
      syncFromEvent(event);
      state.targetAlpha = maxAlpha;
      requestRender();
    });

    highlight.addEventListener('pointermove', (event) => {
      syncFromEvent(event);
      state.targetAlpha = maxAlpha;
      requestRender();
    });

    highlight.addEventListener('pointerleave', () => {
      state.targetAlpha = 0;
      requestRender();
    });
  });
};

initInteractiveHighlights();

const setRevealDelay = () => {
  sections.forEach((section) => {
    const items = section.querySelectorAll('.reveal');
    items.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * 70}ms`);
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
  { threshold: 0.14, rootMargin: '0px 0px -40px 0px' },
);

revealElements.forEach((node) => revealObserver.observe(node));

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

const applyScrollMotion = () => {
  if (navbar) {
    navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  parallaxTargets.forEach((element, index) => {
    const depth = (index + 2) * 0.006;
    element.style.setProperty('--parallax-y', `${(window.scrollY * depth).toFixed(2)}px`);
  });

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight || 1;
    const progress = (rect.top + rect.height * 0.5 - windowH * 0.5) / windowH;
    section.style.setProperty('--section-shift', `${(progress * (1 + index * 0.3)).toFixed(2)}px`);
  });
};

window.addEventListener('scroll', applyScrollMotion, { passive: true });
applyScrollMotion();

if (showcaseSlides.length > 1) {
  let activeSlide = 0;
  const slideInterval = 5000;

  const setActiveSlide = (index) => {
    showcaseSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
  };

  setActiveSlide(activeSlide);

  if (!prefersReducedMotion.matches) {
    window.setInterval(() => {
      activeSlide = (activeSlide + 1) % showcaseSlides.length;
      setActiveSlide(activeSlide);
    }, slideInterval);
  }
}

let pointerRaf = 0;
const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3, active: false };
const spotState = { x: 50, y: 20, tx: 50, ty: 20, opacity: 0, targetOpacity: 0 };

const updatePointerMotion = () => {
  pointerRaf = 0;
  if (prefersReducedMotion.matches) return;

  const x = pointer.x / window.innerWidth - 0.5;
  const y = pointer.y / window.innerHeight - 0.5;

  interactiveCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const dx = (pointer.x - (rect.left + rect.width / 2)) / rect.width;
    const dy = (pointer.y - (rect.top + rect.height / 2)) / rect.height;

    if (Math.abs(dx) > 1.2 || Math.abs(dy) > 1.2) {
      if (card.classList.contains('tilt')) card.style.removeProperty('transform');
      return;
    }

    if (card.classList.contains('tilt')) {
      card.style.transform = `translateY(-1px) rotateX(${(-dy * 1.2).toFixed(2)}deg) rotateY(${(dx * 1.6).toFixed(2)}deg)`;
    }
  });

  spotState.x += (spotState.tx - spotState.x) * 0.1;
  spotState.y += (spotState.ty - spotState.y) * 0.1;
  spotState.opacity += (spotState.targetOpacity - spotState.opacity) * 0.1;

  document.body.style.setProperty('--spot-x', `${spotState.x.toFixed(2)}%`);
  document.body.style.setProperty('--spot-y', `${spotState.y.toFixed(2)}%`);
  document.body.style.setProperty('--spot-opacity', spotState.opacity.toFixed(3));
  document.body.style.setProperty('--spot-soft', (spotState.opacity * 0.88).toFixed(3));

  if (pointer.active || spotState.opacity > 0.02) {
    requestPointerMotion();
  }
};

const requestPointerMotion = () => {
  if (!pointerRaf) pointerRaf = requestAnimationFrame(updatePointerMotion);
};

window.addEventListener('mousemove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
  requestPointerMotion();

  document.body.style.setProperty('--spot-x', `${((event.clientX / window.innerWidth) * 100).toFixed(2)}%`);
  document.body.style.setProperty('--spot-y', `${((event.clientY / window.innerHeight) * 100).toFixed(2)}%`);
  spotState.tx = (event.clientX / window.innerWidth) * 100;
  spotState.ty = (event.clientY / window.innerHeight) * 100;
  spotState.targetOpacity = 0.24;
}, { passive: true });

window.addEventListener('mouseleave', () => {
  pointer.active = false;
  spotState.targetOpacity = 0;
  interactiveCards.forEach((card) => {
    if (card.classList.contains('tilt')) card.style.removeProperty('transform');
  });
});

spotReactive.forEach((surface) => {
  surface.addEventListener('pointermove', (event) => {
    const rect = surface.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    surface.style.setProperty('--ix', `${x.toFixed(2)}%`);
    surface.style.setProperty('--iy', `${y.toFixed(2)}%`);
  }, { passive: true });
});

const initParticleSystem = (field, amount = 16, strength = 1) => {
  if (!field || prefersReducedMotion.matches) return;

  const particles = [];
  const interactionRadius = 170 * strength;
  const pointerState = { x: 0, y: 0, inside: false, vx: 0, vy: 0 };
  let particleRaf = 0;
  let fieldRect = field.getBoundingClientRect();
  let lastTick = performance.now();

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  const createParticle = () => {
    const node = document.createElement('span');
    node.className = 'particle';
    field.appendChild(node);

    const depth = randomBetween(0.7, 1.35);
    const size = randomBetween(2.8, 9.6) * depth * 0.7;
    node.style.setProperty('--particle-size', `${size.toFixed(2)}px`);
    node.style.setProperty('--particle-opacity', `${randomBetween(0.08, 0.22).toFixed(3)}`);
    node.style.setProperty('--particle-blur', `${(1 - depth * 0.36).toFixed(2)}px`);

    const homeX = Math.random() * fieldRect.width;
    const homeY = Math.random() * fieldRect.height;

    particles.push({
      node,
      depth,
      homeX,
      homeY,
      x: homeX,
      y: homeY,
      vx: randomBetween(-0.12, 0.12),
      vy: randomBetween(-0.08, 0.08),
      driftX: randomBetween(-0.3, 0.3) * depth,
      driftY: randomBetween(-0.14, 0.2) * depth,
      orbitX: randomBetween(16, 52) * depth,
      orbitY: randomBetween(12, 36) * depth,
      phase: Math.random() * Math.PI * 2,
      speed: randomBetween(0.12, 0.38),
    });
  };

  const resetField = () => {
    fieldRect = field.getBoundingClientRect();
  };

  const tickParticles = (time) => {
    const dt = Math.min(34, time - lastTick) / 16.67;
    lastTick = time;

    particles.forEach((particle) => {
      const t = time * 0.001 * particle.speed + particle.phase;
      const homeX = particle.homeX + Math.cos(t) * particle.orbitX;
      const homeY = particle.homeY + Math.sin(t) * particle.orbitY;

      particle.vx += (homeX - particle.x) * 0.018;
      particle.vy += (homeY - particle.y) * 0.018;
      particle.vx += particle.driftX * 0.008;
      particle.vy += particle.driftY * 0.008;

      if (pointerState.inside) {
        const dx = particle.x - pointerState.x;
        const dy = particle.y - pointerState.y;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < interactionRadius) {
          const power = (1 - distance / interactionRadius) * (0.94 + particle.depth * 0.36) * strength;
          particle.vx += (dx / distance) * power + pointerState.vx * 0.08;
          particle.vy += (dy / distance) * power + pointerState.vy * 0.08;
        }
      }

      particle.vx *= 0.91;
      particle.vy *= 0.91;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      if (particle.x < -36) particle.x = fieldRect.width + 36;
      if (particle.x > fieldRect.width + 36) particle.x = -36;
      if (particle.y < -36) particle.y = fieldRect.height + 36;
      if (particle.y > fieldRect.height + 36) particle.y = -36;

      particle.node.style.setProperty('--particle-x', `${particle.x.toFixed(2)}px`);
      particle.node.style.setProperty('--particle-y', `${particle.y.toFixed(2)}px`);
    });

    pointerState.vx *= 0.9;
    pointerState.vy *= 0.9;

    particleRaf = requestAnimationFrame(tickParticles);
  };

  for (let i = 0; i < amount; i += 1) createParticle();

  window.addEventListener('mousemove', (event) => {
    const localX = event.clientX - fieldRect.left;
    const localY = event.clientY - fieldRect.top;

    pointerState.vx = localX - pointerState.x;
    pointerState.vy = localY - pointerState.y;
    pointerState.x = localX;
    pointerState.y = localY;
    pointerState.inside = localX >= -40 && localX <= fieldRect.width + 40 && localY >= -40 && localY <= fieldRect.height + 40;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    pointerState.inside = false;
  });

  window.addEventListener('resize', resetField, { passive: true });
  particleRaf = requestAnimationFrame(tickParticles);
};

initParticleSystem(globalParticleField, 22, 0.62);

if (heroVisual && floatCards.length > 0) {
  const isMobileLike = mobileCardsMedia.matches;
  const heroPointer = { x: 0, y: 0, inside: false };
  const dragState = {
    card: null,
    pointerId: null,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  };

  let zCounter = floatCards.length + 1;
  let motionRaf = 0;
  let lastFrame = performance.now();

  const cardStates = Array.from(floatCards).map((card, index) => {
    const scale = Number(getComputedStyle(card).getPropertyValue('--scale')) || 1;
    return {
      node: card,
      intensity: Number(card.dataset.intensity) || 0.7,
      amplitude: (isMobileLike ? 7.4 : 3.4) + index * (isMobileLike ? 2 : 1.6),
      duration: (isMobileLike ? 9800 : 7600) + index * (isMobileLike ? 1120 : 850),
      phase: Math.random() * Math.PI * 2,
      depthFactor: (isMobileLike ? 0.32 : 0.45) + index * (isMobileLike ? 0.24 : 0.32),
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      width: 0,
      height: 0,
      baseLeft: card.offsetLeft,
      baseTop: card.offsetTop,
      scale,
      hoverX: 0,
      hoverY: 0,
      rotateX: 0,
      rotateY: 0,
      parallaxX: 0,
      parallaxY: 0,
      floating: 0,
      isDragging: false,
      zIndex: zCounter + index,
      radiusPad: 84,
    };
  });

  const getStateByNode = (node) => cardStates.find((item) => item.node === node);

  const updateBounds = () => {
    cardStates.forEach((state) => {
      state.width = state.node.offsetWidth * state.scale;
      state.height = state.node.offsetHeight * state.scale;
      state.baseLeft = state.node.offsetLeft;
      state.baseTop = state.node.offsetTop;
    });
  };

  const applySoftBounds = (state) => {
    const maxX = heroVisual.clientWidth - state.baseLeft - state.width + state.radiusPad;
    const minX = -state.baseLeft - state.radiusPad;
    const maxY = heroVisual.clientHeight - state.baseTop - state.height + state.radiusPad;
    const minY = -state.baseTop - state.radiusPad;

    if (state.x > maxX) {
      const overflow = state.x - maxX;
      state.x = maxX + overflow * 0.18;
      state.vx -= overflow * 0.08;
    } else if (state.x < minX) {
      const overflow = minX - state.x;
      state.x = minX - overflow * 0.18;
      state.vx += overflow * 0.08;
    }

    if (state.y > maxY) {
      const overflow = state.y - maxY;
      state.y = maxY + overflow * 0.18;
      state.vy -= overflow * 0.08;
    } else if (state.y < minY) {
      const overflow = minY - state.y;
      state.y = minY - overflow * 0.18;
      state.vy += overflow * 0.08;
    }
  };

  const elevateCard = (state) => {
    zCounter += 1;
    state.zIndex = zCounter;
    state.node.style.setProperty('--z-card', String(state.zIndex));
  };

  const animateCards = (time) => {
    const delta = Math.min(34, time - lastFrame);
    lastFrame = time;

    cardStates.forEach((state) => {
      if (!state.isDragging) {
        state.x += state.vx * (delta / 16.67);
        state.y += state.vy * (delta / 16.67);
        state.vx *= 0.9;
        state.vy *= 0.9;
        if (Math.abs(state.vx) < 0.02) state.vx = 0;
        if (Math.abs(state.vy) < 0.02) state.vy = 0;
      }

      applySoftBounds(state);
    });

    cardStates.forEach((state) => {
      const cycle = ((time % state.duration) / state.duration) * Math.PI * 2;
      const floatY = state.isDragging ? 0 : Math.sin(cycle + state.phase) * state.amplitude;
      state.floating += (floatY - state.floating) * 0.18;

      let targetX = 0;
      let targetY = 0;
      let targetParallaxX = 0;
      let targetParallaxY = 0;

      if (heroPointer.inside) {
        const centerX = state.baseLeft + state.x + state.width / 2;
        const centerY = state.baseTop + state.y + state.height / 2;
        targetX = Math.max(-1, Math.min(1, (heroPointer.x - centerX) / heroVisual.clientWidth));
        targetY = Math.max(-1, Math.min(1, (heroPointer.y - centerY) / heroVisual.clientHeight));

        const heroX = Math.max(-1, Math.min(1, (heroPointer.x / heroVisual.clientWidth - 0.5) * 2));
        const heroY = Math.max(-1, Math.min(1, (heroPointer.y / heroVisual.clientHeight - 0.5) * 2));
        targetParallaxX = heroX * (6.2 * state.depthFactor) * state.intensity;
        targetParallaxY = heroY * (4.6 * state.depthFactor) * state.intensity;
      }

      state.hoverX += (targetX - state.hoverX) * 0.14;
      state.hoverY += (targetY - state.hoverY) * 0.14;
      state.parallaxX += (targetParallaxX - state.parallaxX) * 0.12;
      state.parallaxY += (targetParallaxY - state.parallaxY) * 0.12;

      const maxRotate = 1.8 + state.depthFactor * 1.4;
      state.rotateY += (state.hoverX * maxRotate - state.rotateY) * 0.14;
      state.rotateX += (state.hoverY * -maxRotate - state.rotateX) * 0.14;

      const shadowX = (-state.parallaxX * 1.8).toFixed(2);
      const shadowY = (24 - state.parallaxY * 1.2).toFixed(2);

      state.node.style.setProperty('--drag-x', `${state.x.toFixed(2)}px`);
      state.node.style.setProperty('--drag-y', `${state.y.toFixed(2)}px`);
      state.node.style.setProperty('--float-y', `${state.floating.toFixed(2)}px`);
      state.node.style.setProperty('--mx', `${state.parallaxX.toFixed(2)}px`);
      state.node.style.setProperty('--my', `${state.parallaxY.toFixed(2)}px`);
      state.node.style.setProperty('--rx', `${state.rotateX.toFixed(2)}deg`);
      state.node.style.setProperty('--ry', `${state.rotateY.toFixed(2)}deg`);
      state.node.style.setProperty('--shadow-x', `${shadowX}px`);
      state.node.style.setProperty('--shadow-y', `${shadowY}px`);
    });

    motionRaf = requestAnimationFrame(animateCards);
  };

  const startDrag = (event, state) => {
    if (prefersReducedMotion.matches) return;

    state.isDragging = true;
    dragState.card = state.node;
    dragState.pointerId = event.pointerId;

    const heroRect = heroVisual.getBoundingClientRect();
    dragState.pointerOffsetX = event.clientX - (heroRect.left + state.baseLeft + state.x);
    dragState.pointerOffsetY = event.clientY - (heroRect.top + state.baseTop + state.y);
    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
    dragState.lastTime = performance.now();

    state.vx = 0;
    state.vy = 0;

    elevateCard(state);
    state.node.classList.add('is-dragging');
    state.node.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragState.card || dragState.pointerId !== event.pointerId) return;

    const state = getStateByNode(dragState.card);
    if (!state) return;

    const heroRect = heroVisual.getBoundingClientRect();
    state.x = event.clientX - heroRect.left - state.baseLeft - dragState.pointerOffsetX;
    state.y = event.clientY - heroRect.top - state.baseTop - dragState.pointerOffsetY;

    const now = performance.now();
    const dt = Math.max(8, now - dragState.lastTime);
    state.vx = ((event.clientX - dragState.lastX) / dt) * 15;
    state.vy = ((event.clientY - dragState.lastY) / dt) * 15;

    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
    dragState.lastTime = now;

    applySoftBounds(state);
  };

  const endDrag = (event) => {
    if (!dragState.card || dragState.pointerId !== event.pointerId) return;

    const state = getStateByNode(dragState.card);
    if (state) {
      state.isDragging = false;
      state.vx *= 1.35;
      state.vy *= 1.35;
      state.node.classList.remove('is-dragging');
      state.node.releasePointerCapture(event.pointerId);
    }

    dragState.card = null;
    dragState.pointerId = null;
  };

  heroVisual.addEventListener('pointermove', (event) => {
    const rect = heroVisual.getBoundingClientRect();
    heroPointer.x = event.clientX - rect.left;
    heroPointer.y = event.clientY - rect.top;
    heroPointer.inside = true;
    moveDrag(event);
  });
  window.addEventListener('pointermove', moveDrag, { passive: true });

  heroVisual.addEventListener('pointerleave', () => {
    heroPointer.inside = false;
  });

  heroVisual.addEventListener('pointerup', endDrag);
  heroVisual.addEventListener('pointercancel', endDrag);

  cardStates.forEach((state) => {
    state.node.style.setProperty('--z-card', String(state.zIndex));

    state.node.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      startDrag(event, state);
    });
  });

  const handleResize = () => {
    updateBounds();
    cardStates.forEach((state) => applySoftBounds(state));
  };

  updateBounds();
  window.addEventListener('resize', handleResize, { passive: true });

  if (!prefersReducedMotion.matches) {
    motionRaf = requestAnimationFrame(animateCards);
  }
}


const showcaseSlider = document.querySelector('[data-showcase-slider]');

if (showcaseSlider) {
  const slides = Array.from(showcaseSlider.querySelectorAll('[data-showcase-slide]'));
  const reduced = prefersReducedMotion.matches;
  const cycleMs = 5200;
  const pointerState = { x: 0.5, y: 0.5, inside: false };
  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  let autoplayId = null;
  let showcaseRaf = 0;
  let startTime = performance.now();

  if (activeIndex < 0) activeIndex = 0;

  const applyLayerState = (slide, progress) => {
    const media = slide.querySelector('.showcase-media');
    const glow = slide.querySelector('.showcase-glow');
    const content = slide.querySelector('.showcase-content');
    if (!media || !glow || !content) return;

    const nx = (pointerState.x - 0.5) * 2;
    const ny = (pointerState.y - 0.5) * 2;
    const influence = pointerState.inside ? 1 : 0.36;

    const parallaxX = nx * 7.5 * influence;
    const parallaxY = ny * 6.5 * influence;
    const contentY = ny * 2.1 * influence;
    const glowX = 50 + nx * 18;
    const glowY = 46 + ny * 14;
    const livingZoom = 1 + Math.sin(progress * Math.PI * 2) * 0.008 + 0.018;

    media.style.setProperty('--parallax-x', `${parallaxX.toFixed(2)}px`);
    media.style.setProperty('--parallax-y', `${parallaxY.toFixed(2)}px`);
    media.style.setProperty('--zoom', livingZoom.toFixed(4));
    glow.style.setProperty('--glow-x', `${glowX.toFixed(2)}%`);
    glow.style.setProperty('--glow-y', `${glowY.toFixed(2)}%`);
    glow.style.setProperty('--glow-alpha', (pointerState.inside ? 0.23 : 0.16).toFixed(3));
    content.style.setProperty('--content-y', `${contentY.toFixed(2)}px`);
  };

  const setActiveSlide = (nextIndex) => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === nextIndex);
    });
    activeIndex = nextIndex;
    startTime = performance.now();
  };

  const goNext = () => {
    setActiveSlide((activeIndex + 1) % slides.length);
  };

  const resetAutoplay = () => {
    if (autoplayId) window.clearInterval(autoplayId);
    if (!reduced) {
      autoplayId = window.setInterval(goNext, cycleMs);
    }
  };

  const tickShowcase = (time) => {
    const progress = ((time - startTime) % cycleMs) / cycleMs;
    applyLayerState(slides[activeIndex], progress);
    showcaseRaf = requestAnimationFrame(tickShowcase);
  };

  showcaseSlider.addEventListener('pointermove', (event) => {
    const rect = showcaseSlider.getBoundingClientRect();
    pointerState.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    pointerState.y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    pointerState.inside = true;
  }, { passive: true });

  showcaseSlider.addEventListener('pointerleave', () => {
    pointerState.inside = false;
    pointerState.x = 0.5;
    pointerState.y = 0.5;
  });

  showcaseSlider.addEventListener('pointerenter', resetAutoplay, { passive: true });

  if (slides.length > 1) resetAutoplay();
  if (!reduced) {
    showcaseRaf = requestAnimationFrame(tickShowcase);
  } else {
    applyLayerState(slides[activeIndex], 0.15);
  }
}

magneticButtons.forEach((button) => {
  if (prefersReducedMotion.matches) return;

  button.addEventListener('mousemove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate3d(${(x * 0.07).toFixed(2)}px, ${(y * 0.07).toFixed(2)}px, 0)`;
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translate3d(0, 0, 0)';
  });
});

const createSupabaseClient = () => {
  const supabaseUrl = window.LAB_SUPABASE_URL;
  const supabaseAnonKey = window.LAB_SUPABASE_ANON_KEY;

  if (!window.supabase || !supabaseUrl || !supabaseAnonKey) return null;

  try {
    return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    return null;
  }
};

const supabaseClient = createSupabaseClient();

const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return [value];
};

const getFormValues = (formElement) => {
  const formData = new FormData(formElement);
  const values = {};

  for (const [key, value] of formData.entries()) {
    if (Object.hasOwn(values, key)) {
      const current = values[key];
      values[key] = Array.isArray(current) ? [...current, value] : [current, value];
      continue;
    }

    values[key] = value;
  }

  return values;
};

const saveLeadInSupabase = async (values, packSugerido) => {
  if (!supabaseClient) return;

  const payload = {
    negocio: values.negocio ?? null,
    rubro: values.rubro ?? null,
    web_actual: values.web_actual ?? null,
    branding: values.branding ?? null,
    objetivo: normalizeToArray(values.objetivo),
    tipo_web: values.tipo_web ?? null,
    secciones: values.secciones ?? null,
    nivel_diseno: values.nivel_diseno ?? null,
    funcionalidades: normalizeToArray(values.funcionalidades),
    presupuesto: values.presupuesto ?? null,
    tiempos: values.tiempos ?? null,
    pack_sugerido: packSugerido,
    enviado_en: new Date().toISOString(),
    payload: values,
  };

  try {
    await supabaseClient.from('leads_lab_runia').insert(payload);
  } catch (error) {
    // Error silencioso para no afectar UX del formulario
  }
};

const valueLabels = {
  tipo_web: {
    landing: 'Landing simple',
    completa: 'Web completa',
    premium: 'Premium / diferencial',
  },
  presupuesto: {
    bajo: 'Menos de USD 500',
    'medio-1': 'USD 500 – 1000',
    'medio-2': 'USD 1000 – 2000',
    alto: 'USD 2000+',
  },
  objetivo: {
    clientes: 'Conseguir clientes',
    servicios: 'Mostrar servicios',
    vender: 'Vender online',
    marca: 'Posicionamiento de marca',
  },
  secciones: {
    '1': '1 sección',
    '2-4': '2 a 4 secciones',
    '5+': '5 o más secciones',
  },
  funcionalidades: {
    'form-contacto': 'Formulario de contacto',
    whatsapp: 'Integración WhatsApp',
    tienda: 'Tienda online',
    automatizacion: 'Automatización',
    ia: 'IA / chatbot',
    interactivo: 'Algo interactivo',
  },
};

const packMeta = {
  'LANDING PRO': {
    inversion: { min: 400, max: 700 },
    mensaje: 'Una base clara, efectiva y profesional para presentar tu negocio con una inversión inicial más accesible.',
  },
  'WEB PRO': {
    inversion: { min: 900, max: 1500 },
    mensaje: 'La opción más equilibrada para marcas que necesitan una presencia digital sólida, bien estructurada y pensada para crecer.',
  },
  'WEB PREMIUM': {
    inversion: { min: 1500, max: 3000 },
    mensaje: 'La mejor opción para proyectos que buscan diferenciarse visualmente, elevar su percepción de marca y generar una experiencia de alto nivel.',
  },
  'BRANDING + WEB': {
    inversion: { min: 1200, max: 3500 },
    mensaje: 'Recomendado para marcas que todavía necesitan una base visual coherente antes de construir una web realmente potente.',
  },
  'RUNIA SYSTEM': {
    inversion: { min: 1800, max: 5000, plus: true },
    mensaje: 'Ideal para proyectos que necesitan interacción, automatización o una solución digital más avanzada que una web tradicional.',
  },
  'PACK A MEDIDA': {
    inversion: { min: 900, max: 2200 },
    mensaje: 'Recomendación inicial pensada para tu contexto actual y con margen de ajuste según prioridades.',
  },
};

const labelFromMap = (field, value) => {
  if (!value) return '-';
  return valueLabels[field]?.[value] || value;
};

const formatList = (field, value) => {
  const list = normalizeToArray(value);
  if (!list.length) return [];
  return list.map((item) => labelFromMap(field, item));
};

const formatUsd = (value) => `USD ${value}`;

const formatEstimatedRange = (range) => {
  if (!range) return 'USD a definir';
  const maxText = range.plus ? `${range.max}+` : range.max;
  return `${formatUsd(range.min)} – ${maxText}`;
};

const getInvestmentEstimate = (values, packSugerido) => {
  const packData = packMeta[packSugerido] || packMeta['PACK A MEDIDA'];
  const features = normalizeToArray(values.funcionalidades);
  const manyFeatures = features.length >= 4;
  const needsBranding = values.branding !== 'si';
  const isPremium = values.tipo_web === 'premium' || values.nivel_diseno === 'premium';
  const isUrgent = values.tiempos === 'urgente';
  const lowContent = values.secciones === '1' && features.length <= 2;

  const range = { ...packData.inversion };

  if (manyFeatures) {
    range.max += 600;
  }

  if (isPremium) {
    range.min += 150;
    range.max += 500;
  }

  if (lowContent) {
    range.min = Math.max(350, range.min - 120);
    range.max = Math.max(range.min + 150, range.max - 280);
  }

  const notes = [];

  if (needsBranding) {
    notes.push('Inversión adicional sugerida para branding: USD 300 – 900');
  }

  if (isUrgent) {
    notes.push('Prioridad por tiempos: el trabajo urgente puede incluir adicional de coordinación.');
  }

  return {
    range,
    rangeText: formatEstimatedRange(range),
    notes,
  };
};

const getPackSuggestionFromValues = (values) => {
  const websiteType = values.tipo_web;
  const designLevel = values.nivel_diseno;
  const budget = values.presupuesto;
  const branding = values.branding;
  const features = normalizeToArray(values.funcionalidades);

  const hasAdvancedNeed = features.some((feature) => ['automatizacion', 'ia', 'interactivo'].includes(feature));
  if (hasAdvancedNeed && (websiteType === 'premium' || budget === 'alto')) {
    return 'RUNIA SYSTEM';
  }

  if (branding !== 'si' && (websiteType === 'premium' || designLevel === 'premium')) {
    return 'BRANDING + WEB';
  }

  if (websiteType === 'landing' && budget === 'bajo') {
    return 'LANDING PRO';
  }

  if (websiteType === 'completa' && (budget === 'medio-1' || budget === 'medio-2')) {
    return 'WEB PRO';
  }

  if ((websiteType === 'premium' || designLevel === 'premium') && budget === 'alto') {
    return 'WEB PREMIUM';
  }

  if (hasAdvancedNeed) {
    return 'RUNIA SYSTEM';
  }

  if (branding !== 'si') {
    return 'BRANDING + WEB';
  }

  return 'PACK A MEDIDA';
};

const getDynamicExtras = (values) => {
  const extras = [];
  const branding = values.branding;
  const objectives = normalizeToArray(values.objetivo);
  const features = normalizeToArray(values.funcionalidades);
  const isPremiumFocus = values.tipo_web === 'premium' || values.nivel_diseno === 'premium' || objectives.includes('marca');

  if (branding !== 'si') {
    extras.push(values.nivel_diseno === 'premium' ? 'Branding Pro' : 'Branding Starter');
  }

  if (objectives.includes('clientes')) {
    extras.push('Automatización de leads');
  }

  if (isPremiumFocus) {
    extras.push('Experiencia interactiva o IA');
  }

  if (features.includes('tienda') || features.length >= 4) {
    extras.push('Planificación escalable / arquitectura extendida');
  }

  return Array.from(new Set(extras));
};

const getNextStep = (values) => {
  if (values.tiempos === 'urgente') {
    return 'Agendemos una llamada prioritaria para definir alcance mínimo viable y fechas de entrega.';
  }

  return 'Coordinemos una llamada de diagnóstico para confirmar alcance, contenido y roadmap de implementación.';
};

const getPrimaryObjective = (values) => {
  const objectives = formatList('objetivo', values.objetivo);
  return objectives[0] || 'mejorar mi presencia digital';
};

const buildWhatsappSummaryMessage = (values, packSugerido, rangeText) => {
  const clientName = values.negocio || 'No indicado';
  const brandName = values.negocio || 'No indicada';
  const primaryObjective = getPrimaryObjective(values);

  return `Hola! Completé el formulario de LAB_ by Runia.
Mi nombre es ${clientName}.
Mi marca es ${brandName}.
El pack sugerido fue ${packSugerido}.
La inversión estimada fue ${rangeText}.
Estoy buscando ${primaryObjective}.
Quisiera avanzar con la propuesta.`;
};

const generarBrief = (values, packSugerido) => {
  const objetivos = formatList('objetivo', values.objetivo).join(', ') || '-';
  const funcionalidades = formatList('funcionalidades', values.funcionalidades);

  return `PROYECTO:
Marca: ${values.negocio || '-'}
Rubro: ${values.rubro || '-'}

OBJETIVO:
Tipo de web: ${labelFromMap('tipo_web', values.tipo_web)}
Objetivo principal: ${objetivos}

PACK:
Sugerido: ${packSugerido}
Rango: ${getInvestmentEstimate(values, packSugerido).rangeText}

CONTENIDO:
Secciones: ${labelFromMap('secciones', values.secciones)}

FUNCIONALIDADES:
${funcionalidades.length ? funcionalidades.map((item) => `- ${item}`).join('\n') : '-'}

ESTRATEGIA:
${getNextStep(values)}`;
};

const projectWizard = document.querySelector('[data-project-wizard]');

if (projectWizard) {
  const wizardSteps = Array.from(projectWizard.querySelectorAll('.wizard-step'));
  const stepByNumber = new Map(
    wizardSteps.map((step) => [Number.parseInt(step.dataset.step || '0', 10), step]),
  );

  const prevButton = projectWizard.querySelector('[data-prev]');
  const nextButton = projectWizard.querySelector('[data-next]');
  const submitButton = projectWizard.querySelector('[data-submit]');
  const progressBar = document.querySelector('[data-progress-bar]');
  const stepLabel = document.querySelector('[data-step-label]');
  const packResult = document.querySelector('[data-pack-result]');
  const phaseOneResult = document.querySelector('[data-phase1-result]');
  const phaseOnePack = document.querySelector('[data-phase1-pack]');
  const phaseOneInvestment = document.querySelector('[data-phase1-investment]');
  const phaseOneWhy = document.querySelector('[data-phase1-why]');
  const phaseOneExtras = document.querySelector('[data-phase1-extras]');
  const phaseOneWhatsapp = document.querySelector('[data-phase1-whatsapp]');
  const phaseTwoStartButton = document.querySelector('[data-phase2-start]');

  const successMessage = document.querySelector('[data-success-message]');
  const finalCard = document.querySelector('[data-final-card]');
  const resultPack = document.querySelector('[data-result-pack]');
  const resultInvestment = document.querySelector('[data-result-investment]');
  const resultWhy = document.querySelector('[data-result-why]');
  const resultExtras = document.querySelector('[data-result-extras]');
  const resultNextStep = document.querySelector('[data-result-next-step]');
  const resultNote = document.querySelector('[data-result-note]');
  const whatsappCta = document.querySelector('[data-whatsapp-cta]');
  const copySummaryButton = document.querySelector('[data-copy-summary]');

  const phaseTwoInputs = Array.from(projectWizard.querySelectorAll('.phase-two-only input'));
  const phaseOneSequence = [1, 2, 3, 4, 6];
  const phaseTwoSequence = [1, 3, 5, 7];

  let currentPhase = 'quote';
  let activeSequence = phaseOneSequence;
  let currentIndex = 0;
  let latestSummary = '';

  const setPhaseTwoEnabled = (enabled) => {
    projectWizard.classList.toggle('is-phase-two', enabled);

    phaseTwoInputs.forEach((input) => {
      input.disabled = !enabled;
    });
  };

  const getPackSuggestion = () => {
    const currentValues = getFormValues(projectWizard);
    return getPackSuggestionFromValues(currentValues);
  };

  const syncSuggestion = () => {
    if (!packResult) return;
    packResult.textContent = `Recomendación inicial: ${getPackSuggestion()}`;
  };

  const renderExtrasList = (node, extras) => {
    if (!node) return;
    node.innerHTML = '';
    const extraItems = extras.length ? extras : ['Definición de contenidos y roadmap de implementación'];

    extraItems.forEach((extra) => {
      const li = document.createElement('li');
      li.textContent = extra;
      node.appendChild(li);
    });
  };

  const renderPhaseOneResult = (values, packSugerido) => {
    if (!phaseOneResult) return;

    const packData = packMeta[packSugerido] || packMeta['PACK A MEDIDA'];
    const estimate = getInvestmentEstimate(values, packSugerido);
    const extras = getDynamicExtras(values);

    if (phaseOnePack) phaseOnePack.textContent = packSugerido;
    if (phaseOneInvestment) phaseOneInvestment.textContent = `Inversión estimada: ${estimate.rangeText}`;
    if (phaseOneWhy) phaseOneWhy.textContent = packData.mensaje;
    renderExtrasList(phaseOneExtras, extras);

    if (phaseOneWhatsapp) {
      const text = buildWhatsappSummaryMessage(values, packSugerido, estimate.rangeText);
      phaseOneWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }

    phaseOneResult.hidden = false;
  };

  const renderFinalCard = (values, packSugerido) => {
    if (!finalCard) return;

    const extras = getDynamicExtras(values);
    const packData = packMeta[packSugerido] || packMeta['PACK A MEDIDA'];
    const estimate = getInvestmentEstimate(values, packSugerido);

    if (resultPack) resultPack.textContent = packSugerido;
    if (resultInvestment) {
      const notes = estimate.notes.length ? ` · ${estimate.notes.join(' · ')}` : '';
      resultInvestment.textContent = `Inversión estimada: ${estimate.rangeText}${notes}`;
    }
    if (resultWhy) resultWhy.textContent = packData.mensaje;
    if (resultNextStep) resultNextStep.textContent = getNextStep(values);
    if (resultNote) {
      resultNote.textContent = 'Esta estimación funciona como referencia inicial. La propuesta final puede ajustarse según contenido, tiempos y alcance real del proyecto.';
    }

    renderExtrasList(resultExtras, extras);

    if (whatsappCta) {
      const text = buildWhatsappSummaryMessage(values, packSugerido, estimate.rangeText);
      whatsappCta.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }

    finalCard.hidden = false;
  };

  const copySummaryToClipboard = async (summaryText) => {
    if (!summaryText || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(summaryText);
    } catch (error) {
      // Error silencioso para no afectar UX
    }
  };

  const validateObjectives = () => {
    const objectiveInputs = projectWizard.querySelectorAll('input[name="objetivo"]:not(:disabled)');
    const hasAny = Array.from(objectiveInputs).some((input) => input.checked);
    objectiveInputs.forEach((input) => {
      input.setCustomValidity(hasAny ? '' : 'Seleccioná al menos un objetivo.');
    });
    return hasAny;
  };

  const showStep = (index) => {
    wizardSteps.forEach((step) => {
      step.classList.remove('is-active');
    });

    currentIndex = index;
    const stepNumber = activeSequence[index];
    const activeStep = stepByNumber.get(stepNumber);
    if (activeStep) activeStep.classList.add('is-active');

    const totalSteps = activeSequence.length;
    const progress = ((index + 1) / totalSteps) * 100;

    if (progressBar) progressBar.style.width = `${progress}%`;
    if (stepLabel) {
      const phaseLabel = currentPhase === 'quote' ? 'Cotización' : 'Detalles';
      stepLabel.textContent = `${phaseLabel} · Paso ${index + 1} de ${totalSteps}`;
    }

    if (prevButton) prevButton.hidden = index === 0;
    if (nextButton) nextButton.hidden = index === totalSteps - 1;
    if (submitButton) {
      submitButton.hidden = index !== totalSteps - 1;
      submitButton.textContent = currentPhase === 'quote' ? 'Ver cotización' : 'Enviar proyecto';
    }
  };

  const validateCurrentStep = () => {
    const stepNumber = activeSequence[currentIndex];
    const activeStep = stepByNumber.get(stepNumber);
    if (!activeStep) return true;

    if (activeStep.querySelector('input[name="objetivo"]:not(:disabled)')) {
      validateObjectives();
    }

    const inputs = activeStep.querySelectorAll('input, select, textarea');
    return Array.from(inputs).every((input) => input.disabled || input.checkValidity());
  };

  projectWizard.addEventListener('input', syncSuggestion);

  copySummaryButton?.addEventListener('click', () => {
    void copySummaryToClipboard(latestSummary);
  });

  nextButton?.addEventListener('click', () => {
    if (!validateCurrentStep()) {
      projectWizard.reportValidity();
      return;
    }

    showStep(Math.min(currentIndex + 1, activeSequence.length - 1));
    syncSuggestion();
  });

  prevButton?.addEventListener('click', () => {
    showStep(Math.max(currentIndex - 1, 0));
    syncSuggestion();
  });

  phaseTwoStartButton?.addEventListener('click', () => {
    currentPhase = 'details';
    activeSequence = phaseTwoSequence;
    setPhaseTwoEnabled(true);

    if (phaseOneResult) phaseOneResult.hidden = true;
    projectWizard.hidden = false;

    showStep(0);
    syncSuggestion();
    projectWizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  projectWizard.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateCurrentStep()) {
      projectWizard.reportValidity();
      return;
    }

    const formValues = getFormValues(projectWizard);
    const packSugerido = getPackSuggestionFromValues(formValues);

    if (currentPhase === 'quote') {
      renderPhaseOneResult(formValues, packSugerido);
      projectWizard.hidden = true;
      return;
    }

    latestSummary = generarBrief(formValues, packSugerido);
    renderFinalCard(formValues, packSugerido);
    await saveLeadInSupabase(formValues, packSugerido);

    syncSuggestion();
    projectWizard.hidden = true;
    if (successMessage) successMessage.hidden = false;
  });

  setPhaseTwoEnabled(false);
  showStep(0);
  syncSuggestion();
}
