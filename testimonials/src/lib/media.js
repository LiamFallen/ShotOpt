import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { UPLOADS_DIR } from './db';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

// Resize to max 128px, convert to webp, write to the uploads dir.
// Returns the stored filename, or '' if the input can't be processed.
export async function storeAvatar(buffer) {
  if (!buffer || buffer.length === 0 || buffer.length > MAX_AVATAR_BYTES) return '';
  try {
    const out = await sharp(buffer, { failOn: 'error' })
      .rotate()
      .resize(128, 128, { fit: 'cover', withoutEnlargement: false })
      .webp({ quality: 82 })
      .toBuffer();
    const name = `${crypto.randomUUID()}.webp`;
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
