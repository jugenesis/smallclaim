import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function inspectPDF() {
  const pdfPath = path.join(process.cwd(), 'templates', 'sc100-decrypted.pdf')
  const pdfBytes = fs.readFileSync(pdfPath)
  
  console.log(`\n=== PDF Info ===`)
  console.log(`  File size: ${pdfBytes.length} bytes`)
  console.log(`  First bytes: ${pdfBytes.slice(0, 10).toString('hex')}`)
  
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
    
    // Get page count safely
    let pageCount = 0
    try {
      const pages = pdfDoc.getPages()
      pageCount = pages.length
    } catch (e) {
      console.log('  Could not get page count')
    }
    
    console.log(`  Pages: ${pageCount}`)
    
    const form = pdfDoc.getForm()
    const fields = form.getFields()
    
    console.log(`\n=== Form Fields (${fields.length} total) ===\n`)
    
    const textFields: string[] = []
    const checkBoxes: string[] = []
    const radioGroups: string[] = []
    const dropdowns: string[] = []
    const otherFields: string[] = []
    
    for (const field of fields) {
      const name = field.getName()
      const type = field.constructor.name
      
      if (type === 'PDFTextField') {
        textFields.push(name)
      } else if (type === 'PDFCheckBox') {
        checkBoxes.push(name)
      } else if (type === 'PDFRadioGroup') {
        radioGroups.push(name)
      } else if (type === 'PDFDropdown') {
        dropdowns.push(name)
      } else {
        otherFields.push(`${name} (${type})`)
      }
    }
    
    console.log('=== TEXT FIELDS ===')
    textFields.sort().forEach(f => console.log(`  - ${f}`))
    
    console.log('\n=== CHECKBOXES ===')
    checkBoxes.sort().forEach(f => console.log(`  - ${f}`))
    
    console.log('\n=== RADIO GROUPS ===')
    radioGroups.sort().forEach(f => console.log(`  - ${f}`))
    
    console.log('\n=== DROPDOWNS ===')
    dropdowns.sort().forEach(f => console.log(`  - ${f}`))
    
    if (otherFields.length > 0) {
      console.log('\n=== OTHER FIELDS ===')
      otherFields.forEach(f => console.log(`  - ${f}`))
    }
    
    console.log('\n=== SAMPLE FIELD INSPECTION ===')
    if (textFields.length > 0) {
      const sample = form.getTextField(textFields[0])
      console.log(`  Field: ${textFields[0]}`)
      console.log(`  Type: ${sample.constructor.name}`)
      try {
        console.log(`  Value: ${sample.getText()}`)
      } catch (e) {
        console.log(`  Value: (could not read)`)
      }
    }
    
  } catch (error: any) {
    console.log(`\n  Error loading PDF: ${error.message}`)
  }
}

inspectPDF().catch(console.error)