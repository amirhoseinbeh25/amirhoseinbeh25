/* دانش بوک — منطق مشترک: سبد خرید، کارت محصول، مقایسه، اسلایدر، نوتیفیکیشن */

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
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach(b => {
    b.textContent = count;
    b.classList.toggle("is-empty", count === 0);
  });
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

/* هزینه ارسال طبق تنظیمات پنل ادمین */
function shippingCost(subtotal) {
  const cost = Number(setting("shipping_cost", 35000)) || 0;
  const freeThreshold = Number(setting("free_shipping_threshold", 500000)) || 0;
  return subtotal === 0 || subtotal >= freeThreshold ? 0 : cost;
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
  const count = getCompareList().length;
  document.querySelectorAll("[data-compare-count]").forEach(b => {
    b.textContent = count;
    b.classList.toggle("is-empty", count === 0);
  });
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
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = isError ? "show error" : "show";
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { toast.className = ""; }, 2400);
}

function starString(rating) {
  const r = Number(rating) || 0;
  const full = Math.round(r);
  return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full)) + ` (${faNum(r)})`;
}

function productCardHTML(book) {
  const discount = book.oldPrice ? Math.round(100 - (book.price / book.oldPrice) * 100) : 0;
  const badge = discount > 0
    ? `<span class="product-badge discount">٪${faNum(discount)} تخفیف</span>`
    : (book.badge ? `<span class="product-badge">${esc(book.badge)}</span>` : "");
  const isComparing = getCompareList().includes(book.id);
  const id = Number(book.id);

  return `
  <div class="product-card">
    <a href="product.html?id=${id}" class="cover-wrap">
      ${badge}
      ${book.year ? `<span class="edition-badge">چاپ ${faNum(book.year)}</span>` : ""}
      <button class="wish-btn" title="افزودن به علاقه‌مندی" aria-label="افزودن به علاقه‌مندی" onclick="event.preventDefault();showToast('به علاقه‌مندی‌ها اضافه شد')">♡</button>
      ${productImgTag(book)}
    </a>
    <div class="product-info">
      <span class="product-cat">${esc(getCategoryTitle(book.category))}${book.grade ? " | پایه " + esc(getGradeTitle(book.grade)) : ""}</span>
      <a href="product.html?id=${id}"><h3 class="product-title">${esc(book.title)}</h3></a>
      <span class="product-author">مؤلف: ${esc(book.author)}${book.publisher ? " | ناشر: " + esc(book.publisher) : ""}</span>
      <span class="product-rating">${starString(book.rating)}</span>
      <div class="product-price-row">
        <span class="price-now">${formatPrice(book.price)}</span>
        ${book.oldPrice ? `<span class="price-old">${formatPrice(book.oldPrice)}</span>` : ""}
      </div>
      <div class="product-actions">
        ${book.stock > 0
          ? `<button class="add-cart-btn" onclick="addToCart(${id})">🛒 <span>افزودن به سبد</span></button>`
          : `<button class="add-cart-btn" disabled>ناموجود</button>`}
        <button class="compare-btn ${isComparing ? "active" : ""}" title="افزودن به مقایسه" aria-label="افزودن به مقایسه" onclick="toggleCompare(${id}); this.classList.toggle('active');">⇄</button>
      </div>
    </div>
  </div>`;
}

function bundleCardHTML(bundle) {
  const discount = bundle.oldPrice ? Math.round(100 - (bundle.price / bundle.oldPrice) * 100) : 0;
  const img = safeImageUrl(bundle.imageUrl);
  const head = img
    ? `<div class="bundle-head has-image">${imgTag(img, { alt: bundle.title, cls: "bundle-cover", thumb: false })}`
    : `<div class="bundle-head" style="background:linear-gradient(135deg, ${esc(hexToRgba(bundle.color, 1))}, #16222b);"><span class="bundle-ico">🎁</span>`;
  return `
  <div class="bundle-card">
    ${head}
      ${discount > 0 ? `<span class="product-badge discount">٪${faNum(discount)} تخفیف</span>` : ""}
    </div>
    <div class="bundle-body">
      <h3>${esc(bundle.title)}</h3>
      <p class="bundle-desc">${esc(bundle.description || "")}</p>
      <ul class="bundle-items">
        ${bundle.items.map(it => `<li><a href="product.html?id=${Number(it.id)}">📘 ${esc(it.title)}</a></li>`).join("")}
      </ul>
      <div class="product-price-row">
        <span class="price-now">${formatPrice(bundle.price)}</span>
        ${bundle.oldPrice ? `<span class="price-old">${formatPrice(bundle.oldPrice)}</span>` : ""}
      </div>
      <button class="add-cart-btn btn-block" onclick="addToCart(${Number(bundle.id)}, 1, 'bundle')">🎁 افزودن پک به سبد خرید</button>
    </div>
  </div>`;
}

