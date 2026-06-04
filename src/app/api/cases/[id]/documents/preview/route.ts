import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSC100Data, generateSC104Data } from '@/lib/document-generator'

// GET /api/cases/[id]/documents/preview - Get initial form data for a document type
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const formType = searchParams.get('formType')

    if (!formType) {
      return NextResponse.json({ error: 'formType is required' }, { status: 400 })
    }

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: { debtor: true },
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'default' } })
    const normalizedFormType = formType.toLowerCase().replace('-', '')

    let data: any = null

    if (normalizedFormType === 'sc100') {
      data = generateSC100Data(
        { ...caseData, debtorName: caseData.debtor.name } as any,
        {
          businessName: settings?.businessName || 'Plaintiff',
          businessAddress: settings?.businessAddress || '',
          businessPhone: settings?.businessPhone || '',
          defaultVenueCounty: settings?.defaultVenueCounty || 'Los Angeles',
          defaultCourt: settings?.defaultCourt || 'Santa Monica Courthouse',
        }
      )
    } else if (normalizedFormType === 'sc104') {
      data = generateSC104Data({ ...caseData, debtorName: caseData.debtor.name } as any)
    }

    return NextResponse.json({
      formType,
      data,
      caseInfo: {
        caseNumber: caseData.caseNumber,
        debtorName: caseData.debtor.name,
        claimAmount: caseData.claimAmount,
        courtName: caseData.courtName,
        venueCounty: caseData.venueCounty,
      }
    })
  } catch (error) {
    console.error('Failed to get preview data:', error)
    return NextResponse.json({ error: 'Failed to get preview data' }, { status: 500 })
  }
}