const STAR_PATH =
  'M12 2l2.9 6.26 6.86.72-5.12 4.62 1.43 6.73L12 16.9l-6.07 3.43 1.43-6.73L2.24 8.98l6.86-.72z';

export default function Stars({ rating }) {
  const r = Math.min(5, Math.max(1, Number(rating) || 5));
  return (
    <span className="t-stars" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill={i <= r ? 'var(--star)' : 'var(--border)'} aria-hidden>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}
