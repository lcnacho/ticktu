# Story 1.1: Project Initialization & Subdomain Routing

Status: ready-for-dev

## Story

As a **Ticktu developer**,
I want the project scaffolded with the full tech stack and subdomain-based tenant routing configured,
So that all future development builds on a solid, multi-tenant foundation.

## Acceptance Criteria

1. **AC-1: Project runs with full stack**
   Given no existing codebase
   When the initialization commands are executed (`create-next-app`, `shadcn init`, Supabase/Drizzle/Serwist/Inngest installs)
   Then the project runs with `npm run dev`, TypeScript strict mode enabled, Turbopack active, and all dependencies resolve without errors

2. **AC-2: Folder structure with route groups**
   Given the project structure
   When reviewing the folder layout
   Then route groups `(buyer)`, `(dashboard)`, `(admin)`, `(validation)` exist with placeholder layouts, and `proxy.ts` is configured at `src/proxy.ts`

3. **AC-3: Next.js config**
   Given the project configuration
   When reviewing `next.config.ts`
   Then `cacheComponents: true` is set, and Serwist plugin is configured

4. **AC-4: Environment variables documented**
   Given the project root
   When reviewing `.env.example`
   Then it documents all required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `SENTRY_DSN`, and `NEXT_PUBLIC_APP_DOMAIN`

5. **AC-5: Subdomain routing resolves tenant**
   Given a running Next.js application
   When a request arrives at `{producer-slug}.localhost:3000`
   Then `proxy.ts` (running on Node.js runtime, not Edge) extracts the subdomain, resolves it to a tenant context, and injects `tenantId` into the request

6. **AC-6: Foundational utility modules**
   Given the shared infrastructure utilities
   When reviewing the project scaffolding
   Then the following foundational modules exist:
   - `lib/errors/app-error.ts` — typed `AppError` class with `code`, `message`, `fieldErrors` for Server Action error handling
   - `lib/hooks/use-polling.ts` — reusable `usePolling(fetcher, intervalMs)` hook for 30s dashboard refresh pattern
   - `lib/utils/dates.ts` — `formatDate`, `formatDateTime`, `formatRelative` wrappers around `Intl.DateTimeFormat` with `es-UY` locale default

7. **AC-7: Admin subdomain routes correctly**
   Given a request to `admin.localhost:3000`
   When `proxy.ts` processes the request
   Then it routes to the `(admin)` surface without tenant resolution

8. **AC-8: Non-existent subdomain returns 404**
   Given a request to a non-existent subdomain
   When `proxy.ts` cannot resolve the tenant
   Then it returns a 404 response

## Tasks / Subtasks

