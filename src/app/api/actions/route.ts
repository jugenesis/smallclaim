import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const pastDueEvents = await prisma.caseEvent.findMany({
      where: { completed: false, timestamp: { lt: new Date() } },
      include: { case: { include: { debtor: { select: { name: true } } } } },
      orderBy: { timestamp: 'asc' },
    })

    return NextResponse.json(pastDueEvents.map(e => ({
      id: e.id,
      caseId: e.caseId,
      caseNumber: e.case.caseNumber,
      actionType: e.eventType,
      description: `${e.eventType.replace(/_/g, ' ')} overdue`,
      amount: e.case.claimAmount,
      deadline: e.timestamp,
    })))
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}