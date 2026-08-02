import { notFound } from 'next/navigation';
import TestimonialCard from '@/components/TestimonialCard';
import { getWallBySlug, approvedTestimonials, incrementViews } from '@/lib/db';
import { PRODUCT_NAME, PRODUCT_URL, appUrl } from '@/lib/config';

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
  const items = await approvedTestimonials(wall.id);

  return (
    <main className="container" style={{ '--accent': wall.accent }}>
      <header className="page-header">
        <h1>{wall.title}</h1>
        {wall.description ? <p>{wall.description}</p> : null}
      </header>

      {items.length === 0 ? (
        <div className="empty">No testimonials yet — be the first to leave one!</div>
      ) : (
        <div className="masonry">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      )}

      <div className="badge-row">
        <a className="btn secondary" href={`/submit/${wall.slug}`}>
          Leave a testimonial
        </a>
      </div>

      {wall.hide_badge ? null : (
        <div className="badge-row">
          <a className="powered-by" href={PRODUCT_URL} target="_blank" rel="noopener noreferrer">
            Powered by {PRODUCT_NAME}
          </a>
        </div>
      )}
    </main>
  );
}
