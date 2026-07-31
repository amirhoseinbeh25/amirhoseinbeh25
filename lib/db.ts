import "server-only";

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { randomUUID } from "node:crypto";

/**
 * لایه داده سایت روی SQLite داخلی Node.
 *
 * چرا نه Prisma و better-sqlite3: آن‌ها به یک ماژول کامپایل‌شده نیاز دارند و
 * باینری آماده‌اش روی سرورهایی با glibc قدیمی‌تر بارگذاری نمی‌شود — دقیقاً
 * همان چیزی که روی هاست این سایت اتفاق افتاد. `node:sqlite` جزء خود Node
 * است، پس هرجا Node اجرا شود این هم اجرا می‌شود. حجم بسته را هم حدود صد
 * مگابایت کم می‌کند.
 *
 * پرس‌وجوها همگام‌اند. برای سایتی در این مقیاس مسئله‌ای نیست و کد را
 * ساده‌تر نگه می‌دارد.
 */

function resolveDatabasePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./data/site.db";
  const relative = url.replace(/^file:/, "");
  return isAbsolute(relative) ? relative : join(process.cwd(), relative);
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS AdminUser (
  id           TEXT PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt    TEXT NOT NULL,
  lastLoginAt  TEXT
);

CREATE TABLE IF NOT EXISTS Session (
  id        TEXT PRIMARY KEY,
  tokenHash TEXT NOT NULL UNIQUE,
  userId    TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  userAgent TEXT,
  ip        TEXT
);
CREATE INDEX IF NOT EXISTS Session_userId ON Session(userId);

CREATE TABLE IF NOT EXISTS Setting (
  key       TEXT PRIMARY KEY,
  value     TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS MediaAsset (
  id        TEXT PRIMARY KEY,
  filename  TEXT NOT NULL,
  path      TEXT NOT NULL UNIQUE,
  mimeType  TEXT NOT NULL,
  bytes     INTEGER NOT NULL,
  title     TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PageView (
  id          TEXT PRIMARY KEY,
  path        TEXT NOT NULL,
  referrer    TEXT,
  createdAt   TEXT NOT NULL,
  ip          TEXT,
  ipTruncated TEXT,
  country     TEXT,
  countryCode TEXT,
  city        TEXT,
  browser     TEXT,
  os          TEXT,
  deviceType  TEXT,
  deviceModel TEXT,
  userAgent   TEXT,
  visitorHash TEXT
);
CREATE INDEX IF NOT EXISTS PageView_createdAt ON PageView(createdAt);
CREATE INDEX IF NOT EXISTS PageView_path ON PageView(path);
CREATE INDEX IF NOT EXISTS PageView_visitorHash ON PageView(visitorHash);
`;

const globalForDb = globalThis as unknown as { siteDb?: DatabaseSync };

function connect(): DatabaseSync {
  const file = resolveDatabasePath();
  mkdirSync(dirname(file), { recursive: true });

  const database = new DatabaseSync(file);
  // نوشتن هم‌زمان با خواندن، بدون قفل شدن کل فایل
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(SCHEMA);
  return database;
}

export const db: DatabaseSync = globalForDb.siteDb ?? connect();
globalForDb.siteDb = db;

const now = () => new Date().toISOString();
const id = () => randomUUID();

/* ---------------------------------------------------------------- محتوا */

export type SettingRow = { key: string; value: string };

export const settings = {
  all(): SettingRow[] {
    return db.prepare("SELECT key, value FROM Setting").all() as SettingRow[];
  },

  set(key: string, value: string) {
    db.prepare(
      `INSERT INTO Setting (key, value, updatedAt) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
    ).run(key, value, now());
  },
};

/* ------------------------------------------------------------ کاربر مدیر */

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export const adminUsers = {
  count(): number {
    const row = db.prepare("SELECT COUNT(*) AS n FROM AdminUser").get() as {
      n: number;
    };
    return row.n;
  },

  findByEmail(email: string): AdminUser | undefined {
    return db.prepare("SELECT * FROM AdminUser WHERE email = ?").get(email) as
      | AdminUser
      | undefined;
  },

  create(input: { email: string; name: string; passwordHash: string }): AdminUser {
    const user: AdminUser = {
      id: id(),
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      createdAt: now(),
      lastLoginAt: null,
    };
    db.prepare(
      "INSERT INTO AdminUser (id, email, name, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)",
    ).run(user.id, user.email, user.name, user.passwordHash, user.createdAt);
    return user;
  },

  markLogin(userId: string) {
    db.prepare("UPDATE AdminUser SET lastLoginAt = ? WHERE id = ?").run(
      now(),
      userId,
    );
  },
};

/* ---------------------------------------------------------------- نشست‌ها */

