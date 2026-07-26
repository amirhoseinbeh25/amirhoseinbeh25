"use client";

import { useEffect, useRef } from "react";

/**
 * صحنه سه‌بعدی پس‌زمینه صفحه اصلی.
 *
 * لایه‌ها روی عمق‌های مختلف Z چیده شده‌اند و کل «دنیا» با حرکت ماوس کمی
 * می‌چرخد. چون لایه‌ها فاصله واقعی از دوربین دارند، پارالاکس واقعی است نه
 * جابه‌جایی ساختگی: لایه نزدیک بیشتر از لایه دور جابه‌جا می‌شود.
 *
 * المان‌ها: دریاچه ارومیه (خطوط تراز)، پل میانگذر، جزایر، فلامینگو،
 * بلور مکعبی نمک، رشته‌کوه‌های اطراف شهر، چرخ‌دنده (مهندسی مکانیک) و
 * نقش هشت‌پر آجرکاری سه‌گنبد.
 *
 * کل صحنه تزئینی است و از دید صفحه‌خوان پنهان می‌ماند.
 */

const PERSPECTIVE = 1100;

/** لایه را در عمق z می‌برد و بزرگ‌نمایی ناشی از پرسپکتیو را جبران می‌کند. */
function depth(z: number): React.CSSProperties {
  return {
    transform: `translateZ(${z}px) scale(${(PERSPECTIVE - z) / PERSPECTIVE})`,
  };
}

/** خط ساحلی دریاچه ارومیه — کشیده در راستای شمال-جنوب با تنگه میانی. */
const LAKE =
  "M200 28 C252 58 278 130 264 202 C253 260 231 302 236 342 C241 382 286 422 293 492 C301 572 250 652 196 670 C141 652 95 576 105 494 C113 424 159 382 163 342 C167 302 145 260 136 202 C124 130 148 58 200 28 Z";

const CONTOURS = [
  { k: 1, o: 0.5, w: 1.6 },
  { k: 0.84, o: 0.34, w: 1.2 },
  { k: 0.68, o: 0.24, w: 1 },
  { k: 0.52, o: 0.16, w: 1 },
  { k: 0.36, o: 0.1, w: 1 },
];

