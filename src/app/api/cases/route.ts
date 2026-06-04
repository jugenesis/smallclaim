import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url, 'http://localhost')
    const status = searchParams.get('status')

    const where = status ? { status } : undefined

    const cases = await prisma.case.findMany({
      where,
      include: {
        debtor: { select: { name: true } },
            timeline: { orderBy: { timestamp: 'asc' } },
        documents: true,
            judgment: true,
          },
          orderBy: { updatedAt: 'desc' },
        })

    return NextResponse.json(cases.map((c) => {
      const now = new Date()
      let daysToHearing: number | undefined
      let urgency: 'danger' | 'warning' | 'normal' = 'normal'

      if (c.hearingDate) {
        daysToHearing = Math.ceil((new Date(c.hearingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
        status: c.status,
        venueCounty: c.venueCounty,
        courtName: c.courtName,
        hearingDate: c.hearingDate,
        daysToHearing,
        urgency,
        timeline: c.timeline.map(e => ({
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
                judgment: c.judgment ? {
                  id: c.judgment.id,
                  amount: c.judgment.amount,
                  dateEntered: c.judgment.dateEntered,
                  balanceRemaining: c.judgment.balanceRemaining,
                  paymentStatus: c.judgment.paymentStatus,
                  lastPaymentDate: c.judgment.lastPaymentDate,
                  lastPaymentAmount: c.judgment.lastPaymentAmount,
                } : undefined,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
              }
            }))
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const created = await prisma.case.create({
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
    return NextResponse.json(created)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}