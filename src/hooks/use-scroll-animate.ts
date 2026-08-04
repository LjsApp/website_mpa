import { useEffect, useRef } from "react";

type AnimateOptions = {
  threshold?: number;
  once?: boolean;
};

/**
 * Attach to a container ref. All children with [data-animate] will
 * reveal themselves when they enter the viewport.
 * Also supports [data-animate-stagger] on a container to stagger children.
 */
export function useScrollAnimate(options: AnimateOptions = {}) {
  const { threshold = 0.12, once = true } = options;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const targets = ref.current
      ? Array.from(ref.current.querySelectorAll<HTMLElement>("[data-animate], [data-animate-stagger]"))
      : [];

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;

          if (el.dataset.animateStagger !== undefined) {
            // Stagger all direct children
            const children = Array.from(el.children) as HTMLElement[];
            children.forEach((child, i) => {
              setTimeout(() => child.classList.add("is-visible"), i * 100);
              child.classList.add("animate-child");
            });
            el.classList.add("is-visible");
          } else {
            el.classList.add("is-visible");
          }

          if (once) observer.unobserve(el);
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}
