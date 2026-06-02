# Dashboard UI/UX Plan — Apple HIG Compliance

## Design Principles

| Apple HIG Principle | Application |
|---------------------|-------------|
| **Spatial Organization** | Information arranged by mental model — financial dashboard first, then case management |
| **Clarity** | Strong typographic hierarchy, generous white space, one primary action per region |
| **Depth** | NavigationStack with drill-down; Sheet for forms; SF Symbols for iconography |
| **Ergonomics** | Touch targets ≥44pt; thumb-zone optimized on mobile; important actions at bottom |

---

## Navigation Architecture

### iOS/iPadOS (Primary)
```
TabView (bottom)
├── Dashboard      (SF Symbol: chart.bar.doc.horizontal)
├── Debtors        (SF Symbol: person.2)
├── Cases          (SF Symbol: folder)
├── Calendar       (SF Symbol: calendar)
└── Settings       (SF Symbol: gear)

NavigationStack (per tab)
└── List → Detail → Form (sheet)
```

### Desktop (Responsive web)
```
Sidebar Navigation (left, 240pt fixed)
├── Dashboard
├── Debtors
├── Cases
├── Documents
├── Calendar
├── Reports
└── Settings

Content Area (fluid)
Header: Search + Quick Actions + User Avatar
```

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                              [Search] [+ New] 👤 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Total A/R│ │ 30-Day   │ │ 60-Day   │ │ 90+ Day  │        │
│  │ $47,230  │ │ $12,400  │ │ $18,650  │ │ $16,180  │        │
│  │ 18 cases │ │  5 cases │ │  7 cases │ │  6 cases │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────────────────┤
│  A/R Aging                                    [View All →]  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Current   ████████████████████████         $12,400   │   │
│  │ 30-Day    ██████████████████████████       $18,650   │   │
│  │ 60-Day    ██████████████████████████████  $16,180   │   │
│  │ 90+ Day   ██████████████████████████████  $47,230   │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Actions Required (3)          Upcoming Deadlines            │
│  ┌────────────────────┐       ┌────────────────────────┐   │
│  │ ⚠️ Service due in 2d│       │ Jun 15 — SC-104 filing │   │
│  │    Case #2024-042  │       │ Jun 18 — Court hearing  │   │
│  │    $3,200          │       │ Jun 22 — Service deadline│  │
│  └────────────────────┘       └────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Active Cases Pipeline               [View All →]           │
│  Demand (4) │ Filed (2) │ Served (3) │ Hearing (1) │ Judgment│
│  █████████  ████████   ███████████ ██████       ████        │
└─────────────────────────────────────────────────────────────┘
```

---

## Dashboard Components

### 1. Metrics Bar (4 cards)

| Card | Data |
|------|------|
| Total A/R | Sum of all outstanding invoices, case count |
| 30-Day A/R | ≤30 days past due |
| 60-Day A/R | 31–60 days past due |
| 90+ Day A/R | >60 days past due |

**Interaction:** Tap → navigates to filtered A/R aging view for that bucket.

### 2. A/R Aging Visual

Horizontal stacked bar showing proportion of each bucket.
Below: absolute dollar amounts + percentage labels.

**Interaction:** Tap bucket → drill into debtor list filtered by that bucket.

### 3. Actions Required Section

Cards surfaced when:
- Service deadline <48 hours
- SC-104 filing deadline <5 days
- Demand letter response overdue (30+ days)
- Judgment requires post-judgment action

**Interaction:** Tap card → navigates to case detail with recommended action highlighted.

### 4. Upcoming Deadlines

Scrollable list of next 10 deadlines with:
- Date + days remaining (color-coded: red <3d, yellow <7d, green ≥7d)
- Case reference + debtor name
- Event type icon

**Interaction:** Tap → navigates to case timeline.

### 5. Active Cases Pipeline

Kanban-style columns: Demand → Filed → Served → Hearing → Judgment → Collected → Closed

Each column shows:
- Status label + count badge
- Mini progress bar (total cases)
- Top 3 case cards (amount + deadline)

**Interaction:** Tap column header → navigates to filtered case list. Tap card → case detail.

---

## Key Views

### A. A/R Aging View

```
Header: "Accounts Receivable"  [Import CSV] [Filter]

