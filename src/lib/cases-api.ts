import { Case, CaseStatus, CaseEvent, Document, Judgment } from '@/types'

export type { CaseStatus }

export interface CaseWithDebtor extends Case {
  debtorName: string
  debtorLicense: string
  daysToHearing?: number
  urgency: 'danger' | 'warning' | 'normal'
}

export const PLACEHOLDER_CASES: CaseWithDebtor[] = [
  {
    id: '1',
    caseNumber: '2024-042',
    debtorId: '1',
    debtorName: 'Dr. Sarah Kim, DDS',
    debtorLicense: 'DDS 123456',
    claimAmount: 3200,
    courtFees: 50,
    costsAccrued: 0,
    status: 'hearing',
    venueCounty: 'Los Angeles',
    courtName: 'Santa Monica Courthouse',
    hearingDate: new Date('2024-06-18'),
    daysToHearing: 5,
    urgency: 'warning',
    timeline: [
      { id: 't1', eventType: 'demand_sent', timestamp: new Date('2024-05-03'), description: 'Demand letter sent via USPS CMR', completed: true, reminderSent: true },
      { id: 't2', eventType: 'case_filed', timestamp: new Date('2024-05-15'), description: 'SC-100 filed with court', completed: true, reminderSent: true },
      { id: 't3', eventType: 'served', timestamp: new Date('2024-05-20'), description: 'Personal service completed', completed: true, reminderSent: true },
      { id: 't4', eventType: 'sc104_filed', timestamp: new Date('2024-06-01'), description: 'SC-104 filed with court', completed: true, reminderSent: true },
      { id: 't5', eventType: 'hearing', timestamp: new Date('2024-06-18'), description: 'Court hearing', completed: false, reminderSent: false },
    ],
    documents: [
      { id: 'd1', caseId: '1', formType: 'SC-100', fileName: 'SC-100-2024-042.pdf', filePath: '/docs/sc100.pdf', generatedAt: new Date('2024-05-15'), filedAt: new Date('2024-05-15') },
      { id: 'd2', caseId: '1', formType: 'SC-104', fileName: 'SC-104-2024-042.pdf', filePath: '/docs/sc104.pdf', generatedAt: new Date('2024-05-20'), filedAt: new Date('2024-06-01') },
    ],
    createdAt: new Date('2024-05-03'),
    updatedAt: new Date('2024-06-01'),
  },
  {
    id: '2',
    caseNumber: '2024-043',
    debtorId: '2',
    debtorName: 'Dr. Michael Chen, DDS',
    debtorLicense: 'DDS 234567',
    claimAmount: 8500,
    courtFees: 75,
    costsAccrued: 0,
    status: 'served',
    venueCounty: 'Los Angeles',
    courtName: 'Pasadena Courthouse',
    daysToHearing: 17,
    urgency: 'normal',
    timeline: [
      { id: 't1', eventType: 'demand_sent', timestamp: new Date('2024-04-20'), description: 'Demand letter sent', completed: true, reminderSent: true },
      { id: 't2', eventType: 'case_filed', timestamp: new Date('2024-05-05'), description: 'SC-100 filed', completed: true, reminderSent: true },
      { id: 't3', eventType: 'served', timestamp: new Date('2024-05-25'), description: 'Personal service completed', completed: true, reminderSent: true },
      { id: 't4', eventType: 'sc104_filed', timestamp: new Date('2024-06-05'), description: 'SC-104 filed', completed: true, reminderSent: true },
    ],
    documents: [],
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-06-05'),
  },
  {
    id: '3',
    caseNumber: '2024-041',
    debtorId: '4',
    debtorName: 'Dr. Jennifer Martinez, DDS',
    debtorLicense: 'DDS 345678',
    claimAmount: 5100,
    courtFees: 50,
    costsAccrued: 0,
    status: 'demand',
    venueCounty: 'San Francisco',
    courtName: 'Hall of Justice',
    urgency: 'danger',
    timeline: [
      { id: 't1', eventType: 'demand_sent', timestamp: new Date('2024-04-01'), description: 'Demand letter sent', completed: true, reminderSent: true },
    ],
    documents: [],
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: '4',
    caseNumber: '2024-039',
    debtorId: '5',
    debtorName: 'West Coast Dental Partners LLC',
    debtorLicense: 'C1234567',
    claimAmount: 2800,
    courtFees: 50,
    costsAccrued: 150,
    status: 'judgment',
    venueCounty: 'Sacramento',
    courtName: 'Gordon D. Schabre Courthouse',
    urgency: 'normal',
    judgment: { amount: 2950, date: new Date('2024-05-28'), interestRate: 10, balanceRemaining: 2950 },
    timeline: [
      { id: 't1', eventType: 'demand_sent', timestamp: new Date('2024-03-15'), description: 'Demand letter sent', completed: true, reminderSent: true },
      { id: 't2', eventType: 'case_filed', timestamp: new Date('2024-04-01'), description: 'SC-100 filed', completed: true, reminderSent: true },
      { id: 't3', eventType: 'served', timestamp: new Date('2024-04-10'), description: 'Personal service completed', completed: true, reminderSent: true },
      { id: 't4', eventType: 'sc104_filed', timestamp: new Date('2024-04-15'), description: 'SC-104 filed', completed: true, reminderSent: true },
      { id: 't5', eventType: 'hearing', timestamp: new Date('2024-05-20'), description: 'Court hearing - Won', completed: true, reminderSent: true },
      { id: 't6', eventType: 'judgment', timestamp: new Date('2024-05-28'), description: 'Judgment entered for $2,950', completed: true, reminderSent: true },
    ],
    documents: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-05-28'),
  },
  {
    id: '5',
    caseNumber: '2024-037',
    debtorId: '3',
    debtorName: 'Elite Dental Corp',
    debtorLicense: 'C1234567',
    claimAmount: 15000,
    courtFees: 100,
    costsAccrued: 0,
    status: 'closed',
    venueCounty: 'San Diego',
    courtName: 'San Diego Courthouse',
    urgency: 'normal',
    timeline: [
      { id: 't1', eventType: 'demand_sent', timestamp: new Date('2024-02-01'), description: 'Demand letter sent', completed: true, reminderSent: true },
      { id: 't2', eventType: 'case_filed', timestamp: new Date('2024-02-20'), description: 'SC-100 filed', completed: true, reminderSent: true },
      { id: 't3', eventType: 'closed', timestamp: new Date('2024-03-15'), description: 'Case closed - Amount exceeded limit', completed: true, reminderSent: true },
    ],
    documents: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
  },
]

export async function getCases(): Promise<CaseWithDebtor[]> {
  return PLACEHOLDER_CASES
}

export async function getCaseById(id: string): Promise<CaseWithDebtor | null> {
  return PLACEHOLDER_CASES.find(c => c.id === id) || null
}

export async function getCasesByStatus(status: CaseStatus): Promise<CaseWithDebtor[]> {
  return PLACEHOLDER_CASES.filter(c => c.status === status)
}

export async function getCasesSummary(): Promise<{
  total: number
  byStatus: Record<CaseStatus, number>
  totalClaimAmount: number
}> {
  const cases = PLACEHOLDER_CASES
  return {
    total: cases.length,
    byStatus: {
      demand: cases.filter(c => c.status === 'demand').length,
      filed: cases.filter(c => c.status === 'filed').length,
      served: cases.filter(c => c.status === 'served').length,
      hearing: cases.filter(c => c.status === 'hearing').length,
      judgment: cases.filter(c => c.status === 'judgment').length,
      collected: cases.filter(c => c.status === 'collected').length,
      closed: cases.filter(c => c.status === 'closed').length,
    },
    totalClaimAmount: cases.reduce((sum, c) => sum + c.claimAmount, 0),
  }
}