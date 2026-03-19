---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/prd.md'
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/prd-validation-report.md'
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/product-brief-ticktu-2026-01-25.md'
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/ux-design-specification.md'
workflowType: 'architecture'
project_name: 'ticktu'
user_name: 'Nacholc'
date: '2026-03-19'
lastStep: 8
status: 'complete'
completedAt: '2026-03-19'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
39 FRs across 8 domains: Tenant Management (4), Event Lifecycle (6), Ticketing & Pricing (5), Purchase & Payment (8 — FR-PU-08 removed, gap preserved), Attribution & RRPP (3), Analytics & Reporting (4), Validation & Offline (6), Admin & Support (3). The system covers the complete event lifecycle from producer onboarding to post-event settlement.

**Non-Functional Requirements:**
20 NFRs across Performance (4), Availability (3), Scalability (3), Security (4), Data Integrity (4), Email Deliverability (2). The most architecturally demanding are: multi-tenant isolation at every layer, online-first validation with connection status indicator _(descoped from offline validation 2026-03-19)_, 99.9% uptime during sales windows, and 500 concurrent buyers capacity.

**UX Architectural Implications:**
4 distinct UI surfaces (buyer purchase flow, producer dashboard, validation PWA, admin panel). Design system: shadcn/ui + Tailwind CSS with two-layer theming (Ticktu base + producer brand via CSS variables). 30-second polling for real-time dashboard updates (MVP). PWA with camera access for QR scanning. Online-first validation with connection status indicator ("Sin conexión" banner). _(Descoped from offline capability via Service Workers + IndexedDB, 2026-03-19)_

**Scale & Complexity:**

- Primary domain: Full-stack web (Next.js frontend + API routes + database + PWA)
- Complexity level: Medium-High
- Estimated architectural components: 4 UI surfaces, 1 payment integration, 1 email pipeline, 1 QR system, multi-tenant infrastructure

### Technical Constraints & Dependencies

- **MercadoPago** as sole payment processor (Uruguay market coverage) — PCI compliance delegated
- **Email service** TBD — must support SPF/DKIM/DMARC for ticket delivery reliability
- **QR generation library** TBD — must produce cryptographically unique, non-guessable codes
- **Managed service model** — no self-service producer onboarding for MVP
- **shadcn/ui + Tailwind CSS** confirmed as design system (from UX spec)
- **30-second polling** for real-time dashboard (MVP decision, avoids WebSocket complexity)
- **PWA** for validation app (online-first with connection status indicator — ~~offline capability via Service Workers + IndexedDB~~ descoped 2026-03-19)

### Cross-Cutting Concerns Identified

1. **Multi-tenancy** — Subdomain routing, data isolation (tenant_id on all queries), CSS variable theming per producer, separate auth boundaries. Shared database with tenant_id approach (not schema-per-tenant) — appropriate for scale of 1-10 producers. Postgres RLS as defense-in-depth beyond app-level tenant checks.

2. **Authentication & Authorization** — Three distinct auth contexts: Ticktu super admin, producer admin, validation app access codes. Boletería requires role-based permissions within producer tenant.

3. **Payment & Fee Management** — MercadoPago integration, buyer-pays fee model, refund capability, settlement calculation. Order creation logic must be abstracted from payment method — same `createOrder` function serves both MercadoPago checkout AND manual Boletería POS entry (cash/transfer).

4. **Email Delivery Pipeline** — Not just a vendor decision but an architectural component: async job queue triggered on payment success → QR code generation → email template rendering → transactional email delivery. Must deliver within 60 seconds of payment (FR-PU-06). Critical path for buyer experience.

5. **Online-First Validation & Connection Status** _(Descoped from offline validation 2026-03-19)_ — Connectivity required for all scanning. No offline scanning, no IndexedDB manifest cache, no background sync. Architecture:
   - **Primary mode:** All scans validated online via POST to `/api/validation/scan`
   - **Connection monitoring:** `navigator.onLine` + health-check pings detect connectivity state
   - **Offline UX:** "Sin conexión" banner displayed when offline — scanner disabled, operator informed they cannot scan
   - **Reconnect:** Banner disappears automatically, operator resumes scanning — no sync needed
   - **No offline scanning:** If connection is lost, scanning is paused until it returns. This is the accepted trade-off for MVP simplicity
   - **Full offline capability** (IndexedDB cache, offline scanning, first-scan-wins sync, conflict resolution) is a potential future enhancement

6. **Real-Time Data** — Dashboard polling every 30s, in-place updates without flicker, live sales and check-in monitoring

7. **QR Lifecycle** — Generation (cryptographic uniqueness), delivery (email), validation (scan + duplicate detection), reissuance (support cases)

### Architectural Notes from Party Mode Review

**Winston (Architect) + Amelia (Dev) + Quinn (QA) key decisions:**

- Shared database with `tenant_id` over schema-per-tenant — appropriate for current scale, simpler migrations
- Postgres RLS recommended as defense-in-depth for tenant isolation
- Next.js API Routes + Server Actions as unified backend — one codebase, one deployment
- Order creation as abstracted service function parameterized by payment method (MercadoPago / cash / transfer)
- Online-first validation: connection status indicator ("Sin conexión" banner), no offline scanning _(descoped from offline fallback 2026-03-19)_
- Email pipeline as async architectural component (job queue), not just vendor selection
- Multi-tenant isolation is #1 test priority — integration tests for cross-tenant access denial from day one
- ~~Offline sync logic must be in pure testable functions~~ _(descoped 2026-03-19 — no offline sync needed for online-first)_

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application based on project requirements: multi-tenant SaaS with 4 UI surfaces, payment integration, PWA for validation (online-first), and real-time dashboard.

### Technical Preferences (Confirmed)

- **Auth & Database:** Supabase (PostgreSQL + Auth + RLS + Storage)
- **Payment:** MercadoPago (Uruguay market, buyer trust, local payment methods)
- **Domain/CDN:** Cloudflare (domain already owned there)
- **Design System:** shadcn/ui + Tailwind CSS (from UX spec)
- **Forms:** react-hook-form + zod (from UX spec)

### Starter Options Considered

| Option | Verdict | Reason |
|--------|---------|--------|
| **create-next-app** | **Selected** | Clean, no conflicting opinions. Layer Supabase + shadcn manually |
| **T3 Stack (create-t3-app)** | Rejected | tRPC adds unnecessary complexity with Server Actions available. Bundles NextAuth which conflicts with Supabase Auth |
| **ixartz/SaaS-Boilerplate** | Rejected | Uses Clerk + Drizzle, would need to rip out auth to replace with Supabase. More work than starting clean |
| **Vercel saas-starter** | Rejected | Minimal, no multi-tenancy, uses Stripe not MercadoPago |

### Selected Starter: create-next-app + Manual Layering

**Rationale:** Supabase provides database + auth + storage as an integrated platform. Using a boilerplate that bundles competing auth or ORM solutions creates friction. Starting clean with `create-next-app` and layering Supabase + shadcn gives us full control with zero conflicts.

**Initialization Command:**

```bash
npx create-next-app@latest ticktu --yes
cd ticktu
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr
npm install drizzle-orm postgres
npm install -D drizzle-kit
npm install @serwist/next
npm install inngest
```

### Architectural Decisions Provided by Stack

**Language & Runtime:**
- TypeScript (strict mode) across entire codebase
- Next.js 16 with App Router + Turbopack (default bundler)
- React 19.2 (View Transitions, `useEffectEvent()`, `<Activity/>`)

