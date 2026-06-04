import { prisma } from './db'
import { generateSC100FromTemplate, generateSC104PDF, generateSC100Data, generateSC104Data } from './document-generator'
import fs from 'fs'
import path from 'path'

export type DocumentFormType = 'SC-100' | 'SC-104' | 'DL-100' | 'WR-100' | 'SC-105' | 'SC-120'
export type DocumentStatus = 'draft' | 'generated' | 'sent' | 'filed' | 'archived'

export interface DocumentResult {
  id: string
  caseId: string
  formType: string
  fileName: string
  status: string
  createdAt: Date
  filedAt: Date | null
  notes: string | null
}

export interface GeneratedDocumentResult extends DocumentResult {
  generated: boolean
  caseNumber?: string
  debtorName?: string
}

// Get all documents for a case
export async function getCaseDocuments(caseId: string): Promise<DocumentResult[]> {
  const documents = await prisma.document.findMany({
    where: { caseId },
    orderBy: { createdAt: 'desc' },
  })
  return documents
}

// Get a single document by ID
export async function getDocumentById(id: string): Promise<DocumentResult | null> {
  const document = await prisma.document.findUnique({
    where: { id },
  })
  return document
}

// Generate and create a document for a case
export async function createCaseDocument(
  caseId: string,
  formType: DocumentFormType,
  options?: { notes?: string; generatePdf?: boolean }
): Promise<GeneratedDocumentResult> {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: { debtor: true },
  })

  if (!caseData) {
    throw new Error('Case not found')
  }

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `${formType}-${caseId.slice(0, 8)}-${timestamp}.pdf`

  // Create document record
  const document = await prisma.document.create({
    data: {
      caseId,
      formType,
      fileName,
      status: 'generated',
      notes: options?.notes || null,
    },
  })

  // Generate PDF if requested
  if (options?.generatePdf !== false) {
    await generateDocumentPdf(document.id)
  }

  return {
      id: document.id,
      caseId: document.caseId,
      formType: document.formType,
      fileName: document.fileName,
      status: document.status,
      createdAt: document.createdAt,
      filedAt: document.filedAt,
      notes: document.notes,
      generated: true,
      caseNumber: caseData.caseNumber,
      debtorName: caseData.debtor.name,
    }
}

// Generate PDF for an existing document
export async function generateDocumentPdf(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      case: {
        include: { debtor: true },
      },
    },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  const publicDir = path.join(process.cwd(), 'public', 'documents')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  let pdfBytes: Uint8Array
  const normalizedFormType = document.formType.toLowerCase().replace('-', '')

  if (normalizedFormType === 'sc100') {
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
    const sc104Data = generateSC104Data({ ...document.case, debtorName: document.case.debtor.name } as any)
    pdfBytes = await generateSC104PDF(sc104Data)
  } else {
    // Generic PDF for other types
    const pdfDoc = await (await import('pdf-lib')).PDFDocument.create()
    const page = pdfDoc.addPage([792, 612])
    const { StandardFonts, rgb } = await import('pdf-lib')
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    page.drawText(`${document.formType} - ${document.case.caseNumber}`, { x: 50, y: 500, size: 24, font: helvetica, color: rgb(0, 0, 0) })
    page.drawText(`Debtor: ${document.case.debtor.name}`, { x: 50, y: 470, size: 14, font: helvetica, color: rgb(0, 0, 0) })
    page.drawText(`Status: ${document.status}`, { x: 50, y: 450, size: 14, font: helvetica, color: rgb(0, 0, 0) })
    pdfBytes = await pdfDoc.save()
  }

  const filePath = path.join(publicDir, document.fileName)
  fs.writeFileSync(filePath, pdfBytes)
}

// Update document status
export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  filedAt?: Date
): Promise<DocumentResult> {
  const updateData: any = { status }
  if (filedAt) {
    updateData.filedAt = filedAt
  }

  const document = await prisma.document.update({
    where: { id },
    data: updateData,
  })

  return document
}

// Mark document as filed
export async function markDocumentFiled(id: string): Promise<DocumentResult> {
  return updateDocumentStatus(id, 'filed', new Date())
}

// Update document notes
export async function updateDocumentNotes(id: string, notes: string): Promise<DocumentResult> {
  const document = await prisma.document.update({
    where: { id },
    data: { notes },
  })
  return document
}

// Delete a document
export async function deleteCaseDocument(id: string): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  // Delete file from filesystem
  const filePath = path.join(process.cwd(), 'public', 'documents', document.fileName)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  // Delete database record
  await prisma.document.delete({
    where: { id },
  })
}

// Get document file path
export function getDocumentFilePath(fileName: string): string {
  return path.join(process.cwd(), 'public', 'documents', fileName)
}

// Check if document file exists
export function documentFileExists(fileName: string): boolean {
  const filePath = getDocumentFilePath(fileName)
  return fs.existsSync(filePath)
}

// Get available form types for a case based on case status
export function getAvailableFormTypes(caseStatus: string): DocumentFormType[] {
  const formTypes: DocumentFormType[] = []

  switch (caseStatus) {
    case 'demand':
      formTypes.push('DL-100') // Demand Letter
      break
    case 'filed':
    case 'hearing':
      formTypes.push('SC-100', 'SC-104', 'SC-105')
      if (caseStatus === 'hearing') {
        formTypes.push('SC-120')
      }
      break
    case 'judgment':
      formTypes.push('WR-100') // Writ of Execution
      break
    default:
      formTypes.push('DL-100', 'SC-100')
  }

  return formTypes
}

// Form type labels
export const FORM_TYPE_LABELS: Record<DocumentFormType, string> = {
  'SC-100': 'SC-100 Claim Form',
  'SC-104': 'SC-104 Proof of Service',
  'SC-105': 'SC-105 Attachment to Judgment',
  'SC-120': 'SC-120 Abstract of Judgment',
  'DL-100': 'DL-100 Demand Letter',
  'WR-100': 'WR-100 Writ of Execution',
}

// Status labels
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  generated: 'Generated',
  sent: 'Sent',
  filed: 'Filed',
  archived: 'Archived',
}