function Lake() {
  return (
    <svg viewBox="0 0 400 700" className="h-full w-full overflow-visible">
      {/* آب کم‌عمق دریاچه */}
      <path d={LAKE} fill="var(--hero-accent)" opacity="0.05" />

      {CONTOURS.map(({ k, o, w }) => (
        <path
          key={k}
          d={LAKE}
          fill="none"
          stroke="var(--hero-accent)"
          strokeWidth={w}
          opacity={o}
          transform={`translate(200 350) scale(${k}) translate(-200 -350)`}
        />
      ))}

      {/* موج آرام روی سطح آب */}
      <g style={{ transformOrigin: "200px 350px" }} className="anim-ripple">
        <path
          d={LAKE}
          fill="none"
          stroke="var(--hero-accent)"
          strokeWidth="1"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

function Causeway() {
  return (
    <svg viewBox="0 0 400 700" className="h-full w-full overflow-visible">
      {/* پل میانگذر شهید کلانتری روی تنگه میانی دریاچه */}
      <line
        x1="88"
        y1="344"
        x2="312"
        y2="344"
        stroke="var(--hero-fg)"
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1="88"
        y1="350"
        x2="312"
        y2="350"
        stroke="var(--hero-fg)"
        strokeWidth="1"
        opacity="0.28"
      />
      {Array.from({ length: 11 }, (_, i) => 96 + i * 21).map((x) => (
        <line
          key={x}
          x1={x}
          y1="344"
          x2={x}
          y2="352"
          stroke="var(--hero-fg)"
          strokeWidth="1"
          opacity="0.3"
        />
      ))}

      {/* جزایر دریاچه */}
      <ellipse
        cx="178"
        cy="238"
        rx="17"
        ry="9"
        fill="var(--hero-accent)"
        opacity="0.28"
      />
      <ellipse
        cx="214"
        cy="470"
        rx="12"
        ry="7"
        fill="var(--hero-accent)"
        opacity="0.22"
      />
      <ellipse
        cx="176"
        cy="520"
        rx="8"
        ry="5"
        fill="var(--hero-accent)"
        opacity="0.18"
      />
    </svg>
  );
}

/** چرخ‌دنده — نشان گروه مهندسی مکانیک. */
function Gear({ teeth = 24, r = 132 }: { teeth?: number; r?: number }) {
  const angles = Array.from({ length: teeth }, (_, i) => (i * 360) / teeth);
  return (
    <svg viewBox="-200 -200 400 400" className="h-full w-full overflow-visible">
      <g className="anim-spin-slow" style={{ transformOrigin: "center" }}>
        {angles.map((a) => (
          <rect
            key={a}
            x="-7"
            y={-(r + 20)}
            width="14"
            height="20"
            rx="3"
            fill="var(--hero-accent)"
            opacity="0.32"
            transform={`rotate(${a})`}
          />
        ))}
        <circle
          r={r}
          fill="none"
          stroke="var(--hero-accent)"
          strokeWidth="2"
          opacity="0.42"
        />
        <circle
          r={r - 16}
          fill="none"
          stroke="var(--hero-accent)"
          strokeWidth="1"
          opacity="0.2"
        />
      </g>

      <g className="anim-spin-slower" style={{ transformOrigin: "center" }}>
        <circle
          r={r - 52}
          fill="none"
          stroke="var(--hero-accent)"
          strokeWidth="1"
          opacity="0.3"
          strokeDasharray="10 14"
        />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1="0"
            y1="0"
            x2="0"
            y2={-(r - 52)}
            stroke="var(--hero-accent)"
            strokeWidth="1"
            opacity="0.16"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="9" fill="none" stroke="var(--hero-accent)" strokeWidth="2" opacity="0.5" />
      </g>
    </svg>
  );
}

/** فلامینگو — پرنده نشان دریاچه ارومیه. */
function Flamingo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 64" className={className}>
      <g stroke="var(--hero-rose)" fill="none" strokeLinecap="round">
        <path d="M20 57 L20 44" strokeWidth="1.4" />
        <path d="M24.5 57 L23 47" strokeWidth="1.4" />
        <path d="M25 32 C29.5 25 27 17 21 14" strokeWidth="1.8" />
        <path d="M17.6 13.4 L12.8 16.4" strokeWidth="1.6" />
      </g>
      <ellipse cx="20" cy="38" rx="11" ry="7.5" fill="var(--hero-rose)" opacity="0.85" />
      <circle cx="20.4" cy="12.8" r="3.1" fill="var(--hero-rose)" />
    </svg>
  );
}

/** بلور نمک — نمک دریاچه در سامانه بلوری مکعبی متبلور می‌شود. */
function SaltCube({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" className={className}>
      <g
        fill="none"
        stroke="var(--hero-salt)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      >
        <path d="M30 6 L54 20 L30 34 L6 20 Z" />
        <path d="M6 20 L6 48 L30 62 L30 34 Z" />
        <path d="M54 20 L54 48 L30 62 L30 34 Z" />
      </g>
      <path d="M30 6 L54 20 L30 34 L6 20 Z" fill="var(--hero-salt)" opacity="0.12" />
    </svg>
  );
}

/** نقش هشت‌پر — برگرفته از آجرکاری برج سه‌گنبد ارومیه. */
function EightPointStar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className}>
      <g fill="none" stroke="var(--hero-accent)" strokeWidth="1.2" opacity="0.5">
        <rect x="14" y="14" width="32" height="32" />
        <rect
          x="14"
          y="14"
          width="32"
          height="32"
          transform="rotate(45 30 30)"
        />
        <circle cx="30" cy="30" r="6" />
      </g>
    </svg>
  );
}

function Mountains() {
  return (
    <svg
      viewBox="0 0 1200 320"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
    >
      <path
        d="M0 320 L0 196 L96 142 L158 178 L246 96 L336 168 L414 122 L502 188 L604 110 L702 172 L792 132 L884 182 L982 120 L1074 168 L1142 138 L1200 178 L1200 320 Z"
        fill="var(--hero-accent)"
        opacity="0.07"
      />
      <path
        d="M0 320 L0 232 L86 200 L182 238 L268 178 L372 232 L470 194 L560 240 L664 186 L764 236 L862 200 L960 244 L1064 198 L1160 238 L1200 216 L1200 320 Z"
        fill="var(--hero-accent)"
        opacity="0.11"
      />
    </svg>
  );
}