**UI & Styling:**
- Tailwind CSS for utility-first styling
- shadcn/ui CLI v4 — components copied into codebase, full ownership
- CSS variables for white-label theming (two-layer: Ticktu base + producer brand)

**Database & ORM:**
- Supabase PostgreSQL (managed) — includes connection pooling, backups, RLS
- Drizzle ORM for type-safe queries and migration control
- Drizzle Kit for version-controlled schema migrations
- Supabase RLS policies for database-level tenant isolation

**Authentication:**
- Supabase Auth — email/password for producers, access codes for validation app
- JWT with custom `tenant_id` claim for RLS integration
- Three auth contexts: Ticktu super admin, producer admin, validation access codes

**Storage:**
- Supabase Storage — event images, producer logos, brand assets
- CDN-served via Supabase's built-in CDN

**PWA & Online-First Validation:** _(Descoped from offline capability 2026-03-19)_
- Serwist (@serwist/next) — Turbopack-compatible service workers (used for PWA shell, not offline validation)
- ~~IndexedDB for offline ticket manifest cache in validation app~~ — descoped; no offline scanning

**Forms & Validation:**
- react-hook-form + zod — typed validation schemas, consistent across all surfaces

**Testing:**
- Vitest (unit + integration tests)
- Playwright (E2E tests)
- Supabase local dev (`supabase start`) for real database testing

**Infrastructure & Deployment:**
- **Vercel** — Next.js app hosting (proxy for subdomain routing, preview deploys)
- **Supabase** — PostgreSQL + Auth + Storage + RLS
- **Cloudflare** — DNS + proxy + DDoS protection + WAF + wildcard SSL for `*.ticktu.com`

**Security Architecture (Network Layer):**

| Layer | Provider | Protection |
|-------|----------|------------|
| DNS + CDN + WAF | Cloudflare (free tier) | DDoS absorption, basic WAF rules (SQL injection, XSS), bot protection, wildcard SSL |
| Application hosting | Vercel | Proxy (Node.js runtime), SSL termination, rate limiting via proxy |
| Database | Supabase | RLS policies, connection pooling, encrypted at rest |
| Payments | MercadoPago | PCI compliance fully delegated — Ticktu never touches card data |

**Traffic flow:** Buyer/Producer → Cloudflare (filtered, cached) → Vercel (app logic) → Supabase (data)

**Payment Architecture:**
- MercadoPago for MVP — dominant in Uruguay, buyer trust, supports cards + wallet + cash (Abitab/RedPagos)
- Payment layer abstracted: `createPayment({ orderId, amount, method })` — payment method is a parameter, not a branching architecture
- Future Stripe addition = new adapter, not a rewrite
- MercadoPago Checkout Pro or Checkout Bricks for embedded payment UI

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Tenant isolation pattern (RLS + app-level)
- API pattern (Server Actions + Route Handlers)
- Email pipeline architecture (Resend + Inngest)
- Producer landing rendering strategy (Cache Components + "use cache")
- Error handling standard (typed AppError)
- Folder structure and route organization

**Important Decisions (Shape Architecture):**
- Caching strategy per data type
- Background job pattern
- State management approach
- Proxy architecture (`proxy.ts`)
- CI/CD pipeline

**Deferred Decisions (Post-MVP):**
- Redis/external cache (only if performance demands)
- WebSocket real-time (upgrade from 30s polling)
- Stripe as additional payment provider
- TanStack Query/SWR for client-side data management

### Data Architecture

**Tenant Isolation: Belt and Suspenders (Option C)**

Both Postgres RLS and app-level middleware enforce tenant isolation. RLS policies use `auth.jwt()->>'tenant_id' = tenant_id` at the database engine level. App-level middleware resolves subdomain → tenant and injects tenant context into every request. If app code has a bug, RLS catches it. If RLS policy is misconfigured, app code catches it. Non-negotiable for a platform handling payments.

**Caching Strategy (No Redis for MVP):**

| Data | Cache | TTL | Invalidation |
|------|-------|-----|-------------|
| Producer branding (logo, colors) | Cloudflare edge + `"use cache"` | 1 hour | On-demand via `revalidateTag('tenant-{slug}', 'max')` when Ticktu team updates branding |
| Event page (details, images) | Cache Components (`"use cache"`) | Cached until invalidated | On-demand via `updateTag('event-{id}')` on publish/update (read-your-writes in Server Actions) |
| Ticket availability | **No cache** | N/A | Always fresh — client component fetches on mount |
| Dashboard data | No cache | N/A | 30s polling from client |
| Producer landing page | Cache Components (`"use cache"`) | Cached until invalidated | On-demand via `revalidateTag('tenant-{slug}', 'max')` on event publish/branding change |

**Next.js 16 Caching Model:**
- Caching is **opt-in** via `"use cache"` directive — all code is dynamic by default
- Requires `cacheComponents: true` in `next.config.ts`
- `revalidateTag(tag, profile)` — SWR behavior, requires `cacheLife` profile as 2nd argument (use `'max'` for most cases)
- `updateTag(tag)` — Server Actions only, read-your-writes semantics (user sees changes immediately)
- `refresh()` — Server Actions only, refreshes uncached data elsewhere on the page

**Email Service: Resend**
- Modern DX, built for Next.js ecosystem
- react-email for TypeScript email templates (branded per producer)
- SPF/DKIM/DMARC support for deliverability
- Free tier: 3,000 emails/month (sufficient for MVP)
- Ticket delivery within 60 seconds of payment (FR-PU-06)

### Authentication & Security

**Already decided in Step 3:**
- Supabase Auth for all user authentication
- JWT with custom `tenant_id` claim for RLS integration
- Three auth contexts: super admin, producer admin, validation access codes

**Authorization Model:**

| Context | Auth Method | Scope |
|---------|------------|-------|
| Ticktu Super Admin | Supabase Auth (email/password) + `role: 'super_admin'` in JWT | Platform-wide access |
| Producer Admin | Supabase Auth (email/password) + `tenant_id` in JWT | Single tenant access |
| Boletería Staff | Supabase Auth + `role: 'staff'` + `tenant_id` | POS operations within tenant |
| Validation App | Event access code (no Supabase auth) | Single event, read + scan only |
| Buyer | No auth required (guest checkout) | Public event pages + purchase flow |

**Security Proxy (Single File — `proxy.ts`):**

In Next.js 16, `middleware.ts` is deprecated and replaced by `proxy.ts`. The proxy runs on **Node.js runtime** (not Edge), providing full Node.js API access for request interception.

```
proxy.ts runs on every request (Node.js runtime):
1. Resolve subdomain → determine surface (buyer/dashboard/admin/validation)
2. Buyer surface → resolve tenant from subdomain → inject tenant context (no auth)
3. Dashboard → check Supabase auth → verify user belongs to tenant via JWT tenant_id
4. Admin → check Supabase auth → verify super_admin role
5. Validation → pass through (auth via event code at app level)
```

**Local Development — Subdomain Routing:**
Subdomains like `producer.localhost` don't resolve by default. Options:
- Add entries to `/etc/hosts`: `127.0.0.1 producer.localhost admin.localhost`
- Use `nip.io`: `producer.127.0.0.1.nip.io` (zero config, resolves automatically)
- Document chosen approach in `.env.example` for developer onboarding

### API & Communication Patterns

**Hybrid API Pattern:**

| Pattern | Use Case | Examples |
|---------|----------|---------|
| **Server Actions** | All mutations from our own UI | Create event, publish event, process POS sale, update settings, generate RRPP link |
| **Route Handlers** (`app/api/`) | External webhooks, validation API, public endpoints | MercadoPago IPN webhook, validation scan endpoint, ticket availability endpoint |

