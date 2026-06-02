'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { CaseWithDebtor, CaseStatus } from '@/lib/cases-api'
import Link from 'next/link'

interface CaseCardProps {
  caseData: CaseWithDebtor
  compact?: boolean
}

const statusColors: Record<CaseStatus, string> = {
  demand: colors.textSecondary,
  filed: colors.primary,
  served: '#5856D6',
  hearing: colors.warning,
  judgment: colors.success,
  collected: '#34C759',
  closed: colors.textSecondary,
}

export default function CaseCard({ caseData, compact = false }: CaseCardProps) {
  const urgencyBorder = caseData.urgency === 'danger' ? colors.danger : 
                        caseData.urgency === 'warning' ? colors.warning : 'transparent'

  return (
    <Link href={`/cases/${caseData.id}`} className={`case-card ${compact ? 'compact' : ''}`}
      style={{ borderLeftColor: urgencyBorder }}>
      <div className="case-header">
        <span className="case-number">{caseData.caseNumber}</span>
        <span className="case-status" style={{ color: statusColors[caseData.status] }}>
          {caseData.status}
        </span>
      </div>
      <div className="case-debtor">{caseData.debtorName}</div>
      {!compact && (
        <div className="case-meta">
          <span className="case-license">{caseData.debtorLicense}</span>
        </div>
      )}
      <div className="case-footer">
        <span className="case-amount">${caseData.claimAmount.toLocaleString()}</span>
        {caseData.hearingDate && (
          <span className={`case-hearing ${caseData.urgency}`}>
            {caseData.daysToHearing}d
          </span>
        )}
      </div>
      <style jsx>{`
        .case-card {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
          padding: ${spacing.md};
          background: ${colors.surface};
          border-radius: 12px;
          border-left: 4px solid transparent;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .case-card:hover {
          transform: translateY(-2px);
          box-shadow: ${shadows.md};
        }
        .case-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .case-number {
          font-size: 13px;
          font-weight: 700;
          color: ${colors.textPrimary};
        }
        .case-status {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .case-debtor {
          font-size: 15px;
          font-weight: 600;
          color: ${colors.textPrimary};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .case-meta {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .case-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: ${spacing.xs};
        }
        .case-amount {
          font-size: 17px;
          font-weight: 700;
          color: ${colors.textPrimary};
        }
        .case-hearing {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }
        .case-hearing.danger {
          background: ${colors.danger}20;
          color: ${colors.danger};
        }
        .case-hearing.warning {
          background: ${colors.warning}20;
          color: ${colors.warning};
        }
        .case-hearing.normal {
          background: ${colors.success}20;
          color: ${colors.success};
        }
        .compact {
          padding: ${spacing.sm};
        }
        .compact .case-debtor {
          font-size: 14px;
        }
        .compact .case-amount {
          font-size: 15px;
        }
      `}</style>
    </Link>
  )
}