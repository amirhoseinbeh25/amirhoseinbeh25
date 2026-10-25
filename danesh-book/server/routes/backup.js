const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const { listBackups, createBackup } = require("../lib/backup");

const router = express.Router();

router.get("/", requireAdmin, (req, res) => {
  res.json(listBackups());
});

// یک نسخه تازه می‌سازد و همان را برای دانلود می‌فرستد
router.get("/download", requireAdmin, (req, res) => {
  const backup = createBackup("manual");
  const date = new Date().toISOString().slice(0, 10);
  res.download(backup.path, `daneshbook-backup-${date}.db`);
});

module.exports = router;
