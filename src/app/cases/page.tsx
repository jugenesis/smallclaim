'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { getCases, getCasesSummary, CaseWithDebtor, CaseStatus } from '@/lib/cases-api'
import CaseCard from '@/components/CaseCard'
import KanbanColumn from '@/components/KanbanColumn'
import CaseListRow from '@/components/CaseListRow'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<CaseStatus, string> = {
  demand: 'Demand',
  filed: 'Filed',
  served: 'Served',
  hearing: 'Hearing',
  judgment: 'Judgment',
  collected: 'Collected',
  closed: 'Closed',
}

const ALL_STATUSES: CaseStatus[] = ['demand', 'filed', 'served', 'hearing', 'judgment', 'collected', 'closed']

export default function CasesPage() {
  const [cases, setCases] = useState<CaseWithDebtor[]>([])
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ total: 0, byStatus: {} as Record<CaseStatus, number>, totalClaimAmount: 0 })
  const router = useRouter()

  useEffect(() => {
    Promise.all([getCases(), getCasesSummary()]).then(([casesData, summaryData]) => {
      setCases(casesData)
      setSummary(summaryData)
      setLoading(false)
    })
  }, [])

  const getCasesByStatus = (status: CaseStatus) => cases.filter(c => c.status === status)

  if (loading) {
    return (
      <main className="cases-page">
        <div className="loading">Loading cases...</div>
      </main>
    )
  }

  return (
    <main className="cases-page">
      <header className="page-header">
        <div className="header-left">
          <h1 className="large-title">Cases</h1>
          <span className="total-info">{summary.total} cases · ${summary.totalClaimAmount.toLocaleString()}</span>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'kanban' ? 'active' : ''}`}
              onClick={() => setView('kanban')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
              </svg>
            </button>
            <button
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => router.push('/cases/new')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            New Case
          </button>
        </div>
      </header>

      {view === 'kanban' ? (
        <div className="kanban-view">
          <div className="kanban-board">
            {ALL_STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                label={STATUS_LABELS[status]}
                cases={getCasesByStatus(status)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="list-view">
          <div className="list-header">
            <span className="col-number">Case #</span>
            <span className="col-debtor">Debtor</span>
            <span className="col-court">Court</span>
            <span className="col-status">Status</span>
            <span className="col-amount">Amount</span>
            <span className="col-deadline">Deadline</span>
          </div>
          <div className="list-body">
            {cases.map(c => (
              <CaseListRow key={c.id} caseData={c} />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .cases-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: ${spacing.lg};
        }
        .page-header {
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
          margin-bottom: ${spacing.lg};
        }
        @media (min-width: 768px) {
          .page-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }
        .header-left {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
        }
        .total-info {
          font-size: 15px;
          color: ${colors.textSecondary};
        }
        .header-actions {
          display: flex;
          gap: ${spacing.md};
          align-items: center;
        }
        .view-toggle {
          display: flex;
          background: ${colors.background};
          border-radius: 8px;
          padding: 4px;
        }
        .toggle-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: ${colors.textSecondary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .toggle-btn.active {
          background: ${colors.surface};
          color: ${colors.primary};
          box-shadow: ${shadows.sm};
        }
        .kanban-view {
          overflow-x: auto;
          padding-bottom: ${spacing.md};
        }
        .kanban-board {
          display: flex;
          gap: ${spacing.md};
          min-width: max-content;
        }
        .list-view {
          background: ${colors.surface};
          border-radius: 12px;
          box-shadow: ${shadows.sm};
          overflow: hidden;
        }
        .list-header {
          display: grid;
          grid-template-columns: 100px 1fr 1fr 80px 100px 100px;
          gap: ${spacing.md};
          padding: ${spacing.md};
          background: ${colors.background};
          font-size: 12px;
          font-weight: 600;
          color: ${colors.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .list-body {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
          padding: ${spacing.md};
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
        :global(.btn-primary) {
          background: ${colors.primary};
          color: white;
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${spacing.xxl};
          color: ${colors.textSecondary};
        }
        @media (max-width: 1024px) {
          .list-header {
            grid-template-columns: 1fr 1fr 80px;
          }
          .col-court, .col-status {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .list-header {
            display: none;
          }
        }
      `}</style>
    </main>
  )
}