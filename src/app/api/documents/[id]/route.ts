import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSC100FromTemplate, generateSC104PDF, generateSC100Data, generateSC104Data } from '@/lib/document-generator'
import fs from 'fs'
import path from 'path'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        case: {
          include: {
            debtor: true,
            judgment: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const publicDir = path.join(process.cwd(), 'public', 'documents')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Generate PDF based on form type
    let pdfBytes: Uint8Array
    
    // Normalize formType for comparison (handle both 'SC-100' and 'sc100')
    const normalizedFormType = document.formType.toLowerCase().replace('-', '')
    
    if (normalizedFormType === 'sc100') {
      const caseData = document.case
      const settings = await prisma.settings.findUnique({ where: { id: 'default' } })
      const sc100Data = generateSC100Data(
        { ...caseData, debtorName: document.case.debtor.name } as any,
        {
          businessName: settings?.businessName || 'Plaintiff',
          businessAddress: settings?.businessAddress || '',
          businessPhone: settings?.businessPhone || '',
          defaultVenueCounty: settings?.defaultVenueCounty || 'Los Angeles',
          defaultCourt: settings?.defaultCourt || 'Santa Monica Courthouse',
        }
      )
      pdfBytes = await generateSC100FromTemplate(sc100Data)
    } else if (normalizedFormType === 'sc104') {
      const caseData = document.case
      const sc104Data = generateSC104Data({ ...caseData, debtorName: document.case.debtor.name } as any)
      pdfBytes = await generateSC104PDF(sc104Data)
    } else {
      // Generic PDF for other types
      const pdfDoc = await (await import('pdf-lib')).PDFDocument.create()
      const page = pdfDoc.addPage([792, 612])
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
      page.drawText(`${document.formType.toUpperCase()} - ${document.case.caseNumber}`, { x: 50, y: 500, size: 24, font: helvetica, color: rgb(0, 0, 0) })
      page.drawText(`Debtor: ${document.case.debtor.name}`, { x: 50, y: 470, size: 14, font: helvetica, color: rgb(0, 0, 0) })
      page.drawText(`Status: ${document.status}`, { x: 50, y: 450, size: 14, font: helvetica, color: rgb(0, 0, 0) })
      pdfBytes = await pdfDoc.save()
    }

    // Save to public documents folder
    const filePath = path.join(publicDir, document.fileName)
    fs.writeFileSync(filePath, pdfBytes)

    // Return file path info
    return NextResponse.json({
      id: document.id,
      caseId: document.caseId,
      caseNumber: document.case.caseNumber,
      debtorName: document.case.debtor.name,
      formType: document.formType,
      fileName: document.fileName,
      filePath: `/documents/${document.fileName}`,
      status: document.status,
      createdAt: document.createdAt,
      filedAt: document.filedAt,
      notes: document.notes,
      generated: true,
    })
  } catch (error) {
    console.error('Failed to get/generate document:', error)
    return NextResponse.json({ error: 'Failed to get document' }, { status: 500 })
  }
}