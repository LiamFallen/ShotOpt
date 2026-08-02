export const PRODUCT_NAME = process.env.PRODUCT_NAME || 'Lovewall';
export const PRODUCT_URL = process.env.PRODUCT_URL || 'https://github.com/GitLiamNow/testimonials';

export function appUrl() {
  return (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
}
