"use client";

import { useCallback, useState } from "react";
import { UrmiaScene } from "@/components/scene/UrmiaScene";
import { UrmiaGL } from "@/components/scene/UrmiaGL";

/**
 * صحنه CSS بلافاصله دیده می‌شود و صحنه WebGL وقتی آماده شد روی آن محو
 * می‌شود. اگر WebGL در دسترس نباشد یا three.js بارگذاری نشود، همان صحنه
 * CSS می‌ماند و کاربر چیزی از دست نمی‌دهد.
 */
export function HeroScene() {
  const [glReady, setGlReady] = useState(false);
  const handleReady = useCallback(() => setGlReady(true), []);

  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: glReady ? 0 : 1 }}
      >
        <UrmiaScene scrim={false} />
      </div>

      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: glReady ? 1 : 0 }}
      >
        <UrmiaGL onReady={handleReady} />
      </div>

      {/* پرده خوانایی، بالای هر دو صحنه */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, var(--hero-bg-1) 2%, rgba(6,20,15,0.82) 30%, rgba(6,20,15,0.3) 60%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{ background: "rgba(6,20,15,0.7)" }}
      />
    </>
  );
}
