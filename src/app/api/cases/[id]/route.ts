import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const c = await prisma.case.findUnique({
      where: { id },
      include: {
        debtor: { select: { name: true } },
            timeline: { orderBy: { timestamp: 'asc' } },
        documents: true,
            judgment: true,
          },
        })
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const now = new Date()
    let daysToHearing: number | undefined
    let urgency: 'danger' | 'warning' | 'normal' = 'normal'

    if (c.hearingDate) {
      daysToHearing = Math.ceil((new Date(c.hearingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysToHearing < 0) urgency = 'normal'
      else if (daysToHearing < 3) urgency = 'danger'
      else if (daysToHearing < 7) urgency = 'warning'
    }

    return NextResponse.json({
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
          })
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await prisma.case.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

  export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params

      // Get all documents for this case to delete files
      const documents = await prisma.document.findMany({
        where: { caseId: id },
      })

      // Delete document files from filesystem
      const fs = require('fs')
      const path = require('path')
      const publicDir = path.join(process.cwd(), 'public', 'documents')
    
      for (const doc of documents) {
        const filePath = path.join(publicDir, doc.fileName)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }

      // Delete all related records first (due to foreign key constraints)
      await prisma.caseEvent.deleteMany({ where: { caseId: id } })
      await prisma.document.deleteMany({ where: { caseId: id } })
      await prisma.judgment.deleteMany({ where: { caseId: id } })
    
      // Delete the case
      await prisma.case.delete({ where: { id } })

      return NextResponse.json({ success: true, deletedCaseId: id })
    } catch (error) {
      console.error('Failed to delete case:', error)
      return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 })
    }
  }