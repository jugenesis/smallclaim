import { prisma } from '@/lib/db'
import { AgingBucket } from '@/types'

export interface DebtorWithInvoices {
  id: string
  accountNumber: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  type: 'individual' | 'corp' | 'partnership'
  createdAt: Date
  updatedAt: Date
  totalOwed: number
  invoiceCount: number
  agingBucket: AgingBucket
  eligibleForSmallClaims: boolean
  hasActiveCase: boolean
}

function mapPrismaDebtor(debtor: {
  id: string; accountNumber: string; name: string; email: string | null
  phone: string | null; address: string | null; city: string | null
  state: string | null; zip: string | null; type: string; balance: number
  createdAt: Date; updatedAt: Date; invoices: { id: string }[]; cases: { id: string }[]
}): DebtorWithInvoices {
  const totalOwed = debtor.balance || 0
  const invoiceCount = debtor.invoices?.length || 0
  const hasActiveCase = (debtor.cases?.length || 0) > 0

  let agingBucket: AgingBucket = 'current'
  if (totalOwed > 10000) agingBucket = '90-plus'
  else if (totalOwed > 5000) agingBucket = '60-day'
  else if (totalOwed > 1000) agingBucket = '30-day'

  const eligibleForSmallClaims = totalOwed <= 10000

  return {
    id: debtor.id,
    accountNumber: debtor.accountNumber,
    name: debtor.name,
    email: debtor.email || '',
    phone: debtor.phone || '',
    address: debtor.address || '',
    city: debtor.city || '',
    state: debtor.state || '',
    zip: debtor.zip || '',
    type: debtor.type as 'individual' | 'corp' | 'partnership',
    createdAt: debtor.createdAt,
    updatedAt: debtor.updatedAt,
    totalOwed,
    invoiceCount,
    agingBucket,
    eligibleForSmallClaims,
    hasActiveCase,
  }
}

export async function getDebtors(): Promise<DebtorWithInvoices[]> {
  const debtors = await prisma.debtor.findMany({
    include: { invoices: { select: { id: true } }, cases: { select: { id: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return debtors.map(mapPrismaDebtor)
}

export async function getDebtorById(id: string): Promise<DebtorWithInvoices | null> {
  const debtor = await prisma.debtor.findUnique({
    where: { id },
    include: { invoices: { select: { id: true } }, cases: { select: { id: true } } },
  })
  if (!debtor) return null
  return mapPrismaDebtor(debtor)
}

export async function getARSummary(): Promise<{
  total: number; current: number; thirtyDay: number; sixtyDay: number
  ninetyPlus: number; eligibleCount: number; ineligibleCount: number
}> {
  const debtors = await prisma.debtor.findMany({
    include: { invoices: { select: { id: true } }, cases: { select: { id: true } } },
  })
  const mapped = debtors.map(d => {
    const totalOwed = d.balance || 0
    let agingBucket: AgingBucket = 'current'
    if (totalOwed > 10000) agingBucket = '90-plus'
    else if (totalOwed > 5000) agingBucket = '60-day'
    else if (totalOwed > 1000) agingBucket = '30-day'
    return { totalOwed, agingBucket, eligibleForSmallClaims: totalOwed <= 10000 }
  })
  return {
    total: mapped.reduce((sum, d) => sum + d.totalOwed, 0),
    current: mapped.filter(d => d.agingBucket === 'current').reduce((sum, d) => sum + d.totalOwed, 0),
    thirtyDay: mapped.filter(d => d.agingBucket === '30-day').reduce((sum, d) => sum + d.totalOwed, 0),
    sixtyDay: mapped.filter(d => d.agingBucket === '60-day').reduce((sum, d) => sum + d.totalOwed, 0),
    ninetyPlus: mapped.filter(d => d.agingBucket === '90-plus').reduce((sum, d) => sum + d.totalOwed, 0),
    eligibleCount: mapped.filter(d => d.eligibleForSmallClaims).length,
    ineligibleCount: mapped.filter(d => !d.eligibleForSmallClaims).length,
  }
}