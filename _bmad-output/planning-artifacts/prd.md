---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
inputDocuments:
  - '/home/nacholc/proyectos/ticktu/_bmad-output/planning-artifacts/product-brief-ticktu-2026-01-25.md'
  - '/home/nacholc/proyectos/ticktu/_bmad-output/analysis/brainstorming-session-2026-01-19.md'
  - '/home/nacholc/proyectos/ticktu/ideasTicktu.md'
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
  rawIdeas: 1
projectType: 'greenfield'
classification:
  projectType: 'SaaS B2B'
  domain: 'Event Technology / Ticketing'
  complexity: 'Medium'
  projectContext: 'greenfield'
  keyConcerns:
    - 'Multi-tenant data isolation'
    - 'Payment security (PCI compliance)'
    - 'High availability during sales windows'
    - 'Offline capability for validation'
lastEdited: '2026-03-14'
editHistory:
  - date: '2026-03-14'
    changes: 'Added Executive Summary, Functional Requirements (39 FRs — FR-PU-08 removed/consolidated, gap preserved for ID stability), Non-Functional Requirements (20 NFRs)'
---

# Product Requirements Document - Ticktu

**Author:** Nacholc
**Date:** 2026-01-25

## Executive Summary

Ticktu is a white-label ticketing platform for event producers in Uruguay, offering branded ticketing sites (`{producer}.ticktu.com`) as an alternative to generic marketplaces like Passline where producer identity gets buried.

**Core Differentiator:** Producers own their brand and their data. Unlike marketplaces that aggregate events and dilute producer identity, Ticktu provides each producer with a fully branded, isolated instance — their own ticketing platform under Ticktu's infrastructure.

**Target Users:**
- **Producers** (B2B clients) — Event production companies seeking brand ownership, data visibility, and operational control over their ticketing
- **Buyers** (end consumers) — Attendees who purchase tickets through the producer's branded site
- **Door Operators** — Staff validating tickets at event entry via mobile scanning app

**Business Model:** Transaction fee per ticket sold ($1-1.5 USD or 10%, buyer-pays). Producers retain 100% of ticket face value. No subscription tiers for MVP.

**Delivery Model:** Managed platform (white-glove onboarding, not self-service). Ticktu configures branding, subdomains, and producer accounts. Producers are self-sufficient for event creation post-onboarding.

**MVP Scope:** 13 core features covering the complete event lifecycle — from producer onboarding and event creation through ticket sales, validation, and post-event settlement. First client: Odisea.

**North Star Metric:** Total tickets sold through the platform.

---

## Success Criteria

### User Success

#### Producer Success
| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature parity | 100% | All current marketplace capabilities available |
| Brand ownership | Achieved | Producer's branding visible, not Ticktu's |
| Data visibility | New insights | Producers access metrics they never had before |
| First event success | Smooth execution | Zero critical issues during first live event |
| Referral intent | Willing to recommend | Producer would refer other producers |

**Success Moment:** When the producer sees their branded site live, runs their first event without issues, and accesses analytics they never had access to before.

#### Buyer Success
| Metric | Target | Measurement |
|--------|--------|-------------|
| Page performance | Fast load times | No perceivable delay (optimized without compromising security/stability) |
| Site reliability | Zero downtime during sales | No crashes or errors during purchase flow |
| Purchase clarity | Clear journey | Buyer completes purchase without confusion |
| Ticket delivery | Immediate | Email with QR codes arrives within seconds |
| Validation speed | < 2 seconds | QR scan and validation at door is instant |

**Success Moment:** Buyer clicks social media link → lands on fast, professional page → completes purchase in under 2 minutes → receives tickets immediately → enters event with quick scan.

### Business Success

#### Year 1 Targets
| Objective | Target | Notes |
|-----------|--------|-------|
| Tickets sold | 50,000 | Primary success metric |
| Revenue | ~$62,500+ | At $1.25 avg fee per ticket |
| Active producers | 1-10+ | Volume matters more than client count |
| Producer retention | 100% | If first event succeeds, multi-year relationship |

#### MVP Launch (First 3 Months)
| Objective | Target | Notes |
|-----------|--------|-------|
| Odisea onboarded | Complete | First client fully operational |
| First event executed | Zero critical issues | Validation of entire platform |
| Buyer conversion | Baseline established | Measure and improve from there |

### Technical Success

