-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Debtor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "type" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "debtorId" TEXT NOT NULL,
    "invoiceNum" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "serviceDate" DATETIME NOT NULL,
    "description" TEXT,
    "agingBucket" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "Debtor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNumber" TEXT NOT NULL,
    "debtorId" TEXT NOT NULL,
    "claimAmount" REAL NOT NULL,
    "courtFees" REAL NOT NULL DEFAULT 0,
    "costsAccrued" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "venueCounty" TEXT NOT NULL,
    "courtName" TEXT NOT NULL,
    "hearingDate" DATETIME,
    "filingDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "Debtor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Judgment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "dateEntered" DATETIME NOT NULL,
    "balanceRemaining" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "lastPaymentDate" DATETIME,
    "lastPaymentAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Judgment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "businessName" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "businessPhone" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "defaultVenueCounty" TEXT NOT NULL,
    "defaultCourt" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "demandLetterTemplate" TEXT NOT NULL,
    "signatureName" TEXT NOT NULL,
    "signatureTitle" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "deadlineReminders" BOOLEAN NOT NULL DEFAULT true,
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "caseUpdates" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Debtor_accountNumber_key" ON "Debtor"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Judgment_caseId_key" ON "Judgment"("caseId");
