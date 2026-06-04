import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// GET /api/cases/[id]/documents/[docId] - Get a specific document or regenerate PDF
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params

    const document = await prisma.document.findUnique({
      where: { id: docId },
      include: {
        case: {
          include: { debtor: true },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if this document belongs to the specified case
    if (document.caseId !== id) {
      return NextResponse.json({ error: 'Document not found for this case' }, { status: 404 })
    }

    const publicDir = path.join(process.cwd(), 'public', 'documents')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Generate PDF
    let pdfBytes: Uint8Array
    const normalizedFormType = document.formType.toLowerCase().replace('-', '')

    if (normalizedFormType === 'sc100') {
          const { generateSC100FromTemplate, generateSC100Data } = await import('@/lib/document-generator')
      const settings = await prisma.settings.findUnique({ where: { id: 'default' } })
      const sc100Data = generateSC100Data(
        { ...document.case, debtorName: document.case.debtor.name } as any,
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
      const { generateSC104PDF, generateSC104Data } = await import('@/lib/document-generator')
      const sc104Data = generateSC104Data({ ...document.case, debtorName: document.case.debtor.name } as any)
      pdfBytes = await generateSC104PDF(sc104Data)
    } else {
      // Generic PDF
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([792, 612])
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
      page.drawText(`${document.formType} - ${document.case.caseNumber}`, { x: 50, y: 500, size: 24, font: helvetica, color: rgb(0, 0, 0) })
      page.drawText(`Debtor: ${document.case.debtor.name}`, { x: 50, y: 470, size: 14, font: helvetica, color: rgb(0, 0, 0) })
      page.drawText(`Status: ${document.status}`, { x: 50, y: 450, size: 14, font: helvetica, color: rgb(0, 0, 0) })
      pdfBytes = await pdfDoc.save()
    }

    // Save PDF
    const filePath = path.join(publicDir, document.fileName)
    fs.writeFileSync(filePath, pdfBytes)

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

// PATCH /api/cases/[id]/documents/[docId] - Update document (status, notes)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params
    const body = await req.json()

    // Verify document exists and belongs to this case
    const existingDoc = await prisma.document.findFirst({
      where: { id: docId, caseId: id },
    })

    if (!existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Build update data
    const updateData: any = {}
    if (body.status) {
      updateData.status = body.status
      if (body.status === 'filed' && !existingDoc.filedAt) {
        updateData.filedAt = new Date()
      }
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const document = await prisma.document.update({
      where: { id: docId },
      data: updateData,
    })

    return NextResponse.json({
      id: document.id,
      caseId: document.caseId,
      formType: document.formType,
      fileName: document.fileName,
      filePath: `/documents/${document.fileName}`,
      status: document.status,
      createdAt: document.createdAt,
      filedAt: document.filedAt,
      notes: document.notes,
    })
  } catch (error) {
    console.error('Failed to update document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

// DELETE /api/cases/[id]/documents/[docId] - Delete a specific document
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params

    // Verify document exists and belongs to this case
    const document = await prisma.document.findFirst({
      where: { id: docId, caseId: id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', 'documents', document.fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete database record
    await prisma.document.delete({
      where: { id: docId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}