- [ ] Task 1: Project scaffolding (AC: #1)
  - [ ] 1.1 Run `npx create-next-app@latest ticktu --yes` (TypeScript strict, App Router, Turbopack, src/ directory, Tailwind CSS)
  - [ ] 1.2 Run `npx shadcn@latest init` (configure with New York style, CSS variables enabled)
  - [ ] 1.3 Install Supabase: `npm install @supabase/supabase-js @supabase/ssr`
  - [ ] 1.4 Install Drizzle: `npm install drizzle-orm postgres` + `npm install -D drizzle-kit`
  - [ ] 1.5 Install Serwist: `npm install @serwist/turbopack` (v9.5.6 stable — use this package, NOT @serwist/next, for Turbopack)
  - [ ] 1.6 Install Inngest: `npm install inngest`
  - [ ] 1.7 Install additional dev deps: `npm install -D vitest @vitejs/plugin-react playwright eslint-plugin-jsx-a11y`
  - [ ] 1.8 Verify `npm run dev` starts without errors

- [ ] Task 2: Folder structure setup (AC: #2)
  - [ ] 2.1 Create route groups with placeholder layouts:
    - `src/app/(buyer)/layout.tsx` — buyer surface layout (will load producer theme)
    - `src/app/(dashboard)/layout.tsx` — producer dashboard layout
    - `src/app/(admin)/layout.tsx` — admin panel layout
    - `src/app/(validation)/layout.tsx` — validation app layout (PWA, online-first)
  - [ ] 2.2 Create placeholder pages for each route group (`page.tsx` with minimal content)
  - [ ] 2.3 Create lib directory structure:
    - `src/lib/supabase/` (server.ts, client.ts, proxy.ts — stubs)
    - `src/lib/db/schema/`, `src/lib/db/queries/`, `src/lib/db/migrations/`, `src/lib/db/index.ts` (DB client init only, NOT a barrel)
    - `src/lib/payments/`
    - `src/lib/email/`
    - `src/lib/inngest/client.ts`, `src/lib/inngest/functions/`
    - `src/lib/qr/`
    - `src/lib/validation/`
    - `src/lib/errors/`
    - `src/lib/actions/`
    - `src/lib/hooks/`
    - `src/lib/utils/`
  - [ ] 2.4 Create component directory structure:
    - `src/components/ui/` (shadcn components)
    - `src/components/buyer/`
    - `src/components/dashboard/`
    - `src/components/validation/`
    - `src/components/shared/`
  - [ ] 2.5 Create `src/types/` directory
  - [ ] 2.6 Create API route stubs:
    - `src/app/api/webhooks/mercadopago/route.ts`
    - `src/app/api/validation/scan/route.ts`
    - `src/app/api/inngest/route.ts`

- [ ] Task 3: Next.js configuration (AC: #3)
  - [ ] 3.1 Configure `next.config.ts` with `cacheComponents: true` (enables `"use cache"` directive)
  - [ ] 3.2 Configure Serwist plugin in `next.config.ts` (use `@serwist/next` wrapper)
  - [ ] 3.3 Verify Turbopack is active (default in Next.js 16 `npm run dev`)

- [ ] Task 4: Environment variables (AC: #4)
  - [ ] 4.1 Create `.env.example` with all required vars:
    ```
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=
    RESEND_API_KEY=
    MERCADOPAGO_ACCESS_TOKEN=
    MERCADOPAGO_PUBLIC_KEY=
    INNGEST_EVENT_KEY=
    INNGEST_SIGNING_KEY=
    SENTRY_DSN=
    NEXT_PUBLIC_APP_DOMAIN=ticktu.com
    ```
  - [ ] 4.2 Create `.env.local` with placeholder/local values for development
  - [ ] 4.3 Ensure `.env.local` is in `.gitignore`

- [ ] Task 5: proxy.ts — Subdomain routing (AC: #5, #7, #8)
  - [ ] 5.1 Create `src/proxy.ts` with exported `proxy` function (NOT `middleware`)
  - [ ] 5.2 Implement subdomain extraction from `request.headers.get('host')`
  - [ ] 5.3 Implement surface routing logic:
    - `admin.{domain}` → route to `(admin)` surface, no tenant resolution
    - `{slug}.{domain}` → resolve slug to tenant, inject `tenantId` via request headers (`x-tenant-id`)
    - Bare domain / no subdomain → marketing/landing page (or 404 for MVP)
  - [ ] 5.4 Return 404 for non-existent subdomains (tenants that don't exist in DB)
  - [ ] 5.5 Configure `matcher` to exclude static files, `_next`, and API routes that don't need tenant context
  - [ ] 5.6 Document local dev subdomain setup: add entries to `/etc/hosts` or use `nip.io` pattern

- [ ] Task 6: Foundational utility modules (AC: #6)
  - [ ] 6.1 Create `src/lib/errors/app-error.ts`:
    ```typescript
    export type AppError = {
      code: string        // "TICKET_SOLD_OUT" | "PAYMENT_FAILED" | "TENANT_NOT_FOUND"
      message: string     // Human-readable
      field?: string      // For form validation errors
      statusCode: number  // 400, 401, 403, 404, 500
    }
    ```
    Include helper: `createAppError(code, message, statusCode, field?)` factory function
  - [ ] 6.2 Create `src/lib/hooks/use-polling.ts`:
    - `usePolling(fetcher: () => Promise<T>, intervalMs: number)` hook
    - Returns `{ data, error, isLoading }` — uses `setInterval` + `fetch`
    - Default interval: 30000ms (30s)
    - Cleanup on unmount, pause when tab hidden (Page Visibility API)
    - Mark with `"use client"` directive
  - [ ] 6.3 Create `src/lib/utils/dates.ts`:
    - `formatDate(date: Date | string): string` — `Intl.DateTimeFormat` with `es-UY` locale, date only
    - `formatDateTime(date: Date | string): string` — date + time, `America/Montevideo` timezone
    - `formatRelative(date: Date | string): string` — relative time (e.g., "hace 5 min")
    - NO external date libraries (no moment.js, no date-fns)

- [ ] Task 7: Drizzle ORM configuration (AC: #1)
  - [ ] 7.1 Create `drizzle.config.ts` at project root
  - [ ] 7.2 Create `src/lib/db/index.ts` — DB client initialization using `postgres` driver + `drizzle-orm`
  - [ ] 7.3 Verify Drizzle connects to Supabase local with `supabase start`

- [ ] Task 8: Inngest setup (AC: #1)
  - [ ] 8.1 Create `src/lib/inngest/client.ts` — Inngest client initialization
  - [ ] 8.2 Create `src/app/api/inngest/route.ts` — Inngest serve endpoint (empty functions array for now)

- [ ] Task 9: Basic tests to verify setup (AC: #1, #5, #8)
  - [ ] 9.1 Configure Vitest (`vitest.config.ts`) with path aliases matching `tsconfig.json`
  - [ ] 9.2 Write test: `proxy.ts` extracts subdomain correctly
  - [ ] 9.3 Write test: `proxy.ts` routes `admin.*` to admin surface
  - [ ] 9.4 Write test: `proxy.ts` returns 404 for unknown subdomains
  - [ ] 9.5 Write test: `AppError` factory creates correct error objects
  - [ ] 9.6 Write test: `formatDate`, `formatDateTime` produce expected output with `es-UY` locale

## Dev Notes

### Critical Architecture Constraints

- **No barrel files (`index.ts`)** — import directly from source files. Barrel files add 200-800ms import cost on Vercel. [Source: architecture.md#Structure Patterns]
- **Named exports only** — no `export default` anywhere. [Source: architecture.md#Enforcement Guidelines]
- **No external date/number libraries** — use `Intl.DateTimeFormat` and `Intl.NumberFormat` only. [Source: architecture.md#Format Patterns]
- **Tests co-located** — `foo.test.ts` next to `foo.ts`, E2E tests in `e2e/` at root. [Source: architecture.md#Structure Patterns]
- **File naming: kebab-case** — `app-error.ts`, `use-polling.ts`, `mercadopago-client.ts`. [Source: architecture.md#Naming Patterns]
- **snake_case DB, camelCase TS** — Drizzle maps between them. [Source: architecture.md#Naming Patterns]

### proxy.ts Implementation Notes

**Next.js 16 proxy.ts is a confirmed feature** replacing `middleware.ts`. Key differences:
- File: `src/proxy.ts` (not `middleware.ts`)
- Export: `export function proxy(request: NextRequest)` (not `middleware`)
- Runtime: **Node.js only** (not Edge). Cannot configure runtime.
- Full Node.js API access (unlike Edge middleware which was limited)
- Same `NextRequest`/`NextResponse` API: `NextResponse.redirect()`, `.rewrite()`, `.next()`, `Response.json()`
- **Key constraint:** Proxy runs separately from render code — do not rely on shared modules or globals
- Migration codemod available: `npx @next/codemod@canary middleware-to-proxy .`

**Subdomain resolution approach:**
```
Request arrives → extract host header → parse subdomain
  → "admin" → set header x-surface=admin, no tenant needed
  → "{slug}" → look up producer by slug
    → found → set x-tenant-id header, x-surface=buyer
    → not found → return 404
  → no subdomain → default surface
```

**Local development subdomain setup:**
- Option A: `/etc/hosts` entries: `127.0.0.1 odisea.localhost admin.localhost`
- Option B: Use `nip.io`: `odisea.127.0.0.1.nip.io` (zero config)
- Document chosen approach in `.env.example`

### Serwist Configuration Notes

- **Use `@serwist/turbopack` (NOT `@serwist/next`)** when using Turbopack (Next.js 16 default)
- Stable version: v9.5.6. Preview v10.0.0-preview.14 exists but has known `__SW_MANIFEST` injection bug — use stable
- Config in `next.config.ts`:
  ```typescript
  import { withSerwist } from "@serwist/turbopack";
  const nextConfig: NextConfig = { /* ... */ };
  export default withSerwist(nextConfig);
  ```
- TypeScript: add `"@serwist/next/typings"` to `compilerOptions.types` and `"webworker"` to `compilerOptions.lib` in `tsconfig.json`
- Service worker entry: `src/sw.ts`
- For this story: configure plugin in `next.config.ts` only. Actual SW functionality (PWA shell) deferred to Epic 7 — offline caching descoped (online-first 2026-03-19)

### shadcn/ui CLI v4 Notes

- Init command: `npx shadcn@latest init`
- v4 supports `--preset` flag, `--dry-run`, `--diff`, and `--view` inspection flags
- Configure: New York style, CSS variables enabled for theming
- Components installed to `src/components/ui/`

### Next.js 16 "use cache" Directive

- Opt-in caching via `"use cache"` directive at top of files, components, or async functions
- Requires `cacheComponents: true` in `next.config.ts` — when enabled, data fetching is excluded from pre-renders unless explicitly cached
- All code is dynamic by default (no automatic caching)
- Also supports `"use cache: remote"` for durable cache shared across server instances
- Related APIs: `cacheLife(profile)` for expiration, `cacheTag(tag)` for invalidation
- Custom cache profiles can be defined in `next.config.ts` under `cacheLife` key
- For this story: just enable the config flag. Actual `"use cache"` usage starts in Epic 2

### Project Structure Notes

Final folder structure after this story:
```
src/
  proxy.ts                          # Subdomain routing (Node.js runtime)
  sw.ts                             # Service worker entry (Serwist)
  app/
    layout.tsx                      # Root layout
    page.tsx                        # Root page
    (buyer)/
      layout.tsx                    # Buyer surface layout (producer theme)
      page.tsx                      # Placeholder
    (dashboard)/
      layout.tsx                    # Dashboard layout (Ticktu theme)
      page.tsx                      # Placeholder
    (admin)/
      layout.tsx                    # Admin layout
      page.tsx                      # Placeholder
    (validation)/
      layout.tsx                    # Validation app layout (PWA, online-first)
      page.tsx                      # Placeholder
    api/
      webhooks/mercadopago/route.ts # Stub
      validation/scan/route.ts      # Stub
      inngest/route.ts              # Inngest serve endpoint
  components/
    ui/                             # shadcn components (auto-installed)
    buyer/
    dashboard/
    validation/
    shared/
  lib/
    supabase/
      server.ts                     # Stub
      client.ts                     # Stub
      proxy.ts                      # Stub (Supabase client for proxy context)
    db/
      schema/                       # Drizzle table definitions
      queries/                      # Query functions
      migrations/                   # Drizzle Kit generated
      index.ts                      # DB client init (NOT a barrel)
    payments/
    email/
    inngest/
      client.ts                     # Inngest client
      functions/                    # Job definitions
    qr/
    validation/
    errors/
      app-error.ts                  # Typed AppError
    actions/
    hooks/
      use-polling.ts                # 30s polling hook
    utils/
      dates.ts                      # Intl.DateTimeFormat wrappers
  types/
drizzle.config.ts
vitest.config.ts
.env.example
.env.local                          # gitignored
```

### References

- [Source: architecture.md#Starter Template Evaluation] — initialization commands and rationale
- [Source: architecture.md#Core Architectural Decisions > Data Architecture] — proxy.ts architecture
- [Source: architecture.md#Authentication & Security] — proxy.ts routing logic
- [Source: architecture.md#Frontend Architecture > Folder Structure] — complete directory layout
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, structure, format patterns
- [Source: architecture.md#API & Communication Patterns > Error Handling Standard] — AppError type
- [Source: epics.md#Story 1.1] — acceptance criteria and story definition
- [Source: ux-design-specification.md#UX-DR-14] — loading states (skeleton vs in-place)
- [Source: ux-design-specification.md#UX-DR-23] — accessibility: eslint-plugin-jsx-a11y

### What This Story Does NOT Include

- Database schema for producers table (Story 1.2)
- Supabase Auth configuration (Story 1.3)
- RLS policies (Story 1.2)
- Producer branding/theming system (Story 1.4)
- Actual service worker functionality — PWA shell only, offline scanning descoped (Epic 7, online-first 2026-03-19)
- Any UI components beyond placeholder layouts

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### Change Log
- 2026-03-19: Story created — comprehensive developer guide for project initialization
