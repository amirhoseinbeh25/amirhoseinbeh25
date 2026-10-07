const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "daneshbook-dev-secret-change-me";

function signToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: "7d" });
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "برای این عملیات باید وارد پنل ادمین شوید." });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "نشست شما منقضی شده، دوباره وارد شوید." });
  }
}

module.exports = { signToken, requireAdmin, JWT_SECRET };
