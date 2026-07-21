# SogoApp Web (`sogoapps.com`)

Deep-link landing pages for SogoApp share links, built with Next.js and deployed on Vercel.
This is what makes links like `https://sogoapps.com/training/24` work.

## What it serves

| Route | Purpose |
|---|---|
| `/` | Minimal branded landing (store links + about) |
| `/training/[id]` | Training invite card — shows training details when the public API is available, otherwise a generic invite; "Open in SogoApp" + store fallback |
| `/live/[id]` | Live-stream invite card (generic) |
| `/invite/[code]` | App invitation card (generic) |
| `/.well-known/apple-app-site-association` | iOS Universal Links (`VMD48Q7N3N.com.org.sogo`, paths `/training/*`, `/live/*`, `/invite/*`) |
| `/.well-known/assetlinks.json` | Android App Links (`com.org.sogo`, real signing fingerprints copied from the backend's assetlinks) |

With the two `/.well-known` files live on the apex domain, phones **with SogoApp installed
open these links directly in the app**; the web pages are the fallback for everyone else.

## Deploy to Vercel (one time)

1. Vercel → **Add New… → Project → Import Git Repository** → pick `sogo4app/sogoapp-web`
   (private repo — grant the Vercel GitHub app access to it when prompted).
2. Framework is auto-detected as **Next.js**. No env vars needed. Click **Deploy**.
3. After the first deploy: **Settings → Domains → Add** → `sogoapps.com`.
   - Vercel shows the DNS records to set at Cloudflare: an **A record** for the apex
     (`76.76.21.21`) or Vercel's ALIAS/CNAME instructions — set them **DNS-only (grey cloud)**.
   - Also add `www.sogoapps.com` and let Vercel redirect it to the apex.
4. **Nothing else changes**: `api`, `dev`, `staging`, `app` subdomains and MX records are
   separate DNS entries and are not touched by pointing the apex at Vercel.

## Verify after deploy

```bash
curl https://sogoapps.com/training/24            # invite page (200)
curl https://sogoapps.com/.well-known/apple-app-site-association   # JSON, appID VMD48Q7N3N.com.org.sogo
curl https://sogoapps.com/.well-known/assetlinks.json              # JSON, com.org.sogo fingerprints
```

Android App-Link check: `adb shell pm verify-app-links --re-verify com.org.sogo` after
install; iOS: reinstall the app (AASA is fetched on install) and tap a link from Notes.

## Things to update later

- **App Store link**: `components/AppLanding.js` → `APPSTORE_URL` is a placeholder until the
  iOS app is live; replace with the real URL from App Store Connect.
- **Rich training details**: `/training/[id]` calls
  `https://api.sogoapps.com/api/v1/public/training/[id]` and silently falls back to the
  generic card while that endpoint doesn't exist. When the backend adds it (safe public
  fields: `title`, `hostName`, `sessionCount`, `priceCents`/`priceCoins`, `startsAt`),
  the page upgrades automatically — no redeploy needed.
- **Signing fingerprints**: if the Android app is re-keyed, update
  `app/.well-known/assetlinks.json/route.js` from Play Console → Setup → App signing.
