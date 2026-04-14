document.documentElement.classList.add('js');

const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section');
const parallaxTargets = document.querySelectorAll('.project-media, .cta-inner');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const heroVisual = document.querySelector('.hero-visual');
const floatCards = document.querySelectorAll('.float-card');
const particleField = document.querySelector('.particle-field');
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
  {
    threshold: 0.14,
    rootMargin: '0px 0px -35px 0px',
  },
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
    layer.style.setProperty('--tx', `${(x * depth * 38).toFixed(2)}px`);
    layer.style.setProperty('--ty', `${(y * depth * 28).toFixed(2)}px`);
  });

  interactiveCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const dx = (pointer.x - (rect.left + rect.width / 2)) / rect.width;
    const dy = (pointer.y - (rect.top + rect.height / 2)) / rect.height;

    if (Math.abs(dx) > 1.2 || Math.abs(dy) > 1.2) {
      card.style.removeProperty('transform');
      return;
    }

    card.style.transform = `translateY(-1px) rotateX(${(-dy * 1.9).toFixed(2)}deg) rotateY(${(dx * 2.2).toFixed(2)}deg)`;
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

if (!prefersReducedMotion.matches) {
  const glowPointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.35,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.35,
    visible: false,
  };
  const glowLerp = 0.12;
  let glowRaf = 0;

  const renderGlow = () => {
    glowPointer.x += (glowPointer.targetX - glowPointer.x) * glowLerp;
    glowPointer.y += (glowPointer.targetY - glowPointer.y) * glowLerp;
    cursorGlow.style.transform = `translate3d(${glowPointer.x.toFixed(2)}px, ${glowPointer.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
    cursorGlow.style.opacity = glowPointer.visible ? '1' : '0';
    glowRaf = requestAnimationFrame(renderGlow);
  };

  window.addEventListener(
    'mousemove',
    (event) => {
      glowPointer.targetX = event.clientX;
      glowPointer.targetY = event.clientY;
      glowPointer.visible = true;
    },
    { passive: true },
  );

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

if (particleField) {
  const particles = [];
  const particleCount = 28;
  const friction = 0.93;
  const spring = 0.022;
  const interactionRadius = 120;
  const pointerState = { x: 0, y: 0, inside: false };
  let particleRaf = 0;
  let fieldRect = particleField.getBoundingClientRect();
  let lastTick = performance.now();

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  const createParticle = (index) => {
    const node = document.createElement('span');
    node.className = 'particle';
    particleField.appendChild(node);

    const depth = 0.7 + (index % 3) * 0.24;
    const size = randomBetween(4, 12);
    node.style.setProperty('--particle-size', `${size.toFixed(2)}px`);
    node.style.setProperty('--particle-opacity', `${randomBetween(0.08, 0.2).toFixed(3)}`);

    const baseX = Math.random() * fieldRect.width;
    const baseY = Math.random() * fieldRect.height;

    particles.push({
      node,
      depth,
      baseX,
      baseY,
      x: baseX,
      y: baseY,
      vx: randomBetween(-0.2, 0.2),
      vy: randomBetween(-0.2, 0.2),
      orbitX: randomBetween(8, 28),
      orbitY: randomBetween(6, 22),
      phase: Math.random() * Math.PI * 2,
      speed: randomBetween(0.25, 0.65),
    });
  };

  const resetField = () => {
    fieldRect = particleField.getBoundingClientRect();
  };

  const tickParticles = (time) => {
    const dt = Math.min(34, time - lastTick) / 16.67;
    lastTick = time;

    particles.forEach((particle) => {
      const cycle = time * 0.001 * particle.speed + particle.phase;
      const targetX = particle.baseX + Math.cos(cycle) * particle.orbitX * particle.depth;
      const targetY = particle.baseY + Math.sin(cycle) * particle.orbitY * particle.depth;

      particle.vx += (targetX - particle.x) * spring;
      particle.vy += (targetY - particle.y) * spring;

      if (pointerState.inside) {
        const dx = particle.x - pointerState.x;
        const dy = particle.y - pointerState.y;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < interactionRadius) {
          const force = (1 - distance / interactionRadius) * 0.75 * particle.depth;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }
      }

      particle.vx *= friction;
      particle.vy *= friction;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      if (particle.x < -18) particle.x = fieldRect.width + 18;
      if (particle.x > fieldRect.width + 18) particle.x = -18;
      if (particle.y < -18) particle.y = fieldRect.height + 18;
      if (particle.y > fieldRect.height + 18) particle.y = -18;

      particle.node.style.setProperty('--particle-x', `${particle.x.toFixed(2)}px`);
      particle.node.style.setProperty('--particle-y', `${particle.y.toFixed(2)}px`);
    });

    particleRaf = requestAnimationFrame(tickParticles);
  };

  for (let i = 0; i < particleCount; i += 1) {
    createParticle(i);
  }

  window.addEventListener(
    'mousemove',
    (event) => {
      const localX = event.clientX - fieldRect.left;
      const localY = event.clientY - fieldRect.top;
      pointerState.x = localX;
      pointerState.y = localY;
      pointerState.inside = localX >= 0 && localX <= fieldRect.width && localY >= 0 && localY <= fieldRect.height;
    },
    { passive: true },
  );

  window.addEventListener('resize', resetField, { passive: true });
  resetField();

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
  const dragState = { card: null, startX: 0, startY: 0 };

  const friction = 0.94;
  const maxVelocity = 46;
  const minVelocity = 0.03;
  let zCounter = floatCards.length + 1;
  let motionRaf = 0;
  let lastFrame = performance.now();

  const cardStates = Array.from(floatCards).map((card, index) => {
    const scale = Number(getComputedStyle(card).getPropertyValue('--scale')) || 1;
    const depthFactor = 0.35 + index * 0.28;
    return {
      node: card,
      intensity: Number(card.dataset.intensity) || 0.7,
      amplitude: 2 + index * 2,
      duration: 7600 + index * 900,
      phase: index * 1.6,
      depthFactor,
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
      pointerOffsetX: 0,
      pointerOffsetY: 0,
      zIndex: zCounter + index,
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

  const clampToHero = (state) => {
    const maxX = heroVisual.clientWidth - state.baseLeft - state.width;
    const minX = -state.baseLeft;
    const maxY = heroVisual.clientHeight - state.baseTop - state.height;
    const minY = -state.baseTop;

    if (state.x > maxX) {
      state.x = maxX;
      state.vx *= 0.35;
    } else if (state.x < minX) {
      state.x = minX;
      state.vx *= 0.35;
    }

    if (state.y > maxY) {
      state.y = maxY;
      state.vy *= 0.35;
    } else if (state.y < minY) {
      state.y = minY;
      state.vy *= 0.35;
    }
  };

  const resolveCollisions = () => {
    for (let i = 0; i < cardStates.length; i += 1) {
      for (let j = i + 1; j < cardStates.length; j += 1) {
        const a = cardStates[i];
        const b = cardStates[j];

        const ax = a.baseLeft + a.x;
        const ay = a.baseTop + a.y;
        const bx = b.baseLeft + b.x;
        const by = b.baseTop + b.y;

        const overlapX = Math.min(ax + a.width, bx + b.width) - Math.max(ax, bx);
        const overlapY = Math.min(ay + a.height, by + b.height) - Math.max(ay, by);

        if (overlapX <= 0 || overlapY <= 0) continue;

        const useX = overlapX < overlapY;
        const separation = (useX ? overlapX : overlapY) * 0.55 + 0.4;
        const fromAtoB = useX ? bx - ax : by - ay;
        const direction = fromAtoB >= 0 ? 1 : -1;

        const shiftA = a.isDragging ? 0.25 : 0.5;
        const shiftB = b.isDragging ? 0.25 : 0.5;

        if (useX) {
          a.x -= direction * separation * shiftA;
          b.x += direction * separation * shiftB;
          a.vx -= direction * 0.34;
          b.vx += direction * 0.34;
        } else {
          a.y -= direction * separation * shiftA;
          b.y += direction * separation * shiftB;
          a.vy -= direction * 0.34;
          b.vy += direction * 0.34;
        }

        clampToHero(a);
        clampToHero(b);
      }
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

        state.vx *= friction;
        state.vy *= friction;

        if (Math.abs(state.vx) < minVelocity) state.vx = 0;
        if (Math.abs(state.vy) < minVelocity) state.vy = 0;
      }

      clampToHero(state);
    });

    resolveCollisions();

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
        targetParallaxX = heroX * (7.5 * state.depthFactor);
        targetParallaxY = heroY * (5.5 * state.depthFactor);
      }

      state.hoverX += (targetX - state.hoverX) * 0.1;
      state.hoverY += (targetY - state.hoverY) * 0.1;
      state.parallaxX += (targetParallaxX - state.parallaxX) * 0.09;
      state.parallaxY += (targetParallaxY - state.parallaxY) * 0.09;

      const maxRotate = 2.1 + state.depthFactor * 1.8;
      state.rotateY += (state.hoverX * maxRotate - state.rotateY) * 0.13;
      state.rotateX += (state.hoverY * -maxRotate - state.rotateX) * 0.13;

      const shadowX = (-state.parallaxX * 1.55).toFixed(2);
      const shadowY = (20 - state.parallaxY * 1.1).toFixed(2);

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

  const onDocumentMouseMove = (event) => {
    if (!dragState.card) return;

    const state = getStateByNode(dragState.card);
    if (!state) return;

    const nextX = event.clientX - dragState.startX - state.pointerOffsetX;
    const nextY = event.clientY - dragState.startY - state.pointerOffsetY;

    state.vx = Math.max(-maxVelocity, Math.min(maxVelocity, nextX - state.x));
    state.vy = Math.max(-maxVelocity, Math.min(maxVelocity, nextY - state.y));

    state.x = nextX;
    state.y = nextY;
    clampToHero(state);
  };

  const onDocumentMouseUp = () => {
    if (!dragState.card) return;

    const state = getStateByNode(dragState.card);
    if (state) {
      state.isDragging = false;
      state.node.classList.remove('is-dragging');
    }

    dragState.card = null;
  };

  heroVisual.addEventListener('mousemove', (event) => {
    const rect = heroVisual.getBoundingClientRect();
    heroPointer.x = event.clientX - rect.left;
    heroPointer.y = event.clientY - rect.top;
    heroPointer.inside = true;
  });

  heroVisual.addEventListener('mouseleave', () => {
    heroPointer.inside = false;
  });

  document.addEventListener('mousemove', onDocumentMouseMove);
  document.addEventListener('mouseup', onDocumentMouseUp);

  cardStates.forEach((state) => {
    state.node.style.setProperty('--z-card', String(state.zIndex));

    state.node.addEventListener('mousedown', (event) => {
      event.preventDefault();

      state.isDragging = true;
      dragState.card = state.node;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      state.pointerOffsetX = event.clientX - (heroVisual.getBoundingClientRect().left + state.baseLeft + state.x);
      state.pointerOffsetY = event.clientY - (heroVisual.getBoundingClientRect().top + state.baseTop + state.y);

      elevateCard(state);
      state.node.classList.add('is-dragging');
    });
  });

  const stopMotion = () => {
    if (!motionRaf) return;
    cancelAnimationFrame(motionRaf);
    motionRaf = 0;
  };

  const handleResize = () => {
    updateBounds();
    cardStates.forEach((state) => clampToHero(state));
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
