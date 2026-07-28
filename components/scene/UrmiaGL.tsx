"use client";

import { useEffect, useRef, useState } from "react";

/**
 * پوسته React برای صحنه WebGL.
 *
 * خود منطق صحنه در `lib/scene/urmiaScene.js` است و به React وابسته نیست، تا
 * فایل پریویو تک‌فایلی هم بتواند دقیقاً همان کد را اجرا کند.
 *
 * ارتقای تدریجی است: صحنه CSS بلافاصله رندر می‌شود و این لایه فقط وقتی روی
 * آن می‌نشیند که three.js بارگذاری شود و مرورگر WebGL داشته باشد. three.js با
 * import پویا می‌آید تا از باندل اولیه بیرون بماند.
 */
export function UrmiaGL({
  onReady,
  layers = "full",
}: {
  onReady?: () => void;
  /** «overlay» وقتی ویدئوی واقعی پشت صحنه است و اجسام تکراری باید خاموش شوند */
  layers?: "full" | "overlay";
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let scene: { dispose: () => void } | null = null;

    (async () => {
      try {
        const [THREE, { createUrmiaScene }] = await Promise.all([
          import("three"),
          import("@/lib/scene/urmiaScene"),
        ]);
        if (disposed) return;

        scene = createUrmiaScene(THREE, el, { onReady, layers });
        if (!scene) setFailed(true);
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      scene?.dispose();
    };
  }, [onReady, layers]);

  if (failed) return null;

  return (
    <div
      ref={mount}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  );
}
