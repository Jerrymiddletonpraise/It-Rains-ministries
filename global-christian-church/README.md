# Global Christian Church (GCC) digital ministry platform

**One Faith. One Family. Reaching the World.**

A full-stack church website, member portal and administration platform for Global Christian Church, built with React, TypeScript, Tailwind CSS and Supabase. This app is separate from the It Rains Ministries site and lives entirely in this `global-christian-church/` folder.

> **Nothing about the church has been invented.** The Senior Pastor's identity, address, phone number, history, mission and vision statements and statement of faith are all empty until a church administrator enters them in the GCC Control Center. Sample sermons, events and testimonies are shown with a visible **Demo content** label until real records are published. Every outside service is marked **Awaiting configuration** until it has been set up and tested.

## Build phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Brand identity and design system | Done |
| 2 | Public website, all 22 pages | Done |
| 3 | Responsive navigation and homepage | Done |
| 4 | Supabase database, 42 tables, Row Level Security on every table | Done, 47 automated security checks pass |
| 5 | Authentication and role permissions (10 roles) | Done |
| 6 | Member portal (saved sermons, giving history, notifications, content editing) | Next |
| 7 | Live streaming center (Restream, destinations, moderated live chat) | Planned |
| 8 | Giving (Stripe and PayPal Edge Functions, sandbox first) | Planned |
| 9 | Ministries and events management | Planned |
| 10 | Prayer center dashboard | Planned |
| 11 | Media library management | Planned |
| 12 | Communication (email, SMS, push) | Planned |
| 13 | Analytics and reporting | Planned |

## What works today

- **22 public pages**: Home, About, Vision and Mission, What We Believe, Leadership, Watch Live (GCC Worldwide Live), Sermon Library (with sermon detail pages), Podcasts, Ministries (13 ministry pages), Events and Calendar (list and month views), Online Bible and Resources, Daily Devotionals, Prayer Request Center, Testimonies, Online Giving, Become a Member, First-Time Visitors, Volunteer Registration, Contact Us, FAQ, Privacy Policy, Terms and Conditions.
- **Forms that save to the database** once Supabase is connected: prayer requests (private or prayer wall), pastoral care and appointment requests, contact, plan your visit, membership applications, volunteer registration, testimonies, newsletter (with consent), event registration (with automatic waitlist), joining a ministry. Before Supabase is connected, forms say plainly that nothing was saved.
- **Accounts**: registration, sign in, password reset by email, member portal with profile, prayer request status and event registrations.
- **GCC Control Center** (role-gated): Overview, Website settings (Senior Pastor name, photo, biography and contact; church details; hero; welcome; about; mission and vision; social links), Roles and access (Super Administrator only), Audit log. The other sections are listed with the phase that builds them.
- **Online Bible** using bible-api.com (free, no key, public-domain World English Bible and King James Version only, so no licence is required).
- **Installable web app** (manifest and icons), SEO titles and descriptions per page, keyboard navigation, skip link, visible focus, reduced-motion support, code-split pages.

## Run it locally

```bash
cd global-christian-church
npm install
cp .env.example .env   # optional: add your Supabase URL and anon key
npm run dev            # http://localhost:8080
npm run build          # type-check and production build
```

Without a `.env` the site runs in demonstration mode: every page works, demo content is labelled, and forms explain that the database is awaiting configuration.

## Connect Supabase (free plan)

1. Create a project at [supabase.com](https://supabase.com) (the free plan is enough).
2. Apply the migrations in `supabase/migrations/` in order, either with the Supabase CLI (`supabase link` then `supabase db push`) or by pasting each file into **SQL Editor** in order.
3. In **Project Settings > API**, copy the Project URL and the `anon` public key into `.env` (or into your host's environment variables):
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
   The anon key is designed to be public. Row Level Security protects the data.
4. In **Authentication > URL Configuration**, set the Site URL to your website address and add `https://YOUR-SITE/reset-password` and `https://YOUR-SITE/portal` as redirect URLs.
5. Register your own account on the website, then make yourself the first Super Administrator in **SQL Editor**:
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'super_admin' from auth.users where email = 'YOUR-EMAIL';
   ```
   After that, grant every other role from **Control Center > Roles and access**.

### Never put these in the browser

`SUPABASE_SERVICE_ROLE_KEY`, Stripe secret and webhook keys, PayPal client secret, Restream client secret, stream keys, Resend API key and Twilio auth token are stored only as **Supabase Edge Function secrets** (Project Settings > Edge Functions > Secrets). The database even refuses to store something that looks like a raw key in the streaming destinations table: it only records the *name* of the secret.

## Roles

Super Administrator, Church Administrator, Senior Pastor, Pastor, Ministry Leader, Media Team, Finance Team, Prayer Team, Volunteer and Registered Member. Everyone who signs up becomes a Registered Member automatically. Roles live in their own table, so no one can change their own role, and the database will not let anyone remove the last Super Administrator.

Highlights of what the security rules enforce (all tested in `supabase/tests/rls_checks.sql`):

- Private prayer requests: visible only to the requester, the Prayer Team, pastors and administrators. The public prayer wall shows only approved public requests, first name only, never contact details.
- Pastoral care requests: pastors and administrators only, not the wider Prayer Team.
- Donations: read-only from the browser (donor sees their own, Finance sees all); only server-side payment functions can record a gift.
- Live payments cannot be switched on until the integration has passed a test and an administrator has approved it.
- Audit log: role changes, settings, sermons, events, ministries, giving, streaming and moderation are logged automatically with who did it. Confidential tables are logged without copying their contents.

Run the security checks against any throwaway Postgres 15+ database:

```bash
PGHOST=localhost PGUSER=postgres ./supabase/tests/run.sh
```

## Integrations (all awaiting configuration)

| Service | Purpose | Free? | Status |
|---------|---------|-------|--------|
| Supabase | Database, auth, storage, Edge Functions | Free plan | Awaiting your project |
| Stripe | Card giving | No monthly fee, per-transaction processing fee | Awaiting configuration (sandbox first) |
| PayPal | PayPal giving | No monthly fee, per-transaction processing fee | Awaiting configuration (sandbox first) |
| Restream | Multistreaming | Free plan has limits; streaming to all five platforms at once may need a paid plan. Check restream.io/pricing before relying on it | Awaiting configuration |
| YouTube, Facebook, Instagram, TikTok, Twitch | Live destinations via OBS-compatible RTMP | Free; Instagram and TikTok LIVE require account eligibility and manual authorization | Awaiting configuration |
| Resend | Email | Free tier with a monthly and daily sending limit | Awaiting configuration |
| Twilio | SMS | **No free plan** (trial credit only, then paid per message) | Not used until the church decides |
| Web push | Browser notifications | Free (VAPID keys) | Awaiting configuration |
| bible-api.com | Online Bible text | Free, no key | Live in the browser; untested from the build environment |

## Lovable

The app follows Lovable's conventions (Vite, React, TypeScript, Tailwind, `@/` imports, `src/integrations/supabase/client.ts`, `supabase/migrations/`). Lovable works on a whole GitHub repository, so to open this in Lovable, copy this folder to the root of its own repository and connect that repository in Lovable.

## Project structure

```
src/
  auth/            AuthProvider, roles, RequireAuth route guard
  components/      layout (header, footer, logo), ui (buttons, forms, badges), cards, forms
  integrations/    Supabase browser client (public URL and anon key only)
  lib/             data hooks, demo content, navigation, SEO, utilities
  pages/           public pages, auth/, portal/, admin/ (Control Center)
supabase/
  migrations/      schema, Row Level Security, storage buckets, ministry seed
  tests/           security checks for every role
```
