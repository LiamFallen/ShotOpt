'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { run, getWallById, uniqueSlug, countWallsByUser, countTestimonials } from '@/lib/db';
import { parseVideoUrl } from '@/lib/video';
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
  const prompt = String(formData.get('prompt') || '').trim().slice(0, 300);
  const collectPhoto = formData.get('collect_photo') ? 1 : 0;
  const collectVideo = formData.get('collect_video') ? 1 : 0;
  const autoApprove = formData.get('auto_approve') ? 1 : 0;
  await run(
    `UPDATE walls SET title = ?, description = ?, accent = ?, hide_badge = ?,
       prompt = ?, collect_photo = ?, collect_video = ?, auto_approve = ?
     WHERE id = ?`,
    [title, description, accent, hideBadge, prompt, collectPhoto, collectVideo, autoApprove, wall.id]
  );
  revalidatePath(`/dashboard/w/${wall.id}`);
  revalidatePath(`/w/${wall.slug}`);
}

export async function togglePin(formData) {
  const user = await requireUser();
  const id = Number(formData.get('id'));
  const t = await one('SELECT wall_id, pinned FROM testimonials WHERE id = ?', [id]);
  if (!t) return;
  const wall = await ownedWall(t.wall_id, user);
  if (!wall) return;
  await run('UPDATE testimonials SET pinned = ? WHERE id = ?', [t.pinned ? 0 : 1, id]);
  revalidatePath(`/dashboard/w/${wall.id}`);
  revalidatePath(`/w/${wall.slug}`);
}

// Manually add a testimonial you already have (from an email, a tweet, a DM).
export async function addTestimonial(prevState, formData) {
  const user = await requireUser();
  const wall = await ownedWall(formData.get('wall_id'), user);
  if (!wall) return { error: 'Wall not found.' };
  const plan = planOf(user);
  if ((await countTestimonials(wall.id)) >= plan.maxTestimonialsPerWall) {
    return {
      error: `This wall is at the ${plan.name} plan limit of ${plan.maxTestimonialsPerWall} testimonials. Upgrade to Pro to add more.`,
    };
  }
  const name = String(formData.get('name') || '').trim().slice(0, 100);
  const text = String(formData.get('text') || '').trim().slice(0, 2000);
  if (!name || text.length < 2) return { error: 'A name and the testimonial text are required.' };
  const role = String(formData.get('role') || '').trim().slice(0, 120);
  const rating = Math.min(5, Math.max(1, parseInt(formData.get('rating'), 10) || 5));
  const videoRaw = String(formData.get('video_url') || '').trim().slice(0, 300);
  if (videoRaw && !parseVideoUrl(videoRaw)) {
    return { error: 'Video link must be a YouTube, Vimeo or Loom URL.' };
  }
  await run(
    `INSERT INTO testimonials (wall_id, name, role, rating, text, video_url, approved, source)
     VALUES (?, ?, ?, ?, ?, ?, 1, 'manual')`,
    [wall.id, name, role, rating, text, videoRaw]
  );
  revalidatePath(`/dashboard/w/${wall.id}`);
  revalidatePath(`/w/${wall.slug}`);
  return { ok: true };
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
