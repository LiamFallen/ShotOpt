import './globals.css';
import { PRODUCT_NAME, appUrl } from '@/lib/config';

export const metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${PRODUCT_NAME} — collect testimonials, show them everywhere`,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description:
    'Collect text and video testimonials with a shareable link, curate them in one dashboard, and show them off on a hosted wall or a one-line embed.',
  openGraph: {
    siteName: PRODUCT_NAME,
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
