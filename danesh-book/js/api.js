/* دانش بوک — ارتباط با API بک‌اند */

const API_BASE = "/api";
const CUSTOMER_TOKEN_KEY = "db_customer_token";
const CUSTOMER_INFO_KEY = "db_customer_info";

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    const message = (data && data.error) || "خطایی رخ داد.";
    throw new Error(message);
  }
  return data;
}

/* ===== دسته‌بندی و محصولات ===== */
function fetchCategories() {
  return apiRequest("/categories");
}

function fetchProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const suffix = qs.toString() ? "?" + qs.toString() : "";
  return apiRequest("/products" + suffix);
}

function fetchProduct(id) {
  return apiRequest("/products/" + encodeURIComponent(id));
}

/* ===== سبد خرید و سفارش ===== */
function submitOrder(payload) {
  return apiRequest("/orders", { method: "POST", body: payload, token: getCustomerToken() });
}

function fetchMyOrders() {
  return apiRequest("/orders/mine", { token: getCustomerToken() });
}

function fetchMyOrder(id) {
  return apiRequest("/orders/mine/" + id, { token: getCustomerToken() });
}

function submitReturnRequest(orderId, reason) {
  return apiRequest(`/orders/mine/${orderId}/return`, { method: "POST", body: { reason }, token: getCustomerToken() });
}

/* ===== حساب کاربری مشتری ===== */
function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}
function getCustomerInfo() {
  try { return JSON.parse(localStorage.getItem(CUSTOMER_INFO_KEY)); } catch (e) { return null; }
}
function setCustomerSession(token, user) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(user));
}
function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_INFO_KEY);
}
function registerCustomer(payload) {
  return apiRequest("/customers/register", { method: "POST", body: payload });
}
function loginCustomer(payload) {
  return apiRequest("/customers/login", { method: "POST", body: payload });
}
function fetchMyProfile() {
  return apiRequest("/customers/me", { token: getCustomerToken() });
}

/* ===== پک‌های آموزشی ===== */
function fetchBundles() {
  return apiRequest("/bundles");
}
function fetchBundle(id) {
  return apiRequest("/bundles/" + encodeURIComponent(id));
}

/* ===== تنظیمات و محتوای سایت ===== */
function fetchSettings() {
  return apiRequest("/settings");
}
function fetchSite() {
  return apiRequest("/site");
}
function fetchSlides() {
  return apiRequest("/slides");
}
function fetchPage(slug) {
  return apiRequest("/pages/" + encodeURIComponent(slug));
}
function submitContactMessage(payload) {
  return apiRequest("/contact", { method: "POST", body: payload });
}
function subscribeNewsletter(email) {
  return apiRequest("/newsletter", { method: "POST", body: { email } });
}

/* ===== بلاگ آموزشی ===== */
function fetchPosts() {
  return apiRequest("/posts");
}
function fetchPost(slug) {
  return apiRequest("/posts/" + encodeURIComponent(slug));
}

/* ===== خرید عمده/سازمانی ===== */
function submitBulkOrder(payload) {
  return apiRequest("/bulk-orders", { method: "POST", body: payload });
}

/* ===== پرداخت ===== */
function requestPayment(orderId) {
  return apiRequest("/payment/request", { method: "POST", body: { orderId } });
}
function fetchPaymentStatus(orderId) {
  return apiRequest("/payment/status/" + encodeURIComponent(orderId));
}
