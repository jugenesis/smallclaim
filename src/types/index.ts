// Core data types for Small Claims Automation

export type EntityType = 'individual' | 'corp' | 'partnership'
export type CaseStatus = 'demand' | 'filed' | 'served' | 'hearing' | 'judgment' | 'collected' | 'closed'
export type AgingBucket = 'current' | '30-day' | '60-day' | '90-plus'

export interface Address {
  street: string
  city: string
  county: string
  state: string
  zip: string
}

export interface Debtor {
  id: string
  name: string
  dbaName?: string
  entityType: EntityType
  licenseNumber?: string // DDS #
  address: Address
  agentForService?: string
  email?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  debtorId: string
  invoiceNumber: string
  amount: number
  issueDate: Date
  dueDate: Date
  agingBucket: AgingBucket
  eligibleForSmallClaims: boolean
  status: 'open' | 'paid' | 'written-off' | 'in-case'
  caseId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Case {
  id: string
  caseNumber: string
  debtorId: string
  claimAmount: number
  courtFees: number
  costsAccrued: number
  status: CaseStatus
  venueCounty: string
  courtName: string
  hearingDate?: Date
  timeline: CaseEvent[]
  documents: Document[]
  judgment?: Judgment
  createdAt: Date
  updatedAt: Date
}

export interface CaseEvent {
  id: string
  eventType: string
  timestamp: Date
  description: string
  deadline?: Date
  completed: boolean
  reminderSent: boolean
}

export interface Document {
  id: string
  caseId: string
  formType: string // sc100, sc104, ej130, etc.
  fileName: string
  filePath: string
  generatedAt: Date
  filedAt?: Date
}

export interface Judgment {
  amount: number
  date: Date
  interestRate: number // default 10% in CA
  balanceRemaining: number
  enteredBy?: string
}

export interface ARImport {
  id: string
  fileName: string
  importedAt: Date
  recordCount: number
  totalAmount: number
}

// Dashboard metrics
export interface DashboardMetrics {
  totalAR: number
  totalCases: number
  currentAR: number
  currentCases: number
  thirtyDayAR: number
  thirtyDayCases: number
  sixtyDayAR: number
  sixtyDayCases: number
  ninetyPlusAR: number
  ninetyPlusCases: number
}

export interface DeadlineItem {
  id: string
  caseId: string
  caseNumber: string
  eventType: string
  deadline: Date
  daysRemaining: number
  urgency: 'danger' | 'warning' | 'normal'
  debtorName: string
}

export interface ActionRequired {
  id: string
  caseId: string
  caseNumber: string
  actionType: 'service' | 'sc104-filing' | 'demand-response' | 'post-judgment'
  description: string
  amount: number
  deadline?: Date
}

// Court forms (Judicial Council)
export type CourtForm = 
  | 'SC-100' // Plaintiff's Claim
  | 'SC-100A' // Other Plaintiffs or Defendants
  | 'SC-103' // Fictitious Business Name
  | 'SC-104' // Proof of Service
  | 'SC-104B' // What Is Proof of Service
  | 'SC-104C' // How to Serve a Business
  | 'SC-107' // Subpoena
  | 'EJ-130' // Writ of Execution
  | 'WG-001' // Application for Earnings Withholding
  | 'WG-002' // Earnings Withholding Order
  | 'WG-005' // Employer's Return
  | 'WG-008' // Notice of Filing of Claim of Exemption
  | 'WG-009' // Notice of Opposition
  | 'WG-010' // Notice of Hearing on Claim of Exemption
  | 'MC-012' // Memorandum of Costs