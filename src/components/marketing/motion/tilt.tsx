"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt — reserved for the hero anchor card only.
 *
 * Disabled on touch devices and under prefers-reduced-motion (checked inside
 * the effect, so SSR and hydration are unaffected). The transform is applied
 * through requestAnimationFrame to keep pointer moves off the layout path.
 * Never apply this to text-heavy cards: motion blur hurts legibility.
 */
export function Tilt({
  children,
  className,
  /** Maximum rotation in degrees. */
  max = 4,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.transform = `perspective(1400px) rotateY(${x * max * 2}deg) rotateX(${-y * max * 2}deg)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      node.style.transform = "";
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}