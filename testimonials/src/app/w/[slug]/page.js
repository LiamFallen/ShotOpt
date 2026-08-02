import { notFound } from 'next/navigation';
import TestimonialCard from '@/components/TestimonialCard';
import Stars from '@/components/Stars';
import { getWallBySlug, approvedTestimonials, incrementViews, wallSummary } from '@/lib/db';
import { badgeVisible } from '@/lib/plans';
import { PRODUCT_NAME, PRODUCT_URL, appUrl } from '@/lib/config';
import { IconHeartMark } from '@/components/icons';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const wall = await getWallBySlug(slug);
  if (!wall) return {};
  const title = wall.title;
  const description = wall.description || `What people say about ${wall.title}`;
  const url = `${appUrl()}/w/${wall.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: PRODUCT_NAME },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function WallPage({ params }) {
  const { slug } = await params;
  const wall = await getWallBySlug(slug);
  if (!wall) notFound();
  await incrementViews(wall.id);
  const [items, summary] = await Promise.all([approvedTestimonials(wall.id), wallSummary(wall.id)]);

  return (
    <main
      className="container"
      style={{ '--brand': wall.accent, '--brand-dark': wall.accent }}
    >
      <header className="page-header">
        <h1>{wall.title}</h1>
        {wall.description ? <p>{wall.description}</p> : null}
        {summary.count > 0 ? (
          <div className="rating-line">
            <Stars rating={Math.round(summary.avg)} size={15} />
            <span>
              {summary.avg} from {summary.count} testimonial{summary.count === 1 ? '' : 's'}
            </span>
          </div>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <strong>No testimonials yet</strong>
          Be the first to leave one!
        </div>
      ) : (
        <div className="masonry">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      )}

      <div className="badge-row">
        <a className="btn secondary pill" href={`/submit/${wall.slug}`}>
          Leave a testimonial
        </a>
      </div>

      {badgeVisible(wall) ? (
        <div className="badge-row" style={{ marginTop: '1.4rem' }}>
          <a className="powered-by" href={PRODUCT_URL} target="_blank" rel="noopener noreferrer">
            <IconHeartMark size={13} /> Powered by {PRODUCT_NAME}
          </a>
        </div>
      ) : null}
    </main>
  );
}
