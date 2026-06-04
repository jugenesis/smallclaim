import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId')
    
    const where = caseId ? { caseId } : {}
    
    const documents = await prisma.document.findMany({
      where,
      include: {
        case: {
          select: { caseNumber: true, debtor: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(
      documents.map(d => ({
        id: d.id,
        caseId: d.caseId,
        caseNumber: d.case.caseNumber,
        debtorName: d.case.debtor.name,
        formType: d.formType,
        fileName: d.fileName,
        filePath: `/documents/${d.fileName}`,
        status: d.status,
        createdAt: d.createdAt,
        filedAt: d.filedAt,
        notes: d.notes,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}