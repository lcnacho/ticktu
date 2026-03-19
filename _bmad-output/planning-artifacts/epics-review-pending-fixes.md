# Epics Review - Pending Fixes

**Date:** 2026-03-19
**Status:** ✅ ALL FIXES APPLIED (CRITICAL + MEDIUM + LOW team-selected)
**Applied:** 4 initial schema fixes + 3 critical + 12 medium + 7 LOW (team consensus)

## CRITICAL (3/3 — ✅ ALL APPLIED)

### 1. ✅ Event Access Codes — table + ACs added to Story 7.1
- Added `event_access_codes` table schema AC with id, tenant_id, event_id, code, expires_at, is_active, created_at
- Added AC for producers generating codes from event Configuración tab
- Updated auth Route Handler AC to reference `event_access_codes` table lookup
- Added deactivated codes to auth rejection tests

### 2. ✅ Race condition — atomic capacity check added to Story 4.2
- Added AC: atomic `UPDATE ... WHERE sold_count + quantity <= max_capacity RETURNING id`
- Added concurrent purchase test to test suite AC

### 3. ✅ Webhook reconciliation — cron function added to Story 4.3
- Added AC for Inngest cron `order/reconcile` every 5 minutes
- Queries MercadoPago API for stale pending orders (>10 min)
- Added reconciliation test to test suite AC

## MEDIUM (12/12 — ✅ ALL APPLIED)

### 4. ✅ Auth rejection tests added to Stories 6.2, 6.3, 8.1, 9.3
### 5. ✅ Skeleton loading states added to Stories 5.1, 5.3, 9.1, 9.3, 9.4
### 6. ✅ aria-live="polite" added to polling containers in Stories 6.2, 6.3, 6.4, 9.3
### 7. ✅ EmptyState component definition added to Story 2.2 (3 variants, props interface, file path)
### 8. ✅ ticket_reissuances audit table schema added to Story 10.2
### 9. ✅ rrpp_link_id contradiction resolved — Story 5.2 references 4.2 definition, no migration
### 10. ✅ Focus management + scroll-to-error added to Story 4.2 (UX-DR-13)
### 11. ✅ Responsive behavior added to Story 9.3 (charts stack vertical, table priority columns)
### 12. ✅ Mobile-first layout (max-width: 480px) added to Stories 2.3 and 4.3
### 13. ✅ First-use EmptyState added to Stories 5.1 (promoter list) and 9.1 (POS sales table)
### 14. ✅ Complimentary ticket email delivery — Inngest event `ticket/complimentary-issued` added to Story 3.3
### 15. ✅ Tenant isolation tests added to Stories 2.3 and 4.1

## LOW — Team Triage (7 fixed, 5 deferred)

### Fixed (team consensus: would cause implementation confusion)

### 16. ✅ UX contradiction resolved — UX-DR-19 aligned to full-screen overlay (matches UX-DR-17 Level 4)
### 17. ✅ Story 6.1 Gastos/Balance zero-state — AC added: gracefully returns 0 when expenses table doesn't exist yet
### 18. ✅ Story 2.4 "Buy" CTA — AC added: no CTA displayed until Epic 4 introduces ticket selection
### 19. ✅ Sidebar naming — "Acreditación" → "Check-ins", maps to Epic 6.4
### 20. ✅ "Usuario" section — removed from MVP sidebar (7 sections, not 8)
### 21. ✅ Shared infra assigned to Story 1.1 — AppError, usePolling, dates.ts with file paths
### 22. ✅ QR components — `<QRScanner />` and `<ScanResultOverlay />` with explicit file paths in Stories 7.1/7.2

### Deferred (team consensus: implementation discipline, not story gaps)

- Semantic HTML AC on Story 2.3 — UX spec already covers, dev discipline
- Skip link on layout stories — CSS one-liner, covered by spec
- Touch target 44px on dashboard stories — already in UX-DR-20/23
- Form validation pattern on Story 7.1 — already has form + inline error ACs
- Story 1.1 no direct user value — infrastructure stories are standard practice
