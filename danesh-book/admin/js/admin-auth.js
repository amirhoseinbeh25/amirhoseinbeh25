/* دانش بوک — احراز هویت و لایه مشترک پنل ادمین */

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
  { href: "index.html", label: "داشبورد", icon: "📊", key: "dashboard" },
  { href: "products.html", label: "مدیریت کتاب‌ها", icon: "📚", key: "products" },
  { href: "categories.html", label: "دسته‌بندی‌ها", icon: "🏷️", key: "categories" },
  { href: "orders.html", label: "سفارش‌ها", icon: "🧾", key: "orders" }
];

function renderAdminShell(activeKey, pageTitle) {
  if (!requireAdminAuth()) return;
  const admin = getAdminInfo();

  const navHtml = ADMIN_NAV.map(item => `
    <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
      <span>${item.icon}</span>${item.label}
    </a>`).join("");

  document.getElementById("admin-sidebar").innerHTML = `
    <div class="brand">📚 دانش<span class="dot">بوک</span><br><small style="font-size:12px; font-weight:400; opacity:.7;">پنل مدیریت</small></div>
    <nav>${navHtml}</nav>
    <div class="sidebar-footer">
      <div class="admin-name">👤 ${admin ? admin.name || admin.email : ""}</div>
      <button id="logoutBtn">خروج از حساب</button>
    </div>`;

  document.getElementById("admin-topbar").innerHTML = `
    <h1>${pageTitle}</h1>
    <a class="view-site" href="../index.html" target="_blank">مشاهده سایت ↗</a>`;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearAdminSession();
    window.location.href = "login.html";
  });
}