#### Platform Health KPIs
| KPI | Target | Frequency |
|-----|--------|-----------|
| Uptime | 99.9%+ during sales windows | Continuous |
| Page load time | Optimized (security/stability first) | Per release |
| Payment success rate | 99%+ | Per event |
| Ticket delivery rate | 100% | Per event |
| QR validation speed | < 2 seconds | Per scan |
| Offline sync reliability | 100% data integrity | Per event |

### Measurable Outcomes

**North Star Metric:** Total tickets sold through the platform

This single metric captures:
- Producer adoption (more producers = more tickets)
- Producer retention (repeat events = more tickets)
- Buyer experience (good UX = completed purchases)
- Platform reliability (uptime = no lost sales)

**Go/No-Go Decision Point (Post-First Event):**
- Would Odisea run their next event on Ticktu? (Retention)
- Would they recommend it to other producers? (Referral)
- Did the platform handle the load without issues? (Technical validation)

---

## Product Scope

### MVP - Minimum Viable Product

**Delivery Model:** Managed Platform (white-glove service, not self-service)

**13 Core Features:**
1. Multi-Tenant Producer Management (Ticktu-configured branding)
2. Event Lifecycle Management (Draft → Published → Finished → Archived)
3. Ticket Type System (multiple tiers, pricing, capacity)
4. Batch Release Management (phased releases, scheduled activation)
5. Purchase Flow System (mobile-first, guest checkout, deep links)
6. Payment Processing (MercadoPago, fee collection)
7. RRPP Attribution System (tracking URLs, sales attribution)
8. Complimentary Ticket Management (free tickets, VIP lists)
9. Customer Database (buyer info, purchase history)
10. Real-Time Dashboard (sales monitoring, analytics)
11. Support/Admin Tools (order lookup, ticket reissuance)
12. Ticket Validation App (QR scanning, offline-capable)
13. Post-Event Settlement (producer earnings summary)

### Growth Features (Post-MVP)

**Phase 2 - Deepen Engagement:**
- Self-service branding tools for producers
- Expense tracking and break-even analysis
- Apple/Google Wallet ticket delivery
- Customer loyalty programs and rewards
- Personalized push notifications
- Advanced analytics and insights

### Vision (Future)

**Phase 3 - Scale:**
- Bar sales integration and management
- Multi-venue support
- API for third-party integrations
- White-label mobile app for producers
- Regional expansion beyond Uruguay

**Long-Term (2-3 Years):**
Ticktu becomes the complete event operations platform for Latin America:
- Command center for all event types
- Full customer lifecycle management
- Data intelligence for strategic growth
- Ecosystem of integrated services

**The Arc:** MVP (prove value) → Phase 2 (deepen engagement) → Phase 3 (scale reach) → Platform (own the market)

---

## User Journeys

### Journey 1: Producer Success Path - "Odisea's First Event on Ticktu"

**Persona:** The Odisea Team - A medium-sized production company organizing nighttime parties in Uruguay, tired of generic marketplaces burying their brand.

**Opening Scene:**
Odisea has been using Passline for years. Every event, their brand gets lost in a sea of other producers. They can't access the data they need. When Nacholc reaches out with Ticktu, they're skeptical but intrigued by the promise of "your own branded platform."

**Rising Action:**
1. **Discovery Call** - Ticktu team discusses Odisea's pain points, shows demo of branded producer site
2. **Agreement** - Odisea commits; provides logo, colors, brand guidelines
3. **Ticktu Configuration** - Behind the scenes, Ticktu team sets up `odisea.ticktu.com`, configures branding, creates producer account
4. **Handoff** - Odisea receives login credentials with a message: "Your platform is ready"
5. **First Login** - Odisea logs in, sees their branded dashboard, explores the interface
6. **First Event Creation** - Creates their upcoming party: name, date, venue, ticket types, batches, RRPP links
7. **Event Published** - Event goes live on their branded site

**Climax:**
Event night arrives. Sales have been tracked in real-time. Odisea watches the dashboard as check-ins roll in. At 2 AM, they see attendance patterns they've never had access to before - peak entry time, ticket type breakdown, RRPP performance.

**Resolution:**
Post-event, Odisea marks the event as "Finished." They access the settlement showing exactly what they earned. For the first time, they have data to plan their next event strategically. They're already planning event #2 on Ticktu.

