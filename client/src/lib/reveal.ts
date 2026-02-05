/**
 * Reveal Animation System
 * 
 * Usage: Add data-reveal attribute to any element
 * - data-reveal="stagger" : Character-by-character stagger animation
 * - data-reveal="stagger-word" : Word-by-word stagger animation
 * - data-reveal="fade" : Simple fade + slide up animation (no text split)
 * 
 * Options (via data attributes):
 * - data-reveal-delay="200" : Initial delay in ms before animation starts
 * - data-reveal-stagger="30" : Delay between each character/word in ms
 * - data-reveal-once="false" : If false, re-animate on each visibility change
 */

interface RevealElement extends HTMLElement {
  _revealInitialized?: boolean;
  _revealObserver?: IntersectionObserver;
}

const DEFAULT_STAGGER_DELAY = 30;
const DEFAULT_INITIAL_DELAY = 0;

function splitTextIntoSpans(element: HTMLElement, splitBy: "char" | "word"): void {
  const text = element.textContent || "";
  element.innerHTML = "";

  if (splitBy === "word") {
    let wordIndex = 0;
    const segments = text.split(/(\s+)/);
    
    segments.forEach((segment) => {
      if (/^\s+$/.test(segment)) {
        element.appendChild(document.createTextNode(segment));
      } else {
        const span = document.createElement("span");
        span.className = "reveal-char";
        span.style.transitionDelay = `${wordIndex * (parseInt(element.dataset.revealStagger || "") || DEFAULT_STAGGER_DELAY)}ms`;
        span.textContent = segment;
        element.appendChild(span);
        wordIndex++;
      }
    });
  } else {
    const staggerDelay = parseInt(element.dataset.revealStagger || "") || DEFAULT_STAGGER_DELAY;
    
    text.split("").forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "reveal-char";
      span.style.transitionDelay = `${index * staggerDelay}ms`;
      span.textContent = char === " " ? "\u00A0" : char;
      element.appendChild(span);
    });
  }
}

function initRevealElement(element: RevealElement): void {
  if (element._revealInitialized) return;
  element._revealInitialized = true;

  const revealType = element.dataset.reveal;
  const initialDelay = parseInt(element.dataset.revealDelay || "") || DEFAULT_INITIAL_DELAY;
  const once = element.dataset.revealOnce !== "false";

  if (revealType === "stagger") {
    splitTextIntoSpans(element, "char");
    element.classList.add("reveal-text");
  } else if (revealType === "stagger-word") {
    splitTextIntoSpans(element, "word");
    element.classList.add("reveal-text");
  } else if (revealType === "fade") {
    element.classList.add("reveal-block");
  }

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (once && hasAnimated) return;

        setTimeout(() => {
          element.classList.add("is-visible");
          hasAnimated = true;
        }, initialDelay);

        if (once) {
          observer.disconnect();
        }
      } else if (!once) {
        element.classList.remove("is-visible");
      }
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  observer.observe(element);
  element._revealObserver = observer;
}

export function initRevealAnimations(): void {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  document.querySelectorAll<RevealElement>("[data-reveal]").forEach(initRevealElement);
}

export function observeNewRevealElements(): MutationObserver {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.dataset.reveal) {
            if (prefersReducedMotion) {
              node.classList.add("is-visible");
            } else {
              initRevealElement(node as RevealElement);
            }
          }
          
          node.querySelectorAll<RevealElement>("[data-reveal]").forEach((el) => {
            if (prefersReducedMotion) {
              el.classList.add("is-visible");
            } else {
              initRevealElement(el);
            }
          });
        }
      });
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return mutationObserver;
}
