import { NextResponse } from "next/server";
import { pageViews } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  clientIpFrom,
  isPrivateIp,
  lookupGeo,
  parseUserAgent,
  truncateIp,
  visitorHash,
} from "@/lib/analytics";

export const runtime = "nodejs";
// هر بازدید باید ثبت شود، پس این مسیر هرگز کش نمی‌شود
export const dynamic = "force-dynamic";

/**
 * ثبت یک بازدید.
 *
 * از سمت مرورگر صدا زده می‌شود نه در رندر صفحه، تا صفحات کش‌شدنی بمانند.
 * در عوض، مسدودکننده‌های تبلیغات ممکن است جلوی آن را بگیرند و شمارش کمی
 * کمتر از واقعیت باشد — این را در پنل هم نوشته‌ایم.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      path?: unknown;
      referrer?: unknown;
    };

    const path =
      typeof body.path === "string" && body.path.startsWith("/")
        ? body.path.slice(0, 512)
        : "/";
    const referrer =
      typeof body.referrer === "string" && body.referrer
        ? body.referrer.slice(0, 512)
        : null;

    // پنل مدیریت بازدید سایت نیست. جلوی مرورگر هم گرفته شده؛ این‌جا دوباره
    // بررسی می‌شود تا ارسال دستی هم آمار را دستکاری نکند.
    if (path === "/admin" || path.startsWith("/admin/")) {
      return NextResponse.json({ ok: true });
    }

    /**
     * بازدید خودِ صاحب سایت شمرده نمی‌شود.
     *
     * بدون این، هر بار که برای بررسی سایت را باز می‌کنید عدد بالا می‌رود و
     * آمار به‌جای بازدیدکننده واقعی، رفت‌وآمد خودتان را نشان می‌دهد. نشست
     * واقعاً اعتبارسنجی می‌شود، پس کوکی منقضی جلوی شمارش را نمی‌گیرد.
     */
    if (await getCurrentUser()) return NextResponse.json({ ok: true });

    const headers = request.headers;
    const userAgent = headers.get("user-agent") ?? "";

    // درخواست‌های بدون User-Agent تقریباً همیشه اسکریپت‌اند
    if (!userAgent) return NextResponse.json({ ok: true });

    const ua = parseUserAgent(userAgent);
    if (ua.deviceType === "خزنده") return NextResponse.json({ ok: true });

    const ip = clientIpFrom(headers);
    const geo = await lookupGeo(ip, headers);
    const secret = process.env.SESSION_SECRET ?? "fallback";

    pageViews.record({
        path,
        referrer,
        ip: ip ?? null,
        ipTruncated: ip ? truncateIp(ip) : null,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        browser: ua.browser,
        os: ua.os,
        deviceType: ua.deviceType,
        deviceModel: ua.deviceModel,
        userAgent: userAgent.slice(0, 512),
      visitorHash:
        ip && !isPrivateIp(ip) ? visitorHash(ip, userAgent, secret) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // آمار نباید هیچ‌وقت باعث خطای کاربر شود
    return NextResponse.json({ ok: false });
  }
}
