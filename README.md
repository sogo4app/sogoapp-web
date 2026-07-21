# SogoApp Web — `sogoapps.com` (GitHub Pages)

Static deep-link landing for SogoApp share links. Makes `https://sogoapps.com/training/24`
(and `/live/:id`, `/invite/:code`) resolve, with an **Open in SogoApp** button + store fallback.

Pure static HTML/CSS/JS (no build step) so it runs on **GitHub Pages** for free.
The Next.js version (for Vercel) lives on the `main` branch; this static version is on
`gh-pages` and is what Pages serves.

## How dynamic links work on a static host

GitHub Pages has no server, so `/training/24` has no real file. The site uses the standard
**`404.html` fallback**: any unmatched path is served `404.html`, whose JavaScript reads the
URL, detects `training` / `live` / `invite` + the id, and renders the right card. Works for
any id without pre-generating pages. For trainings it also tries to fetch public details from
`https://api.sogoapps.com/api/v1/public/training/<id>` and silently falls back to a generic
invite if that endpoint/CORS isn't available.

## Files
- `index.html` — home / landing
- `404.html` — the SPA fallback that renders `/training/:id`, `/live/:id`, `/invite/:code`
- `.well-known/apple-app-site-association` — iOS Universal Links (`VMD48Q7N3N.com.org.sogo`)
- `.well-known/assetlinks.json` — Android App Links (`com.org.sogo`, real signing fingerprints)
- `.nojekyll` — REQUIRED so GitHub Pages serves the dot-prefixed `.well-known/` folder
- `CNAME` — `sogoapps.com`

## Enable GitHub Pages (already done via API, but to confirm/redo)
Repo → **Settings → Pages** → Source = **Deploy from a branch** → Branch = **`gh-pages`** / `/ (root)` → Save.
Then **Settings → Pages → Custom domain** should already show `sogoapps.com` (from the CNAME file);
tick **Enforce HTTPS** once the cert is issued (a few minutes after DNS is correct).

## DNS to set (at Cloudflare, on the `sogoapps.com` zone)

Point the **apex** at GitHub Pages. **Only the apex (`@`) changes — do NOT touch `api`,
`dev`, `staging`, `app`, or `MX` records.**

Add four **A** records for `@` (apex), all **DNS only / grey cloud** (so GitHub can issue the cert):

| Type | Name | Value            | Proxy |
|------|------|------------------|-------|
| A    | @    | 185.199.108.153  | DNS only |
| A    | @    | 185.199.109.153  | DNS only |
| A    | @    | 185.199.110.153  | DNS only |
| A    | @    | 185.199.111.153  | DNS only |

Optional IPv6 (AAAA, `@`, DNS only): `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

For `www` → CNAME `www` to `sogo4app.github.io` (DNS only). GitHub redirects www→apex.

> If an old apex A/ALIAS/CNAME record already exists (pointing somewhere else), **replace** it
> with the four A records above. The `app.sogoapps.com` GitHub Pages site is a separate record
> and is unaffected.

## Verify after DNS propagates (a few minutes)
```
curl -I https://sogoapps.com/training/24                       # 200/404 with HTML body (renders the card)
curl https://sogoapps.com/.well-known/assetlinks.json          # com.org.sogo fingerprints
curl https://sogoapps.com/.well-known/apple-app-site-association
```

## Update later
- **App Store link**: `404.html` + `index.html` use a placeholder `apps.apple.com/app/sogoapp`
  until the iOS app is live — replace with the real URL.
- **Rich training preview**: when the backend adds `GET /api/v1/public/training/:id` (with CORS
  for `sogoapps.com`), training cards upgrade automatically — no redeploy.
- **Signing fingerprints**: if the Android app is re-keyed, update `.well-known/assetlinks.json`
  from Play Console → Setup → App signing.

## Caveat vs Vercel
Because deep links are served via `404.html`, the HTTP status for `/training/:id` is `404`
(body still renders fine in every browser). Rich social/link-unfurl previews may be weaker than
the Vercel/Next.js version. If you later get Vercel working, the `main` branch has the full
server-rendered app that returns proper `200` + per-training OG tags.
