import { PDFDocument, StandardFonts, rgb, LineCapStyle } from 'pdf-lib'
import { CaseWithDebtor } from './cases-api'
import fs from 'fs'
import path from 'path'

export interface SC100Data {
  plaintiffName: string
  plaintiffAddress: string
  plaintiffCity?: string
  plaintiffState?: string
  plaintiffZip?: string
  plaintiffPhone: string
  defendantName: string
  defendantAddress: string
  defendantCity: string
  defendantState: string
  defendantZip: string
  claimAmount: number
  claimDescription: string
  reasonForClaim: string
  courtCounty: string
  courtName: string
  caseNumber?: string
  filingDate?: Date
}

export interface SC104Data {
  caseNumber: string
  courtName: string
  courtCounty: string
  plaintiffName: string
  defendantName: string
  defendantAddress: string
  servedDate: Date
  servedTime: string
  servedLocation: string
  servedBy: string
  servedByTitle: string
  serviceDescription: string
  documentsServed?: string
  cost: number
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function drawBox(page: any, x: number, y: number, w: number, h: number, borderWidth: number = 1) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: borderWidth, color: rgb(0, 0, 0) })
  page.drawLine({ start: { x, y: y - h }, end: { x: x + w, y: y - h }, thickness: borderWidth, color: rgb(0, 0, 0) })
  page.drawLine({ start: { x, y }, end: { x, y: y - h }, thickness: borderWidth, color: rgb(0, 0, 0) })
  page.drawLine({ start: { x: x + w, y }, end: { x: x + w, y: y - h }, thickness: borderWidth, color: rgb(0, 0, 0) })
}

function drawCheckbox(page: any, x: number, y: number, size: number = 10) {
  page.drawRectangle({ x, y: y - size, width: size, height: size, borderColor: rgb(0, 0, 0), borderWidth: 1 })
}

function drawFieldLine(page: any, x: number, y: number, length: number) {
  page.drawLine({ start: { x, y }, end: { x: x + length, y }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) })
}

