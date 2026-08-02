import Stars from './Stars';

// A static testimonial card used for previews (style picker, landing gallery,
// hero collage). Same markup shape as TestimonialCard, no live data.
export default function SampleCard({
  styleName = 'clean',
  name = 'Sarah Chen',
  role = 'Head of Growth, Driftline',
  rating = 5,
  text = 'We put the wall on our pricing page and trial-to-paid went up 22%.',
  color = '#635bff',
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('');
  return (
    <article className={`t-card tc-${styleName}`}>
      <div className="t-head">
        <span className="t-avatar initials" style={{ background: color }} aria-hidden>
          {initials}
        </span>
        <div>
          <div className="t-name">{name}</div>
          <div className="t-role">{role}</div>
        </div>
      </div>
      <Stars rating={rating} />
      <p className="t-text">{text}</p>
    </article>
  );
}
