"use client";

import { HeroVideo } from "@/components/scene/HeroVideo";
import { UrmiaGL } from "@/components/scene/UrmiaGL";

/**
 * پس‌زمینه هیرو در سه لایه:
 *
 *  ۱. ویدئوی واقعی پل میانگذر روی دریاچه ارومیه.
 *  ۲. لایه فنی WebGL — چرخ‌دنده و بلورهای نمک — روی آن. دریاچه و پلِ
 *     مدل‌شده این‌جا خاموش‌اند، چون نسخه واقعی‌شان پشت سر همین لایه است.
 *  ۳. پرده تیره، تا متن روی آسمان روشن غروب هم خوانا بماند.
 *
 * اگر WebGL نباشد لایه دوم می‌افتد و ویدئو می‌ماند؛ اگر ویدئو هم پخش نشود
 * فریم پوستر می‌ماند.
 */
export function HeroScene() {
  return (
    <>
      <HeroVideo />

      <div className="absolute inset-0 opacity-45">
        <UrmiaGL layers="overlay" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, var(--hero-bg-1) 0%, rgba(6,20,15,0.88) 28%, rgba(6,20,15,0.45) 58%, rgba(6,20,15,0.12) 100%)",
        }}
      />
      {/* بستن رنگ گرم غروب به پالت سبز سایت */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(6,32,26,0.12)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{ background: "rgba(6,20,15,0.55)" }}
      />
    </>
  );
}
