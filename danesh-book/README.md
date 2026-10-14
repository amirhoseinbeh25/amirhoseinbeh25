# دانش بوک (Danesh Book)

فروشگاه اینترنتی کتاب‌های کمک درسی و کنکور (ریاضی، فیزیک، شیمی، زیست، ادبیات فارسی، زبان انگلیسی، عربی)، با ساختار و چیدمانی مشابه فروشگاه‌های ایرانی آنلاین: هدر با نوار اطلاعات و جست‌وجو، منوی دسته‌بندی بر اساس درس، اسلایدر تبلیغاتی، شمارش معکوس تا کنکور سراسری، پک‌های آموزشی، وبلاگ، حساب کاربری مشتری با باشگاه امتیاز، درگاه پرداخت (شبیه‌سازی‌شده/زرین‌پال) — به‌همراه **بک‌اند واقعی (Express + SQLite)** و **پنل مدیریت (ادمین)** کامل.

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

دیتابیس SQLite به‌صورت خودکار در `server/daneshbook.db` ساخته و با داده نمونه (۸ دسته‌بندی، ۱۶ کتاب، ۲ پک آموزشی، ۳ مطلب وبلاگ و یک حساب ادمین) پر می‌شود.

## ساختار پروژه

```
danesh-book/
├── index.html, shop.html, product.html, cart.html, bundles.html, blog.html, blog-post.html
├── login.html, register.html, account.html, compare.html, bulk-order.html
├── payment-mock.html, payment-result.html
├── buying-guide.html, shipping-policy.html, returns-policy.html, faq.html, about.html, contact.html
├── css/style.css
├── js/
│   ├── api.js        ← ارتباط با API بک‌اند (fetch) + مدیریت نشست مشتری
│   ├── data.js        ← کمک‌توابع نمایش (قیمت، جلد SVG، پایه/رشته، دسته‌بندی)
│   ├── layout.js      ← هدر و فوتر مشترک
│   └── app.js         ← سبد خرید، مقایسه، رندر کارت محصول/پک، اسلایدر، شمارش معکوس
├── sample-pdfs/       ← فایل‌های نمونه سوال رایگان (placeholder)
├── admin/             ← پنل مدیریت
│   ├── login.html, index.html (داشبورد), products.html, categories.html, bundles.html
│   ├── orders.html, returns.html, bulk-orders.html, posts.html, settings.html
│   ├── css/admin.css
│   └── js/admin-auth.js
└── server/            ← بک‌اند (Express + node:sqlite + JWT)
    ├── server.js, app.js, db.js
    ├── middleware/auth.js      ← احراز هویت جدا برای ادمین و مشتری
    ├── services/{notify,payment}.js
    └── routes/{auth,categories,products,orders,dashboard,customers,bundles,settings,bulkOrders,posts,payment,returns}.js
```

سایت فروشگاه و پنل ادمین هر دو داده‌ها را به‌صورت زنده از API بک‌اند (`/api/...`) می‌خوانند؛ دیگر داده‌ای در فرانت‌اند هاردکد نیست.

## امکانات فروشگاه

- فیلتر پیشرفته فروشگاه بر اساس **درس، پایه تحصیلی، رشته، ناشر، قیمت**
- برچسب «چاپ ۱۴۰۳» روی هر کتاب (سال انتشار/ویرایش)
- **پک‌های آموزشی**: چند کتاب یک پایه/رشته با تخفیف پکیج
- **مقایسه کتاب‌ها**: تا ۳ کتاب را کنار هم مقایسه کنید (`compare.html`)
- **دانلود نمونه سوال رایگان** برای کتاب‌هایی که فایل نمونه دارند
- **حساب کاربری مشتری**: ثبت‌نام/ورود، تاریخچه سفارش، باشگاه امتیاز (۱ امتیاز به ازای هر ۱۰ هزار تومان خرید پرداخت‌شده)، درخواست مرجوعی برای سفارش‌های تحویل‌شده
- **شمارش معکوس تا کنکور سراسری** در صفحه اصلی (تاریخ از پنل ادمین قابل تنظیم است)
- **وبلاگ آموزشی** با مطالب برنامه‌ریزی درسی و راهنمای انتخاب رشته
- **سفارش عمده/سازمانی** برای مدارس و آموزشگاه‌ها
- صفحات راهنمای خرید، شرایط ارسال، قوانین بازگشت کالا و سوالات متداول

