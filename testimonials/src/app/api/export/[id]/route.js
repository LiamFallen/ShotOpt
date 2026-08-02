import { NextResponse } from 'next/server';
import { getWallById, allTestimonials } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// CSV export of a wall's testimonials — your data is always yours.
export async function GET(_request, { params }) {
  const user = await currentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  const wall = await getWallById(Number(id));
  if (!wall || wall.user_id !== user.id) return new NextResponse('Not found', { status: 404 });

  const rows = await allTestimonials(wall.id);
  const header = ['id', 'name', 'role', 'url', 'rating', 'text', 'video_url', 'status', 'pinned', 'source', 'created_at'];
  const lines = [header.join(',')];
  for (const t of rows) {
    lines.push(
      [
        t.id,
        csvCell(t.name),
        csvCell(t.role),
        csvCell(t.url),
        t.rating,
        csvCell(t.text),
        csvCell(t.video_url),
        t.approved ? 'live' : 'pending',
        t.pinned ? 'yes' : 'no',
        t.source,
        t.created_at,
      ].join(',')
    );
  }
  return new NextResponse(lines.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${wall.slug}-testimonials.csv"`,
    },
  });
}
