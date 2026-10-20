# Shadi Sutra

**Event Management** — Weddings, Birthdays, Functions.

A Next.js full-stack application with Supabase backend, featuring a public marketing website, an admin console, and expiring token-based event pages.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the folder map, request flows,
and security model.

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
   ```

3. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Configure launch metadata:** set `SITE_URL` to the public HTTPS origin
   (for example, `https://events.example.com`) in the deployment environment.
   It is used for canonical URLs and the sitemap.

5. **Check launch inputs:** run `npm run check:launch`. It checks site
   placeholders, the client logo, public image size/signatures, gallery alt
   text, and `SITE_URL`. A launch check cannot pass until the production URL
   and client-provided `public/brand/logo.*` are present.

The `/privacy` and `/terms` pages are drafts for client review and must be
approved before publication. The privacy page explicitly marks its proposed
retention schedule as inactive until the client approves and implements it.

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
5. `006_phase3_event_sharing.sql` — Admin-managed expiring event links, database-backed request rate limits, and removal of the customer financial summary view.
6. `007_phase4a_admin_data.sql` — Admin-only event/function/timeline/guest RLS and admin-managed client contact fields on events.
7. `008_phase4b_finance_designs.sql` — AAL2-only admin RLS for financial/design records and private storage, with append-only financial audit logging.
8. `009_fix_rate_limit_timestamp.sql` — Fixes the rate-limit timestamp variable so PostgreSQL does not resolve it as `CURRENT_TIME`.

### Applying Migrations to Supabase:
1. In your **Supabase Dashboard**, open **SQL Editor**.
2. Run `001_initial_schema.sql`.
3. Run `002_rls_and_storage.sql`.
4. Run `003_phase2_security.sql`.
5. Run `004_grants.sql`.
6. Run `006_phase3_event_sharing.sql`.
7. Run `007_phase4a_admin_data.sql`.
8. Run `008_phase4b_finance_designs.sql`.
9. Run `009_fix_rate_limit_timestamp.sql` if the original rate-limit migration is already applied.

Apply only migrations that have not already been applied. Do not edit applied
migrations; add later changes as new numbered migrations.
Migration 008 does not depend on the Phase 4A changes in migration 007.

---

## Creating the First Admin

Admin accounts are created directly in Supabase:

1. In **Supabase Dashboard → Authentication → Users**, create the administrator using a unique email and a strong, unique password.
2. In `profiles`, set that user’s `role` to `admin`, choose a unique `username`, and set `access_enabled` to `true`.
3. Sign in at `/login` using the profile username and password. On first sign-in, scan the TOTP enrollment QR with an authenticator app and verify its six-digit code.
4. Store recovery information securely. Do not save or share enrollment QR codes or TOTP secrets. Admin pages require an `aal2` session.

In **Supabase Dashboard → Authentication → Sessions**, configure a time-boxed
admin session and an inactivity timeout appropriate to your operations (for
example, 8 hours maximum and 30 minutes idle). The app checks the authenticated
user and `aal2` on every admin request; the configured session policy controls
when Supabase expires it.

---

## Running the Local Development Seed

```bash
# Copy .env.example to .env.local and set the admin seed password first.
npm run seed
```

The seed script requires `SEED_ADMIN_PASSWORD` from the environment. It refuses
to run against remote projects unless `SUPABASE_SEED_TARGET=development` is
explicitly set, never prints passwords, and does not create customer login
accounts. Do not run it against production or commit `.env.local`.

---

## Backup

Install PostgreSQL client tools so `pg_dump` is available on `PATH`. Put the
direct Supabase Postgres connection URI in `DATABASE_URL` (or
`SUPABASE_DB_URL`) in `.env.local`; never commit it or paste it into logs or
support tickets.

```bash
npm run backup
```

Run a backup weekly at minimum, and before any database migration. The script
writes a custom-format dump under the ignored `backups/` directory and does not
print the connection URI. Protect those files as sensitive data and store a
copy in encrypted off-site storage.

To test a restore, restore into a separate development/staging database, never
over production. Set `DATABASE_URL` to that target and run:

```bash
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" backups/shadisutra_backup_<timestamp>.dump
```

On PowerShell, set `$env:DATABASE_URL` for the target first and replace the
placeholder with the chosen dump filename. Verify the restored tables and
storage references in staging before relying on a backup. Supabase Storage
objects need their own backup/export plan; a Postgres dump does not contain
those file contents.

---

## Public Event Links

Customers do not sign in. From an event's admin page, the administrator can
generate an expiring `/e/[token]` link, regenerate it (which revokes all earlier
links for that event), or revoke it. A QR code can be downloaded as a PNG.
The public page shows only the event name, date, venue, functions, timeline, and
finalized design files through short-lived signed URLs. It never shows budgets,
payments, production items, phone numbers, or guest lists. Invalid, expired, and
revoked links use the same generic response.

Event client names and phone numbers are stored for admin use only. Admin event
actions use the signed-in Supabase session and require aal2; service-role
credentials are not used for event, function, item, timeline, or guest writes.
Guest lists support row-validated CSV/XLSX imports (2 MB / 2,000-row limits),
Excel export with formula-injection protection, and a downloadable template.
Apply `supabase/tests/phase4a_admin_only_rls.sql` in the development SQL Editor
to verify anonymous and non-admin users cannot read or write admin event data.
Apply `supabase/tests/phase4b_money_storage_rls.sql` after migration 008 to
verify financial/design table RLS, audit immutability, private object storage,
and exclusion of draft designs from public share results.

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
  brand/           ← Logo, favicon, admin app icon
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
| `SITE_URL` | Server metadata | Public HTTPS origin for canonical URLs and the sitemap |
| `DATABASE_URL` | Backup script only | Optional direct Postgres connection URI for `pg_dump` |
| `SUPABASE_DB_URL` | Backup script only | Alternative name for the direct Postgres connection URI |
| `SEED_ADMIN_PASSWORD` | Local seed script only | Development admin password; set outside source control |
| `SUPABASE_SEED_TARGET` | Local seed script only | Must be `development` to permit a remote dev seed |

---

## License

Private — all rights reserved.
