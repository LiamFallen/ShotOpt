'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { run, getWallById, uniqueSlug, countWallsByUser } from '@/lib/db';
import { removeAvatars } from '@/lib/media';
import { requireUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';

const HEX = /^#[0-9a-fA-F]{6}$/;

async function one(sql, args) {
  const res = await run(sql, args);
  return res.rows[0];
}

// Every action re-checks both login and ownership server-side.
async function ownedWall(id, user) {
  const wall = await getWallById(Number(id));
  if (!wall || wall.user_id !== user.id) return undefined;
  return wall;
}

export async function createWall(prevState, formData) {
  const user = await requireUser();
  const plan = planOf(user);
  const existing = await countWallsByUser(user.id);
  if (existing >= plan.maxWalls) {
    return {
      error: `The ${plan.name} plan includes ${plan.maxWalls} wall${plan.maxWalls === 1 ? '' : 's'}. Upgrade to Pro for unlimited walls.`,
    };
  }
  const title = String(formData.get('title') || '').trim().slice(0, 100);
  if (!title) return { error: 'Please give your wall a title.' };
  const description = String(formData.get('description') || '').trim().slice(0, 300);
  const requested = String(formData.get('slug') || '').trim();
  const slug = await uniqueSlug(requested || title);
  const info = await run(
    'INSERT INTO walls (user_id, slug, title, description) VALUES (?, ?, ?, ?)',
    [user.id, slug, title, description]
  );
  revalidatePath('/dashboard');
  redirect(`/dashboard/w/${Number(info.lastInsertRowid)}`);
}

export async function updateWall(formData) {
  const user = await requireUser();
  const wall = await ownedWall(formData.get('id'), user);
  if (!wall) return;
  const plan = planOf(user);
  const title = String(formData.get('title') || '').trim().slice(0, 100) || wall.title;
  const description = String(formData.get('description') || '').trim().slice(0, 300);
  const accentRaw = String(formData.get('accent') || '').trim();
  const accent = HEX.test(accentRaw) ? accentRaw : wall.accent;
  const hideBadge = plan.canHideBadge && formData.get('hide_badge') ? 1 : 0;
  await run('UPDATE walls SET title = ?, description = ?, accent = ?, hide_badge = ? WHERE id = ?', [
    title,
    description,
    accent,
    hideBadge,
    wall.id,
  ]);
  revalidatePath(`/dashboard/w/${wall.id}`);
  revalidatePath(`/w/${wall.slug}`);
}

export async function deleteWall(formData) {
  const user = await requireUser();
  const wall = await ownedWall(formData.get('id'), user);
  if (!wall) return;
  const avatars = await run(
    "SELECT avatar FROM testimonials WHERE wall_id = ? AND avatar != ''",
    [wall.id]
  );
  await run('DELETE FROM testimonials WHERE wall_id = ?', [wall.id]);
  await run('DELETE FROM walls WHERE id = ?', [wall.id]);
  await removeAvatars(avatars.rows.map((a) => a.avatar));
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function setApproval(formData) {
  const user = await requireUser();
  const id = Number(formData.get('id'));
  const approved = Number(formData.get('approved')) ? 1 : 0;
  const t = await one('SELECT wall_id FROM testimonials WHERE id = ?', [id]);
  if (!t) return;
  const wall = await ownedWall(t.wall_id, user);
  if (!wall) return;
  await run('UPDATE testimonials SET approved = ? WHERE id = ?', [approved, id]);
  revalidatePath(`/dashboard/w/${wall.id}`);
  revalidatePath('/dashboard');
}

export async function deleteTestimonial(formData) {
  const user = await requireUser();
  const id = Number(formData.get('id'));
  const t = await one('SELECT wall_id, avatar FROM testimonials WHERE id = ?', [id]);
  if (!t) return;
  const wall = await ownedWall(t.wall_id, user);
  if (!wall) return;
  await run('DELETE FROM testimonials WHERE id = ?', [id]);
  if (t.avatar) await removeAvatars([t.avatar]);
  revalidatePath(`/dashboard/w/${wall.id}`);
  revalidatePath('/dashboard');
}
