---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - '/home/nacholc/proyectos/ticktu/_bmad-output/analysis/brainstorming-session-2026-01-19.md'
date: 2026-01-25
author: Nacholc
---

# Product Brief: Ticktu

## Executive Summary

Ticktu is a white-label ticketing and operations platform that transforms event producers from marketplace dependents into independent business owners. Born from firsthand experience in the production industry, Ticktu provides each producer with their own branded website, complete operational tools, and data intelligence that was previously invisible to them.

The platform addresses a growing market reality: as experiential events multiply and competition intensifies, producers need infrastructure that helps them stand out, personalize experiences, and make data-driven decisions. Ticktu serves as the command center for producers of all event types—from nightclubs to festivals to corporate experiences.

**Core Value Proposition:** Own your brand. Own your data. Own your growth.

---

## Core Vision

### Problem Statement

Event producers are forced to sell through generic ticketing marketplaces that bury their brand, scatter their data across disconnected tools, and treat them as inventory suppliers rather than business owners. They lack a central hub for their operations and are blind to the patterns that could drive their growth.

### Problem Impact

- **Brand dilution**: Producer identity lost within marketplace platforms
- **Data blindness**: No visibility into peak times, best sellers, sales patterns, customer behavior
- **Operational fragmentation**: Ticket sales, PR tracking, financials, and event management live in separate silos
- **Growth ceiling**: Without actionable data, producers can't measure performance or scale strategically
- **Dependency**: Producers rely on platforms that don't prioritize their success

### Why Existing Solutions Fall Short

Current platforms like Passline, Entrasta, and RedTickets focus narrowly on ticket transactions. They provide:
- A generic storefront that competes with the producer's own brand
- Basic sales data without operational intelligence
- No tools for PR management, financial tracking, or customer relationships
- No path to producer independence or brand ownership

These platforms serve the marketplace, not the producer.

### Proposed Solution

Ticktu provides each producer with:

1. **Branded Website**: Their own subdomain (producer.ticktu.com) with full brand control
2. **Complete Event Management**: Draft/publish workflows, batch releases, RRPP tracking, complimentary tickets
3. **Customer Intelligence**: Buyer database, purchase patterns, attendance analytics
4. **Operational Tools**: Real-time dashboards, support tools, post-event settlements
5. **Reliable Infrastructure**: Mobile-first purchasing, online-first validation with connection status indicator _(offline capability descoped 2026-03-19)_, multi-device scanning

The platform is built as multi-tenant SaaS—complete infrastructure built once, replicated for each client.

### Key Differentiators

| Differentiator | Why It Matters |
|----------------|----------------|
| **Founder experience** | Built by a former producer who lived these problems |
| **Brand ownership** | Producer's identity front and center, not buried |
| **Operational hub** | Not just tickets—complete producer command center |
| **Data intelligence** | Measure everything useful: peaks, patterns, performance |
| **Community building (Phase 2)** | Transform customers into loyal communities via wallet integration, personalized notifications, reward programs |
| **Scalable foundation** | MVP → expense tracking → loyalty → bar sales → full ecosystem |
| **Market timing** | Experiential events growing; competition demands better infrastructure |

### Vision Trajectory

**MVP:** Complete ticketing infrastructure with brand ownership and operational tools

**Phase 2:**
- Expense tracking and break-even analysis
- Apple/Google Wallet integration with push notifications
- Customer loyalty programs and reward systems
- Personalized communication tools
- Bar sales management and analytics

**The Arc:** From ticket seller → data-driven operator → community builder

---

## Target Users

### Primary Users

#### Event Organizers (Platform Administrators)

**Persona: The Odisea Team**

A medium-sized event production company organizing nighttime parties in Uruguay. They operate as a team with multiple people managing operations, and they've outgrown generic ticketing marketplaces.

**Profile:**
- Team-based operations (not solo operators)
- Already selling considerable ticket volume
- Experienced with ticketing platforms but frustrated by limitations
- Want to stand out through brand differentiation
- Need a partner who listens and implements features they actually need

**Current Pain:**
- Generic marketplaces bury their brand identity
- Can't measure what matters (peaks, patterns, performance)
- No path to customer loyalty or community building
- Feel like vendors, not partners, to their current platforms

**Success Criteria:**
- Everything current platforms do, plus personalization
- Ability to measure what was previously invisible
- A responsive partner who builds what they need
- Future access to loyalty and community tools

**Decision Process:**
Production teams make technology decisions (investors/partners defer to operators). Adoption driven by peer recommendations and direct relationships.

---

### Co-Primary Users

#### Event Buyers (Ticket Purchasers)

**Persona: Mobile-First Party Goer**

Discovers events through social media, clicks a link, and expects instant, trustworthy purchasing on their phone. No patience for slow sites or confusing flows.

