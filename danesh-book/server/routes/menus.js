const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const v = require("../lib/validate");

const router = express.Router();

// main: منوی اصلی هدر | footer_1 و footer_2: ستون‌های لینک فوتر | social: شبکه‌های اجتماعی (هدر و فوتر)
const LOCATIONS = ["main", "footer_1", "footer_2", "social"];

function mapItem(row) {
  return {
    id: row.id,
    location: row.location,
    label: row.label,
    url: row.url,
    icon: row.icon,
    type: row.type,
    newTab: !!row.new_tab,
    sortOrder: row.sort_order,
    active: !!row.active
  };
}

function grouped(onlyActive) {
  const rows = db.prepare(`SELECT * FROM menu_items ${onlyActive ? "WHERE active = 1" : ""} ORDER BY sort_order, id`).all();
  const out = {};
  for (const loc of LOCATIONS) out[loc] = [];
  for (const r of rows) if (out[r.location]) out[r.location].push(mapItem(r));
  return out;
}

function readItem(b, current = {}) {
  const pick = (key, fallback) => (b[key] !== undefined ? b[key] : fallback);
  const location = pick("location", current.location);
  if (!LOCATIONS.includes(location)) throw new v.ValidationError("محل نمایش منو معتبر نیست.");
  const type = pick("type", current.type) === "categories" ? "categories" : "link";
  const item = {
    location,
    type,
    label: v.text(pick("label", current.label), { required: true, max: 80, label: "عنوان لینک" }),
    url: type === "link" ? v.link(pick("url", current.url), "آدرس لینک") : "",
    icon: v.text(pick("icon", current.icon), { max: 16, label: "آیکون" }),
    new_tab: v.bool(pick("newTab", current.new_tab), false) ? 1 : 0,
    active: v.bool(pick("active", current.active), true) ? 1 : 0
  };
  if (type === "link" && !item.url) throw new v.ValidationError("آدرس لینک الزامی است.");
  return item;
}

router.get("/", (req, res) => res.json(grouped(true)));

router.get("/admin/all", requireAdmin, (req, res) => res.json(grouped(false)));

router.post("/", requireAdmin, (req, res) => {
  const it = readItem(req.body || {});
  const nextOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM menu_items WHERE location = ?").get(it.location).n;
  const info = db.prepare(`
    INSERT INTO menu_items (location, label, url, icon, type, new_tab, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(it.location, it.label, it.url, it.icon, it.type, it.new_tab, it.active, nextOrder);
  res.status(201).json(mapItem(db.prepare("SELECT * FROM menu_items WHERE id = ?").get(info.lastInsertRowid)));
});

router.put("/reorder", requireAdmin, (req, res) => {
  const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids : null;
  if (!ids) return res.status(400).json({ error: "فهرست ترتیب ارسال نشده است." });
  const update = db.prepare("UPDATE menu_items SET sort_order = ? WHERE id = ?");
  ids.forEach((id, i) => update.run(i, Number(id)));
  res.json(grouped(false));
});

router.put("/:id", requireAdmin, (req, res) => {
  const current = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  if (!current) return res.status(404).json({ error: "لینک پیدا نشد." });
  const it = readItem(req.body || {}, current);
  db.prepare("UPDATE menu_items SET location = ?, label = ?, url = ?, icon = ?, type = ?, new_tab = ?, active = ? WHERE id = ?")
    .run(it.location, it.label, it.url, it.icon, it.type, it.new_tab, it.active, current.id);
  res.json(mapItem(db.prepare("SELECT * FROM menu_items WHERE id = ?").get(current.id)));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "لینک پیدا نشد." });
  res.status(204).end();
});

module.exports = router;
module.exports.grouped = grouped;
