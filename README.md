# Shadi Sutra

**Event Management** — Weddings, Birthdays, Functions.

A Next.js full-stack application with Supabase backend, featuring a public marketing website and a private client/admin portal.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 with design tokens as CSS variables |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Validation | Zod |
| Fonts | Cormorant Garamond (headings), DM Sans (body) — self-hosted via `next/font` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A free [Supabase](https://supabase.com) project

### Setup

1. **Clone the repo** and install dependencies:
   ```bash
   npm install
   ```

2. **Create `.env.local`** from the template:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=generate-a-random-secret-for-this-environment
   ```

3. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## Adding Images

> **Privacy note:** The public gallery shows real client events. Ensure you have the clients' permission before adding their photos.

### Steps

1. **Convert images to WebP** (quality ~80, e.g. via [squoosh.app](https://squoosh.app)):
   - Gallery/service images: long edge ~1600px, **under 300 KB** each
   - Hero images: 1920px wide, **under 400 KB**

2. **Name files** lowercase with hyphens: `category-description-01.webp`

3. **Drop them** into the matching folder:
   ```
   public/
     brand/
       logo.svg (or .png)     ← main logo
       logo-mark.svg          ← optional icon-only version
       favicon.ico
     images/
       hero/          hero-01.webp, hero-02.webp ...
       about/         about-01.webp
       gallery/
         weddings/    wedding-haldi-01.webp ...
         birthdays/
         functions/
       services/      weddings.webp, birthdays.webp, functions.webp
       team/          (optional)
   ```

4. **Add one entry per image** in `src/data/gallery.json`:
   ```json
   {
     "src": "/images/gallery/weddings/wedding-haldi-01.webp",
     "category": "weddings",
     "alt": "Marigold haldi stage with yellow drapes",
     "width": 1600,
     "height": 1067,
     "featured": true
   }
   ```

5. **Restart the dev server** if needed. No code changes required.

### Logo

Place your logo at `public/brand/logo.svg` (or `.png`). It is used in the navbar, footer, favicon, and manifest icons. Navbar logo height is ~32–40px on mobile.

After adding the logo, update the design-token palette in `src/app/globals.css` to match the logo colours.

---

## Database Migrations

All SQL migrations reside in `/supabase/migrations`:

1. `001_initial_schema.sql` — Tables, UUIDs, foreign keys, triggers (`handle_updated_at`), audit triggers, and security definer functions (`is_admin()`, `customer_can_access_event()`).
2. `002_rls_and_storage.sql` — Row Level Security enabled and FORCED on all 11 tables (default deny), admin policies, customer event-scoped policies, and storage policies (`gallery`, `event-files`).
3. `003_phase2_security.sql` — Requires MFA for admin RLS access, restricts customer financial reads to a summary, and removes direct customer access to private storage objects (design URLs are short-lived).
4. `004_grants.sql` — Explicit least-privilege table/function grants for `anon`, `authenticated`, and `service_role`.

### Applying Migrations to Supabase:
1. In your **Supabase Dashboard**, open **SQL Editor**.
2. Run `001_initial_schema.sql`.
3. Run `002_rls_and_storage.sql`.
4. Run `003_phase2_security.sql`.
5. Run `004_grants.sql`.

If migrations `001`–`003` have already been applied, apply only the new
`004_grants.sql` migration; do not edit or rerun applied migrations.

---

## Creating the First Admin

Admin accounts are created directly in Supabase:

1. Go to **Supabase Dashboard → Authentication → Users** and create a new user with email `admin@shadisutra.app`.
2. In the `profiles` table, set `role = 'admin'` and `access_enabled = true`.
3. Enable **TOTP MFA** for the admin account in Supabase Auth settings.

---

## Running the Local Development Seed

```bash
# Copy .env.example to .env.local and set all three seed passwords first.
npm run seed
```

The seed script requires `SEED_ADMIN_PASSWORD`, `SEED_CUSTOMER1_PASSWORD`, and
`SEED_CUSTOMER2_PASSWORD` from the environment. It refuses to run against remote
projects unless `SUPABASE_SEED_TARGET=development` is explicitly set, and it
never prints passwords. Do not run it against production or commit `.env.local`.

---

## Backup

```bash
npm run backup
```

Runs `pg_dump` against your Supabase database. Run weekly as a minimum.

---

## QR Code Event Showcase

When an event is marked as **Finalized** by the admin:
- The Admin can click the **📱 QR** button from either the Event List or the Event Details header.
- A high-resolution **QR Code** is generated for guests and family members.
- Admins can copy the link or download the print-ready SVG QR code to put on physical wedding cards or digital invitations.
- Guests scanning the QR code land on `/events/[id]` (e.g. `/events/e1-sharma-wedding`), a mobile-optimized webpage showing:
  - Event title, hosts, dates, and live countdown.
  - Ceremony-by-ceremony timeline (times, attire, locations).
  - Venue directions with 1-tap Google Maps integration.
  - WhatsApp share button and emergency coordinator call button.
  - Interactive RSVP & blessings form for guests.
- **Security & Privacy:** Unfinalized events are blocked from guest viewing. Customers no longer require separate login credentials, leaving only the secure Admin Login portal behind.

```
src/
  app/             ← Next.js App Router pages
  components/
    layout/        ← Navbar, Footer, StickyContactButtons
    sections/      ← Page-specific sections
    ui/            ← Reusable UI components (PlaceholderImage, etc.)
  config/
    site.ts        ← Single source of truth for site info
  data/
    gallery.json   ← Image registry (add entries when adding images)
  lib/
    fonts.ts       ← Self-hosted font configuration
    gallery.ts     ← Gallery data helpers
    types.ts       ← Shared TypeScript types
public/
  brand/           ← Logo, favicon, manifest icons
  images/          ← All site images (see folder structure above)
  manifest.json    ← PWA manifest
supabase/
  migrations/      ← SQL migration files
```

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Service role key (never import in client code) |
| `JWT_SECRET` | **Server only** | Random secret used to sign the existing session cookie |

---

## License

Private — all rights reserved.
