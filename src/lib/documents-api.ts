import { CaseWithDebtor } from './cases-api'

export type DocumentFormType = 'sc100' | 'sc104' | 'demand_letter' | 'writ' | 'other'

export type DocumentStatus = 'draft' | 'generated' | 'sent' | 'filed' | 'archived'

export interface GeneratedDocument {
  id: string
  caseId: string
  caseNumber: string
  debtorName: string
  formType: DocumentFormType
  fileName: string
  status: DocumentStatus
  createdAt: Date
  filedAt?: Date
  notes?: string
}

export const FORM_LABELS: Record<DocumentFormType, string> = {
  sc100: 'SC-100 (Claim Form)',
  sc104: 'SC-104 (Proof of Service)',
  demand_letter: 'Demand Letter',
  writ: 'Writ of Execution',
  other: 'Other',
}

export const PLACEHOLDER_DOCS: GeneratedDocument[] = [
  {
    id: 'doc1',
    caseId: '1',
    caseNumber: '2024-042',
    debtorName: 'Dr. Sarah Kim, DDS',
    formType: 'sc100',
    fileName: 'SC-100_2024-042_SarahKim.pdf',
    status: 'filed',
    createdAt: new Date('2024-05-15'),
    filedAt: new Date('2024-05-16'),
    notes: 'Filed at Santa Monica Courthouse',
  },
  {
    id: 'doc2',
    caseId: '1',
    caseNumber: '2024-042',
    debtorName: 'Dr. Sarah Kim, DDS',
    formType: 'sc104',
    fileName: 'SC-104_2024-042_SarahKim.pdf',
    status: 'filed',
    createdAt: new Date('2024-05-20'),
    filedAt: new Date('2024-05-21'),
    notes: 'Personal service confirmed',
  },
  {
    id: 'doc3',
    caseId: '2',
    caseNumber: '2024-089',
    debtorName: 'Michael Chen',
    formType: 'demand_letter',
    fileName: 'DemandLetter_2024-089_MichaelChen.pdf',
    status: 'sent',
    createdAt: new Date('2024-06-01'),
    notes: 'Sent via USPS Certified Mail',
  },
  {
    id: 'doc4',
    caseId: '3',
    caseNumber: '2024-056',
    debtorName: 'Green Valley Apartments',
    formType: 'sc100',
    fileName: 'SC-100_2024-056_GreenValley.pdf',
    status: 'draft',
    createdAt: new Date('2024-06-10'),
  },
  {
    id: 'doc5',
    caseId: '4',
    caseNumber: '2023-211',
    debtorName: 'Jennifer Martinez',
    formType: 'writ',
    fileName: 'Writ_2023-211_Martinez.pdf',
    status: 'generated',
    createdAt: new Date('2024-05-28'),
  },
]

export async function getDocuments(caseId?: string): Promise<GeneratedDocument[]> {
  if (caseId) {
    return PLACEHOLDER_DOCS.filter(d => d.caseId === caseId)
  }
  return PLACEHOLDER_DOCS
}

export async function getDocumentById(id: string): Promise<GeneratedDocument | undefined> {
  return PLACEHOLDER_DOCS.find(d => d.id === id)
}

export async function generateDocument(
  caseData: CaseWithDebtor,
  formType: DocumentFormType
): Promise<GeneratedDocument> {
  // Placeholder - in real implementation, this would generate actual PDF
  const timestamp = new Date().toISOString().split('T')[0]
  const sanitizedName = caseData.debtorName.replace(/[^a-zA-Z0-9]/g, '')
  
  const fileNames: Record<DocumentFormType, string> = {
    sc100: `SC-100_${caseData.caseNumber}_${sanitizedName}.pdf`,
    sc104: `SC-104_${caseData.caseNumber}_${sanitizedName}.pdf`,
    demand_letter: `DemandLetter_${caseData.caseNumber}_${sanitizedName}.pdf`,
    writ: `Writ_${caseData.caseNumber}_${sanitizedName}.pdf`,
    other: `Document_${caseData.caseNumber}_${timestamp}.pdf`,
  }

  const newDoc: GeneratedDocument = {
    id: `doc${Date.now()}`,
    caseId: caseData.id,
    caseNumber: caseData.caseNumber,
    debtorName: caseData.debtorName,
    formType,
    fileName: fileNames[formType],
    status: 'draft',
    createdAt: new Date(),
  }

  return newDoc
}

export interface SC100Data {
  // Plaintiff info
  plaintiffName: string
  plaintiffAddress: string
  plaintiffPhone: string
  
  // Defendant info
  defendantName: string
  defendantAddress: string
  defendantCity: string
  defendantState: string
  defendantZip: string
  
  // Claim details
  claimAmount: number
  claimDescription: string
  reasonForClaim: string
  
  // Court info
  courtCounty: string
  courtName: string
  
  // Case info
  caseNumber?: string
  filingDate?: Date
}

export function generateSC100Data(caseData: CaseWithDebtor, settings: {
  businessName: string
  businessAddress: string
  businessPhone: string
  defaultVenueCounty: string
  defaultCourt: string
}): SC100Data {
  return {
    plaintiffName: settings.businessName,
    plaintiffAddress: settings.businessAddress,
    plaintiffPhone: settings.businessPhone,
    defendantName: caseData.debtorName,
    defendantAddress: '', // Would come from debtor record
    defendantCity: '',
    defendantState: 'CA',
    defendantZip: '',
    claimAmount: caseData.claimAmount,
    claimDescription: `Unpaid dental services - Case #${caseData.caseNumber}`,
    reasonForClaim: 'Goods sold and delivered / Services rendered',
    courtCounty: caseData.venueCounty || settings.defaultVenueCounty,
    courtName: caseData.courtName || settings.defaultCourt,
  }
}

export interface SC104Data {
  // Case info
  caseNumber: string
  courtName: string
  courtCounty: string
  
  // Plaintiff info
  plaintiffName: string
  
  // Defendant info
  defendantName: string
  defendantAddress: string
  
  // Service info
  servedDate: Date
  servedTime: string
  servedLocation: string
  servedBy: string
  servedByTitle: string
  serviceDescription: string
  
  // Additional details
  documentsServed?: string
  cost: number
}

export function generateSC104Data(caseData: CaseWithDebtor): SC104Data {
  return {
    caseNumber: caseData.caseNumber,
    courtName: caseData.courtName,
    courtCounty: caseData.venueCounty,
    plaintiffName: '', // Would come from settings
    defendantName: caseData.debtorName,
    defendantAddress: '', // Would come from debtor record
    servedDate: new Date(),
    servedTime: '',
    servedLocation: '',
    servedBy: '',
    servedByTitle: '',
    serviceDescription: 'Personal service - served to defendant directly',
    documentsServed: 'SC-100, SC-104 forms',
    cost: 0, // Service cost
  }
}