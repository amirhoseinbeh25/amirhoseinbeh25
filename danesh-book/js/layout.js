/* دانش بوک — هدر، فوتر و منوهای مشترک تمام صفحات (همه از پنل ادمین قابل ویرایش‌اند) */

const SITE_CACHE_KEY = "db_site_cache";

function injectBackgroundBlobs() {
  if (document.querySelector(".bg-blobs")) return;
  const wrap = document.createElement("div");
  wrap.className = "bg-blobs";
  wrap.innerHTML = `
    <span class="blob blob-1"></span>
    <span class="blob blob-2"></span>
    <span class="blob blob-3"></span>
    <span class="blob blob-4"></span>
    <span class="blob blob-5"></span>`;
  document.body.prepend(wrap);
}
injectBackgroundBlobs();

function readSiteCache() {
  try { return JSON.parse(localStorage.getItem(SITE_CACHE_KEY)); } catch (e) { return null; }
}

function hexToRgbList(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/* رنگ‌های انتخاب‌شده در پنل ادمین روی متغیرهای CSS اعمال می‌شوند */
function applyTheme(settings) {
  if (!settings) return;
  const root = document.documentElement.style;
  const map = {
    theme_primary: "primary",
    theme_primary_dark: "primary-dark",
    theme_accent: "accent",
    theme_accent_dark: "accent-dark",
    theme_text: "text"
  };
  for (const [key, name] of Object.entries(map)) {
    const rgb = hexToRgbList(settings[key]);
    if (!rgb) continue;
    root.setProperty(`--color-${name}`, settings[key]);
    root.setProperty(`--rgb-${name}`, rgb);
  }
  if (hexToRgbList(settings.theme_page_bg)) root.setProperty("--color-page-bg", settings.theme_page_bg);
}

// رنگ‌ها از نسخه ذخیره‌شده قبلی، پیش از دریافت از سرور اعمال می‌شوند تا صفحه چشمک نزند
applyTheme((readSiteCache() || {}).settings);

function setting(key, fallback = "") {
  const value = SITE[key];
  return value === undefined || value === null ? fallback : value;
}

function menuItems(location) {
  return (MENU && MENU[location]) || [];
}

function linkAttrs(item) {
  return `href="${esc(safeUrl(item.url))}"${item.newTab ? ` target="_blank" rel="noopener"` : ""}`;
}

function linkLabel(item) {
  return `${item.icon ? `<span class="link-ico">${esc(item.icon)}</span>` : ""}${esc(item.label)}`;
}

function categoryLinks() {
  return CATEGORIES.map(c => ({ label: c.title, icon: c.icon, url: "shop.html?cat=" + encodeURIComponent(c.id) }));
}

function logoHTML() {
  const img = safeImageUrl(setting("logo_image"));
  if (img) {
    return `<a href="index.html" class="logo logo-img"><img src="${esc(img)}" alt="${esc(setting("site_name", "دانش بوک"))}"></a>`;
  }
  return `<a href="index.html" class="logo"><span class="logo-icon">${esc(setting("logo_icon", "📚"))}</span>${esc(setting("logo_text_1", "دانش"))}<span class="dot">${esc(setting("logo_text_2", "بوک"))}</span></a>`;
}

function mainNavHTML() {
  return menuItems("main").map(item => {
    if (item.type === "categories") {
      return `
        <li class="has-dropdown">
          <a href="shop.html" class="dropdown-toggle">${linkLabel(item)} <span class="caret">▾</span></a>
          <ul class="dropdown">
            ${categoryLinks().map(c => `<li><a ${linkAttrs(c)}>${linkLabel(c)}</a></li>`).join("")}
          </ul>
        </li>`;
    }
    return `<li><a ${linkAttrs(item)}>${linkLabel(item)}</a></li>`;
  }).join("");
}

function drawerNavHTML() {
  return menuItems("main").map(item => {
    if (item.type === "categories") {
      return `
        <details class="drawer-group" open>
          <summary>${linkLabel(item)}</summary>
          ${categoryLinks().map(c => `<a ${linkAttrs(c)}>${linkLabel(c)}</a>`).join("")}
        </details>`;
    }
    return `<a ${linkAttrs(item)}>${linkLabel(item)}</a>`;
  }).join("");
}

function socialLinksHTML(withLabels) {
  return menuItems("social").map(item =>
    `<a ${linkAttrs(item)} title="${esc(item.label)}">${withLabels ? esc(item.label) : esc(item.icon || item.label)}</a>`
  ).join("");
}

function headerTemplate() {
  const customer = typeof getCustomerInfo === "function" ? getCustomerInfo() : null;
  const firstName = customer && customer.name ? String(customer.name).split(" ")[0] : "";
  const accountHref = customer ? "account.html" : "login.html";
  const accountLabel = customer ? esc(firstName) : "حساب من";
  const showTopbar = setting("topbar_enabled", "1") !== "0";

  return `
  ${showTopbar ? `
  <div class="topbar">
    <div class="container">
      <div class="topbar-links">
        ${setting("topbar_text") ? `<span class="topbar-text">${esc(setting("topbar_text"))}</span>` : ""}
        ${setting("site_announcement") ? `<span class="topbar-announcement">${esc(setting("site_announcement"))}</span>` : ""}
      </div>
      <div class="topbar-social">${socialLinksHTML(true)}</div>
    </div>
  </div>` : ""}

  <header class="site-header">
    <div class="container header-main">
      <button class="menu-toggle" id="menuToggle" aria-label="باز کردن منو" aria-controls="mobileDrawer" aria-expanded="false">☰</button>
      ${logoHTML()}

      <form class="search-box" id="searchForm" role="search">
        <input type="search" id="searchInput" placeholder="${esc(setting("search_placeholder", "جست‌وجوی کتاب..."))}" aria-label="جست‌وجو">
        <button type="submit" aria-label="جست‌وجو">🔍</button>
      </form>

      <div class="header-icons">
        <a href="${accountHref}" class="icon-link"><span class="icon">👤</span><span class="icon-label">${accountLabel}</span></a>
        <a href="compare.html" class="icon-link">
          <span class="icon">⇄</span><span class="icon-label">مقایسه</span>
          <span class="badge-count" data-compare-count>0</span>
        </a>
        <a href="cart.html" class="icon-link">
          <span class="icon">🛒</span><span class="icon-label">سبد خرید</span>
          <span class="badge-count" data-cart-count>0</span>
        </a>
      </div>
    </div>
    <nav class="category-nav" aria-label="منوی اصلی">
      <div class="container">
        <ul>${mainNavHTML()}</ul>
      </div>
    </nav>
  </header>

  <div class="drawer-overlay" id="drawerOverlay"></div>
  <aside class="mobile-drawer" id="mobileDrawer" aria-hidden="true">
    <div class="drawer-head">
      ${logoHTML()}
      <button class="drawer-close" id="drawerClose" aria-label="بستن منو">✕</button>
    </div>
    <nav class="drawer-nav">${drawerNavHTML()}</nav>
    <div class="drawer-extra">
      <a href="${accountHref}">👤 ${customer ? "حساب کاربری " + esc(firstName) : "ورود / ثبت‌نام"}</a>
      <a href="compare.html">⇄ مقایسه کتاب‌ها <span class="badge-inline" data-compare-count>0</span></a>
      ${setting("contact_phone") ? `<a href="${esc(telHref(setting("contact_phone")))}">☎ ${esc(setting("contact_phone"))}</a>` : ""}
    </div>
    <div class="drawer-social">${socialLinksHTML(false)}</div>
  </aside>

  <nav class="bottom-nav" aria-label="منوی پایین">
    <a href="index.html" data-bottom="index"><span class="ico">🏠</span>خانه</a>
    <button type="button" id="bottomCatsBtn"><span class="ico">📚</span>دسته‌بندی</button>
    <a href="shop.html" data-bottom="shop"><span class="ico">🔍</span>فروشگاه</a>
    <a href="cart.html" data-bottom="cart"><span class="ico">🛒<b class="badge-count" data-cart-count>0</b></span>سبد خرید</a>
    <a href="${accountHref}" data-bottom="account"><span class="ico">👤</span>${customer ? "حساب من" : "ورود"}</a>
  </nav>`;
}

function enamadHTML() {
  const id = setting("enamad_id");
  const code = setting("enamad_code");
  if (!/^[A-Za-z0-9]+$/.test(id) || !/^[A-Za-z0-9]+$/.test(code)) return "";
  const q = `id=${id}&amp;Code=${code}`;
  return `
    <div class="trust-seals">
      <a referrerpolicy="origin" target="_blank" rel="noopener" href="https://trustseal.enamad.ir/?${q}">
        <img referrerpolicy="origin" src="https://trustseal.enamad.ir/logo.aspx?${q}" alt="نماد اعتماد الکترونیکی" style="cursor:pointer" code="${code}">
      </a>
    </div>`;
}

function footerLinksColumn(titleKey, fallbackTitle, location) {
  const items = menuItems(location);
  if (!items.length) return "";
  return `
      <div class="footer-col footer-links">
        <h4>${esc(setting(titleKey, fallbackTitle))}</h4>
        <ul>${items.map(it => `<li><a ${linkAttrs(it)}>${linkLabel(it)}</a></li>`).join("")}</ul>
      </div>`;
}

function footerTemplate() {
  const phone = setting("contact_phone");
  const email = setting("contact_email");
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-col footer-about">
        <h4>${esc(setting("footer_about_title", "📚 دانش بوک"))}</h4>
        <p>${esc(setting("footer_about_text"))}</p>
        <div class="footer-social">${socialLinksHTML(false)}</div>
      </div>
      ${footerLinksColumn("footer_col1_title", "دسترسی سریع", "footer_1")}
      ${footerLinksColumn("footer_col2_title", "خدمات مشتریان", "footer_2")}
      <div class="footer-col footer-contact">
        <h4>${esc(setting("footer_contact_title", "تماس با ما"))}</h4>
        ${setting("contact_address") ? `<p>📍 ${esc(setting("contact_address"))}</p>` : ""}
        ${phone ? `<p>☎ <a href="${esc(telHref(phone))}">${esc(phone)}</a></p>` : ""}
        ${email ? `<p>✉ <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ""}
        ${enamadHTML()}
      </div>
    </div>
    <div class="container footer-bottom">
      <span>${esc(setting("footer_copyright"))}</span>
      <span>${esc(setting("footer_credit"))}</span>
    </div>
  </footer>`;
}

/* لینک صفحه فعلی در منوها پررنگ می‌شود */
function markActiveLinks(activeHint) {
  const normalize = (url) => {
    const u = new URL(url, location.href);
    let file = u.pathname.split("/").pop() || "index.html";
    return { file, full: file + u.search };
  };
  const here = normalize(location.href);
  const hintFile = activeHint ? activeHint.replace(/\.html$/, "") + ".html" : here.file;
  const links = Array.from(document.querySelectorAll("nav.category-nav a, .drawer-nav a"));
  let matched = links.filter(a => normalize(a.href).full === here.full);
  if (!matched.length) matched = links.filter(a => { const n = normalize(a.href); return n.file === hintFile && n.full === n.file; });
  matched.forEach(a => {
    a.classList.add("active");
    const parent = a.closest(".has-dropdown");
    if (parent) parent.querySelector(".dropdown-toggle").classList.add("active");
  });
  const bottomKey = { "index.html": "index", "shop.html": "shop", "cart.html": "cart", "account.html": "account", "login.html": "account" }[hintFile];
  if (bottomKey) document.querySelectorAll(`[data-bottom="${bottomKey}"]`).forEach(a => a.classList.add("active"));
}

function setFavicon() {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  const img = safeImageUrl(setting("favicon_image")) || safeImageUrl(setting("logo_image"));
  if (img) {
    link.href = img;
  } else {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${xmlEscape(setting("logo_icon", "📚"))}</text></svg>`;
    link.href = "data:image/svg+xml," + encodeURIComponent(svg);
  }
}

function applySiteNameToTitle() {
  const name = setting("site_name");
  if (!name) return;
  const parts = document.title.split(" | ");
  if (parts.length > 1) {
    parts[parts.length - 1] = name;
    document.title = parts.join(" | ");
  }
}

function openDrawer() {
  const drawer = document.getElementById("mobileDrawer");
  if (!drawer) return;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.getElementById("drawerOverlay").classList.add("show");
  document.body.classList.add("no-scroll");
  const toggle = document.getElementById("menuToggle");
  if (toggle) toggle.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  const drawer = document.getElementById("mobileDrawer");
  if (!drawer) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.getElementById("drawerOverlay").classList.remove("show");
  document.body.classList.remove("no-scroll");
  const toggle = document.getElementById("menuToggle");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function renderLayout(activePage) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) headerEl.innerHTML = headerTemplate();
  if (footerEl) footerEl.innerHTML = footerTemplate();
  document.body.classList.add("has-bottom-nav");

  markActiveLinks(activePage);
  setFavicon();
  applySiteNameToTitle();

  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  const bottomCats = document.getElementById("bottomCatsBtn");
  if (bottomCats) bottomCats.addEventListener("click", openDrawer);
  const drawerClose = document.getElementById("drawerClose");
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  const overlay = document.getElementById("drawerOverlay");
  if (overlay) overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // منوی کشویی دسته‌بندی در صفحه‌های لمسی با یک ضربه باز می‌شود
  document.querySelectorAll(".has-dropdown > .dropdown-toggle").forEach(a => {
    a.addEventListener("click", (e) => {
      const li = a.parentElement;
      if (window.matchMedia("(hover: none)").matches && !li.classList.contains("open")) {
        e.preventDefault();
        li.classList.add("open");
      }
    });
  });
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".has-dropdown.open").forEach(li => { if (!li.contains(e.target)) li.classList.remove("open"); });
  });

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    const params = new URLSearchParams(location.search);
    if (params.get("q")) document.getElementById("searchInput").value = params.get("q");
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.getElementById("searchInput").value.trim();
      window.location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  updateCartBadge();
  if (typeof updateCompareBadge === "function") updateCompareBadge();
}

/*
 * راه‌اندازی هر صفحه: تنظیمات، منوها، دسته‌بندی‌ها، پایه‌ها و رشته‌ها با یک درخواست از سرور گرفته می‌شوند
 * (در صورت قطعی اینترنت، آخرین نسخه ذخیره‌شده استفاده می‌شود) و سپس هدر و فوتر ساخته می‌شوند.
 */
async function initPage(activePage) {
  let site = null;
  try {
    site = await fetchSite();
    try { localStorage.setItem(SITE_CACHE_KEY, JSON.stringify(site)); } catch (e) { /* حافظه مرورگر در دسترس نیست */ }
  } catch (e) {
    site = readSiteCache();
  }
  if (site) {
    SITE = site.settings || {};
    MENU = site.menus || {};
    CATEGORIES = site.categories || [];
    if (Array.isArray(site.grades) && site.grades.length) GRADES = site.grades;
    if (Array.isArray(site.tracks) && site.tracks.length) TRACKS = site.tracks;
    HOME = { sections: site.homeSections || [], trustItems: site.trustItems || [], banners: site.homeBanners || [] };
    applyTheme(SITE);
  }
  renderLayout(activePage);
  return site;
}

/* صفحات محتوایی (درباره ما، قوانین، سوالات متداول و صفحات سفارشی) از پنل ادمین خوانده می‌شوند */
function cmsPageHeadHTML(page) {
  const banner = safeImageUrl(page.bannerImage);
  if (banner) {
    return `
      <div class="photo-banner">
        <div class="photo-layer" style="background-image:${esc(cssUrl(banner))}; --overlay: linear-gradient(135deg, rgba(var(--rgb-primary-dark),.72), rgba(var(--rgb-accent-dark),.6));"></div>
        <div>
          <h1>${page.icon ? esc(page.icon) + " " : ""}${esc(page.title)}</h1>
          ${page.subtitle ? `<p>${esc(page.subtitle)}</p>` : ""}
        </div>
      </div>`;
  }
  return `
    <h1 class="page-title">${page.icon ? esc(page.icon) + " " : ""}${esc(page.title)}</h1>
    ${page.subtitle ? `<p class="page-subtitle">${esc(page.subtitle)}</p>` : ""}`;
}

async function renderCmsPage(slug, rootId = "pageRoot", pagePromise = null) {
  const root = document.getElementById(rootId);
  try {
    const page = (pagePromise && await pagePromise) || await fetchPage(slug);
    document.title = `${page.title} | ${setting("site_name", "دانش بوک")}`;
    root.innerHTML = `
      <div class="breadcrumb"><a href="index.html">خانه</a> / ${esc(page.title)}</div>
      ${cmsPageHeadHTML(page)}
      <div class="rich-text">${renderRichText(page.content)}</div>`;
    return page;
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><div class="ico">📄</div><p>این صفحه پیدا نشد.</p><a href="index.html" class="btn btn-primary">بازگشت به صفحه اصلی</a></div>`;
    return null;
  }
}
