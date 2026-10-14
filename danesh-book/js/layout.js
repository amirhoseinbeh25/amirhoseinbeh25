/* دانش بوک — هدر و فوتر مشترک تمام صفحات */

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

function headerTemplate() {
  const catLinks = CATEGORIES.map(c =>
    `<li><a href="shop.html?cat=${c.id}">${c.icon} ${c.title}</a></li>`
  ).join("");

  const customer = typeof getCustomerInfo === "function" ? getCustomerInfo() : null;
  const accountLink = customer
    ? `<a href="account.html" class="icon-link"><span class="icon">👤</span>${customer.name.split(" ")[0]}</a>`
    : `<a href="login.html" class="icon-link"><span class="icon">👤</span>حساب من</a>`;

  return `
  <div class="topbar">
    <div class="container">
      <div class="topbar-links">
        <span>☎ پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</span>
        <span>ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان</span>
      </div>
      <div class="topbar-social">
        <span>اینستاگرام</span><span>تلگرام</span>
      </div>
    </div>
  </div>

  <header class="site-header">
    <div class="container header-main">
      <a href="index.html" class="logo"><span class="logo-icon">📚</span>دانش<span class="dot">بوک</span></a>

      <form class="search-box" id="searchForm">
        <input type="text" id="searchInput" placeholder="نام کتاب، درس یا ناشر را جست‌وجو کنید...">
        <button type="submit" aria-label="جست‌وجو">🔍</button>
      </form>

      <div class="header-icons">
        ${accountLink}
        <a href="compare.html" class="icon-link">
          <span class="icon">⇄</span>مقایسه
          <span class="badge-count" id="compareBadge">0</span>
        </a>
        <a href="cart.html" class="icon-link">
          <span class="icon">🛒</span>سبد خرید
          <span class="badge-count" id="cartBadge">0</span>
        </a>
      </div>
      <button class="menu-toggle" id="menuToggle">☰</button>
    </div>
    <nav class="category-nav" id="categoryNav">
      <div class="container">
        <ul>
          <li><a href="index.html" data-page="index">خانه</a></li>
          <li><a href="shop.html" data-page="shop">همه کتاب‌ها</a></li>
          ${catLinks}
          <li><a href="bundles.html" data-page="bundles">🎁 پک‌های آموزشی</a></li>
          <li><a href="blog.html" data-page="blog">✍️ وبلاگ</a></li>
          <li><a href="about.html" data-page="about">درباره ما</a></li>
          <li><a href="contact.html" data-page="contact">تماس با ما</a></li>
        </ul>
      </div>
    </nav>
  </header>`;
}

function footerTemplate() {
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-col">
        <h4>📚 دانش بوک</h4>
        <p>دانش بوک، فروشگاه اینترنتی تخصصی کتاب‌های کمک درسی و کنکور، با پوشش کامل دروس ریاضی، فیزیک، شیمی، زیست، ادبیات، زبان و عربی برای تمام پایه‌های تحصیلی. تجربه خریدی ساده، سریع و امن برای دانش‌آموزان و داوطلبان کنکور.</p>
        <div class="footer-social">
          <a href="#" title="اینستاگرام">📷</a>
          <a href="#" title="تلگرام">✈️</a>
          <a href="#" title="واتساپ">💬</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>دسترسی سریع</h4>
        <ul>
          <li><a href="index.html">صفحه اصلی</a></li>
          <li><a href="shop.html">فروشگاه</a></li>
          <li><a href="bundles.html">پک‌های آموزشی</a></li>
          <li><a href="blog.html">وبلاگ آموزشی</a></li>
          <li><a href="cart.html">سبد خرید</a></li>
          <li><a href="account.html">حساب کاربری</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>خدمات مشتریان</h4>
        <ul>
          <li><a href="buying-guide.html">راهنمای خرید</a></li>
          <li><a href="shipping-policy.html">شرایط ارسال و تحویل</a></li>
          <li><a href="returns-policy.html">قوانین بازگشت کالا</a></li>
          <li><a href="faq.html">سوالات متداول</a></li>
          <li><a href="bulk-order.html">سفارش عمده برای مدارس</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>تماس با ما</h4>
        <p>📍 تهران، خیابان انقلاب، نبش کتاب‌فروشان</p>
        <p>☎ ۰۲۱-۱۲۳۴۵۶۷۸</p>
        <p>✉ info@daneshbook.ir</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© ۱۴۰۴ دانش بوک — تمامی حقوق محفوظ است.</span>
      <span>طراحی و توسعه با ❤ برای دانش‌آموزان و داوطلبان کنکور ایران</span>
    </div>
  </footer>`;
}

function renderLayout(activePage) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) headerEl.innerHTML = headerTemplate();
  if (footerEl) footerEl.innerHTML = footerTemplate();

  if (activePage) {
    document.querySelectorAll(`nav.category-nav a[data-page="${activePage}"]`)
      .forEach(a => a.classList.add("active"));
  }

  const menuToggle = document.getElementById("menuToggle");
  const categoryNav = document.getElementById("categoryNav");
  if (menuToggle && categoryNav) {
    menuToggle.addEventListener("click", () => categoryNav.classList.toggle("open"));
  }

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.getElementById("searchInput").value.trim();
      window.location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  updateCartBadge();
  if (typeof updateCompareBadge === "function") updateCompareBadge();
}