**Capabilities Revealed:** Producer onboarding (Ticktu-managed), event creation, ticket configuration, batch management, RRPP links, real-time dashboard, post-event settlement

---

### Journey 2: Buyer Success Path - "Lucia Gets Her Tickets"

**Persona:** Lucia, 24 - Sees Odisea's Instagram story promoting their next party. She's with two friends who also want to go.

**Opening Scene:**
Lucia is scrolling Instagram at 11 PM. She sees Odisea's story with a "Get Tickets" link. She taps it immediately - the party is in two weeks and tickets are selling fast.

**Rising Action:**
1. **Landing** - Page loads instantly on her phone. It's clearly Odisea's brand - their logo, their colors, their vibe
2. **Event View** - She sees the party details, date, venue, and ticket options (General $30, VIP $50)
3. **Selection** - Selects 2 General + 1 VIP for herself and friends
4. **Checkout** - Guest checkout (no account needed). Enters names and emails for each ticket
5. **Payment** - MercadoPago checkout. She sees the service fee added. Pays with her saved card
6. **Confirmation** - Success! Redirected to confirmation page

**Climax:**
Within 30 seconds, her phone buzzes. Email from Odisea with all three tickets - each with a unique QR code. She forwards her friends their tickets immediately.

**Resolution:**
Event night: Lucia arrives, shows her QR on her phone. Green light, she's in. The whole process took 2 minutes from Instagram to tickets in hand.

**Capabilities Revealed:** Mobile-first purchase flow, deep linking, guest checkout, multi-ticket purchase, MercadoPago integration, immediate email delivery, unique QR per ticket

---

### Journey 3: Buyer Edge Case - "Payment Failed"

**Persona:** Lucia's friend Marco tries to buy tickets but his card gets declined.

**Opening Scene:**
Marco clicks the same Instagram link. Selects his ticket. Gets to MercadoPago checkout.

**Rising Action:**
1. **Payment Attempt** - Enters card details, submits
2. **Decline** - MercadoPago returns decline (insufficient funds)
3. **Error Display** - Clear message: "Payment declined. Please try a different payment method."
4. **Retry** - Cart is preserved. Marco selects different card
5. **Success** - Second attempt works

**Resolution:**
Marco receives his ticket email. The cart wasn't lost, no need to restart.

**Capabilities Revealed:** Payment error handling, cart preservation, retry flow, clear error messaging

---

### Journey 4: Door Operator - "Carlos Works the Door"

**Persona:** Carlos, experienced door staff for Odisea events. He's worked many events but this is his first time using Ticktu's validation app.

**Opening Scene:**
Carlos arrives at the venue 30 minutes before doors open. He's been told to download the Ticktu validation app.

**Rising Action:**
1. **App Open** - Opens app on his phone
2. **Event Code Entry** - Enters the event code Odisea provided (e.g., "ODISEA-2026-01")
3. **Name Entry** - Enters his name "Carlos" (for tracking which device scanned what)
4. **Ready State** - App shows "Ready to Scan" with event name displayed
5. **First Scan** - Guest shows QR. Carlos points camera. Green checkmark + ticket info appears in <2 seconds
6. **Invalid Scan** - Someone tries a screenshot of a friend's ticket. Red X - "Already Used"
7. **Offline Mode** - Venue has spotty wifi. App continues working, syncing when connection returns

**Climax:**
Peak entry time hits. Carlos is scanning 50+ people in 10 minutes. Every scan is instant. No line backup. No angry guests.

**Resolution:**
End of night, Carlos has scanned 400 tickets. All synced to dashboard. Odisea can see exactly who entered and when.

**Capabilities Revealed:** Validation app, event code system, operator identification, fast QR scanning, duplicate detection, offline capability, sync on reconnect, scan tracking

---

### Journey 5: Producer Edge Case - "Event Cancellation"

**Persona:** Odisea has to cancel an event due to venue issues. 200 tickets already sold.

**Opening Scene:**
Odisea gets bad news - venue flooded, event impossible. They have 200 paid customers expecting a party.

**Rising Action:**
1. **Producer Contacts Ticktu** - Direct message/call to Ticktu support
2. **Event Status Change** - Ticktu marks event as cancelled
3. **Refund Process** - Ticktu initiates refunds through MercadoPago for all purchases
4. **Customer Notification** - Buyers receive email explaining cancellation and refund timeline
5. **Settlement Adjustment** - No settlement for Odisea (no earnings from cancelled event)

