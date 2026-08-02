import { createClient } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Storage backends:
//  - TURSO_DATABASE_URL set (e.g. on Vercel): hosted libSQL/Turso database.
//  - otherwise: local SQLite file in DATA_DIR (VPS / Docker / dev).
let client;
let ready;

function getClient() {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  } else {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    client = createClient({ url: `file:${path.join(DATA_DIR, 'testimonials.db')}` });
  }
  return client;
}

async function migrate(c) {
  await c.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        password_hash TEXT NOT NULL DEFAULT '',
        google_id TEXT UNIQUE,
        plan TEXT NOT NULL DEFAULT 'free',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS walls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        accent TEXT NOT NULL DEFAULT '#6366f1',
        hide_badge INTEGER NOT NULL DEFAULT 0,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wall_id INTEGER NOT NULL REFERENCES walls(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT '',
        url TEXT NOT NULL DEFAULT '',
        avatar TEXT NOT NULL DEFAULT '',
        rating INTEGER NOT NULL DEFAULT 5,
        text TEXT NOT NULL,
        video_url TEXT NOT NULL DEFAULT '',
        approved INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_testimonials_wall ON testimonials(wall_id, approved)`,
      `CREATE INDEX IF NOT EXISTS idx_walls_user ON walls(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
    ],
    'write'
  );
  // Upgrade path for databases created before accounts existed.
  try {
    await c.execute('ALTER TABLE walls ADD COLUMN user_id INTEGER REFERENCES users(id)');
  } catch {
    // column already exists
  }
}

async function db() {
  const c = getClient();
  if (!ready) ready = migrate(c);
  await ready;
  return c;
}

async function one(sql, args = []) {
  const c = await db();
  const res = await c.execute({ sql, args });
  return res.rows[0];
}

async function all(sql, args = []) {
  const c = await db();
  const res = await c.execute({ sql, args });
  return res.rows;
}

export async function run(sql, args = []) {
  const c = await db();
  return c.execute({ sql, args });
}

/* ---------------- walls ---------------- */

export function slugify(input) {
  const base = String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || crypto.randomBytes(3).toString('hex');
}

export async function uniqueSlug(title) {
  let slug = slugify(title);
  while (await one('SELECT 1 AS x FROM walls WHERE slug = ?', [slug])) {
    slug = `${slugify(title)}-${crypto.randomBytes(2).toString('hex')}`;
  }
  return slug;
}

// Wall rows include owner_plan (null for ownerless walls from self-hosted
// single-user mode) so plan gating can be applied at render time.
export function getWallBySlug(slug) {
  return one(
    `SELECT w.*, u.plan AS owner_plan FROM walls w
     LEFT JOIN users u ON u.id = w.user_id WHERE w.slug = ?`,
    [slug]
  );
}

export function getWallById(id) {
  return one(
    `SELECT w.*, u.plan AS owner_plan FROM walls w
     LEFT JOIN users u ON u.id = w.user_id WHERE w.id = ?`,
    [id]
  );
}

export function listWallsByUser(userId) {
  return all(
    `SELECT w.*,
      (SELECT COUNT(*) FROM testimonials t WHERE t.wall_id = w.id) AS total,
      (SELECT COUNT(*) FROM testimonials t WHERE t.wall_id = w.id AND t.approved = 0) AS pending
     FROM walls w WHERE w.user_id = ? ORDER BY w.created_at DESC, w.id DESC`,
    [userId]
  );
}

export function countWallsByUser(userId) {
  return one('SELECT COUNT(*) AS n FROM walls WHERE user_id = ?', [userId]).then((r) => r?.n ?? 0);
}

export function countTestimonials(wallId) {
  return one('SELECT COUNT(*) AS n FROM testimonials WHERE wall_id = ?', [wallId]).then(
    (r) => r?.n ?? 0
  );
}

export function approvedTestimonials(wallId) {
  return all(
    'SELECT * FROM testimonials WHERE wall_id = ? AND approved = 1 ORDER BY created_at DESC, id DESC',
    [wallId]
  );
}

export function allTestimonials(wallId) {
  return all(
    'SELECT * FROM testimonials WHERE wall_id = ? ORDER BY approved ASC, created_at DESC, id DESC',
    [wallId]
  );
}

export function incrementViews(wallId) {
  return run('UPDATE walls SET views = views + 1 WHERE id = ?', [wallId]);
}

/* ---------------- users & sessions ---------------- */

export function getUserByEmail(email) {
  return one('SELECT * FROM users WHERE email = ?', [email]);
}

export function getUserById(id) {
  return one('SELECT * FROM users WHERE id = ?', [id]);
}

export function getUserByGoogleId(googleId) {
  return one('SELECT * FROM users WHERE google_id = ?', [googleId]);
}

export async function createUser({ email, name = '', passwordHash = '', googleId = null }) {
  const info = await run(
    'INSERT INTO users (email, name, password_hash, google_id) VALUES (?, ?, ?, ?)',
    [email, name, passwordHash, googleId]
  );
  return getUserById(Number(info.lastInsertRowid));
}

export async function createSession(userId, days = 30) {
  const token = crypto.randomBytes(32).toString('hex');
  await run(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', ?))",
    [token, userId, `+${days} days`]
  );
  // opportunistic cleanup of expired sessions
  run("DELETE FROM sessions WHERE expires_at < datetime('now')").catch(() => {});
  return token;
}

export function getUserBySession(token) {
  if (!token) return Promise.resolve(undefined);
  return one(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`,
    [token]
  );
}

export function deleteSession(token) {
  return run('DELETE FROM sessions WHERE token = ?', [token]);
}

/* ---------------- platform admin ---------------- */

export function adminStats() {
  return one(
    `SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM users WHERE plan != 'free') AS paying,
      (SELECT COUNT(*) FROM walls) AS walls,
      (SELECT COUNT(*) FROM testimonials) AS testimonials,
      (SELECT COALESCE(SUM(views), 0) FROM walls) AS views`
  );
}

export function adminListUsers() {
  return all(
    `SELECT u.id, u.email, u.name, u.plan, u.created_at,
      (SELECT COUNT(*) FROM walls w WHERE w.user_id = u.id) AS walls,
      (SELECT COUNT(*) FROM testimonials t JOIN walls w ON w.id = t.wall_id WHERE w.user_id = u.id) AS testimonials
     FROM users u ORDER BY u.created_at DESC LIMIT 200`
  );
}

export function adminListWalls() {
  return all(
    `SELECT w.id, w.slug, w.title, w.views, w.created_at, u.email AS owner,
      (SELECT COUNT(*) FROM testimonials t WHERE t.wall_id = w.id) AS total
     FROM walls w LEFT JOIN users u ON u.id = w.user_id
     ORDER BY w.created_at DESC LIMIT 200`
  );
}