Aging Buckets (horizontal segments)
├── Current    (0-30 days)   — Tap to expand debtor list
├── 30-Day     (31-60 days)  — Tap to expand debtor list
├── 60-Day     (61-90 days)  — Tap to expand debtor list
└── 90+ Day    (>90 days)    — Tap to expand debtor list

Debtor List (expandable per bucket)
├── Debtor name, license #, total owed
├── Eligible for small claims? badge
├── [Send Demand Letter] [Create Case] [Write Off]
```

### B. Cases View

```
Tab: [Kanban] [List] [Calendar]

Kanban:
├── Column per status
├── Case card: Debtor, Amount, Deadline, Days remaining
├── Color coding by urgency (deadline proximity)
└── Drag to update status (with confirmation dialog)

List:
├── Columns: Debtor, Amount, Status, Deadline, Court
├── Sort by any column
├── Batch select for bulk actions
└── Swipe actions (mobile): Archive, Flag, Create Case

Calendar:
├── Month view with case hearing dates
├── Deadline events overlay
└── Tap date → list of items that day
```

### C. Case Detail

```
┌─────────────────────────────────────────────────────┐
│ Case #2024-042                         [Edit] [···] │
│ Defendant: Dr. Sarah Kim, DDS                        │
│ Amount: $3,200  |  Status: Hearing  |  Court: LA     │
├─────────────────────────────────────────────────────┤
│  Timeline                                           │
│  ─────────────────────────────────────────────      │
│  ● Demand Letter sent        May 3, 2024           │
│  ● Case Filed                May 15, 2024           │
│  ● Served (personal)         May 20, 2024           │
│  ● SC-104 Filed              Jun 1, 2024            │
│  ○ Hearing                  Jun 18, 2024 ← UPCOMING │
│  ○ Judgment expected        Jul 2, 2024            │
├─────────────────────────────────────────────────────┤
│  Documents                                          │
│  ├── SC-100 (Plaintiff Claim)         [View] [Edit] │
│  ├── SC-104 (Proof of Service)        [View] [Edit]  │
│  ├── Demand Letter (CMR #941012345)   [View]         │
│  └── Evidence Bundle                 [Generate]     │
├─────────────────────────────────────────────────────┤
│  [Send Reminder] [File Proof of Service] [Log Judgment]│
└─────────────────────────────────────────────────────┘
```

---

## Apple HIG Compliance Details

### Typography (SF Pro)
```
Large Title:   34pt Bold   — Screen titles
Title 1:       28pt Bold   — Section headers
Title 2:       22pt Bold   — Card titles
Title 3:       20pt Semibold — Subsection headers
Headline:      17pt Semibold — List item titles
Body:          17pt Regular — Primary content
Callout:       16pt Regular — Secondary content
Subheadline:   15pt Regular — Metadata, labels
Footnote:      13pt Regular — Timestamps, fine print
Caption:       12pt Regular — Badges, warnings
```

### Color Palette
```
Primary:      #007AFF  (iOS Blue — actions, links)
Success:      #34C759  (iOS Green — completed, collected)
Warning:      #FF9500  (iOS Orange — deadline <7d)
Danger:       #FF3B30  (iOS Red — deadline <3d, overdue)
Background:   #F2F2F7  (iOS System Gray 6)
Surface:      #FFFFFF  (Card backgrounds)
Text Primary: #000000  (Headings, body)
Text Secondary: #8E8E93 (iOS System Gray — metadata)
Separator:    #C6C6C8  (Dividers, borders)
```

### Spacing System (8pt grid)
```
xs:  4pt   — Inline element spacing
sm:  8pt   — Icon-to-text, tight groupings
md:  16pt  — Card padding, section gaps
lg:  24pt  — Between major sections
xl:  32pt  — Screen edge margins (horizontal)
xxl: 48pt  — Hero section spacing
```

### Touch Targets
- Minimum: 44pt × 44pt (Apple minimum)
- Preferred primary action: 50pt height
- Inline actions: 44pt minimum
- Bottom-anchored FAB: 56pt diameter

### Elevation / Depth
```
Level 0 (base):  White surface, 0 shadow
Level 1 (cards): #FFFFFF, shadow-sm (0 2px 4px rgba(0,0,0,0.08))
Level 2 (modals): #FFFFFF, shadow-md (0 4px 12px rgba(0,0,0,0.12))
Level 3 (sheets): #FFFFFF, shadow-lg (0 8px 24px rgba(0,0,0,0.16))
```

### Animations & Transitions
```
Navigation push: 350ms ease-in-out slide
Sheet present:   300ms spring (damping: 0.85)
List item tap:    150ms ease opacity flash
Card hover:       200ms scale(1.02) + shadow increase
Loading:          Shimmer animation (1.5s loop)
```

### SF Symbols (Icons)
```
Dashboard:      chart.bar.doc.horizontal
Debtors:        person.2
Cases:          folder.fill
Documents:      doc.text.fill
Calendar:       calendar
Settings:       gearshape.fill
Add:            plus.circle.fill
Search:         magnifyingglass
Filter:         line.3.horizontal.decrease.circle
Warning:        exclamationmark.triangle.fill
Success:        checkmark.circle.fill
Error:          xmark.circle.fill
Clock:          clock.fill
Money:          dollarsign.circle.fill
Court:          building.columns.fill
File:           doc.fill
Send:           paperplane.fill
Download:       arrow.down.doc.fill
```

---

## Detailed Functions List

### Dashboard Module (D-*)
| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| D-01 | **Metrics Overview** | Display 4 key A/R metric cards (Total, 30/60/90+ day buckets) with case counts | P0 |
| D-02 | **A/R Aging Bar** | Visual stacked horizontal bar showing proportion of each aging bucket; tap to filter | P0 |
| D-03 | **Actions Required** | Surface cards for: service deadline <48h, SC-104 <5d, overdue demand response | P0 |
| D-04 | **Upcoming Deadlines** | Scrollable list of next 10 deadlines with color-coded urgency and case reference | P0 |
| D-05 | **Cases Pipeline** | Kanban view showing case count per status column with mini progress bar | P0 |
| D-06 | **Quick Actions** | Floating action button or toolbar: Import A/R, New Demand Letter, Create Case | P0 |
| D-07 | **Search** | Global search bar with filters: by debtor name, case #, amount range, status | P1 |
| D-08 | **Notifications Bell** | Badge count for pending actions; tap to expand notification list | P1 |
| D-09 | **Activity Feed** | Recent events across all cases: filings, service confirmations, payments | P2 |
| D-10 | **Recovery Rate Widget** | Simple metric: total collected / total claimed this year | P2 |

### A/R Module (A-*)
| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| A-01 | **A/R Import** | Import from CSV with column mapping UI; validate invoice format | P0 |
| A-02 | **A/R Aging Table** | Sortable/filterable table of all invoices with aging bucket auto-assignment | P0 |
| A-03 | **Eligibility Scorer** | Auto-flag: amount ≤$6,250, within SOL, CA debtor, not already in case | P0 |
| A-04 | **Debtor Drill-down** | Tap debtor → view all invoices, case history, contact info | P0 |
| A-05 | **Send Demand Letter** | One-click generate + send via USPS CMR; track delivery status | P0 |
| A-06 | **Bulk Actions** | Select multiple debtors → batch demand letter, bulk case creation | P1 |
| A-07 | **Write-off Flow** | Mark debtor/invoice as uncollectible with reason code + notes | P2 |
| A-08 | **Export A/R Report** | Export aging report as CSV/PDF for accountant | P2 |

### Cases Module (C-*)
| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| C-01 | **Case List View** | Sortable columns: debtor, amount, status, deadline, court, assigned to | P0 |
| C-02 | **Case Kanban** | Drag-and-drop status updates with confirmation dialogs | P0 |
| C-03 | **Case Detail** | Full case view: timeline, documents, parties, judgment, deadlines | P0 |
| C-04 | **Create Case** | Multi-step form: select debtor → enter amount → select court → auto-generate SC-100 | P0 |
| C-05 | **Timeline View** | Chronological event log with add-note capability | P1 |
| C-06 | **Case Filters** | Filter by status, amount range, court, deadline range, assigned handler | P1 |
| C-07 | **Batch Status Update** | Multi-select cases → bulk status change with audit log | P2 |

### Documents Module (DOC-*)
| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| DOC-01 | **Form Auto-fill** | Pre-populate SC-100, SC-104, EJ-130 from case data | P0 |
| DOC-02 | **PDF Preview** | In-app preview of generated PDF before download/send | P0 |
| DOC-03 | **Evidence Bundle** | Compile all case documents into single ZIP/PDF | P0 |
| DOC-04 | **Form Version Tracking** | Alert when Judicial Council updates a form; show old vs. new | P1 |
| DOC-05 | **Document Upload** | Attach supporting files: contracts, invoices, photos | P1 |

### Calendar Module (CAL-*)
| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| CAL-01 | **Month View** | Calendar grid with hearing dates and deadlines as colored dots | P0 |
| CAL-02 | **Day Detail** | Tap date → list of all events that day | P0 |
| CAL-03 | **Deadline Countdown** | Card view of all upcoming deadlines sorted by urgency | P0 |
| CAL-04 | **External Sync** | Export to Google Calendar / Outlook (ICS feed) | P1 |

### Post-Judgment Module (PJ-*)
| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| PJ-01 | **Judgment Logger** | Record: amount, date, interest rate (default 10%), balance | P0 |
| PJ-02 | **30-Day Wait Tracker** | Auto-disable enforcement actions for 30 days post-judgment | P0 |
| PJ-03 | **Writ of Execution** | Auto-generate EJ-130; track 180-day expiration countdown | P0 |
| PJ-04 | **Payment Tracker** | Log partial payments; show remaining balance | P0 |
| PJ-05 | **Satisfaction of Judgment** | Generate and file when balance reaches zero | P0 |
| PJ-06 | **Asset Search Guide** | Step-by-step guide: bank, DMV, property, employment lookup | P1 |

### Settings / Admin (S-*)
| ID | Function | Description | Priority |
|----|----------|-------------|----------|
| S-01 | **Court Config** | Add/edit county-specific filing rules and fee schedules | P1 |
| S-02 | **Process Server Directory** | Manage registered servers per county with contact info | P1 |
| S-03 | **User Profile** | Name, practice name, logo upload for letterhead | P1 |
| S-04 | **Audit Log Viewer** | Immutable log of all system actions with timestamps | P0 |
| S-05 | **Integration Keys** | CA SOS API key, USPS API credentials | P1 |

---

## Screen Flow

```
Dashboard (Tab 1)
├── Metrics cards → A/R Aging filtered view
├── Actions Required → Case Detail (recommended action highlighted)
├── Deadlines → Calendar day view
└── Pipeline → Cases list filtered by status

Debtors (Tab 2)
├── Debtor list → Debtor detail
│   ├── All invoices → A/R Aging filtered
│   ├── Case history → Case detail
│   └── [Send Demand Letter] → CMR confirmation
└── [Import A/R] → CSV mapper → A/R table

Cases (Tab 3)
├── Kanban view → Case detail
├── List view → Case detail
├── Calendar view → Day detail → Case detail
└── [+] → Create Case wizard

Calendar (Tab 4)
├── Month view → Day detail → Case detail
├── Deadline list → Case detail
└── [Sync] → ICS export

Settings (Tab 5)
├── User profile
├── Court config
├── Process server directory
└── Audit log
```

---

## Responsive Breakpoints

| Device | Layout |
|--------|--------|
| iPhone (<768px) | Single column, bottom tab bar, FAB for quick actions |
| iPad (768-1024px) | Sidebar collapsed by default, content area with split view |
| Desktop (>1024px) | Full sidebar, wide content area, multi-column dashboard |
| Large Desktop (>1440px) | Max content width 1200pt centered; extra whitespace for breathing room |

---

## Accessibility

- All images have descriptive alt text
- Color is not the only conveyor of information (icons + labels accompany color coding)
- Minimum contrast ratio 4.5:1 for body text, 3:1 for large text
- VoiceOver support with proper accessibility labels
- Dynamic Type support (scaling up to xxxLarge)
- Reduce Motion support (disable animations when enabled)