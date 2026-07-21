# SogoApp Boost Portal

The authenticated web portal where SogoApp users **create and pay for status Boosts**.
The mobile app is read-only for boost creation (anti-steering compliance) — this portal is
the surface that actually creates the campaign; the backend then emits
`PROMOTION_STATUS_UPDATED` so the app reflects it live.

## What it is

- **Static single-page app** — one `index.html`, no build step, no dependencies to install.
  All CSS/JS is inline. The only external resource is the Cloudflare Turnstile script
  (`challenges.cloudflare.com/turnstile/v0/api.js`), loaded from the CDN.
- **Dark theme**, brand blue `#3E72FE` / green `#128C4A`, matching the existing
  `sogoapp-web` / landing site styling.
- Mobile-first, responsive, keyboard-accessible (focus states, ARIA roles/labels,
  semantic form markup).

## Deployment

This folder ships **with the `sogoapp-web` repo via GitHub Pages** and lives at:

```
https://sogoapps.com/portal
```

Just commit the `portal/` directory to the Pages-published branch (e.g. `gh-pages` /
`main`) of the `sogoapp-web` repo. No pipeline, no bundler — GitHub Pages serves
`portal/index.html` directly. Because CORS on the API is `*`, a browser served from
`sogoapps.com` can call `https://api.sogoapps.com` with no proxy.

> The Turnstile site key is provisioned for hostname **`sogoapps.com`**, so the portal
> must be served from that domain (the custom Pages domain), not the raw
> `*.github.io` URL.

## Configuration (top of the `<script>` block)

| Const | Value |
|---|---|
| `API` | `https://api.sogoapps.com` |
| `RECHARGE_URL` | `https://api.sogoapps.com/recharge` (existing web top-up page) |
| `TURNSTILE_SITE_KEY` | `0x4AAAAAAD3-6y3M__hLxeZe` (public — Managed, hostname `sogoapps.com`) |

There are **no secrets in this code.** The Turnstile *site* key is public by design; the
Turnstile *secret* key lives only on the backend. The JWT is stored in `localStorage`
(`sogo_boost_token`) and sent as `Authorization: Bearer …` on every authenticated call.

## Flow / API calls

1. **Login**
   - Renders the Turnstile widget inline (dark theme, explicit render).
   - `POST /api/v1/auth/web/send-otp` — `{ phone_number, turnstileToken }`
     (App Attest / Play Integrity is mobile-only and is **not** used on web; Turnstile is
     the web bot-defense. If `WEB_AUTH_ENABLED` is off the route 404s → the portal shows
     *"Web login isn't available yet."*)
   - `POST /api/v1/users/auth/phone/verify-otp` — `{ phone_number, otp }` →
     `data.access_token` (same JWT the app mints for real numbers).
   - Handles `428` (Turnstile), `429` (rate-limit + `retryAfterSec`), `404`, `400/401`.

2. **Dashboard**
   - `GET /api/v1/wallet` → shows `data.balanceCents` as `$balance` + an **Add funds**
     link to `/recharge` (a top-up link is allowed on **web** — anti-steering only
     restricts the app).
   - `GET /api/v1/promotions/mine` → `data.promotions[]` listed with budget / spent /
     reach (`paidViews`) and a status pill.

3. **Create boost**
   - `GET /api/v1/status/my-status` → `data.statuses[]` (owner's active statuses) rendered
     as a thumbnail picker. If it 404s / is empty, degrades gracefully to a manual
     **Status ID** field.
   - Budget in USD (presets + custom, min shown from `DEFAULT_MIN_CENTS`, server
     `BELOW_MIN` is authoritative), optional targeting (gender / countries / age → the
     backend's `{ genders, countries, ageRanges }` shape; default **Everyone**).
   - `POST /api/v1/promotions/` — `{ statusId, budgetCents, currency:"usd", targeting?,
     idempotencyKey }`. Debits the USD wallet directly.
     - `402 { code:"INSUFFICIENT", balanceCents }` → shows the balance + an **Add funds**
       button linking to `/recharge`.
     - `200` → returns to the dashboard with a success toast (the app auto-updates via
       the socket the backend already emits).

4. **Logout** — clears the stored token and returns to login.

## Local preview

```bash
cd portal
python3 -m http.server 8000
# open http://localhost:8000
```

(Turnstile will show a hostname warning off `sogoapps.com`, and the API needs a real
token — but the UI and flow render locally.)
