import { useEffect, useRef } from "react";

type AnimateOptions = {
  threshold?: number;
};

function showEl(el: HTMLElement) {
  if (el.dataset.animateStagger !== undefined) {
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child, i) => {
      child.classList.add("animate-child");
      setTimeout(() => child.classList.add("is-visible"), i * 100);
    });
  }
  el.classList.add("is-visible");
}

function hideEl(el: HTMLElement) {
  if (el.dataset.animateStagger !== undefined) {
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => child.classList.remove("is-visible"));
  }
  el.classList.remove("is-visible");
}

/**
 * Smart directional scroll animation:
 * - Elements animate in when scrolled INTO view from below (scroll down)
 * - Elements re-animate when scrolled back into view from below
 * - Elements that have been seen (leave viewport above) STAY visible → prevents navigation flash
 */
export function useScrollAnimate(options: AnimateOptions = {}) {
  const { threshold = 0.12 } = options;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Show all elements immediately if reduced motion is preferred
      const all = ref.current
        ? Array.from(ref.current.querySelectorAll<HTMLElement>("[data-animate], [data-animate-stagger]"))
        : [];
      all.forEach((el) => showEl(el));
      return;
    }

    const targets = ref.current
      ? Array.from(ref.current.querySelectorAll<HTMLElement>("[data-animate], [data-animate-stagger]"))
      : [];

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          const rect = entry.boundingClientRect;

          if (entry.isIntersecting) {
            // Element entering viewport → show with animation
            showEl(el);
          } else {
            // Element leaving viewport
            // Only hide if it's BELOW viewport (user hasn't scrolled there yet, or scrolled back up past it)
            // Keep visible if it's ABOVE viewport (already been seen → prevent flash on navigation)
            const isBelow = rect.top > 0;
            if (isBelow) {
              hideEl(el);
            }
            // If above viewport (rect.bottom < 0): element stays visible (already seen)
          }
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
