# Production Deployment

This guide prepares the Shadi Sutra Next.js App Router site for Netlify and
Supabase. It does not perform a deployment. Checked against the current vendor
documentation on 2026-10-20.

## Netlify and Next.js compatibility

The project pins Next.js `16.4.2`. Netlify's current Next.js guide uses its
OpenNext adapter, supports Next.js 13.5 and later, and says it tests compatibility
with stable Next.js releases. The guide explicitly lists the App Router, Server
Actions, Route Handlers, SSR, and streaming as supported. No separate Next.js
plugin or static-export configuration is needed.

Next.js 16 uses the `proxy.ts` convention in place of the deprecated
`middleware.ts` convention. The Netlify adapter runs Next.js middleware through
an Edge Function. The existing `src/proxy.ts` now creates its nonce with Web
Crypto rather than a Node-only crypto import, while continuing to set the
per-request CSP on both the forwarded request and response. `src/app/layout.tsx`
uses `connection()` so the nonce-bearing pages are dynamically rendered, as
required by Next.js. The existing CSP derives the Supabase origin and its
WebSocket scheme from `NEXT_PUBLIC_SUPABASE_URL`; it does not add a blanket
external host.

The feature support is documented, but this repository has not been deployed
to Netlify here. Netlify documents runtime limitations for edge middleware, so
verify the project-specific Proxy, Supabase cookie refresh, nonce-bearing
scripts, Server Actions, and API routes on a Netlify Deploy Preview before
production. If that preview exposes a runtime incompatibility, stop and resolve
it before promoting the deploy; do not weaken the CSP.

`netlify.toml` sets `npm run build` and Node.js 22. Current Next.js system
requirements specify Node.js 20.9 minimum; Node 22 satisfies that requirement.
The Netlify adapter detects Next.js and handles its output, so do not set a
static publish directory or add/pin a legacy Next.js adapter plugin.

Official references:

