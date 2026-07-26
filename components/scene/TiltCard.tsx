"use client";

import { useRef } from "react";

/**
 * کارتی که با حرکت ماوس روی خودش کمی در فضا می‌چرخد و محتوایش
 * چند پیکسل جلوتر از سطح کارت شناور می‌شود.
 *
 * روی دستگاه لمسی هیچ رویداد pointermove پیوسته‌ای نمی‌آید، پس کارت
 * ثابت می‌ماند و چیزی از دست نمی‌رود.
 */
export function TiltCard({
  children,
  className = "",
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    el.style.transform = `perspective(700px) rotateX(${(-y * max).toFixed(
      2,
    )}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(6px)`;
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={`tilt ${className}`}
    >
      <div className="tilt-inner">{children}</div>
    </div>
  );
}
