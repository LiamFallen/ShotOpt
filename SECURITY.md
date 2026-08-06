# Security Policy

## Reporting a vulnerability

Please email **liam@liamfallen.com** rather than opening a public issue.
You should get a response within a few days. Please include steps to
reproduce and, if relevant, the browser and OS you tested on.

## Scope and threat model

ShotOpt is a fully client-side static site with an intentionally strict
posture:

- No backend, no accounts, no analytics, and **no network requests of any
  kind** after page load — the Content-Security-Policy in `_headers` limits
  every fetch/script/style/image to same-origin, so exfiltration paths are
  blocked by the browser itself.
- User images are held in memory / object URLs only; the only persisted data
  is the settings object and an optional watermark logo in `localStorage`.

Things we'd consider vulnerabilities: any way for page content to reach a
third-party origin, XSS via crafted file names or pasted content, or a CSP
regression in `_headers`. Reports about missing rate-limiting, server
hardening, etc. don't apply — there is no server.

## Supported versions

Only the latest deployed version (the `main` branch) is supported.
