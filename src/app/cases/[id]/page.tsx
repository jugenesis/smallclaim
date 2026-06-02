'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { getCaseById, CaseWithDebtor, CaseStatus } from '@/lib/cases-api'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const statusColors: Record<CaseStatus, string> = {
  demand: colors.textSecondary,
  filed: colors.primary,
  served: '#5856D6',
  hearing: colors.warning,
  judgment: colors.success,
  collected: '#34C759',
  closed: colors.textSecondary,
}

const statusLabels: Record<CaseStatus, string> = {
  demand: 'Demand Letter Sent',
  filed: 'Case Filed',
  served: 'Served',
  hearing: 'Hearing Scheduled',
  judgment: 'Judgment Entered',
  collected: 'Collected',
  closed: 'Closed',
}

export default function CaseDetailPage() {
  const params = useParams()
  const [caseData, setCaseData] = useState<CaseWithDebtor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      getCaseById(params.id as string).then(c => {
        setCaseData(c)
        setLoading(false)
      })
    }
  }, [params.id])

  if (loading) {
    return (
      <main className="case-detail">
        <div className="loading">Loading...</div>
      </main>
    )
  }

  if (!caseData) {
    return (
      <main className="case-detail">
        <div className="error">Case not found</div>
      </main>
    )
  }

  return (
    <main className="case-detail">
      <header className="page-header">
        <Link href="/cases" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Cases
        </Link>
        <div className="header-main">
          <div className="case-title">
            <h1 className="large-title">{caseData.caseNumber}</h1>
            <span className="status-badge" style={{ color: statusColors[caseData.status], borderColor: statusColors[caseData.status] }}>
              {statusLabels[caseData.status]}
            </span>
          </div>
          <Link href={`/debtors/${caseData.debtorId}`} className="debtor-link">
            {caseData.debtorName}
          </Link>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">Edit Case</button>
          <button className="btn btn-secondary">Documents</button>
          <button className="btn btn-primary">Actions</button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="label">Claim Amount</span>
          <span className="value">${caseData.claimAmount.toLocaleString()}</span>
        </div>
        <div className="summary-card">
          <span className="label">Court</span>
          <span className="value small">{caseData.courtName}</span>
          <span className="subtitle">{caseData.venueCounty} County</span>
        </div>
        {caseData.hearingDate && (
          <div className="summary-card">
            <span className="label">Hearing Date</span>
            <span className="value">{caseData.hearingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className={`subtitle ${caseData.urgency}`}>{caseData.daysToHearing} days remaining</span>
          </div>
        )}
        {caseData.judgment && (
          <div className="summary-card">
            <span className="label">Judgment</span>
            <span className="value">${caseData.judgment.amount.toLocaleString()}</span>
            <span className="subtitle">Balance: ${caseData.judgment.balanceRemaining.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="detail-grid">
        <section className="timeline-section">
          <h2 className="title-3">Timeline</h2>
          <div className="timeline">
            {caseData.timeline.map((event, idx) => (
              <div key={event.id} className={`timeline-item ${event.completed ? 'completed' : 'upcoming'}`}>
                <div className="timeline-marker">
                  <span className="dot" />
                  {idx < caseData.timeline.length - 1 && <span className="line" />}
                </div>
                <div className="timeline-content">
                  <span className="event-desc">{event.description}</span>
                  <span className="event-date">
                    {event.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="documents-section">
          <div className="section-header">
            <h2 className="title-3">Documents</h2>
            <button className="btn btn-secondary btn-sm">Generate New</button>
          </div>
          <div className="documents-list">
            {caseData.documents.length === 0 ? (
              <div className="empty-docs">
                <svg width="40" height="40" viewBox="0 0 24 24" fill={colors.textSecondary}>
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                <p>No documents yet</p>
              </div>
            ) : (
              caseData.documents.map(doc => (
                <div key={doc.id} className="doc-row">
                  <div className="doc-info">
                    <span className="doc-type">{doc.formType}</span>
                    <span className="doc-name">{doc.fileName}</span>
                  </div>
                  <div className="doc-actions">
                    <button className="icon-btn" title="View">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    </button>
                    <button className="icon-btn" title="Download">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="quick-actions">
          <h2 className="title-3">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              File SC-104
            </button>
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              Log Judgment
            </button>
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" />
              </svg>
              Send Reminder
            </button>
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11H8v-2h10v2zm-4-4V7h3v5h-3zm-3 0H7v-2h4v2z" />
              </svg>
              Request Writ
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .case-detail {
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
        .header-main {
          margin-bottom: ${spacing.md};
        }
        .case-title {
          display: flex;
          align-items: center;
          gap: ${spacing.md};
          margin-bottom: ${spacing.xs};
        }
        .status-badge {
          font-size: 13px;
          font-weight: 600;
          padding: 4px 12px;
          border: 1px solid;
          border-radius: 12px;
        }
        .debtor-link {
          font-size: 17px;
          color: ${colors.primary};
          text-decoration: none;
        }
        .debtor-link:hover {
          text-decoration: underline;
        }
        .header-actions {
          display: flex;
          gap: ${spacing.sm};
          flex-wrap: wrap;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
          gap: 4px;
        }
        .label {
          font-size: 12px;
          color: ${colors.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .value {
          font-size: 24px;
          font-weight: 700;
        }
        .value.small {
          font-size: 16px;
          font-weight: 600;
        }
        .subtitle {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .subtitle.danger { color: ${colors.danger}; }
        .subtitle.warning { color: ${colors.warning}; }
        .subtitle.normal { color: ${colors.success}; }
        .detail-grid {
          display: grid;
          gap: ${spacing.lg};
        }
        .timeline-section, .documents-section, .quick-actions {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.lg};
          box-shadow: ${shadows.sm};
        }
        .timeline {
          margin-top: ${spacing.md};
        }
        .timeline-item {
          display: flex;
          gap: ${spacing.md};
        }
        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${colors.separator};
          flex-shrink: 0;
        }
        .timeline-item.completed .dot {
          background: ${colors.success};
        }
        .timeline-item.upcoming .dot {
          background: ${colors.primary};
        }
        .line {
          width: 2px;
          flex: 1;
          background: ${colors.separator};
          min-height: 30px;
        }
        .timeline-content {
          flex: 1;
          padding-bottom: ${spacing.lg};
        }
        .event-desc {
          display: block;
          font-size: 15px;
          font-weight: 500;
        }
        .event-date {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.md};
        }
        .documents-list {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
        }
        .empty-docs {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: ${spacing.lg};
          color: ${colors.textSecondary};
        }
        .doc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${spacing.sm};
          background: ${colors.background};
          border-radius: 8px;
        }
        .doc-info {
          display: flex;
          flex-direction: column;
        }
        .doc-type {
          font-size: 12px;
          font-weight: 600;
          color: ${colors.primary};
        }
        .doc-name {
          font-size: 14px;
          color: ${colors.textPrimary};
        }
        .doc-actions {
          display: flex;
          gap: ${spacing.xs};
        }
        .icon-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: ${colors.surface};
          color: ${colors.textSecondary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover {
          color: ${colors.primary};
        }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: ${spacing.sm};
          margin-top: ${spacing.md};
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          padding: ${spacing.md};
          border: 1px solid ${colors.separator};
          border-radius: 10px;
          background: ${colors.surface};
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .action-btn:hover {
          border-color: ${colors.primary};
          background: ${colors.primary}08;
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
        :global(.btn:active) { opacity: 0.7; }
        :global(.btn-secondary) {
          background: ${colors.surface};
          color: ${colors.textPrimary};
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