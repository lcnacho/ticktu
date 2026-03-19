---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['/home/nacholc/proyectos/ticktu/ideasTicktu.md']
session_topic: 'Ticktu MVP Scope Definition & Project Phasing'
session_goals: 'Define MVP boundary, identify essential features, sketch project phases, create Architect handoff'
selected_approach: 'ai-recommended'
techniques_used: ['First Principles Thinking', 'Role Playing', 'Resource Constraints']
ideas_generated: []
context_file: '_bmad/bmm/data/project-context-template.md'
---

# Brainstorming Session Results

**Facilitator:** Nacholc
**Date:** 2026-01-19

## Session Overview

**Topic:** Ticktu MVP Scope Definition & Project Phasing

**Goals:**
- Define MVP boundary precisely — which "basic features" are truly essential
- Sketch project phases — MVP → Phase 2 → Phase 3 → Future
- Create a clean handoff document for the Architect

### Context Guidance

This session focuses on a white-label ticketing platform (Ticktu) that empowers event producers with branded websites. The user is a non-developer needing to deliver a top-tier technical solution. Technical architecture decisions will follow this session with the Architect agent.

### Source Document

Key concepts from `ideasTicktu.md`:
- Replace traditional ticketing marketplaces
- Each producer gets their own branded website (custom domain/subdomain)
- Core reliable features: email ticket delivery, QR validation, payments
- Producer tools: event management, analytics, expense tracking, RRPP, complimentary tickets
- Differentiators: customer database, wallet integration, cashless, loyalty, push notifications
- Future: resale platform, widget/plugin model

### Session Setup

Brainstorming focus: Technical area - MVP scoping and project phasing for non-developer delivering top-tier solution.

---

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** MVP Scope Definition with focus on prioritization for Architect handoff

**Recommended Techniques:**

1. **First Principles Thinking:** Strip away competitor assumptions to find the fundamental truths of what Ticktu must do
2. **Role Playing:** Validate MVP through Producer, Buyer, and Door Operator perspectives
3. **Resource Constraints:** Force ruthless prioritization through extreme limitation scenarios

**AI Rationale:** This sequence moves from fundamental definition → stakeholder validation → practical prioritization, creating a clean handoff document for the Architect agent.

---

## Technique 1: First Principles Thinking

### Core MVP Elements Discovered

**PRODUCER-FACING:**
1. **Dedicated Website (Subdomain)** — producer.ticktu.com, exclusive branded space
2. **Event Lifecycle Management** — Draft/Active states, configure before launch
3. **Batch Ticket Releases** — Waves with quantity limits (Batch 1 → Batch 2 → Batch 3)
4. **RRPP Tracking Links** — Unique links for PR people, transparent attribution
5. **Cortesías (Complimentary Tickets)** — Generate free QR, send to email
6. **Real-Time Metrics Dashboard** — Instant visibility into sales numbers
7. **Customer Support Tools** — Search by email, cancel ticket, reissue new ticket
8. **Customer List** — Lightweight browsable list of all buyers

**BUYER-FACING:**
9. **Mobile-First, Fast Loading** — Most purchases from phones via social media
10. **Deep Linking** — Direct links to ticket selection
11. **Guest Checkout (Zero Registration)** — Email only, no account creation
12. **Multi-Ticket QR Delivery** — One email with unique QR per ticket purchased

**OPERATIONS:**
13. **Payment Processing** — Ticktu holds funds as escrow
14. **Validation App** — Scan QR, mark as used, offline sync capability
15. **Ticket Cancellation & Reissue** — Fraud protection flow
16. **Post-Event Payout** — Settlement to producer after event

### Key Decisions Made
- Subdomain for MVP, custom domains in Phase 2
- Expense tracking: Phase 2 (unless trivial to implement)
- Resend ticket option: Nice to have if not complex
- Customer list: Include but keep lightweight

### First Principles Insight
The MVP isn't "stripped down ticketing" — it's **complete ticketing infrastructure for a single producer**. Everything they need to run professionally, without marketplace noise.

