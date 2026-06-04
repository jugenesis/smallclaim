import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Upsert judgment (create or update)
    const judgment = await prisma.judgment.upsert({
      where: { caseId: id },
      update: {
        amount: body.amount,
        dateEntered: new Date(body.dateEntered),
        balanceRemaining: body.balanceRemaining ?? body.amount,
        paymentStatus: body.paymentStatus || 'pending',
        lastPaymentDate: body.lastPaymentDate ? new Date(body.lastPaymentDate) : null,
        lastPaymentAmount: body.lastPaymentAmount,
      },
      create: {
        caseId: id,
        amount: body.amount,
        dateEntered: new Date(body.dateEntered),
        balanceRemaining: body.balanceRemaining ?? body.amount,
        paymentStatus: body.paymentStatus || 'pending',
        lastPaymentDate: body.lastPaymentDate ? new Date(body.lastPaymentDate) : null,
        lastPaymentAmount: body.lastPaymentAmount,
      }
    })

    return NextResponse.json(judgment, { status: 201 })
  } catch (error) {
    console.error('Failed to create judgment:', error)
    return NextResponse.json({ error: 'Failed to create judgment' }, { status: 500 })
  }
}