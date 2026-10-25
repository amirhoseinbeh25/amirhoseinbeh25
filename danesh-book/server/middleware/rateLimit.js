/* محدودکننده ساده درون‌حافظه‌ای برای جلوگیری از اسپم فرم‌ها و حدس رمز عبور */

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "";
}

function createCounter(windowMs) {
  const hits = new Map();
  function entry(key) {
    const now = Date.now();
    let e = hits.get(key);
    if (!e || e.reset < now) {
      e = { count: 0, reset: now + windowMs };
      hits.set(key, e);
    }
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    }
    return e;
  }
  return {
    count: (key) => entry(key).count,
    hit: (key) => { entry(key).count++; },
    retryAfter: (key) => Math.max(1, Math.ceil((entry(key).reset - Date.now()) / 1000)),
    reset: (key) => hits.delete(key)
  };
}

const TOO_MANY = "تعداد درخواست‌ها زیاد است؛ چند دقیقه دیگر دوباره تلاش کنید.";

// محدودیت تعداد درخواست به ازای هر IP (برای فرم‌های عمومی)
function rateLimit({ windowMs, max }) {
  const counter = createCounter(windowMs);
  return (req, res, next) => {
    const key = clientIp(req);
    if (counter.count(key) >= max) {
      res.set("Retry-After", String(counter.retryAfter(key)));
      return res.status(429).json({ error: TOO_MANY });
    }
    counter.hit(key);
    next();
  };
}

/*
 * محافظ ورود: تلاش‌های ناموفق را هم به ازای IP و هم به ازای نام کاربری می‌شمارد،
 * تا حدس زدن رمز یک حساب حتی با تغییر IP هم ممکن نباشد.
 */
function createLoginGuard({ windowMs = 15 * 60 * 1000, maxPerIp = 20, maxPerAccount = 8 } = {}) {
  const byIp = createCounter(windowMs);
  const byAccount = createCounter(windowMs);
  return {
    blocked(req, account) {
      return byIp.count(clientIp(req)) >= maxPerIp || byAccount.count(String(account)) >= maxPerAccount;
    },
    fail(req, account) {
      byIp.hit(clientIp(req));
      byAccount.hit(String(account));
    },
    success(req, account) {
      byAccount.reset(String(account));
    },
    message: "به دلیل تلاش‌های ناموفق زیاد، ورود موقتاً مسدود شد؛ ۱۵ دقیقه دیگر دوباره تلاش کنید."
  };
}

module.exports = { rateLimit, createLoginGuard, clientIp };
