"use client";

import { useEffect } from "react";

/**
 * Only for browsers without scroll-driven animations, or with reduced motion: moves the stage between
 * its three framings as each story step reaches mid-screen. With scroll timelines and motion allowed,
 * it does nothing and CSS drives the camera.
 */
export function ScaleFallback() {
  useEffect(() => {
    const stage = document.getElementById("pb-stage");
    if (!stage) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The same test as the CSS's @supports: per-step timelines need timeline-scope too.
    const timeline = CSS.supports("animation-timeline: view()") && CSS.supports("timeline-scope: none");
    if (timeline && !reduce) return;
    if (!("IntersectionObserver" in window)) return;

    stage.setAttribute("data-fallback", "");
    // The reading line the CSS uses: the viewport's middle beside the picture, and under 900px the
    // middle of the band below the sticky picture (about 72% down).
    const stacked = matchMedia("(max-width: 899px)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const step = (entry.target as HTMLElement).dataset.step;
          if (entry.isIntersecting && step) stage.dataset.scale = step;
        }
      },
      { rootMargin: stacked ? "-71% 0px -27% 0px" : "-45% 0px -45% 0px" },
    );
    for (const step of document.querySelectorAll(".pb-step")) observer.observe(step);
    return () => observer.disconnect();
  }, []);

  return null;
}
