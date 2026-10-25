/*
 * پشتیبان‌گیری از دیتابیس: هر روز یک نسخه خودکار در پوشه server/backups ساخته می‌شود
 * (این پوشه هرگز از طریق وب در دسترس نیست) و مدیر می‌تواند از پنل ادمین یک نسخه کامل دانلود کند.
 */
const fs = require("node:fs");
const path = require("node:path");
const db = require("../db");

const BACKUP_DIR = path.join(__dirname, "..", "backups");
const KEEP = 14;
const DAY = 24 * 60 * 60 * 1000;
const FILE_RE = /^daneshbook-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-(auto|manual)\.db$/;

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter(name => FILE_RE.test(name))
    .map(name => {
      const stat = fs.statSync(path.join(BACKUP_DIR, name));
      return { name, size: stat.size, createdAt: stat.mtime.toISOString(), type: name.endsWith("-manual.db") ? "manual" : "auto" };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function prune() {
  for (const old of listBackups().slice(KEEP)) {
    try { fs.unlinkSync(path.join(BACKUP_DIR, old.name)); } catch (e) { /* قابل چشم‌پوشی */ }
  }
}

// VACUUM INTO یک کپی سالم و یکپارچه از دیتابیس می‌سازد، حتی وقتی سایت در حال کار است
function createBackup(type = "auto") {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
  const name = `daneshbook-${stamp}-${type}.db`;
  const target = path.join(BACKUP_DIR, name);
  if (fs.existsSync(target)) fs.unlinkSync(target);
  db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  prune();
  return { name, path: target };
}

function backupIfDue() {
  const latestAuto = listBackups().find(b => b.type === "auto");
  if (!latestAuto || Date.now() - new Date(latestAuto.createdAt).getTime() > DAY) {
    try {
      createBackup("auto");
    } catch (e) {
      console.error("[backup] ساخت نسخه پشتیبان خودکار انجام نشد:", e.message);
    }
  }
}

function scheduleAutoBackups() {
  backupIfDue();
  setInterval(backupIfDue, 6 * 60 * 60 * 1000).unref();
}

module.exports = { listBackups, createBackup, scheduleAutoBackups, BACKUP_DIR };
