# Lovewall

A testimonial-collection SaaS (a self-hostable Senja alternative): customers sign up, create
testimonial walls, collect text + video testimonials through shareable links, and embed the
results anywhere with one script tag.

## What's in the box

- **Marketing site** — landing page at `/` with features, pricing (driven by `src/lib/plans.js`),
  FAQ and signup CTAs.
- **Customer accounts** — email + password signup/login (scrypt-hashed, DB-backed sessions in an
  httpOnly cookie) and **Google sign-in** (appears automatically once OAuth credentials are set).
- **Dashboard** (`/dashboard`) — each user manages their own walls: create, brand (accent colour,
  title/description, badge toggle), moderate submissions (approve / unapprove / delete), copy
  share + embed snippets, simple analytics (submissions, pending, wall views).
- **Free tier with enforced limits** — Free: 1 wall, 10 testimonials per wall, "Powered by" badge
  always on. Pro ($19/mo): unlimited walls + testimonials, badge removal. Limits are enforced
  server-side (wall creation, submission endpoint, badge rendering).
- **Stripe billing** — Checkout for upgrading, customer portal for managing/cancelling, webhook
  that keeps `users.plan` in sync. All wired; activates when you add your Stripe keys.
- **Collection** — public submit page per wall: name, role/company, URL, 1–5 stars, text, photo
  (uploaded or fetched from a URL, resized server-side to 128px WebP), YouTube/Vimeo/Loom video.
  Per-wall collection settings: custom prompt, toggle the photo/video fields, auto-approve.
  Honeypot spam trap. Thank-you screen with pre-filled LinkedIn share.
- **Curation** — All/Pending/Live filter tabs, pin favourites to the top of the wall, import
  testimonials you already have (email/social) straight from the dashboard, export any wall to
  CSV.
- **Display** — hosted wall at `/w/<slug>` with average-rating header, masonry layout and OG
  tags; an iframe-free embed (`/embed.js`) that inherits the host page's font and supports
  `data-layout="wall|carousel"` (auto-advancing carousel with arrows), `data-theme="light|dark|auto"`
  for dark host sites, and `data-max="N"`.
- **Platform admin** (`/admin`) — your operator view (basic auth from `.env`): user list with
  plans, all walls, platform totals.

## Stack

Next.js (App Router) · SQLite via libSQL (`@libsql/client`) · sharp · Stripe. One service.

Two storage modes, selected purely by env vars:

- **Self-hosted (VPS / Docker / dev):** local SQLite file + avatar uploads in `DATA_DIR`.
- **Serverless (Vercel):** database on [Turso](https://turso.tech), avatars on Vercel Blob.

## Run locally

```bash
cp .env.example .env   # set ADMIN_USER / ADMIN_PASSWORD at minimum
npm install
npm run dev            # http://localhost:3000
```

Sign up at `/signup`, create a wall, open its submit link. Your operator view is at `/admin`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `ADMIN_USER` / `ADMIN_PASSWORD` | yes | Basic auth for the platform admin at `/admin`. |
| `APP_URL` | production | Public origin (e.g. `https://uselovewall.com`). Used in OG tags, OAuth redirects, Stripe return URLs, embed snippets. |
| `DATA_DIR` | no | Where SQLite + uploads live (default `./data`). Persistent volume in production. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for Google login | See "Connect Google sign-in". |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` | for payments | See "Connect Stripe". |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Vercel | Hosted SQLite (skip on VPS/Docker). |
| `BLOB_READ_WRITE_TOKEN` | Vercel | Vercel Blob for avatars (skip on VPS/Docker). |
| `PRODUCT_NAME` / `PRODUCT_URL` | no | Rebrand the product + badge without touching code. |

## Connect Google sign-in

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials →
   **Create credentials → OAuth client ID** (type: Web application).
2. Configure the consent screen if prompted (External, app name + your email is enough to start).
3. Add an **Authorized redirect URI**: `{APP_URL}/api/auth/google/callback` — e.g.
   `https://uselovewall.com/api/auth/google/callback` (and
   `http://localhost:3000/api/auth/google/callback` for dev).
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

