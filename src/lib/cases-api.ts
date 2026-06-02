import { prisma } from '@/lib/db'

export interface CaseWithDebtor {
  id: string
  caseNumber: string
  debtorId: string
  debtorName: string
  claimAmount: number
  courtFees: number
  costsAccrued: number
  status: 'demand' | 'filed' | 'served' | 'hearing' | 'judgment' | 'collected' | 'closed'
  venueCounty: string
  courtName: string
  hearingDate: Date | null
  daysToHearing?: number
  urgency: 'danger' | 'warning' | 'normal'
  timeline: { id: string; eventType: string; timestamp: Date; description: string; completed: boolean; reminderSent: boolean }[]
  documents: { id: string; caseId: string; formType: string; fileName: string; filePath: string; generatedAt: Date; filedAt: Date | null }[]
  createdAt: Date
  updatedAt: Date
}

function mapPrismaCase(c: {
  id: string; caseNumber: string; debtorId: string; claimAmount: number
  courtFees: number; costsAccrued: number; status: string; venueCounty: string
  courtName: string; hearingDate: Date | null; filingDate: Date | null; createdAt: Date; updatedAt: Date
  debtor: { name: string }
  events: { id: string; eventType: string; timestamp: Date; description: string; completed: boolean; reminderSent: boolean }[]
  documents: { id: string; caseId: string; formType: string; fileName: string; status: string; createdAt: Date; filedAt: Date | null }[]
}): CaseWithDebtor {
  const now = new Date()
  let daysToHearing: number | undefined
  let urgency: 'danger' | 'warning' | 'normal' = 'normal'

  if (c.hearingDate) {
    daysToHearing = Math.ceil((c.hearingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysToHearing < 0) urgency = 'normal'
    else if (daysToHearing < 3) urgency = 'danger'
    else if (daysToHearing < 7) urgency = 'warning'
  }

  return {
    id: c.id,
    caseNumber: c.caseNumber,
    debtorId: c.debtorId,
    debtorName: c.debtor.name,
    claimAmount: c.claimAmount,
    courtFees: c.courtFees,
    costsAccrued: c.costsAccrued,
    status: c.status as CaseWithDebtor['status'],
    venueCounty: c.venueCounty,
    courtName: c.courtName,
    hearingDate: c.hearingDate,
    daysToHearing,
    urgency,
    timeline: c.events.map(e => ({
      id: e.id,
      eventType: e.eventType,
      timestamp: e.timestamp,
      description: e.description,
      completed: e.completed,
      reminderSent: e.reminderSent,
    })),
    documents: c.documents.map(d => ({
      id: d.id,
      caseId: d.caseId,
      formType: d.formType,
      fileName: d.fileName,
      filePath: `/documents/${d.fileName}`,
      generatedAt: d.createdAt,
      filedAt: d.filedAt,
    })),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

export async function getCases(): Promise<CaseWithDebtor[]> {
  const cases = await prisma.case.findMany({
    include: {
      debtor: { select: { name: true } },
      events: { orderBy: { timestamp: 'asc' } },
      documents: true,
    },
    orderBy: { updatedAt: 'desc' },
  })
  return cases.map(mapPrismaCase)
}

export async function getCaseById(id: string): Promise<CaseWithDebtor | null> {
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      debtor: { select: { name: true } },
      events: { orderBy: { timestamp: 'asc' } },
      documents: true,
    },
  })
  if (!c) return null
  return mapPrismaCase(c)
}

export async function getCasesByStatus(status: string): Promise<CaseWithDebtor[]> {
  const cases = await prisma.case.findMany({
    where: { status },
    include: {
      debtor: { select: { name: true } },
      events: { orderBy: { timestamp: 'asc' } },
      documents: true,
    },
    orderBy: { updatedAt: 'desc' },
  })
  return cases.map(mapPrismaCase)
}

export async function getCasesSummary(): Promise<{
  total: number
  byStatus: Record<string, number>
  totalClaimAmount: number
}> {
  const cases = await prisma.case.findMany()
  const byStatus: Record<string, number> = {}
  for (const c of cases) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
  }
  return {
    total: cases.length,
    byStatus,
    totalClaimAmount: cases.reduce((sum, c) => sum + c.claimAmount, 0),
  }
}

export async function createCase(data: {
  debtorId: string; caseNumber: string; claimAmount: number; courtFees: number; venueCounty: string; courtName: string
}) {
  return prisma.case.create({
    data: {
      debtorId: data.debtorId,
      caseNumber: data.caseNumber,
      claimAmount: data.claimAmount,
      courtFees: data.courtFees,
      venueCounty: data.venueCounty,
      courtName: data.courtName,
      status: 'demand',
    },
  })
}