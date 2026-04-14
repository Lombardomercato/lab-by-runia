document.documentElement.classList.add('js');

const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const parallaxTargets = document.querySelectorAll('.project-media, .cta-inner');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const hero = document.querySelector('.hero');
const heroVisual = document.querySelector('.hero-visual');
const floatCards = document.querySelectorAll('.float-card');
const particleField = document.querySelector('.particle-field');
const heroMouseLight = document.querySelector('.hero-mouse-light');
const interactiveCards = document.querySelectorAll('.tilt, .project');
const magneticButtons = document.querySelectorAll('.magnetic');
const heroLayers = document.querySelectorAll('.hero-bg [data-depth]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
cursorGlow.setAttribute('aria-hidden', 'true');
document.body.appendChild(cursorGlow);

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
  { threshold: 0.14, rootMargin: '0px 0px -35px 0px' },
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
    layer.style.setProperty('--tx', `${(x * depth * 52).toFixed(2)}px`);
    layer.style.setProperty('--ty', `${(y * depth * 40).toFixed(2)}px`);
  });

  interactiveCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const dx = (pointer.x - (rect.left + rect.width / 2)) / rect.width;
    const dy = (pointer.y - (rect.top + rect.height / 2)) / rect.height;

    if (Math.abs(dx) > 1.2 || Math.abs(dy) > 1.2) {
      card.style.removeProperty('transform');
      return;
    }

    card.style.transform = `translateY(-1px) rotateX(${(-dy * 2.2).toFixed(2)}deg) rotateY(${(dx * 2.6).toFixed(2)}deg)`;
  });
};

const requestPointerMotion = () => {
  if (!pointerRaf) pointerRaf = requestAnimationFrame(updatePointerMotion);
};

window.addEventListener('mousemove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
  requestPointerMotion();
}, { passive: true });

window.addEventListener('mouseleave', () => {
  pointer.active = false;
  interactiveCards.forEach((card) => {
    card.style.removeProperty('transform');
  });
});