The "Continue with Google" button shows up on `/login` and `/signup` automatically. Accounts are
linked by verified email, so someone who signed up with a password can later use Google with the
same address.

## Connect Stripe

1. In the [Stripe dashboard](https://dashboard.stripe.com), create a **Product** ("Lovewall Pro")
   with a **recurring Price** (e.g. $19/month). Copy the `price_...` id → `STRIPE_PRICE_ID`.
2. Developers → API keys → copy the secret key → `STRIPE_SECRET_KEY`.
3. Developers → Webhooks → **Add endpoint** `{APP_URL}/api/billing/webhook` with events
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Redeploy. The upgrade button on `/dashboard/billing` and the pricing CTAs go live; plan
   changes (including cancellations) sync automatically via the webhook.

Local testing: `stripe listen --forward-to localhost:3000/api/billing/webhook` (use the CLI's
printed `whsec_...`), plus test-mode keys and card `4242 4242 4242 4242`.

Changing limits or adding tiers: edit `src/lib/plans.js` — pricing page, gating and billing copy
all read from it.

## Deploy

### Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new) (auto-detected Next.js).
2. Create a free DB at [turso.tech](https://turso.tech): `turso db create lovewall`, then
   `turso db show lovewall --url` and `turso db tokens create lovewall`.
3. In the Vercel project: Storage → Create → **Blob** (auto-adds `BLOB_READ_WRITE_TOKEN`).
4. Add env vars: `ADMIN_USER`, `ADMIN_PASSWORD`, `APP_URL`, `TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN` (+ Google/Stripe vars when ready).
5. Deploy. Tables are created automatically on first request.

### VPS (Ubuntu/Debian + Caddy)

```bash
git clone <your-repo> && cd testimonials
cp .env.example .env && nano .env
npm ci && npm run build

# /etc/systemd/system/lovewall.service
[Unit]
Description=Lovewall
After=network.target
[Service]
WorkingDirectory=/opt/testimonials
EnvironmentFile=/opt/testimonials/.env
ExecStart=/usr/bin/npm start
Restart=always
User=www-data
[Install]
WantedBy=multi-user.target

sudo systemctl enable --now lovewall
```

Caddyfile: `uselovewall.com { reverse_proxy localhost:3000 }`

### Railway / Fly.io / Render

Use the included `Dockerfile`; mount a persistent volume at `/data` with `DATA_DIR=/data`, set
the env vars above.

## Go-live checklist

- [ ] Domain + `APP_URL` set
- [ ] `ADMIN_USER` / `ADMIN_PASSWORD` changed from defaults
- [ ] Google OAuth redirect URI added for the production domain
- [ ] Stripe live-mode keys + webhook endpoint on the production domain
- [ ] Test: signup → create wall → submit → approve → embed on a test page
- [ ] Test: upgrade with a real card, then cancel from the customer portal

## Project layout

```
src/lib/            db.js (libSQL + queries) · auth.js (sessions, scrypt, Google helper)
                    plans.js (tiers & gating — edit limits here) · billing.js (Stripe helper)
                    media.js (avatars) · video.js (URL parsing) · config.js
src/middleware.js   basic auth for /admin (platform operator only)
src/app/
  page.js           marketing landing (features, pricing, FAQ)
  (auth)/           login, signup, server actions, shared form
  dashboard/        customer area: walls list/create, manage wall, billing
  admin/            platform admin (operator view)
  w/[slug]/         public wall · submit/[slug]/ public collection form
  api/auth/google/  OAuth flow · api/billing/ checkout, portal, webhook
  api/submit/       submission endpoint (multipart, plan-capped)
  api/walls/        public JSON feed for the embed (CORS)
  uploads/[name]/   serves avatars in local-disk mode
public/embed.js     the embeddable widget
```

## Not built yet (deliberately)

Password reset emails, team seats, in-browser video recording, testimonial import,
Zapier/webhooks, AI features. The auth and billing layers are plain code (no framework lock-in),
so all of these bolt on without rewrites.
