# PRD: Small Claims Process Automation System
## For Dental Lab Business — Accounts Receivable Recovery (California)

**Version:** 1.0  
**Date:** 2026-06-01  
**Prepared for:** Dental Lab Business Owner (California)  
**Scope:** Automate the end-to-end small claims process for recovering unpaid dental lab invoices from dentists/practices.

---

## 1. Executive Summary

Dental labs in California frequently face unpaid invoices from dentists and dental practices. The California Small Claims Court provides an accessible, low-cost path to recover debts up to $6,250 (business limit) or $12,500 (individual limit). However, the process is manual, time-consuming, and error-prone — involving demand letters, form preparation, service of process, deadline tracking, and post-judgment collection.

This PRD defines a software system that automates the administrative and workflow-heavy parts of the small claims process, allowing a dental lab owner to recover A/R with minimal legal overhead while maintaining full compliance with California Code of Civil Procedure §§ 116.110 et seq.

---

## 2. Problem Statement

### 2.1 Business Pain Points
- Unpaid invoices accumulate, often $5K–$50K+ across multiple dentists
- No internal legal staff; owner handles collections personally
- Small claims process is unfamiliar, causing delays and missed deadlines
- Tracking 30+ day, 60+ day, 90+ day aging manually via spreadsheets
- Post-judgment collection (writs, garnishments) is especially opaque
- No systematic demand letter workflow before escalating to court

### 2.2 Legal Context (California Small Claims)
| Parameter | Rule |
|-----------|------|
| Business limit | $6,250 per claim |
| Individual limit | $12,500 per claim |
| Filing frequency | Max 2 claims >$2,500 per calendar year (individuals) |
| Statute of limitations | Written contract: 4 years; Oral: 2 years; Open account: 4 years |
| Service deadline | ≥15 days before hearing (≥20 days if out-of-county) |
| Proof of Service | Required (SC-104); must file ≥5 days before hearing |
| Court filing fee | $30–$100 depending on claim amount |
| Writ of Execution fee | ~$40 |
| Sheriff levy fee | ~$45 |
| Writ expiration | 180 days from issuance |

### 2.3 Dental Lab Specifics
- Invoices are typically open-account (ongoing services, monthly billing)
- Debtors are licensed dentists (DDS/DMD) or dental corporations
- Recovery value per claim often falls under $6,250 (ideal for small claims)
- Need to identify correct defendant: individual dentist vs. dental corp vs. practice entity
- Agent for Service of Process lookup required for corporate defendants

---

## 3. Target Users

| User | Role | Needs |
|------|------|-------|
| Dental Lab Owner | Primary user | Initiate claims, track cases, receive alerts, upload evidence |
| Office Manager | Delegate | Manage debtor list, run aging reports, print/fax documents |
| Process Server (external) | Integration | Receive service instructions, upload proof of service |
| Small Claims Advisor | Optional consult | Review edge cases, advise on complex service issues |

---

## 4. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB APPLICATION (SaaS)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │ Dashboard   │  │ Case Mgmt   │  │ Document Generator  │   │
│  │ (A/R Aging) │  │ (Workflow)  │  │ (Forms SC-100 etc)  │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │ Deadline    │  │ E-Filing    │  │ Collections Tracker │   │
│  │ Engine      │  │ Integrator  │  │ (Post-Judgment)     │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │ Case DB     │  │ Document    │  │ Template Library    │   │
│  │ (PostgreSQL)│  │ Storage     │  │ (PDF/JSON Forms)    │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                     │
│  CA SOS Biz Search  │  County Court APIs  │  USPS/CMR      │
│  (Agent lookup)     │  (Guide & File)     │  (Cert Mail)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Specific Function List

### MODULE A: Accounts Receivable / Pre-Litigation

| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| A.1 | **A/R Import** | Import aged receivables from dental lab billing system (CSV/API) | P0 |
| A.2 | **A/R Aging View** | Bucket invoices: Current, 30-, 60-, 90-, 120+ days; sort by amount | P0 |
| A.3 | **Eligibility Scorer** | Auto-flag claims: amount ≤$6,250, within SOL, CA debtor, collectible | P0 |
| A.4 | **Demand Letter Generator** | Generate CA-compliant demand letters with 30-day pay-or-sue notice | P0 |
| A.5 | **Demand Letter Delivery** | Send via USPS Certified Mail + Return Receipt (CMR) with tracking | P0 |
| A.6 | **Demand Response Tracker** | Track payment, partial payment, dispute, or no-response per debtor | P0 |
| A.7 | **Settlement Offer Builder** | Generate payment plan or discounted lump-sum settlement letters | P1 |
| A.8 | **A/R Write-off Flow** | Mark uncollectible after judgment exhaustion; export for taxes | P2 |

### MODULE B: Case Preparation & Filing

| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| B.1 | **Defendant Resolver** | Auto-lookup debtor entity: individual DDS, corp, or partnership via CA SOS | P0 |
| B.2 | **Agent for Service Lookup** | Fetch registered agent from CA Secretary of State for corporate defendants | P0 |
| B.3 | **Court Locator** | Determine proper venue: county where debtor resides/does business | P0 |
| B.4 | **SC-100 Auto-Fill** | Populate Plaintiff's Claim (SC-100) from invoice + debtor data | P0 |
| B.5 | **SC-100A Multi-Defendant** | Add additional defendants (SC-100A) when suing dentist + practice | P1 |
| B.6 | **Fictitious Name Check** | Flag if plaintiff uses DBA; auto-include SC-103 if required | P1 |
| B.7 | **Evidence Bundle Builder** | Compile invoices, delivery receipts, demand letter proof, contracts | P0 |
| B.8 | **Fee Calculator** | Compute filing fee + service fee + potential recoverable costs | P1 |
| B.9 | **E-Filing Submit** | Submit to court via Guide & File or county e-filing portal | P1 |
| B.10 | **Court Date Parser** | Extract hearing date from court clerk stamp/confirmation | P0 |

### MODULE C: Service of Process

| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| C.1 | **Serve Method Selector** | Recommend: personal, substituted, certified mail (court clerk) | P0 |
| C.2 | **Server Assignment** | Assign registered process server or county sheriff; generate instructions | P0 |
| C.3 | **SC-104 Auto-Fill** | Generate Proof of Service with case info pre-filled | P0 |
| C.4 | **Service Deadline Alert** | Countdown to 15-day (or 20-day out-of-county) deadline from hearing | P0 |
| C.5 | **Substituted Service Logic** | Guide server: serve adult at home/work + mail copy; track both steps | P1 |
| C.6 | **Service Confirmation Upload** | Process server uploads signed SC-104 + photos | P0 |
| C.7 | **File Proof of Service** | Remind/file SC-104 with court ≥5 days before hearing | P0 |
| C.8 | **Service Failure Recovery** | If service fails, suggest alternative: re-serve, publication, or dismissal | P1 |

### MODULE D: Hearing & Trial Prep

| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| D.1 | **Evidence Organizer** | Sort exhibits: invoices, delivery logs, demand letter, payment history | P0 |
| D.2 | **Statement Builder** | Generate plaintiff statement script: facts, amount owed, legal basis | P0 |
| D.3 | **Witness Tracker** | Log witnesses (e.g., delivery driver); generate subpoena if needed | P2 |
| D.4 | **Hearing Calendar Sync** | Push hearing date to Google/Outlook calendar with prep reminder | P1 |
| D.5 | **Post-Hearing Outcome** | Record judgment (win/loss/dismissal), amount awarded, and judge notes | P0 |

### MODULE E: Post-Judgment Collection

| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| E.1 | **Judgment Entry Logger** | Record judgment amount, date, interest rate (10% in CA) | P0 |
| E.2 | **30-Day Wait Tracker** | Count 30 days from Notice of Entry before enforcement actions | P0 |
| E.3 | **Debtor Asset Search** | Guide: bank locators, DMV lookup, property records, employment info | P1 |
| E.4 | **Debtor's Exam Scheduler** | Generate application, schedule exam, track debtor appearance | P1 |
| E.5 | **Writ of Execution Request** | Auto-fill EJ-130; calculate filing fee; track 180-day expiration | P0 |
| E.6 | **Bank Levy Workflow** | Generate levy instructions; track exempt funds; handle claim of exemption | P1 |
| E.7 | **Wage Garnishment Workflow** | Generate WG-001/WG-002; send to sheriff; track employer response | P1 |
| E.8 | **MC-012 Costs & Interest** | Auto-calculate and file Memorandum of Costs + accrued interest | P1 |
| E.9 | **Payment Tracker** | Record partial payments, payment plans, and remaining balance | P0 |
| E.10 | **Satisfaction of Judgment** | Generate and file form when debt fully paid | P0 |

### MODULE F: Compliance & Reporting

| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| F.1 | **FDCPA / Rosenthal Act Guardrails** | Block actions violating CA debt collection laws | P0 |
| F.2 | **Audit Log** | Immutable log of all letters sent, filings made, deadlines met/missed | P0 |
| F.3 | **Collection Rate Dashboard** | Recovery rate by debtor type, age of debt, claim size | P1 |
| F.4 | **Cost-Benefit Report** | Net recovery after fees, time cost, and success rate per claim | P1 |
| F.5 | **Export for Accountant** | Generate 1099-C or write-off summaries for tax reporting | P2 |

---

## 6. Data Model (Simplified)

```
Debtor
├── debtor_id, entity_type [individual|corp|partnership]
├── name, dba_name, license_number [DDS #]
├── address, county, agent_for_service
└── Cases[]

Case (Small Claim)
├── case_id, status [demand|filed|served|hearing|judgment|collected|closed]
├── claim_amount, court_fees, costs_accrued
├── debtor_id, venue_county, court_name
├── forms: {sc100, sc104, sc100a, sc103, ej130, wg001...}
├── timeline: [Event]
├── documents: [Document]
└── judgment: {amount, date, interest_rate, balance_remaining}

Event
├── event_id, case_id, event_type, timestamp
├── description, deadline, completed, reminder_sent
```

---

## 7. User Flows

### Flow 1: Demand Letter → Small Claims Filing
```
A/R Import → Eligibility Check → Demand Letter Gen → 
CMR Send → 30-Day Wait → No Response → 
Defendant Resolver → SC-100 AutoFill → Court Filing
```

### Flow 2: Service of Process
```
Court Date Received → Serve Method Select → Server Assign → 
SC-104 Pre-fill → Service Performed → Proof Upload → 
File with Court (≥5 days pre-hearing)
```

### Flow 3: Win → Collect
```
Judgment Entered → 30-Day Wait → Asset Search → 
Writ of Execution → Bank Levy / Wage Garnish → 
Payment Received → Satisfaction Filed
```

---

## 8. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Security | SOC 2 Type II; encryption at rest and in transit; HIPAA awareness (dental lab context) |
| Availability | 99.9% uptime; critical deadline alerts must not fail |
| Auditability | 7-year retention of all case documents and logs (matches CA judgment life) |
| Compliance | California CCP §§ 116.110 et seq.; FDCPA; Rosenthal Fair Debt Collection Practices Act |
| Accessibility | WCAG 2.1 AA; Spanish-language form support |
| Integrations | Guide & File (CA courts), CA SOS Business Search, USPS CMR, Stripe/PayPal (payments) |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Demand letter response rate | >30% |
| Cases filed per user/month | 2–5 (sustainable volume) |
| Win rate at hearing | >75% |
| Post-judgment collection rate | >40% |
| Time from demand to filing | <45 days |
| Time from judgment to first payment | <90 days |
| Manual hours saved per case | 4–6 hours |

---

## 10. Assumptions & Dependencies

