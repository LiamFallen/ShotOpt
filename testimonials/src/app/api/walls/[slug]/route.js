import { NextResponse } from 'next/server';
import { getWallBySlug, approvedTestimonials, wallSummary } from '@/lib/db';
import { avatarSrc } from '@/lib/media';
import { parseVideoUrl } from '@/lib/video';
import { badgeVisible } from '@/lib/plans';
import { PRODUCT_NAME, PRODUCT_URL, appUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Public JSON feed of a wall's approved testimonials — consumed by /embed.js.
export async function GET(_request, { params }) {
  const { slug } = await params;
  const wall = await getWallBySlug(slug);
  if (!wall) {
    return NextResponse.json({ error: 'Wall not found' }, { status: 404, headers: CORS });
  }
  const base = appUrl();
  const summary = await wallSummary(wall.id);
  const items = (await approvedTestimonials(wall.id)).map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    url: t.url,
    avatar: avatarSrc(t.avatar, base),
    rating: t.rating,
    text: t.text,
    pinned: !!t.pinned,
    video: parseVideoUrl(t.video_url),
  }));
  return NextResponse.json(
    {
      wall: {
        slug: wall.slug,
        title: wall.title,
        description: wall.description,
        accent: wall.accent,
        hideBadge: !badgeVisible(wall),
        url: `${base}/w/${wall.slug}`,
        submitUrl: `${base}/submit/${wall.slug}`,
        rating: summary.avg,
        count: summary.count,
      },
      product: { name: PRODUCT_NAME, url: PRODUCT_URL },
      testimonials: items,
    },
    { headers: { ...CORS, 'Cache-Control': 'public, max-age=0, s-maxage=60' } }
  );
}
