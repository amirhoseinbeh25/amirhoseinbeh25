"use client";

import { useEffect, useRef } from "react";

/**
 * ویدئوی پس‌زمینه هیرو: پل میانگذر شهید کلانتری روی دریاچه ارومیه در غروب.
 *
 * پخش خودکار فقط وقتی شروع می‌شود که کاربر prefers-reduced-motion نداشته
 * باشد؛ در غیر این صورت همان فریم پوستر ثابت می‌ماند و صفحه چیزی کم ندارد.
 * مرورگرها پخش خودکار را تنها برای ویدئوی بی‌صدا اجازه می‌دهند، و ویدئو
 * صدا هم ندارد.
 */
export function HeroVideo({
  webm,
  mp4,
  poster,
}: {
  webm: string;
  mp4: string;
  poster: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // اگر مرورگر پخش خودکار را رد کند، پوستر سر جایش می‌ماند
    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      className="pointer-events-none absolute inset-0 size-full object-cover"
      style={{ objectPosition: "center 30%", filter: "saturate(0.9)" }}
    >
      {webm && <source src={webm} type="video/webm" />}
      {mp4 && <source src={mp4} type="video/mp4" />}
    </video>
  );
}
