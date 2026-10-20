# Shadi Sutra Architecture

## Folder map

- `src/app/` — App Router routes, layouts, metadata, and server actions.
- `src/app/admin/` — Admin pages; the admin layout checks the authenticated user and MFA assurance.
- `src/app/e/[token]/` — Public event page reached through an expiring share token.
- `src/app/contact/` — Public enquiry form and its server action.
- `src/components/layout/` — Public navbar, footer, site shell, and optional contact buttons.
- `src/components/admin/` — Admin screen components and event tabs.
- `src/components/ui/` — Shared UI primitives.
- `src/config/site.ts` — Public business identity and optional contact/social values.
- `src/config/seo.ts` — Canonical URL, page metadata, and conditional LocalBusiness structured data.
- `src/data/gallery.json` — Gallery content, including required image descriptions.
- `src/lib/supabase/` — Browser and server Supabase client constructors.
- `src/lib/auth/` — Admin-session checks and authentication actions.
- `src/lib/admin/` — Admin queries and server actions for event data.
- `src/lib/events/` — Public share lookup and admin share-link actions.
- `src/proxy.ts` — Security headers, CSP nonce, and admin route authentication gate.
- `supabase/migrations/` — Ordered database schema, grants, RLS, and storage policies.
- `supabase/tests/` — SQL checks for the intended RLS and storage behavior.
- `scripts/seed.ts` — Local/development-only admin seed utility.
- `scripts/backup.ts` — Database backup using a connection URL supplied through the environment.

## Request flows

### Admin login

The browser submits username/password to `src/app/login/actions.ts`. The server
looks up the admin account and authenticates with Supabase Auth. The login page
then submits the TOTP challenge to `verifyMfaAction`; the admin route layout
and admin server actions require an authenticated session at assurance level
`aal2`. The browser receives only the session needed for the user-session
Supabase client.

### Create an event

The admin form calls `createEventAction` in
`src/lib/admin/event-actions.ts`. The action validates input and confirms the
current administrator and `aal2`, then writes with the user-session Supabase
client. Postgres RLS applies the `is_admin()` policy. The service-role client
is not used for normal event writes.

### Create and open a share link

The admin calls `generateEventShareLink` in
`src/lib/events/share-actions.ts`. After the admin/`aal2` check, the server
generates an unguessable token and stores only its protected lookup
representation with expiry/revocation metadata. The link is shown to the
admin. A request to `/e/[token]` calls the server-side public-share lookup,
which checks that the token is valid, not expired, and not revoked, then
returns only the public event fields. Finalized private designs are exposed
through short-lived signed URLs; storage paths and credentials stay server-side.

## Security model

- **RLS (Row-Level Security):** Postgres policies decide which rows each
  database role can access. RLS is enabled and forced on protected tables;
  application UI is not an authorization boundary.
- **`is_admin()` and `aal2`:** RLS helper policies identify administrators;
  server actions and protected routes also require a current administrator
  session with TOTP MFA assurance (`aal2`).
- **User-session client:** Used for ordinary admin reads/writes so the
  authenticated user's database claims are evaluated by RLS.
- **Service-role key:** Server-only. It bypasses RLS and is restricted to
  narrowly required operations such as public share lookup or signing private
  storage URLs. Never expose it through a client component or public variable.
- **Share token:** A bearer capability for a limited, public event view. It
  expires and can be revoked; do not include it in logs or disclose it.
- **CSP nonce:** `src/proxy.ts` generates a fresh nonce per request; keep
  security headers restrictive and do not add unsafe script allowances.

## Glossary

- **App Router:** Next.js routing built from folders and `page.tsx`/`layout.tsx`.
- **Server Action:** A server-side function invoked from a form or client UI.
- **TypeScript:** JavaScript with static type checking.
- **Supabase:** Hosted Postgres, Auth, and object storage used by this app.
- **TOTP:** A time-based one-time password from an authenticator app.
- **MFA / `aal2`:** Multi-factor authentication; `aal2` indicates the
  authenticated session has completed a second factor.
- **Signed URL:** A time-limited URL that grants access to a private storage
  object without making the bucket public.
