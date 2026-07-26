/**
 * از خروجی استاتیک (`out/`) نسخه‌ای کاملاً آفلاین از سایت می‌سازد: هر صفحه
 * یک فایل HTML خودبسنده که CSS، فونت، تصویر و اسکریپتش داخل خودش است و با
 * دوبار کلیک در هر مرورگری باز می‌شود، بدون هیچ سروری.
 *
 * چرا صرفاً خروجی Next را درون‌خطی نمی‌کنیم: رانتایم چانک تِربوپک هویت هر
 * چانک را از نشانی اسکریپتش می‌گیرد، و وقتی همه‌چیز داخل یک فایل می‌رود آن
 * نشانی‌ها معنا ندارند و React اصلاً hydrate نمی‌شود. پس مارک‌آپ و CSS واقعیِ
 * ساخته‌شده برداشته می‌شود و به‌جای رانتایم React، همان ماژول صحنه
 * (`lib/scene/urmiaScene.js`) مستقیم اجرا می‌شود.
 *
 * اجرا:
 *   NEXT_EXPORT=1 next build
 *   node scripts/build-preview.mjs <پوشه مقصد>
 *   node scripts/build-preview.mjs <فایل> --artifact   (فقط صفحه اصلی، بدون تگ‌های سند)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const OUT = "out";
const MIME = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

/** مسیر سایت → نام فایل آفلاین */
const PAGES = [
  { route: "/", source: "index.html", file: "index.html" },
  { route: "/resume", source: "resume.html", file: "resume.html" },
  { route: "/publications", source: "publications.html", file: "publications.html" },
  { route: "/activities", source: "activities.html", file: "activities.html" },
  { route: "/contact", source: "contact.html", file: "contact.html" },
];

const asset = (url) => join(OUT, url.split("?")[0].replace(/^\//, ""));

function dataUri(url) {
  const file = asset(url);
  if (!existsSync(file)) return null;
  const ext = file.slice(file.lastIndexOf("."));
  return `data:${MIME[ext] ?? "application/octet-stream"};base64,${readFileSync(
    file,
  ).toString("base64")}`;
}

function inlineCss(source) {
  let css = "";
  for (const [, href] of source.matchAll(
    /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  )) {
    if (!existsSync(asset(href))) continue;
    css += readFileSync(asset(href), "utf8").replace(
      /url\(([^)]+)\)/g,
      (m, raw) => {
        const url = raw.trim().replace(/^["']|["']$/g, "");
        if (url.startsWith("data:")) return m;
        const resolved = url.startsWith("/")
          ? url
          : "/" + join(dirname(href), url).replace(/^\/+/, "");
        const uri = dataUri(resolved);
        return uri ? `url(${uri})` : m;
      },
    );
  }
  return css;
}

function inlineBody(source, { standalone }) {
  let body = source.slice(
    source.indexOf(">", source.indexOf("<body")) + 1,
    source.lastIndexOf("</body>"),
  );
  body = body.replace(/<script\b[\s\S]*?<\/script>/g, "");
  body = body.replace(/<template\b[\s\S]*?<\/template>/g, "");

  for (const url of new Set(body.match(/\/[\w.-]+\.(?:jpg|jpeg|png|svg)/g) ?? [])) {
    const uri = dataUri(url);
    if (uri) body = body.split(url).join(uri);
  }

  if (standalone) {
    // پیوندهای داخلی به فایل همسایه اشاره می‌کنند تا سایت آفلاین قابل گشتن باشد
    body = body.replace(/href="(\/[^"]*)"/g, (m, route) => {
      const page = PAGES.find((p) => p.route === route);
      return page ? `href="${page.file}"` : m;
    });
  } else {
    // پریویو تک‌صفحه‌ای: جایی برای رفتن نیست
    body = body.replace(/href="\/[^"]*"/g, 'href="#"');
  }
  return body;
}

const three = readFileSync("node_modules/three/build/three.cjs", "utf8");
const sceneModule = readFileSync("lib/scene/urmiaScene.js", "utf8").replace(
  "export function createUrmiaScene",
  "function createUrmiaScene",
);