1. California small claims limits and rules remain stable (watch SB-71 and legislative updates)
2. County courts maintain e-filing availability (Guide & File or county-specific)
3. CA SOS business search API accessible (or screen-scrape fallback)
4. Process server network exists in user's county (or sheriff service available)
5. Dental lab has structured A/R data export capability
6. User acknowledges this is **not legal advice**; system is administrative automation only

---

## 11. Technical Debts (Identified)

| Debt ID | Description | Severity | Mitigation |
|---------|-------------|----------|------------|
| TD-01 | **Court API Fragility** | HIGH | No uniform CA court API; each county uses different e-filing systems (Guide & File, Odyssey, custom). Build county-specific adapters or fallback to manual upload with guided checklist. |
| TD-02 | **Service of Process Variability** | HIGH | Personal vs. substituted vs. agent-for-service rules vary by county. Some rural counties lack registered process servers. Build county-specific service playbooks. |
| TD-03 | **Agent for Service Lookup Reliability** | MEDIUM | CA SOS search may lag; dissolved entities may show active agents. Implement stale-data warnings and manual override. |
| TD-04 | **Form Version Drift** | MEDIUM | Judicial Council updates forms (e.g., SC-100 Rev. Jan 2026). PDF auto-fill requires field mapping maintenance. Use XML/XFDF form fields, not coordinate-based filling. |
| TD-05 | **Exemption Complexity (Bank Levy)** | MEDIUM | Debtor can claim exemptions (CCP § 704). System must track WG-008/009/010 opposition flow — requires legal reasoning beyond pure automation. |
| TD-06 | **Judgment Renewal (10-Year Cycle)** | LOW | CA judgments expire after 10 years unless renewed. Build reminder cron at Year 8 and Year 9. |
| TD-07 | **Multi-County Scaling** | MEDIUM | Filing and service rules differ across 58 CA counties. MVP should target 3–5 highest-volume counties, then expand. |
| TD-08 | **UPL Risk (Unauthorized Practice of Law)** | CRITICAL | System must not "advise" on legal strategy, only automate known processes. Include prominent disclaimers and optional attorney review checkpoints. |
| TD-09 | **CMR Integration (USPS)** | MEDIUM | USPS Certified Mail API is limited; Return Receipt electronic (CRR) may not integrate cleanly. Plan for manual CRR upload fallback. |
| TD-10 | **Payment Plan Enforcement** | LOW | Post-judgment payment plans are voluntary unless court-ordered. Track but don't assume enforceability. |

---

## 12. Appendices

### Appendix A: Key California Forms
| Form | Purpose |
|------|---------|
| SC-100 | Plaintiff's Claim and ORDER to Go to Small Claims Court |
| SC-100-INFO | Information for the Small Claims Plaintiff |
| SC-100A | Other Plaintiffs or Defendants |
| SC-103 | Fictitious Business Name (if DBA) |
| SC-104 | Proof of Service |
| SC-104B | What Is "Proof of Service"? (instructions) |
| SC-104C | How to Serve a Business or Public Entity |
| SC-107 | Small Claims Subpoena for Personal Appearance and Production |
| EJ-130 | Writ of Execution |
| WG-001 | Application for Earnings Withholding Order |
| WG-002 | Earnings Withholding Order |
| WG-005 | Employer's Return |
| WG-008 | Notice of Filing of Claim of Exemption |
| WG-009 | Notice of Opposition to Claim of Exemption |
| WG-010 | Notice of Hearing on Claim of Exemption |
| WG-015/EJ-135 | Declaration of Address Verification |
| MC-012 | Memorandum of Costs after Judgment |

### Appendix B: Glossary
- **A/R**: Accounts Receivable
- **CMR**: Certified Mail Return Receipt
- **DDS**: Doctor of Dental Surgery
- **DBA**: Doing Business As
- **FDCPA**: Fair Debt Collection Practices Act
- **SOS**: Secretary of State
- **SOL**: Statute of Limitations
- **UPL**: Unauthorized Practice of Law
- **WG**: Wage Garnishment (form prefix)

---

*End of PRD*
