import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const events = await prisma.caseEvent.findMany({
      where: { completed: false },
      include: { case: { include: { debtor: { select: { name: true } } } } },
      orderBy: { timestamp: 'asc' },
      take: 10,
    })

    const now = new Date()
    return NextResponse.json(events.map(e => {
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
    }))
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}