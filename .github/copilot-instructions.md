# Copilot Instructions

## Project Overview

This is a greenfield project to build a **Small Claims Process Automation System** for a California dental lab to recover unpaid invoices. The system automates the administrative and workflow-heavy parts of the California small claims process (California Code of Civil Procedure §§ 116.110 et seq.).

Key limits:
- Business claims: ≤$6,250
- Individual claims: ≤$12,500
- Filing frequency: Max 2 claims >$2,500 per calendar year (individuals)

## High-Level Architecture

```
Web Application (SaaS)
├── A/R Module (aging, import, eligibility scoring)
├── Case Management (workflow: demand → filed → served → hearing → judgment → collection)
├── Document Generator (SC-100, SC-104, EJ-130, WG-001, etc.)
├── Deadline Engine (service deadlines, filing deadlines, 30-day post-judgment wait)
├── E-Filing Integrator (CA Guide & File, county portals)
└── Collections Tracker (post-judgment: writs, levies, garnishments)

External Integrations
├── CA Secretary of State Business Search (defendant lookup, agent for service)
├── County Court E-Filing APIs
└── USPS Certified Mail + Return Receipt (demand letter delivery)
```

### Key Data Models

**Debtor** — entity_type (individual|corp|partnership), license_number (DDS #), agent_for_service, Cases[]

**Case** — status (demand|filed|served|hearing|judgment|collected|closed), claim_amount, court_fees, forms[], timeline[], documents[], judgment{}

**Event** — event_type, timestamp, deadline, completed, reminder_sent

## Build, Test, and Lint Commands

> No build commands exist yet — this is a greenfield project. When scaffolding:
> - Use `npm init` for Node.js or `pip init` for Python depending on chosen stack
> - Configure `npm test` / `pytest` / equivalent for unit tests
> - Run single test: `npm test -- --grep <test-name>` or `pytest -k <test-name>`

## Key Conventions

### Compliance (Critical)
- **No legal advice** — System automates administrative tasks only. Never suggest legal strategy or represent that the system provides legal guidance. All AI-generated content must include: *"This is an automated administrative tool, not legal advice."*
- **FDCPA / Rosenthal Act** — Actions that violate CA debt collection laws must be blocked
- **UPL guardrails** — Never generate content that constitutes unauthorized practice of law

### Form Handling
- Use XML/XFDF form fields for PDF auto-fill, **not** coordinate-based filling (per TD-04)
- Monitor Judicial Council form updates (e.g., SC-100 Rev. Jan 2026)
- All court forms must be prefillable from case/debtor data

### Court Integration
- No uniform CA court API — each county uses different systems (Guide & File, Odyssey, custom)
- Build county-specific adapters with manual upload fallback
- Service of process rules vary by county; some rural counties lack registered process servers

### Deadline Tracking
- Service deadline: ≥15 days before hearing (≥20 days if out-of-county)
- Proof of Service (SC-104): file ≥5 days before hearing
- Post-judgment wait: 30 days before enforcement actions
- Writ of Execution: expires 180 days from issuance
- Judgment expiration: 10 years (renew at Year 8-9)

### Module Priorities (P0 = MVP)
- A/R Import, Eligibility Scorer, Demand Letter Generator, CMR Delivery
- Defendant Resolver, Agent for Service Lookup, Court Locator
- SC-100 Auto-Fill, Evidence Bundle Builder, Court Date Parser
- Service Deadline Alerts, SC-104 Auto-Fill, Proof of Service Upload
- Judgment Logger, 30-Day Wait Tracker, Writ of Execution Request
- Payment Tracker, Satisfaction of Judgment
- FDCPA Guardrails, Audit Log

## Directory Structure (Planned)

```
src/
├── ar/                  # A/R module (aging, import, scoring)
├── cases/               # Case management and workflow
├── documents/           # Form generation and templates
├── filing/              # Court e-filing integration
├── collections/         # Post-judgment enforcement
├── compliance/          # FDCPA guardrails, audit log
└── external/            # CA SOS, USPS integrations

forms/
├── sc100.json           # PDF form field definitions
├── sc104.json
├── ej130.json
└── ...

tests/
├── unit/
├── integration/
└── fixtures/
```

## Important Technical Debts

| ID | Issue | Mitigation |
|----|-------|------------|
| TD-01 | Court API fragility | County-specific adapters + manual upload fallback |
| TD-02 | Service of process variability | County-specific service playbooks |
| TD-08 | UPL risk (CRITICAL) | Prominent disclaimers; optional attorney review checkpoints |
| TD-09 | USPS CMR integration | Plan for manual CRR upload fallback |

## External Resources

- [California Small Claims Court](https://www.courts.ca.gov/smallclaims.htm)
- [Judicial Council Forms](https://www.courts.ca.gov/forms.htm)
- [CA Secretary of State Business Search](https://businesssearch.sos.ca.gov/)
- [Guide & File E-Filing](https://www.courts.ca.gov/guideandfile.htm)