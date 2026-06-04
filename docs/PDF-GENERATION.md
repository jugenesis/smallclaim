# PDF Document Generation Process

## Overview

The Small Claims System generates PDF documents for California court forms (SC-100, SC-104, etc.). This document describes the current implementation and alternative approaches considered.

## Current Implementation

### Architecture

The system uses **pdf-lib** to fill official California court form templates with case data.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Case Data     │────▶│ document-        │────▶│   PDF File      │
│   (Prisma)      │     │ generator.ts     │     │   (public/docs) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                           │
                           ▼
                   ┌──────────────────┐
                   │ Official Form    │
                   │ Template         │
                   │ (sc100-decrypted)│
                   └──────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/document-generator.ts` | Core PDF generation logic |
| `src/app/api/cases/[id]/documents/route.ts` | Document CRUD API |
| `src/app/api/cases/[id]/documents/preview/route.ts` | Form preview data API |
| `src/app/cases/[id]/page.tsx` | Case detail with document UI |

### Supported Forms

| Form | Status | Editable |
|------|--------|----------|
| SC-100 (Claim Form) | ✅ Generating | ✅ Yes - edit modal |
| SC-104 (Proof of Service) | ✅ Generating | ✅ Yes - edit modal |
| SC-105, SC-107, WR-100, DL-100 | ✅ Generating | ❌ Quick generate |

### Flow: Generate Document with Edit

1. User clicks "Documents ▾" → "Generate New"
2. Select form type (SC-100/SC-104 marked "Editable")
3. System fetches pre-filled data from `/api/cases/[id]/documents/preview`
4. Edit modal shows form fields
5. User modifies fields and clicks "Generate PDF"
6. API receives `customData` and passes to pdf-lib
7. PDF saved to `public/documents/{formType}-{caseId}.pdf`

## Research: Official Court Form Analysis

### Official Forms

| Form | Source | Encryption | Format |
|------|--------|------------|--------|
| SC-100 | courts.ca.gov/documents/sc100.pdf | AES-256 | AcroForm |
| SC-104 | courts.ca.gov/documents/sc104.pdf | AES-256 | AcroForm |

### Field Names (from official SC-100)

```
PlaintiffName1[0], PlaintiffPhone1[0], PlaintiffAddress1[0]
DefendantName1[0], DefendantPhone1[0], DefendantAddress1[0]
PlaintiffClaimAmount1[0], Lia[0].FillField2[0]
Checkboxes: /1 (checked), /Off (unchecked)
Date format: xxxx-xx-xx
```

### Why Official Template Approach?

We use the **qpdf + pdf-lib hybrid approach**:

1. **qpdf** decrypts official CA court forms (AES-256 encrypted) once:
   ```bash
   qpdf --decrypt templates/sc100.pdf templates/sc100-decrypted.pdf
   ```

2. **pdf-lib** fills the decrypted template:
   - Loads decrypted template
   - Fills text fields using discovered field names
   - Flattens form to make it non-editable
   - Saves to output directory

**Benefits:**
- ✅ Uses official court forms
- ✅ Works on all platforms
- ✅ No external runtime dependencies
- ✅ Full form field support

### Field Name Discovery

Use `scripts/inspect-pdf-fields.ts` to analyze any PDF:

```bash
npx tsx scripts/inspect-pdf-fields.ts
```

Example output shows field names like:
```
SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffName1[0]
SC-100[0].Page2[0].List3[0].PlaintiffClaimAmount1[0]
```

### SC-100 Field Mapping

| Data Field | PDF Form Field |
|------------|----------------|
| plaintiffName | PlaintiffName1[0] |
| plaintiffAddress | PlaintiffAddress1[0] |
| plaintiffCity | PlaintiffCity1[0] |
| plaintiffState | PlaintiffState1[0] |
| plaintiffZip | PlaintiffZip1[0] |
| plaintiffPhone | PlaintiffPhone1[0] |
| defendantName | DefendantName1[0] |
| defendantAddress | DefendantAddress1[0] |
| defendantCity | DefendantCity1[0] |
| defendantState | DefendantState1[0] |
| defendantZip | DefendantZip1[0] |
| claimAmount | PlaintiffClaimAmount1[0] |
| courtCounty | CourtInfo[0] |
| courtName | CaseName[0] |
| caseNumber | CaseNumber[0] |

## Alternative Approaches Considered

### 1. qpdf + pdf-lib Hybrid

**Concept:** Decrypt official forms with qpdf, then fill with pdf-lib

```bash
# Decrypt PDF (requires no password for reading)
qpdf --decrypt official-sc100.pdf decrypted-sc100.pdf
```

**Pros:**
- Uses official court forms
- Full form field support

**Cons:**
- ❌ Requires qpdf binary installation
- ❌ Windows permission issues with Chocolatey
- ❌ Adds serverless incompatibility

### 2. pdf-fill-form (Node.js library)

**Pros:**
- Native Node.js API
- Full AcroForm support

**Cons:**
- ❌ **Windows not supported**
- Uses Poppler (GPL)

### 3. pdfjs-dist (Mozilla)

**Pros:**
- Handles encrypted PDFs
- Excellent parsing

**Cons:**
- ❌ Read-only - cannot save modifications

### 4. Adobe PDF Services API

**Pros:**
- Official solution
- Handles all PDF types

**Cons:**
- 💰 Expensive
- 🔒 Requires API keys

## Recommended Approach

**Use qpdf + pdf-lib hybrid** (now implemented):

1. ✅ Official court forms (proper formatting)
2. ✅ Works on all platforms (no external services)
3. ✅ Full form field support via pdf-lib
4. ✅ Documents are clean (flattened, non-editable)
5. ✅ Single one-time decrypt step for templates

### Decrypt Template (One-Time Setup)

```bash
# Download official form
curl -o templates/sc100.pdf https://selfhelp.courts.ca.gov/jcc-form/SC-100

