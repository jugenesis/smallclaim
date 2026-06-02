# Small Claims Automation

Automates the California small claims process for dental lab accounts receivable recovery.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run single test
npm test -- --grep "demand letter"
```

## Project Structure

```
src/
├── ar/                  # A/R module (aging, import, scoring)
├── cases/               # Case management and workflow
├── documents/           # Form generation and templates
├── filing/              # Court e-filing integration
├── collections/         # Post-judgment enforcement
├── compliance/          # FDCPA guardrails, audit log
└── external/            # CA SOS, USPS integrations

forms/                   # PDF form field definitions (XFDF)
tests/
├── unit/
├── integration/
└── fixtures/
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run all tests |
| `npm run lint` | Lint code |

## Architecture

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for full architecture docs.

## External Resources

- [California Small Claims Court](https://www.courts.ca.gov/smallclaims.htm)
- [Judicial Council Forms](https://www.courts.ca.gov/forms.htm)
- [CA SOS Business Search](https://businesssearch.sos.ca.gov/)
- [Guide & File E-Filing](https://www.courts.ca.gov/guideandfile.htm)

## Legal Disclaimer

This is an automated administrative tool, not legal advice.