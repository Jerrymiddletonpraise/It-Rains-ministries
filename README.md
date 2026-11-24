# IT RAINS MINISTRIES — Digital Ministry Platform

*Where Heaven's Abundance Rains Upon Lives.*

A complete church and ministry platform: live streaming from phones, laptops and OBS, live chat and prayer during services, online giving with Stripe and PayPal, a sermon and media library, events with registration, prayer requests and testimonies, a member portal, and an admin dashboard with role-based access.

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind CSS 4) · Supabase (Postgres, Auth, Realtime, Storage) · LiveKit (live video) · Stripe + PayPal · Resend (email) · Web Push · deploys to Vercel.

Nothing is simulated. When a service isn't configured yet, the site says so plainly (for example "Online giving is being set up") instead of pretending.

---

## What you need to provide (setup checklist)

| # | Account | Used for | Cost to start | Variables |
|---|---------|----------|---------------|-----------|
| 1 | **Supabase** (supabase.com) | Database, member login, live chat, file uploads | Free tier | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 2 | **Vercel** (vercel.com) | Hosting, HTTPS, custom domain | Free tier (Pro recommended for a ministry org) | — |
| 3 | **LiveKit Cloud** (cloud.livekit.io) | Live streaming from browser & OBS, recording | Free tier, then usage-based | `NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` |
| 4 | **Stripe** (stripe.com) | Card, Apple Pay, Google Pay, monthly giving, receipts | Per-transaction fees (ask about nonprofit rates) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| 5 | **PayPal Business** (developer.paypal.com) | One-time PayPal gifts | Per-transaction fees | `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV` |
| 6 | **Resend** (resend.com) + your domain | Confirmations, receipts, newsletters | Free tier (3,000 emails/month) | `RESEND_API_KEY`, `EMAIL_FROM`, `MINISTRY_INBOX_EMAIL` |
| 7 | **Supabase S3 keys** (same project) | Saving recordings of live services | Included in Supabase storage | `RECORDING_S3_*` |
| 8 | VAPID keys (generated, no account) | "Notify me when we go live" | Free | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| 9 | *Optional:* Cloudflare Turnstile, Google Analytics 4, Google Maps Embed key | Extra spam protection, analytics, maps | Free | see `.env.example` |

Also needed from the ministry: **logo files (if you have an existing one), photos of the pastor, church and services, the church address, phone/WhatsApp, email, social media links, service times, and the pastor's biography.** All of these are edited in **Admin → Website content**; no code changes needed.

Every variable is explained in [`.env.example`](.env.example).

---

## Step-by-step launch

### 1. Database
1. Create a Supabase project.
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql` (or `supabase db push` with the Supabase CLI).
3. **Authentication → URL configuration:** set Site URL to your domain and add `https://YOUR-DOMAIN/auth/callback` to the redirect URLs.
4. **Authentication → Emails → SMTP:** point Supabase at Resend's SMTP so sign-up and password emails come from your domain.

### 2. Run locally
```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
```

### 3. Create the first Super Admin
Register on the site at `/register`, confirm your email, then:
```bash
npm run make-admin -- you@yourministry.org
```
Sign in and open **/admin**. From **Members & roles** you can grant Pastor, Media Team, Finance Team, Department Leader and Moderator access to others.

### 4. Payments
- **Stripe:** add your secret key, then create a webhook to `https://YOUR-DOMAIN/api/webhooks/stripe` with the events listed in `.env.example`. Turn on Apple Pay / Google Pay and the **Customer portal** (lets members cancel monthly gifts) in Stripe settings.
- **PayPal:** create a REST app, copy the client ID & secret. Keep `PAYPAL_ENV=sandbox` until you've tested, then switch to `live` with live credentials.
- Gifts are recorded **only** after Stripe (signed webhook / server verification) or PayPal (server-side capture) confirms them. Card details never touch this server.

### 5. Live streaming
1. Create a LiveKit Cloud project and copy the URL, key and secret.
2. In LiveKit → Settings → Webhooks, add `https://YOUR-DOMAIN/api/webhooks/livekit`.
3. For recordings: Supabase → Storage → S3 Connection → create access keys, fill in `RECORDING_S3_*`.
4. In **Admin → Live broadcasts** create a broadcast and choose:
   - **Phone / laptop camera** — open the studio on any phone, tablet or computer browser, allow camera & mic, press **Go live**. Pause, resume, flip camera, share screen and end are all in the studio.
   - **OBS / RTMP** — press *Generate secure RTMP stream key*, paste the server and key into OBS (Settings → Stream → Custom), start streaming. The site goes live automatically.
   - **YouTube Live** — paste the YouTube live link to embed it with the site's chat and prayer panel.
5. Viewers watch at **/watch** with live viewer count, chat, private prayer requests, greetings, quality selector (Auto / Standard / Data saver), full screen and sharing. Video adapts automatically to slow connections. When a broadcast ends, the recording is saved to the media library as a replay.

### 6. Deploy to Vercel
Import the GitHub repo in Vercel, add all environment variables, deploy, then attach your domain (HTTPS is automatic). Update `NEXT_PUBLIC_SITE_URL`, the Supabase redirect URLs and the Stripe/LiveKit webhook URLs to the final domain.

---

## Features

**Public site (18 pages):** Home · About Us · Vision & Mission · Meet Our Pastor · Watch Live · Sermons & Media · Ministry Departments (13, each with its own page) · Prayer Request · Testimonies · Online Giving · Events & Programs · Bible Study · Member Registration · Member Login · Contact Us (with map & WhatsApp) · FAQ · Privacy Policy · Terms & Conditions.

**Member portal (`/account`):** profile, giving history with printable receipts, manage monthly gifts, event registrations (add to calendar / cancel), prayer requests with pastoral responses, members-only content, announcements, online groups with discussion.

**Admin (`/admin`):** overview dashboard · live studio & chat moderation · sermons/media upload & publishing · events + registrations + CSV export · announcements · prayer request review & email replies · testimony approval (consent enforced) · messages & greetings · giving records, totals by fund, CSV export · newsletter composer & push notifications · homepage/website content editor · departments · groups · members & roles · traffic analytics.

**Roles:** Super Admin (everything), Pastor, Media Team, Finance Team, Department Leader, Moderator. Permissions are enforced twice: in the app (`src/lib/roles.ts`) and in the database with Postgres row-level security (`supabase/migrations/0001_init.sql`), so even a bug in the UI cannot expose private prayer requests or giving records.

**Security & quality:** RLS on every table · private storage buckets with expiring signed links · honeypot + database rate limiting + optional Cloudflare Turnstile on all public forms · chat spam filter, rate limits, hide & block · webhook signature verification · consent-gated Google Analytics + cookie banner · privacy-friendly first-party analytics · SEO metadata, sitemap, robots, Open Graph · installable web app manifest · accessibility (skip link, focus styles, reduced-motion support, labelled controls) · mobile-first responsive design.

## Project layout
```
src/app/            pages, API routes and server actions
  (public pages)    /, /about, /watch, /give, /sermons, /events, /prayer …
  account/          member portal
  admin/            admin dashboard
  api/              payments, live tokens & chat, webhooks, exports, push
  actions/          server actions (forms, admin, live, newsletter)
src/components/     UI, forms, live player/chat/studio, admin widgets
src/lib/            env, Supabase clients, auth/roles, email, payments, LiveKit, push
supabase/           database migration (schema + RLS) and seed content
public/sw.js        service worker for push notifications
```

## Scripts
`npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck` · `npm run make-admin -- <email>`
