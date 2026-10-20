# Shadi Sutra: Build Brief

**For the AI coding agent (Antigravity).** Read this whole file before writing code. Build one phase at a time (section 13) and stop after each phase so the developer can review.

---

## 1. Project summary

Shadi Sutra is an event management company (weddings, birthday parties, functions). Build:

1. **Public marketing website.** No login needed. Modern, minimal, photo-led.
2. **Private portal** behind a single **"Client Login"** button in the navbar, with two roles:
   - **Admin:** manages everything (events, items, budget, designs, guests, customers).
   - **Customer:** read-mostly view of their own finalized event.

**Constraints**
- Build and run **locally first**. Deployment is out of scope for now, but the code must be deployment-ready (all secrets in env vars, nothing hard-coded).
- **Free tools only.** No paid services.
- Top concerns: **data security** and a solid **backend**.
- **Mobile-first is a hard requirement.** Admin mostly uses a tablet or phone. Customers mostly use a phone.

References for look and structure: theeventco.in and urbanevents.co.in. Both are public marketing sites: hero, About, Services (Weddings / Birthdays / Corporate-Events), portfolio or gallery, testimonials, Contact, WhatsApp/Call buttons. Match that structure, but do not copy their text, images or keyword-stuffed SEO copy.

**Never invent** testimonials, statistics, awards, client names or contact details. Use clearly marked placeholders (see section 4).

---

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS with design tokens as CSS variables |
| Backend, DB, Auth, Storage | Supabase (Postgres, Auth, Storage, Row Level Security). Use a free hosted Supabase project for development (no Docker needed). Keep all SQL in `/supabase/migrations` so it is reproducible. |
| Validation | `zod` on every form and server action |
| Guest import/export | `exceljs` (.xlsx) and `papaparse` (.csv) |
| Images | `next/image`, WebP |
| Fonts | `next/font` (self-hosted at build, no runtime CDN) |
| Tests | Vitest for utilities, plus the manual RLS checklist in section 11 |

