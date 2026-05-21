const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector(".header");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const cardSwap = document.querySelector(".runia-card-swap");
const swapCards = cardSwap ? Array.from(cardSwap.querySelectorAll(".runia-swap-card")) : [];
const isCompactCardStack = window.matchMedia("(max-width: 520px)").matches;
const swapConfig = {
  cardDistance: isCompactCardStack ? 24 : 40,
  verticalDistance: isCompactCardStack ? 28 : 42,
  delay: 3400,
  skewAmount: 2.5,
  dropDistance: isCompactCardStack ? 240 : 340,
  dropDuration: 820,
  moveDelay: 260,
  returnDelay: 460
};

const makeSwapSlot = (index, total) => ({
  x: index * swapConfig.cardDistance,
  y: -index * swapConfig.verticalDistance,
  z: -index * swapConfig.cardDistance * 1.5,
  zIndex: total - index
});

const placeSwapCard = (card, slot, opacity = 1) => {
  card.style.zIndex = String(slot.zIndex);
  card.style.opacity = String(opacity);
  card.style.filter = `saturate(${Math.max(0.84, 1 - (swapCards.length - slot.zIndex) * 0.035)}) brightness(${Math.max(0.88, 1 - (swapCards.length - slot.zIndex) * 0.025)})`;
  card.style.transform = `translate(-50%, -50%) translate3d(${slot.x}px, ${slot.y}px, ${slot.z}px) skewY(${swapConfig.skewAmount}deg)`;
};

const renderSwapCards = () => {
  swapCards.forEach((card, index) => {
    const opacity = Math.max(0.46, 1 - index * 0.12);
    placeSwapCard(card, makeSwapSlot(index, swapCards.length), opacity);
  });
};

if (cardSwap && swapCards.length) {
  renderSwapCards();

  if (!prefersReducedMotion) {
    let swapTimer;
    let isPaused = false;
    let isSwapping = false;

    const advanceSwap = () => {
      if (isPaused || isSwapping || swapCards.length < 2) return;
      isSwapping = true;
      const first = swapCards.shift();
      const rest = [...swapCards];
      const backSlot = makeSwapSlot(swapCards.length, swapCards.length + 1);

      first.classList.add("is-exiting");
      first.style.transform = `translate(-50%, -50%) translate3d(0px, ${swapConfig.dropDistance}px, 80px) skewY(${swapConfig.skewAmount}deg)`;

      window.setTimeout(() => {
        rest.forEach((card, index) => {
          const opacity = Math.max(0.46, 1 - index * 0.12);
          placeSwapCard(card, makeSwapSlot(index, rest.length + 1), opacity);
        });
      }, swapConfig.moveDelay);

      window.setTimeout(() => {
        first.style.zIndex = String(backSlot.zIndex);
        first.style.opacity = "0.46";
        first.style.filter = "saturate(0.86) brightness(0.9)";
        first.style.transform = `translate(-50%, -50%) translate3d(${backSlot.x}px, ${backSlot.y}px, ${backSlot.z}px) skewY(${swapConfig.skewAmount}deg)`;
      }, swapConfig.returnDelay);

      window.setTimeout(() => {
        first.classList.remove("is-exiting");
        swapCards.push(first);
        renderSwapCards();
        isSwapping = false;
      }, swapConfig.dropDuration);
    };

    window.setTimeout(advanceSwap, 450);
    swapTimer = window.setInterval(advanceSwap, swapConfig.delay);

    cardSwap.addEventListener("mouseenter", () => {
      isPaused = true;
    });

    cardSwap.addEventListener("mouseleave", () => {
      isPaused = false;
    });

    cardSwap.addEventListener("focusin", () => {
      isPaused = true;
    });

    cardSwap.addEventListener("focusout", () => {
      isPaused = false;
    });
  }
}

const revealTargets = document.querySelectorAll(
  ".speed-panel, .speed-cards article, .problem-list article, .system-board article, .result-strip article, .runia-panel, .timeline li, .compare-grid article, .plans article, .final-panel"
);

revealTargets.forEach((element) => element.classList.add("reveal"));

if (prefersReducedMotion) {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
}

const counters = document.querySelectorAll("[data-count]");

const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const duration = 1100;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if (prefersReducedMotion) {
  counters.forEach((counter) => {
    counter.textContent = counter.dataset.count;
  });
} else {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const typewriter = document.querySelector(".typewriter");

if (typewriter && !prefersReducedMotion) {
  const words = typewriter.dataset.words.split(",").map((word) => word.trim()).filter(Boolean);
  let wordIndex = 0;
  let charIndex = typewriter.textContent.length;
  let deleting = true;

  const type = () => {
    const word = words[wordIndex];

    if (deleting) {
      charIndex -= 1;
      typewriter.textContent = word.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    } else {
      charIndex += 1;
      typewriter.textContent = words[wordIndex].slice(0, charIndex);

      if (charIndex === words[wordIndex].length) {
        deleting = true;
      }
    }

    const delay = deleting ? 70 : 105;
    const pause = charIndex === words[wordIndex]?.length ? 1400 : 0;
    window.setTimeout(type, delay + pause);
  };

  window.setTimeout(type, 1400);
}
