import { IconStar } from './icons';

export default function Stars({ rating, size = 15 }) {
  const r = Math.min(5, Math.max(1, Number(rating) || 5));
  return (
    <span className="t-stars" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} size={size} className={i <= r ? undefined : 'off'} />
      ))}
    </span>
  );
}
