import { Debtor, AgingBucket } from '@/types'

// Placeholder data
export const PLACEHOLDER_DEBTORS: Debtor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Kim, DDS',
    dbaName: 'Smile Care Dental',
    entityType: 'individual',
    licenseNumber: 'DDS 123456',
    address: { street: '123 Main St', city: 'Los Angeles', county: 'Los Angeles', state: 'CA', zip: '90001' },
    agentForService: 'Dr. Sarah Kim',
    email: 'sarah.kim@smilepractitioner.com',
    phone: '(310) 555-0123',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-05-01'),
  },
  {
    id: '2',
    name: 'Dr. Michael Chen, DDS',
    dbaName: 'Bright Smile Dental',
    entityType: 'individual',
    licenseNumber: 'DDS 234567',
    address: { street: '456 Oak Ave', city: 'Pasadena', county: 'Los Angeles', state: 'CA', zip: '91101' },
    email: 'mchen@brightsmile.com',
    phone: '(626) 555-0456',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-05-15'),
  },
  {
    id: '3',
    name: 'Elite Dental Corp',
    entityType: 'corp',
    licenseNumber: 'C1234567',
    address: { street: '789 Business Pkwy', city: 'San Diego', county: 'San Diego', state: 'CA', zip: '92101' },
    agentForService: 'CT Corporation System',
    email: 'billing@elitedental.com',
    phone: '(619) 555-0789',
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2024-04-20'),
  },
  {
    id: '4',
    name: 'Dr. Jennifer Martinez, DDS',
    dbaName: 'Martinez Family Dentistry',
    entityType: 'individual',
    licenseNumber: 'DDS 345678',
    address: { street: '321 Pine St', city: 'San Francisco', county: 'San Francisco', state: 'CA', zip: '94102' },
    email: 'jmartinez@martinezfd.com',
    phone: '(415) 555-0321',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-05-20'),
  },
  {
    id: '5',
    name: 'West Coast Dental Partners LLC',
    entityType: 'partnership',
    address: { street: '555 Market St', city: 'Sacramento', county: 'Sacramento', state: 'CA', zip: '95814' },
    agentForService: 'National Registered Agents Inc',
    email: 'accounts@westcoastdental.com',
    phone: '(916) 555-0555',
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2024-03-10'),
  },
]

export interface DebtorWithInvoices extends Debtor {
  totalOwed: number
  invoiceCount: number
  agingBucket: AgingBucket
  eligibleForSmallClaims: boolean
  hasActiveCase: boolean
}

export const PLACEHOLDER_DEBTORS_WITH_INVOICES: DebtorWithInvoices[] = [
  {
    ...PLACEHOLDER_DEBTORS[0],
    totalOwed: 12400,
    invoiceCount: 3,
    agingBucket: 'current',
    eligibleForSmallClaims: true,
    hasActiveCase: false,
  },
  {
    ...PLACEHOLDER_DEBTORS[1],
    totalOwed: 8500,
    invoiceCount: 2,
    agingBucket: '30-day',
    eligibleForSmallClaims: true,
    hasActiveCase: true,
  },
  {
    ...PLACEHOLDER_DEBTORS[2],
    totalOwed: 15000,
    invoiceCount: 5,
    agingBucket: '90-plus',
    eligibleForSmallClaims: false, // exceeds $6,250
    hasActiveCase: false,
  },
  {
    ...PLACEHOLDER_DEBTORS[3],
    totalOwed: 3200,
    invoiceCount: 1,
    agingBucket: '60-day',
    eligibleForSmallClaims: true,
    hasActiveCase: false,
  },
  {
    ...PLACEHOLDER_DEBTORS[4],
    totalOwed: 8900,
    invoiceCount: 4,
    agingBucket: '30-day',
    eligibleForSmallClaims: true,
    hasActiveCase: false,
  },
]

export async function getDebtors(): Promise<DebtorWithInvoices[]> {
  return PLACEHOLDER_DEBTORS_WITH_INVOICES
}

export async function getDebtorById(id: string): Promise<DebtorWithInvoices | null> {
  return PLACEHOLDER_DEBTORS_WITH_INVOICES.find(d => d.id === id) || null
}

export async function getARSummary(): Promise<{
  total: number
  current: number
  thirtyDay: number
  sixtyDay: number
  ninetyPlus: number
  eligibleCount: number
  ineligibleCount: number
}> {
  const debtors = PLACEHOLDER_DEBTORS_WITH_INVOICES
  return {
    total: debtors.reduce((sum, d) => sum + d.totalOwed, 0),
    current: debtors.filter(d => d.agingBucket === 'current').reduce((sum, d) => sum + d.totalOwed, 0),
    thirtyDay: debtors.filter(d => d.agingBucket === '30-day').reduce((sum, d) => sum + d.totalOwed, 0),
    sixtyDay: debtors.filter(d => d.agingBucket === '60-day').reduce((sum, d) => sum + d.totalOwed, 0),
    ninetyPlus: debtors.filter(d => d.agingBucket === '90-plus').reduce((sum, d) => sum + d.totalOwed, 0),
    eligibleCount: debtors.filter(d => d.eligibleForSmallClaims).length,
    ineligibleCount: debtors.filter(d => !d.eligibleForSmallClaims).length,
  }
}