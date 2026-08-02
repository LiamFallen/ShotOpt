import { redirect } from 'next/navigation';

// Legacy/nice-URL alias: /wall/:slug -> /w/:slug
export default async function WallAlias({ params }) {
  const { slug } = await params;
  redirect(`/w/${encodeURIComponent(slug)}`);
}