const STARS = [
  [7, 16], [14, 42], [21, 9], [29, 31], [36, 62], [43, 19], [52, 47],
  [58, 12], [64, 37], [71, 24], [77, 58], [83, 15], [88, 41], [94, 28],
  [12, 71], [33, 78], [49, 68], [67, 74], [81, 82], [92, 66],
] as const;

/**
 * چرخش نرم «دنیا» بر اساس موقعیت ماوس، با میرایی نمایی.
 * وقتی ماوسی در کار نباشد صحنه خودش آرام می‌چرخد.
 */
function useSceneParallax(
  stage: React.RefObject<HTMLDivElement | null>,
  world: React.RefObject<HTMLDivElement | null>,
  strength = 1,
) {
  useEffect(() => {
    const stageEl = stage.current;
    const worldEl = world.current;
    if (!stageEl || !worldEl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    const start = performance.now();

    const onPointerMove = (event: PointerEvent) => {
      const rect = stageEl.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      // وقتی ماوس نیست (موبایل) صحنه خودش آرام می‌چرخد
      const driftX = Math.sin(t * 0.17) * 0.32;
      const driftY = Math.cos(t * 0.12) * 0.22;
      const targetX = pointerActive ? pointerX : driftX;
      const targetY = pointerActive ? pointerY : driftY;

      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      worldEl.style.transform = `rotateX(${(-currentY * 7 * strength).toFixed(
        3,
      )}deg) rotateY(${(currentX * 10 * strength).toFixed(3)}deg)`;

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [stage, world, strength]);
}

export function UrmiaScene() {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);

  useSceneParallax(stage, world);

  return (
    <div
      ref={stage}
      aria-hidden
      className="scene-stage pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div ref={world} className="scene-world absolute inset-0">
        {/* آسمان شب و ستاره‌ها — بزرگ‌تر از کادر، تا چرخش صحنه گوشه‌ها را خالی نگذارد */}
        <div className="scene-layer absolute -inset-[10%]" style={depth(-460)}>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 22% 18%, var(--hero-bg-2) 0%, var(--hero-bg-1) 55%, var(--hero-bg-1) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--hero-line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--hero-line-soft) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
              maskImage:
                "radial-gradient(120% 80% at 30% 45%, #000 20%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(120% 80% at 30% 45%, #000 20%, transparent 78%)",
            }}
          />
          {STARS.map(([x, y], i) => (
            <span
              key={`${x}-${y}`}
              className="anim-twinkle absolute rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: i % 4 === 0 ? 2.5 : 1.6,
                height: i % 4 === 0 ? 2.5 : 1.6,
                animationDelay: `${(i % 7) * 0.6}s`,
              }}
            />
          ))}
        </div>

        {/* رشته‌کوه‌های اطراف ارومیه */}
        <div
          className="scene-layer absolute inset-x-0 bottom-0 h-1/2"
          style={depth(-320)}
        >
          <Mountains />
        </div>

        {/* دریاچه ارومیه با خطوط تراز */}
        <div
          className="scene-layer absolute top-1/2 h-[128%] w-[46%] max-w-[430px] -translate-y-1/2 ltr:left-[3%] rtl:left-[3%] sm:w-[38%]"
          style={depth(-190)}
        >
          <Lake />
        </div>

        {/* پل میانگذر و جزایر */}
        <div
          className="scene-layer absolute top-1/2 h-[128%] w-[46%] max-w-[430px] -translate-y-1/2 left-[3%] sm:w-[38%]"
          style={depth(-80)}
        >
          <Causeway />
        </div>

        {/* چرخ‌دنده مهندسی مکانیک */}
        <div
          className="scene-layer absolute top-1/2 size-[300px] -translate-y-1/2 left-[6%] opacity-80 sm:size-[380px] lg:size-[440px]"
          style={depth(30)}
        >
          <Gear />
        </div>

        {/* فلامینگو، بلور نمک و نقش هشت‌پر */}
        <div className="scene-layer absolute inset-0" style={depth(120)}>
          <Flamingo className="anim-float absolute left-[30%] top-[24%] h-16 w-10 opacity-90" />
          <Flamingo className="anim-float-slow absolute left-[22%] top-[34%] h-11 w-7 opacity-70" />
          <Flamingo className="anim-float absolute left-[36%] top-[62%] h-9 w-6 opacity-60 [animation-delay:2.5s]" />

          <SaltCube className="anim-float-slow absolute left-[13%] top-[70%] h-16 w-14 opacity-70" />
          <SaltCube className="anim-float absolute left-[41%] top-[16%] h-10 w-9 opacity-50 [animation-delay:1.5s]" />

          <EightPointStar className="anim-spin-slower absolute left-[8%] top-[14%] size-14 opacity-60" />
          <EightPointStar className="anim-spin-slow absolute left-[44%] top-[80%] size-10 opacity-40" />
        </div>

        {/* ذرات نزدیک دوربین */}
        <div className="scene-layer absolute inset-0" style={depth(200)}>
          {[
            [18, 30], [27, 58], [39, 43], [11, 52], [46, 68], [33, 12],
          ].map(([x, y], i) => (
            <span
              key={`${x}-${y}`}
              className="anim-float absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: 4,
                height: 4,
                background: "var(--hero-accent)",
                opacity: 0.35,
                animationDelay: `${i * 1.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* محو شدن صحنه به سمت متن تا خوانایی حفظ شود */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, var(--hero-bg-1) 4%, rgba(6,20,15,0.86) 34%, rgba(6,20,15,0.35) 62%, transparent 100%)",
        }}
      />

      {/* روی صفحه باریک، متن تمام عرض را می‌گیرد و صحنه پشت آن می‌افتد؛
          این پرده صحنه را عقب می‌برد تا متن خوانا بماند. */}
      <div
        className="absolute inset-0 md:hidden"
        style={{ background: "rgba(6,20,15,0.72)" }}
      />
    </div>
  );
}

/**
 * نسخه کوتاه صحنه برای سربرگ صفحات داخلی — همان زبان بصری، با ارتفاع کم
 * و جزئیات سبک‌تر تا سنگین نشود.
 */
export function UrmiaBand() {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);

  useSceneParallax(stage, world, 0.6);

  return (
    <div
      ref={stage}
      aria-hidden
      className="scene-stage pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div ref={world} className="scene-world absolute inset-0">
        <div className="scene-layer absolute -inset-[12%]" style={depth(-460)}>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(110% 160% at 20% 30%, var(--hero-bg-2) 0%, var(--hero-bg-1) 60%, var(--hero-bg-1) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(var(--hero-line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--hero-line-soft) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(100% 90% at 24% 50%, #000 15%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(100% 90% at 24% 50%, #000 15%, transparent 80%)",
            }}
          />
        </div>

        {/* خطوط تراز دریاچه، بریده در بالا و پایین نوار */}
        <div
          className="scene-layer absolute top-1/2 h-[420%] w-[32%] max-w-[300px] -translate-y-1/2 left-[4%]"
          style={depth(-190)}
        >
          <Lake />
        </div>

        <div
          className="scene-layer absolute top-1/2 size-[220px] -translate-y-1/2 left-[10%] opacity-70 sm:size-[260px]"
          style={depth(30)}
        >
          <Gear teeth={20} r={118} />
        </div>

        <div className="scene-layer absolute inset-0" style={depth(120)}>
          <SaltCube className="anim-float absolute left-[30%] top-[22%] h-9 w-8 opacity-55" />
          <EightPointStar className="anim-spin-slower absolute left-[24%] top-[62%] size-9 opacity-45" />
        </div>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, var(--hero-bg-1) 6%, rgba(6,20,15,0.88) 38%, rgba(6,20,15,0.4) 66%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 md:hidden"
        style={{ background: "rgba(6,20,15,0.7)" }}
      />
    </div>
  );
}
