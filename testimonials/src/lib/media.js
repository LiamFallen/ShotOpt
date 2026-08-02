import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { UPLOADS_DIR } from './db';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

// Avatars are stored either on Vercel Blob (when BLOB_READ_WRITE_TOKEN is set,
// value is the full https URL) or on local disk (value is the filename, served
// via /uploads/[name]). avatarSrc() resolves either form for rendering.
export function avatarSrc(avatar, base = '') {
  if (!avatar) return '';
  return /^https?:\/\//.test(avatar) ? avatar : `${base}/uploads/${avatar}`;
}

// Resize to max 128px, convert to webp, persist. Returns the stored
// reference (URL or filename), or '' if the input can't be processed.
export async function storeAvatar(buffer) {
  if (!buffer || buffer.length === 0 || buffer.length > MAX_AVATAR_BYTES) return '';
  let out;
  try {
    out = await sharp(buffer, { failOn: 'error' })
      .rotate()
      .resize(128, 128, { fit: 'cover', withoutEnlargement: false })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return '';
  }
  const name = `${crypto.randomUUID()}.webp`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(`avatars/${name}`, out, {
        access: 'public',
        contentType: 'image/webp',
        cacheControlMaxAge: 31536000,
      });
      return blob.url;
    } catch {
      return '';
    }
  }
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOADS_DIR, name), out);
    return name;
  } catch {
    return '';
  }
}

// Fetch a remote image (user-provided avatar URL) and store it.
export async function fetchAndStoreAvatar(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl).trim());
  } catch {
    return '';
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: { 'user-agent': 'lovewall-avatar-fetch/1.0' },
    });
    if (!res.ok) return '';
    const type = res.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return '';
    const len = Number(res.headers.get('content-length') || 0);
    if (len > MAX_AVATAR_BYTES) return '';
    const buf = Buffer.from(await res.arrayBuffer());
    return await storeAvatar(buf);
  } catch {
    return '';
  }
}

// Delete stored avatars (blob URLs or local filenames). Best-effort.
export async function removeAvatars(refs) {
  const urls = refs.filter((r) => /^https?:\/\//.test(r));
  const files = refs.filter((r) => /^[\w-]+\.webp$/.test(r));
  if (urls.length && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { del } = await import('@vercel/blob');
      await del(urls);
    } catch {
      // best-effort
    }
  }
  await Promise.all(files.map((n) => fs.unlink(path.join(UPLOADS_DIR, n)).catch(() => {})));
}
