---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories']
inputDocuments:
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/prd.md'
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/architecture.md'
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Ticktu - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Ticktu, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Tenant Management (4 FRs)**

FR-TM-01: Platform supports multiple isolated tenants, each with unique subdomain (`{producer}.ticktu.com`), branding (logo, colors, imagery), and data boundaries
FR-TM-02: Ticktu admin can create, configure, and activate new producer tenants including subdomain, branding, fee structure, and admin credentials
FR-TM-03: Producer A cannot access, view, or query Producer B's data under any circumstances
FR-TM-04: Each producer tenant has at least one admin user with full access to their tenant's features

**Event Lifecycle (6 FRs)**

FR-EV-01: Producers can create events with name, date, venue, description, and imagery
FR-EV-02: Events follow a managed lifecycle: Draft → Published → Finished → Archived
FR-EV-03: Published events are publicly visible on the producer's branded site
FR-EV-04: Producers can mark events as Finished post-event, triggering settlement availability
FR-EV-05: Cancelled events trigger refund processing for all paid tickets and notify affected buyers
FR-EV-06: Producer dashboard displays an overview of active events, recent sales activity, and quick actions for event management

**Ticketing & Pricing (5 FRs)**

FR-TK-01: Producers can define multiple ticket types per event (e.g., General, VIP) with independent pricing and capacity limits
FR-TK-02: Producers can create batch releases per ticket type with independent quantities and scheduled activation dates
FR-TK-03: Each sold ticket generates a cryptographically unique QR code as its identifier
FR-TK-04: Producers can issue complimentary (free) tickets with full tracking, bypassing payment flow
FR-TK-05: Service fee ($1-1.5 USD or 10%) is added to ticket price and clearly displayed to buyer before payment

**Purchase & Payment (8 FRs)**

FR-PU-01: Buyers can complete ticket purchase without creating an account (guest checkout)
FR-PU-02: Purchase flow is mobile-first and supports deep linking from social media (Instagram, etc.)
FR-PU-03: Buyers can purchase multiple tickets (different types/quantities) in a single transaction, providing name and email per ticket holder
FR-PU-04: Payment is processed through MercadoPago; Ticktu never stores or handles card data
FR-PU-05: On payment failure, cart is preserved and buyer can retry with a different payment method without restarting
FR-PU-06: On successful payment, buyer receives email confirmation with individual QR codes per ticket within 60 seconds
FR-PU-07: Refunds are processable through MercadoPago API for cancelled events or support cases
FR-PU-09: On successful payment, buyer is redirected to a confirmation page displaying order summary and ticket details

**Attribution & RRPP (3 FRs)**

FR-RR-01: Producers can generate unique trackable URLs per RRPP (promoter) for sales attribution
FR-RR-02: Purchases made through RRPP links are attributed to the corresponding RRPP in real time
FR-RR-03: Dashboard displays per-RRPP sales performance (tickets sold, revenue attributed)

**Analytics & Reporting (4 FRs)**

FR-AN-01: Real-time dashboard shows live sales data: tickets sold by type, revenue, batch status, and RRPP performance
FR-AN-02: Post-event settlement report details total tickets sold, gross revenue, fees collected, and net producer earnings
FR-AN-03: Customer database stores buyer information (name, email) and purchase history per producer tenant
FR-AN-04: Producers can view check-in data: attendance count, peak entry times, ticket type breakdown

**Validation & Online-First Scanning (6 FRs)** _(Descoped to online-first 2026-03-19 — offline scanning, IndexedDB manifest cache, and background sync removed)_

FR-VA-01: Validation app authenticates to a specific event via event code and operator name
FR-VA-02: QR scan validates ticket and displays result (valid + ticket info, or invalid + reason) in under 2 seconds
FR-VA-03: Duplicate QR scans are rejected with clear "Already Used" indication
FR-VA-04: ~~Validation app caches event ticket data and operates fully offline when internet is unavailable~~ _(Descoped to online-first 2026-03-19)_ — Validation app displays a connection status indicator; when offline, a "Sin conexión" banner informs the operator they cannot scan
FR-VA-05: ~~Offline validations sync automatically when connectivity is restored, maintaining 100% data integrity~~ _(Descoped to online-first 2026-03-19)_ — When connectivity returns, the operator can simply resume scanning; no sync queue needed
FR-VA-06: Each scan is tracked with operator identity, timestamp, and device for audit purposes

**Admin & Support (3 FRs)**

FR-AD-01: Ticktu admin can look up any order by buyer name, email, or transaction ID across all tenants
FR-AD-02: Ticktu admin can reissue tickets (generate new QR, invalidate old) for support cases
FR-AD-03: Ticktu admin panel is separate from producer panel with platform-wide access

**Total: 39 FRs across 8 domains**

### NonFunctional Requirements

**Performance (4 NFRs)**

NFR-PE-01: Producer branded site pages load in under 3 seconds on mobile 4G connections as measured by Lighthouse performance audit
NFR-PE-02: QR ticket validation completes (scan to result display) in under 2 seconds as measured by app instrumentation
NFR-PE-03: Ticket confirmation emails with QR codes are delivered within 60 seconds of successful payment as measured by email service provider logs
NFR-PE-04: API endpoints respond in under 500ms for 95th percentile under normal load as measured by APM monitoring

**Availability (3 NFRs)**

NFR-AV-01: Platform maintains 99.9%+ uptime during active ticket sales windows as measured by uptime monitoring
NFR-AV-02: Payment processing failures do not cascade — if analytics or non-critical services fail, purchase flow continues operating
NFR-AV-03: ~~Validation app operates fully offline with cached event data~~ _(Descoped to online-first 2026-03-19)_ — Validation app requires internet connectivity; displays "Sin conexión" banner when offline

**Scalability (3 NFRs)**

NFR-SC-01: Platform supports up to 500 concurrent buyers during a ticket sales window without degradation as measured by load testing
NFR-SC-02: Validation app supports scanning rates of minimum 40 tickets per minute per device without performance degradation
NFR-SC-03: Architecture supports horizontal scaling of application servers for future growth

**Security (4 NFRs)**

NFR-SE-01: Ticktu never stores, processes, or transmits credit card data — PCI compliance is fully delegated to MercadoPago
NFR-SE-02: Tenant ID is validated on every API request; no cross-tenant data access is possible at application or database level
NFR-SE-03: Each ticket QR code is cryptographically unique and non-guessable
NFR-SE-04: Admin panel and producer panel are separate authentication boundaries

**Data Integrity (4 NFRs)**

NFR-DI-01: ~~Offline validation syncs maintain 100% data integrity~~ _(Descoped to online-first 2026-03-19)_ — All scans are online; no offline sync needed
NFR-DI-02: ~~Offline conflict resolution handles edge case of same ticket validated on two devices offline~~ _(Descoped to online-first 2026-03-19)_ — With online-first, duplicate detection is centralized and real-time
NFR-DI-03: Payment success rate of 99%+ as measured per event (failures are MercadoPago-side, not Ticktu-side)
NFR-DI-04: Ticket delivery rate of 100% — every successful payment results in delivered tickets as measured per event

**Email Deliverability (2 NFRs)**

NFR-EM-01: Ticket delivery emails achieve 99%+ inbox placement rate as measured by email service provider analytics
NFR-EM-02: Email sending infrastructure configured with proper SPF, DKIM, and DMARC records

**Total: 20 NFRs across 6 categories**

### Additional Requirements

**From Architecture:**

- Starter template: `create-next-app` + manual layering of Supabase, shadcn/ui, Drizzle ORM, Serwist, Inngest
- Multi-tenancy: Belt-and-suspenders isolation (Postgres RLS + app-level tenant_id validation on every request)
- Authentication: Supabase Auth with 3 contexts (super admin, producer admin, validation access codes) + JWT with custom `tenant_id` claim
- Subdomain routing: `proxy.ts` (Node.js runtime, replaces deprecated middleware.ts) resolves subdomain → surface routing + auth
- Database: Supabase PostgreSQL with Drizzle ORM, shared DB with `tenant_id` (not schema-per-tenant), RLS policies
- Caching: Next.js 16 Cache Components (`"use cache"`) with on-demand invalidation (`updateTag`/`revalidateTag`), no Redis for MVP
- Email pipeline: Resend + react-email + Inngest async job queue (order/completed → QR generation → email rendering → send, with 3 retries)
- Payment: MercadoPago Checkout Pro/Bricks, abstracted payment layer (`createPayment({ orderId, amount, method })`), order creation abstracted from payment method (serves both MercadoPago and Boletería cash/transfer)
- Background jobs: Inngest from day one for reliable email delivery with retries and observability
- Error handling: Typed `AppError { code, message, field?, statusCode }`, Server Actions return `{ success, data } | { success, error }`, Route Handlers return HTTP status + AppError
- CI/CD: GitHub Actions (lint + type-check + Vitest on every PR), Vercel auto-deploy on push to main, Drizzle Kit migrations in deploy pipeline
- Monitoring: Sentry (error tracking), Vercel Analytics, Supabase Dashboard, Resend Dashboard, Inngest Dashboard
- Testing: Vitest (unit/integration hitting real Supabase local), Playwright (E2E), co-located tests, mandatory tenant isolation tests per query, mandatory auth rejection tests per action
- Folder structure: Route groups `(buyer)/(dashboard)/(admin)/(validation)` as isolated UI surfaces, `lib/actions/` by domain, `lib/db/queries/` with tenantId first param
- Patterns: No barrel files, named exports only, snake_case DB ↔ camelCase TS via Drizzle, money as integer cents, `Intl.DateTimeFormat` for dates, Server Action 5-step pipeline (auth → authorize → validate → execute → after())
- Local development: Supabase local (`supabase start`), subdomain routing via `/etc/hosts` or `nip.io`
- Multi-currency: Per-producer `currency` field (`UYU | ARS | USD`), no conversion, no multi-currency checkout

### UX Design Requirements

UX-DR-01: Two-layer theming architecture — Ticktu base theme (dashboard, admin, validation) + producer brand theme (buyer pages) via CSS variables, loaded per subdomain
UX-DR-02: White-Label Theme Provider component — detect subdomain → fetch producer tokens (cached) → inject CSS variables into `:root`
UX-DR-03: Landing Template with Level 2 customization — single template with toggleable blocks (hero, social links, about section) per producer, configured by Ticktu team during onboarding
UX-DR-04: Producer dashboard sidebar with 7 sections: Dashboard, Eventos, Ventas, RRPP, Boletería, Check-ins, Finanzas — collapsible sidebar pattern (shadcn Sidebar). "Check-ins" maps to Epic 6.4 (event check-in monitoring). "Usuario" section removed from MVP scope (no corresponding story)
UX-DR-05: Dashboard main page with 5 KPI cards (Tickets Vendidos, Ingresos, Gastos, Balance, Eventos Activos) + sales chart + RRPP ranking + recent sales table. Balance is hero metric (green positive/red negative)
UX-DR-06: Event detail view with 7 tabs in main content (General, Ventas, RRPP, Cortesías, Check-ins, Finanzas, Configuración) — sidebar does NOT change on event entry
UX-DR-07: Boletería POS interface — event selector, ticket type radio, quantity selector, buyer data (name/email), payment method (cash/transfer), confirm. Ultra-fast flow for line scenarios
UX-DR-08: Finanzas unified view combining Balance (net + per-event breakdown), Gastos (categories + expense table), and Liquidaciones (settlement history) in a single page
UX-DR-09: Buyer purchase flow — linear funnel: event page → ticket selection → buyer details (name + email per ticket) → summary with fee breakdown → MercadoPago → branded confirmation → email with QR. Single email for all tickets in multi-ticket purchase
UX-DR-10: Buyer checkout mobile-first, centered max-width 480px on desktop. Step indicator (1. Tickets → 2. Details → 3. Payment) visual only, not clickable backwards
UX-DR-11: 4-level feedback model: Level 1 Ambient (Sonner toast), Level 2 Inline (field validation), Level 3 Blocking (AlertDialog for destructive actions), Level 4 Environmental (full-screen color + haptics for validation scan)
UX-DR-12: Button hierarchy: one Primary per context, Secondary for complementary, Outline for tertiary, Ghost for navigation, Destructive always inside AlertDialog. Buyer checkout primary = full-width, fixed to bottom, shows amount
UX-DR-13: Form validation: react-hook-form + zod, lazy validation (on-blur) + eager re-validation (on-change after first error). Specific human-readable error messages. Auto-focus + scroll to first error on submit
UX-DR-14: Loading states: Skeleton (shadcn) for initial page load matching content shape, in-place CSS transition updates for 30s polling refresh (no skeleton on refresh). Never blank page, never spinner without context
UX-DR-15: Empty states with reusable `<EmptyState />` component — 3 variants: first-use (positive CTA), no-results (clear filters CTA), error (retry CTA)
UX-DR-16: Modal/overlay patterns: Dialog (short forms, <5 fields), Sheet (longer content, slide from right desktop / bottom mobile), AlertDialog (destructive confirmations). One overlay at a time, Escape always closes
UX-DR-17: Validation app — event code + operator name entry → camera scanner → full-screen color feedback (green valid / red invalid) with auto-dismiss 2s + device vibration. No buttons between scans, zero-button scanning interface
UX-DR-18: Validation app connection status indicator — "Sin conexión" banner when offline, informing the operator they cannot scan until connection returns _(Updated to online-first 2026-03-19 — previously a subtle yellow dot for offline fallback mode)_
UX-DR-19: Scan Result Overlay — full-screen color feedback (aligned with UX-DR-17 Level 4 Environmental feedback), VALID (green + checkmark) / INVALID (red + X + reason), auto-dismiss 2s, haptic feedback. Renders as full-screen overlay for unambiguous visibility in dark/loud venue environments
UX-DR-20: Ticket Quantity Selector custom component — [-] [number] [+] built with shadcn Button + Input primitives, used in buyer checkout and Boletería
UX-DR-21: QR Scanner View custom component — camera viewfinder, `html5-qrcode` or equivalent, states: loading camera / scanning / processing
UX-DR-22: Responsive strategy: dual-first (desktop + mobile as primary). Tables adapt with prioritized columns + Sheet detail on mobile. Charts full-width on mobile. KPIs stay large. Sidebar as overlay on mobile with hamburger
UX-DR-23: Accessibility WCAG Level A: semantic HTML, alt text, focus-visible, 44px touch targets, skip links, aria-live for real-time dashboard, labels above inputs, `eslint-plugin-jsx-a11y`
UX-DR-24: Navigation: producer dashboard with breadcrumbs for depth. Buyer flow linear with no traditional nav. Validation app single-screen. "Back" always ghost variant button
UX-DR-25: Search/filtering in dashboard tables: search input with debounce 300ms, inline filters (Select/Dropdown), tabs for fixed categories (Active/Draft/Finished). No global search

### FR Coverage Map

