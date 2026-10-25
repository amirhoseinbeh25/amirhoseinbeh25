/*
 * سرعت سایت بدون پکیج اضافه:
 *  - فایل‌های متنی سایت (HTML، CSS، JS، SVG) به‌صورت gzip فشرده و در حافظه نگه داشته می‌شوند
 *  - پاسخ‌های JSON بزرگ‌تر از ۱ کیلوبایت فشرده ارسال می‌شوند
 *  - فایل‌های CSS/JS نسخه‌دار (?v=...) و فونت‌ها و عکس‌ها در مرورگر کش می‌شوند
 */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const TEXT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};
const MIN_GZIP_BYTES = 1024;
const DAY = 24 * 60 * 60;

function acceptsGzip(req) {
  return /\bgzip\b/.test(String(req.headers["accept-encoding"] || ""));
}

// سیاست کش هر فایل: HTML همیشه تازه، CSS/JS نسخه‌دار یک هفته، فونت و عکس طولانی‌تر
function cacheControlFor(urlPath, query) {
  const ext = path.extname(urlPath).toLowerCase();
  if (ext === ".html" || urlPath.endsWith("/")) return "no-cache";
  if ((ext === ".css" || ext === ".js") && query && query.v) return `public, max-age=${7 * DAY}, immutable`;
  if (urlPath.startsWith("/assets/fonts/")) return `public, max-age=${365 * DAY}, immutable`;
  if (urlPath.startsWith("/assets/")) return `public, max-age=${7 * DAY}`;
  return "no-cache";
}

// برای فایل‌هایی که فشرده نمی‌شوند (فونت، عکس، PDF) فقط هدر کش تنظیم می‌شود
function createStaticCacheHeaders(siteRoot) {
  return (res, filePath) => {
    const rel = "/" + path.relative(siteRoot, filePath).split(path.sep).join("/");
    res.setHeader("Cache-Control", cacheControlFor(rel, res.req.query));
  };
}

function createGzipStatic(siteRoot) {
  const cache = new Map();

  return function gzipStatic(req, res, next) {
    if ((req.method !== "GET" && req.method !== "HEAD") || !acceptsGzip(req)) return next();

    let urlPath;
    try { urlPath = decodeURIComponent(req.path); } catch (e) { return next(); }
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const type = TEXT_TYPES[path.extname(urlPath).toLowerCase()];
    if (!type || urlPath.split("/").some(seg => seg.startsWith("."))) return next();

    const filePath = path.join(siteRoot, path.normalize(urlPath));
    if (!filePath.startsWith(siteRoot + path.sep)) return next();

    let stat;
    try { stat = fs.statSync(filePath); } catch (e) { return next(); }
    if (!stat.isFile() || stat.size < MIN_GZIP_BYTES) return next();

    const key = filePath;
    let entry = cache.get(key);
    if (!entry || entry.mtimeMs !== stat.mtimeMs || entry.size !== stat.size) {
      entry = {
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        gz: zlib.gzipSync(fs.readFileSync(filePath), { level: 9 }),
        etag: `W/"gz-${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`,
        lastModified: stat.mtime.toUTCString()
      };
      cache.set(key, entry);
    }

    res.setHeader("Content-Type", type);
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader("ETag", entry.etag);
    res.setHeader("Last-Modified", entry.lastModified);
    res.setHeader("Cache-Control", cacheControlFor(urlPath, req.query));
    if (req.headers["if-none-match"] === entry.etag) return res.status(304).end();
    res.setHeader("Content-Length", entry.gz.length);
    if (req.method === "HEAD") return res.end();
    res.end(entry.gz);
  };
}

// پاسخ‌های JSON بزرگ API فشرده می‌شوند
function gzipJson(req, res, next) {
  if (!acceptsGzip(req)) return next();
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const text = JSON.stringify(body);
    if (text === undefined || Buffer.byteLength(text) < MIN_GZIP_BYTES) return originalJson(body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Vary", "Accept-Encoding");
    return res.send(zlib.gzipSync(text));
  };
  next();
}

module.exports = { createGzipStatic, gzipJson, createStaticCacheHeaders };
