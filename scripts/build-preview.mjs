/**
 * از خروجی استاتیک (`out/`) یک فایل HTML کاملاً خودبسنده می‌سازد که بشود
 * جایی منتشرش کرد و با ماوس با صحنه کار کرد.
 *
 * چرا این‌طور و نه صرفاً درون‌خطی‌کردن خروجی Next: رانتایم چانک تِربوپک هویت
 * هر چانک را از نشانی اسکریپتش می‌گیرد، و وقتی همه چیز داخل یک فایل می‌رود
 * آن نشانی‌ها معنا ندارند و React اصلاً hydrate نمی‌شود. پس مارک‌آپ و CSS
 * واقعیِ ساخته‌شده برداشته می‌شود و به‌جای رانتایم React، همان ماژول صحنه
 * (`lib/scene/urmiaScene.js`) مستقیم اجرا می‌شود.
 *
 * اجرا:  NEXT_EXPORT=1 next build && node scripts/build-preview.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const OUT = "out";
const SOURCE = join(OUT, "index.html");
const TARGET = process.argv[2] ?? "preview.html";

const MIME = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const asset = (url) => join(OUT, url.split("?")[0].replace(/^\//, ""));

function dataUri(url) {
  const file = asset(url);
  if (!existsSync(file)) return null;
  const ext = file.slice(file.lastIndexOf("."));
  return `data:${MIME[ext] ?? "application/octet-stream"};base64,${readFileSync(
    file,
  ).toString("base64")}`;
}

const source = readFileSync(SOURCE, "utf8");

// ---- CSS ساخته‌شده، با فونت‌های درون‌خطی -----------------------------------
let css = "";
for (const [, href] of source.matchAll(
  /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
)) {
  if (!existsSync(asset(href))) continue;
  css += readFileSync(asset(href), "utf8").replace(/url\(([^)]+)\)/g, (m, raw) => {
    const url = raw.trim().replace(/^["']|["']$/g, "");
    if (url.startsWith("data:")) return m;
    const resolved = url.startsWith("/")
      ? url
      : "/" + join(dirname(href), url).replace(/^\/+/, "");
    const uri = dataUri(resolved);
    return uri ? `url(${uri})` : m;
  });
}

// ---- مارک‌آپ صفحه، بدون اسکریپت‌های Next ------------------------------------
const htmlAttrs = source.match(/<html\b([^>]*)>/)?.[1] ?? ' lang="fa" dir="rtl"';
const bodyAttrs = source.match(/<body\b([^>]*)>/)?.[1] ?? "";
let body = source.slice(
  source.indexOf(">", source.indexOf("<body")) + 1,
  source.lastIndexOf("</body>"),
);
body = body.replace(/<script\b[\s\S]*?<\/script>/g, "");
body = body.replace(/<template\b[\s\S]*?<\/template>/g, "");

// تصاویر
for (const url of new Set(body.match(/\/[\w.-]+\.(?:jpg|jpeg|png|svg)/g) ?? [])) {
  const uri = dataUri(url);
  if (uri) body = body.split(url).join(uri);
}

// این پریویو فقط یک صفحه است؛ پیوندها به صفحات دیگر جایی برای رفتن ندارند.
body = body.replace(/href="\/[^"]*"/g, 'href="#" data-preview-link');

const three = readFileSync("node_modules/three/build/three.cjs", "utf8");
const sceneModule = readFileSync("lib/scene/urmiaScene.js", "utf8").replace(
  "export function createUrmiaScene",
  "function createUrmiaScene",
);

const bootstrap = `
// همان ماژول صحنه سایت، بدون React
const stage = document.querySelector("section.scene");
if (stage) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1s";
  // پشت پرده خوانایی و متن، ولی جلوی صحنه CSS
  stage.insertBefore(host, stage.firstChild);

  const cssScene = stage.querySelector(".scene-stage")?.parentElement;
  const scene = createUrmiaScene(THREE, host, {
    onReady() {
      host.style.opacity = "1";
      if (cssScene) cssScene.style.opacity = "0";
    },
  });
  if (!scene) host.remove();
}

// ورود بخش‌ها هنگام اسکرول، مثل کامپوننت Reveal سایت
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("reveal-in");
      io.unobserve(entry.target);
    }
  }
}, { threshold: 0.15, rootMargin: "0px 0px -12% 0px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
`;

const scripts = `<script>
(function(){
  var module = { exports: {} }, exports = module.exports;
  ${three}
  window.THREE = module.exports;
})();
</script>
<script>
(function(){
  var THREE = window.THREE;
  ${sceneModule}
  ${bootstrap}
})();
</script>`;

/**
 * سایت خودش فقط به prefers-color-scheme گوش می‌دهد، چون کلید تم ندارد.
 * میزبان artifact کلید تم دارد و آن را با data-theme روی ریشه می‌گذارد، پس
 * فقط در همین پریویو همان متغیرها به data-theme هم وصل می‌شوند.
 */
const themeBridge = `
:root[data-theme="light"]{--background:#faf9f6;--surface:#ffffff;--border:#e5e1d8;--foreground:#1c1b18;--muted:#6b6862;--accent:#0f5b52;--accent-soft:#e6f1ef}
:root[data-theme="dark"]{--background:#12130f;--surface:#1b1c18;--border:#2e302a;--foreground:#eeece5;--muted:#a3a096;--accent:#6fd3c2;--accent-soft:#17302c}
`;

// حالت artifact: میزبان خودش سند را می‌سازد، پس اینجا فقط محتوا می‌آید و
// ویژگی‌های <html> و <body> روی یک ظرف می‌نشینند.
const asFragment = process.argv.includes("--artifact");

const htmlClass = htmlAttrs.match(/class="([^"]*)"/)?.[1] ?? "";
const bodyClass = bodyAttrs.match(/class="([^"]*)"/)?.[1] ?? "";
const title = source.match(/<title>([^<]*)<\/title>/)?.[1] ?? "پریویو";

const html = asFragment
  ? `<title>${title}</title>
<style>${css}${themeBridge}</style>
<div lang="fa" dir="rtl" class="${htmlClass} ${bodyClass}">
${body}
</div>
${scripts}`
  : `<!doctype html>
<html${htmlAttrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${css}${themeBridge}</style>
</head>
<body${bodyAttrs}>
${body}
${scripts}
</body>
</html>`;

writeFileSync(TARGET, html);
console.log(
  `${TARGET}  ${(html.length / 1024 / 1024).toFixed(2)} MB`,
  `\nremaining /_next refs: ${(html.match(/\/_next\//g) ?? []).length}`,
);
