import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Create a reminder event in the case timeline
    const event = await prisma.caseEvent.create({
      data: {
        caseId: id,
        eventType: 'reminder',
        description: 'Reminder sent to debtor',
        timestamp: new Date(),
        completed: true,
        reminderSent: true,
      }
    })

    return NextResponse.json({ success: true, eventId: event.id }, { status: 201 })
  } catch (error) {
    console.error('Failed to send reminder:', error)
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
  }
}