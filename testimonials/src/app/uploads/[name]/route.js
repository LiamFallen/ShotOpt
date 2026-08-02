import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOADS_DIR } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Serve resized avatars from the data directory.
export async function GET(_request, { params }) {
  const { name } = await params;
  if (!/^[\w-]+\.webp$/.test(name)) {
    return new NextResponse('Not found', { status: 404 });
  }
  try {
    const buf = await fs.readFile(path.join(UPLOADS_DIR, name));
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
