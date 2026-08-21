# SMB2GO — Beta (Tax & Notary Vertical)

> This file is read automatically by Google Antigravity (and other AGENTS.md-
> compatible tools like Cursor/Claude Code, if used later) as standing project
> context. Keep it up to date as the project evolves.

## What this project is

SMB2GO builds and maintains websites for small service businesses. This repo is
the **beta/demo build**, scoped to a single vertical: **tax preparers and notary
services**. It runs self-hosted on a Ubuntu VM (not cloud infrastructure yet).
The goal is a working, demoable product — not the full multi-tenant platform.
Favor simple, working code over premature abstraction.

## Tech stack (do not deviate without asking)

- Next.js (App Router, TypeScript)
- PostgreSQL via Prisma ORM
- Auth.js (NextAuth) for the admin and client portal logins
- Tailwind CSS for styling
- Deployed on a self-hosted Ubuntu VM behind Caddy, process-managed with PM2
- Google Calendar API for scheduling (Microsoft Graph/Outlook comes later — build
  the abstraction so a second provider can be added without rewriting the
  booking logic, but only implement Google for now)

## What to build (in this order — confirm each phase works before moving on)

### Phase 1 — Public marketing site
A template for a tax/notary service business:
- Home page (hero, services overview, trust signals)
- Services page (list of services — tax prep, notary services — each with a
  short description; content should be editable later via the admin, but hardcode
  it as structured data/CMS content for now, not literal JSX text)
- About page (bio/credentials — this is a trust-heavy vertical, so leave room for
  certifications, years of experience, professional photo)
- Contact/inquiry form — saves submissions to the database and should be
  structured so it's easy to add email notifications later

### Phase 2 — Scheduling module
- "Schedule a consultation" flow on the public site
- Business owner connects their Google Calendar via OAuth (admin-side)
- Public visitor sees real available time slots pulled from that calendar
- Booking creates a real calendar event with the visitor's details
- Handle token refresh properly — don't assume the OAuth token lasts forever

### Phase 3 — Admin dashboard
- Auth-gated (only me/my team should access this)
- View contact form submissions and bookings
- Basic content editing for the services/about page content

### Phase 4 — Client portal (minimal for beta)
- The SMB owner (my client) can log in, see a preview of their site, and leave
  comments/feedback tied to specific sections
- This does not need to be polished yet — functional is enough for the beta

## Working style expectations

- Plan before writing code — outline the approach for a phase, let me review it,
  then implement. Don't jump straight to a large multi-file change without a
  quick plan first.
- Work in small, reviewable steps rather than generating the whole app in one
  pass. Confirm a phase works (builds, runs, deploys) before starting the next.
- After any schema change, generate and apply a Prisma migration — don't hand-edit
  the database directly.

## Data model expectations

Model this so it's obviously extensible to multiple businesses/tenants later
(each business has services, an about section, calendar connection, contact
submissions) even though the beta may only run one business's content. Don't
hardcode assumptions that only one business will ever exist — use a `Business`
or `Site` model as the top-level entity from day one, even if we only create one
row for now. This avoids a painful migration later.

## Conventions

- TypeScript strict mode on
- Environment variables via `.env` (never commit secrets — confirm `.env` is in
  `.gitignore` before ever touching auth/calendar credentials)
- Prisma migrations committed to the repo (`prisma/migrations/`)
- Keep components small and reusable — this template will become the base for
  future verticals, so avoid hardcoding tax/notary-specific logic into shared
  components where a generic prop would do
- Write a short `README.md` section for any setup step a human needs to do
  manually (e.g. "create a Google Cloud OAuth client and put the credentials in
  .env")

## What NOT to do in the beta

- Don't build multi-tenant routing/subdomains yet — single business is fine
- Don't build the Stripe billing/subscription system yet — that comes after the
  product itself is validated
- Don't build the Outlook/Microsoft calendar integration yet — Google only
- Don't over-engineer the admin UI — functional over polished for now
