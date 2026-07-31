const { createServer } = require("http");
const next = require("next");
const { bootstrap } = require("./lib/bootstrap.cjs");

// پوشه‌ها، کلید نشست و مهاجرت‌های پایگاه داده پیش از بالا آمدن سرور آماده
// می‌شوند، تا نصب روی هاست به ترمینال نیاز نداشته باشد.
bootstrap(__dirname);

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";
// پیش‌فرض حالت تولید است. اگر برعکس بود، هر هاستی که NODE_ENV را تنظیم
// نکرده باشد صفحه‌ها را در لحظه کامپایل می‌کرد و خروجی از پیش ساخته‌شده
// بی‌استفاده می‌ماند.
const dev = process.env.NODE_ENV === "development";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`> Server listening on http://${hostname}:${port}`);
  });
});