---

## Technique 2: Role Playing

### 🎭 Producer Perspective (DJ Marcos)

**Key Concerns Before Adopting Ticktu:**
- Price/fees — Are they competitive?
- Feature completeness — Does it have what I need?

**Business Model Discoveries:**
- **Fee Structure**: $1.10-1.50 USD or 10% (initially higher due to MercadoPago costs)
- **Fee Payer**: Buyer pays fees, NOT producer — producer gets 100% of ticket price
- **Payment Processor**: MercadoPago integration required
- **Support Channel**: WhatsApp/Telegram — direct human contact for emergencies

**Real-Time Dashboard Needs:**
- Tickets scanned (people inside)
- Tickets remaining (still to enter)

### 🎫 Buyer Perspective (Lucia)

**Trust Requirements:**
- Professional, trustworthy visual design
- MercadoPago at checkout (borrowed trust from known brand)
- Fast loading on mobile (most purchases from social media)
- Deep links straight to tickets
- Guest checkout (email only, zero registration)

**URL Architecture Clarified:**
```
producername.ticktu.com                          → Producer homepage (all events)
producername.ticktu.com/events/event-slug        → Specific event
producername.ticktu.com/events/event-slug/rrpp   → Event with RRPP attribution
```

**RRPP MVP Approach:**
- NO profile page for MVP (Phase 2)
- Each link goes directly to event with attribution
- Multiple events = multiple separate links

### 🚪 Door Operator Perspective (Carlos)

**Validation Requirements:**
- Multiple devices scanning simultaneously at large events
- Offline-first with sync on reconnect
- Speed: 2 seconds or less per scan
- Clear visual feedback: Green = valid, Red = stop

**Risk Philosophy:**
- Producer controls offline risk decision
- Operational continuity > perfect fraud prevention
- Event must not stop due to connectivity issues
- Detect conflicts on sync, handle after

**MVP Validation Screen:**
- Valid: Green + ticket type (General/VIP)
- Invalid (already scanned): Red + scan time
- Invalid (bad ticket): Red + "Invalid"
- Keep it simple, stable, unbreakable

### Role Playing Insight
Each stakeholder validates the MVP from a different angle. Producer needs business tools, buyer needs trust signals, operator needs reliability. All three confirmed the core feature set — no major gaps discovered.

---

## Technique 3: Resource Constraints

### The 5-Feature Test

When forced to pick only 5 features, the absolute essentials were:
1. Producer website with event pages
2. Ticket purchase flow
3. Batch ticket releases
5. Cortesías (complimentary tickets)
9. Validation app

**However**, the conclusion was clear: **The MVP needs ALL 10 features.** This isn't a stripped-down experiment — it's a complete product.

### Business Model: Multi-Tenant SaaS

**Key Insight:** Build complete infrastructure once, replicate for each client.

```
BUILD ONCE (Complete Infrastructure)
├── All features working
├── Proven with Client #1
└── Production-ready

REPLICATE MANY (Per-Client Customization)
├── New subdomain
├── Branding/design customization
└── Same infrastructure underneath
```

### Development Philosophy

**Core Principle: Bulletproof Over Beautiful**

| Priority | Approach |
|----------|----------|
| ✅ Acceptable | Basic UI + Rock-solid stability |
| ❌ Unacceptable | Fancy UI + Fragile functionality |

- Simple UI is fine
- Core function MUST work every time
- Handle edge cases gracefully
- Fail safely, never catastrophically
- Trust is earned through reliability

### Critical System Identification

**Question:** "If ______ breaks, I lose this client forever."
**Answer:** The Validation App

**Validation App = Priority Zero for Engineering**

| Category | Requirements |
|----------|--------------|
| **MUST NEVER** | Crash, give false negatives, freeze, lose sync data |
| **MUST ALWAYS** | Work offline, scan in <2 seconds, show clear feedback, sync gracefully, handle multiple devices |
| **ENGINEERING** | Simplest code, extensive error handling, local-first architecture, stress tested, graceful degradation |

