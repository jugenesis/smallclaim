import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [ar, cases] = await Promise.all([
      (async () => {
        const debtors = await prisma.debtor.findMany()
        const total = debtors.reduce((sum, d) => sum + (d.balance || 0), 0)
        // Current: <= 1000, 30-day: 1001-5000, 60-day: 5001-10000, 90+: > 10000
        const thirtyDay = debtors.filter(d => (d.balance || 0) > 1000 && (d.balance || 0) <= 5000).reduce((sum, d) => sum + (d.balance || 0), 0)
        const sixtyDay = debtors.filter(d => (d.balance || 0) > 5000 && (d.balance || 0) <= 10000).reduce((sum, d) => sum + (d.balance || 0), 0)
        const ninetyPlus = debtors.filter(d => (d.balance || 0) > 10000).reduce((sum, d) => sum + (d.balance || 0), 0)
        const current = total - thirtyDay - sixtyDay - ninetyPlus
        return { total, current, thirtyDay, sixtyDay, ninetyPlus }
      })(),
      prisma.case.groupBy({ by: ['status'], _count: { id: true } })
    ])

    const statusLabels: Record<string, string> = {
      demand: 'Demand', filed: 'Filed', served: 'Served',
      hearing: 'Hearing', judgment: 'Judgment', collected: 'Collected', closed: 'Closed',
    }

    return NextResponse.json({
      totalAR: ar.total,
      totalCases: cases.reduce((sum, c) => sum + c._count.id, 0),
      currentAR: ar.current,
      thirtyDayAR: ar.thirtyDay,
      sixtyDayAR: ar.sixtyDay,
      ninetyPlusAR: ar.ninetyPlus,
      pipeline: cases.map(c => ({ status: c.status, label: statusLabels[c.status] || c.status, count: c._count.id })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}