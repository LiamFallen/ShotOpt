'use client';

import { useState } from 'react';

// Click-to-play video card: shows a thumbnail (when the provider offers one)
// and only loads the third-party iframe after the user clicks.
export default function VideoPlayer({ video, title }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="t-video">
        <iframe
          src={video.embedUrl}
          title={title || 'Video testimonial'}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="t-video">
      {video.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbUrl}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <button type="button" onClick={() => setPlaying(true)} aria-label="Play video testimonial">
        <span className="play">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
