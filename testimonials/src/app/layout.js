import './globals.css';
import { PRODUCT_NAME } from '@/lib/config';

export const metadata = {
  title: PRODUCT_NAME,
  description: 'Collect and display customer testimonials.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