FR-TM-01: Epic 1 — Multi-tenant isolation with unique subdomains and branding
FR-TM-02: Epic 1 — Ticktu admin creates/configures producer tenants
FR-TM-03: Epic 1 — Cross-tenant data access prevention
FR-TM-04: Epic 1 — Producer admin user with full tenant access
FR-EV-01: Epic 2 — Event creation with details and imagery
FR-EV-02: Epic 2 — Event lifecycle (Draft → Published → Finished → Archived)
FR-EV-03: Epic 2 — Published events visible on branded site
FR-EV-04: Epic 2 — Mark events Finished, triggering settlement
FR-EV-05: Epic 8 — Event cancellation triggers refunds and notifications
FR-EV-06: Epic 6 — Dashboard overview of active events and sales
FR-TK-01: Epic 3 — Multiple ticket types per event with pricing/capacity
FR-TK-02: Epic 3 — Batch releases with quantities and scheduled activation
FR-TK-03: Epic 4 — Cryptographically unique QR code per ticket
FR-TK-04: Epic 3 — Complimentary ticket issuance
FR-TK-05: Epic 3 — Service fee display and calculation
FR-PU-01: Epic 4 — Guest checkout (no account required)
FR-PU-02: Epic 4 — Mobile-first purchase with social media deep links
FR-PU-03: Epic 4 — Multi-ticket purchase with per-holder details
FR-PU-04: Epic 4 — MercadoPago payment processing
FR-PU-05: Epic 4 — Cart preservation on payment failure
FR-PU-06: Epic 4 — Email with QR codes within 60 seconds
FR-PU-07: Epic 4 — Refund processing via MercadoPago API
FR-PU-09: Epic 4 — Confirmation page with order summary
FR-RR-01: Epic 5 — Unique trackable URLs per RRPP
FR-RR-02: Epic 5 — Real-time purchase attribution to RRPP
FR-RR-03: Epic 5 — Per-RRPP sales performance dashboard
FR-AN-01: Epic 6 — Real-time dashboard with live sales data
FR-AN-02: Epic 8 — Post-event settlement report
FR-AN-03: Epic 6 — Customer database per producer tenant
FR-AN-04: Epic 6 — Check-in data with attendance and peak times
FR-VA-01: Epic 7 — Validation app auth via event code and operator name
FR-VA-02: Epic 7 — QR scan with result in under 2 seconds
FR-VA-03: Epic 7 — Duplicate scan rejection
FR-VA-04: Epic 7 — ~~Offline operation with cached event data~~ Online-first with connection status indicator _(Descoped to online-first 2026-03-19)_
FR-VA-05: Epic 7 — ~~Automatic sync on reconnect with 100% integrity~~ Resume scanning when connection returns _(Descoped to online-first 2026-03-19)_
FR-VA-06: Epic 7 — Scan tracking with operator, timestamp, device
FR-AD-01: Epic 10 — Cross-tenant order lookup
FR-AD-02: Epic 10 — Ticket reissuance (new QR, invalidate old)
FR-AD-03: Epic 10 — Separate admin panel with platform-wide access

**UX-DR Coverage (no formal FRs):**
UX-DR-07: Epic 9 — Boletería POS interface for cash/transfer sales
UX-DR-08: Epic 9 — Finanzas unified view (Balance + Gastos + Liquidaciones)

**All 39 FRs + 2 UX-DRs mapped. Zero gaps.**

## Epic List

### Epic 1: Producer Onboarding & Branded Platform
Ticktu admin can create producer tenants with branding, subdomains, and credentials. Producers log in and see their branded dashboard. Complete data isolation enforced at application and database level.
**FRs covered:** FR-TM-01, FR-TM-02, FR-TM-03, FR-TM-04
**Includes:** Project initialization (create-next-app + full stack), multi-tenancy (proxy.ts, RLS), Supabase Auth (3 contexts), Drizzle schema foundation, producer branding system (CSS variables)

### Epic 2: Event Creation & Producer Storefront
Producers can create and manage events through their full lifecycle. Published events are visible on the producer's branded landing page with SEO/OG tags and configurable blocks.
**FRs covered:** FR-EV-01, FR-EV-02, FR-EV-03, FR-EV-04
**Includes:** Event CRUD, lifecycle states, producer landing page template (Level 2 customization), Cache Components + on-demand invalidation

### Epic 3: Ticket Configuration & Sales Setup
Producers define ticket types with pricing and capacity, create batch releases with scheduled activation, issue complimentary tickets, and configure service fees.
**FRs covered:** FR-TK-01, FR-TK-02, FR-TK-04, FR-TK-05
**Includes:** Ticket type management, batch releases, complimentary ticket flow, fee calculation (integer cents, dynamic currency)

### Epic 4: Buyer Purchase Flow & Ticket Delivery
Buyers complete the full purchase journey: deep link → event page → ticket selection → guest checkout → MercadoPago payment → confirmation → email with unique QR codes. Cart preserved on payment failure.
**FRs covered:** FR-PU-01, FR-PU-02, FR-PU-03, FR-PU-04, FR-PU-05, FR-PU-06, FR-PU-07, FR-PU-09, FR-TK-03
**Includes:** Mobile-first checkout (480px max-width), MercadoPago Checkout Pro/Bricks, Inngest email pipeline, Resend + react-email, QR generation, confirmation page, refund capability

### Epic 5: RRPP Attribution & Promoter Tracking
Producers generate unique tracking URLs per promoter, purchases are attributed in real time, and per-RRPP performance is visible in the dashboard.
**FRs covered:** FR-RR-01, FR-RR-02, FR-RR-03

### Epic 6: Real-Time Dashboard & Analytics
Producers see live sales data, 5 KPI cards with trends (including Balance), RRPP rankings, check-in monitoring, and customer database — all updating via 30s polling.
**FRs covered:** FR-AN-01, FR-AN-03, FR-AN-04, FR-EV-06
**Includes:** KPI cards, sales charts, RRPP ranking, check-in data, customer database (accessible from Ventas), 30s polling refresh with in-place CSS transitions

### Epic 7: Ticket Validation & Online-First Scanning _(Descoped from offline capability 2026-03-19)_
Door operators validate tickets via QR scanning PWA with full-screen color feedback, online-first validation with connection status indicator, and complete audit trail.
**FRs covered:** FR-VA-01, FR-VA-02, FR-VA-03, FR-VA-04, FR-VA-05, FR-VA-06
**Includes:** PWA (Serwist), QR scanner (html5-qrcode), connection status indicator ("Sin conexión" banner), scan audit, Level 4 environmental feedback. ~~IndexedDB cache, offline sync (first-scan-wins)~~ descoped.

### Epic 8: Post-Event Settlement & Event Cancellation
Post-event settlement reports with full financial breakdown. Event cancellation triggers refund processing via MercadoPago and buyer notification emails.
**FRs covered:** FR-AN-02, FR-EV-05
**Includes:** Settlement report (tickets, revenue, fees, net earnings), refund processing, cancellation email template

### Epic 9: Boletería & Financial Management
Producers sell tickets at the door via POS (cash/transfer), track expenses by category, and see real-time profitability (balance = revenue - expenses) at general and per-event levels.
**FRs covered:** UX-DR-07, UX-DR-08 (no formal FRs — identified gap from PRD)
**Includes:** Boletería POS interface, expense CRUD with categories, unified Finanzas view (Balance + Gastos + Liquidaciones), role-based permissions for POS staff

### Epic 10: Admin & Support Tools
Ticktu admin panel with platform-wide order lookup, ticket reissuance (new QR, invalidate old), and producer management — fully isolated from producer/buyer experience.
**FRs covered:** FR-AD-01, FR-AD-02, FR-AD-03

---

## Epic 1: Producer Onboarding & Branded Platform

Ticktu admin can create producer tenants with branding, subdomains, and credentials. Producers log in and see their branded dashboard. Complete data isolation enforced at application and database level.

### Story 1.1: Project Initialization & Subdomain Routing

As a **Ticktu developer**,
I want the project scaffolded with the full tech stack and subdomain-based tenant routing configured,
So that all future development builds on a solid, multi-tenant foundation.

**Acceptance Criteria:**

**Given** no existing codebase
**When** the initialization commands are executed (`create-next-app`, `shadcn init`, Supabase/Drizzle/Serwist/Inngest installs)
**Then** the project runs with `npm run dev`, TypeScript strict mode enabled, Turbopack active, and all dependencies resolve without errors

**Given** the project structure
**When** reviewing the folder layout
**Then** route groups `(buyer)`, `(dashboard)`, `(admin)`, `(validation)` exist with placeholder layouts, and `proxy.ts` is configured at `src/proxy.ts`

**Given** the project configuration
**When** reviewing `next.config.ts`
**Then** `cacheComponents: true` is set, and Serwist plugin is configured

**Given** the project root
**When** reviewing `.env.example`
**Then** it documents all required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `SENTRY_DSN`, and `NEXT_PUBLIC_APP_DOMAIN`

**Given** a running Next.js application
**When** a request arrives at `{producer-slug}.localhost:3000`
**Then** `proxy.ts` (running on **Node.js runtime**, not Edge) extracts the subdomain, resolves it to a tenant context, and injects `tenantId` into the request

**Given** the shared infrastructure utilities
**When** reviewing the project scaffolding
**Then** the following foundational modules exist: `lib/errors/app-error.ts` (typed `AppError` class with `code`, `message`, `fieldErrors` for Server Action error handling), `lib/hooks/use-polling.ts` (reusable `usePolling(fetcher, intervalMs)` hook for 30s dashboard refresh pattern), and `lib/utils/dates.ts` (`formatDate`, `formatDateTime`, `formatRelative` wrappers around `Intl.DateTimeFormat` with `es-UY` locale default)

**Given** a request to `admin.localhost:3000`
**When** `proxy.ts` processes the request
**Then** it routes to the `(admin)` surface without tenant resolution

**Given** a request to a non-existent subdomain
**When** `proxy.ts` cannot resolve the tenant
**Then** it returns a 404 response

---

### Story 1.2: Producer Schema & Data Isolation

As a **Ticktu platform operator**,
I want producer data stored with strict tenant isolation at both application and database levels,
So that Producer A can never access Producer B's data under any circumstances.

**Acceptance Criteria:**

**Given** the Drizzle ORM is configured
**When** the `producers` table schema is defined
**Then** it includes: `id` (uuid PK), `tenantId` (uuid, unique), `slug` (unique, for subdomain), `name`, `logoUrl`, `primaryColor`, `accentColor`, `heroImageUrl`, `heroTagline`, `aboutText`, `socialLinks` (jsonb), `config` (jsonb — `{ heroVisible: boolean, socialVisible: boolean, aboutVisible: boolean }`), `currency` (default `'UYU'`), `feePercentage` (integer), `feeFixed` (integer, cents), `isActive` (boolean), `createdAt`, `updatedAt` — all with snake_case DB columns mapped to camelCase TS via Drizzle

**Given** the `producers` table exists in Supabase
**When** RLS policies are applied
**Then** a policy enforces `auth.jwt()->>'tenant_id' = tenant_id` on SELECT, UPDATE, and DELETE operations

**Given** two producers exist (Producer A and Producer B)
**When** a query runs with Producer A's `tenantId` via app-level query function
**Then** only Producer A's data is returned — Producer B's data is never visible
**And** every query function in `lib/db/queries/producers.ts` takes `tenantId` as first parameter for tenant-scoped queries

**Given** a user with Producer A's JWT (containing `tenant_id = A`)
**When** they manually craft a direct database query targeting Producer B's `tenant_id`
**Then** RLS blocks the query and returns zero rows — independent of application code

**Given** the query function `getProducerBySlug(slug)`
**When** called with a valid slug
**Then** it returns the matching producer or null

**Given** the test suite running against local Supabase (`supabase start`)
**When** the cross-tenant isolation tests execute
**Then** they verify: (1) app-level queries with Producer A context cannot read/update/delete Producer B records, and (2) RLS independently blocks direct queries with wrong JWT tenant_id

**Given** the migration files
**When** `drizzle-kit push` executes
**Then** the `producers` table is created with all constraints and indexes (including `idx_producers_tenant_id` and `idx_producers_slug`)

---

### Story 1.3: Authentication & Authorization

As a **producer admin and Ticktu super admin**,
I want to log in with role-appropriate access scoped to my tenant or platform,
So that each user type accesses only what they're authorized to see.

**Acceptance Criteria:**