Validation app scan endpoint is a Route Handler (not Server Action) because the PWA client sends HTTP requests directly — requires a standard HTTP endpoint.

**Error Handling Standard:**

```typescript
type AppError = {
  code: string        // "TICKET_SOLD_OUT" | "PAYMENT_FAILED" | "TENANT_NOT_FOUND"
  message: string     // Human-readable, translatable
  field?: string      // For form validation errors
  statusCode: number  // 400, 401, 403, 404, 500
}
```

- Server Actions return `{ success: true, data } | { success: false, error: AppError }`
- Route Handlers return HTTP status codes + AppError body
- Frontend `handleError()` maps error codes to UX spec's 4-level feedback model (toast, inline, dialog, environmental)

**Background Jobs (Email Pipeline — Inngest):**

Inngest from day one — reliable delivery with retries, observability, and zero risk of lost emails:
1. MercadoPago webhook hits Route Handler
2. Handler validates payment → creates order in DB
3. `await inngest.send({ name: "order/completed", data: { orderId } })` — event dispatched
4. Inngest function picks up event → generates QR codes → renders react-email template → sends via Resend
5. If any step fails, Inngest retries automatically (3 retries by default)

**Why not `waitUntil()`:** If Vercel cancels the function before email sends, the buyer pays and receives nothing. Inngest guarantees delivery with retries and provides a dashboard to monitor failures during live events.

**Inngest Setup:**
- `lib/inngest/client.ts` — Inngest client initialization
- `lib/inngest/functions/` — Job definitions (one file per job)
- `app/api/inngest/route.ts` — Inngest serve endpoint (registers all functions)
- Free tier: 5,000 runs/month (sufficient for MVP)
- Test mode runs functions synchronously — zero CI friction

### Frontend Architecture

**State Management: No Library**

| State Type | Solution | Why |
|-----------|----------|-----|
| Server state (events, orders, dashboard) | Next.js Server Components (direct fetch) | Data is server-side, no client cache needed |
| Real-time dashboard data | Client component with `setInterval` + `fetch` (30s) | Simple, meets MVP requirement |
| Form state | react-hook-form + zod | Already confirmed in UX spec |
| UI state (toggles, modals) | React `useState` | Standard React, no overhead |

No Redux, Zustand, or TanStack Query for MVP. Add only if complexity demands it.

**Producer Landing Page Architecture: Cache Components with On-Demand Invalidation**

Rendering strategy for buyer-facing pages (`{producer}.ticktu.com`):

- **Cache Components (`"use cache"`)** — pages explicitly cached at Vercel/Cloudflare edge
- **On-demand invalidation:** `updateTag('tenant-{slug}')` in Server Actions for read-your-writes (producer sees changes immediately); `revalidateTag('tenant-{slug}', 'max')` for SWR behavior on external triggers
- **Zero delay for producers:** Publish event → `updateTag()` expires cache instantly → producer sees fresh page
- **Ticket availability:** Rendered as client component that fetches fresh data on mount (not cached with the page)
- **Deep links from social media:** Cached pages load from edge in <500ms — critical for Instagram/TikTok conversion

**Page structure (hybrid cached + dynamic):**
- Cached via `"use cache"`: producer branding, event details, images, SEO meta tags, OG tags
- Client-fetched on mount: ticket availability, prices, "sold out" badges

**Landing Template Configuration (Level 2 Customization):**

Single template with toggleable blocks per producer. Configuration stored in `producers` table:

| Block | Toggleable | Content Source |
|-------|-----------|---------------|
| Header | Always on | `producers.logoUrl` |
| Hero | Configurable | `producers.heroImageUrl`, `producers.heroTagline` |
| Social links | Toggle | `producers.socialLinks` (jsonb) |
| About section | Toggle | `producers.aboutText` |
| Event list | Always on | Query `events` where `tenant_id` and `status = 'published'` |
| Footer | Always on | "Powered by Ticktu" |

**SEO:** Server-rendered meta tags and Open Graph tags per producer — social media preview cards show producer's brand, not Ticktu's.

**Folder Structure:**

```
src/
  app/
    (buyer)/              # Buyer-facing routes (producer branded, Cache Components)
    (dashboard)/          # Producer dashboard routes
    (admin)/              # Ticktu admin routes
    (validation)/         # Validation app routes (PWA)
    api/
      webhooks/           # MercadoPago IPN, etc.
      validation/         # Scan endpoint for PWA
      inngest/            # Inngest serve endpoint
  components/
    ui/                   # shadcn components
    buyer/                # Buyer-specific components
    dashboard/            # Dashboard-specific components
    validation/           # Validation app components
    shared/               # Cross-surface components (EmptyState, etc.)
  lib/
    supabase/             # Supabase client config + helpers
    db/                   # Drizzle schema + queries + migrations
    payments/             # MercadoPago abstraction layer
    email/                # Resend + react-email templates
    inngest/              # Inngest client + job functions
    qr/                   # QR generation + validation logic
    validation/           # Connection status detection logic (online-first — offline sync descoped 2026-03-19)
    errors/               # AppError types + handleError()
  types/                  # Shared TypeScript types
```

Route groups `(buyer)`, `(dashboard)`, `(admin)`, `(validation)` provide separate layouts per surface without URL nesting. Buyer routes load producer theme via CSS variables; dashboard routes load Ticktu base theme.

### Infrastructure & Deployment

**CI/CD Pipeline:**
- GitHub Actions: lint + type-check + Vitest on every PR
- Vercel auto-deploys on push to main
- Preview deploys on PRs (Vercel built-in)
- Drizzle Kit migrations in deploy pipeline (`drizzle-kit push`)

**Environment Configuration:**
- `.env.local` for local dev (Supabase URL, anon key, Resend API key, MercadoPago credentials)
- Vercel environment variables for production/preview
- Supabase project manages DB connection strings

**Monitoring (MVP — Minimal but Covered):**

| Tool | Purpose | Cost |
|------|---------|------|
| Vercel Analytics | Page performance, function invocations | Free tier |
| Supabase Dashboard | DB metrics, auth logs, storage usage | Included |
| Resend Dashboard | Email delivery rates, bounces | Included |
| Inngest Dashboard | Background job status, retries, failures | Free tier (5K runs/month) |
| Sentry | Error tracking + alerting | Free tier (5K events/month) |

Inngest dashboard is critical for monitoring email delivery during live events — see which jobs failed, why, and whether retries succeeded. Sentry catches everything else.

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (create-next-app + shadcn + Supabase + Drizzle)
2. Multi-tenancy foundation (proxy.ts + RLS policies + subdomain routing)
3. Auth system (Supabase Auth + JWT claims + role-based access)
4. Database schema (Drizzle schema + migrations for all entities)
5. Producer landing (Cache Components template + branding system)
6. Event management (CRUD + lifecycle + publish with revalidation)
7. Purchase flow (buyer checkout + MercadoPago integration)
8. Email pipeline (Resend + react-email + QR generation)
9. Dashboard (KPIs + charts + polling refresh)
10. Validation app (PWA + QR scanning + online-first with connection status)
11. Admin panel (producer management + support tools)