# Decrypt for pdf-lib use
qpdf --decrypt templates/sc100.pdf templates/sc100-decrypted.pdf

# Inspect fields
npx tsx scripts/inspect-pdf-fields.ts
```

### Generate Document (Runtime)

```javascript
// In document-generator.ts
async function generateSC100FromTemplate(data: SC100Data): Promise<Uint8Array> {
  const templateBytes = fs.readFileSync('./templates/sc100-decrypted.pdf')
  const pdfDoc = await PDFDocument.load(templateBytes)
  const form = pdfDoc.getForm()
  
  form.getTextField('SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffName1[0]').setText(data.plaintiffName)
  // ... fill other fields
  
  form.flatten() // Make non-editable
  return pdfDoc.save()
}
```

## Document Edit Modal UI

The edit modal for SC-100/SC-104 allows users to modify:

### SC-100 Fields
- Plaintiff Name, Address, Phone
- Defendant Name, City, State, ZIP
- Claim Amount
- Reason for Claim
- Claim Description
- Court Name, County

### SC-104 Fields
- Case Number
- Court Name, County
- Plaintiff/Defendant Names
- Service Date, Time, Location
- Server Name, Title
- Service Description
- Cost

## File Structure

```
public/
  documents/
    SC-100-{caseId}-{timestamp}.pdf    (generated from template)
    SC-104-{caseId}-{timestamp}.pdf
    ...
templates/
  sc100.pdf          (official, encrypted - do not modify)
  sc104.pdf          (official, encrypted - do not modify)
  sc100-decrypted.pdf (decrypted with qpdf - for runtime use)
  sc104-decrypted.pdf (decrypted with qpdf - for runtime use)
scripts/
  inspect-pdf-fields.ts  (dev utility - analyzes PDF structure)
qpdf-extract/            (qpdf Windows binary for decryption)
```

## Troubleshooting

### Template not found error
- Ensure `templates/sc100-decrypted.pdf` exists
- If not, run: `qpdf --decrypt templates/sc100.pdf templates/sc100-decrypted.pdf`

### PDF shows blank fields
- Verify field names match using `npx tsx scripts/inspect-pdf-fields.ts`
- Check field names follow the pattern: `SC-100[0].Page2[0].List1[0].Item1[0].FieldName[0]`

### Form fields not filling
- Some PDFs use XFA (not supported by pdf-lib - shows warning "Removing XFA form data")
- Use `form.flatten()` to remove interactive form fields

### PDF generation slow
- Templates are read from disk each time
- Consider caching decrypted templates in memory for high-volume use

## References

- [pdf-lib Documentation](https://pdf-lib.org/docs/api/PDFDocument)
- [California Court Forms](https://www.courts.ca.gov/selfhelp-smallclaims.htm)
- [SC-100 Official Form](https://www.courts.ca.gov/documents/sc100.pdf)
- [SC-104 Official Form](https://www.courts.ca.gov/documents/sc104.pdf)