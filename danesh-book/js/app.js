/* دانش بوک — منطق مشترک: سبد خرید، کارت محصول، مقایسه، نوتیفیکیشن */

const CART_KEY = "db_cart";
const COMPARE_KEY = "db_compare";
const COMPARE_LIMIT = 3;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = cartCount();
}

function addToCart(id, qty = 1, type = "product") {
  const cart = getCart();
  const existing = cart.find(i => i.id === id && (i.type || "product") === type);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty, type });
  }
  saveCart(cart);
  showToast(type === "bundle" ? "پک آموزشی به سبد خرید اضافه شد ✓" : "کتاب به سبد خرید اضافه شد ✓");
}

function removeFromCart(id, type = "product") {
  saveCart(getCart().filter(i => !(i.id === id && (i.type || "product") === type)));
}

function setCartQty(id, qty, type = "product") {
  const cart = getCart();
  const item = cart.find(i => i.id === id && (i.type || "product") === type);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
}

/* ===== مقایسه کتاب‌ها ===== */
function getCompareList() {
  try { return JSON.parse(localStorage.getItem(COMPARE_KEY)) || []; } catch (e) { return []; }
}
function saveCompareList(list) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  updateCompareBadge();
}
function updateCompareBadge() {
  const badge = document.getElementById("compareBadge");
  if (badge) badge.textContent = getCompareList().length;
}
function toggleCompare(id) {
  let list = getCompareList();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    showToast("از لیست مقایسه حذف شد");
  } else {
    if (list.length >= COMPARE_LIMIT) {
      showToast(`حداکثر ${COMPARE_LIMIT} کتاب را می‌توانید مقایسه کنید`, true);
      return;
    }
    list.push(id);
    showToast("به لیست مقایسه اضافه شد ✓");
  }
  saveCompareList(list);
}

function showToast(msg, isError = false) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = isError ? "show error" : "show";
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { toast.className = ""; }, 2400);
}

function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full) + ` (${rating})`;
}

function productCardHTML(book) {
  const discount = book.oldPrice ? Math.round(100 - (book.price / book.oldPrice) * 100) : 0;
  const badge = discount > 0
    ? `<span class="product-badge discount">٪${discount} تخفیف</span>`
    : (book.badge ? `<span class="product-badge">${book.badge}</span>` : "");
  const isComparing = getCompareList().includes(book.id);

  return `
  <div class="product-card">
    <a href="product.html?id=${book.id}" class="cover-wrap">
      ${badge}
      ${book.year ? `<span class="edition-badge">چاپ ${book.year}</span>` : ""}
      <button class="wish-btn" title="افزودن به علاقه‌مندی" onclick="event.preventDefault();showToast('به علاقه‌مندی‌ها اضافه شد')">♡</button>
      <img src="${bookCoverDataUrl(book)}" alt="${book.title}">
    </a>
    <div class="product-info">
      <span class="product-cat">${getCategoryTitle(book.category)}${book.grade ? " | پایه " + getGradeTitle(book.grade) : ""}</span>
      <a href="product.html?id=${book.id}"><h3 class="product-title">${book.title}</h3></a>
      <span class="product-author">مؤلف: ${book.author}${book.publisher ? " | ناشر: " + book.publisher : ""}</span>
      <span class="product-rating">${starString(book.rating)}</span>
      <div class="product-price-row">
        <span class="price-now">${formatPrice(book.price)}</span>
        ${book.oldPrice ? `<span class="price-old">${formatPrice(book.oldPrice)}</span>` : ""}
      </div>
      <div style="display:flex; gap:6px;">
        <button class="add-cart-btn" style="flex:1;" onclick="addToCart(${book.id})">🛒 افزودن به سبد</button>
        <button class="compare-btn ${isComparing ? "active" : ""}" title="افزودن به مقایسه" onclick="toggleCompare(${book.id}); this.classList.toggle('active');">⇄</button>
      </div>
    </div>
  </div>`;
}

