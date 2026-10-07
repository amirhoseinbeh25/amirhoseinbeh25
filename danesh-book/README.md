# دانش بوک (Danesh Book)

فروشگاه اینترنتی کتاب، با ساختار و چیدمانی مشابه فروشگاه‌های ایرانی آنلاین (مانند نارون و کاموا آلیز): هدر با نوار اطلاعات و جست‌وجو، منوی دسته‌بندی، اسلایدر تبلیغاتی، بخش‌های پرفروش‌ترین‌ها / پیشنهاد لحظه‌ای / تازه‌های نشر، صفحه فروشگاه با فیلتر و مرتب‌سازی، صفحه جزئیات محصول و سبد خرید — به‌همراه **بک‌اند واقعی (Express + SQLite)** و **پنل مدیریت (ادمین)** کامل.

## اجرا

```bash
cd danesh-book/server
npm install        # فقط بار اول
npm start
```

سرور روی `http://localhost:4000` بالا می‌آید و همزمان سایت فروشگاه و پنل ادمین را سرو می‌کند:

- 🛍 سایت فروشگاه: `http://localhost:4000/`
- 🔐 پنل ادمین: `http://localhost:4000/admin/login.html`
  - ایمیل پیش‌فرض: `admin@daneshbook.ir`
  - رمز عبور پیش‌فرض: `admin123`
  - این مقادیر با متغیرهای محیطی `ADMIN_EMAIL` و `ADMIN_PASSWORD` (نگاه کنید به `server/.env.example`) قابل تغییرند.

دیتابیس SQLite به‌صورت خودکار در `server/daneshbook.db` ساخته و با داده نمونه (۸ دسته‌بندی، ۱۶ کتاب و یک حساب ادمین) پر می‌شود.

## ساختار پروژه

```
danesh-book/
├── index.html, shop.html, product.html, cart.html, about.html, contact.html   ← سایت فروشگاه
├── css/style.css
├── js/
│   ├── api.js       ← ارتباط با API بک‌اند (fetch)
│   ├── data.js       ← کمک‌توابع نمایش (قیمت، جلد SVG، دسته‌بندی)
│   ├── layout.js      ← هدر و فوتر مشترک
│   └── app.js        ← سبد خرید، رندر کارت محصول، اسلایدر
├── admin/            ← پنل مدیریت
│   ├── login.html, index.html (داشبورد), products.html, categories.html, orders.html
│   ├── css/admin.css
│   └── js/admin-auth.js
└── server/           ← بک‌اند (Express + node:sqlite + JWT)
    ├── server.js, app.js, db.js
    ├── middleware/auth.js
    └── routes/{auth,categories,products,orders,dashboard}.js
```

سایت فروشگاه و پنل ادمین هر دو داده‌ها را به‌صورت زنده از API بک‌اند (`/api/...`) می‌خوانند؛ دیگر داده‌ای در فرانت‌اند هاردکد نیست.

## امکانات پنل ادمین

- ورود امن با ایمیل/رمز عبور (JWT)
- داشبورد: تعداد کتاب‌ها، دسته‌بندی‌ها، سفارش‌ها، مجموع فروش، هشدار کمبود موجودی، آخرین سفارش‌ها
- مدیریت کامل کتاب‌ها: افزودن، ویرایش، حذف، جست‌وجو و فیلتر
- مدیریت دسته‌بندی‌ها: افزودن، ویرایش، حذف
- مدیریت سفارش‌ها: مشاهده جزئیات اقلام هر سفارش و تغییر وضعیت (در انتظار / پردازش / ارسال / تحویل / لغو)

## جریان سفارش از سایت

مشتری از `shop.html`/`product.html` کتاب را به سبد خرید (ذخیره در `localStorage`) اضافه می‌کند؛ در `cart.html` با وارد کردن نام و شماره تماس، سفارش به API (`POST /api/orders`) ارسال می‌شود، موجودی کتاب‌ها به‌صورت خودکار کم می‌شود و سفارش بلافاصله در پنل ادمین قابل مشاهده است.

## API

| متد | مسیر | دسترسی |
|---|---|---|
| GET | `/api/categories` | عمومی |
| POST/PUT/DELETE | `/api/categories` | ادمین |
| GET | `/api/products` (فیلتر: `cat`, `q`, `minPrice`, `maxPrice`, `onlyDiscount`, `sort`) | عمومی |
| GET | `/api/products/:id` | عمومی |
| POST/PUT/DELETE | `/api/products/:id` | ادمین |
| POST | `/api/orders` | عمومی (ثبت سفارش) |
| GET | `/api/orders`, `/api/orders/:id`, `PUT /api/orders/:id/status` | ادمین |
| POST | `/api/auth/login` | عمومی |
| GET | `/api/dashboard/stats` | ادمین |