- [Netlify: Next.js runtime and feature support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Netlify: build configuration](https://docs.netlify.com/build/configure-builds/overview/)
- [Next.js: Proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Next.js: Content Security Policy and nonces](https://nextjs.org/docs/app/guides/content-security-policy)
- [Next.js: installation requirements](https://nextjs.org/docs/app/getting-started/installation)

## Netlify configuration

1. Push the repository to GitHub and import it into Netlify.
2. Keep the repository root as the base directory. Netlify reads `netlify.toml`
   and detects Next.js automatically.
3. Set the environment variables below in the Netlify site configuration.
   Scope Supabase service credentials to Functions as well as Builds only when
   needed; do not expose them to browser code. Do not put secret values in
   `netlify.toml`, GitHub, or this document.
4. Set real production values only in the Production deploy context. Use a
   separate Supabase development project for Deploy Previews and branch deploys.
   Never give untrusted pull-request builds production secrets.
5. After the first preview deploy, complete the preview smoke tests below. Only
   promote a verified deployment to the production context.

`SHADISUTRA_DEPLOY_CONTEXT` is set by `netlify.toml` for production, Deploy
Preview, and branch deploy contexts. HSTS is added only when this value is
`production`. For a local `next start` production build, HSTS follows
`NODE_ENV=production`.
The production `SITE_URL` is set in `netlify.toml` to `https://shadisutra.in`;
update it there if the public domain changes. Set a separate `SITE_URL` in
Netlify for Deploy Previews or branch deploys only if their canonical metadata
should use a preview-specific origin.

### Environment variables

| Name | Required | Classification | Use |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public | Supabase project URL; also supplies the allowed Supabase origin to the CSP. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public | Browser-safe Supabase anon key. RLS must remain enabled; this key is not a substitute for authorization. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Secret** | Server-only Supabase operations, rate limiting, and signed design access. Never expose it to the browser. |
| `SITE_URL` | Yes | Public URL | Canonical production origin, including `https://`; used for metadata and sitemap URLs. Set separately for non-production contexts if needed. |
| `DATABASE_URL` | Optional | **Secret** | Direct PostgreSQL connection URL used by the manual `npm run backup` script. Keep it out of build logs and browser bundles. |
| `SUPABASE_DB_URL` | Optional | **Secret** | Alternate direct PostgreSQL connection URL accepted by the backup script when `DATABASE_URL` is absent. |
| `SEED_ADMIN_PASSWORD` | No in production | **Secret; local/dev only** | Seed utility only. Never configure it on Netlify or use it to seed production. |
| `SUPABASE_SEED_TARGET` | No in production | Non-secret guard; local/dev only | Seed utility guard for development. Never configure it on Netlify. |
| `SHADISUTRA_DEPLOY_CONTEXT` | Set by `netlify.toml` | Non-secret | Controls production-only HSTS; do not override its contextual values. |

Set Supabase variables with Netlify's Functions scope for server-side execution
and Builds scope for values required during the Next.js build. `NEXT_PUBLIC_*`
values are public and are embedded into client bundles where used. `SITE_URL`
must be the real production origin, not a placeholder.

## Fresh production Supabase project

Create a new Supabase production project. Do not point these steps at the
development project. Apply every migration file below once, in this exact
version order (the repository intentionally has no `005` file):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_and_storage.sql`
3. `supabase/migrations/003_phase2_security.sql`
4. `supabase/migrations/004_grants.sql`
5. `supabase/migrations/006_phase3_event_sharing.sql`
6. `supabase/migrations/007_phase4a_admin_data.sql`
7. `supabase/migrations/008_phase4b_finance_designs.sql`
8. `supabase/migrations/009_fix_rate_limit_timestamp.sql`

Prefer the Supabase CLI migration ledger so each migration runs once:

```text
npx supabase login
npx supabase link --project-ref <PRODUCTION_PROJECT_REF>
npx supabase migration list
npx supabase db push
npx supabase migration list
```

Check the linked project ref before pushing. Confirm all eight versions are
recorded as applied afterward. Do not also paste these files into the SQL Editor
after `db push`. If migrations must be run manually, execute the eight files
individually in the listed order using the Supabase SQL Editor and keep a
written record of each successful migration; do not run them concurrently or
skip an earlier file.

**Never run `npm run seed` on production.** The seed script and its demo data
are for local/development projects only. The production first-admin steps below
are deliberately separate; do not configure `SEED_ADMIN_PASSWORD` or
`SUPABASE_SEED_TARGET` in Netlify.

### Create the first production admin

The login form takes a username, and the application converts that username
into the synthetic Auth email `<username>@shadisutra.app`. Create the Auth user
with that exact lower-case email. It is an internal login identifier, not a
mailbox; do not use it as the admin's recovery or notification address.

1. In Supabase Dashboard, open **Authentication → Users → Add user**. Create
   the user with the chosen username as the local part of
   `<username>@shadisutra.app`. Set a unique, strong temporary password using a
   password manager, confirm the user in the dashboard, and keep the password
   out of source control and chat.
2. Copy the new Auth user's UUID. In **SQL Editor**, replace each placeholder
   below with the UUID, same lower-case username, and admin display name. Quote
   values correctly. Run this statement once:

   ```sql
   insert into public.profiles (
     id,
     role,
     username,
     full_name,
     access_enabled,
     must_change_password
   )
   values (
     '<AUTH_USER_UUID>'::uuid,
     'admin',
     '<ADMIN_USERNAME>',
     '<ADMIN_DISPLAY_NAME>',
     true,
     true
   )
   on conflict (id) do update
   set role = 'admin',
       username = excluded.username,
       full_name = excluded.full_name,
       access_enabled = true,
       must_change_password = true;
   ```

3. Confirm the profile row `id` exactly matches the Auth UUID, `role` is
   `admin`, and `access_enabled` is `true`. Do not create customer profiles.
4. Open `https://<PRODUCTION_HOST>/login`, sign in with the username and
   temporary password, enroll a TOTP authenticator when prompted, and verify
   the six-digit code. Confirm `/admin` loads only after MFA reaches `aal2`.
5. Rotate the temporary password if required by your credential process. Store
   recovery codes in a controlled password manager, and verify that a normal
   authenticated session without `aal2` cannot access the admin.

### Production Supabase checklist

- [ ] Confirm the dashboard project name, project ref, region, and billing plan
      are the intended production project.
- [ ] Apply and verify all eight migrations above; confirm no seed/demo records
      were inserted.
- [ ] Review RLS enabled/forced status and policies for every protected table,
      `event-files`, and rate-limit storage/table access. Run the repository's
      SQL checks in `supabase/tests/` against production only with care; tests
      that create/delete fixture data should be run on a disposable staging
      project first.
- [ ] Confirm the private `event-files` bucket is not public and the public
      gallery remains separate. Confirm storage object policies restrict
      private designs to the `aal2` admin and public access to finalized designs
      only through the intended share flow.
- [ ] Create the first admin using the instructions above; enable TOTP MFA and
      verify an `aal2` session.
- [ ] Set Supabase Auth **Site URL** and allowed redirect URLs to the exact
      production origin and required login/admin callback paths. Do not allow
      broad wildcard redirect domains.
- [ ] Configure email/SMTP only if production auth flows need it; the synthetic
      login email is not a deliverable mailbox.
- [ ] Keep the service-role key server-only, rotate it if it was ever exposed,
      and restrict its Netlify scope to the required build/function contexts.
- [ ] Configure database backups and test restoring a backup to a separate
      project. Never use the production database URL in local development.
- [ ] Verify database-backed rate limits work; the health endpoint intentionally
      returns `503` if its rate-limit dependency is unavailable.
- [ ] Confirm production `SITE_URL`, Supabase URL/key pair, and `SITE_URL`
      canonical metadata are all for the same production site/project.

## GitHub health monitoring

The workflow `.github/workflows/health-check.yml` calls the production health
endpoint every Monday and Thursday at 04:23 UTC (twice weekly), and can also be
run manually from the Actions tab. Add a GitHub **repository secret** named
`PRODUCTION_HEALTHCHECK_URL` whose value is the full production URL ending in
`/api/health`, for example the shape
`https://<PRODUCTION_HOST>/api/health` (do not store the URL in the workflow).
The workflow fails unless it receives HTTP 200 and the exact body
`{"ok":true}`. The endpoint allows 60 requests per IP per 60-second window;
rate-limit or database failures return a bodyless 429 or 503.

## Post-deploy smoke tests

Replace `<PRODUCTION_HOST>` with the configured production host. Do not include
placeholder tokens in real tests.

| URL | Expected result |
| --- | --- |
| `https://<PRODUCTION_HOST>/` | Public home page loads; logo and supplied images load without CSP errors. |
| `https://<PRODUCTION_HOST>/about` | About page loads with its unique title and canonical URL. |
| `https://<PRODUCTION_HOST>/services` | Services page loads and detail links work. |
| `https://<PRODUCTION_HOST>/services/weddings` | Wedding detail page loads. Also check `/services/birthdays` and `/services/functions`. |
| `https://<PRODUCTION_HOST>/gallery` | Gallery loads and filters/lightbox work; no console CSP violation. |
| `https://<PRODUCTION_HOST>/contact` | Contact form validates and a permitted test enquiry completes without logging personal data. |
| `https://<PRODUCTION_HOST>/login` | Login loads with `X-Robots-Tag: noindex`; incorrect credentials do not expose technical errors. |
| `https://<PRODUCTION_HOST>/admin` | Signed-out visitor is redirected to `/login`; after admin login and TOTP, the dashboard loads at `aal2`. |
| `https://<PRODUCTION_HOST>/api/health` | HTTP 200, `Content-Type: application/json`, body exactly `{"ok":true}`; repeated calls beyond the configured limit return bodyless HTTP 429. |
| `https://<PRODUCTION_HOST>/robots.txt` | Robots rules disallow `/admin`, `/login`, and `/e/`. |
| `https://<PRODUCTION_HOST>/sitemap.xml` | Sitemap uses the production canonical origin and contains only intended public pages. |
| `https://<PRODUCTION_HOST>/not-a-real-page` | Styled 404 with no stack trace, SQL, token, or internal table details. |
| `https://<PRODUCTION_HOST>/e/<VALID_TEST_SHARE_TOKEN>` | Only the expected public event data and finalized designs display; response is no-store/noindex. Revoke the test link after verification. |

Also inspect response headers in the browser Network panel: production responses
must contain the CSP, `X-Content-Type-Options: nosniff`, frame denial,
`Permissions-Policy`, and HSTS. `/login`, `/admin`, and `/e/*` must additionally
be no-store/noindex with `Referrer-Policy: no-referrer`. Check that a Deploy
Preview does not receive HSTS. Complete one admin design preview/finalization
and verify public share rendering, CSP console output, and signed URL expiry
without exposing storage paths or tokens.
