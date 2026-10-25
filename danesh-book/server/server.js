const path = require("node:path");

// اگر فایل .env کنار سرور وجود داشته باشد، متغیرهای آن خوانده می‌شوند (بدون نیاز به پکیج اضافه)
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch (e) { /* فایل .env اختیاری است */ }

const app = require("./app");
const { scheduleAutoBackups } = require("./lib/backup");

const PORT = process.env.PORT || 4000;

scheduleAutoBackups();

app.listen(PORT, () => {
  console.log(`✅ سرور دانش بوک روی پورت ${PORT} اجرا شد`);
  console.log(`   سایت فروشگاه:  http://localhost:${PORT}/`);
  console.log(`   پنل ادمین:     http://localhost:${PORT}/admin/login.html`);
});
