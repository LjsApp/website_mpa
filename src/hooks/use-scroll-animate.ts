import { useEffect, useRef } from "react";

type AnimateOptions = {
  threshold?: number;
  once?: boolean;
};

/**
 * Attach to a container ref. All children with [data-animate] will
 * reveal themselves when they enter the viewport.
 * Also supports [data-animate-stagger] on a container to stagger children.
 *
 * once=true: element stays visible after first reveal (prevents flash on navigation)
 * once=false: element hides again when leaving viewport (repeating animation)
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
          const el = entry.target as HTMLElement;

          if (entry.isIntersecting) {
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
          } else if (!once) {
            // Remove classes only if repeating mode is on
            if (el.dataset.animateStagger !== undefined) {
              const children = Array.from(el.children) as HTMLElement[];
              children.forEach((child) => child.classList.remove("is-visible"));
            }
            el.classList.remove("is-visible");
          }
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}
