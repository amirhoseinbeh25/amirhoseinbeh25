const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const v = require("../lib/validate");

const router = express.Router();

function mapSlide(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    buttonText: row.button_text,
    buttonLink: row.button_link,
    imageUrl: row.image_url,
    mobileImageUrl: row.mobile_image_url,
    sideImageUrl: row.side_image_url,
    emoji: row.emoji,
    colorStart: row.color_start,
    colorEnd: row.color_end,
    overlayOpacity: row.overlay_opacity,
    blur: row.blur,
    textTheme: row.text_theme,
    sortOrder: row.sort_order,
    active: !!row.active
  };
}

// مقادیر ارسالی را با مقدار فعلی اسلاید (در حالت ویرایش) ترکیب و اعتبارسنجی می‌کند
function readSlide(b, current = {}) {
  const pick = (key, fallback) => (b[key] !== undefined ? b[key] : fallback);
  return {
    title: v.text(pick("title", current.title), { max: 200, label: "عنوان" }),
    subtitle: v.text(pick("subtitle", current.subtitle), { max: 500, label: "متن توضیح" }),
    badge: v.text(pick("badge", current.badge), { max: 60, label: "برچسب" }),
    button_text: v.text(pick("buttonText", current.button_text), { max: 60, label: "متن دکمه" }),
    button_link: v.link(pick("buttonLink", current.button_link), "لینک دکمه"),
    image_url: v.imageUrl(pick("imageUrl", current.image_url), "تصویر اسلاید"),
    mobile_image_url: v.imageUrl(pick("mobileImageUrl", current.mobile_image_url), "تصویر موبایل"),
    side_image_url: v.imageUrl(pick("sideImageUrl", current.side_image_url), "تصویر کناری"),
    emoji: v.text(pick("emoji", current.emoji), { max: 16, label: "ایموجی" }),
    color_start: v.color(pick("colorStart", current.color_start), "#9ad4f5"),
    color_end: v.color(pick("colorEnd", current.color_end), "#6fb3e6"),
    overlay_opacity: v.num(pick("overlayOpacity", current.overlay_opacity), { min: 0, max: 1, fallback: 0.78 }),
    blur: v.int(pick("blur", current.blur), { min: 0, max: 20, fallback: 7 }),
    text_theme: pick("textTheme", current.text_theme) === "light" ? "light" : "dark",
    active: v.bool(pick("active", current.active), true) ? 1 : 0
  };
}

const COLUMNS = ["title", "subtitle", "badge", "button_text", "button_link", "image_url", "mobile_image_url",
  "side_image_url", "emoji", "color_start", "color_end", "overlay_opacity", "blur", "text_theme", "active"];

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM slides WHERE active = 1 ORDER BY sort_order, id").all().map(mapSlide));
});

router.get("/admin/all", requireAdmin, (req, res) => {
  res.json(db.prepare("SELECT * FROM slides ORDER BY sort_order, id").all().map(mapSlide));
});

router.post("/", requireAdmin, (req, res) => {
  const s = readSlide(req.body || {});
  if (!s.title && !s.image_url) return res.status(400).json({ error: "برای اسلاید حداقل یک عنوان یا یک تصویر لازم است." });
  const nextOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM slides").get().n;
  const info = db.prepare(`INSERT INTO slides (${COLUMNS.join(", ")}, sort_order) VALUES (${COLUMNS.map(() => "?").join(", ")}, ?)`)
    .run(...COLUMNS.map(c => s[c]), nextOrder);
  res.status(201).json(mapSlide(db.prepare("SELECT * FROM slides WHERE id = ?").get(info.lastInsertRowid)));
});

router.put("/reorder", requireAdmin, (req, res) => {
  const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids : null;
  if (!ids) return res.status(400).json({ error: "فهرست ترتیب ارسال نشده است." });
  const update = db.prepare("UPDATE slides SET sort_order = ? WHERE id = ?");
  ids.forEach((id, i) => update.run(i, Number(id)));
  res.json(db.prepare("SELECT * FROM slides ORDER BY sort_order, id").all().map(mapSlide));
});

router.put("/:id", requireAdmin, (req, res) => {
  const current = db.prepare("SELECT * FROM slides WHERE id = ?").get(req.params.id);
  if (!current) return res.status(404).json({ error: "اسلاید پیدا نشد." });
  const s = readSlide(req.body || {}, current);
  if (!s.title && !s.image_url) return res.status(400).json({ error: "برای اسلاید حداقل یک عنوان یا یک تصویر لازم است." });
  db.prepare(`UPDATE slides SET ${COLUMNS.map(c => `${c} = ?`).join(", ")} WHERE id = ?`)
    .run(...COLUMNS.map(c => s[c]), current.id);
  res.json(mapSlide(db.prepare("SELECT * FROM slides WHERE id = ?").get(current.id)));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM slides WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "اسلاید پیدا نشد." });
  res.status(204).end();
});

module.exports = router;
