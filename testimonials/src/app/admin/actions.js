'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { run, getWallById, uniqueSlug } from '@/lib/db';
import { removeAvatars } from '@/lib/media';

const HEX = /^#[0-9a-fA-F]{6}$/;

async function one(sql, args) {
  const res = await run(sql, args);
  return res.rows[0];
}

export async function createWall(formData) {
  const title = String(formData.get('title') || '').trim().slice(0, 100);
  if (!title) return;
  const description = String(formData.get('description') || '').trim().slice(0, 300);
  const requested = String(formData.get('slug') || '').trim();
  const slug = await uniqueSlug(requested || title);
  const info = await run('INSERT INTO walls (slug, title, description) VALUES (?, ?, ?)', [
    slug,
    title,
    description,
  ]);
  revalidatePath('/admin');
  redirect(`/admin/w/${Number(info.lastInsertRowid)}`);
}

export async function updateWall(formData) {
  const id = Number(formData.get('id'));
  const wall = await getWallById(id);
  if (!wall) return;
  const title = String(formData.get('title') || '').trim().slice(0, 100) || wall.title;
  const description = String(formData.get('description') || '').trim().slice(0, 300);
  const accentRaw = String(formData.get('accent') || '').trim();
  const accent = HEX.test(accentRaw) ? accentRaw : wall.accent;
  const hideBadge = formData.get('hide_badge') ? 1 : 0;
  await run('UPDATE walls SET title = ?, description = ?, accent = ?, hide_badge = ? WHERE id = ?', [
    title,
    description,
    accent,
    hideBadge,
    id,
  ]);
  revalidatePath(`/admin/w/${id}`);
  revalidatePath(`/w/${wall.slug}`);
}

export async function deleteWall(formData) {
  const id = Number(formData.get('id'));
  const avatars = await run(
    "SELECT avatar FROM testimonials WHERE wall_id = ? AND avatar != ''",
    [id]
  );
  await run('DELETE FROM testimonials WHERE wall_id = ?', [id]);
  await run('DELETE FROM walls WHERE id = ?', [id]);
  await removeAvatars(avatars.rows.map((a) => a.avatar));
  revalidatePath('/admin');
  redirect('/admin');
}

export async function setApproval(formData) {
  const id = Number(formData.get('id'));
  const approved = Number(formData.get('approved')) ? 1 : 0;
  const t = await one('SELECT wall_id FROM testimonials WHERE id = ?', [id]);
  if (!t) return;
  await run('UPDATE testimonials SET approved = ? WHERE id = ?', [approved, id]);
  revalidatePath(`/admin/w/${t.wall_id}`);
  revalidatePath('/admin');
}

export async function deleteTestimonial(formData) {
  const id = Number(formData.get('id'));
  const t = await one('SELECT wall_id, avatar FROM testimonials WHERE id = ?', [id]);
  if (!t) return;
  await run('DELETE FROM testimonials WHERE id = ?', [id]);
  if (t.avatar) await removeAvatars([t.avatar]);
  revalidatePath(`/admin/w/${t.wall_id}`);
  revalidatePath('/admin');
}