export const sessions = {
  create(input: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    db.prepare(
      `INSERT INTO Session (id, tokenHash, userId, createdAt, expiresAt, ip, userAgent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id(),
      input.tokenHash,
      input.userId,
      now(),
      input.expiresAt.toISOString(),
      input.ip ?? null,
      input.userAgent ?? null,
    );
  },

  /** نشست معتبر همراه کاربرش، یا undefined اگر نبود یا منقضی شده بود. */
  findValid(tokenHash: string): AdminUser | undefined {
    const row = db
      .prepare(
        `SELECT u.*, s.expiresAt AS sessionExpiresAt
           FROM Session s JOIN AdminUser u ON u.id = s.userId
          WHERE s.tokenHash = ?`,
      )
      .get(tokenHash) as (AdminUser & { sessionExpiresAt: string }) | undefined;

    if (!row) return undefined;

    if (new Date(row.sessionExpiresAt) < new Date()) {
      sessions.remove(tokenHash);
      return undefined;
    }
    return row;
  },

  remove(tokenHash: string) {
    db.prepare("DELETE FROM Session WHERE tokenHash = ?").run(tokenHash);
  },

  purgeExpired() {
    db.prepare("DELETE FROM Session WHERE expiresAt < ?").run(now());
  },
};

/* ------------------------------------------------------------------ فایل‌ها */

export type MediaAsset = {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  bytes: number;
  title: string | null;
  createdAt: string;
};

export const media = {
  create(input: {
    filename: string;
    path: string;
    mimeType: string;
    bytes: number;
    title?: string | null;
  }): MediaAsset {
    const asset: MediaAsset = {
      id: id(),
      filename: input.filename,
      path: input.path,
      mimeType: input.mimeType,
      bytes: input.bytes,
      title: input.title ?? null,
      createdAt: now(),
    };
    db.prepare(
      `INSERT INTO MediaAsset (id, filename, path, mimeType, bytes, title, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      asset.id,
      asset.filename,
      asset.path,
      asset.mimeType,
      asset.bytes,
      asset.title,
      asset.createdAt,
    );
    return asset;
  },

  recent(limit = 100): MediaAsset[] {
    return db
      .prepare("SELECT * FROM MediaAsset ORDER BY createdAt DESC LIMIT ?")
      .all(limit) as MediaAsset[];
  },
};

/* ------------------------------------------------------------------- آمار */

export type PageViewInput = {
  path: string;
  referrer?: string | null;
  ip?: string | null;
  ipTruncated?: string | null;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  browser?: string | null;
  os?: string | null;
  deviceType?: string | null;
  deviceModel?: string | null;
  userAgent?: string | null;
  visitorHash?: string | null;
};

export type RecentView = {
  id: string;
  createdAt: string;
  path: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  deviceModel: string | null;
  browser: string | null;
  os: string | null;
};

/** ستون‌هایی که شمارش گروهی رویشان مجاز است — تا نام ستون از ورودی نیاید. */
const GROUPABLE = [
  "country",
  "countryCode",
  "city",
  "deviceType",
  "deviceModel",
  "browser",
  "os",
  "path",
] as const;

export type GroupColumn = (typeof GROUPABLE)[number];

export const pageViews = {
  record(input: PageViewInput) {
    db.prepare(
      `INSERT INTO PageView
         (id, path, referrer, createdAt, ip, ipTruncated, country, countryCode,
          city, browser, os, deviceType, deviceModel, userAgent, visitorHash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id(),
      input.path,
      input.referrer ?? null,
      now(),
      input.ip ?? null,
      input.ipTruncated ?? null,
      input.country ?? null,
      input.countryCode ?? null,
      input.city ?? null,
      input.browser ?? null,
      input.os ?? null,
      input.deviceType ?? null,
      input.deviceModel ?? null,
      input.userAgent ?? null,
      input.visitorHash ?? null,
    );
  },

  countSince(from: Date): number {
    const row = db
      .prepare("SELECT COUNT(*) AS n FROM PageView WHERE createdAt >= ?")
      .get(from.toISOString()) as { n: number };
    return row.n;
  },

  uniqueVisitorsSince(from: Date): number {
    const row = db
      .prepare(
        `SELECT COUNT(DISTINCT visitorHash) AS n FROM PageView
          WHERE createdAt >= ? AND visitorHash IS NOT NULL`,
      )
      .get(from.toISOString()) as { n: number };
    return row.n;
  },

  topBy(column: GroupColumn, from: Date, limit = 8) {
    if (!GROUPABLE.includes(column)) throw new Error("ستون نامعتبر");

    const rows = db
      .prepare(
        `SELECT ${column} AS label, COUNT(*) AS count FROM PageView
          WHERE createdAt >= ? AND ${column} IS NOT NULL AND ${column} <> ''
          GROUP BY ${column} ORDER BY count DESC LIMIT ?`,
      )
      .all(from.toISOString(), limit) as { label: string; count: number }[];

    return rows.map((row) => ({ label: String(row.label), count: row.count }));
  },

  recent(limit = 25): RecentView[] {
    return db
      .prepare(
        `SELECT id, createdAt, path, ip, country, city, deviceType, deviceModel,
                browser, os
           FROM PageView ORDER BY createdAt DESC LIMIT ?`,
      )
      .all(limit) as RecentView[];
  },
};