**Profile:**
- Primarily mobile (purchasing from Instagram/TikTok links)
- Values speed and trust signals (professional design, known payment processor)
- Zero tolerance for downtime or friction
- Wants guest checkout - no account creation
- Expects tickets delivered immediately to email

**Experience Requirements:**
- Fast-loading, mobile-optimized pages
- MercadoPago at checkout (borrowed trust)
- Deep links directly to ticket selection
- One email with all tickets (unique QR per ticket)
- Professional, branded experience that matches producer's identity

**Critical Note:** Buyer experience is equally important as producer experience. Platform reliability and UX quality are non-negotiable.

---

### Secondary Users

#### Door Operators (Validation Staff)

**Persona: Experienced Event Staff**

Typically employees of the production company, already familiar with similar tools. Need zero training - the app must be self-explanatory.

**Profile:**
- Staff members, not contractors
- Experience with ticketing validation tools
- Need to scan quickly under pressure (high-traffic entry points)
- May work in low-connectivity environments

**Requirements:**
- Intuitive interface (usable in 5 minutes without training)
- Scan speed under 2 seconds
- Clear visual feedback (green = valid, red = stop)
- Online-first validation with connection status indicator ("Sin conexión" banner) — ~~offline capability with sync on reconnect~~ descoped 2026-03-19
- Multi-device support for large events

#### RRPP (PR/Promoters)

Lightweight users who only need tracking links - no platform account required. Attribution happens automatically through unique URLs.

---

### User Journey

#### Producer Journey

1. **Discovery:** Direct outreach from Ticktu team, or word-of-mouth from producer network
2. **Evaluation:** Conversation about pain points, demonstration of brand ownership and measurement capabilities
3. **Onboarding:** Subdomain setup (producer.ticktu.com), branding configuration, first event creation
4. **Core Usage:** Event management, real-time dashboard monitoring, RRPP link distribution, customer support tools
5. **Success Moment:** First event runs smoothly with full visibility into metrics they never had before
6. **Long-term:** Data-driven decisions, brand growth, future loyalty program adoption

#### Buyer Journey

1. **Discovery:** Social media link from event promotion
2. **Landing:** Fast-loading, branded producer page
3. **Purchase:** Select tickets → MercadoPago checkout → email confirmation
4. **Delivery:** Email with unique QR codes for each ticket
5. **Event:** Present QR at door, validated in under 2 seconds
6. **Future:** (Phase 2) Wallet integration, loyalty rewards, push notifications

---

### Market Scope

While Ticktu was born from nightclub/party production, the platform serves **any organization needing ticket sales + event infrastructure**:

- Nightclub and party producers (initial niche)
- Festival organizers
- Football leagues and sports venues
- Conference and corporate event planners
- Any ticketing need requiring operational management

**Geographic Focus:** Uruguay first (validate and iterate with local feedback), then regional expansion via digital marketing.

---

## Success Metrics

### User Success Metrics

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

---

### Business Objectives

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

---

### Key Performance Indicators

#### Platform Health
| KPI | Target | Frequency |
|-----|--------|-----------|
| Uptime | 99.9%+ during sales windows | Continuous |
| Page load time | Optimized (security/stability first) | Per release |
| Payment success rate | 99%+ | Per event |
| Ticket delivery rate | 100% | Per event |

#### Business Growth
| KPI | Target | Frequency |
|-----|--------|-----------|
| Tickets sold (cumulative) | 50,000 by end of Year 1 | Monthly tracking |
| Revenue per month | Growing trend | Monthly |
| New producers onboarded | 1+ per quarter after launch | Quarterly |
| Producer churn | 0% | Annual |

#### Engagement
| KPI | Target | Frequency |
|-----|--------|-----------|
| Dashboard logins | Regular usage by producers | Weekly |
| Events created per producer | Multiple events per year | Per producer |
| Referrals | At least 1 referral per happy producer | Annual |

---

### North Star Metric

**Total tickets sold through the platform.**

This single metric captures:
- Producer adoption (more producers = more tickets)
- Producer retention (repeat events = more tickets)
- Buyer experience (good UX = completed purchases)
- Platform reliability (uptime = no lost sales)

Everything else ladders up to this.

---

## MVP Scope

### Delivery Model

**Managed Platform (Not Self-Service)**

Ticktu MVP operates as a white-glove managed service:
- Ticktu team configures producer subdomains and branding
- Producers do not have self-service customization tools
- Changes to branding/styling requested through Ticktu support
- This ensures quality control and strengthens the "partner who listens" relationship

### Core Features

The MVP delivers complete ticketing infrastructure - not a stripped-down version, but the full operational foundation producers need.

#### 1. Multi-Tenant Producer Management
- Producer subdomains (producer.ticktu.com)
- Custom branding (logo, colors, images) - **configured by Ticktu team**
- Complete tenant isolation
- Producer authentication and access control
- **No self-service customization** - changes requested through Ticktu support