**Resolution:**
Within 48-72 hours, all buyers have received refunds. Odisea's reputation is protected because the process was handled professionally.

**Capabilities Revealed:** Event cancellation workflow, refund processing (Ticktu-managed), customer communication, settlement adjustment

---

### Journey 6: Ticktu Admin - "Onboarding a New Producer"

**Persona:** Ticktu team member setting up a new producer client.

**Opening Scene:**
New producer "Neon Events" has signed up. They've provided their logo, colors, and brand guidelines.

**Rising Action:**
1. **Subdomain Creation** - Create `neon.ticktu.com`
2. **Branding Configuration** - Upload logo, set primary/secondary colors, configure imagery
3. **Producer Account Creation** - Create admin user with email/password
4. **Initial Settings** - Configure fee structure, payment settings, default options
5. **Testing** - Internal verification that branding displays correctly
6. **Handoff** - Send credentials to producer with welcome message

**Climax:**
Producer logs in for the first time and sees their fully branded platform ready to use.

**Resolution:**
Producer is self-sufficient for event creation. They only contact Ticktu for branding changes or support issues.

**Capabilities Revealed:** Ticktu admin panel, subdomain management, branding configuration, producer account management, fee configuration

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| Producer Success | Event lifecycle, dashboard, settlement, RRPP tracking |
| Buyer Success | Purchase flow, guest checkout, payment, email delivery |
| Buyer Edge Case | Error handling, cart preservation, retry flow |
| Door Operator | Validation app, offline mode, scan tracking |
| Event Cancellation | Refund processing, customer communication |
| Ticktu Admin | Producer onboarding, branding config, account management |

**Critical Paths Identified:**
1. **Purchase → Payment → Delivery** - Must be flawless (revenue depends on it)
2. **Scan → Validate → Entry** - Must work offline (event success depends on it)
3. **Onboarding → Live** - Must be smooth (first impression with producer)

---

## Domain-Specific Requirements

### Payment & Financial
- **PCI Compliance**: Delegated to MercadoPago - Ticktu never stores card data
- **Fee Transparency**: Service fees clearly displayed before payment
- **Refund Capability**: Must support refunds through MercadoPago API
- **Financial Reconciliation**: Accurate settlement reports for producers

### Availability & Performance
- **Sales Window Reliability**: 99.9%+ uptime during active ticket sales
- **Graceful Degradation**: If analytics fail, purchasing must continue
- **Load Handling**: Must handle traffic spikes when events go on sale

### Data & Privacy
- **Customer Data Ownership**: Producers own their customer data
- **Data Isolation**: Multi-tenant architecture must prevent data leakage between producers
- **Email Delivery**: Ticket emails must reach inbox (SPF/DKIM/DMARC)

### Fraud Prevention
- **Unique QR Codes**: Each ticket has cryptographically unique identifier
- **Duplicate Detection**: Same QR cannot be used twice
- **Screenshot Protection**: QR validation includes ticket holder info display

### Offline Operations
- **Validation App**: Must cache event data and work without internet
- **Sync Recovery**: Must reconcile when connection restored
- **Conflict Resolution**: Handle edge cases (ticket validated on two devices offline)

---

## SaaS B2B Specific Requirements

### Project-Type Overview

Ticktu is a multi-tenant B2B SaaS platform where each tenant (producer) gets an isolated, branded instance. The platform follows a managed service model where Ticktu team handles onboarding and configuration.

### Multi-Tenancy Architecture

#### Tenant Model
- **Isolation Level:** Complete data isolation per producer
- **Subdomain Model:** Each producer gets `{producer}.ticktu.com`
- **Branding Isolation:** Logo, colors, imagery per tenant
- **Data Boundaries:** Producer A cannot access Producer B's data under any circumstances

#### Tenant Provisioning
- **Model:** Ticktu-managed (not self-service signup)
- **Process:** Manual subdomain creation, branding configuration, account setup
- **Activation:** Producer cannot use platform until Ticktu activates

### Permission Model (MVP)

#### Simplified Role Structure
| Role | Scope | Capabilities |
|------|-------|--------------|
| **Ticktu Super Admin** | Platform-wide | Create/configure producers, manage all tenants |
| **Producer Admin** | Single tenant | Full access to their producer's features |