**Given** Supabase Auth is configured
**When** a producer admin logs in with email/password at `{producer}.ticktu.com/login`
**Then** a JWT is issued with custom claims: `tenant_id` (matching the producer's tenant) and `role: 'producer_admin'`

**Given** Supabase Auth is configured
**When** a Ticktu super admin logs in at `admin.ticktu.com/login`
**Then** a JWT is issued with `role: 'super_admin'` and no `tenant_id` constraint

**Given** a producer admin is authenticated
**When** they attempt to access a route in the `(dashboard)` group
**Then** `proxy.ts` verifies the JWT `tenant_id` matches the subdomain's tenant and allows access

**Given** a producer admin is authenticated
**When** they attempt to access a route in the `(admin)` group (either UI routes or API routes)
**Then** access is denied with 403 — separate auth boundary enforced at both UI redirect and API response level

**Given** a super admin is authenticated
**When** they attempt to access the `(admin)` routes
**Then** access is granted with platform-wide scope

**Given** an unauthenticated user
**When** they access any `(dashboard)` or `(admin)` route
**Then** they are redirected to the appropriate login page

**Given** a login page at `(dashboard)/login`
**When** the user enters valid credentials
**Then** they are authenticated via Supabase Auth and redirected to the dashboard home

**Given** the Supabase client configuration
**When** reviewing `lib/supabase/server.ts`, `lib/supabase/client.ts`, and `lib/supabase/proxy.ts`
**Then** server-side client uses cookies-based session, and proxy.ts handles session refresh

---

### Story 1.4: Producer Branding System

As a **buyer visiting a producer's site**,
I want to see the producer's brand identity (colors, logo, imagery),
So that I feel I'm on the producer's own platform, not a generic ticketing site.

**Acceptance Criteria:**

**Given** a producer with configured branding (primaryColor, accentColor, logoUrl)
**When** a buyer visits `{producer}.ticktu.com`
**Then** CSS variables `--producer-primary`, `--producer-accent`, `--producer-background` are injected into `:root` from the producer's stored configuration

**Given** the White-Label Theme Provider component exists at `components/shared/theme-provider.tsx`
**When** it loads on any `(buyer)` route
**Then** it detects the subdomain, fetches producer tokens (cached via `"use cache"` with tag `tenant-{slug}`), and applies them as CSS variables

**Given** two different producers (Odisea and Neon)
**When** buyers visit `odisea.ticktu.com` and `neon.ticktu.com`
**Then** each site displays different colors, logo, and branding — visually distinct

**Given** the `(dashboard)` routes
**When** a producer admin accesses their dashboard
**Then** the Ticktu base theme is applied (not the producer's brand theme) — dashboard uses Ticktu's own visual identity

**Given** the producer branding is updated in the database
**When** the cache is invalidated via `revalidateTag('tenant-{slug}', 'max')`
**Then** subsequent buyer visits see the updated branding

**Given** a producer with `config.heroVisible = false`
**When** a buyer visits the producer's site
**Then** the hero block is hidden, and the page displays gracefully without it (Level 2 configurable blocks from `producers.config` jsonb)

---

### Story 1.5: Producer Tenant Provisioning

As a **Ticktu super admin**,
I want to create a new producer tenant with branding, subdomain, and admin credentials,
So that producers can be onboarded onto the platform and start using their branded site.

**Acceptance Criteria:**

**Given** a super admin is logged in at the `(admin)` panel
**When** they navigate to `/tenants/new`
**Then** a form is displayed with fields: producer name, slug (subdomain), admin email, admin password, logo upload, primary color, accent color, hero image (optional), tagline (optional), about text (optional), social links (optional), landing page block toggles (hero, social, about), currency (default UYU), fee percentage, fee fixed amount

**Given** a super admin fills in the provisioning form with valid data including logo and hero image
**When** they submit the form
**Then** logo and hero image are uploaded to Supabase Storage, their CDN URLs are stored in `producers.logo_url` and `producers.hero_image_url`, a new producer record is created in the `producers` table, a Supabase Auth user is created with `tenant_id` and `role: 'producer_admin'` in custom claims, and a success toast confirms creation

**Given** the slug "odisea" is already taken by an existing producer
**When** a super admin tries to create a new producer with slug "odisea"
**Then** an inline validation error shows "This subdomain is already in use"

**Given** a producer "Neon Events" was just provisioned with slug "neon"
**When** the admin navigates to the tenant list at `/tenants`
**Then** "Neon Events" appears in the list with status, subdomain, and creation date

**Given** a newly provisioned producer "Neon Events"
**When** the producer admin logs in at `neon.ticktu.com/login` with their credentials
**Then** they see the `(dashboard)` home page with Ticktu base theme, their producer name in the header, and empty states inviting them to create their first event

**Given** a newly provisioned producer "Neon Events"
**When** a buyer visits `neon.ticktu.com`
**Then** they see the branded landing page with Neon's logo, colors (served via Supabase Storage CDN), and an empty event list with appropriate messaging

**Given** two provisioned producers (Odisea and Neon)
**When** the end-to-end test runs
**Then** it verifies: (1) admin creates producer → producer logs in → sees branded dashboard → buyer visits subdomain → sees branded landing, and (2) neither producer can see the other's data in their dashboard — cross-tenant isolation confirmed at E2E level

---

## Epic 2: Event Creation & Producer Storefront

Producers can create and manage events through their full lifecycle. Published events are visible on the producer's branded landing page with SEO/OG tags and configurable blocks.

### Story 2.1: Event Creation

As a **producer admin**,
I want to create events with name, date, venue, description, and imagery,
So that I can start setting up my upcoming events on my own branded platform.

**Acceptance Criteria:**

**Given** Drizzle ORM is configured and the `producers` table exists from Epic 1
**When** the `events` table schema is defined in `src/lib/db/schema/events.ts`
**Then** it includes: `id` (uuid PK), `tenantId` (uuid, NOT NULL, FK to producers.tenantId), `name` (text, NOT NULL), `slug` (text, NOT NULL), `date` (timestamp with time zone, NOT NULL), `venue` (text, NOT NULL), `description` (text), `imageUrl` (text), `status` (text, NOT NULL, default `'draft'`, enum: `draft | published | finished | archived | cancelled`), `createdAt` (timestamp, default now), `updatedAt` (timestamp, default now) — all with snake_case DB columns mapped to camelCase TS via Drizzle, with indexes `idx_events_tenant_id` and `idx_events_tenant_id_status`, and a unique constraint on `(tenant_id, slug)`

**Given** the `events` table exists in Supabase
**When** RLS policies are applied
**Then** a policy enforces `auth.jwt()->>'tenant_id' = tenant_id` on SELECT, INSERT, UPDATE, and DELETE operations

**Given** query functions exist in `src/lib/db/queries/events.ts`
**When** `getEventsByTenant(tenantId)` is called
**Then** it returns only events belonging to that tenant, ordered by date descending, and takes `tenantId` as first parameter

**Given** two producers exist (Producer A and Producer B) each with events
**When** the tenant isolation test runs against local Supabase
**Then** it verifies Producer A's queries never return Producer B's events, and RLS independently blocks direct queries with wrong JWT `tenant_id`

**Given** a producer admin is authenticated on their dashboard
**When** they navigate to `/events/new`
**Then** a form is displayed with fields: event name, slug (auto-generated from name, editable), date and time, venue, description (optional), event image upload (optional) — using react-hook-form + zod with lazy validation (on-blur) and specific human-readable error messages

**Given** a producer admin fills the event creation form with valid data including an image
**When** they submit the form
**Then** the image is uploaded to Supabase Storage, the `createEvent` Server Action executes the 5-step pipeline (auth → authorize → validate → execute → after), a new event record is created with status `draft` and the producer's `tenantId`, and a success toast (Sonner, Level 1) confirms creation and redirects to the event detail page

**Given** an unauthenticated user or a user from a different tenant
**When** they attempt to call the `createEvent` Server Action
**Then** the action returns `{ success: false, error: AppError }` with `statusCode: 401` or `403` — verified by an auth rejection test

**Given** the event creation form
**When** the producer submits with a slug that already exists for their tenant
**Then** an inline validation error (Level 2) shows "This event URL is already in use"

---

### Story 2.2: Event List & Dashboard Detail View

As a **producer admin**,
I want to see all my events organized by status and manage them from a detail view,
So that I can efficiently track and manage my event portfolio.

**Acceptance Criteria:**

**Given** a producer admin is authenticated on their dashboard
**When** they navigate to `/events`
**Then** the event list page displays with tabs: Activos, Borradores, Finalizados (matching UX-DR-25 fixed category tabs), showing event cards with image, name, date, venue, and a CTA to enter the event detail

**Given** the event list page is loaded
**When** a search term is entered in the search input above the list
**Then** results filter after 300ms debounce (UX-DR-25), matching by event name or venue

**Given** the shared `<EmptyState />` component at `components/shared/empty-state.tsx`
**When** it is rendered
**Then** it accepts a `variant` prop (`'first-use' | 'no-results' | 'error'`), an `icon` prop (optional ReactNode), a `title` prop (string), a `description` prop (optional string), and an `action` prop (optional `{ label: string, href?: string, onClick?: () => void }`) — the first-use variant uses a positive illustration/icon and encouraging tone, no-results shows a neutral search icon with "Clear search" action, and error shows a warning icon with retry action

**Given** a producer has no events yet
**When** they visit the `/events` page
**Then** a first-use `<EmptyState />` is displayed with a positive CTA: "Create your first event" leading to `/events/new` (UX-DR-15)

**Given** the event list is loading for the first time
**When** the page renders
**Then** skeleton placeholders matching the event card layout are shown (UX-DR-14), never a blank page or generic spinner

**Given** a producer admin clicks on an event in the list
**When** the event detail page at `/events/[eventId]` loads
**Then** it displays a tab structure in the main content area (UX-DR-06) with "General" and "Configuracion" tabs populated, and placeholder tabs for Ventas, RRPP, Cortesias, Check-ins, and Finanzas (to be implemented in later epics) — the sidebar does NOT change when entering an event

**Given** the "General" tab is active on the event detail page
**When** the producer views it
**Then** it shows the event's name, date, venue, description, image, current status as a Badge, and a quick metric summary area (placeholder for future sales data)

**Given** the "Configuracion" tab is active
**When** the producer edits event details and submits
**Then** the `updateEvent` Server Action validates and updates the event, a success toast confirms the change, and an auth rejection test verifies unauthorized users cannot update

**Given** two producers exist
**When** Producer A navigates to `/events`
**Then** only Producer A's events are returned — verified by a tenant isolation test

---

### Story 2.3: Producer Landing Page

As a **buyer visiting a producer's site**,
I want to see the producer's branded landing page with their upcoming events,
So that I can browse and choose which event to attend.

**Acceptance Criteria:**

**Given** a buyer visits `{producer}.ticktu.com`
**When** the landing page at `src/app/(buyer)/[slug]/page.tsx` renders
**Then** it uses the `"use cache"` directive with cache tag `tenant-{slug}`, and the page is served from cache on subsequent requests until invalidated

**Given** the landing page template renders
**When** the producer's configuration has `config.heroVisible = true`
**Then** the hero block displays with `producers.heroImageUrl` and `producers.heroTagline`

**Given** the landing page template renders
**When** the producer's configuration has `config.heroVisible = false`
**Then** the hero block is hidden and the page displays gracefully without it (Level 2 customization, UX-DR-03)

**Given** the landing page template renders
**When** the producer's configuration has `config.socialVisible = true` and `socialLinks` contains entries
**Then** the social media links block is displayed with the configured links

**Given** the landing page template renders
**When** the producer's configuration has `config.aboutVisible = true` and `aboutText` is populated
**Then** the about section block is displayed with the producer's text

**Given** a producer has published events
**When** the landing page renders the event list section
**Then** it shows only events with status `published` for that tenant, displayed as cards with image, name, date, venue, and a "Comprar" CTA linking to the event detail page

**Given** a producer has no published events
**When** a buyer visits the landing page
**Then** an appropriate empty state message is displayed (e.g., "No hay eventos proximos" — not an error, a neutral message)

**Given** the landing page is loading for the first time
**When** the page renders
**Then** skeleton placeholders matching the landing page layout are shown (UX-DR-14)

**Given** the landing page
**When** inspecting the HTML response
**Then** server-rendered meta tags include producer name, description, and Open Graph tags (`og:title`, `og:description`, `og:image`) using the producer's branding — so social media previews show the producer's brand, not Ticktu's

**Given** the page is cached and the producer's branding is later updated
**When** `revalidateTag('tenant-{slug}', 'max')` is called
**Then** subsequent visits serve the fresh content

**Given** the landing page on any screen size
**When** the buyer views the page
**Then** the content is rendered within a `max-width: 480px` centered container on desktop, preserving the mobile-first layout per UX-DR-10

**Given** the landing page header
**When** the page renders
**Then** it displays the producer's logo, and the footer shows "Powered by Ticktu" (minimal)

**Given** a request to a non-existent producer slug
**When** the landing page route resolves
**Then** a 404 page is returned

**Given** two producers exist (Producer A and Producer B)
**When** a buyer visits Producer A's landing page
**Then** only Producer A's published events are displayed — verified by a co-located tenant isolation test that confirms Producer B's events never appear

---

### Story 2.4: Public Event Detail Page

As a **buyer arriving from a social media deep link or the producer's landing page**,
I want to see full event details on a fast-loading, branded page,
So that I can decide whether to attend and proceed to purchase tickets.

**Acceptance Criteria:**

**Given** a buyer navigates to `{producer}.ticktu.com/events/{eventId}`
**When** the event detail page at `src/app/(buyer)/[slug]/events/[eventId]/page.tsx` renders
**Then** it uses the `"use cache"` directive with cache tag `event-{eventId}`, and the page is served from cache on subsequent requests until invalidated

**Given** the event detail page renders for a published event
**When** the buyer views the page
**Then** it displays: event name, date and time (formatted with `Intl.DateTimeFormat` and `es-UY` locale), venue, description, and event image — all within the producer's brand theme (CSS variables)

**Given** the event detail page
**When** inspecting the HTML response
**Then** server-rendered Open Graph tags include the event name, date, venue, description, and event image — enabling rich social media preview cards branded to the producer

**Given** a buyer arrives from an Instagram deep link
**When** the cached page loads
**Then** it loads from the edge in under 3 seconds on mobile 4G (NFR-PE-01), providing instant content while any client-fetched dynamic data (future: ticket availability) loads separately

**Given** the event detail page is loading for the first time
**When** the page renders
**Then** skeleton placeholders matching the event detail layout are shown (UX-DR-14)

**Given** a buyer navigates to an event that is not in `published` status (draft, finished, or archived)
**When** the page route resolves
**Then** a 404 page is returned — draft events must never be publicly visible

**Given** the buyer is on a desktop screen
**When** viewing the event detail page
**Then** the content is rendered within a `max-width: 480px` centered container, preserving the mobile-first layout per UX-DR-10

**Given** a buyer navigates to an event belonging to a different producer than the subdomain indicates
**When** the query executes
**Then** no event is returned and a 404 is shown — tenant isolation enforced even on public pages

**Given** the event detail page
**When** the producer later updates the event details and the `updateEvent` action calls `updateTag('event-{eventId}')`
**Then** subsequent visits see the fresh content immediately (read-your-writes via `updateTag`)

**Given** the event detail page before Epic 4 (ticket purchasing) is implemented
**When** the buyer views the page
**Then** no "Comprar" / "Buy" CTA is displayed — the page shows event information only. The purchase CTA is introduced by Story 4.1 when the ticket selection component is added

**Given** the event detail page
**When** the buyer wants to go back to the producer's landing page
**Then** a ghost variant "Back" button or the producer logo links back to the landing page — never relying on browser back navigation (UX-DR-24)

---

### Story 2.5: Event Lifecycle Transitions

As a **producer admin**,
I want to move events through their lifecycle (Draft → Published → Finished → Archived),
So that I can control when events are visible to buyers and close them after the event ends.

**Acceptance Criteria:**

**Given** an event exists in `draft` status
**When** the producer clicks "Publish" on the event detail page
**Then** an AlertDialog (Level 3, UX-DR-11) confirms the action: "Publishing will make this event visible to buyers on your site. Continue?", and on confirmation the `publishEvent` Server Action transitions the status to `published`

**Given** the `publishEvent` action executes successfully
**When** the `after()` side effect runs
**Then** it calls `revalidateTag('tenant-{slug}', 'max')` to invalidate the landing page cache and `updateTag('event-{eventId}')` to invalidate the event detail cache, ensuring buyers immediately see the newly published event

**Given** an event exists in `published` status
**When** the producer clicks "Finish Event" on the event detail page
**Then** an AlertDialog confirms: "Marking as finished will remove the event from your public site. Settlement will become available.", and on confirmation the `finishEvent` Server Action transitions the status to `finished`

**Given** the `finishEvent` action executes successfully
**When** the `after()` side effect runs
**Then** it calls `revalidateTag('tenant-{slug}', 'max')` to remove the event from the landing page, and `updateTag('event-{eventId}')` so the public event page returns 404

**Given** an event exists in `finished` status
**When** the producer clicks "Archive" on the event detail page
**Then** the `archiveEvent` Server Action transitions the status to `archived`

**Given** an event in any status
**When** an invalid state transition is attempted (e.g., `draft` → `finished`, `archived` → `published`)
**Then** the Server Action returns `{ success: false, error: AppError }` with code `INVALID_STATE_TRANSITION` and the event status remains unchanged

**Given** an unauthenticated user or a user from a different tenant
**When** they attempt to call `publishEvent`, `finishEvent`, or `archiveEvent`
**Then** the action returns `{ success: false, error: AppError }` with `statusCode: 401` or `403` — verified by auth rejection tests for each action

**Given** two producers exist with events
**When** Producer A attempts to transition Producer B's event
**Then** the action is rejected at both app-level (authorization check) and database-level (RLS) — verified by a tenant isolation test

**Given** the event detail page in the dashboard
**When** the producer views the event status
**Then** only valid next-state actions are shown as buttons (e.g., a draft event shows "Publish" but not "Archive"; a published event shows "Finish Event" but not "Publish")

**Given** a state transition completes successfully
**When** the producer sees the result
**Then** a success toast (Sonner, Level 1) confirms the action (e.g., "Event published successfully") and the event status Badge updates in place

---

## Epic 3: Ticket Configuration & Sales Setup

Producers define ticket types with pricing and capacity, create batch releases with scheduled activation, issue complimentary tickets, and configure service fees.

### Story 3.1: Ticket Type Management

As a **producer admin**,
I want to define multiple ticket types for my event with independent names, prices, and capacity limits,
So that I can offer different tiers (e.g., General, VIP) and control how many of each are available.

**Acceptance Criteria:**

**Given** the Drizzle ORM is configured and the `events` table exists from Epic 2
**When** the `ticket_types` table schema is defined
**Then** it includes: `id` (uuid PK), `tenantId` (uuid, not null), `eventId` (uuid FK to events, not null), `name` (text, not null), `description` (text, nullable), `price` (integer, not null, in cents), `maxCapacity` (integer, not null), `soldCount` (integer, default 0), `sortOrder` (integer, default 0), `isActive` (boolean, default true), `createdAt` (timestamp), `updatedAt` (timestamp) — all with snake_case DB columns mapped to camelCase TS via Drizzle, with indexes on `tenant_id` and `event_id`

**Given** a producer admin is authenticated and viewing their event's Configuracion tab
**When** they click "Add Ticket Type"
**Then** a Dialog (UX-DR-16) is displayed with fields: name, description (optional), price (in producer's currency), and max capacity

**Given** a producer admin fills in the ticket type form with valid data (name: "VIP", price: 5000, maxCapacity: 100)
**When** they submit the form
**Then** a new ticket type record is created with `tenantId` matching the producer's tenant, `price` stored as integer cents (5000 = $50.00 in producer currency), and a success toast confirms creation (Level 1 Sonner)

**Given** a producer admin has created multiple ticket types for an event
**When** they view the Configuracion tab
**Then** ticket types are listed with name, price (formatted via `Intl.NumberFormat` using `producer.currency`), capacity, sold count, and active status, with edit and deactivate actions

**Given** a producer admin edits an existing ticket type
**When** they change the price from 5000 to 6000 cents
**Then** the price is updated in the database and the updated value is displayed immediately, following the Server Action 5-step pipeline (auth, authorize, validate, execute, after)

**Given** a ticket type has sold tickets (soldCount > 0)
**When** the producer attempts to reduce maxCapacity below soldCount
**Then** an inline validation error is shown: "Capacity cannot be less than tickets already sold (X sold)"

**Given** two producers exist (Producer A and Producer B)
**When** Producer A queries ticket types via `getTicketTypesByEvent(tenantId, eventId)`
**Then** only ticket types belonging to Producer A's tenant are returned — Producer B's data is never visible, verified by a co-located tenant isolation test

**Given** an unauthenticated user or a user from a different tenant
**When** they attempt to call the `createTicketType` Server Action
**Then** the action returns a 401 or 403 error — verified by a co-located auth rejection test

---

### Story 3.2: Batch Releases with Scheduled Activation

As a **producer admin**,
I want to create batch releases for each ticket type with independent quantities and scheduled activation dates,
So that I can control when tickets become available for sale in phased releases.

**Acceptance Criteria:**

**Given** the `ticket_types` table exists from Story 3.1
**When** the `batches` table schema is defined
**Then** it includes: `id` (uuid PK), `tenantId` (uuid, not null), `ticketTypeId` (uuid FK to ticket_types, not null), `name` (text, not null, e.g., "Early Bird", "Second Release"), `quantity` (integer, not null), `soldCount` (integer, default 0), `activatesAt` (timestamp with time zone, not null), `isActive` (boolean, default true), `createdAt` (timestamp), `updatedAt` (timestamp) — with snake_case DB columns, indexes on `tenant_id` and `ticket_type_id`

**Given** a producer admin is viewing a ticket type in the Configuracion tab
**When** they click "Add Batch"
**Then** a Dialog is displayed with fields: batch name, quantity, and activation date/time

**Given** a producer admin creates a batch with quantity 50 and activatesAt set to a future date
**When** the batch is saved
**Then** the batch record is created in the database with `tenantId` matching the producer's tenant, and the batch appears in the list under its ticket type with status "Scheduled"

**Given** a ticket type has multiple batches
**When** the producer views the ticket type's batch list
**Then** batches are displayed with name, quantity, sold count, activation date (formatted via `Intl.DateTimeFormat` with `es-UY` locale), and status (Scheduled / Active / Sold Out)

**Given** a batch with `activatesAt` in the past and `soldCount < quantity`
**When** the query `getAvailableBatches(tenantId, ticketTypeId)` executes
**Then** the batch is included in the results (activation is determined at read-time by filtering `activates_at <= now()`)

**Given** a batch with `activatesAt` in the future
**When** the query `getAvailableBatches(tenantId, ticketTypeId)` executes
**Then** the batch is NOT included in the results — it is not yet available for sale

**Given** a batch with `soldCount` equal to `quantity`
**When** the batch list is displayed
**Then** the batch shows status "Sold Out" and is excluded from `getAvailableBatches`

**Given** the total quantity across all batches for a ticket type
**When** a producer creates a new batch that would cause total batch quantities to exceed the ticket type's `maxCapacity`
**Then** an inline validation error is shown: "Total batch quantity (X) would exceed ticket type capacity (Y)"

**Given** two producers exist
**When** Producer A queries batches via `getBatchesByTicketType(tenantId, ticketTypeId)`
**Then** only batches belonging to Producer A's tenant are returned — verified by a co-located tenant isolation test

**Given** an unauthenticated user or a user from a different tenant
**When** they attempt to call the `createBatch` Server Action
**Then** the action returns a 401 or 403 error — verified by a co-located auth rejection test

---

### Story 3.3: Complimentary Ticket Issuance

As a **producer admin**,
I want to issue complimentary (free) tickets to specific people with full tracking,
So that I can manage VIP lists and guest passes while maintaining accurate attendance records.

**Acceptance Criteria:**

**Given** the `ticket_types` table exists from Story 3.1
**When** the `tickets` table schema is defined in `lib/db/schema/tickets.ts`
**Then** it includes: `id` (uuid PK), `tenantId` (uuid, not null), `eventId` (uuid FK to events, not null), `ticketTypeId` (uuid FK to ticket_types, not null), `orderId` (uuid FK, nullable — null for complimentary), `orderItemId` (uuid FK, nullable — null for complimentary), `holderName` (text, not null), `holderEmail` (text, not null), `isComplimentary` (boolean, default false), `qrCode` (text, unique, nullable — populated by Epic 4 delivery pipeline), `qrHash` (text, unique, nullable — populated by Epic 4 delivery pipeline), `status` (text, default 'valid' — enum: `valid | used | cancelled | reissued`), `issuedBy` (uuid, nullable — user who issued if complimentary), `createdAt` (timestamp), `updatedAt` (timestamp) — all with snake_case DB columns mapped to camelCase TS via Drizzle, with RLS policy enforcing `tenant_id` isolation, indexes on `tenant_id`, `event_id`, `qr_hash`

**Given** a producer admin is viewing their event's Cortesias tab (UX-DR-06)
**When** the tab loads
**Then** it displays a list of all complimentary tickets issued for this event, showing holder name, holder email, ticket type, issue date (formatted via `Intl.DateTimeFormat`), status, and the name of the issuing admin

**Given** a producer admin clicks "Send Cortesia" on the Cortesias tab
**When** the Dialog opens (UX-DR-16, fewer than 5 fields)
**Then** the form displays: ticket type (select from active ticket types), holder name, and holder email

**Given** a producer admin fills in valid cortesia data and submits
**When** the `issueComplimentaryTicket` Server Action executes
**Then** a ticket record is created with `isComplimentary: true`, `orderId: null`, `issuedBy` set to the current admin's user ID, `price` is not charged, the ticket type's `soldCount` is incremented, a success toast confirms: "Cortesia issued to {holderName}", and an Inngest event `ticket/complimentary-issued` is dispatched with `{ ticketId, tenantId }` to trigger QR generation and email delivery to the holder (same pipeline as paid tickets but without payment info)

**Given** a ticket type has `soldCount` equal to `maxCapacity`
**When** a producer attempts to issue a complimentary ticket for that type
**Then** the action returns an error: "No capacity available for this ticket type"

**Given** the Cortesias tab shows issued tickets
**When** the list is empty (first use)
**Then** an `<EmptyState />` first-use variant is displayed with a positive CTA: "Issue your first complimentary ticket"

**Given** a producer admin has issued complimentary tickets
**When** they view the Cortesias tab summary
**Then** a count of total complimentary tickets issued is displayed, broken down by ticket type

**Given** two producers exist
**When** Producer A queries complimentary tickets via `getComplimentaryTickets(tenantId, eventId)`
**Then** only tickets belonging to Producer A's tenant are returned — verified by a co-located tenant isolation test

**Given** an unauthenticated user or a user from a different tenant
**When** they attempt to call the `issueComplimentaryTicket` Server Action
**Then** the action returns a 401 or 403 error — verified by a co-located auth rejection test

---

### Story 3.4: Service Fee Calculation and Preview

As a **producer admin**,
I want to see the service fee that will be added to my ticket prices before buyers purchase,
So that I understand the total cost buyers will pay and can set prices accordingly.

**Acceptance Criteria:**

**Given** the producer's `feePercentage` and `feeFixed` fields exist on the `producers` table (from Epic 1) and the producer's `currency` field is set
**When** the `calculateServiceFee(priceCents, feePercentage, feeFixedCents)` utility function is called
**Then** it returns the fee as integer cents, calculated as `Math.max(Math.round(priceCents * feePercentage / 100), feeFixedCents)` — the higher of percentage-based or fixed fee, with no floating-point arithmetic on the final result

**Given** a ticket price of 2500 cents, feePercentage of 10, and feeFixed of 150 cents
**When** `calculateServiceFee` is called
**Then** it returns 250 cents (percentage = 250, fixed = 150, max = 250) — verified by a unit test

**Given** a ticket price of 1000 cents, feePercentage of 10, and feeFixed of 150 cents
**When** `calculateServiceFee` is called
**Then** it returns 150 cents (percentage = 100, fixed = 150, max = 150) — verified by a unit test

**Given** a ticket price of 0 cents (complimentary ticket scenario)
**When** `calculateServiceFee` is called
**Then** it returns 0 cents — no fee on free tickets, verified by a unit test

**Given** the `formatMoney(cents, currency)` utility function exists in `src/lib/utils/money.ts`
**When** called with (2500, 'UYU')
**Then** it returns a formatted string using `Intl.NumberFormat('es', { style: 'currency', currency })` — never hardcoding 'UYU', always using the producer's dynamic currency

**Given** a producer admin is viewing or editing a ticket type in the Configuracion tab (from Story 3.1)
**When** the ticket price field has a value
**Then** an inline fee preview is displayed below the price field showing: "Buyer pays: {price + fee} ({price} + {fee} service fee)" formatted in the producer's currency

**Given** the producer's currency is 'ARS' and the ticket price is 5000 cents
**When** the fee preview renders
**Then** all amounts are formatted in ARS using `Intl.NumberFormat` — no hardcoded currency symbols, dynamic currency from producer config

**Given** the fee calculation and formatting utilities
**When** the test suite runs
**Then** all unit tests pass covering: percentage-based fee wins, fixed fee wins, zero price, edge case of 1 cent price, large prices, and all three supported currencies (UYU, ARS, USD)

---

## Epic 4: Buyer Purchase Flow & Ticket Delivery

Buyers complete the full purchase journey: deep link → event page → ticket selection → guest checkout → MercadoPago payment → confirmation → email with unique QR codes. Cart preserved on payment failure.

### Story 4.1: Event Page Ticket Selection & Purchase Initiation

As a **buyer**,
I want to select ticket types and quantities from an event page with real-time pricing and fee breakdown,
So that I can clearly understand what I'm purchasing before proceeding to checkout.

**Acceptance Criteria:**

**Given** a published event with active ticket types and available batches (created in Epic 3)
**When** a buyer visits the event page at `/{slug}/events/{eventId}`
**Then** the page displays event details (name, date, venue, description, image) and each available ticket type with name, price (formatted in producer's currency via `Intl.NumberFormat`), and remaining availability fetched live via client component

**Given** the event page on any screen size
**When** the buyer views the ticket selection area
**Then** a custom `TicketQuantitySelector` component (`[-] [number] [+]` built with shadcn Button + Input) is rendered per ticket type, with minimum 0, maximum capped by remaining availability, and 44px minimum touch targets (UX-DR-20, UX-DR-23)

**Given** the buyer has selected one or more tickets (total quantity >= 1)
**When** the selection changes
**Then** a sticky bottom bar displays the subtotal, service fee (calculated as `max(feeFixed, Math.round(subtotal * feePercentage / 100))` using producer's fee config, integer cents), and total — all updating instantly without network requests

**Given** the buyer is on a desktop screen
**When** viewing the event page and ticket selection
**Then** the purchase flow container is centered with `max-width: 480px`, preserving the mobile-first layout per UX-DR-10

**Given** the buyer arrives via a deep link from social media (Instagram, TikTok)
**When** the page loads
**Then** the page renders with producer branding (via White-Label Theme Provider from Epic 1), no login requirement (FR-PU-01), and loads from edge cache (`"use cache"`) for event details with client-fetched availability (FR-PU-02)

**Given** a ticket type with zero remaining availability
**When** the buyer views that ticket type
**Then** it displays as "Agotado" (sold out), the quantity selector is disabled, and the type is visually de-emphasized

**Given** the buyer has selected tickets and taps the primary CTA
**When** the "Continuar" button is tapped
**Then** the buyer is navigated to the checkout page at `/{slug}/events/{eventId}/checkout` with selected ticket data preserved (via URL search params or client state)

**Given** the `TicketQuantitySelector` component
**When** running the co-located test suite
**Then** tests verify: increment/decrement behavior, minimum 0 boundary, maximum availability cap, disabled state for sold-out types, and correct fee calculation for various price and fee configuration combinations

**Given** two producers exist (Producer A and Producer B) with different events
**When** a buyer loads the event page for Producer A's event
**Then** only Producer A's ticket types and availability are returned — verified by a co-located tenant isolation test that confirms Producer B's ticket data is never included

---

### Story 4.2: Guest Checkout, Order Creation & MercadoPago Payment

As a **buyer**,
I want to enter ticket holder details, review my order, and pay via MercadoPago without creating an account,
So that I can complete my purchase quickly and securely.

**Acceptance Criteria:**

**Given** the buyer navigates to the checkout page with ticket selections
**When** the checkout page loads
**Then** it displays a 3-step visual indicator (`1. Tickets → 2. Datos → 3. Pago`) that is visual only, not clickable backwards (UX-DR-10), and the checkout flow is rendered within a `max-width: 480px` centered container

**Given** the buyer is on the "Datos" step
**When** they view the form
**Then** for each ticket selected, a labeled block ("Ticket 1: General", "Ticket 2: VIP") is displayed with "Nombre completo" and "Email" fields, labels above inputs (never placeholder-as-label), with zod validation via react-hook-form: lazy validation on-blur, eager re-validation on-change after first error (UX-DR-13)

**Given** the buyer has filled in all holder details and proceeds to the summary step
**When** the order summary is displayed
**Then** it shows: each ticket type with quantity and unit price, subtotal, service fee (labeled clearly), and total — all in the producer's currency, money as integer cents formatted via `Intl.NumberFormat`

**Given** the buyer taps "Pagar ${total}" (full-width primary button fixed to bottom, showing amount per UX-DR-12)
**When** the payment is initiated
**Then** a Server Action creates an `orders` record (status: `pending`, `tenant_id`, buyer email, total in cents) and `order_items` records (one per ticket holder, with `ticket_type_id`, quantity, unit_price, fee_amount), creates a MercadoPago Checkout Pro preference via `lib/payments/mercadopago-client.ts` with `external_reference: orderId` and callback URLs (success, failure, pending), and redirects the buyer to MercadoPago's checkout

**Given** the DB schema for orders
**When** reviewing the `orders` table definition in `lib/db/schema/orders.ts`
**Then** it includes: `id` (uuid PK), `tenant_id` (uuid, NOT NULL, FK to producers.tenantId), `event_id` (uuid, FK), `buyer_name`, `buyer_email`, `status` (enum: `pending`, `paid`, `payment_failed`, `refunded`, `cancelled`), `payment_method` (text, NOT NULL, enum: `mercadopago | cash | transfer`), `total_amount` (integer, cents), `fee_amount` (integer, cents), `currency`, `mercadopago_preference_id` (nullable), `mercadopago_payment_id` (nullable), `refund_status` (text, nullable, enum: `pending | completed | failed`), `email_status` (text, nullable, enum: `pending | sent | failed`), `rrpp_link_id` (nullable, FK to rrpp_links), `created_at`, `updated_at` — with RLS policy enforcing `tenant_id` isolation

**Given** the DB schema for order items
**When** reviewing the `order_items` table definition
**Then** it includes: `id` (uuid PK), `tenant_id` (uuid, NOT NULL, FK to producers.tenantId), `order_id` (uuid, FK), `ticket_type_id` (uuid, FK), `quantity` (integer), `unit_price` (integer, cents), `fee_amount` (integer, cents), `holder_name`, `holder_email` — one row per ticket holder (not per ticket type), with RLS policy enforcing `tenant_id` isolation

**Given** the payment abstraction layer
**When** reviewing `lib/payments/types.ts`
**Then** it defines a `PaymentAdapter` interface with `createPreference({ orderId, items, callbackUrls })` and `processRefund({ paymentId, amount })`, and `lib/payments/mercadopago-client.ts` implements this interface — enabling Epic 9 (Boleteria) to add a cash/transfer adapter without changing order creation logic

**Given** a MercadoPago payment failure (card declined, insufficient funds)
**When** MercadoPago redirects the buyer back to the failure callback URL
**Then** the checkout page loads with the existing `orderId` from URL params, pre-fills all previously entered data from the pending order record, displays a clear inline error message ("El pago fue rechazado. Intentá con otro medio de pago."), and allows the buyer to retry payment without re-entering any data (FR-PU-05)

**Given** the orders query functions in `lib/db/queries/orders.ts`
**When** running the co-located test suite against local Supabase
**Then** tests verify: (1) tenant isolation — orders for Tenant A are not visible to Tenant B queries, (2) RLS independently blocks direct queries with wrong JWT tenant_id, and (3) `getOrderById(tenantId, orderId)` returns the correct order with items

**Given** a ticket type batch with 1 remaining ticket
**When** two concurrent order creation requests arrive simultaneously
**Then** exactly one succeeds and the other receives a clear "Tickets agotados" error — enforced by atomic `UPDATE ticket_types SET sold_count = sold_count + :quantity WHERE id = :id AND sold_count + :quantity <= max_capacity RETURNING id` within the Server Action transaction

**Given** the buyer submits the checkout form with validation errors
**When** the form is re-displayed with inline errors
**Then** focus is automatically moved to the first errored field and the viewport scrolls to make it visible (UX-DR-13)

**Given** the checkout Server Action
**When** running the co-located test suite
**Then** tests verify: (1) order creation with valid data succeeds and returns preference URL, (2) invalid form data (missing name, invalid email) returns field-level AppError, (3) request without tenant context is rejected, (4) concurrent purchases for the last ticket — only one order succeeds

---

### Story 4.3: Payment Webhook & Order Confirmation Page

As a **buyer**,
I want to see a branded confirmation page with my order details after successful payment,
So that I know my purchase was completed and I can expect my tickets via email.

**Acceptance Criteria:**

**Given** MercadoPago sends an IPN (Instant Payment Notification) webhook to `app/api/webhooks/mercadopago/route.ts`
**When** the webhook payload indicates a successful payment
**Then** the Route Handler validates the webhook signature (MercadoPago verification), retrieves the `orderId` from `external_reference`, updates the order status from `pending` to `paid`, stores `mercadopago_payment_id` on the order, and dispatches an Inngest event `inngest.send({ name: "order/completed", data: { orderId } })`

**Given** a webhook handler that has already processed an order (order status is `paid`)
**When** MercadoPago sends a duplicate IPN for the same payment
**Then** the handler detects the order is already `paid`, skips all processing, returns HTTP 200 (idempotent) — no duplicate Inngest events dispatched, no duplicate state changes

**Given** the buyer is redirected back from MercadoPago after successful payment
**When** the confirmation page at `/{slug}/events/{eventId}/confirmation?orderId={id}` loads
**Then** it displays: producer branding (logo, colors), order summary (event name, date, venue, ticket types with quantities, holder names, total paid with fee breakdown), and a prominent message "¡Compra exitosa! Revisá tu email para recibir tus entradas con código QR"

**Given** the confirmation page on any screen size
**When** the buyer views the page
**Then** the content is rendered within a `max-width: 480px` centered container on desktop, preserving the mobile-first layout per UX-DR-10

**Given** the confirmation page
**When** the buyer views the page
**Then** the page is styled within the producer's brand theme, includes a "Ver más eventos" link back to the producer landing page (natural upsell), and displays the buyer's email where tickets will be sent

**Given** the confirmation page URL contains an `orderId`
**When** the order does not belong to the current tenant (subdomain mismatch) or does not exist
**Then** a 404 is returned — cross-tenant order access is prevented

**Given** the webhook Route Handler
**When** receiving a request without valid MercadoPago signature
**Then** it returns HTTP 401 and does not modify any data

**Given** an order in `pending` status for more than 10 minutes
**When** the Inngest cron function `order/reconcile` runs (every 5 minutes via `lib/inngest/functions/reconcile-orders.ts`)
**Then** it queries all `pending` orders older than 10 minutes, calls MercadoPago API by `mercadopago_preference_id` to check payment status, transitions confirmed payments to `paid` (dispatching `order/completed` event), and marks expired/rejected payments as `payment_failed`

**Given** the webhook Route Handler
**When** running the co-located test suite
**Then** tests verify: (1) valid IPN → order updated to `paid` + Inngest event dispatched, (2) duplicate IPN → idempotent response with no side effects, (3) invalid signature → 401 rejection, (4) unknown `external_reference` → 404 response, (5) tenant isolation — webhook cannot update orders belonging to a different tenant, (6) reconciliation cron transitions stale `pending` orders correctly

---

### Story 4.4: QR Code Generation & Ticket Email Delivery

As a **buyer**,
I want to receive an email with unique QR codes for each ticket within 60 seconds of payment,
So that I have my tickets ready for event entry.

**Acceptance Criteria:**

**Given** the Inngest event `order/completed` is dispatched (from Story 4.3)
**When** the Inngest function `send-ticket-emails` in `lib/inngest/functions/send-ticket-emails.ts` picks up the event
**Then** it executes the following pipeline as Inngest steps: (1) create individual `tickets` records in the DB (one per ticket holder from `order_items`), (2) generate a cryptographically unique QR code per ticket via `lib/qr/generate.ts`, (3) render the email template via react-email with producer branding, (4) send the email via Resend to the buyer's email address

**Given** the `tickets` table already exists from Story 3.3 (with `qrCode` and `qrHash` as nullable)
**When** the Inngest function creates ticket records for a paid order
**Then** it sets `orderId`, `orderItemId`, `holderName`, `holderEmail`, `isComplimentary: false`, generates and populates `qrCode` and `qrHash` (making them non-null for paid tickets), and sets `status: 'valid'` — the table's canonical schema is defined in Story 3.3

**Given** the QR generation function in `lib/qr/generate.ts`
**When** generating a QR code for a ticket
**Then** it produces a cryptographically unique, non-guessable identifier using `crypto.randomUUID()` combined with an HMAC-SHA256 signature (using a server-side secret), and the QR payload contains only the signed hash — never the ticket ID or any internal identifiers (FR-TK-03, NFR-SE-03)

**Given** a multi-ticket purchase (e.g., 2 General + 1 VIP)
**When** the email is rendered
**Then** a single email is sent to the buyer's email containing all ticket QR codes, each labeled with holder name, ticket type, and event details — using the producer's brand colors and logo in the react-email template (UX-DR-09)

**Given** the Inngest function encounters a failure at any step (DB error, QR generation failure, Resend API error)
**When** the step fails
**Then** Inngest automatically retries up to 3 times with backoff, and the function is idempotent — re-running a step does not create duplicate tickets or send duplicate emails (checks for existing tickets before creating)

**Given** the email delivery pipeline
**When** measuring end-to-end latency from payment confirmation to email sent
**Then** the total time is under 60 seconds under normal conditions (FR-PU-06, NFR-PE-03)

**Given** the QR generation function
**When** running the co-located test suite
**Then** tests verify: (1) 1000 generated QR codes have zero collisions, (2) QR hash is verifiable with the correct server secret, (3) QR hash is NOT verifiable with a different secret, (4) QR payload does not contain raw ticket ID

**Given** the tickets query functions in `lib/db/queries/tickets.ts`
**When** running the co-located test suite against local Supabase
**Then** tests verify: (1) tenant isolation — tickets for Tenant A are not visible to Tenant B, (2) `getTicketByQrHash(qrHash)` returns the correct ticket with event and type details, (3) RLS independently blocks cross-tenant access

**Given** the Inngest function `send-ticket-emails`
**When** running the co-located test suite (Inngest test mode, synchronous execution)
**Then** tests verify: (1) ticket records are created in DB with valid QR codes, (2) email send function is called with correct recipient, subject, and branded template, (3) idempotent re-execution does not create duplicate tickets, (4) all QR codes in a single order are unique

---

### Story 4.5: Refund Processing via MercadoPago

As a **Ticktu support operator**,
I want to process refunds through MercadoPago for cancelled events or support cases,
So that buyers receive their money back and ticket records are properly invalidated.

**Acceptance Criteria:**

**Given** a Ticktu super admin is authenticated at the `(admin)` panel
**When** they navigate to the order detail for a `paid` order
**Then** a "Procesar Reembolso" button (destructive variant) is visible

**Given** the super admin clicks "Procesar Reembolso"
**When** the AlertDialog confirmation appears (UX-DR-11 Level 3)
**Then** it displays the order total, buyer email, event name, and the warning "This will refund ${amount} to the buyer via MercadoPago. This action cannot be undone."

**Given** the super admin confirms the refund
**When** the refund Server Action executes
**Then** it follows the 5-step pipeline: (1) authenticate — verify super_admin role, (2) authorize — verify the action is allowed, (3) validate — verify order is in `paid` status, (4) execute — call MercadoPago refund API via `PaymentAdapter.processRefund({ paymentId, amount })`, update order status to `refunded`, update all associated ticket records to status `cancelled`, (5) after() — log refund event for audit

**Given** an order that is already in `refunded` status
**When** a super admin attempts to refund it again
**Then** the action returns an AppError `{ code: "ORDER_ALREADY_REFUNDED", message: "This order has already been refunded", statusCode: 400 }` and no MercadoPago API call is made

**Given** the MercadoPago refund API returns an error (e.g., network failure, insufficient merchant balance)
**When** the refund fails
**Then** the order status remains `paid` (not changed to `refunded`), an AppError is returned with the specific failure reason, and the admin sees an inline error message

**Given** a successfully refunded order with 3 associated tickets
**When** querying those tickets
**Then** all 3 tickets have status `cancelled` and will be rejected if scanned at the validation app (returns "Ticket cancelado")

**Given** the refund Server Action
**When** running the co-located test suite
**Then** tests verify: (1) non-super-admin role is rejected with 403, (2) refund of `paid` order succeeds and updates order + ticket statuses, (3) refund of already-refunded order returns `ORDER_ALREADY_REFUNDED`, (4) MercadoPago API failure leaves order status unchanged, (5) tenant isolation — refund action validates order exists (no cross-tenant refund possible through admin)

---

## Epic 5: RRPP Attribution & Promoter Tracking

Producers generate unique tracking URLs per promoter, purchases are attributed in real time, and per-RRPP performance is visible in the dashboard.

### Story 5.1: RRPP Promoter Management & Tracking Link Generation

As a **producer admin**,
I want to manage my promoter (RRPP) roster and generate unique tracking URLs per promoter per event,
So that I can distribute personalized links to each promoter for sales attribution.

**Acceptance Criteria:**

**Given** the Drizzle ORM is configured
**When** the `rrpp_promoters` table schema is defined
**Then** it includes: `id` (uuid PK), `tenantId` (uuid, not null), `name` (text, not null), `phone` (text, nullable), `email` (text, nullable), `isActive` (boolean, default true), `createdAt` (timestamp), `updatedAt` (timestamp) — all with snake_case DB columns mapped to camelCase TS via Drizzle, with indexes on `tenant_id` and a unique constraint on `(tenant_id, name)`

**Given** the Drizzle ORM is configured
**When** the `rrpp_links` table schema is defined
**Then** it includes: `id` (uuid PK), `tenantId` (uuid, not null), `eventId` (uuid FK to events, not null), `promoterId` (uuid FK to rrpp_promoters, not null), `code` (text, unique, not null — short URL-safe string), `isActive` (boolean, default true), `createdAt` (timestamp) — with indexes on `tenant_id`, `event_id`, `code`, and a unique constraint on `(event_id, promoter_id)`

**Given** RLS policies are applied to `rrpp_promoters` and `rrpp_links`
**When** a query runs with Producer A's JWT
**Then** only Producer A's promoters and links are returned — Producer B's data is never visible

**Given** a producer admin is authenticated and on the RRPP sidebar section
**When** they click "Add Promoter"
**Then** a Dialog opens with fields for name (required), phone (optional), email (optional), and on submit the promoter is created within their tenant with a success toast

**Given** the RRPP sidebar section is loading for the first time
**When** the page renders
**Then** skeleton placeholders matching the promoter table layout are shown (UX-DR-14)

**Given** the RRPP sidebar section
**When** the producer views their promoter list
**Then** promoters are displayed in a searchable table (UX-DR-25: search input with 300ms debounce) showing name, phone, email, active status, and number of assigned links, with the ability to activate/deactivate and edit each promoter

**Given** a producer has no promoters yet
**When** they visit the RRPP section
**Then** a first-use `<EmptyState />` is displayed with a positive CTA: "Add your first promoter" (UX-DR-15)

**Given** a producer admin is on the event detail RRPP tab
**When** they click "Generate Link" and select an active promoter
**Then** a unique `rrpp_link` is created with a cryptographically random URL-safe `code`, and the full tracking URL (`{producer}.ticktu.com/events/{eventId}?ref={code}`) is displayed with a "Copy" button that copies to clipboard with a success toast

**Given** a promoter already has a link for a specific event
**When** the producer tries to generate another link for the same promoter and event
**Then** an inline validation error shows "This promoter already has a link for this event"

**Given** an active RRPP link
**When** the producer deactivates it
**Then** the link's `isActive` is set to false, and purchases through that URL will no longer be attributed to the promoter (the event page still loads normally)

**Given** the test suite running against local Supabase
**When** cross-tenant isolation tests execute for `rrpp_promoters` and `rrpp_links` queries
**Then** they verify: (1) app-level queries with Producer A context cannot read/update/delete Producer B's promoters or links, and (2) RLS independently blocks direct queries with wrong JWT tenant_id

**Given** the test suite
**When** auth rejection tests execute for RRPP Server Actions (`createPromoter`, `updatePromoter`, `generateRRPPLink`, `deactivateRRPPLink`)
**Then** unauthenticated requests are rejected with 401, and requests from a different tenant are rejected with 403

---

### Story 5.2: Purchase Attribution via RRPP Tracking Links

As a **producer admin**,
I want purchases made through RRPP tracking links to be automatically attributed to the corresponding promoter in real time,
So that I know exactly which promoter drove each sale.

**Acceptance Criteria:**

**Given** the `orders` table already includes `rrpp_link_id` (nullable uuid FK to `rrpp_links`) as defined in Story 4.2
**When** Story 5.2 implements attribution logic
**Then** no additional migration is needed — the column already exists

**Given** a buyer clicks an RRPP tracking URL (`{producer}.ticktu.com/events/{eventId}?ref={code}`)
**When** the event page loads
**Then** the `ref` parameter is captured and persisted in a cookie (`rrpp_ref`) scoped to the producer's subdomain, with a 7-day expiry

**Given** a buyer has an `rrpp_ref` cookie set
**When** they proceed through the checkout flow and reach the order creation step
**Then** the `ref` code is resolved to an `rrpp_link_id` via database lookup, and the `rrpp_link_id` is included in the order creation payload

**Given** a buyer completes payment via MercadoPago
**When** the IPN webhook processes the successful payment and creates/confirms the order
**Then** the `rrpp_link_id` is persisted on the order record, and the attribution is immediately queryable for dashboard display

**Given** a buyer clicks promoter A's link and then later clicks promoter B's link before purchasing
**When** the second link is clicked
**Then** the `rrpp_ref` cookie is overwritten with promoter B's code (last-click attribution wins)

**Given** a buyer clicks an RRPP link with a `ref` code that does not exist in the database or belongs to a deactivated link
**When** the event page loads
**Then** the event page renders normally, the invalid `ref` is silently ignored, no `rrpp_ref` cookie is set, and the purchase proceeds without attribution

**Given** a buyer navigates directly to the event page without any `ref` parameter
**When** they complete a purchase
**Then** the order is created with `rrpp_link_id` as null — no attribution, no errors

**Given** the `ref` code in the cookie
**When** it is included in the MercadoPago preference `external_reference` metadata
**Then** the webhook handler can retrieve the attribution even if the cookie is lost during the redirect flow

**Given** the test suite
**When** attribution tests execute
**Then** they verify: (1) valid ref code results in correct `rrpp_link_id` on order, (2) invalid/deactivated ref code results in null attribution, (3) last-click wins when multiple refs are set, (4) direct purchase without ref has null attribution, (5) tenant isolation — a ref code from Producer A's link cannot be used to attribute an order on Producer B's tenant

---

### Story 5.3: Per-RRPP Sales Performance Dashboard

As a **producer admin**,
I want to see each promoter's sales performance — tickets sold and revenue attributed — in both the RRPP sidebar section and the event detail RRPP tab,
So that I can evaluate promoter effectiveness and make data-driven decisions about my promoter roster.

**Acceptance Criteria:**

**Given** the RRPP performance page is loading for the first time
**When** the page renders
**Then** skeleton placeholders matching the performance table layout are shown (UX-DR-14)

**Given** a producer admin navigates to the RRPP sidebar section
**When** the page loads
**Then** a performance summary table is displayed showing each promoter's name, total tickets sold (across all events), total revenue attributed (in producer's currency, integer cents formatted via `Intl.NumberFormat`), number of active links, and active/inactive status, sorted by tickets sold descending

**Given** the RRPP sidebar section performance table
**When** the producer uses the search input
**Then** the table filters by promoter name with 300ms debounce (UX-DR-25), and if no results match, the `<EmptyState>` no-results variant is displayed with a "Clear search" CTA

**Given** a producer admin navigates to the event detail RRPP tab (UX-DR-06)
**When** the tab loads
**Then** a per-promoter performance table is displayed showing: promoter name, tickets sold for this event, revenue attributed for this event (formatted in producer's currency), and the tracking link with a copy button — filtered to only this event's RRPP links

**Given** the event detail RRPP tab
**When** the event has no RRPP links generated yet
**Then** the `<EmptyState>` first-use variant is displayed with text "Generate tracking links for your promoters" and a primary CTA "Generate Link" that opens the link generation flow from Story 5.1

**Given** the RRPP performance data
**When** the dashboard polls for updates (30s polling cycle)
**Then** the performance numbers update in-place with CSS transitions (200ms ease) — no skeleton, no flash, no component re-mount

**Given** a promoter with attributed orders
**When** the revenue is calculated
**Then** it reflects the sum of ticket face value (integer cents) from all orders attributed to that promoter's links, using the producer's configured currency for display

**Given** the query functions for RRPP performance (`getRRPPPerformanceByTenant`, `getRRPPPerformanceByEvent`)
**When** they execute
**Then** `tenantId` is the first parameter, and only data belonging to the authenticated producer's tenant is returned

**Given** the test suite running against local Supabase
**When** cross-tenant isolation tests execute for RRPP performance queries
**Then** they verify: (1) Producer A's queries return zero rows of Producer B's RRPP data, (2) RLS independently blocks direct queries with wrong JWT tenant_id

**Given** the test suite
**When** performance calculation tests execute
**Then** they verify: (1) tickets sold count matches orders with `rrpp_link_id` pointing to the promoter's links, (2) revenue sum matches the sum of order amounts (integer cents) for attributed orders, (3) a promoter with no attributed sales shows 0 tickets and 0 revenue (not null or missing)

---

## Epic 6: Real-Time Dashboard & Analytics

Producers see live sales data, 5 KPI cards with trends (including Balance), RRPP rankings, check-in monitoring, and customer database — all updating via 30s polling.

### Story 6.1: Dashboard KPI Cards with Real-Time Polling

As a **producer admin**,
I want to see five key performance indicators on my dashboard home page that update automatically every 30 seconds,
So that I can monitor my business health at a glance without manually refreshing.

**Acceptance Criteria:**

**Given** a producer admin is authenticated and navigates to the dashboard home page
**When** the page loads
**Then** five KPI cards are displayed: Tickets Vendidos (count), Ingresos (revenue in producer currency), Gastos (expenses in producer currency), Balance (Ingresos minus Gastos, green if positive, red if negative), and Eventos Activos (count of published events)

**Given** the expenses table does not yet exist (Epic 9 not implemented)
**When** the Gastos and Balance KPIs are computed
**Then** the query gracefully returns 0 for expenses (table-not-found or empty result), Balance equals Ingresos, and both cards display correctly — this is expected behavior, not a bug

**Given** the dashboard home page is loaded
**When** the initial data is being fetched
**Then** skeleton loading states matching the exact shape of KPI cards, chart area, and table area are displayed per UX-DR-14

**Given** the dashboard home page has loaded with data
**When** 30 seconds elapse
**Then** the KPI values are re-fetched and updated in-place using CSS transitions (200ms ease) with no skeleton re-appearance and no visible flicker

**Given** each KPI card displays a value
**When** the date range is "last 30 days" (default)
**Then** each card also shows a percentage trend comparing the current period to the previous equivalent period, with up/down arrows

**Given** the dashboard includes a date range selector defaulting to "Ultimos 30 dias"
**When** the producer changes the date range
**Then** all KPI cards update to reflect the selected period and their trend percentages recalculate accordingly

**Given** the KPI container in the DOM
**When** inspecting the HTML
**Then** the container uses `aria-live="polite"` so screen readers announce value changes

**Given** the aggregate queries in `lib/db/queries/analytics.ts`
**When** each query function is called
**Then** it takes `tenantId` as the first parameter and returns data scoped exclusively to that tenant

**Given** two producers exist (Producer A and Producer B) with different order data
**When** Producer A views their dashboard
**Then** KPI values reflect only Producer A's data, and a co-located tenant isolation test in `analytics.test.ts` verifies Producer B's data is never included

**Given** an unauthenticated user
**When** they attempt to access the dashboard data endpoint
**Then** the request is rejected with 401, and a co-located test verifies auth rejection

**Given** a producer with zero events and zero sales
**When** they view the dashboard
**Then** KPI cards show zero values and the page displays appropriate empty state messaging per UX-DR-15

---

### Story 6.2: Sales Chart & Recent Sales Table

As a **producer admin**,
I want to see a sales-over-time chart and a recent sales table on my dashboard,
So that I can visualize sales trends and quickly review the latest transactions.

**Acceptance Criteria:**

**Given** a producer admin is on the dashboard home page
**When** sales data exists for the selected date range
**Then** an area chart (shadcn Charts / Recharts) displays sales volume over time, with the x-axis showing days (for 30-day range) or hours (for single-day range) and the y-axis showing ticket count or revenue

**Given** the sales chart is displayed
**When** the 30-second polling refresh occurs
**Then** the chart data updates in-place with smooth CSS transitions and no skeleton re-render, and the chart container uses `aria-live="polite"` so screen readers announce value changes

**Given** a producer admin is on the dashboard home page
**When** sales data exists
**Then** a "Ventas Recientes" table is displayed below the chart showing the most recent transactions with columns: date, buyer name, event, ticket type, quantity, amount (formatted with `Intl.NumberFormat` in producer currency), and status

**Given** the recent sales table on mobile (screen width < 768px)
**When** viewing the table
**Then** columns are prioritized (date, amount, status visible; others accessible via Sheet detail on tap) per UX-DR-22

**Given** the date range selector is changed
**When** the producer selects a different period
**Then** both the chart and the recent sales table update to reflect the new date range

**Given** a producer with no sales data
**When** they view the dashboard
**Then** the chart area and table area show an empty state with a first-use variant per UX-DR-15 encouraging event creation

**Given** the sales data queries
**When** executed
**Then** they take `tenantId` as first parameter and a co-located test verifies tenant isolation — Producer A's chart and table never include Producer B's transactions

**Given** an unauthenticated request to the sales data endpoint
**When** received
**Then** it is rejected with 401, verified by a co-located auth rejection test

**Given** the chart renders on the page
**When** it is displayed at full width on mobile
**Then** the chart is responsive, filling the available width per UX-DR-22

---

### Story 6.3: RRPP Performance Ranking

As a **producer admin**,
I want to see a ranked list of my RRPP promoters by sales performance on my dashboard,
So that I can quickly identify my top-performing promoters and make informed decisions about promoter relationships.

**Acceptance Criteria:**

**Given** a producer admin is on the dashboard home page
**When** RRPP-attributed sales exist for the selected date range
**Then** an "RRPP Ranking" section displays a ranked list showing each promoter's name, tickets sold count, and attributed revenue (formatted in producer currency), sorted by tickets sold descending

**Given** the RRPP ranking section
**When** the 30-second polling refresh occurs
**Then** the ranking values update in-place with CSS transitions (200ms ease) and no skeleton re-render, and the ranking container uses `aria-live="polite"` so screen readers announce value changes

**Given** a producer with no RRPP links or no RRPP-attributed sales
**When** they view the dashboard
**Then** the RRPP ranking section shows an empty state per UX-DR-15 with messaging appropriate to the situation (no promoters configured vs. no sales yet)

**Given** the RRPP ranking query in `lib/db/queries/analytics.ts`
**When** executed
**Then** it takes `tenantId` as first parameter and aggregates sales from orders joined to `rrpp_links`, and a co-located test verifies tenant isolation

**Given** an unauthenticated request to the RRPP ranking data
**When** received
**Then** it is rejected with 401, verified by a co-located auth rejection test

**Given** the date range selector is changed
**When** the producer selects a different period
**Then** the RRPP ranking recalculates for the selected period

**Given** the RRPP ranking on mobile
**When** the viewport is narrow
**Then** the ranking list adapts responsively, remaining readable with promoter name, ticket count, and revenue visible

---

### Story 6.4: Event Check-in Monitoring

As a **producer admin**,
I want to view live check-in data for a specific event including attendance count, ticket type breakdown, entry velocity, and recent scans,
So that I can monitor event access in real-time and understand attendance patterns.

**Acceptance Criteria:**

**Given** a producer admin navigates to an event's detail page and selects the "Check-ins" tab
**When** scan data exists for the event
**Then** the tab displays: a scanned/total counter with percentage, a breakdown by ticket type showing progress bars (scanned vs. total per type), a breakdown by accreditor (operator name and their scan count), an entry velocity chart (scans per hour as a time-series area chart), and a recent scans table (timestamp, ticket holder name, ticket type, accreditor name, result)

**Given** the Check-ins tab is displayed
**When** 30 seconds elapse
**Then** all check-in data refreshes in-place with CSS transitions (200ms ease) and no skeleton re-render, per UX-DR-14, and the check-in data container uses `aria-live="polite"` so screen readers announce value changes

**Given** the initial load of the Check-ins tab
**When** data is being fetched
**Then** skeleton loading states matching the layout shape are displayed

**Given** an event with zero check-ins
**When** the producer views the Check-ins tab
**Then** an empty state is shown per UX-DR-15, indicating no check-ins have occurred yet

**Given** an event with partial check-ins (e.g., 150 of 300 tickets scanned)
**When** the producer views the Check-ins tab
**Then** the scanned/total counter shows "150 / 300 (50%)" and ticket type progress bars reflect accurate per-type ratios

**Given** the entry velocity chart
**When** displaying scan data
**Then** peak entry time is visually identifiable on the chart, fulfilling FR-AN-04

**Given** the recent scans table on mobile
**When** the viewport is narrow
**Then** columns are prioritized (time, name, result visible) with full details accessible via Sheet on tap per UX-DR-22

**Given** the check-in queries
**When** executed
**Then** they take `tenantId` as first parameter and scope results to the specific event, and a co-located test verifies: (1) tenant isolation — Producer A cannot see Producer B's scan data, and (2) event isolation — scans from a different event within the same tenant are not included

**Given** an unauthenticated request to the check-in data endpoint
**When** received
**Then** it is rejected with 401, verified by a co-located auth rejection test

---

### Story 6.5: Customer Database

As a **producer admin**,
I want to access a searchable customer database showing all buyers and their purchase history,
So that I can understand my audience and leverage customer data for future events.

**Acceptance Criteria:**

**Given** a producer admin navigates to the Ventas section in the sidebar
**When** the page loads
**Then** a "Ver todos los clientes" link is visible, leading to the customer database page at `(dashboard)/customers`

**Given** a producer admin is on the customer database page
**When** order data exists
**Then** a table displays unique customers (deduplicated by email) with columns: name, email, total purchases (count of orders), total spent (formatted in producer currency via `Intl.NumberFormat`), and last purchase date (formatted via `Intl.DateTimeFormat` with `es-UY` locale)

**Given** the customer database table
**When** the producer types in the search input
**Then** results are filtered by name or email with a 300ms debounce per UX-DR-25

**Given** the customer database table on mobile
**When** the viewport is narrow
**Then** columns are prioritized (name, email visible) with full details accessible via Sheet on tap per UX-DR-22

**Given** a producer with no sales (no buyers)
**When** they view the customer database
**Then** an empty state is displayed per UX-DR-15 with first-use variant messaging

**Given** the customer query (in `lib/db/queries/customers.ts` or `analytics.ts`)
**When** executed
**Then** it takes `tenantId` as first parameter, aggregates buyer data from orders grouped by `buyer_email`, and a co-located tenant isolation test verifies Producer A sees only their own customers

**Given** an unauthenticated request to the customer data
**When** received
**Then** it is rejected with 401, verified by a co-located auth rejection test

**Given** a buyer who has made multiple purchases across different events for the same producer
**When** the producer views the customer database
**Then** that buyer appears as a single row with aggregated totals across all their purchases

**Given** the customer database page
**When** data loads initially
**Then** skeleton loading states matching the table shape are displayed per UX-DR-14

---

## Epic 7: Ticket Validation & Online-First Scanning _(Descoped from offline capability 2026-03-19)_

Door operators validate tickets via QR scanning PWA with full-screen color feedback, online-first validation with connection status indicator, and complete audit trail.

### Story 7.1: Validation App Entry & PWA Shell

As a **door operator**,
I want to open the validation app, enter an event code and my name, and be ready to scan tickets,
So that I can quickly set up for door operations without creating an account.

**Acceptance Criteria:**

**Given** the validation app route group `(validation)` exists
**When** reviewing the PWA configuration
**Then** `public/manifest.json` contains validation app metadata (name, icons, display: standalone, theme-color), `sw.ts` is the Serwist service worker entry point, and `(validation)/layout.tsx` includes PWA meta tags and a minimal offline-ready layout

**Given** a door operator navigates to the validation app URL
**When** the entry page loads
**Then** a form is displayed with two fields: event access code and operator name, with a single primary button "Ingresar"

**Given** a door operator enters a valid event access code and their name
**When** they submit the form
**Then** the app authenticates via a POST to `/api/validation/auth` Route Handler, receives an event session (event name, event ID, tenant ID), and navigates to the scanner screen showing the event name and operator name in a minimal header

**Given** a door operator enters an invalid or expired event access code
**When** they submit the form
**Then** an inline error displays "Invalid access code" and the form is preserved for retry

**Given** a door operator is on the scanner screen
**When** the camera permission prompt appears
**Then** the reusable `<QRScanner />` component at `components/validation/qr-scanner.tsx` (wrapping `html5-qrcode`) requests camera access, and if granted, displays the camera viewfinder centered on screen with states: loading camera, scanning (ready). This component accepts `onScan(qrHash: string)` callback and is reused across Stories 7.2 and 7.3

**Given** a door operator denies camera permission
**When** the scanner cannot access the camera
**Then** a clear error message is displayed explaining that camera access is required for scanning, with instructions to enable it in browser settings

**Given** the Drizzle schema for the `event_access_codes` table
**When** the migration runs
**Then** the table includes: `id` (uuid PK), `tenant_id` (uuid, NOT NULL, FK to producers.tenantId), `event_id` (uuid, NOT NULL, FK to events.id), `code` (text, NOT NULL, unique per event), `expires_at` (timestamp with time zone, nullable), `is_active` (boolean, default true), `created_at` — with RLS policy enforcing `tenant_id` isolation and indexes on `event_id` and `code`

**Given** a producer is on the event Configuración tab
**When** they click "Generar código de acceso"
**Then** a new unique 6-character alphanumeric code is generated and inserted into `event_access_codes`, displayed to the producer with a copy button, and listed in a table showing all active/expired codes for that event with the ability to deactivate any code

**Given** the validation auth Route Handler at `/api/validation/auth`
**When** it receives a valid event code
**Then** it looks up the code in `event_access_codes` where `is_active = true` and (`expires_at IS NULL` or `expires_at > now()`), resolves the event and tenant, returns event session data, and does NOT use Supabase Auth (access code authentication only)

**Given** the test suite
**When** auth rejection tests run
**Then** invalid event codes return 401, expired codes return 401, deactivated codes return 401, and a valid code for one event cannot access another event's data

---

### Story 7.2: Online QR Validation with Result Feedback

As a **door operator**,
I want to scan a ticket QR code and instantly see whether it is valid, invalid, or already used with clear color feedback,
So that I can process the entry line quickly and catch fraudulent or duplicate tickets.

**Acceptance Criteria:**

**Given** the Drizzle schema for the `scans` table
**When** the migration runs
**Then** the table includes: `id` (uuid PK), `tenant_id` (uuid, NOT NULL), `event_id` (uuid, NOT NULL), `ticket_id` (uuid, nullable), `qr_hash` (text, NOT NULL), `status` (enum: valid, invalid, duplicate, conflict), `operator_name` (text, NOT NULL), `device_id` (text, NOT NULL), `scanned_at` (timestamp with time zone, NOT NULL — device timestamp), `synced_at` (timestamp with time zone, nullable), `conflict_reason` (text, nullable), `created_at` — with indexes on `tenant_id`, `event_id`, and `qr_hash`

**Given** the operator has an active scanner with an online connection
**When** the `html5-qrcode` scanner reads a QR code
**Then** a POST request is sent to `/api/validation/scan` with the QR hash, operator name, device ID, and device timestamp, and the result is displayed in under 2 seconds (FR-VA-02, NFR-PE-02)

**Given** a valid, unused ticket QR is scanned online
**When** the server validates the QR hash against the `tickets` table
**Then** a scan record is inserted into the `scans` table with status `valid`, the ticket is marked as used, and the reusable `<ScanResultOverlay />` component at `components/validation/scan-result-overlay.tsx` displays: full-screen green background, checkmark icon, "VALID" text, ticket holder name and ticket type, with device vibration (short pulse), auto-dismissing after 2 seconds (UX-DR-19, UX-DR-11 Level 4). This component accepts `{ status, holderName?, ticketType?, reason? }` props and is reused for all scan result states

**Given** a QR code that has already been scanned (ticket marked as used)
**When** the operator scans it again
**Then** a scan record is inserted with status `duplicate`, and the result popup displays: red accent, X icon, "INVALID" text with reason "Ya fue usado", with device vibration (double pulse), auto-dismissing after 2 seconds (FR-VA-03)

**Given** a QR code that does not match any ticket for the current event
**When** the operator scans it
**Then** a scan record is inserted with status `invalid`, and the result popup displays: red accent, X icon, "INVALID" text with reason "No encontrado", with device vibration (double pulse), auto-dismissing after 2 seconds

**Given** the scanner screen
**When** the operator taps the history button
**Then** a scrollable list of recent scans is displayed showing: scanned count / total tickets, and per-scan: timestamp, ticket holder name, ticket type, and result (valid/invalid/duplicate) with color coding

**Given** the scan result popup has auto-dismissed
**When** the operator is ready for the next scan
**Then** the camera viewfinder is immediately active with zero buttons required between scans (UX-DR-17 zero-button scanning interface)

**Given** the `/api/validation/scan` Route Handler
**When** it processes a scan
**Then** it validates the event session, resolves the tenant from the event, uses the Supabase service role client to insert into the `scans` table (bypassing RLS since validation app does not use Supabase Auth), and every scan record includes operator_name, scanned_at (device timestamp), and device_id (FR-VA-06)

**Given** the test suite for the scan Route Handler
**When** tenant isolation tests run
**Then** a scan request with event code A cannot write scan records to event B's tenant, and unauthorized requests (no valid event session) are rejected with 401

---

### Story 7.3: Connection Status Indicator _(Descoped to online-first 2026-03-19 — was "Offline Cache & Offline Scanning")_

As a **door operator**,
I want to see a clear indicator when I lose internet so I know scanning is temporarily unavailable,
So that I understand why scans are not working and can wait for the connection to return.

**Acceptance Criteria:**

**Given** the app is online and the scanner is active
**When** connectivity is monitored
**Then** no connection status indicator is visible — the scanner operates normally via online validation (Story 7.2)

**Given** the app loses internet connectivity
**When** the offline state is detected (via `navigator.onLine` and/or failed fetch)
**Then** a "Sin conexión" banner is displayed prominently in the scanner view, the QR scanner is disabled (camera may remain active but scans are not processed), and the operator understands they must wait for connection to return

**Given** the "Sin conexión" banner is displayed
**When** internet connectivity is restored
**Then** the banner disappears automatically, the scanner resumes normal online operation, and no manual action is required from the operator

**Given** the connection status detection logic
**When** reviewing the implementation
**Then** it uses a combination of `navigator.onLine` event listeners and periodic health-check pings to `/api/validation/scan` (or a lightweight health endpoint) to detect connectivity state reliably

**Note (Descoped to online-first 2026-03-19):** The previous design included IndexedDB manifest cache, offline scanning against local cache, offline scan queue, and Serwist runtime caching for the manifest endpoint. These have been descoped. No IndexedDB, no offline scanning, no `/api/validation/manifest` endpoint needed. The only offline UX is the "Sin conexión" banner. Full offline capability may be reconsidered as a future enhancement.

---

### Story 7.4: Resume Scanning on Reconnect _(Descoped to online-first 2026-03-19 — was "Automatic Sync on Reconnect")_

As a **door operator**,
I want to seamlessly resume scanning when internet returns after a disconnection,
So that I can get back to processing the entry line as quickly as possible.

**Acceptance Criteria:**

**Given** the app was showing the "Sin conexión" banner (Story 7.3)
**When** internet connectivity is restored (detected via `navigator.onLine` event and/or successful health-check ping)
**Then** the "Sin conexión" banner disappears automatically, the scanner resumes normal online validation mode (Story 7.2), and no manual action or page reload is required from the operator

**Given** the app reconnects after a brief disconnection
**When** the operator scans a QR code
**Then** the scan is processed online via POST to `/api/validation/scan` exactly as in Story 7.2 — there is no pending queue, no sync process, no cached data to reconcile

**Note (Descoped to online-first 2026-03-19):** The previous design included an IndexedDB offline scan queue, Background Sync via Serwist service worker, first-scan-wins conflict resolution (`lib/validation/sync.ts`, `lib/validation/conflict-resolver.ts`), and queue replay logic. These have been descoped. No offline scans are recorded, so there is nothing to sync on reconnect. The operator simply resumes scanning. Full offline sync capability may be reconsidered as a future enhancement.

---

## Epic 8: Post-Event Settlement & Event Cancellation

Post-event settlement reports with full financial breakdown. Event cancellation triggers refund processing via MercadoPago and buyer notification emails.

### Story 8.1: Post-Event Settlement Report

As a **producer admin**,
I want to view a settlement report for my finished events showing tickets sold, gross revenue, fees collected, and net earnings,
So that I have a complete financial picture of each event's performance.

**Acceptance Criteria:**

**Given** a producer admin is authenticated and has an event with status `finished`
**When** they navigate to the event detail Finanzas tab
**Then** a settlement report is displayed showing: total tickets sold (broken down by ticket type), total complimentary tickets issued, gross revenue (sum of all paid ticket face values in integer cents), total service fees collected, and net producer earnings (gross revenue minus fees) — all formatted using the producer's configured currency via `Intl.NumberFormat`

**Given** a finished event with mixed ticket types (e.g., 150 General at $3,000 cents and 50 VIP at $5,000 cents, plus 10 complimentary)
**When** the settlement report renders
**Then** the per-ticket-type breakdown shows: ticket type name, quantity sold, quantity complimentary, unit price, subtotal revenue, and subtotal fees — and the totals match the sum of all line items exactly (no floating-point rounding errors, all calculations in integer cents)

**Given** a query function `getEventSettlement(tenantId, eventId)` in `lib/db/queries/analytics.ts`
**When** called with Producer A's tenantId
**Then** it returns settlement data only for Producer A's event — calling with Producer B's tenantId for the same eventId returns null or empty

**Given** a producer admin with an event in status `draft` or `published`
**When** they navigate to that event's settlement route
**Then** an informational empty state is shown indicating settlement is available after the event is marked as finished, using the `<EmptyState />` first-use variant with a clear message

**Given** a producer admin with an event in status `cancelled`
**When** they navigate to that event's settlement route
**Then** an informational state is shown indicating the event was cancelled and no settlement applies (zero earnings)

**Given** the settlement report page
**When** it initially loads
**Then** a Skeleton loading state matching the report layout is shown, and the data loads via a Server Component with Suspense boundary

**Given** an unauthenticated request to the settlement data endpoint
**When** received
**Then** it is rejected with 401, verified by a co-located auth rejection test

**Given** a different tenant's producer admin
**When** they attempt to call the `getEventSettlement` query or access the settlement route for another tenant's event
**Then** the query returns no data (app-level tenantId filtering) and RLS independently blocks access — verified by co-located tenant isolation tests in `analytics.test.ts`

---

### Story 8.2: Event Cancellation with Refund Processing & Buyer Notification

As a **producer admin**,
I want to cancel an event so that all paid ticket buyers receive refunds via MercadoPago and all affected buyers (including complimentary ticket holders) are notified by email,
So that cancellations are handled professionally and buyers are informed promptly.

**Acceptance Criteria:**

**Given** a producer admin viewing an event with status `published` or `finished`
**When** they click the "Cancel Event" destructive action button
**Then** a Level 3 AlertDialog is displayed with the message explaining consequences: the event name, the number of paid tickets that will be refunded, the number of buyers who will be notified, and a warning that this action cannot be undone — following UX-DR-11 and UX-DR-16 patterns

**Given** the producer admin confirms cancellation in the AlertDialog
**When** the `cancelEvent` Server Action executes in `lib/actions/events.ts`
**Then** it follows the 5-step pipeline: (1) authenticates the session, (2) authorizes that the user belongs to the event's tenant, (3) validates the event status is `published` or `finished`, (4) updates the event status to `cancelled` and sets `refund_status` to `'pending'` on all paid orders for this event, (5) dispatches an Inngest event `event/cancelled` with `{ eventId, tenantId }` via `after()`

**Given** an event with status `draft`, `cancelled`, or `archived`
**When** a producer admin attempts to cancel it
**Then** the cancel action is not available (button disabled or hidden) and the Server Action returns a validation error if called directly

**Given** an unauthenticated user or a producer admin from a different tenant
**When** they attempt to call the `cancelEvent` Server Action
**Then** it returns an auth or authorization error respectively — verified by co-located auth rejection tests in `events.test.ts`

**Given** the Inngest function `process-event-cancellation` at `lib/inngest/functions/process-event-cancellation.ts` receives the `event/cancelled` event
**When** it processes the cancellation
**Then** it fetches all orders with `refund_status: 'pending'` for the event, calls the MercadoPago refund API individually for each paid order (not as a single batch), updates each order's `refund_status` to `'completed'` on success or `'failed'` after exhausting retries (3 retries per order), and then sends cancellation notification emails to all unique buyers (both paid and complimentary)

**Given** a MercadoPago refund API call fails for a specific order after all retries
**When** the Inngest function processes that failure
**Then** the order's `refund_status` is set to `'failed'`, the remaining orders continue processing independently (no rollback of the entire cancellation), and the failed refund is visible for manual resolution by Ticktu admin

**Given** a buyer who purchased 3 tickets in a single order for a cancelled event
**When** the cancellation email is sent
**Then** they receive one email (not three) using the `event-cancelled.tsx` react-email template, branded with the producer's logo and colors, containing: the event name, the original event date, a refund notice explaining the expected timeline (5-30 business days depending on payment method), and all affected ticket details

**Given** a buyer who received complimentary tickets for a cancelled event
**When** the cancellation email is sent
**Then** they receive the cancellation notification email (without refund information, since no payment was made) informing them the event has been cancelled

**Given** the cancellation has been confirmed
**When** the producer admin views the event in their dashboard
**Then** the event shows status `cancelled` with a visual badge, the event is no longer visible on the producer's public buyer-facing site, and the event detail shows a summary of refund processing status (X completed, Y pending, Z failed)

---

## Epic 9: Boletería & Financial Management

Producers sell tickets at the door via POS (cash/transfer), track expenses by category, and see real-time profitability (balance = revenue - expenses) at general and per-event levels.

### Story 9.1: Sell Tickets at the Door via POS

As a **producer admin**,
I want to sell tickets at the door using a POS interface that supports cash and transfer payments,
So that I can capture walk-up sales without requiring buyers to go through the online checkout.

**Acceptance Criteria:**

**Given** the Boleteria page is loading for the first time
**When** the page renders
**Then** skeleton placeholders matching the POS form layout are shown (UX-DR-14)

**Given** a producer admin is authenticated and navigates to the Boleteria sidebar section
**When** the page loads
**Then** an event selector dropdown is displayed showing all published events for this tenant, a ticket type radio group, a quantity selector ([-] [number] [+] component), buyer data fields (name, email), payment method radio (Efectivo / Transferencia), a total display in the producer's currency, and a "Confirmar Venta" primary button

**Given** the producer admin selects an event in the Boleteria POS
**When** the event is selected
**Then** the ticket type radio group updates to show only ticket types for that event with current availability (remaining capacity), and the event stays selected across multiple sales

**Given** the producer admin fills in all required fields (event, ticket type, quantity, buyer name, buyer email, payment method)
**When** they click "Confirmar Venta"
**Then** an order is created via the existing `createOrder` abstraction with `paymentMethod: 'cash' | 'transfer'` (bypassing MercadoPago), tickets are generated with unique QR codes, the Inngest email pipeline is triggered to deliver tickets to the buyer's email, a success toast confirms "Venta registrada", and the form resets but keeps the selected event

**Given** a POS sale is completed
**When** the page renders below the form
**Then** a "Ultimas ventas de boleteria" table displays recent POS sales for the selected event showing: buyer name, ticket type, quantity, amount, payment method, and timestamp

**Given** no POS sales exist for the selected event
**When** the sales table area renders
**Then** a first-use `<EmptyState />` is displayed with messaging "No hay ventas de boleteria para este evento" (UX-DR-15)

**Given** the selected ticket type has zero remaining capacity
**When** the producer admin attempts to select a quantity
**Then** the ticket type shows "Agotado" and the quantity selector is disabled for that type

**Given** the producer admin submits the POS form with invalid data (missing name, invalid email, quantity exceeding capacity)
**When** validation runs (react-hook-form + zod, lazy validation on blur, eager re-validation on change after first error)
**Then** specific inline errors are displayed per field (e.g., "Ingresa el nombre del comprador", "Ingresa un email valido"), and the first error field is auto-focused

**Given** a user with a different tenant's JWT
**When** they attempt to access the Boleteria page or submit a POS sale
**Then** the request is rejected and no data from the current tenant is exposed

**Given** the test suite runs
**When** POS sale tests execute
**Then** they verify: (1) order is created with correct payment_method and amount_cents, (2) tickets are generated with QR codes, (3) tenant isolation prevents cross-tenant POS access, (4) auth rejection for unauthenticated users

---

### Story 9.2: Track Expenses by Category

As a **producer admin**,
I want to record and manage expenses with categories optionally linked to events,
So that I can track my costs and understand my profitability.

**Acceptance Criteria:**

**Given** the Drizzle ORM is configured
**When** the `expenses` table schema is defined
**Then** it includes: `id` (uuid PK), `tenant_id` (uuid, not null), `event_id` (uuid, nullable FK to events, for event-specific expenses), `category` (enum: `'venue' | 'djs' | 'security' | 'marketing' | 'staff' | 'production' | 'other'`), `description` (text, not null), `amount_cents` (integer, not null), `currency` (text, not null, from producer config), `expense_date` (date, not null), `created_at`, `updated_at` — all with snake_case DB columns mapped to camelCase TS via Drizzle, with indexes on `tenant_id` and `event_id`

**Given** the `expenses` table exists in Supabase
**When** RLS policies are applied
**Then** a policy enforces `auth.jwt()->>'tenant_id' = tenant_id` on SELECT, INSERT, UPDATE, and DELETE operations

**Given** a producer admin is on the Finanzas page or an event detail Finanzas tab
**When** they click "+ Agregar Gasto"
**Then** a Dialog opens (per UX-DR-16, fewer than 5 fields) with fields: description, category (select from enum), amount (currency input), event (optional select from tenant's events), date (date picker defaulting to today)

**Given** a producer admin fills the expense form with valid data
**When** they submit the form
**Then** the expense is created with `tenant_id` from the authenticated user's JWT, `amount_cents` stored as integer cents, `currency` from the producer's config, a success toast confirms "Gasto agregado", and the Dialog closes

**Given** a producer admin views the expense list
**When** the list renders
**Then** it displays a table with columns: description, category, event name (or "General" if no event), amount formatted with `Intl.NumberFormat` and producer currency, and date

**Given** a producer admin clicks edit on an existing expense
**When** the Dialog opens pre-filled
**Then** they can update any field and save, with a success toast "Gasto actualizado"

**Given** a producer admin clicks delete on an existing expense
**When** they confirm in an AlertDialog (per UX-DR-16, destructive action: "Eliminar este gasto? Esta accion no se puede deshacer.")
**Then** the expense is deleted and a success toast confirms "Gasto eliminado"

**Given** two producers exist (Producer A and Producer B)
**When** expense queries run with Producer A's `tenantId`
**Then** only Producer A's expenses are returned, and the test suite verifies cross-tenant isolation at both app-level and RLS level

**Given** the test suite runs
**When** expense action tests execute
**Then** they verify: (1) auth rejection for unauthenticated users, (2) tenant isolation on all CRUD operations, (3) amount stored as integer cents, (4) nullable event_id works for general expenses

---

### Story 9.3: Unified Finanzas Page with Balance, Expenses, and Settlements

As a **producer admin**,
I want a single Finanzas page showing my balance, categorized expenses, and settlement history,
So that I can understand my overall financial health across all events at a glance.

**Acceptance Criteria:**

**Given** the Finanzas page is loading for the first time
**When** the page renders
**Then** skeleton placeholders matching the Balance cards, chart areas, and table layout are shown (UX-DR-14)

**Given** a producer admin navigates to the Finanzas sidebar section
**When** the page loads
**Then** it displays three sections on a single page: Balance, Gastos, and Liquidaciones (per UX-DR-08)

**Given** the Balance section renders
**When** orders and expenses exist for the tenant
**Then** a net balance card is displayed showing total revenue (sum of all order amounts for the tenant) minus total expenses (sum of all expense amounts for the tenant), colored green if positive or red if negative, with a balance breakdown per event as a bar chart (each bar = event revenue - event expenses), and a timeline chart showing Ingresos vs Gastos vs Balance over time

**Given** the Balance section renders
**When** there are zero expenses recorded
**Then** the balance equals total revenue and is displayed as positive (green), and the Gastos donut chart shows an empty state with CTA "+ Agregar Gasto"

**Given** the Gastos section renders
**When** expenses exist for the tenant
**Then** a category donut chart displays expense distribution (Venue, DJs, Security, Marketing, Staff, Production, Other), a recent expenses table shows description, event, amount, and date, and a filter-by-event dropdown allows scoping expenses to a specific event

**Given** the Liquidaciones section renders
**When** settlement reports exist from Epic 8
**Then** historical settlements are displayed per event with date and amount
**When** no settlements exist
**Then** an empty state is shown with appropriate messaging (per UX-DR-15, first-use variant)

**Given** the page uses 30-second polling for data refresh
**When** new sales or expenses are added
**Then** the Balance, charts, and tables update in-place with CSS transitions (no skeleton on refresh), and the Balance card and chart containers use `aria-live="polite"` so screen readers announce value changes

**Given** the Finanzas page on mobile (screen width < 768px)
**When** viewing the charts and tables
**Then** the bar chart, timeline chart, and donut chart stack vertically and fill available width, the expense table columns are prioritized (description, amount visible; others accessible via Sheet on tap), and all touch targets meet 44px minimum per UX-DR-22

**Given** the finance aggregate queries in `lib/db/queries/finances.ts`
**When** they compute balance for a tenant
**Then** they use `tenantId` as the first parameter, calculate revenue as SUM of order `amount_cents` and expenses as SUM of expense `amount_cents`, and return all values as integer cents

**Given** an unauthenticated request to the finance data endpoint
**When** received
**Then** it is rejected with 401, verified by a co-located auth rejection test

**Given** the test suite runs
**When** finance query tests execute
**Then** they verify: (1) balance = revenue - expenses with known test data, (2) zero expenses yields balance = revenue, (3) zero orders yields negative balance (expenses only), (4) tenant isolation on all aggregate queries, (5) per-event scoping returns only that event's data

---

### Story 9.4: Per-Event Financial Summary Tab

As a **producer admin**,
I want to see the financial summary (revenue, expenses, balance) for a specific event inside the event detail view,
So that I can evaluate each event's profitability independently and add event-specific expenses directly.

**Acceptance Criteria:**

**Given** the event Finanzas tab is loading for the first time
**When** the tab renders
**Then** skeleton placeholders matching the revenue card, expense table, and balance layout are shown (UX-DR-14)

**Given** a producer admin is on the event detail page for a specific event
**When** they click the "Finanzas" tab (one of 7 event detail tabs per UX-DR-06)
**Then** it displays: event revenue (sum of orders for this event), event expenses (sum of expenses linked to this event), event balance (revenue - expenses) with green/red coloring, an expense table filtered to this event, and an "+ Agregar Gasto" button that opens the expense Dialog pre-filled with this event

**Given** the producer admin adds an expense from the event Finanzas tab
**When** they submit the expense form
**Then** the expense is created with `event_id` set to the current event, and the event balance updates to reflect the new expense

**Given** the event has online sales (MercadoPago) and POS sales (cash/transfer)
**When** the event Finanzas tab calculates revenue
**Then** it includes all order amounts regardless of payment method (MercadoPago, cash, transfer), displaying total revenue for the event

**Given** the event has no expenses recorded
**When** the event Finanzas tab renders
**Then** the expense table shows an empty state (first-use variant: "Agrega los gastos de este evento para ver tu balance") and the balance equals the event revenue

**Given** the finance queries scoped by event
**When** they compute per-event balance
**Then** they filter orders and expenses by both `tenant_id` AND `event_id`, ensuring no cross-event data leakage

**Given** the test suite runs
**When** per-event finance tests execute
**Then** they verify: (1) per-event balance only includes that event's orders and expenses, (2) expenses with null event_id are NOT included in per-event calculations, (3) tenant isolation on event-scoped queries, (4) auth rejection for unauthenticated users

---

## Epic 10: Admin & Support Tools

Ticktu admin panel with platform-wide order lookup, ticket reissuance (new QR, invalidate old), and producer management — fully isolated from producer/buyer experience.

### Story 10.1: Cross-Tenant Order Lookup

As a **Ticktu super admin**,
I want to search for any order across all producers by buyer name, email, or transaction ID,
So that I can quickly find order information to resolve support cases.

**Acceptance Criteria:**

**Given** a super admin is authenticated at the `(admin)` panel
**When** they navigate to `/orders`
**Then** they see a search page with a search input (placeholder: "Search by name, email, or transaction ID"), debounced at 300ms per UX-DR-25, and an initially empty results area with a first-use `<EmptyState />` prompting them to search

**Given** a super admin enters a buyer name in the search input
**When** the debounced search executes
**Then** results show all matching orders across all tenants, with columns: order date, buyer name, buyer email, transaction ID, producer name, event name, total amount (formatted with producer's currency), and order status

**Given** a super admin enters a buyer email in the search input
**When** the debounced search executes
**Then** results show all orders matching that email across all tenants

**Given** a super admin enters a MercadoPago transaction ID in the search input
**When** the debounced search executes
**Then** results show the specific order matching that transaction ID regardless of tenant

**Given** a search returns no results
**When** the results area renders
**Then** it displays a no-results `<EmptyState />` variant with "No orders found" and suggestion to try different search terms

**Given** search results are displayed
**When** the admin clicks on an order row
**Then** a Sheet (slide from right on desktop, bottom on mobile per UX-DR-16) opens showing full order detail: buyer name, buyer email, producer name, event name, event date, order date, transaction ID, payment method, payment status, total amount with fee breakdown, and a list of all tickets in the order with each ticket's holder name, ticket type, QR status (active/invalidated/reissued), and check-in status

**Given** the admin order search query function in `lib/db/queries/admin-orders.ts`
**When** it executes
**Then** it uses the Supabase service role client (bypassing RLS) to query across all tenants, and the calling Server Action in `lib/actions/admin.ts` verifies `super_admin` role as its first step before invoking the query

**Given** a user with `role: 'producer_admin'` in their JWT
**When** they attempt to call the admin order lookup Server Action (directly or via API)
**Then** the action rejects with 403 Forbidden and the query never executes

**Given** the test suite
**When** the cross-tenant search tests execute against local Supabase
**Then** they verify: (1) super_admin can see orders from Producer A and Producer B in the same search results, (2) producer_admin is rejected with 403, (3) search by name returns partial matches, (4) search by email returns exact matches, (5) search by transaction ID returns the specific order

---

### Story 10.2: Ticket Reissuance with QR Invalidation

As a **Ticktu super admin**,
I want to reissue a ticket by generating a new QR code and invalidating the old one,
So that I can resolve support cases where a buyer lost access to their ticket or their QR was compromised.

**Acceptance Criteria:**

**Given** a super admin is viewing an order detail Sheet (from Story 10.1)
**When** they see the ticket list within the order
**Then** each active ticket displays a "Reissue" button (outline variant), and tickets that have already been reissued show a "Reissued" badge with the reissuance date instead of the button

**Given** the Drizzle schema for the `ticket_reissuances` audit table
**When** the migration runs
**Then** the table includes: `id` (uuid PK), `ticket_id` (uuid, NOT NULL, FK to tickets.id), `admin_user_id` (uuid, NOT NULL), `reason` (text, NOT NULL), `old_qr_hash` (text, NOT NULL), `new_qr_hash` (text, NOT NULL), `created_at` (timestamp with time zone, NOT NULL) — this table is append-only (no UPDATE/DELETE), accessible only via service role (no RLS, admin-only access pattern)

**Given** a super admin clicks the "Reissue" button on a specific ticket
**When** the reissuance dialog appears
**Then** it is a Level 3 blocking AlertDialog (per UX-DR-11) displaying: ticket holder name, ticket type, event name, a required "Reason for reissuance" text field, and two buttons: "Cancel" (left) and "Reissue Ticket" (destructive variant, right), with explanation text: "This will invalidate the current QR code and generate a new one. The ticket holder will receive a new email with the replacement ticket."

**Given** a super admin fills in the reissuance reason and confirms
**When** the reissuance action executes
**Then** a new cryptographic QR hash is generated for the ticket (using `lib/qr/generate.ts`), the old QR hash is marked as invalidated on the ticket record, a reissuance audit record is created storing: admin user ID, timestamp, reason, old QR hash reference, new QR hash, and an Inngest job (`ticket/reissued`) is dispatched to send a new email to the buyer with the replacement QR code

**Given** a ticket has been reissued with a new QR
**When** the old QR code is scanned at the validation endpoint (`/api/validation/scan`)
**Then** the scan is rejected with status "INVALID" and reason "Ticket reissued — this QR is no longer valid"

**Given** a ticket has been reissued with a new QR
**When** the new QR code is scanned at the validation endpoint
**Then** the scan succeeds with status "VALID" and displays the correct ticket holder name and ticket type

**Given** the reissuance Inngest job executes
**When** the email is rendered and sent via Resend
**Then** the buyer receives an email with the new QR code, branded with the producer's identity, with subject indicating it is a replacement ticket

**Given** a super admin reissues a ticket
**When** the action completes successfully
**Then** a success toast (Level 1, Sonner) confirms "Ticket reissued successfully — new QR sent to {buyer_email}", and the order detail Sheet refreshes to show the ticket's updated status with "Reissued" badge and reissuance timestamp

**Given** a user with `role: 'producer_admin'` in their JWT
**When** they attempt to call the reissue ticket Server Action
**Then** the action rejects with 403 Forbidden and no QR is generated or invalidated

**Given** the test suite
**When** the reissuance tests execute against local Supabase
**Then** they verify: (1) super_admin can reissue a ticket and the old QR hash is invalidated, (2) the new QR hash validates successfully, (3) the old QR hash is rejected with "reissued" reason at the validation endpoint, (4) producer_admin is rejected with 403, (5) the audit record is created with correct admin ID, reason, and timestamps, (6) reissuing an already-reissued ticket works (generates yet another new QR, invalidates the previous replacement)
