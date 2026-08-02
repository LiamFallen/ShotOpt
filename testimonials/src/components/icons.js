// Small stroke-icon set (24×24, 1.7px stroke, currentColor).
// Kept as plain components so both server and client components can use them.

function I({ children, size = 20, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconLink = (p) => (
  <I {...p}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </I>
);

export const IconVideo = (p) => (
  <I {...p}>
    <rect x="2.5" y="5.5" width="13" height="13" rx="2.5" />
    <path d="m15.5 10 5-3.5v11l-5-3.5" />
  </I>
);

export const IconGrid = (p) => (
  <I {...p}>
    <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="5.5" rx="1.5" />
    <rect x="13.5" y="12.5" width="7" height="8" rx="1.5" />
    <rect x="3.5" y="16" width="7" height="4.5" rx="1.5" />
  </I>
);

export const IconCode = (p) => (
  <I {...p}>
    <path d="m8 7-5 5 5 5" />
    <path d="m16 7 5 5-5 5" />
    <path d="m13.5 4-3 16" />
  </I>
);

export const IconShield = (p) => (
  <I {...p}>
    <path d="M12 2.8 4.5 5.6v5.2c0 4.6 3 8.6 7.5 10.4 4.5-1.8 7.5-5.8 7.5-10.4V5.6L12 2.8Z" />
    <path d="m8.8 11.8 2.3 2.3 4.2-4.4" />
  </I>
);

export const IconPalette = (p) => (
  <I {...p}>
    <path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.3 3.5-3.2 3.5h-2c-1.4 0-2.3 1-1.8 2.3.5 1.4-.3 3.2-2 3.2Z" />
    <circle cx="7.8" cy="10.5" r="0.4" fill="currentColor" />
    <circle cx="12" cy="7.5" r="0.4" fill="currentColor" />
    <circle cx="16.2" cy="10.5" r="0.4" fill="currentColor" />
  </I>
);

export const IconStar = ({ filled = true, size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...rest}>
    <path
      d="M12 2.6l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5-4.9-4.5 6.6-.8z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.7}
      strokeLinejoin="round"
    />
  </svg>
);

export const IconPin = (p) => (
  <I {...p}>
    <path d="M15 3.5 20.5 9l-4.2 1.2-3 5.8-2.2-2.2L4 20l6.2-7.1-2.2-2.2 5.8-3z" />
  </I>
);

export const IconDownload = (p) => (
  <I {...p}>
    <path d="M12 3.5v11" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M4.5 19.5h15" />
  </I>
);

export const IconPlus = (p) => (
  <I {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </I>
);

export const IconCheck = (p) => (
  <I {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </I>
);

export const IconArrow = (p) => (
  <I {...p}>
    <path d="M4 12h16" />
    <path d="m13.5 5.5 6.5 6.5-6.5 6.5" />
  </I>
);

export const IconCopy = (p) => (
  <I {...p}>
    <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
    <path d="M5.5 15h-1a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5v1" />
  </I>
);

export const IconWall = (p) => (
  <I {...p}>
    <path d="M3.5 9.5h17M3.5 14.5h17M9 4.5v5M15 9.5v5M9 14.5v5" />
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
  </I>
);

export const IconCard = (p) => (
  <I {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3 10h18" />
  </I>
);

export const IconLogout = (p) => (
  <I {...p}>
    <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" />
    <path d="M10.5 12H21m0 0-3.5-3.5M21 12l-3.5 3.5" />
  </I>
);

export const IconHeartMark = ({ size = 22, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...rest}>
    <path
      d="M12 20.7C6.6 16.9 3 13.6 3 9.7 3 6.9 5.2 5 7.6 5c1.8 0 3.3 1 4.4 2.6C13.1 6 14.6 5 16.4 5 18.8 5 21 6.9 21 9.7c0 3.9-3.6 7.2-9 11Z"
      fill="#635bff"
    />
  </svg>
);

export const IconSparkle = (p) => (
  <I {...p}>
    <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.1l-1.8-5.5L4.5 10.8 10.2 9z" />
    <path d="M19 3.5v3M17.5 5h3" />
  </I>
);

export const IconQuote = ({ size = 22, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...rest}>
    <path
      d="M5 6.5A4.5 4.5 0 0 0 3 10v6a1.5 1.5 0 0 0 1.5 1.5H9A1.5 1.5 0 0 0 10.5 16v-4.5A1.5 1.5 0 0 0 9 10H6.3A2.9 2.9 0 0 1 8 7.6zM15.5 6.5A4.5 4.5 0 0 0 13.5 10v6A1.5 1.5 0 0 0 15 17.5h4.5A1.5 1.5 0 0 0 21 16v-4.5A1.5 1.5 0 0 0 19.5 10h-2.7a2.9 2.9 0 0 1 1.7-2.4z"
      fill="currentColor"
    />
  </svg>
);