**Cross-Component Dependencies:**
- Multi-tenancy must be in place before any feature (everything depends on tenant context)
- Auth before dashboard, admin, or any authenticated route
- Drizzle schema before any data operations
- MercadoPago integration before email pipeline (payment triggers emails)
- Inngest setup before email pipeline (job queue must be in place)
- Email pipeline before purchase flow is complete (buyer must receive tickets)
- Cache Components + branding before buyer-facing pages go live

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming (snake_case everywhere):**
- Tables: plural, snake_case → `events`, `ticket_types`, `rrpp_links`, `scans`
- Columns: snake_case → `tenant_id`, `created_at`, `ticket_type_id`, `max_capacity`
- Foreign keys: `{referenced_table_singular}_id` → `event_id`, `tenant_id`
- Indexes: `idx_{table}_{columns}` → `idx_events_tenant_id`

**TypeScript Naming (camelCase / PascalCase):**
- Variables and functions: camelCase → `tenantId`, `getEventById()`
- React components: PascalCase → `EventCard`, `TicketSelector`
- Types and interfaces: PascalCase → `EventCardProps`, `AppError`
- Constants: UPPER_SNAKE_CASE only for true constants → `MAX_TICKETS_PER_ORDER`

**File Naming (kebab-case):**
- Components: `event-card.tsx`, `ticket-selector.tsx`
- Lib/utils: `mercadopago-client.ts`, `qr-generator.ts`
- Tests: `event-card.test.tsx` (co-located with source)
- Route handlers: `app/api/webhooks/mercadopago/route.ts`

**Drizzle Schema Bridge (snake_case DB ↔ camelCase TS):**
```typescript
export const ticketTypes = pgTable('ticket_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),       // camelCase in TS, snake_case in DB
  eventId: uuid('event_id').notNull(),
  price: integer('price').notNull(),            // cents, never float
  maxCapacity: integer('max_capacity'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### Structure Patterns

**No Barrel Files:** Never create `index.ts` files that re-export. Import directly from source files. This is a CRITICAL Vercel best practice — barrel files add 200-800ms import cost.

```typescript
// WRONG
import { EventCard, TicketSelector } from '@/components/buyer'

// RIGHT
import { EventCard } from '@/components/buyer/event-card'
import { TicketSelector } from '@/components/buyer/ticket-selector'
```

**Named Exports Only:** No `export default`. All exports are named.

**One Component Per File:** Unless components are truly coupled (e.g., `Table` + `TableRow`).

**Tests Co-Located:** Unit/integration tests next to source files. E2E tests in `e2e/` at project root.

```
components/buyer/event-card.tsx
components/buyer/event-card.test.tsx
lib/payments/mercadopago-client.ts
lib/payments/mercadopago-client.test.ts
e2e/buyer/purchase-flow.spec.ts
```

**Server Actions Grouped by Domain:**
```
lib/actions/
  events.ts          // publishEvent, createEvent, updateEvent
  orders.ts          // createOrder, processRefund
  tenants.ts         // updateBranding, configureProducer
  validation.ts      // scanTicket (online-first — syncOfflineScans descoped 2026-03-19)
```

**Drizzle Queries — Repository Pattern:**
```
lib/db/
  schema/            // Drizzle table definitions (one file per entity)
  queries/           // Query functions (one file per entity)
  migrations/        // Drizzle Kit generated
  index.ts           // DB client init only (NOT a barrel)
```

Query functions are plain functions, not classes. Every query that touches tenant data takes `tenantId` as first parameter.

### Format Patterns

**API Response Format:**
```typescript
// Server Actions
{ success: true, data: T } | { success: false, error: AppError }

// Route Handlers
HTTP status code + JSON body with AppError shape on error
```

**Date/Time Handling:**
- Database: `timestamp with time zone` (Postgres, stored UTC)
- API responses: ISO 8601 → `date.toISOString()`
- UI display: `Intl.DateTimeFormat` with `es-UY` locale + `America/Montevideo` timezone
- No moment.js, no date-fns. `Intl.DateTimeFormat` is zero bundle cost

**Money Handling:**
- ALL prices stored as **integers in cents** (UYU centésimos, ARS centavos, USD cents)
- 2500 = $25.00 in whatever currency
- NEVER store as float. NEVER calculate with decimals
- Fee calculation: `Math.round(price * 0.10)` for 10%
- Display: `new Intl.NumberFormat('es', { style: 'currency', currency: producer.currency })`
- Never hardcode `'UYU'` — always use `producer.currency` field

**Multi-Currency Support:**
- Each producer has a `currency` field (`'UYU' | 'ARS' | 'USD'`)
- Set during onboarding by Ticktu team. Default: `'UYU'`
- No currency conversion. No multi-currency checkout. No exchange rates
- Each producer operates in ONE currency
- MercadoPago handles UYU and ARS natively. USD reserved for future Stripe

### Process Patterns

**Server Action Pattern (mandatory order):**
```
1. Authenticate — verify session exists
2. Authorize — verify user belongs to tenant + has role
3. Validate input — zod schema parse
4. Execute mutation — DB operation
5. Side effects — after() for cache revalidation, logging, notifications
```

Every Server Action follows this exact order. No exceptions.

**Parallel Data Fetching (Vercel Best Practice):**
Server Components that need multiple data sources must use Suspense boundaries for parallel fetching. Never fetch sequentially in a parent when children can fetch independently.

```typescript
// RIGHT — parallel via composition + Suspense
function DashboardPage() {
  return (
    <>
      <Suspense fallback={<KPISkeleton />}>
        <KPICards />
      </Suspense>
      <Suspense fallback={<EventListSkeleton />}>
        <EventList />
      </Suspense>
    </>
  )
}
```

**Non-Blocking Side Effects:**
Use `after()` from `next/server` for cache revalidation, Sentry logging, analytics. Never block the response for side effects.

**Error Handling Flow:**
```
Server → AppError { code, message, field?, statusCode }
         ↓
Client → handleError() maps to UX feedback level:
         - Form validation error → Level 2 (inline under field)
         - Business error (sold out) → Level 1 (toast) or Level 3 (dialog)
         - Auth error → redirect to login
         - Server error → Level 1 (toast with retry)
         - Scan result → Level 4 (full-screen color, validation app only)
