import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * نگهبان اولیه پنل مدیریت.
 *
 * فقط وجود کوکی نشست بررسی می‌شود، نه اعتبار آن — این‌جا به پایگاه داده
 * دسترسی نداریم و مستندات هم می‌گویند proxy جای مدیریت کامل نشست نیست.
 * بررسی واقعی در خود صفحات با getCurrentUser انجام می‌شود؛ این لایه فقط
 * بازدیدکننده‌ای را که اصلاً وارد نشده زودتر به صفحه ورود می‌فرستد.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = request.cookies.has("admin_session");
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
