const path = require("node:path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const { categoryRoutes, gradeRoutes, trackRoutes } = require("./routes/taxonomy");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");
const customerRoutes = require("./routes/customers");
const bundleRoutes = require("./routes/bundles");
const settingsRoutes = require("./routes/settings");
const bulkOrderRoutes = require("./routes/bulkOrders");
const postRoutes = require("./routes/posts");
const paymentRoutes = require("./routes/payment");
const returnRoutes = require("./routes/returns");
const uploadRoutes = require("./routes/uploads");
const slideRoutes = require("./routes/slides");
const menuRoutes = require("./routes/menus");
const pageRoutes = require("./routes/pages");
const siteRoutes = require("./routes/site");
const contactRoutes = require("./routes/contact");
const newsletterRoutes = require("./routes/newsletter");
const backupRoutes = require("./routes/backup");

const app = express();

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bundles", bundleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/bulk-orders", bulkOrderRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/slides", slideRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/backup", backupRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "مسیر مورد نظر پیدا نشد." });
  next();
});

// سایت فروشگاه و پنل ادمین از همین سرور سرو می‌شوند؛ پوشه server (کد و دیتابیس) هرگز نباید سرو شود
const siteRoot = path.join(__dirname, "..");

function isBlockedPath(rawPath) {
  let p;
  try {
    p = decodeURIComponent(rawPath);
  } catch (e) {
    return true;
  }
  p = path.posix.normalize(p.replace(/\\/g, "/")).toLowerCase();
  return p === "/server" || p.startsWith("/server/") || p.endsWith(".db") || p.includes("/node_modules/");
}

app.use((req, res, next) => {
  if (isBlockedPath(req.path)) return res.status(404).end();
  next();
});
// نام فایل‌های آپلودی یکتا است، پس مرورگر می‌تواند آن‌ها را طولانی‌مدت کش کند
app.use("/uploads", express.static(uploadRoutes.UPLOAD_DIR, { maxAge: "30d", immutable: true, fallthrough: false }));
app.use(express.static(siteRoot, { dotfiles: "deny" }));

app.use((req, res) => {
  res.status(404).sendFile(path.join(siteRoot, "index.html"));
});

// خطاهای اعتبارسنجی و بدنه‌های نامعتبر به پیام فارسی تبدیل می‌شوند
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isApi = req.path.startsWith("/api/");
  if (err.type === "entity.too.large") return res.status(413).json({ error: "حجم داده ارسالی بیش از حد مجاز است." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "داده ارسالی معتبر نیست." });
  if (status === 404 && !isApi) return res.status(404).sendFile(path.join(siteRoot, "index.html"));
  if (status < 500) return isApi ? res.status(status).json({ error: err.message }) : res.status(status).end();
  if (String(err.message || "").includes("UNIQUE constraint failed")) {
    return res.status(409).json({ error: "این مقدار تکراری است و از قبل ثبت شده است." });
  }
  console.error(err);
  return isApi ? res.status(500).json({ error: "خطای داخلی سرور؛ لطفاً دوباره تلاش کنید." }) : res.status(500).end();
});

module.exports = app;
