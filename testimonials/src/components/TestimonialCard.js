import Stars from './Stars';
import VideoPlayer from './VideoPlayer';
import { parseVideoUrl } from '@/lib/video';

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function TestimonialCard({ t }) {
  const video = parseVideoUrl(t.video_url);
  const safeUrl = /^https?:\/\//.test(t.url) ? t.url : '';
  return (
    <article className="t-card">
      <div className="t-head">
        {t.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="t-avatar" src={`/uploads/${t.avatar}`} alt="" loading="lazy" />
        ) : (
          <span className="t-avatar initials" aria-hidden>
            {initials(t.name)}
          </span>
        )}
        <div>
          <div className="t-name">
            {safeUrl ? (
              <a href={safeUrl} target="_blank" rel="noopener noreferrer nofollow">
                {t.name}
              </a>
            ) : (
              t.name
            )}
          </div>
          {t.role ? <div className="t-role">{t.role}</div> : null}
        </div>
      </div>
      <Stars rating={t.rating} />
      <p className="t-text">{t.text}</p>
      {video ? <VideoPlayer video={video} title={`Video from ${t.name}`} /> : null}
    </article>
  );
}
