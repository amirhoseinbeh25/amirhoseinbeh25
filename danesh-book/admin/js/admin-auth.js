/* دانش بوک — احراز هویت و لایه مشترک پنل ادمین */

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

const ADMIN_TOKEN_KEY = "db_admin_token";
const ADMIN_INFO_KEY = "db_admin_info";

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminSession(token, admin) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
}

function getAdminInfo() {
  try { return JSON.parse(localStorage.getItem(ADMIN_INFO_KEY)); } catch (e) { return null; }
}

function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
}

function requireAdminAuth() {
  if (!getAdminToken()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function adminApi(path, opts = {}) {
  return apiRequest(path, { ...opts, token: getAdminToken() }).catch(err => {
    if (err.message && err.message.includes("نشست")) {
      clearAdminSession();
      window.location.href = "login.html";
    }
    throw err;
  });
}

function showAdminToast(msg, isError = false) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = isError ? "show error" : "show";
  clearTimeout(window._adminToastTimer);
  window._adminToastTimer = setTimeout(() => { toast.className = ""; }, 2500);
}

const ADMIN_NAV = [
  { group: "", items: [
    { href: "index.html", label: "داشبورد", icon: "📊", key: "dashboard" }
  ] },
  { group: "فروشگاه", items: [
    { href: "products.html", label: "کتاب‌ها", icon: "📚", key: "products" },
    { href: "categories.html", label: "درس، پایه و رشته", icon: "🏷️", key: "categories" },
    { href: "bundles.html", label: "پک‌های آموزشی", icon: "🎁", key: "bundles" }
  ] },
  { group: "فروش و مشتریان", items: [
    { href: "orders.html", label: "سفارش‌ها", icon: "🧾", key: "orders", badge: "pendingOrders" },
    { href: "returns.html", label: "مرجوعی‌ها", icon: "↩️", key: "returns", badge: "pendingReturns" },
    { href: "bulk-orders.html", label: "سفارش‌های عمده", icon: "🏫", key: "bulk-orders", badge: "pendingBulkOrders" },
    { href: "customers.html", label: "مشتریان", icon: "👥", key: "customers" }
  ] },
  { group: "ظاهر و محتوای سایت", items: [
    { href: "slides.html", label: "اسلایدر صفحه اصلی", icon: "🖼️", key: "slides" },
    { href: "settings.html", label: "تنظیمات و ظاهر سایت", icon: "⚙️", key: "settings" },
    { href: "menus.html", label: "منوها و لینک‌ها", icon: "🧭", key: "menus" },
    { href: "pages.html", label: "صفحات سایت", icon: "📄", key: "pages" },
    { href: "posts.html", label: "وبلاگ", icon: "✍️", key: "posts" },
    { href: "media.html", label: "کتابخانه تصاویر", icon: "🗂️", key: "media" }
  ] },
  { group: "ارتباط با مشتری", items: [
    { href: "messages.html", label: "پیام‌های تماس", icon: "✉️", key: "messages", badge: "unreadMessages" },
    { href: "newsletter.html", label: "خبرنامه", icon: "📬", key: "newsletter" }
  ] }
];

function renderAdminShell(activeKey, pageTitle) {
  if (!requireAdminAuth()) return;
  const admin = getAdminInfo();

  const navHtml = ADMIN_NAV.map(group => `
    ${group.group ? `<div class="nav-group-title">${esc(group.group)}</div>` : ""}
    ${group.items.map(item => `
      <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
        <span class="nav-ico">${item.icon}</span><span class="nav-label">${item.label}</span>
        ${item.badge ? `<b class="nav-badge" data-badge="${item.badge}" hidden></b>` : ""}
      </a>`).join("")}`).join("");

  document.getElementById("admin-sidebar").innerHTML = `
    <div class="brand">📚 دانش<span class="dot">بوک</span><br><small style="font-size:12px; font-weight:400; opacity:.7;">پنل مدیریت</small></div>
    <nav>${navHtml}</nav>
    <div class="sidebar-footer">
      <div class="admin-name">👤 ${esc(admin ? admin.name || admin.email : "")}</div>
      <button id="logoutBtn">خروج از حساب</button>
    </div>`;

  document.getElementById("admin-topbar").innerHTML = `
    <button class="sidebar-toggle" id="sidebarToggle" aria-label="باز کردن منو">☰</button>
    <h1>${esc(pageTitle)}</h1>
    <a class="view-site" href="../index.html" target="_blank" rel="noopener">مشاهده سایت ↗</a>`;

  const sidebar = document.getElementById("admin-sidebar");
  let overlay = document.querySelector(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);
  }
  const closeSidebar = () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); };
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  });
  overlay.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSidebar(); });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearAdminSession();
    window.location.href = "login.html";
  });

  refreshAdminBadges();
}

/* تعداد موارد در انتظار (سفارش، مرجوعی، پیام) کنار منوها نمایش داده می‌شود */
async function refreshAdminBadges() {
  try {
    const counts = await adminApi("/dashboard/badges");
    document.querySelectorAll("[data-badge]").forEach(el => {
      const n = Number(counts[el.dataset.badge]) || 0;
      el.textContent = n.toLocaleString("fa-IR");
      el.hidden = n === 0;
    });
  } catch (e) { /* قابل چشم‌پوشی */ }
}
