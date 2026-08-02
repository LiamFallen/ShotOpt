# Lovewall

Self-hosted testimonial collection and display — a lightweight, single-service alternative to Senja.

- **Collect** — every wall gets a unique public submit link (`/submit/<slug>`) with name, role/company, website/LinkedIn, star rating, text, optional photo (uploaded or fetched from a URL, resized server-side to 128px WebP) and optional video (YouTube / Vimeo / Loom). Submissions land as *pending*.
- **Curate** — `/admin` (HTTP basic auth from `.env`) lists every wall with pending counts; approve / unapprove / delete per submission; simple analytics (totals, pending, wall views).
- **Display** — `/w/<slug>` is a responsive masonry wall with dark mode, per-wall accent colour, custom title/description, optional "Powered by" badge, and Open Graph tags for pretty LinkedIn/X shares.
- **Embed** — one script tag renders the wall into any page, iframe-free, inheriting the host page's font:

```html
<div data-testimonials-wall="your-slug" data-theme="auto"></div>
<script src="https://your-host/embed.js" async></script>
```

`data-theme` accepts `light`, `dark`, or `auto` (follows the visitor's OS). `data-accent="#ff5533"` optionally overrides the wall's accent colour.

**Multi-tenancy:** create as many walls as you like from the admin; each has its own slug, submit link, branding and embed. (Wall-count limits for a free tier can be added later in one place: `createWall` in `src/app/admin/actions.js`.)

## Stack

Next.js (App Router) · SQLite via better-sqlite3 · sharp for image resizing. One Node process, no external services. All state lives in `DATA_DIR` (SQLite DB + uploaded avatars), so backup = copy one folder.

## Run locally

```bash
cp .env.example .env   # set ADMIN_USER / ADMIN_PASSWORD
npm install
npm run dev            # http://localhost:3000
```

Visit `/admin`, create a wall, then open its submit link.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `ADMIN_USER` / `ADMIN_PASSWORD` | yes | Basic-auth credentials for `/admin`. Admin returns 503 until both are set. |
| `APP_URL` | production | Public origin (e.g. `https://wall.example.com`) — used in OG tags, share links and the embed feed. |
| `DATA_DIR` | no | Where SQLite + uploads live. Defaults to `./data`. Point it at a persistent volume in production. |
| `PRODUCT_NAME` / `PRODUCT_URL` | no | Branding for the "Powered by" badge. |

## Deploy

### VPS (Ubuntu/Debian + Caddy)

```bash
# on the server (Node 20+)
git clone <your-repo> && cd testimonials
cp .env.example .env && nano .env       # credentials + APP_URL
npm ci && npm run build

# systemd unit: /etc/systemd/system/lovewall.service
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

Caddyfile (automatic HTTPS):

```
wall.example.com {
    reverse_proxy localhost:3000
}
```

### Railway / Fly.io / Render

The included `Dockerfile` builds a standalone image. The only special requirement is a **persistent volume** mounted at `/data` with `DATA_DIR=/data`, plus the env vars above.

- **Railway** — new service from repo, add a volume mounted at `/data`, set env vars.
- **Fly.io** — `fly launch`, then `fly volumes create data --size 1` and mount it at `/data` in `fly.toml`.
- **Render** — Web Service from repo (Docker), add a Disk mounted at `/data`.

## Project layout

```
src/lib/           db.js (SQLite + queries) · media.js (avatar resize/fetch) · video.js (URL parsing) · config.js
src/middleware.js  basic auth for /admin and /api/admin
src/app/
  w/[slug]/        public wall (+ /wall/[slug] alias)
  submit/[slug]/   public submission form + thank-you / LinkedIn share
  admin/           dashboard, wall management (server actions in actions.js)
  api/submit/      POST endpoint for submissions (multipart)
  api/walls/       public JSON feed consumed by embed.js (CORS-enabled)
  uploads/[name]/  serves resized avatars from DATA_DIR
public/embed.js    the embeddable widget
```

Adding Stripe/auth later: gate `createWall` and the `hide_badge` toggle in `src/app/admin/actions.js`, and swap the basic-auth middleware for sessions — the rest of the app doesn't care who's asking.