#### MVP Simplifications
- No role hierarchy within producer accounts
- No staff/viewer roles (all producer users are admins)
- RRPP have no platform access (tracking via URLs only)
- Multi-producer accounts deferred to post-MVP

### Pricing Model

#### Fee Structure
- **Model:** Transaction fee per ticket sold
- **Rate:** $1-1.5 USD or 10% (whichever applies)
- **Payer:** Buyer (end customer) pays fee
- **Producer Revenue:** 100% of ticket face value

#### No Subscription Tiers (MVP)
- Single pricing model for all producers
- No freemium/premium differentiation
- Tiered pricing may be introduced post-MVP for volume discounts

### Integration Requirements

#### Confirmed Integrations
| Integration | Purpose | Priority |
|-------------|---------|----------|
| **MercadoPago** | Payment processing | MVP - Critical |
| **Email Service** | Ticket delivery, notifications | MVP - Critical (TBD provider) |
| **QR Generation** | Unique ticket codes | MVP - Critical (TBD library) |

#### Architecture Decisions Needed
- Email delivery service selection (SendGrid, Mailgun, AWS SES, etc.)
- QR code generation library/approach
- Email templating system

#### Deferred Integrations
- Google Analytics / tracking pixels (producer can add manually)
- Social media APIs
- Third-party CRM systems
- Webhook/API for external systems

### Compliance Requirements

#### Payment Compliance
- **PCI DSS:** Delegated to MercadoPago - Ticktu never handles card data
- **Payment Data:** Only transaction IDs and status stored, no card details

#### Data Protection
- **Customer Data:** Stored per-tenant with isolation
- **Data Ownership:** Producers own their customer data
- **Export:** Producers can export their data (settlement reports, customer lists)

### Implementation Considerations

#### Database Architecture
- Multi-tenant schema design (tenant_id on all tables or schema-per-tenant)
- Index strategy for tenant isolation queries
- Backup and recovery per-tenant considerations

#### Scalability Patterns
- Stateless application servers for horizontal scaling
- Database connection pooling for multi-tenant efficiency
- CDN for static assets (producer branding, event images)

#### Security Boundaries
- Tenant ID validation on every request
- API authentication scoped to tenant
- Admin panel separate from producer panel

---

## Functional Requirements

### Tenant Management

| ID | Requirement |
|----|------------|
| FR-TM-01 | Platform supports multiple isolated tenants, each with unique subdomain (`{producer}.ticktu.com`), branding (logo, colors, imagery), and data boundaries |
| FR-TM-02 | Ticktu admin can create, configure, and activate new producer tenants including subdomain, branding, fee structure, and admin credentials |
| FR-TM-03 | Producer A cannot access, view, or query Producer B's data under any circumstances |
| FR-TM-04 | Each producer tenant has at least one admin user with full access to their tenant's features |

### Event Lifecycle

| ID | Requirement |
|----|------------|
| FR-EV-01 | Producers can create events with name, date, venue, description, and imagery |
| FR-EV-02 | Events follow a managed lifecycle: Draft → Published → Finished → Archived |
| FR-EV-03 | Published events are publicly visible on the producer's branded site |
| FR-EV-04 | Producers can mark events as Finished post-event, triggering settlement availability |
| FR-EV-05 | Cancelled events trigger refund processing for all paid tickets and notify affected buyers |
| FR-EV-06 | Producer dashboard displays an overview of active events, recent sales activity, and quick actions for event management |

### Ticketing & Pricing

| ID | Requirement |
|----|------------|
| FR-TK-01 | Producers can define multiple ticket types per event (e.g., General, VIP) with independent pricing and capacity limits |
| FR-TK-02 | Producers can create batch releases per ticket type with independent quantities and scheduled activation dates |
| FR-TK-03 | Each sold ticket generates a cryptographically unique QR code as its identifier |
| FR-TK-04 | Producers can issue complimentary (free) tickets with full tracking, bypassing payment flow |
| FR-TK-05 | Service fee ($1-1.5 USD or 10%) is added to ticket price and clearly displayed to buyer before payment |

### Purchase & Payment

