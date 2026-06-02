'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { CaseWithDebtor, CaseStatus } from '@/lib/cases-api'
import CaseCard from './CaseCard'

interface KanbanColumnProps {
  status: CaseStatus
  label: string
  cases: CaseWithDebtor[]
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

export default function KanbanColumn({ status, label, cases }: KanbanColumnProps) {
  const count = cases.length
  const totalAmount = cases.reduce((sum, c) => sum + c.claimAmount, 0)
  const maxAmount = Math.max(...cases.map(c => c.claimAmount), 1)

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-title">
          <span className="status-dot" style={{ background: statusColors[status] }} />
          <span className="label">{label}</span>
        </div>
        <span className="count">{count}</span>
      </div>
      <div className="column-amount">${totalAmount.toLocaleString()}</div>
      <div className="column-cases">
        {cases.map(c => (
          <CaseCard key={c.id} caseData={c} compact />
        ))}
      </div>
      <style jsx>{`
        .kanban-column {
          flex: 1;
          min-width: 200px;
          max-width: 280px;
          display: flex;
          flex-direction: column;
          background: ${colors.background};
          border-radius: 12px;
          padding: ${spacing.md};
        }
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.xs};
        }
        .column-title {
          display: flex;
          align-items: center;
          gap: ${spacing.xs};
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .label {
          font-size: 14px;
          font-weight: 600;
          color: ${colors.textPrimary};
        }
        .count {
          font-size: 12px;
          font-weight: 600;
          background: ${colors.surface};
          padding: 2px 8px;
          border-radius: 10px;
          color: ${colors.textSecondary};
        }
        .column-amount {
          font-size: 13px;
          color: ${colors.textSecondary};
          margin-bottom: ${spacing.md};
        }
        .column-cases {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
}