function postCardHTML(p) {
  const img = safeImageUrl(p.cover_image);
  const cover = img
    ? `<div class="post-cover">${imgTag(img, { alt: p.title })}</div>`
    : `<div class="post-cover" style="${esc(`background:linear-gradient(135deg, ${hexToRgba(p.cover_color, 1)}, #16222b)`)}">✍️</div>`;
  return `
    <a href="blog-post.html?slug=${encodeURIComponent(p.slug)}" class="post-card">
      ${cover}
      <div class="post-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.excerpt || "")}</p>
      </div>
    </a>`;
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
  if (!deadline || Number(deadline) < now || Number(deadline) - now > hours * 3600 * 1000) {
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

/* ===== اسلایدر صفحه اصلی (اسلایدها از پنل ادمین) ===== */
function slideHTML(s, i) {
  const opacity = s.overlayOpacity === null || s.overlayOpacity === undefined ? 0.78 : Number(s.overlayOpacity);
  const blur = s.blur === null || s.blur === undefined ? 7 : Number(s.blur);
  const img = safeImageUrl(s.imageUrl);
  const mobileImg = safeImageUrl(s.mobileImageUrl);
  const sideImg = safeImageUrl(s.sideImageUrl);
  const hasText = !!(s.title || s.subtitle || s.badge || s.buttonText);
  const link = s.buttonLink ? safeUrl(s.buttonLink) : "";

  // عکس اسلایدهای بعدی بعد از بارگذاری کامل صفحه دانلود می‌شوند تا صفحه زودتر نمایش داده شود
  const lazy = i > 0;
  const vars = [
    `--overlay: linear-gradient(120deg, ${hexToRgba(s.colorStart, opacity)}, ${hexToRgba(s.colorEnd, opacity)})`,
    `--slide-blur: ${Math.max(0, Math.min(20, blur))}px`,
    img && !lazy ? `--bg: ${cssUrl(img)}` : "",
    mobileImg && !lazy ? `--bg-m: ${cssUrl(mobileImg)}` : ""
  ].filter(Boolean).join("; ");
  const lazyAttrs = lazy ? `${img ? ` data-bg="${esc(img)}"` : ""}${mobileImg ? ` data-bg-m="${esc(mobileImg)}"` : ""}` : "";

  const classes = ["hero-slide", i === 0 ? "active" : "", hasText ? "" : "image-only", mobileImg ? "has-mobile-img" : "",
    s.textTheme === "light" ? "text-light" : "", img ? "" : "no-image"].filter(Boolean).join(" ");

  return `
    <div class="${classes}" aria-roledescription="اسلاید" aria-label="${i + 1}">
      <div class="photo-layer" style="${esc(vars)}"${lazyAttrs}></div>
      ${!hasText && link ? `<a class="slide-link" href="${esc(link)}" aria-label="مشاهده"></a>` : ""}
      ${hasText ? `
        <div class="hero-text">
          ${s.badge ? `<span class="hero-badge">${esc(s.badge)}</span>` : ""}
          ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
          ${s.subtitle ? `<p>${esc(s.subtitle)}</p>` : ""}
          ${s.buttonText && link ? `<a href="${esc(link)}" class="btn btn-accent">${esc(s.buttonText)}</a>` : ""}
        </div>
        ${sideImg ? `<img class="hero-side-img" src="${esc(sideImg)}" alt="">` : (s.emoji ? `<div class="hero-emoji">${esc(s.emoji)}</div>` : "")}` : ""}
    </div>`;
}

function heroSliderHTML(slides) {
  if (!slides.length) return "";
  return `
    <div class="hero" id="heroSlider">
      ${slides.map(slideHTML).join("")}
      ${slides.length > 1 ? `
        <button class="hero-arrow prev" aria-label="اسلاید قبلی">›</button>
        <button class="hero-arrow next" aria-label="اسلاید بعدی">‹</button>
        <div class="hero-dots" id="heroDots"></div>` : ""}
    </div>`;
}

function initHeroSlider() {
  const hero = document.getElementById("heroSlider");
  if (!hero) return;
  const slides = hero.querySelectorAll(".hero-slide");
  const dotsWrap = document.getElementById("heroDots");
  if (slides.length < 2) return;
  let idx = 0;
  let timer = null;

  dotsWrap.innerHTML = Array.from(slides).map((_, i) =>
    `<button class="${i === 0 ? "active" : ""}" data-i="${i}" aria-label="اسلاید ${i + 1}"></button>`).join("");

  function loadBackground(slide) {
    const layer = slide.querySelector(".photo-layer");
    if (layer.dataset.bg) layer.style.setProperty("--bg", cssUrl(layer.dataset.bg));
    if (layer.dataset.bgM) layer.style.setProperty("--bg-m", cssUrl(layer.dataset.bgM));
    delete layer.dataset.bg;
    delete layer.dataset.bgM;
  }
  const loadAll = () => slides.forEach(loadBackground);
  if (document.readyState === "complete") setTimeout(loadAll, 300);
  else window.addEventListener("load", loadAll, { once: true });

  function show(i) {
    idx = (i + slides.length) % slides.length;
    loadBackground(slides[idx]);
    slides.forEach((s, j) => s.classList.toggle("active", j === idx));
    dotsWrap.querySelectorAll("button").forEach((b, j) => b.classList.toggle("active", j === idx));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(idx + 1), 5500);
  }

  dotsWrap.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { show(Number(b.dataset.i)); restart(); }));
  // در چیدمان راست‌به‌چپ، دکمه سمت راست اسلاید قبلی است
  hero.querySelector(".hero-arrow.prev").addEventListener("click", () => { show(idx - 1); restart(); });
  hero.querySelector(".hero-arrow.next").addEventListener("click", () => { show(idx + 1); restart(); });
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", restart);

  // کشیدن انگشت روی موبایل
  let startX = null;
  hero.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { show(dx > 0 ? idx + 1 : idx - 1); restart(); }
    startX = null;
  });

  restart();
}

function initNewsletterForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type=email]");
    const btn = form.querySelector("button");
    btn.disabled = true;
    try {
      await subscribeNewsletter(input.value.trim());
      showToast("با تشکر! شما در خبرنامه عضو شدید 🎉");
      form.reset();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });
}