| ID | Requirement |
|----|------------|
| FR-PU-01 | Buyers can complete ticket purchase without creating an account (guest checkout) |
| FR-PU-02 | Purchase flow is mobile-first and supports deep linking from social media (Instagram, etc.) |
| FR-PU-03 | Buyers can purchase multiple tickets (different types/quantities) in a single transaction, providing name and email per ticket holder |
| FR-PU-04 | Payment is processed through MercadoPago; Ticktu never stores or handles card data |
| FR-PU-05 | On payment failure, cart is preserved and buyer can retry with a different payment method without restarting |
| FR-PU-06 | On successful payment, buyer receives email confirmation with individual QR codes per ticket within 60 seconds |
| FR-PU-07 | Refunds are processable through MercadoPago API for cancelled events or support cases |
| FR-PU-09 | On successful payment, buyer is redirected to a confirmation page displaying order summary and ticket details |

### Attribution & RRPP

| ID | Requirement |
|----|------------|
| FR-RR-01 | Producers can generate unique trackable URLs per RRPP (promoter) for sales attribution |
| FR-RR-02 | Purchases made through RRPP links are attributed to the corresponding RRPP in real time |
| FR-RR-03 | Dashboard displays per-RRPP sales performance (tickets sold, revenue attributed) |

### Analytics & Reporting

| ID | Requirement |
|----|------------|
| FR-AN-01 | Real-time dashboard shows live sales data: tickets sold by type, revenue, batch status, and RRPP performance |
| FR-AN-02 | Post-event settlement report details total tickets sold, gross revenue, fees collected, and net producer earnings |
| FR-AN-03 | Customer database stores buyer information (name, email) and purchase history per producer tenant |
| FR-AN-04 | Producers can view check-in data: attendance count, peak entry times, ticket type breakdown |

### Validation & Offline

| ID | Requirement |
|----|------------|
| FR-VA-01 | Validation app authenticates to a specific event via event code and operator name |
| FR-VA-02 | QR scan validates ticket and displays result (valid + ticket info, or invalid + reason) in under 2 seconds |
| FR-VA-03 | Duplicate QR scans are rejected with clear "Already Used" indication |
| FR-VA-04 | Validation app caches event ticket data and operates fully offline when internet is unavailable |
| FR-VA-05 | Offline validations sync automatically when connectivity is restored, maintaining 100% data integrity |
| FR-VA-06 | Each scan is tracked with operator identity, timestamp, and device for audit purposes |

### Admin & Support

| ID | Requirement |
|----|------------|
| FR-AD-01 | Ticktu admin can look up any order by buyer name, email, or transaction ID across all tenants |
| FR-AD-02 | Ticktu admin can reissue tickets (generate new QR, invalidate old) for support cases |
| FR-AD-03 | Ticktu admin panel is separate from producer panel with platform-wide access |

---

## Non-Functional Requirements

### Performance

| ID | Requirement |
|----|------------|
| NFR-PE-01 | Producer branded site pages load in under 3 seconds on mobile 4G connections as measured by Lighthouse performance audit |
| NFR-PE-02 | QR ticket validation completes (scan to result display) in under 2 seconds as measured by app instrumentation |
| NFR-PE-03 | Ticket confirmation emails with QR codes are delivered within 60 seconds of successful payment as measured by email service provider logs |
| NFR-PE-04 | API endpoints respond in under 500ms for 95th percentile under normal load as measured by APM monitoring |

### Availability

| ID | Requirement |
|----|------------|
| NFR-AV-01 | Platform maintains 99.9%+ uptime during active ticket sales windows as measured by uptime monitoring |
| NFR-AV-02 | Payment processing failures do not cascade — if analytics or non-critical services fail, purchase flow continues operating |
| NFR-AV-03 | Validation app operates fully offline with cached event data; zero dependency on internet connectivity during event |

### Scalability

| ID | Requirement |
|----|------------|
| NFR-SC-01 | Platform supports up to 500 concurrent buyers during a ticket sales window without degradation as measured by load testing |
| NFR-SC-02 | Validation app supports scanning rates of minimum 40 tickets per minute per device without performance degradation |
| NFR-SC-03 | Architecture supports horizontal scaling of application servers for future growth |

### Security

| ID | Requirement |
|----|------------|
| NFR-SE-01 | Ticktu never stores, processes, or transmits credit card data — PCI compliance is fully delegated to MercadoPago |
| NFR-SE-02 | Tenant ID is validated on every API request; no cross-tenant data access is possible at application or database level |
| NFR-SE-03 | Each ticket QR code is cryptographically unique and non-guessable |
| NFR-SE-04 | Admin panel and producer panel are separate authentication boundaries |

