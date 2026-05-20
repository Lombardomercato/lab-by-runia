const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector(".header");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

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
