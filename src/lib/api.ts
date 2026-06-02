import { prisma } from '@/lib/db'
import { getARSummary } from './debtors-api'
import { getCasesSummary } from './cases-api'

export interface DashboardMetrics {
  totalAR: number; totalCases: number
  currentAR: number; currentCases: number
  thirtyDayAR: number; thirtyDayCases: number
  sixtyDayAR: number; sixtyDayCases: number
  ninetyPlusAR: number; ninetyPlusCases: number
}

export interface DeadlineItem {
  id: string; caseId: string; caseNumber: string; eventType: string
  deadline: Date; daysRemaining: number; urgency: 'danger' | 'warning' | 'normal'
  debtorName: string
}

export interface ActionRequired {
  id: string; caseId: string; caseNumber: string; actionType: string
  description: string; amount: number; deadline?: Date
}

export interface PipelineColumn {
  status: string; label: string; count: number
  cases: { id: string; debtor: string; amount: number; deadline: string }[]
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [ar, cases] = await Promise.all([
    getARSummary(),
    getCasesSummary()
  ])

  // For now, distribute cases proportionally (placeholder - real impl would track aging per case)
  const total = cases.total || 1
  const thirtyCases = Math.round(total * 0.4)
  const sixtyCases = Math.round(total * 0.3)
  const currentCases = total - thirtyCases - sixtyCases

  return {
    totalAR: ar.total,
    totalCases: cases.total,
    currentAR: ar.current,
    currentCases,
    thirtyDayAR: ar.thirtyDay,
    thirtyDayCases: thirtyCases,
    sixtyDayAR: ar.sixtyDay,
    sixtyDayCases: sixtyCases,
    ninetyPlusAR: ar.ninetyPlus,
    ninetyPlusCases: 0,
  }
}

export async function getUpcomingDeadlines(limit = 10): Promise<DeadlineItem[]> {
  const events = await prisma.caseEvent.findMany({
    where: { completed: false, timestamp: { gte: new Date() } },
    include: { case: { include: { debtor: { select: { name: true } } } } },
    orderBy: { timestamp: 'asc' },
    take: limit,
  })

  const now = new Date()
  return events.map(e => {
    const daysRemaining = Math.ceil((e.timestamp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    let urgency: 'danger' | 'warning' | 'normal' = 'normal'
    if (daysRemaining < 3) urgency = 'danger'
    else if (daysRemaining < 7) urgency = 'warning'

    return {
      id: e.id,
      caseId: e.caseId,
      caseNumber: e.case.caseNumber,
      eventType: e.eventType,
      deadline: e.timestamp,
      daysRemaining,
      urgency,
      debtorName: e.case.debtor.name,
    }
  })
}

export async function getActionsRequired(): Promise<ActionRequired[]> {
  // Get incomplete events that are past due
  const pastDueEvents = await prisma.caseEvent.findMany({
    where: { completed: false, timestamp: { lt: new Date() } },
    include: { case: { include: { debtor: { select: { name: true } } } } },
    orderBy: { timestamp: 'asc' },
  })

  return pastDueEvents.map(e => ({
    id: e.id,
    caseId: e.caseId,
    caseNumber: e.case.caseNumber,
    actionType: e.eventType,
    description: `${e.eventType.replace(/_/g, ' ')} overdue`,
    amount: e.case.claimAmount,
    deadline: e.timestamp,
  }))
}

export async function getCasesPipeline(): Promise<PipelineColumn[]> {
  const cases = await prisma.case.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  const statusLabels: Record<string, string> = {
    demand: 'Demand',
    filed: 'Filed',
    served: 'Served',
    hearing: 'Hearing',
    judgment: 'Judgment',
    collected: 'Collected',
    closed: 'Closed',
  }

  return cases.map(c => ({
    status: c.status,
    label: statusLabels[c.status] || c.status,
    count: c._count.id,
    cases: [],
  }))
}