```

**Loading States:**
- Initial page load: shadcn `Skeleton` matching content shape
- Data refresh (30s polling): in-place update with CSS transition, no skeleton
- Form submit: button loading state (spinner + "Processing..." + disabled)
- Never a blank page. Never a spinner without context

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow auth → authorize → validate → execute → after() order in every Server Action
2. Use `tenantId` as first parameter in every query function that touches tenant data
3. Store money as integer cents with dynamic currency from producer config
4. Import directly from source files — no barrel file imports
5. Use named exports only — no `export default`
6. Co-locate tests with source files
7. Use `Intl.DateTimeFormat` and `Intl.NumberFormat` — no external date/number libraries
8. Use Suspense boundaries for parallel server-side data fetching
9. Use `after()` for non-blocking side effects
10. Write a cross-tenant isolation test for every new query

**Anti-Patterns (FORBIDDEN):**
- `export default` anywhere
- `index.ts` barrel files in components/ or lib/
- Float/decimal for money storage
- Hardcoded `'UYU'` currency strings
- Sequential fetches in parent Server Components
- Server Actions without auth check as first line
- `moment.js`, `date-fns`, or any date library
- Blocking side effects in Server Actions or Route Handlers
- Tests that mock Supabase instead of using `supabase start` for integration tests

## Project Structure & Boundaries

### Requirements to Structure Mapping

**FR Category: Tenant Management (FR-TM-01 to FR-TM-04)**
- Routes: `src/app/(admin)/tenants/`
- Actions: `src/lib/actions/tenants.ts`
- DB Schema: `src/lib/db/schema/producers.ts`
- DB Queries: `src/lib/db/queries/producers.ts`
- Proxy: `src/proxy.ts` (subdomain resolution + tenant context injection)
- RLS Policies: `supabase/migrations/` (tenant isolation policies)

**FR Category: Event Lifecycle (FR-EV-01 to FR-EV-06)**
- Routes: `src/app/(dashboard)/events/`
- Actions: `src/lib/actions/events.ts`
- Components: `src/components/dashboard/events/`
- DB Schema: `src/lib/db/schema/events.ts`
- DB Queries: `src/lib/db/queries/events.ts`

**FR Category: Ticketing & Pricing (FR-TK-01 to FR-TK-05)**
- Routes: `src/app/(dashboard)/events/[eventId]/tickets/`
- Actions: `src/lib/actions/ticket-types.ts`
- Components: `src/components/dashboard/ticket-types/`
- DB Schema: `src/lib/db/schema/ticket-types.ts`, `src/lib/db/schema/batches.ts`
- QR Generation: `src/lib/qr/generate.ts`

**FR Category: Purchase & Payment (FR-PU-01 to FR-PU-09)**
- Routes: `src/app/(buyer)/[slug]/events/[eventId]/checkout/`, `src/app/(buyer)/[slug]/events/[eventId]/confirmation/`
- Components: `src/components/buyer/checkout/`
- Actions: `src/lib/actions/orders.ts`
- Payment Adapter: `src/lib/payments/mercadopago-client.ts`
- Webhook: `src/app/api/webhooks/mercadopago/route.ts`
- DB Schema: `src/lib/db/schema/orders.ts`, `src/lib/db/schema/tickets.ts`

**FR Category: Attribution & RRPP (FR-RR-01 to FR-RR-03)**
- Routes: `src/app/(dashboard)/events/[eventId]/rrpp/`
- Actions: `src/lib/actions/rrpp.ts`
- Components: `src/components/dashboard/rrpp/`
- DB Schema: `src/lib/db/schema/rrpp-links.ts`

**FR Category: Analytics & Reporting (FR-AN-01 to FR-AN-04)**
- Routes: `src/app/(dashboard)/analytics/`, `src/app/(dashboard)/events/[eventId]/settlement/`
- Components: `src/components/dashboard/analytics/`
- DB Queries: `src/lib/db/queries/analytics.ts`

**FR Category: Validation & Online-First Scanning (FR-VA-01 to FR-VA-06)** _(Descoped from offline 2026-03-19)_
- Routes: `src/app/(validation)/`
- API: `src/app/api/validation/scan/route.ts`
- Components: `src/components/validation/`
- Connection Status: `src/lib/validation/connection-status.ts` (online/offline detection logic)
- Service Worker: `src/sw.ts` (Serwist entry — PWA shell only, no offline validation caching)
- DB Schema: `src/lib/db/schema/scans.ts`
- ~~Offline Logic: `src/lib/validation/sync.ts`, `src/lib/validation/cache.ts`, `src/lib/validation/conflict-resolver.ts`~~ — descoped
- ~~API: `src/app/api/validation/manifest/route.ts`~~ — descoped

**FR Category: Admin & Support (FR-AD-01 to FR-AD-03)**
- Routes: `src/app/(admin)/`
- Components: `src/components/admin/`
- Actions: `src/lib/actions/admin.ts`

**Cross-Cutting: Multi-Tenancy**
- Proxy: `src/proxy.ts`
- Supabase helpers: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/proxy.ts`
- RLS migrations: `supabase/migrations/`
- Every query function: `tenantId` as first parameter

**Cross-Cutting: Email Pipeline (Inngest)**
- Inngest client: `src/lib/inngest/client.ts`
- Job functions: `src/lib/inngest/functions/`
- Inngest serve: `src/app/api/inngest/route.ts`
- Templates: `src/lib/email/templates/`
- Sender: `src/lib/email/send.ts`
- QR integration: `src/lib/qr/generate.ts`

**Cross-Cutting: Error Handling**
- Types: `src/lib/errors/app-error.ts`
- Handler: `src/lib/errors/handle-error.ts`

### Complete Project Directory Structure

