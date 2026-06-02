'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { CaseWithDebtor, CaseStatus } from '@/lib/cases-api'
import Link from 'next/link'

interface CaseListRowProps {
  caseData: CaseWithDebtor
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

export default function CaseListRow({ caseData }: CaseListRowProps) {
  return (
    <Link href={`/cases/${caseData.id}`} className="case-row">
      <div className="case-number">{caseData.caseNumber}</div>
      <div className="case-debtor">{caseData.debtorName}</div>
      <div className="case-court">{caseData.courtName}</div>
      <div className="case-status" style={{ color: statusColors[caseData.status] }}>
        {caseData.status}
      </div>
      <div className="case-amount">${caseData.claimAmount.toLocaleString()}</div>
      <div className="case-deadline">
        {caseData.hearingDate ? (
          <span className={`deadline-badge ${caseData.urgency}`}>
            {caseData.hearingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            ({caseData.daysToHearing}d)
          </span>
        ) : (
          <span className="no-deadline">—</span>
        )}
      </div>
      <style jsx>{`
        .case-row {
          display: grid;
          grid-template-columns: 100px 1fr 1fr 80px 100px 100px;
          align-items: center;
          gap: ${spacing.md};
          padding: ${spacing.md};
          background: ${colors.surface};
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .case-row:hover {
          transform: scale(1.01);
          box-shadow: ${shadows.md};
        }
        .case-number {
          font-size: 14px;
          font-weight: 600;
          color: ${colors.textPrimary};
        }
        .case-debtor {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .case-court {
          font-size: 13px;
          color: ${colors.textSecondary};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .case-status {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .case-amount {
          font-size: 14px;
          font-weight: 700;
          text-align: right;
        }
        .deadline-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }
        .deadline-badge.danger {
          background: ${colors.danger}20;
          color: ${colors.danger};
        }
        .deadline-badge.warning {
          background: ${colors.warning}20;
          color: ${colors.warning};
        }
        .deadline-badge.normal {
          background: ${colors.success}20;
          color: ${colors.success};
        }
        .no-deadline {
          color: ${colors.textSecondary};
        }
        @media (max-width: 1024px) {
          .case-row {
            grid-template-columns: 1fr 1fr 80px;
          }
          .case-court, .case-status {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .case-row {
            grid-template-columns: 1fr auto;
          }
          .case-amount {
            display: none;
          }
        }
      `}</style>
    </Link>
  )
}