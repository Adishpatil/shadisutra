"use client";

import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    const elements = document.querySelectorAll<HTMLElement>(
      '[data-reveal]:not([data-reveal-once="true"])'
    );
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return () => root.classList.remove("js");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          entry.target.setAttribute("data-reveal-once", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      root.classList.remove("js");
    };
  }, []);
}
