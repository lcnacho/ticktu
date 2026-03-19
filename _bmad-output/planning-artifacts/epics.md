---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics']
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

**Validation & Offline (6 FRs)**

FR-VA-01: Validation app authenticates to a specific event via event code and operator name
FR-VA-02: QR scan validates ticket and displays result (valid + ticket info, or invalid + reason) in under 2 seconds
FR-VA-03: Duplicate QR scans are rejected with clear "Already Used" indication
FR-VA-04: Validation app caches event ticket data and operates fully offline when internet is unavailable
FR-VA-05: Offline validations sync automatically when connectivity is restored, maintaining 100% data integrity
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
NFR-AV-03: Validation app operates fully offline with cached event data; zero dependency on internet connectivity during event

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

NFR-DI-01: Offline validation syncs maintain 100% data integrity — no scans lost on reconnection as verified by reconciliation checks
NFR-DI-02: Offline conflict resolution handles edge case of same ticket validated on two devices offline with clear resolution strategy
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
UX-DR-04: Producer dashboard sidebar with 8 sections: Dashboard, Eventos, Ventas, RRPP, Boletería, Acreditación, Finanzas, Usuario — collapsible sidebar pattern (shadcn Sidebar)
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
UX-DR-18: Validation app offline indicator — subtle small yellow dot, does not block scanning. Offline mode activates silently, syncs automatically on reconnect
UX-DR-19: Scan Result Popup — popup overlay (not full-screen), VALID/INVALID with color accent + icon + reason if invalid, auto-dismiss 2s, haptic feedback
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
FR-VA-04: Epic 7 — Offline operation with cached event data
FR-VA-05: Epic 7 — Automatic sync on reconnect with 100% integrity
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

### Epic 7: Ticket Validation & Offline Capability
Door operators validate tickets via QR scanning PWA with full-screen color feedback, offline capability, automatic sync on reconnect, and complete audit trail.
**FRs covered:** FR-VA-01, FR-VA-02, FR-VA-03, FR-VA-04, FR-VA-05, FR-VA-06
**Includes:** PWA (Serwist), QR scanner (html5-qrcode), IndexedDB cache, offline sync (first-scan-wins), scan audit, Level 4 environmental feedback

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