### Data Integrity

| ID | Requirement |
|----|------------|
| NFR-DI-01 | Offline validation syncs maintain 100% data integrity — no scans lost on reconnection as verified by reconciliation checks |
| NFR-DI-02 | Offline conflict resolution handles edge case of same ticket validated on two devices offline with clear resolution strategy |
| NFR-DI-03 | Payment success rate of 99%+ as measured per event (failures are MercadoPago-side, not Ticktu-side) |
| NFR-DI-04 | Ticket delivery rate of 100% — every successful payment results in delivered tickets as measured per event |

### Email Deliverability

| ID | Requirement |
|----|------------|
| NFR-EM-01 | Ticket delivery emails achieve 99%+ inbox placement rate as measured by email service provider analytics |
| NFR-EM-02 | Email sending infrastructure configured with proper SPF, DKIM, and DMARC records |

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Complete Product MVP
- Not a stripped-down experiment, but full operational infrastructure
- Building the complete solution producers need from day one
- Revenue-generating from first event (Odisea)

**Why This Approach:**
- Problem is validated (founder + first client both experienced it)
- Market exists (producers already paying competitors)
- No need to "test if people want this" - they do
- Quality and reliability are non-negotiable for ticketing

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Producer Success Path (full event lifecycle)
- Buyer Success Path (purchase to entry)
- Door Operator (validation with offline)
- Ticktu Admin (producer onboarding)

**Must-Have Capabilities (13 Features):**

| # | Feature | Critical Because |
|---|---------|------------------|
| 1 | Multi-Tenant Producer Management | Foundation - nothing works without this |
| 2 | Event Lifecycle Management | Core product functionality |
| 3 | Ticket Type System | Revenue generation |
| 4 | Batch Release Management | Producer flexibility |
| 5 | Purchase Flow System | Revenue generation |
| 6 | Payment Processing | Revenue generation |
| 7 | RRPP Attribution System | Producer operations |
| 8 | Complimentary Ticket Management | Producer operations |
| 9 | Customer Database | Data value proposition |
| 10 | Real-Time Dashboard | Data value proposition |
| 11 | Support/Admin Tools | Operations sustainability |
| 12 | Ticket Validation App | Event execution critical |
| 13 | Post-Event Settlement | Financial reconciliation |

**Nothing Cut:** All 13 features are committed for MVP. No artificial time pressure requiring scope reduction.

### Post-MVP Features

**Phase 2 - Deepen Engagement:**
| Feature | Value Added |
|---------|-------------|
| Self-service branding | Reduces Ticktu workload |
| Expense tracking | Producer financial management |
| Apple/Google Wallet | Enhanced ticket delivery |
| Loyalty programs | Customer retention tools |
| Push notifications | Direct customer engagement |
| Advanced analytics | Deeper insights |

**Phase 3 - Scale:**
| Feature | Value Added |
|---------|-------------|
| Bar sales integration | New revenue stream |
| Multi-venue support | Larger events |
| Public API | Third-party ecosystem |
| White-label mobile app | Premium offering |
| Regional expansion | Market growth |

### Risk Mitigation Strategy

**Technical Risks:**
| Risk | Mitigation |
|------|------------|
| Offline validation sync conflicts | Design conflict resolution in architecture |
| Payment failures during high traffic | MercadoPago handles scaling; implement retry logic |
| Email deliverability | Use reputable ESP with proper SPF/DKIM/DMARC |
| Multi-tenant data leakage | Tenant ID validation on every query; security testing |

**Market Risks:**
| Risk | Mitigation |
|------|------------|
| Producers don't switch | First client (Odisea) already committed |
| Buyers don't trust new platform | MercadoPago provides payment trust; producer brand provides event trust |
| Competition responds | Move fast, build relationships, deliver quality |

**Resource Risks:**
| Risk | Mitigation |
|------|------------|
| Development takes longer | No artificial deadline; quality over speed |
| Scope creep | 13 features locked; Phase 2 clearly separated |
| Single developer bottleneck | Architecture decisions documented for potential team growth |

### Build Philosophy

**Quality Over Speed:**
- No rush to launch with incomplete features
- Build it right the first time
- Reliability is the product (ticketing can't fail on event night)

**Architecture-Driven Sequencing:**
- Technical foundation determines build order
- Not driven by feature priority or business pressure
- Proper multi-tenant architecture before any features
