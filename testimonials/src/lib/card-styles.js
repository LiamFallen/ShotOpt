// The testimonial card style library. Each style is a CSS variant class
// (`tc-<key>` on the app, `lw-s-<key>` in the embed) driven by the wall's
// accent colour. Adding a style: add it here + its CSS in globals.css and
// public/embed.js.
export const CARD_STYLES = [
  {
    key: 'clean',
    name: 'Clean',
    blurb: 'Crisp white card, quiet border. Fits anywhere.',
  },
  {
    key: 'gradient',
    name: 'Gradient',
    blurb: 'Soft accent-tinted gradient with a lifted shadow.',
  },
  {
    key: 'aurora',
    name: 'Aurora',
    blurb: 'White card wrapped in a vivid gradient border.',
  },
  {
    key: 'bold',
    name: 'Bold',
    blurb: 'Deep ink card, white type. Maximum contrast.',
  },
  {
    key: 'quote',
    name: 'Editorial',
    blurb: 'Serif pull-quote with an oversized quotation mark.',
  },
  {
    key: 'spotlight',
    name: 'Spotlight',
    blurb: 'Centered portrait with a gradient avatar ring.',
  },
];

export const CARD_STYLE_KEYS = CARD_STYLES.map((s) => s.key);

export function validCardStyle(key) {
  return CARD_STYLE_KEYS.includes(key) ? key : 'clean';
}
