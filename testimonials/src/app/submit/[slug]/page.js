import { notFound } from 'next/navigation';
import SubmitForm from './submit-form';
import { getWallBySlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const wall = await getWallBySlug(slug);
  if (!wall) return {};
  return {
    title: `Leave a testimonial — ${wall.title}`,
    description: wall.description || `Share your experience with ${wall.title}`,
    robots: { index: false },
  };
}

export default async function SubmitPage({ params }) {
  const { slug } = await params;
  const wall = await getWallBySlug(slug);
  if (!wall) notFound();

  return (
    <main
      className="container narrow"
      style={{ '--brand': wall.accent, '--brand-dark': wall.accent, paddingTop: '3.5rem' }}
    >
      <header className="page-header">
        <h1>{wall.title}</h1>
        <p>{wall.prompt || wall.description || 'We’d love to hear what you think. It takes a minute.'}</p>
      </header>
      <SubmitForm
        slug={wall.slug}
        wallTitle={wall.title}
        collectPhoto={!!wall.collect_photo}
        collectVideo={!!wall.collect_video}
        autoApprove={!!wall.auto_approve}
      />
    </main>
  );
}