function bundleCardHTML(bundle) {
  const discount = bundle.oldPrice ? Math.round(100 - (bundle.price / bundle.oldPrice) * 100) : 0;
  return `
  <div class="bundle-card">
    <div class="bundle-head" style="background:linear-gradient(135deg, ${bundle.color}, #16222b);">
      <span class="bundle-ico">🎁</span>
      ${discount > 0 ? `<span class="product-badge discount">٪${discount} تخفیف</span>` : ""}
    </div>
    <div class="bundle-body">
      <h3>${bundle.title}</h3>
      <p class="bundle-desc">${bundle.description || ""}</p>
      <ul class="bundle-items">
        ${bundle.items.map(it => `<li>📘 ${it.title}</li>`).join("")}
      </ul>
      <div class="product-price-row">
        <span class="price-now">${formatPrice(bundle.price)}</span>
        ${bundle.oldPrice ? `<span class="price-old">${formatPrice(bundle.oldPrice)}</span>` : ""}
      </div>
      <button class="add-cart-btn btn-block" onclick="addToCart(${bundle.id}, 1, 'bundle')">🎁 افزودن پک به سبد خرید</button>
    </div>
  </div>`;
}

function renderProductGrid(containerId, books) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!books.length) {
    el.innerHTML = `<div class="empty-state"><div class="ico">📭</div><p>کتابی با این مشخصات پیدا نشد.</p></div>`;
    return;
  }
  el.innerHTML = books.map(productCardHTML).join("");
}

function renderBundleGrid(containerId, bundles) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!bundles.length) {
    el.innerHTML = `<div class="empty-state"><div class="ico">🎁</div><p>در حال حاضر پک آموزشی فعالی موجود نیست.</p></div>`;
    return;
  }
  el.innerHTML = bundles.map(bundleCardHTML).join("");
}

function startCountdown(elId, hours = 8) {
  const el = document.getElementById(elId);
  if (!el) return;
  let deadline = localStorage.getItem("db_flash_deadline");
  const now = Date.now();
  if (!deadline || Number(deadline) < now) {
    deadline = now + hours * 3600 * 1000;
    localStorage.setItem("db_flash_deadline", String(deadline));
  }
  function tick() {
    const diff = Math.max(0, Number(deadline) - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="box"><b>${String(h).padStart(2, "0")}</b><small>ساعت</small></div>
      <div class="box"><b>${String(m).padStart(2, "0")}</b><small>دقیقه</small></div>
      <div class="box"><b>${String(s).padStart(2, "0")}</b><small>ثانیه</small></div>`;
  }
  tick();
  setInterval(tick, 1000);
}

/* شمارش معکوس تا کنکور سراسری — تاریخ از تنظیمات سایت (API) خوانده می‌شود */
function startExamCountdown(elId, targetDateStr) {
  const el = document.getElementById(elId);
  if (!el || !targetDateStr) return;
  const target = new Date(targetDateStr).getTime();
  function tick() {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.innerHTML = `
      <div class="box"><b>${days}</b><small>روز</small></div>
      <div class="box"><b>${String(h).padStart(2, "0")}</b><small>ساعت</small></div>
      <div class="box"><b>${String(m).padStart(2, "0")}</b><small>دقیقه</small></div>`;
  }
  tick();
  setInterval(tick, 60000);
}

function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dotsWrap = document.getElementById("heroDots");
  if (!slides.length) return;
  let idx = 0;
  if (dotsWrap) {
    dotsWrap.innerHTML = Array.from(slides).map((_, i) =>
      `<button class="${i === 0 ? "active" : ""}" data-i="${i}"></button>`).join("");
  }
  function show(i) {
    slides.forEach((s, j) => s.classList.toggle("active", j === i));
    if (dotsWrap) {
      dotsWrap.querySelectorAll("button").forEach((b, j) => b.classList.toggle("active", j === i));
    }
    idx = i;
  }
  if (dotsWrap) {
    dotsWrap.querySelectorAll("button").forEach(b =>
      b.addEventListener("click", () => show(Number(b.dataset.i))));
  }
  setInterval(() => show((idx + 1) % slides.length), 5000);
}

function initNewsletterForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("با تشکر! شما در خبرنامه دانش بوک عضو شدید 🎉");
    form.reset();
  });
}