## پرداخت آنلاین

پرداخت از طریق زرین‌پال پیاده‌سازی شده و به‌صورت پیش‌فرض در **حالت شبیه‌سازی‌شده (mock)** کار می‌کند — یک صفحه بانک آزمایشی (`payment-mock.html`) نمایش داده می‌شود تا کل مسیر خرید بدون نیاز به حساب تجاری واقعی قابل تست باشد.

برای فعال‌سازی پرداخت واقعی، در `server/.env` مقدار زیر را تنظیم کنید:

```
ZARINPAL_MERCHANT_ID=<مرچنت‌کد واقعی شما>
ZARINPAL_SANDBOX=true   # برای تست در محیط آزمایشی زرین‌پال؛ برای تولید حذف کنید
```

## اعلان‌ها (پیامک/ایمیل)

ارسال پیامک/ایمیل هنگام ثبت سفارش و تغییر وضعیت آن، به‌صورت **شبیه‌سازی‌شده** پیاده شده (در کنسول سرور چاپ و در جدول `notifications` ذخیره می‌شود؛ از پنل ادمین → جزئیات سفارش قابل مشاهده است). برای اتصال واقعی:

- پیامک: کلید API کاوه‌نگار/ملی‌پیامک را در `server/services/notify.js` (`KAVENEGAR_API_KEY`) وصل کنید.
- ایمیل: SMTP واقعی را در همان فایل (`SMTP_HOST` و...) با nodemailer پیکربندی کنید.

## پنل ادمین

- ورود امن با ایمیل/رمز عبور (JWT) — جدا از حساب مشتریان
- داشبورد: کتاب‌ها، دسته‌بندی‌ها، سفارش‌ها، مجموع فروش پرداخت‌شده، مشتریان ثبت‌نام‌شده، سفارش عمده و درخواست مرجوعی در انتظار، هشدار کمبود موجودی
- مدیریت کامل کتاب‌ها (شامل پایه، رشته، نمونه سوال رایگان)، دسته‌بندی‌ها، پک‌های آموزشی
- مدیریت سفارش‌ها: جزئیات، وضعیت پرداخت، لاگ اعلان‌های ارسالی، تغییر وضعیت
- مدیریت درخواست‌های مرجوعی و سفارش‌های عمده مدارس
- مدیریت وبلاگ (نوشتن/ویرایش/حذف مطلب)
- تنظیمات سایت: تاریخ کنکور سراسری، متن اعلان بالای سایت

## API

| متد | مسیر | دسترسی |
|---|---|---|
| GET | `/api/categories` | عمومی |
| POST/PUT/DELETE | `/api/categories` | ادمین |
| GET | `/api/products` (فیلتر: `cat`,`grade`,`track`,`publisher`,`q`,`minPrice`,`maxPrice`,`onlyDiscount`,`sort`) | عمومی |
| GET/POST/PUT/DELETE | `/api/products/:id` | عمومی (GET) / ادمین |
| GET | `/api/bundles`, `/api/bundles/:id` | عمومی |
| POST/PUT/DELETE | `/api/bundles` | ادمین |
| GET | `/api/posts`, `/api/posts/:slug` | عمومی |
| POST/PUT/DELETE | `/api/posts` | ادمین |
| GET | `/api/settings` | عمومی |
| PUT | `/api/settings` | ادمین |
| POST | `/api/orders` (مهمان یا مشتری واردشده) | عمومی |
| GET | `/api/orders/mine`, `/api/orders/mine/:id`, `POST .../return` | مشتری |
| GET/PUT | `/api/orders`, `/api/orders/:id`, `/api/orders/:id/status` | ادمین |
| POST | `/api/customers/register`, `/api/customers/login` | عمومی |
| GET | `/api/customers/me` | مشتری |
| POST | `/api/payment/request`, `GET /api/payment/status/:orderId` | عمومی |
| GET | `/api/payment/callback` | زرین‌پال (production) |
| POST | `/api/bulk-orders` | عمومی |
| GET/PUT | `/api/bulk-orders` | ادمین |
| GET/PUT | `/api/returns` | ادمین |
| POST | `/api/auth/login` | عمومی (ادمین) |
| GET | `/api/dashboard/stats` | ادمین |