/** صحنه WebGL — فقط صفحه اصلی آن را دارد. */
const glScript = `<script>
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
  var stage = document.querySelector("section.scene");
  if (!stage) return;
  var host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1s";
  stage.insertBefore(host, stage.firstChild);
  var cssScene = stage.querySelector(".scene-stage") && stage.querySelector(".scene-stage").parentElement;
  var scene = createUrmiaScene(THREE, host, {
    onReady: function () {
      host.style.opacity = "1";
      if (cssScene) cssScene.style.opacity = "0";
    }
  });
  if (!scene) host.remove();
})();
</script>`;

/**
 * رفتارهایی که در سایت از React می‌آیند و اینجا باید مستقیم نوشته شوند:
 * چرخش صحنه CSS با نشانگر، و ورود بخش‌ها هنگام اسکرول.
 */
const behaviourScript = `<script>
(function(){
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("reveal-in"); });
    return;
  }

  var world = document.querySelector(".scene-world");
  var stage = document.querySelector(".scene-stage");
  if (world && stage) {
    var px = 0, py = 0, cx = 0, cy = 0, active = false, start = performance.now();
    window.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      active = true;
    }, { passive: true });
    (function loop(now) {
      var t = (now - start) / 1000;
      var tx = active ? px : Math.sin(t * 0.17) * 0.32;
      var ty = active ? py : Math.cos(t * 0.12) * 0.22;
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      world.style.transform = "rotateX(" + (-cy * 7).toFixed(3) + "deg) rotateY(" + (cx * 10).toFixed(3) + "deg)";
      requestAnimationFrame(loop);
    })(start);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -12% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();
</script>`;

/**
 * سایت خودش فقط به prefers-color-scheme گوش می‌دهد چون کلید تم ندارد.
 * میزبان artifact کلید تم دارد و آن را با data-theme روی ریشه می‌گذارد.
 */
const themeBridge = `
:root[data-theme="light"]{--background:#faf9f6;--surface:#ffffff;--border:#e5e1d8;--foreground:#1c1b18;--muted:#6b6862;--accent:#0f5b52;--accent-soft:#e6f1ef}
:root[data-theme="dark"]{--background:#12130f;--surface:#1b1c18;--border:#2e302a;--foreground:#eeece5;--muted:#a3a096;--accent:#6fd3c2;--accent-soft:#17302c}
`;

function buildPage(page, { standalone, fragment }) {
  const source = readFileSync(join(OUT, page.source), "utf8");
  const css = inlineCss(source);
  const body = inlineBody(source, { standalone });
  const htmlAttrs = source.match(/<html\b([^>]*)>/)?.[1] ?? ' lang="fa" dir="rtl"';
  const bodyAttrs = source.match(/<body\b([^>]*)>/)?.[1] ?? "";
  const title = source.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const scripts = (page.route === "/" ? glScript : "") + behaviourScript;

  if (fragment) {
    const htmlClass = htmlAttrs.match(/class="([^"]*)"/)?.[1] ?? "";
    const bodyClass = bodyAttrs.match(/class="([^"]*)"/)?.[1] ?? "";
    return `<title>${title}</title>
<style>${css}${themeBridge}</style>
<div lang="fa" dir="rtl" class="${htmlClass} ${bodyClass}">
${body}
</div>
${scripts}`;
  }

  return `<!doctype html>
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
}

const target = process.argv[2];
if (!target) {
  console.error("usage: node scripts/build-preview.mjs <dir | file --artifact>");
  process.exit(1);
}

if (process.argv.includes("--artifact")) {
  const html = buildPage(PAGES[0], { standalone: false, fragment: true });
  writeFileSync(target, html);
  console.log(`${target}  ${(html.length / 1024 / 1024).toFixed(2)} MB`);
} else {
  mkdirSync(target, { recursive: true });
  for (const page of PAGES) {
    if (!existsSync(join(OUT, page.source))) {
      console.warn(`skipped ${page.source} (not in ${OUT})`);
      continue;
    }
    const html = buildPage(page, { standalone: true, fragment: false });
    writeFileSync(join(target, page.file), html);
    console.log(`${page.file}  ${(html.length / 1024).toFixed(0)} KB`);
  }
}
