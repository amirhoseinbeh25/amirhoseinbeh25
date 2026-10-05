/* دانش بوک — منطق مشترک: سبد خرید، کارت محصول، نوتیفیکیشن */

const CART_KEY = "db_cart";

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

function addToCart(id, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  saveCart(cart);
  showToast("کتاب به سبد خرید اضافه شد ✓");
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function setCartQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
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

  return `
  <div class="product-card">
    <a href="product.html?id=${book.id}" class="cover-wrap">
      ${badge}
      <button class="wish-btn" title="افزودن به علاقه‌مندی" onclick="event.preventDefault();showToast('به علاقه‌مندی‌ها اضافه شد')">♡</button>
      <img src="${bookCoverDataUrl(book)}" alt="${book.title}">
    </a>
    <div class="product-info">
      <span class="product-cat">${getCategoryTitle(book.category)}</span>
      <a href="product.html?id=${book.id}"><h3 class="product-title">${book.title}</h3></a>
      <span class="product-author">نویسنده: ${book.author}</span>
      <span class="product-rating">${starString(book.rating)}</span>
      <div class="product-price-row">
        <span class="price-now">${formatPrice(book.price)}</span>
        ${book.oldPrice ? `<span class="price-old">${formatPrice(book.oldPrice)}</span>` : ""}
      </div>
      <button class="add-cart-btn" onclick="addToCart(${book.id})">🛒 افزودن به سبد خرید</button>
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