export async function generateSC100PDF(data: SC100Data): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([792, 612]) // Letter size
  const { width, height } = page.getSize()
  
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const courier = await pdfDoc.embedFont(StandardFonts.Courier)
  
  const black = rgb(0, 0, 0)
  const blue = rgb(0.06, 0.2, 0.6)
  
  let y = height - 50
  
  // Header
  page.drawText('FORM SC-100', { x: 50, y, size: 14, font: timesBold, color: black })
  page.drawText('CLAIM AND ORDER TO GO TO SMALL CLAIMS COURT', { x: 150, y, size: 12, font: timesBold, color: black })
  y -= 20
  
  // Court name
  page.drawText('COURT: ' + data.courtName, { x: 50, y, size: 11, font: timesBold, color: blue })
  y -= 15
  page.drawText('COUNTY: ' + data.courtCounty, { x: 50, y, size: 11, font: timesBold, color: blue })
  y -= 25
  
  // Case number
  if (data.caseNumber) {
    page.drawText('Case Number: ' + data.caseNumber, { x: 50, y, size: 11, font: timesBold, color: black })
    y -= 25
  }
  
  // Plaintiff info
  page.drawText('PLAINTIFF (Person Filing Claim):', { x: 50, y, size: 11, font: timesBold, color: black })
  y -= 15
  page.drawText(data.plaintiffName, { x: 70, y, size: 11, font: timesRoman, color: black })
  y -= 12
  page.drawText(data.plaintiffAddress, { x: 70, y, size: 11, font: timesRoman, color: black })
  y -= 12
  page.drawText(data.plaintiffPhone, { x: 70, y, size: 11, font: timesRoman, color: black })
  y -= 25
  
  // Defendant info
  page.drawText('DEFENDANT (Person Being Sued):', { x: 50, y, size: 11, font: timesBold, color: black })
  y -= 15
  page.drawText(data.defendantName, { x: 70, y, size: 11, font: timesRoman, color: black })
  y -= 12
  
  const fullAddress = [data.defendantAddress, data.defendantCity, data.defendantState, data.defendantZip]
    .filter(Boolean).join(', ')
  if (fullAddress) {
    page.drawText(fullAddress, { x: 70, y, size: 11, font: timesRoman, color: black })
    y -= 12
  }
  y -= 25
  
  // Amount claimed
  page.drawText('AMOUNT CLAIMED: ' + formatCurrency(data.claimAmount), { x: 50, y, size: 12, font: timesBold, color: black })
  y -= 25
  
  // Reason for claim
  page.drawText('REASON FOR CLAIM (What happened? Why do you believe you are owed money?):', { x: 50, y, size: 11, font: timesBold, color: black })
  y -= 15
  page.drawText(data.reasonForClaim, { x: 70, y, size: 11, font: timesRoman, color: black })
  y -= 15
  page.drawText(data.claimDescription, { x: 70, y, size: 11, font: timesRoman, color: black })
  y -= 30
  
  // What do you want
  page.drawText('What do you want?', { x: 50, y, size: 11, font: timesBold, color: black })
  y -= 15
  page.drawText('Judgment for ' + formatCurrency(data.claimAmount) + ' plus costs of suit.', { x: 70, y, size: 11, font: timesRoman, color: black })
  y -= 40
  
  // Signature section
  page.drawText('Date: ' + (data.filingDate ? formatDate(data.filingDate) : formatDate(new Date())), { x: 50, y, size: 11, font: timesRoman, color: black })
  y -= 30
  page.drawText('_________________________________', { x: 50, y, size: 11, font: timesRoman, color: black })
  y -= 12
  page.drawText('Signature of Plaintiff', { x: 50, y, size: 10, font: timesRoman, color: black })
  y -= 40
  
  // Instructions
  page.drawText('INSTRUCTIONS:', { x: 50, y, size: 11, font: timesBold, color: black })
  y -= 15
  const instructions = [
    '1. Fill out this form and take it to the court clerk.',
    '2. Pay the filing fee (ask about fee waivers if you cannot afford).',
    '3. The clerk will set a hearing date.',
    '4. Serve the defendant at least 20 days before the hearing (30 days if out of county).',
    '5. Bring proof of service to the hearing.',
  ]
  for (const instruction of instructions) {
    page.drawText(instruction, { x: 70, y, size: 9, font: timesRoman, color: black })
    y -= 12
  }
  
  return pdfDoc.save()
  }

  export async function generateSC104PDF(data: SC104Data): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([792, 612])
  const { width } = page.getSize()
  
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  
  const black = rgb(0, 0, 0)
  const darkBlue = rgb(0.1, 0.1, 0.4)
  
  const margin = 40
  const lineHeight = 14
  let y = 580

  // Header box
  page.drawRectangle({ x: margin, y: y - 45, width: width - 2 * margin, height: 35, borderColor: darkBlue, borderWidth: 2 })
  page.drawText('FORM SC-104', { x: margin + 5, y: y - 15, size: 12, font: timesBold, color: darkBlue })
  page.drawText('PROOF OF SERVICE', { x: margin + 100, y: y - 12, size: 16, font: timesBold, color: black })
  page.drawText('(Small Claims)', { x: margin + 280, y: y - 12, size: 12, font: timesRoman, color: black })
  y -= 55

  // Court info section
  page.drawText('COURT:', { x: margin, y, size: 10, font: timesBold, color: black })
  drawFieldLine(page, margin + 45, y - 2, 200)
  page.drawText('COUNTY:', { x: margin + 260, y, size: 10, font: timesBold, color: black })
  drawFieldLine(page, margin + 305, y - 2, 100)
  y -= lineHeight
  
  page.drawText('STREET ADDRESS:', { x: margin, y, size: 10, font: timesBold, color: black })
  drawFieldLine(page, margin + 95, y - 2, 310)
  y -= lineHeight
  
  page.drawText('CITY/ZIP:', { x: margin, y, size: 10, font: timesBold, color: black })
  drawFieldLine(page, margin + 60, y - 2, 150)
  page.drawText('TELEPHONE:', { x: margin + 220, y, size: 10, font: timesBold, color: black })
  drawFieldLine(page, margin + 285, y - 2, 130)
  y -= lineHeight
  
  page.drawText('CASE NUMBER:', { x: margin, y, size: 10, font: timesBold, color: black })
  drawFieldLine(page, margin + 90, y - 2, 150)
  page.drawText('HEARING DATE:', { x: margin + 260, y, size: 10, font: timesBold, color: black })
  drawFieldLine(page, margin + 340, y - 2, 75)
  y -= 30

  // Party info boxes
  page.drawRectangle({ x: margin, y: y - 50, width: (width - 2 * margin) / 2 - 5, height: 40, borderColor: black, borderWidth: 1 })
  page.drawText('1. PLAINTIFF NAME:', { x: margin + 5, y: y - 12, size: 9, font: timesBold, color: black })
  drawFieldLine(page, margin + 5, y - 25, 280)
  page.drawText('TELEPHONE:', { x: margin + 5, y: y - 38, size: 9, font: timesBold, color: black })
  drawFieldLine(page, margin + 70, y - 40, 100)
  
  page.drawRectangle({ x: margin + (width - 2 * margin) / 2 + 5, y: y - 50, width: (width - 2 * margin) / 2 - 5, height: 40, borderColor: black, borderWidth: 1 })
  page.drawText('2. DEFENDANT NAME:', { x: margin + (width - 2 * margin) / 2 + 10, y: y - 12, size: 9, font: timesBold, color: black })
  drawFieldLine(page, margin + (width - 2 * margin) / 2 + 10, y - 25, 280)
  page.drawText('TELEPHONE:', { x: margin + (width - 2 * margin) / 2 + 10, y: y - 38, size: 9, font: timesBold, color: black })
  drawFieldLine(page, margin + (width - 2 * margin) / 2 + 75, y - 40, 100)
  y -= 60

  // Service information section
  page.drawRectangle({ x: margin, y: y - 90, width: width - 2 * margin, height: 80, borderColor: black, borderWidth: 1 })
  page.drawText('3. SERVICE INFORMATION', { x: margin + 5, y: y - 12, size: 10, font: timesBold, color: black })
  y -= 22
  
  page.drawText('Date of service:', { x: margin + 10, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 90, y - 2, 80)
  page.drawText('Time:', { x: margin + 180, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 205, y - 2, 60)
  page.drawText('a.m./p.m.', { x: margin + 270, y, size: 9, font: timesRoman, color: black })
  y -= lineHeight
  
  page.drawText('Address where served:', { x: margin + 10, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 105, y - 2, 300)
  y -= lineHeight
  
  page.drawText('City/State/Zip:', { x: margin + 10, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 85, y - 2, 200)
  page.drawText('County:', { x: margin + 295, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 335, y - 2, 70)
  y -= lineHeight
  
  page.drawText('Location of service:', { x: margin + 10, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 95, y - 2, 120)
  page.drawText('(e.g., home, business)', { x: margin + 220, y, size: 8, font: timesRoman, color: black })
  y -= 100

  // Server info
  page.drawRectangle({ x: margin, y: y - 55, width: width - 2 * margin, height: 45, borderColor: black, borderWidth: 1 })
  page.drawText('4. PERSON WHO SERVED THE PAPERS', { x: margin + 5, y: y - 12, size: 10, font: timesBold, color: black })
  y -= 22
  
  page.drawText('Name:', { x: margin + 10, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 40, y - 2, 150)
  page.drawText('Title:', { x: margin + 200, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 225, y - 2, 100)
  y -= lineHeight
  
  page.drawText('Address:', { x: margin + 10, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 55, y - 2, 270)
  page.drawText('Phone:', { x: margin + 335, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 365, y - 2, 70)
  y -= 65

  // Documents served
  page.drawRectangle({ x: margin, y: y - 55, width: width - 2 * margin, height: 45, borderColor: black, borderWidth: 1 })
  page.drawText('5. DOCUMENTS SERVED (Check all that apply)', { x: margin + 5, y: y - 12, size: 10, font: timesBold, color: black })
  y -= 22
  
  drawCheckbox(page, margin + 10, y - 5)
  page.drawText('SC-100 (Claim Form)', { x: margin + 25, y: y - 9, size: 9, font: timesRoman, color: black })
  
  drawCheckbox(page, margin + 150, y - 5)
  page.drawText('SC-104 (Proof of Service)', { x: margin + 165, y: y - 9, size: 9, font: timesRoman, color: black })
  
  drawCheckbox(page, margin + 330, y - 5)
  page.drawText('Other:', { x: margin + 345, y: y - 9, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 380, y - 2, 60)
  y -= 65

  // Service description
  page.drawRectangle({ x: margin, y: y - 55, width: width - 2 * margin, height: 45, borderColor: black, borderWidth: 1 })
  page.drawText('6. DESCRIPTION OF SERVICE (How were the papers served?)', { x: margin + 5, y: y - 12, size: 10, font: timesBold, color: black })
  y -= 22
  
  drawCheckbox(page, margin + 10, y - 5)
  page.drawText('Personal service - served to defendant directly', { x: margin + 25, y: y - 9, size: 9, font: timesRoman, color: black })
  y -= lineHeight
  
  drawCheckbox(page, margin + 10, y - 5)
  page.drawText('Substituted service - left with person at usual residence', { x: margin + 25, y: y - 9, size: 9, font: timesRoman, color: black })
  y -= lineHeight
  
  drawCheckbox(page, margin + 10, y - 5)
  page.drawText('Other (describe):', { x: margin + 25, y: y - 9, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 110, y - 2, 200)
  y -= 65

  // Cost
  page.drawRectangle({ x: margin, y: y - 40, width: width - 2 * margin, height: 30, borderColor: black, borderWidth: 1 })
  page.drawText('7. COST OF SERVICE:', { x: margin + 5, y: y - 12, size: 10, font: timesBold, color: black })
  page.drawText('$', { x: margin + 140, y: y - 12, size: 10, font: timesRoman, color: black })
  drawFieldLine(page, margin + 150, y - 14, 80)
  page.drawText('(Attach receipt if available)', { x: margin + 240, y: y - 12, size: 8, font: timesRoman, color: black })
  y -= 50

  // Declaration and signature
  page.drawRectangle({ x: margin, y: y - 70, width: width - 2 * margin, height: 60, borderColor: black, borderWidth: 1 })
  page.drawText('8. DECLARATION', { x: margin + 5, y: y - 12, size: 10, font: timesBold, color: black })
  page.drawText('I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct.', { x: margin + 5, y: y - 26, size: 9, font: timesRoman, color: black })
  y -= 35
  
  page.drawText('Date: ', { x: margin + 5, y, size: 9, font: timesRoman, color: black })
  drawFieldLine(page, margin + 35, y - 2, 100)
  page.drawText('Signature: ___________________________________________', { x: margin + 150, y, size: 9, font: timesRoman, color: black })
  y -= lineHeight
  page.drawText('Type or print name: ___________________________________________', { x: margin + 5, y, size: 9, font: timesRoman, color: black })
  
  return pdfDoc.save()
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
    defendantAddress: '',
    defendantCity: '',
    defendantState: 'CA',
    defendantZip: '',
    claimAmount: caseData.claimAmount,
    claimDescription: `Unpaid services - Case #${caseData.caseNumber}`,
    reasonForClaim: 'Goods sold and delivered / Services rendered',
    courtCounty: caseData.venueCounty || settings.defaultVenueCounty,
    courtName: caseData.courtName || settings.defaultCourt,
    caseNumber: caseData.caseNumber,
    filingDate: new Date(),
  }
}

export function generateSC104Data(caseData: CaseWithDebtor): SC104Data {
  return {
    caseNumber: caseData.caseNumber,
    courtName: caseData.courtName,
    courtCounty: caseData.venueCounty,
    plaintiffName: '',
    defendantName: caseData.debtorName,
    defendantAddress: '',
    servedDate: new Date(),
    servedTime: '',
    servedLocation: '',
    servedBy: '',
    servedByTitle: '',
    serviceDescription: 'Personal service - served to defendant directly',
    documentsServed: 'SC-100, SC-104 forms',
    cost: 0,
  }
}

// Field name mappings for official SC-100 PDF template
const SC100_FIELD_MAP = {
  plaintiffName: 'SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffName1[0]',
  plaintiffAddress: 'SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffAddress1[0]',
  plaintiffCity: 'SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffCity1[0]',
  plaintiffState: 'SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffState1[0]',
  plaintiffZip: 'SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffZip1[0]',
  plaintiffPhone: 'SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffPhone1[0]',
  defendantName: 'SC-100[0].Page2[0].List2[0].item2[0].DefendantName1[0]',
  defendantAddress: 'SC-100[0].Page2[0].List2[0].item2[0].DefendantAddress1[0]',
  defendantCity: 'SC-100[0].Page2[0].List2[0].item2[0].DefendantCity1[0]',
  defendantState: 'SC-100[0].Page2[0].List2[0].item2[0].DefendantState1[0]',
  defendantZip: 'SC-100[0].Page2[0].List2[0].item2[0].DefendantZip1[0]',
  plaintiffClaimAmount: 'SC-100[0].Page2[0].List3[0].PlaintiffClaimAmount1[0]',
  courtCounty: 'SC-100[0].Page1[0].CaptionRight[0].County[0].CourtInfo[0]',
  courtName: 'SC-100[0].Page1[0].CaptionRight[0].CN[0].CaseName[0]',
  caseNumber: 'SC-100[0].Page1[0].CaptionRight[0].CN[0].CaseNumber[0]',
}

export async function generateSC100FromTemplate(data: SC100Data): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), 'templates', 'sc100-decrypted.pdf')
  
  if (!fs.existsSync(templatePath)) {
    // Fall back to drawing-based generation if template not found
    console.warn('SC-100 template not found, using drawing fallback')
    return generateSC100PDF(data)
  }
  
  const templateBytes = fs.readFileSync(templatePath)
  const pdfDoc = await PDFDocument.load(templateBytes)
  const form = pdfDoc.getForm()
  
  // Fill text fields
  try {
    form.getTextField(SC100_FIELD_MAP.plaintiffName).setText(data.plaintiffName)
  } catch (e) { /* ignore if field doesn't exist */ }
  try {
    form.getTextField(SC100_FIELD_MAP.plaintiffPhone).setText(data.plaintiffPhone)
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.plaintiffAddress).setText(data.plaintiffAddress)
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.plaintiffCity).setText(data.plaintiffCity || '')
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.plaintiffState).setText(data.plaintiffState || 'CA')
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.plaintiffZip).setText(data.plaintiffZip || '')
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.defendantName).setText(data.defendantName)
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.defendantAddress).setText(data.defendantAddress)
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.defendantCity).setText(data.defendantCity || '')
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.defendantState).setText(data.defendantState || 'CA')
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.defendantZip).setText(data.defendantZip || '')
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.plaintiffClaimAmount).setText(data.claimAmount.toString())
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.courtCounty).setText(data.courtCounty)
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.courtName).setText(data.courtName)
  } catch (e) { /* ignore */ }
  try {
    form.getTextField(SC100_FIELD_MAP.caseNumber).setText(data.caseNumber || '')
  } catch (e) { /* ignore */ }
  
  // Flatten form to make it non-editable
  form.flatten()
  
  return pdfDoc.save()
}