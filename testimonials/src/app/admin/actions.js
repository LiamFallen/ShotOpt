'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getDb, getWallById, uniqueSlug, UPLOADS_DIR } from '@/lib/db';

const HEX = /^#[0-9a-fA-F]{6}$/;

export async function createWall(formData) {
  const title = String(formData.get('title') || '').trim().slice(0, 100);
  if (!title) return;
  const description = String(formData.get('description') || '').trim().slice(0, 300);
  const requested = String(formData.get('slug') || '').trim();
  const slug = uniqueSlug(requested || title);
  const db = getDb();
  const info = db
    .prepare('INSERT INTO walls (slug, title, description) VALUES (?, ?, ?)')
    .run(slug, title, description);
  revalidatePath('/admin');
  redirect(`/admin/w/${info.lastInsertRowid}`);
}

export async function updateWall(formData) {
  const id = Number(formData.get('id'));
  const wall = getWallById(id);
  if (!wall) return;
  const title = String(formData.get('title') || '').trim().slice(0, 100) || wall.title;
  const description = String(formData.get('description') || '').trim().slice(0, 300);
  const accentRaw = String(formData.get('accent') || '').trim();
  const accent = HEX.test(accentRaw) ? accentRaw : wall.accent;
  const hideBadge = formData.get('hide_badge') ? 1 : 0;
  getDb()
    .prepare('UPDATE walls SET title = ?, description = ?, accent = ?, hide_badge = ? WHERE id = ?')
    .run(title, description, accent, hideBadge, id);
  revalidatePath(`/admin/w/${id}`);
  revalidatePath(`/w/${wall.slug}`);
}

export async function deleteWall(formData) {
  const id = Number(formData.get('id'));
  const db = getDb();
  const avatars = db
    .prepare("SELECT avatar FROM testimonials WHERE wall_id = ? AND avatar != ''")
    .all(id);
  db.prepare('DELETE FROM walls WHERE id = ?').run(id);
  await removeAvatarFiles(avatars.map((a) => a.avatar));
  revalidatePath('/admin');
  redirect('/admin');
}

export async function setApproval(formData) {
  const id = Number(formData.get('id'));
  const approved = Number(formData.get('approved')) ? 1 : 0;
  const db = getDb();
  const t = db.prepare('SELECT wall_id FROM testimonials WHERE id = ?').get(id);
  if (!t) return;
  db.prepare('UPDATE testimonials SET approved = ? WHERE id = ?').run(approved, id);
  revalidatePath(`/admin/w/${t.wall_id}`);
  revalidatePath('/admin');
}

export async function deleteTestimonial(formData) {
  const id = Number(formData.get('id'));
  const db = getDb();
  const t = db.prepare('SELECT wall_id, avatar FROM testimonials WHERE id = ?').get(id);
  if (!t) return;
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
  if (t.avatar) await removeAvatarFiles([t.avatar]);
  revalidatePath(`/admin/w/${t.wall_id}`);
  revalidatePath('/admin');
}

async function removeAvatarFiles(names) {
  await Promise.all(
    names
      .filter((n) => /^[\w-]+\.webp$/.test(n))
      .map((n) => fs.unlink(path.join(UPLOADS_DIR, n)).catch(() => {}))
  );
}
