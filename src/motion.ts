/** Subtle scroll reveals. Respects prefers-reduced-motion. */

const SELECTOR = "[data-reveal]";

export function initReveals(root: ParentNode = document) {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR));
  if (!nodes.length) return () => undefined;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((node) => node.classList.add("is-in"));
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  nodes.forEach((node) => {
    if (!node.classList.contains("is-in")) observer.observe(node);
  });

  return () => observer.disconnect();
}
