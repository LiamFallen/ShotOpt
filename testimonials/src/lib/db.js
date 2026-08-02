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

async function db() {
  const c = getClient();
  if (!ready) {
    ready = c.batch(
      [
        `CREATE TABLE IF NOT EXISTS walls (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      ],
      'write'
    );
  }
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

export function getWallBySlug(slug) {
  return one('SELECT * FROM walls WHERE slug = ?', [slug]);
}

export function getWallById(id) {
  return one('SELECT * FROM walls WHERE id = ?', [id]);
}

export function listWalls() {
  return all(
    `SELECT w.*,
      (SELECT COUNT(*) FROM testimonials t WHERE t.wall_id = w.id) AS total,
      (SELECT COUNT(*) FROM testimonials t WHERE t.wall_id = w.id AND t.approved = 0) AS pending
     FROM walls w ORDER BY w.created_at DESC, w.id DESC`
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
