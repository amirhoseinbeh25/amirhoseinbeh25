/* دانش بوک — ارتباط با API بک‌اند */

const API_BASE = "/api";

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
  return apiRequest("/products/" + id);
}

function submitOrder(payload) {
  return apiRequest("/orders", { method: "POST", body: payload });
}
