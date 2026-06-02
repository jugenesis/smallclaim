import { prisma } from '@/lib/db'

async function seedDatabase() {
  console.log('Starting seed...')
  // Check if already seeded
  const existingUser = await prisma.user.findFirst()
  if (existingUser) {
    console.log('Already seeded')
    return
  }

  // Create demo user
  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      email: 'demo@smallclaim.app',
      password: hashedPassword,
      name: 'Demo User',
      role: 'admin',
    },
  })

  // Create debtors
  const debtors = await Promise.all([
    prisma.debtor.create({
      data: {
        accountNumber: 'ACC-001',
        name: 'Dr. Sarah Kim, DDS',
        email: 'sarah.kim@example.com',
        phone: '(310) 555-0101',
        address: '456 Medical Plaza, Suite 200',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90012',
        type: 'individual',
        balance: 3200,
      },
    }),
    prisma.debtor.create({
      data: {
        accountNumber: 'ACC-002',
        name: 'Michael Chen',
        email: 'mchen@example.com',
        phone: '(818) 555-0102',
        address: '789 Sunset Blvd, Apt 12',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90028',
        type: 'individual',
        balance: 1800,
      },
    }),
    prisma.debtor.create({
      data: {
        accountNumber: 'ACC-003',
        name: 'Green Valley Apartments',
        email: 'billing@greenvalley.com',
        phone: '(323) 555-0103',
        address: '1500 Valley Road',
        city: 'Glendale',
        state: 'CA',
        zip: '91201',
        type: 'corp',
        balance: 5500,
      },
    }),
    prisma.debtor.create({
      data: {
        accountNumber: 'ACC-004',
        name: 'Jennifer Martinez',
        email: 'jmartinez@example.com',
        phone: '(626) 555-0104',
        address: '222 Oak Street',
        city: 'Pasadena',
        state: 'CA',
        zip: '91101',
        type: 'individual',
        balance: 2100,
      },
    }),
    prisma.debtor.create({
      data: {
        accountNumber: 'ACC-005',
        name: 'Robert Williams',
        email: 'rwilliams@example.com',
        phone: '(951) 555-0105',
        address: '888 Citrus Ave',
        city: 'Riverside',
        state: 'CA',
        zip: '92501',
        type: 'individual',
        balance: 4100,
      },
    }),
  ])

  // Create invoices for first debtor
  await prisma.invoice.createMany({
    data: [
      {
        debtorId: debtors[0].id,
        invoiceNum: 'INV-2024-0042',
        amount: 1200,
        status: 'overdue',
        dueDate: new Date('2024-05-01'),
        serviceDate: new Date('2024-04-15'),
        description: 'Dental crown - patient #1247',
        agingBucket: '60-day',
      },
      {
        debtorId: debtors[0].id,
        invoiceNum: 'INV-2024-0056',
        amount: 2000,
        status: 'open',
        dueDate: new Date('2024-06-15'),
        serviceDate: new Date('2024-05-20'),
        description: 'Full arch restoration - patient #1298',
        agingBucket: 'current',
      },
    ],
  })

  // Create cases
  const cases = await Promise.all([
    prisma.case.create({
      data: {
        caseNumber: '2024-042',
        debtorId: debtors[0].id,
        claimAmount: 3200,
        courtFees: 50,
        costsAccrued: 0,
        status: 'hearing',
        venueCounty: 'Los Angeles',
        courtName: 'Santa Monica Courthouse',
        hearingDate: new Date('2024-06-18'),
        filingDate: new Date('2024-05-15'),
      },
    }),
    prisma.case.create({
      data: {
        caseNumber: '2024-089',
        debtorId: debtors[1].id,
        claimAmount: 1800,
        courtFees: 50,
        costsAccrued: 0,
        status: 'demand',
        venueCounty: 'Los Angeles',
        courtName: 'San Fernando Courthouse',
        filingDate: null,
      },
    }),
    prisma.case.create({
      data: {
        caseNumber: '2024-056',
        debtorId: debtors[2].id,
        claimAmount: 5500,
        courtFees: 75,
        costsAccrued: 0,
        status: 'filed',
        venueCounty: 'Los Angeles',
        courtName: 'Stanley Mosk Courthouse',
        filingDate: new Date('2024-06-01'),
      },
    }),
  ])

  // Add timeline events for first case
  await prisma.caseEvent.createMany({
    data: [
      {
        caseId: cases[0].id,
        eventType: 'demand_sent',
        description: 'Demand letter sent via USPS CMR',
        timestamp: new Date('2024-05-03'),
        completed: true,
        reminderSent: true,
      },
      {
        caseId: cases[0].id,
        eventType: 'case_filed',
        description: 'SC-100 filed with court',
        timestamp: new Date('2024-05-15'),
        completed: true,
        reminderSent: true,
      },
      {
        caseId: cases[0].id,
        eventType: 'served',
        description: 'Personal service completed',
        timestamp: new Date('2024-05-20'),
        completed: true,
        reminderSent: true,
      },
      {
        caseId: cases[0].id,
        eventType: 'hearing_scheduled',
        description: 'Hearing scheduled for June 18',
        timestamp: new Date('2024-05-22'),
        completed: false,
        reminderSent: false,
      },
    ],
  })

  // Add documents for first case
  await prisma.document.createMany({
    data: [
      {
        caseId: cases[0].id,
        formType: 'sc100',
        fileName: 'SC-100_2024-042_SarahKim.pdf',
        status: 'filed',
        createdAt: new Date('2024-05-15'),
        filedAt: new Date('2024-05-16'),
        notes: 'Filed at Santa Monica Courthouse',
      },
      {
        caseId: cases[0].id,
        formType: 'sc104',
        fileName: 'SC-104_2024-042_SarahKim.pdf',
        status: 'filed',
        createdAt: new Date('2024-05-20'),
        filedAt: new Date('2024-05-21'),
        notes: 'Personal service confirmed',
      },
    ],
  })

  // Create default settings
  await prisma.settings.create({
    data: {
      id: 'default',
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
    },
  })

  console.log('Database seeded successfully')
}

// Export for use in setup
export default seedDatabase

// Run directly
seedDatabase()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())