export interface UserSettings {
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  defaultVenueCounty: string
  defaultCourt: string
  senderName: string
  senderAddress: string
  demandLetterTemplate: string
  signatureName: string
  signatureTitle: string
  emailNotifications: boolean
  deadlineReminders: boolean
  reminderDaysBefore: number
  caseUpdates: boolean
  weeklyDigest: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  businessName: 'Smiles Dental Lab',
  businessAddress: '123 Innovation Drive, Suite 400\nLos Angeles, CA 90015',
  businessPhone: '(310) 555-0123',
  businessEmail: 'billing@smilesdental.com',
  defaultVenueCounty: 'Los Angeles',
  defaultCourt: 'Santa Monica Courthouse',
  senderName: 'Smiles Dental Lab',
  senderAddress: '123 Innovation Drive, Suite 400\nLos Angeles, CA 90015',
  demandLetterTemplate: 'Dear {{debtorName}},\n\nThis letter serves as formal demand for payment of ${{amount}} for dental services provided on {{serviceDate}}. Please remit payment within 30 days to avoid legal action.\n\nSincerely,\n{{signatureName}}\n{{signatureTitle}}',
  signatureName: 'Account Receivables Team',
  signatureTitle: 'Smiles Dental Lab',
  emailNotifications: true,
  deadlineReminders: true,
  reminderDaysBefore: 3,
  caseUpdates: true,
  weeklyDigest: false,
}

export interface CourtInfo {
  name: string
  address: string
  phone: string
  county: string
  coordinates?: { lat: number; lng: number }
}

export const AVAILABLE_COURTS: CourtInfo[] = [
  {
    name: 'Santa Monica Courthouse',
    address: '1725 Main St, Santa Monica, CA 90401',
    phone: '(310) 260-2500',
    county: 'Los Angeles',
  },
  {
    name: 'Stanley Mosk Courthouse',
    address: '111 N Hill St, Los Angeles, CA 90012',
    phone: '(213) 310-6000',
    county: 'Los Angeles',
  },
  {
    name: 'San Fernando Courthouse',
    address: '900 3rd St, San Fernando, CA 91340',
    phone: '(818) 898-2400',
    county: 'Los Angeles',
  },
  {
    name: 'Long Beach Courthouse',
    address: '300 N Pico Ave, Long Beach, CA 90802',
    phone: '(562) 491-4600',
    county: 'Los Angeles',
  },
  {
    name: 'San Francisco Superior Court',
    address: '400 McAllister St, San Francisco, CA 94102',
    phone: '(415) 267-6300',
    county: 'San Francisco',
  },
]

export const COUNTIES = ['Los Angeles', 'San Francisco', 'San Mateo', 'Orange', 'San Diego']

export async function getSettings(): Promise<UserSettings> {
  return DEFAULT_SETTINGS
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  // TODO: Implement actual settings persistence
  console.log('Updating settings:', settings)
  return { ...DEFAULT_SETTINGS, ...settings }
}

export async function getCourts(county?: string): Promise<CourtInfo[]> {
  if (county) {
    return AVAILABLE_COURTS.filter(c => c.county === county)
  }
  return AVAILABLE_COURTS
}