import { NextResponse } from 'next/server';
import { run, getWallBySlug } from '@/lib/db';
import { storeAvatar, fetchAndStoreAvatar } from '@/lib/media';
import { parseVideoUrl } from '@/lib/video';

export const dynamic = 'force-dynamic';

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

function cleanUrl(v) {
  const s = clean(v, 300);
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const wall = await getWallBySlug(slug);
  if (!wall) return NextResponse.json({ error: 'Wall not found' }, { status: 404 });

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  // Honeypot: bots that fill every field get a fake success.
  if (clean(form.get('company_website'), 300)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(form.get('name'), 100);
  const text = clean(form.get('text'), 2000);
  const rating = Math.min(5, Math.max(1, parseInt(form.get('rating'), 10) || 5));
  if (!name || text.length < 10) {
    return NextResponse.json(
      { error: 'Please provide your name and a testimonial of at least 10 characters.' },
      { status: 400 }
    );
  }

  const role = clean(form.get('role'), 120);
  const url = cleanUrl(form.get('url'));
  const videoRaw = cleanUrl(form.get('video_url'));
  if (videoRaw && !parseVideoUrl(videoRaw)) {
    return NextResponse.json(
      { error: 'Video link must be a YouTube, Vimeo or Loom URL.' },
      { status: 400 }
    );
  }

  let avatar = '';
  const file = form.get('avatar');
  if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
    avatar = await storeAvatar(Buffer.from(await file.arrayBuffer()));
  }
  if (!avatar) {
    const avatarUrl = cleanUrl(form.get('avatar_url'));
    if (avatarUrl) avatar = await fetchAndStoreAvatar(avatarUrl);
  }

  await run(
    `INSERT INTO testimonials (wall_id, name, role, url, avatar, rating, text, video_url, approved)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [wall.id, name, role, url, avatar, rating, text, videoRaw]
  );

  return NextResponse.json({ ok: true });
}
