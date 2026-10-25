const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;
const FILE_NAME_RE = /^[a-z0-9]+-[a-f0-9]{16}\.(jpg|png|gif|webp)$/;
// نسخه کوچک هر تصویر (برای کارت‌ها و فهرست‌ها) کنار آن با پسوند -t.jpg ذخیره می‌شود
const thumbNameOf = (name) => name.replace(/\.(jpg|png|gif|webp)$/, "-t.jpg");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// نوع فایل از روی محتوای واقعی آن تشخیص داده می‌شود، نه از روی پسوند یا هدر ارسالی
function detectImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  const head6 = buf.subarray(0, 6).toString("ascii");
  if (head6 === "GIF87a" || head6 === "GIF89a") return "gif";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

// همه متن‌هایی از دیتابیس که ممکن است آدرس یک تصویر آپلودشده را داشته باشند
function referencedText() {
  const parts = [];
  const collect = (sql) => {
    for (const row of db.prepare(sql).all()) parts.push(...Object.values(row).filter(Boolean));
  };
  collect("SELECT image_url, gallery FROM products");
  collect("SELECT image_url FROM bundles");
  collect("SELECT cover_image, content FROM posts");
  collect("SELECT image_url FROM categories");
  collect("SELECT image_url, mobile_image_url, side_image_url FROM slides");
  collect("SELECT banner_image, content FROM pages");
  collect("SELECT value FROM settings");
  return parts.join("\n");
}

router.post("/", requireAdmin, express.raw({ type: "multipart/form-data", limit: "12mb" }), async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.body.length) {
    return res.status(400).json({ error: "فایلی دریافت نشد." });
  }

  let file, thumb;
  try {
    const form = await new Response(req.body, { headers: { "content-type": req.get("content-type") } }).formData();
    file = form.get("file");
    thumb = form.get("thumb");
  } catch (e) {
    return res.status(400).json({ error: "فرمت درخواست آپلود معتبر نیست." });
  }
  if (!file || typeof file === "string") return res.status(400).json({ error: "فایلی دریافت نشد." });

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) return res.status(413).json({ error: "حجم تصویر نباید بیشتر از ۸ مگابایت باشد." });

  const ext = detectImageType(buf);
  if (!ext) return res.status(400).json({ error: "فقط تصاویر JPG، PNG، WebP و GIF مجاز هستند." });

  const name = `${Date.now().toString(36)}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);

  // نسخه کوچک اختیاری است و فقط اگر JPEG معتبر باشد ذخیره می‌شود
  let thumbUrl = null;
  if (thumb && typeof thumb !== "string") {
    const tbuf = Buffer.from(await thumb.arrayBuffer());
    if (tbuf.length <= MAX_BYTES && detectImageType(tbuf) === "jpg") {
      fs.writeFileSync(path.join(UPLOAD_DIR, thumbNameOf(name)), tbuf);
      thumbUrl = `/uploads/${thumbNameOf(name)}`;
    }
  }
  res.status(201).json({ url: `/uploads/${name}`, thumbUrl, name, size: buf.length });
});

router.get("/", requireAdmin, (req, res) => {
  const used = referencedText();
  const files = fs.readdirSync(UPLOAD_DIR)
    .filter(name => FILE_NAME_RE.test(name))
    .map(name => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, name));
      return { name, url: `/uploads/${name}`, size: stat.size, createdAt: stat.mtime.toISOString(), inUse: used.includes(name) };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(files);
});

router.delete("/:name", requireAdmin, (req, res) => {
  const name = req.params.name;
  if (!FILE_NAME_RE.test(name)) return res.status(400).json({ error: "نام فایل معتبر نیست." });
  const filePath = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "فایل پیدا نشد." });
  if (req.query.force !== "1" && referencedText().includes(name)) {
    return res.status(409).json({ error: "این تصویر هنوز در بخشی از سایت استفاده می‌شود." });
  }
  fs.unlinkSync(filePath);
  const thumbPath = path.join(UPLOAD_DIR, thumbNameOf(name));
  if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  res.status(204).end();
});

module.exports = router;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
