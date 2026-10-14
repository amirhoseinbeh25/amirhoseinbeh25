const path = require("node:path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
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

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
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

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "مسیر مورد نظر پیدا نشد." });
  next();
});

// سایت فروشگاه و پنل ادمین از همین سرور سرو می‌شوند
const siteRoot = path.join(__dirname, "..");
app.use(express.static(siteRoot));

app.use((req, res) => {
  res.status(404).sendFile(path.join(siteRoot, "index.html"));
});

module.exports = app;
