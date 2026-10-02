"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The single scroll-reveal primitive for the marketing surface.
 *
 * - reveals once per element; never re-animates when scrolling back up
 * - reveals by group: wrap a row/section, not every child
 * - prefers-reduced-motion never animates and never delays information:
 *   the element is marked visible on the next frame (and CSS forces the
 *   transition off), so bars/counters still reach their final state.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
}: {
  threshold?: number;
} = {}) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  /**
   * Verdict of the one reduced-motion read for this element, recorded inside
   * the effect below. Motion dependants (count-up, progress fill) read it
   * instead of touching `window` themselves.
   */
  const motion = useRef({ reduced: false });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    motion.current.reduced = reduced;

    if (reduced || typeof IntersectionObserver === "undefined") {
      // Next frame, not the effect body: avoids a synchronous re-render and
      // keeps the reduced-motion path free of any animation.
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible, motion };
}