#### 2. Event Lifecycle Management
- Event states: Draft → Published → Finished → Archived
- Event details: name, date/time, venue, description, images
- Visibility controls and scheduling
- Multi-event support per producer

#### 3. Ticket Type System
- Multiple ticket tiers per event
- Individual pricing and capacity per type
- Naming flexibility (VIP, General, Early Bird, etc.)
- Real-time availability tracking

#### 4. Batch Release Management
- Phased ticket releases within same event
- Scheduled release activation
- Price changes across batches
- Capacity management per batch

#### 5. Purchase Flow System
- Mobile-first responsive design
- Guest checkout (no account required)
- Multi-ticket selection and quantity
- Deep link support for social media
- Email delivery with unique QR per ticket

#### 6. Payment Processing
- MercadoPago integration
- Service fee calculation ($1-1.5 USD or 10%)
- Buyer pays fee, producer receives 100%
- Transaction status tracking
- Payment failure handling

#### 7. RRPP Attribution System
- Unique tracking URLs per promoter
- Sales attribution by source
- Commission tracking (if applicable)
- Performance reporting per RRPP

#### 8. Complimentary Ticket Management
- Free ticket generation
- VIP/guest list management
- Delivery via email with QR codes
- Tracking separate from paid sales

#### 9. Customer Database
- Buyer information capture
- Purchase history per customer
- Contact information for producer use
- Event attendance tracking

#### 10. Real-Time Dashboard
- Live sales monitoring
- Revenue tracking
- Attendance metrics (check-ins vs. tickets sold)
- Peak sales time visibility
- Ticket type performance

#### 11. Support/Admin Tools
- Order lookup and management
- Ticket reissuance capability
- Customer issue resolution
- Transaction history access

#### 12. Ticket Validation App
- QR code scanning
- Online-first validation with connection status indicator ("Sin conexión" banner) — ~~offline capability with sync on reconnect~~ descoped 2026-03-19
- Multi-device support for large events
- Clear visual feedback (valid/invalid/already used)
- Sub-2-second validation speed

#### 13. Post-Event Settlement
- Financial reconciliation
- **Producer earnings summary** (ticket revenue only - fees not itemized)
- Payout reporting
- Transaction record export

---

### Out of Scope for MVP

Explicitly deferred to Phase 2 and beyond:

| Feature | Rationale |
|---------|-----------|
| Self-service branding/customization | Managed service model for MVP; Ticktu configures |
| Expense tracking / break-even analysis | Adds complexity; producers can use external tools initially |
| Apple/Google Wallet integration | Enhancement, not essential for ticket delivery |
| Customer loyalty programs | Requires MVP customer base first |
| Push notifications | Depends on wallet integration |
| Bar sales management | Separate product vertical |
| Personalized email campaigns | Can use external email tools initially |
| Advanced analytics (AI insights) | Basic dashboard metrics sufficient for MVP |
| Multiple payment processors | MercadoPago covers Uruguay market |
| Multi-language support | Uruguay-focused launch is Spanish-first |
| Public API | Internal use only for MVP |
| Fee breakdown for producers | Producer sees earnings only; fees transparent to buyer |

**Boundary Communication:** Phase 2 features are valuable but not required to validate the core value proposition. MVP proves: "Producers can run their business through their own branded platform."

---

### MVP Success Criteria

The MVP is successful when:

| Criteria | Validation |
|----------|------------|
| Odisea runs first event | Zero critical issues during live event |
| Buyers complete purchases | High completion rate from landing to confirmation |
| Tickets validate at door | Validation app works reliably online with connection status indicator _(offline descoped 2026-03-19)_ |
| Producer sees value | Access to metrics they never had before |
| Platform stays up | No downtime during sales windows |
| Revenue flows correctly | Fee collection and settlement work accurately |

**Go/No-Go Decision Point:** After Odisea's first event, evaluate:
- Would they run their next event on Ticktu? (Retention signal)
- Would they recommend it to other producers? (Referral signal)
- Did the platform handle the load without issues? (Technical validation)

---

### Future Vision

#### Phase 2 (Post-MVP Validation)
- Self-service branding tools for producers
- Expense tracking and break-even analysis
- Apple/Google Wallet ticket delivery
- Customer loyalty programs and rewards
- Personalized push notifications
- Advanced analytics and insights

#### Phase 3 (Scale)
- Bar sales integration and management
- Multi-venue support
- API for third-party integrations
- White-label mobile app for producers
- Regional expansion beyond Uruguay

#### Long-Term Vision (2-3 Years)
Ticktu becomes the **complete event operations platform** for Latin America:
- Command center for all event types (parties, sports, conferences, festivals)
- Full customer lifecycle management (discovery → purchase → attendance → loyalty)
- Data intelligence that helps producers grow strategically
- Ecosystem of integrated services (payments, marketing, operations)

**The Arc:** MVP (prove value) → Phase 2 (deepen engagement) → Phase 3 (scale reach) → Platform (own the market)