Env vars (`.env.local`, listed in `.gitignore`; provide `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, never imported in client code
```

---

## 3. Design system

**Feel:** modern, minimal, calm, premium. Generous whitespace, large photography, restrained colour, few decorative elements.

**Colour**
- Extract the palette from the logo at `/public/brand/logo.*` (view the file). Define it as CSS variables: `--bg`, `--surface`, `--ink`, `--ink-muted`, `--accent`, `--accent-ink`, `--border`, `--danger`, `--success`.
- Fallback if the logo is missing: ivory `#FAF8F5` background, near-black `#1C1A17` text, one warm accent.
- **Check every text/background pair for contrast ≥ 4.5:1** (3:1 for large text). If the accent is a light gold, use it only for decoration and buttons with dark text, and use a darker shade for text links.

**Type**
- A refined serif for headings (e.g. Cormorant Garamond or Playfair Display), a clean sans for UI and body (e.g. Inter or DM Sans).
- Body ≥ 16px, line-height ~1.6. Fluid heading sizes with `clamp()`.

**Components:** rounded corners (8–12px), soft borders instead of heavy shadows, one primary button style, one secondary, one text link style. Status badges carry text labels, not colour alone.

**Motion:** subtle fade/slide on scroll only, and fully disabled under `prefers-reduced-motion`.

### Accessibility (WCAG 2.2 AA)
- Semantic landmarks (`header`, `nav`, `main`, `footer`), a "Skip to content" link, one `h1` per page, logical heading order.
- Visible focus ring on every interactive element. Everything keyboard-operable, including the mobile menu (focus trap, Esc closes).
- Touch targets ≥ 44×44px with spacing between them.
- Every input has a visible `<label>`. Errors are text, linked with `aria-describedby`, and not colour-only. Use correct `autocomplete` and `inputmode` attributes.
- Password fields have a show/hide toggle.
- Meaningful `alt` text on photos (from the data file in section 5). Decorative images use `alt=""`.
- No hover-only functionality. `lang="en"` on `<html>`.

### Mobile-first rules (critical for admin on tablet and phone)
- Design at 360px first, then scale up. Test at **360, 390, 768, 820 (tablet), 1024, 1280**. No horizontal page scroll at any width.
- Inputs use `font-size ≥ 16px` (prevents iOS zoom). Use native `date` and `time` inputs, `tel`, `email` and `numeric` keyboards where relevant.
- Use `100dvh`, not `100vh`, and respect `env(safe-area-inset-*)`.
- **Portal navigation:** bottom tab bar on phones, collapsible side rail on tablets, full sidebar at ≥ 1024px.
- **Tables become stacked cards below 768px** (guest list, payments, items). Each card shows the key fields and an obvious edit action.
- Sticky primary action on long forms (Save). Quick-add flows for the admin's most frequent tasks: **add payment, add item, mark item status, add guest.**
- Large, thumb-reachable controls. Avoid dense multi-column admin layouts on phones.
- Add a web app `manifest` plus icons generated from the logo so the admin can "Add to Home Screen". **Do not cache private data in a service worker.**

---

## 4. Site config (single source of truth)

Create `src/config/site.ts` with placeholders. The developer fills in the real values later.

```ts
export const site = {
  name: "Shadi Sutra",
  tagline: "TODO: tagline",
  phone: "TODO",
  whatsapp: "TODO",     // digits only, used for wa.me links
  email: "TODO",
  address: "TODO",
  hours: "TODO",
  social: { instagram: "TODO", facebook: "TODO", youtube: "" },
};
```
All pages read from this file. Do not hard-code contact details anywhere else.

---

## 5. Images and logo (the developer adds these later)

The agent must **not** download stock photos or hotlink images. Until real images exist, render clean neutral placeholder blocks that keep the correct aspect ratio, so the layout is final and images drop in without changes.

**Folder layout**
```
public/
  brand/
    logo.svg  (or logo.png)   <- main logo
    logo-mark.svg             <- optional icon-only version
    favicon.ico               <- agent generates from the logo if absent
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

**Image data file:** `src/data/gallery.json`. Pages render from this file and show a placeholder if a file is missing.
```json
[
  { "src": "/images/gallery/weddings/wedding-haldi-01.webp",
    "category": "weddings", "alt": "Marigold haldi stage with yellow drapes",
    "width": 1600, "height": 1067, "featured": true }
]
```

**How the developer adds images (put these steps in the README too)**
1. Convert to **WebP** (quality ~80, e.g. with squoosh.app). Target **under 300 KB** each, long edge ~1600px. Hero images 1920px wide, under 400 KB.
2. Name files lowercase with hyphens: `category-description-01.webp`.
3. Drop them into the matching folder.
4. Add one entry per image in `src/data/gallery.json` with real `alt`, `width`, `height`.
5. Restart the dev server if needed. No code changes.

**Logo:** the agent reads `/public/brand/logo.*` for the navbar, footer, favicon, manifest icons and palette. Navbar logo height ~32–40px on mobile. Provide a light and dark variant only if the logo needs one.

**Privacy:** the public gallery shows real client events. Add a note in the README that the company must have the clients' permission to show their photos.

---

## 6. Public website (no login)

Routes: `/`, `/about`, `/services`, `/services/[weddings|birthdays|functions]`, `/gallery`, `/contact`, `/login`.

- **Navbar:** logo, Home, About, Services, Gallery, Contact, and a **"Client Login"** button at the right (outline style). On mobile it collapses into an accessible menu with the login button inside. **No pop-ups or login prompts for visitors, ever.**
- **Home:** full-width hero image with tagline and a "Plan your event" button, a three-card services overview, featured gallery strip, a short "how we work" section, a testimonials block (placeholder entries marked TODO), and a contact call to action.
- **About:** short story and approach, with placeholder copy.
- **Services:** one page per type (Weddings, Birthdays, Functions) with what is covered (planning, decor, lighting, flowers, music/instruments, coordination).
- **Gallery:** category filter (All / Weddings / Birthdays / Functions), responsive masonry or grid, accessible lightbox.
- **Contact:** form (name, phone, event type, date, message) saved to a `enquiries` table (insert-only for the public, readable by admin only), plus Call and WhatsApp buttons and address. Add a honeypot field and a basic rate limit.
- **Sticky Call/WhatsApp buttons on mobile.**
- Basic SEO: titles, meta descriptions, Open Graph, `sitemap`, `robots`, structured data for LocalBusiness. Short, natural copy. No keyword stuffing.

---

## 7. Authentication and roles

**Flow**
1. The public "Client Login" button opens `/login`. One login page for both roles (username + password, show/hide toggle). **No sign-up link and no self-registration** (disable sign-ups in Supabase).
2. After sign-in, read `profiles.role`: admin goes to `/admin`, customer goes to `/portal`.
3. **Admin creates customer accounts** from the admin panel. Do **not** hard-code credentials in source code.
   - Form: customer name, username, password (or "Generate"), linked event.
   - Runs in a **server-only function** (Next.js route handler or server action) that first verifies the caller is an admin, then uses the service-role key to create the Supabase Auth user. Passwords are hashed by Supabase Auth, never stored or logged in plain text, and shown to the admin only once at creation.
   - Supabase Auth logs in with an email. Map the username to a synthetic email `username@shadisutra.app` and show only the username in the UI.
4. New accounts start with `access_enabled = false` and `must_change_password = true`.
5. When the event is finalized, the admin flips **"Give portal access"**. Only then can the customer log in. The admin can switch it off at any time.
6. On first login the customer is forced to set a new password.
7. The admin can reset a customer's password and disable access.
8. Generic error text on failed login: "Invalid username or password." Add login attempt rate limiting.
9. **Admin accounts:** created manually in Supabase, with **TOTP MFA** enabled and required for `/admin`.

Frontend route protection (middleware) is only a convenience. **Real enforcement is RLS** (section 9).

---

## 8. Portal screens

### Customer portal (`/portal`, phone-first, read-mostly)
- **Overview:** event name, type, date, venue, countdown.
- **Functions / Timeline:** day-by-day schedule (e.g. Haldi, Mehendi, Sangeet, Wedding) with times and tasks.
- **Designs:** gallery of **finalized designs only** (signed URLs), tap to enlarge.
- **Guest list:** editable table/cards (name, number of guests, RSVP, table/notes), with **Import from Excel/CSV** and **Export to Excel** buttons.
- Payment status is **hidden by default**. An admin-controlled flag `show_payments_to_customer` can reveal a read-only summary.

### Admin (`/admin`, tablet/phone-first)
- **Dashboard:** upcoming events, pending items, payments due, new enquiries.
- **Customers:** create, enable/disable access, reset password.
- **Events:** create and edit (type, date, venue, status: planning, finalized, completed, cancelled).
- **Event detail**, with tabs (swipeable on phone):
  - **Functions:** sub-events of the event (e.g. Haldi, Sangeet, Wedding Day).
  - **Items:** per function, grouped by category (**lighting, flowers, decor, instruments/music, other**), each with vendor, status (not started, in progress, done), cost, notes. This is the tracking view.
  - **Budget and payments:** agreed total, per-item costs, payments received (date, amount, mode, note). **Paid, remaining and % paid are calculated, never typed.**
  - **Designs:** upload images or PDFs, version them, mark **finalized** (only finalized ones are visible to the customer).
  - **Timeline:** edit the schedule.
  - **Guests:** same list as the customer sees, plus import/export.
- **Enquiries:** list from the contact form.

---

## 9. Database and security rules

Tables (Postgres, `uuid` primary keys, `created_at` / `updated_at`):

- `profiles` (id = auth user id, role `admin|customer`, username, full_name, access_enabled bool default false, must_change_password bool default true)
- `events` (customer_id → profiles, name, type `wedding|birthday|function`, date, venue, status, show_payments_to_customer bool default false)
- `event_functions` (event_id, name, date, start_time, notes)
- `event_items` (function_id, category `lighting|flowers|decor|instruments|other`, title, vendor, status, cost, notes)
- `budgets` (event_id, agreed_total)
- `payments` (event_id, amount, paid_on, mode, note)
- `designs` (event_id, title, file_path, version, is_finalized)
- `timeline_entries` (event_id, function_id nullable, starts_at, title, notes)
- `guests` (event_id, name, party_size, phone nullable, rsvp `pending|yes|no`, table_no, notes)
- `enquiries` (name, phone, event_type, event_date, message)
- `audit_log` (actor_id, action, table, row_id, at). Admin-readable, written on payment and access changes.

Helper SQL functions: `is_admin()` and `customer_can_access_event(event_id)`, both `SECURITY DEFINER`, using a fixed `search_path`.

**RLS on every table, enabled and forced. Default deny.**
- **Admin** (`is_admin()` and MFA satisfied): full access to everything.
- **Customer**: only when `profiles.access_enabled = true` AND the row belongs to their event (`events.customer_id = auth.uid()`):
  - `events`, `event_functions`, `timeline_entries`: SELECT only.
  - `designs`: SELECT only where `is_finalized = true`.
  - `guests`: SELECT, INSERT, UPDATE, DELETE for their event only.
  - `event_items`: **no access** (admin tracking view only).
  - `budgets` and `payments`: **no access**, except a read-only summary when `show_payments_to_customer = true`.
  - `profiles`: SELECT own row only. Role and access fields are not customer-editable.
- `enquiries`: public INSERT only. Admin reads.
- **Storage:** public bucket `gallery` for the marketing photos only. **Private bucket `event-files`** for designs and documents, with storage policies mirroring the table rules, served by short-lived signed URLs. Restrict upload types (png, jpg, webp, pdf) and size (e.g. 10 MB).

---

## 10. Guest list import/export

- **Import:** `.xlsx` or `.csv`, max 2 MB and 2,000 rows. Parse in the browser, validate each row with `zod` (name required, party_size 1–50), show a preview with errors, then insert. Offer a **downloadable template**.
- **Export:** `.xlsx` download of the current list. Neutralise spreadsheet formula injection by prefixing any cell starting with `=`, `+`, `-` or `@` with a single quote.
- Both the customer and the admin see and edit the same data, so it behaves like a shared sheet without sharing a file.

---

## 11. Security requirements and test checklist

**Code rules**
- The service-role key is used only in server-only modules. Add a lint rule or test that fails if it is imported into client code.
- Validate all input with `zod`, server-side as well. Use parameterised queries only.
- Set security headers in `next.config` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/frame-ancestors, HSTS for production).
- Never log passwords or tokens. `.env*` stays out of git.
- Admin and portal pages are never indexed (`noindex`) and never statically cached with private data.

**Manual RLS test checklist (must all pass before phase 8 is done)**
1. Customer A cannot read Customer B's event, guests, designs or timeline by any query.
2. Customer cannot read `payments`, `budgets` or `event_items` (unless the explicit summary flag is on).
3. Customer cannot read non-finalized designs.
4. Customer with `access_enabled = false` gets no data even with a valid session.
5. Customer cannot change their own `role`, `access_enabled` or `customer_id`.
6. Anonymous users can only insert enquiries and read public gallery images.
7. A customer cannot reach `/admin` routes or the admin server functions.
8. Private storage files cannot be fetched without a valid signed URL.

**Backups:** add `npm run backup` (a documented `pg_dump` command or script) and a README note to run it weekly.

---

## 12. Seed data (local testing only)

A seed script that creates 1 admin, 2 demo customers and 2 demo events with a few functions, items, payments and guests. Passwords come from env or are randomly generated and printed once. **Never commit them.** The seed script must refuse to run against a non-local/dev project unless explicitly forced.

---

## 13. Build phases

Stop and summarise after each phase so the developer can review.

0. **Scaffold:** Next.js + Tailwind + TypeScript, design tokens, fonts, layout shell, `site.ts`, placeholder image component, folder structure from section 5, README with the image-adding steps.
1. **Public site:** all pages in section 6, responsive and accessible, using placeholders.
2. **Database:** migrations, RLS, helper functions, storage buckets, seed script.
3. **Auth:** login page, role redirect, forced password change, admin-only create-customer function, access toggle, MFA for admin.
4. **Admin core:** customers, events, functions, items (tracking view).
5. **Budget and payments:** calculated totals, quick-add payment, audit log.
6. **Customer portal:** overview, timeline, finalized designs, guest list.
7. **Guest list import/export** and the downloadable template.
8. **Hardening:** run the section 11 checklist, security headers, accessibility pass (keyboard, contrast, screen-reader labels), mobile pass at all test widths, Lighthouse (aim ≥ 90 for accessibility and best practices on phone).

---

## 14. Definition of done

- Every screen works at 360px wide with no horizontal scroll, and tablet layouts are usable at 768 and 820.
- All section 11 checks pass.
- No secrets in the repo. `.env.example` is present.
- Images load from the folder and `gallery.json` with no code changes.
- README covers: setup, env vars, running locally, adding images, creating the first admin, running the seed script and the backup.

**Deferred (not now):** deployment and hosting, custom domain, blog, online payments, email/SMS notifications.
