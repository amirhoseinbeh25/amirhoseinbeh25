const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const db = require("../db");

/*
 * اگر JWT_SECRET در متغیرهای محیطی تنظیم نشده باشد، یک کلید تصادفی یک‌بار ساخته و در دیتابیس
 * (جدول app_secrets که هیچ‌وقت از طریق API خوانده نمی‌شود) نگه داشته می‌شود تا توکن‌ها قابل جعل نباشند.
 */
function loadJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET !== "change-this-to-a-long-random-string") {
    return process.env.JWT_SECRET;
  }
  const row = db.prepare("SELECT value FROM app_secrets WHERE key = 'jwt_secret'").get();
  if (row) return row.value;
  const secret = crypto.randomBytes(48).toString("hex");
  db.prepare("INSERT INTO app_secrets (key, value) VALUES ('jwt_secret', ?)").run(secret);
  return secret;
}

const JWT_SECRET = loadJwtSecret();

function signToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email, name: admin.name, type: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

function signCustomerToken(user) {
  return jwt.sign({ sub: user.id, name: user.name, phone: user.phone, type: "customer" }, JWT_SECRET, { expiresIn: "30d" });
}

function getToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function requireAdmin(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "برای این عملیات باید وارد پنل ادمین شوید." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== "admin") return res.status(403).json({ error: "دسترسی غیرمجاز." });
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "نشست شما منقضی شده، دوباره وارد شوید." });
  }
}

function requireCustomer(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "برای این عملیات باید وارد حساب کاربری شوید." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== "customer") return res.status(403).json({ error: "دسترسی غیرمجاز." });
    req.customer = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "نشست شما منقضی شده، دوباره وارد شوید." });
  }
}

function optionalCustomer(req, res, next) {
  const token = getToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload.type === "customer") req.customer = payload;
    } catch (e) { /* مهمان در نظر گرفته می‌شود */ }
  }
  next();
}

module.exports = { signToken, signCustomerToken, requireAdmin, requireCustomer, optionalCustomer, JWT_SECRET };