### Resource Constraints Insight
The MVP is not about cutting features — it's about building a complete, stable, multi-tenant platform. Quality and reliability are non-negotiable. The validation app is the highest-stakes component requiring the most defensive engineering.

---

## Session Summary

### What is Ticktu?

A white-label ticketing platform that gives event producers their own branded website instead of listing on marketplaces. Producers control their brand, their customer relationships, and their data.

### MVP Feature Set (Complete)

| # | Feature | Category |
|---|---------|----------|
| 1 | Producer website (subdomain) with event pages | Producer |
| 2 | Event lifecycle management (draft/active) | Producer |
| 3 | Batch ticket releases | Producer |
| 4 | RRPP tracking links | Producer |
| 5 | Cortesías (complimentary tickets) | Producer |
| 6 | Real-time metrics dashboard | Producer |
| 7 | Customer support tools (search, cancel, reissue) | Producer |
| 8 | Customer list (lightweight) | Producer |
| 9 | Ticket purchase flow (mobile-first, guest checkout) | Buyer |
| 10 | Multi-ticket QR delivery via email | Buyer |
| 11 | Validation app (offline-capable, multi-device) | Operations |
| 12 | Payment processing (MercadoPago, escrow model) | Operations |
| 13 | Post-event payout to producer | Operations |

### URL Architecture

```
producername.ticktu.com                          → Producer homepage (all events)
producername.ticktu.com/events/event-slug        → Specific event page
producername.ticktu.com/events/event-slug/rrpp   → Event with RRPP attribution
```

### Business Model

- **Fee Structure:** $1.10-1.50 USD or 10% per ticket
- **Fee Payer:** Buyer (producer receives 100% of ticket price)
- **Payment Processor:** MercadoPago
- **Revenue Model:** Multi-tenant SaaS — build once, replicate for each client

### Phase 2 Features (Post-MVP)

- Custom domains (producer.com instead of producer.ticktu.com)
- Expense tracking for producers
- RRPP profile pages
- Advanced validation app features (buyer details, deep lookup)
- Scan statistics per device
- Apple/Google Wallet integration
- Loyalty programs
- Push notifications via wallet
- Resale platform (separate project)

### Critical Technical Requirements

| Requirement | Reason |
|-------------|--------|
| Multi-tenant architecture | Same infrastructure serves all clients |
| Mobile-first frontend | Most purchases from social media on phones |
| Offline-capable validation app | Events happen in low-signal locations |
| High availability | Ticket sales can spike suddenly |
| Fast page loads | Speed = conversion rate |
| MercadoPago integration | Required payment processor |
| Email delivery reliability | Tickets delivered via email |

### Quality Standards

1. **Stability > Features** — Basic but bulletproof
2. **Reliability > Polish** — Works every time, looks good later
3. **Validation App = Critical** — Zero tolerance for failure
4. **Graceful Degradation** — If something fails, fail safely

---

## Architect Handoff

This document provides the complete MVP scope for Ticktu. The next step is to work with the Architect agent to:

1. **Design the multi-tenant architecture** — One codebase serving multiple producer subdomains
2. **Define the technology stack** — Frontend, backend, database, hosting
3. **Plan the validation app architecture** — Local-first, offline-capable, sync strategy
4. **Design the payment flow** — MercadoPago integration, escrow handling, payout automation
5. **Establish infrastructure requirements** — Scalability, reliability, monitoring

**Key Constraints for Architect:**
- Non-developer founder — needs manageable technology choices
- Stability is non-negotiable — bulletproof over beautiful
- Validation app is critical system — highest engineering priority
- Multi-tenant from day 1 — don't build per-client, build platform

---

*Session completed: 2026-01-19*
*Techniques used: First Principles Thinking, Role Playing, Resource Constraints*
*Ready for: Architect Agent*

