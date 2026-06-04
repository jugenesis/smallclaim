import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SC100Data, SC104Data } from '@/lib/document-generator'
import fs from 'fs'
import path from 'path'

// GET /api/cases/[id]/documents - List all documents for a case
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const documents = await prisma.document.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Failed to list documents:', error)
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 })
  }
}

// POST /api/cases/[id]/documents - Create a new document
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify case exists
    const caseData = await prisma.case.findUnique({ where: { id } })
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Generate filename based on form type
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${body.formType}-${id.slice(0, 8)}-${timestamp}.pdf`

    const document = await prisma.document.create({
      data: {
        caseId: id,
        formType: body.formType,
        fileName: fileName,
        status: 'generated',
        notes: body.description || null,
      }
    })

    // Generate PDF if formType is supported
    // Pass custom data if provided, otherwise use auto-generated data
    await generatePdfForDocument(document, body.customData)

    return NextResponse.json({
      id: document.id,
      caseId: document.caseId,
      formType: document.formType,
      fileName: document.fileName,
      filePath: `/documents/${document.fileName}`,
      generatedAt: document.createdAt,
      filedAt: document.filedAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}

// DELETE /api/cases/[id]/documents - Delete all documents for a case
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find all documents for this case
    const documents = await prisma.document.findMany({
      where: { caseId: id },
    })

    // Delete files from filesystem
    const publicDir = path.join(process.cwd(), 'public', 'documents')
    for (const doc of documents) {
      const filePath = path.join(publicDir, doc.fileName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Delete all document records
    await prisma.document.deleteMany({
      where: { caseId: id },
    })

    return NextResponse.json({ success: true, deletedCount: documents.length })
  } catch (error) {
    console.error('Failed to delete documents:', error)
    return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 })
  }
}

async function generatePdfForDocument(document: any, customData?: any): Promise<void> {
  const { generateSC100FromTemplate, generateSC104PDF, generateSC100Data, generateSC104Data } = await import('@/lib/document-generator')
  
  const publicDir = path.join(process.cwd(), 'public', 'documents')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  let pdfBytes: Uint8Array
  const normalizedFormType = document.formType.toLowerCase().replace('-', '')

  if (normalizedFormType === 'sc100') {
    const caseData = await prisma.case.findUnique({
      where: { id: document.caseId },
      include: { debtor: true },
    })
    const settings = await prisma.settings.findUnique({ where: { id: 'default' } })
    
    if (caseData) {
      // Use custom data if provided, otherwise auto-generate
      let sc100Data: SC100Data
      if (customData) {
        sc100Data = customData
      } else {
        sc100Data = generateSC100Data(
          { ...caseData, debtorName: caseData.debtor.name } as any,
          {
            businessName: settings?.businessName || 'Plaintiff',
            businessAddress: settings?.businessAddress || '',
            businessPhone: settings?.businessPhone || '',
            defaultVenueCounty: settings?.defaultVenueCounty || 'Los Angeles',
            defaultCourt: settings?.defaultCourt || 'Santa Monica Courthouse',
          }
        )
      }
      pdfBytes = await generateSC100FromTemplate(sc100Data)
    } else {
      return
    }
  } else if (normalizedFormType === 'sc104') {
    const caseData = await prisma.case.findUnique({
      where: { id: document.caseId },
      include: { debtor: true },
    })
    if (caseData) {
      let sc104Data: SC104Data
      if (customData) {
        sc104Data = customData
      } else {
        sc104Data = generateSC104Data({ ...caseData, debtorName: caseData.debtor.name } as any)
      }
      pdfBytes = await generateSC104PDF(sc104Data)
    } else {
      return
    }
  } else {
    // Generic PDF for other types (DL-100, WR-100, etc.)
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([792, 612])
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    const caseData = await prisma.case.findUnique({
      where: { id: document.caseId },
      include: { debtor: true },
    })
    
    // Use custom content if provided
    const content = customData?.content || `${document.formType} - ${caseData?.caseNumber || 'Unknown'}`
    const debtor = customData?.debtorName || caseData?.debtor.name || 'Unknown'
    const status = customData?.status || document.status
    
    page.drawText(content, { x: 50, y: 500, size: 24, font: helvetica, color: rgb(0, 0, 0) })
    page.drawText(`Debtor: ${debtor}`, { x: 50, y: 470, size: 14, font: helvetica, color: rgb(0, 0, 0) })
    page.drawText(`Status: ${status}`, { x: 50, y: 450, size: 14, font: helvetica, color: rgb(0, 0, 0) })
    pdfBytes = await pdfDoc.save()
  }

  const filePath = path.join(publicDir, document.fileName)
  fs.writeFileSync(filePath, pdfBytes)
}