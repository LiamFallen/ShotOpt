import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let db;

export function getDb() {
  if (db) return db;
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, 'testimonials.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS walls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      accent TEXT NOT NULL DEFAULT '#6366f1',
      hide_badge INTEGER NOT NULL DEFAULT 0,
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS testimonials (
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
    );
    CREATE INDEX IF NOT EXISTS idx_testimonials_wall ON testimonials(wall_id, approved);
  `);
  return db;
}

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

export function uniqueSlug(title) {
  const d = getDb();
  let slug = slugify(title);
  while (d.prepare('SELECT 1 FROM walls WHERE slug = ?').get(slug)) {
    slug = `${slugify(title)}-${crypto.randomBytes(2).toString('hex')}`;
  }
  return slug;
}

export function getWallBySlug(slug) {
  return getDb().prepare('SELECT * FROM walls WHERE slug = ?').get(slug);
}

export function getWallById(id) {
  return getDb().prepare('SELECT * FROM walls WHERE id = ?').get(id);
}

export function listWalls() {
  return getDb()
    .prepare(
      `SELECT w.*,
        (SELECT COUNT(*) FROM testimonials t WHERE t.wall_id = w.id) AS total,
        (SELECT COUNT(*) FROM testimonials t WHERE t.wall_id = w.id AND t.approved = 0) AS pending
       FROM walls w ORDER BY w.created_at DESC`
    )
    .all();
}

export function approvedTestimonials(wallId) {
  return getDb()
    .prepare('SELECT * FROM testimonials WHERE wall_id = ? AND approved = 1 ORDER BY created_at DESC')
    .all(wallId);
}

export function allTestimonials(wallId) {
  return getDb()
    .prepare('SELECT * FROM testimonials WHERE wall_id = ? ORDER BY approved ASC, created_at DESC')
    .all(wallId);
}

export function incrementViews(wallId) {
  getDb().prepare('UPDATE walls SET views = views + 1 WHERE id = ?').run(wallId);
}