if (!prefersReducedMotion.matches) {
  const glowPointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.35,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.35,
    visible: false,
  };

  const glowLerp = 0.1;
  let glowRaf = 0;

  const renderGlow = () => {
    glowPointer.x += (glowPointer.targetX - glowPointer.x) * glowLerp;
    glowPointer.y += (glowPointer.targetY - glowPointer.y) * glowLerp;

    cursorGlow.style.transform = `translate3d(${glowPointer.x.toFixed(2)}px, ${glowPointer.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
    cursorGlow.style.opacity = glowPointer.visible ? '1' : '0';

    glowRaf = requestAnimationFrame(renderGlow);
  };

  window.addEventListener('mousemove', (event) => {
    glowPointer.targetX = event.clientX;
    glowPointer.targetY = event.clientY;
    glowPointer.visible = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    glowPointer.visible = false;
  });

  glowRaf = requestAnimationFrame(renderGlow);

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      if (glowRaf) cancelAnimationFrame(glowRaf);
      glowRaf = 0;
      cursorGlow.style.opacity = '0';
      return;
    }

    if (!glowRaf) {
      glowPointer.visible = true;
      glowRaf = requestAnimationFrame(renderGlow);
    }
  });
}

if (hero && heroMouseLight) {
  const light = {
    x: 50,
    y: 42,
    tx: 50,
    ty: 42,
    alpha: 0,
    targetAlpha: 0,
    raf: 0,
  };

  const renderHeroLight = () => {
    light.x += (light.tx - light.x) * 0.11;
    light.y += (light.ty - light.y) * 0.11;
    light.alpha += (light.targetAlpha - light.alpha) * 0.12;

    heroMouseLight.style.setProperty('--light-x', `${light.x.toFixed(2)}%`);
    heroMouseLight.style.setProperty('--light-y', `${light.y.toFixed(2)}%`);
    heroMouseLight.style.setProperty('--light-opacity', light.alpha.toFixed(3));

    light.raf = requestAnimationFrame(renderHeroLight);
  };

  hero.addEventListener('pointermove', (event) => {
    if (prefersReducedMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    light.tx = ((event.clientX - rect.left) / rect.width) * 100;
    light.ty = ((event.clientY - rect.top) / rect.height) * 100;
    light.targetAlpha = 1;
  }, { passive: true });

  hero.addEventListener('pointerenter', () => {
    if (prefersReducedMotion.matches) return;
    light.targetAlpha = 1;
  });

  hero.addEventListener('pointerleave', () => {
    light.targetAlpha = 0;
  });

  if (!prefersReducedMotion.matches) {
    light.raf = requestAnimationFrame(renderHeroLight);
  }

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      if (light.raf) cancelAnimationFrame(light.raf);
      light.raf = 0;
      heroMouseLight.style.setProperty('--light-opacity', '0');
      return;
    }

    if (!light.raf) {
      light.raf = requestAnimationFrame(renderHeroLight);
    }
  });
}

if (particleField) {
  const particles = [];
  const particleCount = 18;
  const interactionRadius = 180;
  const pointerState = { x: 0, y: 0, inside: false, vx: 0, vy: 0 };
  let particleRaf = 0;
  let fieldRect = particleField.getBoundingClientRect();
  let lastTick = performance.now();

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  const createParticle = () => {
    const node = document.createElement('span');
    node.className = 'particle';
    particleField.appendChild(node);

    const depth = randomBetween(0.6, 1.5);
    const size = randomBetween(4, 13) * depth * 0.82;
    node.style.setProperty('--particle-size', `${size.toFixed(2)}px`);
    node.style.setProperty('--particle-opacity', `${randomBetween(0.08, 0.26).toFixed(3)}`);
    node.style.setProperty('--particle-blur', `${(1.4 - depth * 0.48).toFixed(2)}px`);

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
    fieldRect = particleField.getBoundingClientRect();
    particles.forEach((particle) => {
      particle.homeX = (particle.homeX / Math.max(1, fieldRect.width)) * fieldRect.width;
      particle.homeY = (particle.homeY / Math.max(1, fieldRect.height)) * fieldRect.height;
    });
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
          const power = (1 - distance / interactionRadius) * (0.82 + particle.depth * 0.28);
          particle.vx += (dx / distance) * power + pointerState.vx * 0.05;
          particle.vy += (dy / distance) * power + pointerState.vy * 0.05;
        }
      }

      particle.vx *= 0.93;
      particle.vy *= 0.93;
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

  for (let i = 0; i < particleCount; i += 1) {
    createParticle();
  }

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

  if (!prefersReducedMotion.matches) {
    particleRaf = requestAnimationFrame(tickParticles);
  }

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      if (particleRaf) cancelAnimationFrame(particleRaf);
      particleRaf = 0;
      return;
    }

    if (!particleRaf) {
      lastTick = performance.now();
      particleRaf = requestAnimationFrame(tickParticles);
    }
  });
}

if (heroVisual && floatCards.length > 0) {
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
      amplitude: 6 + index * 2.6,
      duration: 6800 + index * 780,
      phase: Math.random() * Math.PI * 2,
      depthFactor: 0.45 + index * 0.32,
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
      radiusPad: 78,
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
        targetParallaxX = heroX * (11.5 * state.depthFactor) * state.intensity;
        targetParallaxY = heroY * (8 * state.depthFactor) * state.intensity;
      }

      state.hoverX += (targetX - state.hoverX) * 0.14;
      state.hoverY += (targetY - state.hoverY) * 0.14;
      state.parallaxX += (targetParallaxX - state.parallaxX) * 0.12;
      state.parallaxY += (targetParallaxY - state.parallaxY) * 0.12;

      const maxRotate = 2.8 + state.depthFactor * 2.4;
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

  const stopMotion = () => {
    if (!motionRaf) return;
    cancelAnimationFrame(motionRaf);
    motionRaf = 0;
  };

  const handleResize = () => {
    updateBounds();
    cardStates.forEach((state) => applySoftBounds(state));
  };

  updateBounds();
  window.addEventListener('resize', handleResize, { passive: true });

  if (!prefersReducedMotion.matches) {
    motionRaf = requestAnimationFrame(animateCards);
  }

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      stopMotion();
      return;
    }

    if (!motionRaf) {
      lastFrame = performance.now();
      motionRaf = requestAnimationFrame(animateCards);
    }
  });
}

magneticButtons.forEach((button) => {
  if (prefersReducedMotion.matches) return;

  button.addEventListener('mousemove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate3d(${(x * 0.12).toFixed(2)}px, ${(y * 0.12).toFixed(2)}px, 0)`;
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translate3d(0, 0, 0)';
  });
});
