"use client";

import { useEffect, useRef, useState } from "react";

/**
 * عنصر را هنگام ورود به کادر دید با یک چرخش سه‌بعدی کوتاه نمایش می‌دهد.
 * با IntersectionObserver کار می‌کند تا هیچ لیسنر اسکرولی روی صفحه نماند.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // حالت prefers-reduced-motion را خود CSS خنثی می‌کند، پس اینجا لازم نیست.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