```
ticktu/
├── .env.example
├── .env.local                          # Local dev (Supabase, Resend, MercadoPago keys)
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml                      # Lint + type-check + Vitest on every PR
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── drizzle.config.ts                   # Drizzle Kit configuration
├── serwist.config.ts                   # Serwist PWA configuration
├── vitest.config.ts
├── playwright.config.ts
│
├── supabase/
│   ├── config.toml                     # Supabase local dev config
│   ├── migrations/                     # Supabase-managed migrations (RLS policies)
│   └── seed.sql                        # Dev seed data (multi-tenant test fixtures)
│
├── e2e/                                # Playwright E2E tests
│   ├── buyer/
│   │   └── purchase-flow.spec.ts
│   ├── dashboard/
│   │   └── event-management.spec.ts
│   ├── validation/
│   │   └── scan-flow.spec.ts
│   ├── tenant-isolation.spec.ts        # Cross-tenant access denial via UI (#1 test priority)
│   └── fixtures/
│       ├── seed.ts                     # Master seed: sets up both test tenants
│       ├── producers.ts               # Producer A + Producer B configs
│       ├── events.ts                  # Events per tenant
│       └── tickets.ts                 # Ticket types + orders for testing
│
├── public/
│   ├── manifest.json                   # PWA manifest (validation app)
│   ├── icons/                          # PWA icons
│   └── og/                             # Default OG images
│
└── src/
    ├── app/
    │   ├── globals.css                 # Tailwind + CSS variable theme layers
    │   ├── layout.tsx                  # Root layout (minimal)
    │   │
    │   ├── (buyer)/                    # Buyer-facing routes (producer branded, Cache Components)
    │   │   ├── layout.tsx              # Buyer layout (producer theme via CSS vars)
    │   │   ├── [slug]/                 # Producer landing page
    │   │   │   ├── page.tsx            # Cached ("use cache"): producer branding + event list
    │   │   │   └── events/
    │   │   │       └── [eventId]/
    │   │   │           ├── page.tsx    # Cached ("use cache"): event details + client ticket availability
    │   │   │           ├── checkout/
    │   │   │           │   └── page.tsx  # Purchase flow (client component)
    │   │   │           └── confirmation/
    │   │   │               └── page.tsx  # Post-purchase confirmation
    │   │   └── not-found.tsx
    │   │
    │   ├── (dashboard)/                # Producer dashboard routes (authenticated)
    │   │   ├── layout.tsx              # Dashboard layout (Ticktu theme, sidebar nav)
    │   │   ├── page.tsx               # Dashboard home (KPIs, active events, quick actions)
    │   │   ├── events/
    │   │   │   ├── page.tsx           # Event list
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx       # Create event form
    │   │   │   └── [eventId]/
    │   │   │       ├── page.tsx       # Event detail/edit
    │   │   │       ├── tickets/
    │   │   │       │   └── page.tsx   # Ticket types + batches management
    │   │   │       ├── rrpp/
    │   │   │       │   └── page.tsx   # RRPP link management + attribution
    │   │   │       ├── analytics/
    │   │   │       │   └── page.tsx   # Event-specific analytics
    │   │   │       ├── settlement/
    │   │   │       │   └── page.tsx   # Post-event settlement report
    │   │   │       └── validation-codes/
    │   │   │           └── page.tsx   # Generate/manage event access codes
    │   │   ├── customers/
    │   │   │   └── page.tsx           # Customer database (buyer history)
    │   │   ├── settings/
    │   │   │   └── page.tsx           # Producer settings (branding preview)
    │   │   └── login/
    │   │       └── page.tsx           # Producer login
    │   │
    │   ├── (admin)/                    # Ticktu super admin routes
    │   │   ├── layout.tsx              # Admin layout (separate from dashboard)
    │   │   ├── page.tsx               # Admin overview
    │   │   ├── tenants/
    │   │   │   ├── page.tsx           # Producer list
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx       # Onboard new producer
    │   │   │   └── [tenantId]/
    │   │   │       └── page.tsx       # Configure producer (branding, fees, subdomain)
    │   │   ├── orders/
    │   │   │   └── page.tsx           # Order lookup (cross-tenant search)
    │   │   ├── support/
    │   │   │   └── page.tsx           # Ticket reissuance, refund tools
    │   │   └── login/
    │   │       └── page.tsx           # Admin login (separate auth boundary)
    │   │
    │   ├── (validation)/               # Validation PWA routes
    │   │   ├── layout.tsx              # Validation layout (minimal, online-first)
    │   │   ├── page.tsx               # Event code entry + operator name
    │   │   ├── scan/
    │   │   │   └── page.tsx           # QR scanner view (camera + result display)
    │   │   └── status/
    │   │       └── page.tsx           # Sync status + scan history
    │   │
    │   └── api/
    │       ├── webhooks/
    │       │   └── mercadopago/
    │       │       └── route.ts       # MercadoPago IPN webhook
    │       ├── validation/
    │       │   └── scan/
    │       │       └── route.ts       # POST: submit scan result (online validation)
    │       ├── inngest/
    │       │   └── route.ts           # Inngest serve endpoint (registers all job functions)
    │       └── tickets/
    │           └── availability/
    │               └── route.ts       # GET: live ticket availability (buyer-internal, not public API)
    │
    ├── components/
    │   ├── ui/                         # shadcn/ui components (generated by CLI)
    │   ├── buyer/
    │   │   ├── event-card.tsx
    │   │   ├── event-card.test.tsx
    │   │   ├── ticket-selector.tsx
    │   │   ├── ticket-selector.test.tsx
    │   │   ├── checkout-form.tsx
    │   │   ├── checkout-form.test.tsx
    │   │   ├── order-summary.tsx
    │   │   └── producer-header.tsx
    │   ├── dashboard/
    │   │   ├── kpi-cards.tsx
    │   │   ├── kpi-cards.test.tsx
    │   │   ├── event-list-table.tsx
    │   │   ├── event-form.tsx
    │   │   ├── event-form.test.tsx
    │   │   ├── ticket-type-form.tsx
    │   │   ├── batch-form.tsx
    │   │   ├── rrpp-link-generator.tsx
    │   │   ├── sales-chart.tsx
    │   │   ├── attendance-chart.tsx
    │   │   ├── settlement-summary.tsx
    │   │   └── sidebar-nav.tsx
    │   ├── validation/
    │   │   ├── qr-scanner.tsx
    │   │   ├── qr-scanner.test.tsx
    │   │   ├── scan-result.tsx         # Full-screen color feedback (Level 4)
    │   │   ├── event-code-form.tsx
    │   │   ├── connection-banner.tsx    # "Sin conexión" banner (online-first — was sync-indicator.tsx, descoped 2026-03-19)
    │   │   └── scan-history.tsx
    │   ├── admin/
    │   │   ├── tenant-form.tsx
    │   │   ├── order-search.tsx
    │   │   └── ticket-reissue-form.tsx
    │   └── shared/
    │       ├── empty-state.tsx
    │       ├── loading-skeleton.tsx
    │       ├── error-boundary.tsx
    │       └── theme-provider.tsx      # CSS variable injection per producer
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── server.ts              # Server-side Supabase client (cookies-based)
    │   │   ├── client.ts              # Browser-side Supabase client
    │   │   └── proxy.ts              # Supabase session refresh in proxy
    │   ├── db/
    │   │   ├── drizzle.ts             # Drizzle client initialization (NOT a barrel)
    │   │   ├── schema/                # Drizzle table definitions (relations co-located per file)
    │   │   │   ├── producers.ts       # producers table + relations
    │   │   │   ├── events.ts          # events table + relations
    │   │   │   ├── ticket-types.ts    # ticket_types table + relations
    │   │   │   ├── batches.ts         # batches table + relations
    │   │   │   ├── orders.ts          # orders table + relations
    │   │   │   ├── tickets.ts         # tickets table (individual tickets with QR) + relations
    │   │   │   ├── rrpp-links.ts      # rrpp_links table + relations
    │   │   │   └── scans.ts           # scans table (validation audit trail) + relations
    │   │   ├── queries/               # Query functions (tenantId as first param for tenant data)
    │   │   │   ├── producers.ts
    │   │   │   ├── producers.test.ts  # Tenant isolation + happy path
    │   │   │   ├── events.ts
    │   │   │   ├── events.test.ts     # Tenant isolation + happy path
    │   │   │   ├── ticket-types.ts
    │   │   │   ├── ticket-types.test.ts
    │   │   │   ├── orders.ts
    │   │   │   ├── orders.test.ts
    │   │   │   ├── tickets.ts
    │   │   │   ├── tickets.test.ts
    │   │   │   ├── rrpp-links.ts
    │   │   │   ├── rrpp-links.test.ts
    │   │   │   ├── scans.ts
    │   │   │   ├── scans.test.ts
    │   │   │   ├── analytics.ts       # Aggregate queries for dashboard + settlement
    │   │   │   └── analytics.test.ts
    │   │   └── migrations/            # Drizzle Kit generated migrations
    │   ├── actions/
    │   │   ├── events.ts              # createEvent, publishEvent, finishEvent
    │   │   ├── events.test.ts         # Auth rejection + validation + happy path
    │   │   ├── orders.ts              # createOrder, processRefund
    │   │   ├── orders.test.ts
    │   │   ├── ticket-types.ts        # createTicketType, createBatch
    │   │   ├── ticket-types.test.ts
    │   │   ├── tenants.ts             # updateBranding, configureProducer
    │   │   ├── tenants.test.ts
    │   │   ├── rrpp.ts                # generateRRPPLink
    │   │   ├── rrpp.test.ts
    │   │   ├── validation.ts          # scanTicket (online-first)
    │   │   ├── validation.test.ts
    │   │   ├── admin.ts               # reissueTicket, lookupOrder
    │   │   └── admin.test.ts
    │   ├── payments/
    │   │   ├── mercadopago-client.ts   # MercadoPago SDK wrapper
    │   │   ├── mercadopago-client.test.ts
    │   │   ├── create-preference.ts   # Checkout Pro preference creation
    │   │   └── types.ts               # Payment types + adapter interface
    │   ├── email/
    │   │   ├── send.ts                # Resend send function
    │   │   ├── send.test.ts
    │   │   └── templates/
    │   │       ├── ticket-confirmation.tsx   # react-email: tickets + QR codes
    │   │       └── event-cancelled.tsx       # react-email: cancellation notice
    │   ├── inngest/
    │   │   ├── client.ts              # Inngest client initialization
    │   │   └── functions/
    │   │       ├── send-ticket-emails.ts   # order/completed → QR + email delivery (3 retries)
    │   │       └── send-ticket-emails.test.ts
    │   ├── qr/
    │   │   ├── generate.ts            # Cryptographic QR code generation
    │   │   ├── generate.test.ts
    │   │   └── validate.ts            # QR hash verification logic
    │   ├── validation/
    │   │   ├── connection-status.ts   # Online/offline detection logic
    │   │   └── connection-status.test.ts
    │   │   # ~~sync.ts, cache.ts, conflict-resolver.ts~~ — descoped (online-first 2026-03-19)
    │   ├── errors/
    │   │   ├── app-error.ts           # AppError type definition
    │   │   ├── handle-error.ts        # Error → UX feedback level mapper
    │   │   └── handle-error.test.ts   # Error mapping is critical UX behavior
    │   └── utils/
    │       ├── money.ts               # Integer cents formatting + calculation
    │       ├── money.test.ts
    │       ├── dates.ts               # Intl.DateTimeFormat helpers (es-UY)
    │       ├── tenant.ts              # Subdomain parsing + tenant resolution
    │       └── tenant.test.ts         # Edge cases: www., trailing dots, invalid slugs
    │
    ├── types/
    │   ├── events.ts                  # Event, EventStatus types
    │   ├── orders.ts                  # Order, OrderItem types
    │   ├── tickets.ts                 # Ticket, TicketType, Batch types
    │   └── auth.ts                    # User roles, JWT claims types
    │
    ├── proxy.ts                        # Proxy (Node.js runtime): subdomain → surface routing + auth
    │
    └── sw.ts                          # Serwist service worker entry (validation PWA shell)
                                       # PWA shell only — offline validation caching descoped 2026-03-19
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Pattern | Scope |
|----------|---------|-------|
| Server Actions (`lib/actions/`) | All UI mutations | Auth → authorize → validate → execute → after() pipeline |
| Route Handlers (`app/api/`) | External webhooks, PWA replay, buyer-internal endpoints | MercadoPago IPN, validation scan, ticket availability |
| DB Queries (`lib/db/queries/`) | Shared data access layer | Used by both Server Actions and Route Handlers — never call each other |

**Note:** `api/tickets/availability/` is buyer-internal (serves our own buyer UI client component), not a public API. Documented to prevent confusion.

**Component Boundaries:**
- Route groups `(buyer)`, `(dashboard)`, `(admin)`, `(validation)` are isolated UI surfaces — components never imported across groups
- `components/shared/` is the only cross-surface component directory
- `components/ui/` (shadcn) is available to all surfaces

**Data Boundaries:**
- Every query in `lib/db/queries/` that touches tenant data takes `tenantId` as first parameter
- RLS policies enforce tenant isolation at database level (belt-and-suspenders with app-level)
- Validation app accesses data through Route Handlers only (no direct DB from PWA client)
- Buyer pages use Cache Components (`"use cache"`) for cached data + client-side fetch for live availability

**Auth Boundaries:**
- 4 separate auth contexts never cross: super admin, producer admin, validation codes, buyer (no auth)
- Proxy (`proxy.ts`) resolves which surface based on subdomain before any auth check

### Integration Points

**External Integrations:**

| Service | Integration Point | Protocol |
|---------|------------------|----------|
| MercadoPago | `lib/payments/mercadopago-client.ts` → `app/api/webhooks/mercadopago/route.ts` | REST API + IPN webhook |
| Resend | `lib/email/send.ts` | REST API |
| Supabase Auth | `lib/supabase/server.ts` + `lib/supabase/client.ts` | SDK |
| Supabase Storage | Direct SDK calls for image upload/retrieval | SDK |
| Inngest | `lib/inngest/client.ts` → `app/api/inngest/route.ts` | SDK + webhook |
| Cloudflare | DNS + proxy (infrastructure, no code integration) | Config |

**Internal Data Flows:**

```
Buyer Purchase:
  Checkout form → createOrder action → DB insert → MercadoPago preference
  → MercadoPago redirect → Payment → IPN webhook → validate payment
  → inngest.send("order/completed") → Inngest function: generateQR → renderEmail → sendViaResend
  → (retries on failure) → buyer receives tickets

