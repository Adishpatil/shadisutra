"use client";

import { useEffect } from "react";

export function useReveal(routeKey?: string) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      '[data-reveal]:not([data-reveal-once="true"])'
    );
    const reveal = (element: HTMLElement) => {
      element.classList.add("is-visible");
      element.setAttribute("data-reveal-once", "true");
    };

    document.documentElement.classList.add("js");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!(entry.target instanceof HTMLElement)) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const inViewport =
        bounds.top < window.innerHeight &&
        bounds.bottom > 0 &&
        bounds.left < window.innerWidth &&
        bounds.right > 0;
      if (inViewport) reveal(element);
      else observer.observe(element);
    });

    const safetyTimeout = window.setTimeout(() => {
      elements.forEach((element) => {
        if (!element.classList.contains("is-visible")) reveal(element);
      });
    }, 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(safetyTimeout);
    };
  }, [routeKey]);
}
