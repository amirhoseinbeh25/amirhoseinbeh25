const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ سرور دانش بوک روی پورت ${PORT} اجرا شد`);
  console.log(`   سایت فروشگاه:  http://localhost:${PORT}/`);
  console.log(`   پنل ادمین:     http://localhost:${PORT}/admin/login.html`);
});
