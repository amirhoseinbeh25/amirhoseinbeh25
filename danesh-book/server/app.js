const path = require("node:path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
