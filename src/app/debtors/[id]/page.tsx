'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { getDebtorById } from '@/lib/debtors-api'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  issueDate: string
  dueDate: string
  status: string
}

interface Case {
  id: string
  caseNumber: string
  status: string
  claimAmount: number
  hearingDate: string
}

export default function DebtorDetailPage() {
  const params = useParams()
  const [debtor, setDebtor] = useState<any>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      getDebtorById(params.id as string).then(d => {
        setDebtor(d)
        if (d) {
          setInvoices([
            { id: '1', invoiceNumber: 'INV-2024-001', amount: 4200, issueDate: '2024-02-15', dueDate: '2024-03-15', status: 'open' },
            { id: '2', invoiceNumber: 'INV-2024-002', amount: 3800, issueDate: '2024-03-01', dueDate: '2024-04-01', status: 'open' },
            { id: '3', invoiceNumber: 'INV-2024-003', amount: 4400, issueDate: '2024-03-15', dueDate: '2024-04-15', status: 'open' },
          ])
          setCases(d.hasActiveCase ? [
            { id: '1', caseNumber: '2024-043', status: 'hearing', claimAmount: 8500, hearingDate: '2024-06-18' }
          ] : [])
        }
        setLoading(false)
      })
    }
  }, [params.id])

  if (loading) {
    return (
      <main className="detail-page">
        <div className="loading">Loading...</div>
      </main>
    )
  }

  if (!debtor) {
    return (
      <main className="detail-page">
        <div className="error">Debtor not found</div>
      </main>
    )
  }

  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/debtors" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Debtors
        </Link>
        <div className="debtor-title">
          <h1 className="large-title">{debtor.name}</h1>
          {debtor.dbaName && <span className="dba">dba {debtor.dbaName}</span>}
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Edit
          </button>
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            Send Demand Letter
          </button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="label">Total Owed</span>
          <span className="value">${debtor.totalOwed.toLocaleString()}</span>
        </div>
        <div className="summary-card">
          <span className="label">Aging Bucket</span>
          <span className={`bucket badge ${debtor.agingBucket}`}>{debtor.agingBucket}</span>
        </div>
        <div className="summary-card">
          <span className="label">Small Claims</span>
          <span className={`eligibility ${debtor.eligibleForSmallClaims ? 'eligible' : 'not-eligible'}`}>
            {debtor.eligibleForSmallClaims ? '✓ Eligible' : '✗ Not Eligible'}
          </span>
        </div>
        <div className="summary-card">
          <span className="label">Active Cases</span>
          <span className="value">{debtor.hasActiveCase ? '1' : '0'}</span>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-section">
          <h2 className="title-3">Contact Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">License #</span>
              <span className="info-value">{debtor.licenseNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Entity Type</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>{debtor.entityType}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{debtor.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{debtor.phone || 'N/A'}</span>
            </div>
          </div>
          <div className="address">
            <span className="info-label">Address</span>
            <address>
              {debtor.address.street}<br />
              {debtor.address.city}, {debtor.address.state} {debtor.address.zip}<br />
              {debtor.address.county} County
            </address>
          </div>
          {debtor.agentForService && (
            <div className="agent">
              <span className="info-label">Agent for Service</span>
              <span className="info-value">{debtor.agentForService}</span>
            </div>
          )}
        </section>

        <section className="detail-section">
          <div className="section-header">
            <h2 className="title-3">Invoices ({invoices.length})</h2>
            <button className="btn btn-secondary btn-sm">View All</button>
          </div>
          <div className="invoices-list">
            {invoices.map(inv => (
              <div key={inv.id} className="invoice-row">
                <div className="invoice-info">
                  <span className="invoice-number">{inv.invoiceNumber}</span>
                  <span className="invoice-date">Due {inv.dueDate}</span>
                </div>
                <span className="invoice-amount">${inv.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {cases.length > 0 && (
          <section className="detail-section">
            <div className="section-header">
              <h2 className="title-3">Cases ({cases.length})</h2>
            </div>
            <div className="cases-list">
              {cases.map(c => (
                <Link key={c.id} href={`/cases/${c.id}`} className="case-card">
                  <div className="case-info">
                    <span className="case-number">{c.caseNumber}</span>
                    <span className="case-status">{c.status}</span>
                  </div>
                  <span className="case-amount">${c.claimAmount.toLocaleString()}</span>
                  <span className="case-hearing">Hearing: {c.hearingDate}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .detail-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${spacing.lg};
        }
        .page-header {
          margin-bottom: ${spacing.lg};
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: ${spacing.xs};
          color: ${colors.primary};
          text-decoration: none;
          font-size: 15px;
          margin-bottom: ${spacing.md};
        }
        .debtor-title {
          margin-bottom: ${spacing.md};
        }
        .dba {
          font-size: 17px;
          color: ${colors.textSecondary};
          margin-left: ${spacing.sm};
        }
        .header-actions {
          display: flex;
          gap: ${spacing.sm};
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: ${spacing.md};
          margin-bottom: ${spacing.lg};
        }
        .summary-card {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.md};
          box-shadow: ${shadows.sm};
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
        }
        .label {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .value {
          font-size: 24px;
          font-weight: 700;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .badge.current { background: ${colors.success}20; color: ${colors.success}; }
        .badge.30-day { background: ${colors.primary}20; color: ${colors.primary}; }
        .badge.60-day { background: ${colors.warning}20; color: ${colors.warning}; }
        .badge.90-plus { background: ${colors.danger}20; color: ${colors.danger}; }
        .eligibility {
          font-size: 14px;
          font-weight: 600;
        }
        .eligible { color: ${colors.success}; }
        .not-eligible { color: ${colors.textSecondary}; }
        .detail-grid {
          display: grid;
          gap: ${spacing.lg};
        }
        .detail-section {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.lg};
          box-shadow: ${shadows.sm};
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.md};
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: ${spacing.md};
          margin-bottom: ${spacing.md};
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-label {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .info-value {
          font-size: 15px;
          font-weight: 500;
        }
        .address, .agent {
          margin-top: ${spacing.md};
          padding-top: ${spacing.md};
          border-top: 1px solid ${colors.separator};
        }
        address {
          font-style: normal;
          font-size: 15px;
          line-height: 1.6;
          margin-top: 4px;
        }
        .invoices-list, .cases-list {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
        }
        .invoice-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${spacing.sm};
          background: ${colors.background};
          border-radius: 8px;
        }
        .invoice-info {
          display: flex;
          flex-direction: column;
        }
        .invoice-number {
          font-size: 15px;
          font-weight: 600;
        }
        .invoice-date {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .invoice-amount {
          font-size: 15px;
          font-weight: 700;
        }
        .case-card {
          display: flex;
          align-items: center;
          gap: ${spacing.md};
          padding: ${spacing.md};
          background: ${colors.background};
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s ease;
        }
        .case-card:hover {
          background: ${colors.primary}10;
        }
        .case-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .case-number {
          font-size: 15px;
          font-weight: 600;
        }
        .case-status {
          font-size: 13px;
          color: ${colors.primary};
          text-transform: capitalize;
        }
        .case-amount {
          font-size: 15px;
          font-weight: 700;
        }
        .case-hearing {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        :global(.btn) {
          display: inline-flex;
          align-items: center;
          gap: ${spacing.xs};
          padding: ${spacing.sm} ${spacing.md};
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s ease;
          min-height: 44px;
        }
        :global(.btn:active) {
          opacity: 0.7;
        }
        :global(.btn-secondary) {
          background: ${colors.surface};
          color: ${colors.primary};
          border: 1px solid ${colors.separator};
        }
        :global(.btn-primary) {
          background: ${colors.primary};
          color: white;
        }
        :global(.btn-sm) {
          min-height: 36px;
          font-size: 13px;
          padding: ${spacing.xs} ${spacing.sm};
        }
        .loading, .error {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${spacing.xxl};
          color: ${colors.textSecondary};
        }
      `}</style>
    </main>
  )
}