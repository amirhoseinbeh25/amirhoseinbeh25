# راهنمای دیپلوی روی VPS

این راهنما فرض می‌کند یک VPS با اوبونتو (۲۲.۰۴ یا بالاتر) و دسترسی root/sudo داری.

## ۱. نصب پیش‌نیازها روی سرور

```bash
sudo apt update && sudo apt install -y git nginx build-essential
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## ۲. کلون کردن پروژه

```bash
cd /var/www
sudo git clone https://github.com/amirhoseinbeh25/amirhoseinbeh25.git kemkan
cd kemkan
sudo git checkout claude/color-resin-company-site-ijlnos   # یا main بعد از مرج
```

## ۳. تنظیم متغیرهای محیطی

```bash
sudo cp .env.example .env.local
sudo nano .env.local
```

مقادیر `ADMIN_USERNAME`، `ADMIN_PASSWORD` و `SESSION_SECRET` را با مقادیر واقعی و امن جایگزین کن
(برای `SESSION_SECRET` یک رشته تصادفی طولانی بساز، مثلاً با `openssl rand -hex 32`).

## ۴. نصب، build و اجرا با pm2

```bash
sudo npm install
sudo npm run build
sudo pm2 start npm --name kemkan -- start -- -p 3000
sudo pm2 save
sudo pm2 startup   # دستور خروجی را اجرا کن تا pm2 با ری‌استارت سرور بالا بیاید
```

دیتابیس SQLite در `/var/www/kemkan/data/kemkan.db` ساخته می‌شود و روی دیسک سرور می‌ماند — این فایل
را **بک‌آپ منظم** بگیر (مثلاً یک کرون‌جاب روزانه که کپی می‌کند).

## ۵. تنظیم Nginx (ریورس‌پروکسی) + دامنه

یک فایل بساز، مثلاً `/etc/nginx/sites-available/kemkan`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kemkan /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## ۶. گرفتن SSL رایگان (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

بعد از این مرحله، چون درخواست‌ها از پشت Nginx با `X-Forwarded-Proto: https` می‌آیند، کوکی ورود ادمین
به‌صورت امن (Secure) روی HTTPS کار می‌کند.

## ۷. آپدیت بعدی سایت

```bash
cd /var/www/kemkan
sudo git pull origin claude/color-resin-company-site-ijlnos
sudo npm install
sudo npm run build
sudo pm2 restart kemkan
```

دیتابیس (`data/kemkan.db`) دست‌نخورده می‌ماند و محتوایی که در پنل ادمین ثبت کرده‌ای از بین نمی‌رود.
