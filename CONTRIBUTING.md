# Contributing to ShotOpt

Thanks for wanting to help! ShotOpt is deliberately unusual, and most rejected
PRs fail on one of the project's constraints rather than on code quality — so
please read this first. It's short.

## The three rules

1. **One file.** The entire app — markup, styles and logic — lives in
   `index.html`. No bundler, no framework, no build step. If your change needs
   a build step, it needs a different approach.
2. **Zero dependencies, zero network.** The Content-Security-Policy in
   `_headers` locks the page to same-origin. No CDN scripts, no fonts, no
   analytics, no API calls. Features that need an asset must generate it
   procedurally (see the background library or the GIF encoder for the
   pattern). This is the product's core promise — "your images never leave
   your browser" — and it's enforced, not aspirational.
3. **Bump the cache.** Any change to `index.html` must bump `CACHE` in
   `sw.js` (`shotopt-v7` → `shotopt-v8`), or returning visitors keep the old
   version.

## Running locally

```bash
git clone https://github.com/LiamFallen/ShotOpt.git
cd ShotOpt
python3 -m http.server 8787     # or any static file server
```

Open `http://127.0.0.1:8787`. Opening `index.html` straight from disk also
works — you just lose the service worker and clipboard API (both need a
secure context).

## Testing

There's a Playwright smoke test that CI runs on every PR:

```bash
npm install          # installs Playwright (dev-only; the app itself has no deps)
npx playwright install chromium
npm test
```

It boots the app, loads an image, exercises the main controls and exports a
PNG, failing on any console error. For rendering changes, please also check
visually: shadows and corners at various radii/tilts, a 3-image row, a motion
preview, and one GIF + one WebM export.

## Code style

Match what's there:

- Two-space indent, no semicolon-free style, `const`/`let`, template literals.
- The file is organised into numbered sections (`1. Background library`,
  `9. Render`…) — put new code in the section it belongs to.
- Comments explain **why**, not what. The existing comments document
  non-obvious constraints (canvas quirks, encoder behaviour, CSP fallout);
  follow that bar.
- State lives in the single `S` object, persists via `localStorage`, and every
  new key needs a default in `DEFAULTS` so old saved states migrate cleanly.
- UI controls wire themselves through `data-key` attributes where possible —
  prefer that over bespoke listeners.

## Pull requests

- One feature or fix per PR, with before/after screenshots for anything
  visual.
- Describe what you tested and in which browsers.
- New features should degrade gracefully: WebGL, `ctx.filter`,
  `MediaRecorder` and the Clipboard API all have fallback paths — yours
  should too, or fail with a friendly toast.

## Reporting bugs

Open an issue with the template — a screenshot of the bad render plus your
browser/OS gets most rendering bugs fixed quickly. Settings live in
`localStorage` under `shotopt.v1`; pasting that JSON into the issue makes
bugs reproducible.