Validation Scan:
  QR Scanner → POST /api/validation/scan → verify QR hash → check status
  → record scan → return result
  (offline: "Sin conexión" banner displayed — scanning paused until connection returns. Descoped from offline queue 2026-03-19)

Dashboard Refresh:
  Client component → setInterval(30s) → fetch analytics queries → in-place update
```

### File Organization Patterns

**Configuration Files (project root):**
- `next.config.ts` — Next.js config (Serwist plugin, image domains, rewrites, `cacheComponents: true`)
- `tailwind.config.ts` — Tailwind theme extension + CSS variable references
- `drizzle.config.ts` — Drizzle Kit connection + migration output path
- `serwist.config.ts` — PWA manifest, precache config (PWA shell only — offline validation descoped 2026-03-19)
- `vitest.config.ts` — Test runner config (path aliases, setup files)
- `playwright.config.ts` — E2E config (base URL, browser targets)

**Test Organization:**
- Unit/integration tests: co-located with source files (`*.test.ts` / `*.test.tsx`)
- E2E tests: `e2e/` at project root, organized by UI surface
- E2E fixtures: `e2e/fixtures/` with multi-tenant seed data organized by entity
- Integration tests hit real Supabase local instance (`supabase start`) — no mocks
- Every query file has a co-located test with tenant isolation assertion
- Every action file has a co-located test with auth rejection + happy path

**Asset Organization:**
- `public/manifest.json` — PWA manifest for validation app
- `public/icons/` — PWA app icons
- `public/og/` — Default Open Graph images
- Producer-specific assets (logos, hero images) stored in Supabase Storage, CDN-served

### Development Workflow Integration

**Local Development:**
```bash
supabase start                  # Local Postgres + Auth + Storage
npm run dev                     # Next.js dev server (Turbopack)
```

**Testing:**
```bash
npm run test                    # Vitest (unit + integration, hits real local Supabase)
npm run test:e2e                # Playwright (E2E against dev server)
npm run lint                    # ESLint
npm run typecheck               # tsc --noEmit
```

**CI Pipeline (GitHub Actions on every PR):**
```bash
supabase start                  # Spin up local Supabase in CI
npm run lint && npm run typecheck && npm run test
```

**Deployment:**
- Push to `main` → Vercel auto-deploys
- PR branches → Vercel preview deploys
- DB migrations: `drizzle-kit push` in deploy pipeline

### Party Mode Review Notes

**Winston + Amelia + Quinn structural feedback incorporated:**
- Removed `relations.ts` — relations co-located in each schema file for developer ergonomics
- Added `.test.ts` for all 8 query files (tenant isolation mandatory) and all 7 action files (auth rejection mandatory)
- Added `handle-error.test.ts` and `tenant.test.ts` for critical utility functions
- Added `e2e/tenant-isolation.spec.ts` as dedicated cross-tenant E2E test (#1 priority)
- Expanded `e2e/fixtures/` to `seed.ts`, `producers.ts`, `events.ts`, `tickets.ts` for multi-tenant test data
- Annotated `api/tickets/availability/` as buyer-internal to prevent public API confusion
- `sw.ts` serves as PWA shell entry — ~~runtime caching for validation manifest~~ descoped (online-first 2026-03-19)
- No custom tooling/skills needed — CI pipeline (`lint + typecheck + vitest`) enforces all checks at merge time

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility — No Conflicts:**
- Next.js 16 App Router + Supabase + Drizzle + shadcn/ui — all actively maintained, no known incompatibilities
- Serwist (@serwist/next) confirmed Turbopack-compatible — no conflict with Next.js 16 defaults
- Drizzle ORM + Supabase PostgreSQL — works via `postgres` driver, no Prisma/Supabase client conflict
- Supabase Auth JWT + RLS `auth.jwt()->>'tenant_id'` — native integration, no custom auth bridge needed
- Server Actions + Route Handlers hybrid — official Next.js pattern, no overlap
- react-email + Resend — same ecosystem, designed to work together
- Inngest + Vercel — native integration, Inngest runs as Route Handler within the Next.js app

**Pattern Consistency — Aligned:**
- snake_case DB ↔ camelCase TS via Drizzle column mapping — consistently documented with code example
- Server Action 5-step pipeline (auth → authorize → validate → execute → after) — applies uniformly to all 7 action files
- Named exports + no barrel files + kebab-case files — consistent across all directories
- Co-located tests — enforced in both component and lib directories with explicit file listings

**Structure Alignment — Confirmed:**
- Route groups `(buyer)/(dashboard)/(admin)/(validation)` align with the 4 auth boundaries
- `lib/actions/` organized by domain matches Server Action pattern
- `lib/db/queries/` with `tenantId` first param matches RLS belt-and-suspenders pattern
- E2E fixtures organized by entity support multi-tenant test strategy

### Requirements Coverage Validation

**Functional Requirements — All 36 FRs Covered:**

| FR Category | FRs | Architectural Support |
|-------------|-----|----------------------|
| Tenant Management | FR-TM-01 to 04 | Proxy subdomain routing + RLS + `(admin)/tenants/` |
| Event Lifecycle | FR-EV-01 to 06 | `(dashboard)/events/` + Server Actions + Cache Components revalidation |
| Ticketing & Pricing | FR-TK-01 to 05 | Schema (ticket-types, batches) + QR lib + fee calculation pattern |
| Purchase & Payment | FR-PU-01 to 09 | `(buyer)/checkout/` + MercadoPago adapter + webhook + Inngest email pipeline |
| Attribution & RRPP | FR-RR-01 to 03 | `rrpp-links` schema + dashboard analytics queries |
| Analytics & Reporting | FR-AN-01 to 04 | Dashboard polling + analytics queries + settlement page |
| Validation & Online-First | FR-VA-01 to 06 | PWA routes + Serwist (shell only) + online validation + connection status indicator + scan audit _(offline IndexedDB + sync descoped 2026-03-19)_ |
| Admin & Support | FR-AD-01 to 03 | `(admin)/` routes + cross-tenant search + ticket reissuance |

**Non-Functional Requirements — All 20 NFRs Addressed:**

| NFR Category | Key NFRs | Architectural Support |
|-------------|----------|----------------------|
| Performance | PE-01 to 04 | Cache Components edge caching (<3s mobile), QR scan pure functions (<2s), Inngest email (<60s), Vercel functions (<500ms p95) |
| Availability | AV-01 to 03 | Vercel multi-region + Cloudflare CDN (99.9%), payment fault isolation (Inngest retries), online-first validation with connection status indicator _(offline IndexedDB cache descoped 2026-03-19)_ |
| Scalability | SC-01 to 03 | Vercel auto-scaling (500 concurrent), online validation (40 scans/min per device), stateless architecture |
| Security | SE-01 to 04 | MercadoPago PCI delegation, RLS + app-level tenant isolation, crypto QR generation, separate auth boundaries |
| Data Integrity | DI-01 to 04 | Online-first centralized duplicate detection _(first-scan-wins offline sync descoped 2026-03-19)_, webhook idempotency, Inngest guaranteed delivery |
| Email Deliverability | EM-01 to 02 | Resend (SPF/DKIM/DMARC support), react-email branded templates |

### Implementation Readiness Validation

**Decision Completeness:**
- All technology choices include specific libraries (not just categories)
- Code examples provided for: Drizzle schema bridge, Server Action pipeline, Suspense parallel fetching, error handling flow
- Initialization command is copy-paste ready
- Anti-patterns list is explicit and enforceable

**Structure Completeness:**
- Full directory tree with ~120 specific files
- Every FR category mapped to exact file paths
- Test files explicitly listed (not implied)
- E2E fixtures structured for multi-tenant seeding

**Pattern Completeness:**
- Naming: DB, TS, files — all documented with examples
- API response format: both Server Action and Route Handler shapes
- Money, dates, currency: all with code examples
- Loading states: 4 distinct patterns per UX context

### Gap Analysis Results

**No Critical Gaps Found.**

**Important Gaps (non-blocking, addressable during implementation):**

1. **Rate limiting strategy** — Middleware mentions Vercel edge for rate limiting but no specific implementation pattern. Recommendation: Cloudflare basic rate limiting rules for MVP; define custom middleware pattern during implementation if needed.

2. **Logging/observability pattern** — Sentry chosen for error tracking, but no structured logging pattern (request ID propagation, log levels). Recommendation: `console.log` with structured JSON + Vercel log drain. Define formally post-MVP.

3. **Database backup/recovery** — Supabase includes daily backups, but restore procedure and RPO/RTO targets not documented. Recommendation: rely on Supabase managed backup; document procedure when moving to production.

4. **Image optimization** — Producer logos and event images served from Supabase Storage CDN, but no `next/image` pattern documented. Recommendation: use Next.js `<Image>` with `remotePatterns` in `next.config.ts`.

**Nice-to-Have Gaps (post-MVP refinements):**
- Storybook for component documentation
- OpenTelemetry for distributed tracing
- Load testing script (k6) for NFR-SC-01 validation
- Feature flag system for gradual rollouts

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (8 FR domains, 6 NFR categories)
- [x] Scale and complexity assessed (medium-high, 4 UI surfaces)
- [x] Technical constraints identified (MercadoPago, managed model, shadcn/ui)
- [x] Cross-cutting concerns mapped (7 concerns with detailed architecture)

**Architectural Decisions**
- [x] Critical decisions documented with specific libraries
- [x] Technology stack fully specified (15+ technology choices)
- [x] Integration patterns defined (MercadoPago, Resend, Supabase)
- [x] Performance considerations addressed (Cache Components, edge caching, no Redis)

**Implementation Patterns**
- [x] Naming conventions established (DB, TS, files with examples)
- [x] Structure patterns defined (no barrels, named exports, co-located tests)
- [x] Communication patterns specified (Server Actions + Route Handlers)
- [x] Process patterns documented (5-step pipeline, error handling, loading states)

**Project Structure**
- [x] Complete directory structure defined (~120 files)
- [x] Component boundaries established (4 isolated surfaces)
- [x] Integration points mapped (external + internal data flows)
- [x] Requirements to structure mapping complete (all 8 FR categories)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Belt-and-suspenders tenant isolation (RLS + app-level) — non-negotiable for payments platform
- Zero-dependency state management (no Redux/Zustand) — simplicity for MVP
- Cache Components + on-demand invalidation (`updateTag`/`revalidateTag`) — fast buyer experience with zero stale data risk
- Comprehensive test strategy with mandatory tenant isolation tests from day one
- Clean separation of 4 UI surfaces via route groups with isolated auth boundaries

**Areas for Future Enhancement:**
- Rate limiting (Cloudflare basic rules → custom middleware if needed)
- WebSocket upgrade from 30s polling (post-MVP if dashboard UX demands it)
- Inngest step functions for complex multi-step workflows (beyond email delivery)
- Image optimization patterns (define during first image-heavy story)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented in this file
- Use implementation patterns consistently across all components
- Respect project structure and component boundaries — no cross-surface imports
- Refer to this document for all architectural questions before making independent decisions
- Every new query file must include a co-located tenant isolation test
- Every new action file must include auth rejection + happy path tests

**First Implementation Priority:**
```bash
npx create-next-app@latest ticktu --yes
cd ticktu
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr
npm install drizzle-orm postgres
npm install -D drizzle-kit
npm install @serwist/next
npm install inngest
```

Follow with: proxy.ts (subdomain routing) → Supabase Auth setup → Drizzle schema → RLS policies → Inngest setup
