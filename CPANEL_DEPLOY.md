# راهنمای دیپلوی روی cPanel (Node.js Selector)

این راهنما برای هاستی نوشته شده که دسترسی root/SSH کامل نداره ولی cPanel با ابزار
**Setup Node.js App** رو داره.

## ۱. اضافه کردن دامنه

- تو cPanel برو به بخش **Domains**
- **Create A New Domain** رو بزن، دامنه‌ت رو بدون `www` وارد کن
- بذار مسیر پیشنهادی (Document Root) رو خودش انتخاب کنه، یا یه پوشه دلخواه بساز

بعد از این، DNS دامنه رو (از پنل ثبت‌کننده دامنه) به IP این سرور اشاره بده — IP رو از
همون صفحه Domains یا General Information می‌تونی پیدا کنی.

## ۲. آپلود کد

- فایل zip پروژه رو (که فرستادم) از **File Manager** آپلود کن — ترجیحاً تو یه پوشه‌ی
  جدا از document root، مثلاً `~/kemkan_app` (نیازی نیست حتماً تو public_html باشه)
- روش راست‌کلیک کن و **Extract** بزن

## ۳. ساخت Node.js App

تو cPanel برو به **Setup Node.js App** → **Create Application**:

| فیلد | مقدار |
|---|---|
| Node.js version | جدیدترین موجود (ترجیحاً ۲۰ یا بالاتر) |
| Application mode | Production |
| Application root | همون پوشه‌ای که zip رو توش extract کردی (مثلاً `kemkan_app`) |
| Application URL | دامنه‌ای که تو مرحله ۱ ساختی |
| Application startup file | `server.js` |

بعد از ساخت، cPanel یه دکمه/بخش **Environment Variables** نشون می‌ده — این سه‌تا رو اضافه کن:

```
ADMIN_USERNAME = یک نام کاربری دلخواه
ADMIN_PASSWORD = یک رمز قوی و دلخواه
SESSION_SECRET = یک رشته تصادفی طولانی (مثلاً از https://randomkeygen.com بگیر)
```

## ۴. نصب پکیج‌ها

فایل‌های build‌شده (پوشه `.next`) از قبل توی zip هستن، پس نیازی به اجرای `npm run build`
از طریق ترمینال نیست. فقط تو همون صفحه Node.js App دکمه **Run NPM Install** رو بزن و
صبر کن تمام بشه — همین کافیه.

(اگه به هر دلیلی سایت بعد از این کار بالا نیومد، به‌عنوان راه جایگزین می‌تونی از طریق
Terminal دستور `npm run build` رو هم دستی اجرا کنی — دستور فعال‌سازی محیط رو از دکمه
«Enter to the virtual environment» تو همون صفحه Node.js App کپی کن.)

## ۵. روشن کردن اپ

برگرد به صفحه **Setup Node.js App**، رو اپلیکیشنت **Restart** بزن.

حالا با باز کردن دامنه‌ت باید سایت بالا بیاد. برای پنل ادمین برو به:
`https://دامنه‌ت/admin` و با یوزرنیم/پسوردی که تو مرحله ۳ گذاشتی وارد شو.

## نکته درباره دیتابیس

دیتابیس (SQLite) به‌صورت خودکار تو پوشه `data/` داخل Application root ساخته می‌شه —
نیازی به کار دستی نیست. فقط مطمئن شو موقع آپدیت بعدی، این پوشه رو پاک نمی‌کنی (چون
محتوای پنل ادمین توشه).

## آپدیت بعدی سایت

هر وقت فایل‌های جدید (کد به‌روزشده) رو فرستادم:
1. zip جدید رو آپلود و extract کن (همون پوشه Application root، فایل‌های قبلی رو
   overwrite می‌کنه — پوشه `data/` دست‌نخورده می‌مونه چون تو zip نیست)
2. دوباره **Run NPM Install** و `npm run build`
3. اپ رو **Restart** کن
