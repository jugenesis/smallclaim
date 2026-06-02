'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { getDashboardMetrics, getUpcomingDeadlines, getActionsRequired, getCasesPipeline } from '@/lib/api'
import { useEffect, useState } from 'react'

interface MetricCardProps {
  label: string
  amount: number
  caseCount: number
  color?: string
}

function MetricCard({ label, amount, caseCount, color = colors.textPrimary }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-amount" style={{ color }}>${amount.toLocaleString()}</span>
      <span className="metric-cases">{caseCount} cases</span>
      <style jsx>{`
        .metric-card {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.md};
          box-shadow: ${shadows.sm};
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
          min-width: 140px;
        }
        .metric-label {
          font-size: 13px;
          color: ${colors.textSecondary};
          font-weight: 500;
        }
        .metric-amount {
          font-size: 24px;
          font-weight: 700;
        }
        .metric-cases {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
      `}</style>
    </div>
  )
}

function AgingBar({ metrics }: { metrics: { current: number; thirty: number; sixty: number; ninety: number } }) {
  const total = metrics.current + metrics.thirty + metrics.sixty + metrics.ninety
  if (total === 0) return null

  const currentPct = (metrics.current / total) * 100
  const thirtyPct = (metrics.thirty / total) * 100
  const sixtyPct = (metrics.sixty / total) * 100
  const ninetyPct = (metrics.ninety / total) * 100

  return (
    <div className="aging-container">
      <div className="aging-header">
        <span className="title-3">A/R Aging</span>
        <a href="#" className="view-all">View All →</a>
      </div>
      <div className="aging-bar">
        <div className="bar-segment current" style={{ width: `${currentPct}%` }} />
        <div className="bar-segment thirty" style={{ width: `${thirtyPct}%` }} />
        <div className="bar-segment sixty" style={{ width: `${sixtyPct}%` }} />
        <div className="bar-segment ninety" style={{ width: `${ninetyPct}%` }} />
      </div>
      <div className="aging-legend">
        <div className="legend-item">
          <span className="dot current" />
          <span>Current</span>
          <span className="amount">${metrics.current.toLocaleString()}</span>
        </div>
        <div className="legend-item">
          <span className="dot thirty" />
          <span>30-Day</span>
          <span className="amount">${metrics.thirty.toLocaleString()}</span>
        </div>
        <div className="legend-item">
          <span className="dot sixty" />
          <span>60-Day</span>
          <span className="amount">${metrics.sixty.toLocaleString()}</span>
        </div>
        <div className="legend-item">
          <span className="dot ninety" />
          <span>90+ Day</span>
          <span className="amount">${metrics.ninety.toLocaleString()}</span>
        </div>
      </div>
      <style jsx>{`
        .aging-container {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.md};
          box-shadow: ${shadows.sm};
        }
        .aging-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.md};
        }
        .view-all {
          font-size: 15px;
          color: ${colors.primary};
          text-decoration: none;
        }
        .aging-bar {
          display: flex;
          height: 32px;
          border-radius: 8px;
          overflow: hidden;
          background: #E5E5EA;
        }
        .bar-segment {
          height: 100%;
          transition: width 0.3s ease;
        }
        .bar-segment.current { background: ${colors.success}; }
        .bar-segment.thirty { background: ${colors.primary}; }
        .bar-segment.sixty { background: ${colors.warning}; }
        .bar-segment.ninety { background: ${colors.danger}; }
        .aging-legend {
          display: flex;
          justify-content: space-between;
          margin-top: ${spacing.md};
          flex-wrap: wrap;
          gap: ${spacing.sm};
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: ${spacing.xs};
          font-size: 13px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot.current { background: ${colors.success}; }
        .dot.thirty { background: ${colors.primary}; }
        .dot.sixty { background: ${colors.warning}; }
        .dot.ninety { background: ${colors.danger}; }
        .amount {
          font-weight: 600;
          margin-left: ${spacing.xs};
        }
      `}</style>
    </div>
  )
}

function DeadlineCard({ deadline }: { deadline: { caseNumber: string; eventType: string; deadline: Date; daysRemaining: number; urgency: string; debtorName: string } }) {
  const urgencyColors = {
    danger: colors.danger,
    warning: colors.warning,
    normal: colors.success,
  }
  const urgencyColor = urgencyColors[deadline.urgency as keyof typeof urgencyColors] || colors.textSecondary

  return (
    <div className="deadline-card">
      <div className="urgency-dot" style={{ background: urgencyColor }} />
      <div className="deadline-info">
        <span className="event-type">{deadline.eventType}</span>
        <span className="case-ref">{deadline.caseNumber} — {deadline.debtorName}</span>
      </div>
      <span className="days-badge" style={{ color: urgencyColor }}>
        {deadline.daysRemaining}d
      </span>
      <style jsx>{`
        .deadline-card {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          padding: ${spacing.sm} 0;
          border-bottom: 1px solid ${colors.separator};
        }
        .deadline-card:last-child { border-bottom: none; }
        .urgency-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .deadline-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .event-type {
          font-size: 15px;
          font-weight: 600;
        }
        .case-ref {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .days-badge {
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

function ActionCard({ action }: { action: { caseNumber: string; description: string; amount: number } }) {
  return (
    <div className="action-card">
      <span className="action-desc">⚠️ {action.description}</span>
      <span className="case-ref">{action.caseNumber}</span>
      <span className="amount">${action.amount.toLocaleString()}</span>
      <style jsx>{`
        .action-card {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.md};
          box-shadow: ${shadows.sm};
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
          border-left: 4px solid ${colors.danger};
        }
        .action-desc {
          font-size: 15px;
          font-weight: 600;
        }
        .case-ref {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .amount {
          font-size: 17px;
          font-weight: 700;
          color: ${colors.textPrimary};
        }
      `}</style>
    </div>
  )
}

function PipelineKanban({ columns }: { columns: { status: string; label: string; count: number }[] }) {
  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <span className="title-3">Active Cases Pipeline</span>
        <a href="#" className="view-all">View All →</a>
      </div>
      <div className="kanban-columns">
        {columns.map((col) => (
          <div key={col.status} className="kanban-column">
            <div className="column-header">
              <span className="column-label">{col.label}</span>
              <span className="column-count">{col.count}</span>
            </div>
            <div className="column-bar">
              <div className="column-progress" style={{ height: `${Math.min(col.count * 10, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .kanban-container {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.md};
          box-shadow: ${shadows.sm};
        }
        .kanban-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.md};
        }
        .view-all {
          font-size: 15px;
          color: ${colors.primary};
          text-decoration: none;
        }
        .kanban-columns {
          display: flex;
          gap: ${spacing.sm};
          overflow-x: auto;
        }
        .kanban-column {
          flex: 1;
          min-width: 80px;
        }
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.sm};
        }
        .column-label {
          font-size: 13px;
          font-weight: 600;
        }
        .column-count {
          font-size: 12px;
          background: ${colors.background};
          padding: 2px 8px;
          border-radius: 10px;
        }
        .column-bar {
          height: 60px;
          background: ${colors.background};
          border-radius: 6px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .column-progress {
          width: 100%;
          background: ${colors.primary};
          border-radius: 6px 6px 0 0;
          min-height: 4px;
        }
      `}</style>
    </div>
  )
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ current: 0, thirty: 0, sixty: 0, ninety: 0 })
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [pipeline, setPipeline] = useState<any[]>([])

  useEffect(() => {
    getDashboardMetrics().then(m => {
      setMetrics({ current: m.currentAR, thirty: m.thirtyDayAR, sixty: m.sixtyDayAR, ninety: m.ninetyPlusAR })
    })
    getUpcomingDeadlines().then(setDeadlines)
    getActionsRequired().then(setActions)
    getCasesPipeline().then(setPipeline)
  }, [])

  const totalAR = metrics.current + metrics.thirty + metrics.sixty + metrics.ninety

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1 className="large-title">Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-secondary">Search</button>
          <button className="btn btn-primary">+ New</button>
        </div>
      </header>

      <section className="metrics-section">
        <MetricCard label="Total A/R" amount={totalAR} caseCount={18} />
        <MetricCard label="30-Day" amount={metrics.thirty} caseCount={7} color={colors.primary} />
        <MetricCard label="60-Day" amount={metrics.sixty} caseCount={6} color={colors.warning} />
        <MetricCard label="90+ Day" amount={metrics.ninety} caseCount={0} color={colors.danger} />
      </section>

      <section className="aging-section">
        <AgingBar metrics={metrics} />
      </section>

      <section className="two-column">
        <div className="column">
          <h2 className="title-3">Actions Required ({actions.length})</h2>
          <div className="actions-list">
            {actions.map(action => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>
        <div className="column">
          <h2 className="title-3">Upcoming Deadlines</h2>
          <div className="deadlines-list">
            {deadlines.map(deadline => (
              <DeadlineCard key={deadline.id} deadline={deadline} />
            ))}
          </div>
        </div>
      </section>

      <section className="pipeline-section">
        <PipelineKanban columns={pipeline} />
      </section>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${spacing.lg};
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.lg};
        }
        .header-actions {
          display: flex;
          gap: ${spacing.sm};
        }
        .metrics-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: ${spacing.md};
          margin-bottom: ${spacing.lg};
        }
        .aging-section {
          margin-bottom: ${spacing.lg};
        }
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${spacing.lg};
          margin-bottom: ${spacing.lg};
        }
        @media (max-width: 768px) {
          .two-column {
            grid-template-columns: 1fr;
          }
        }
        .column h2 {
          margin-bottom: ${spacing.md};
        }
        .actions-list {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
        }
        .deadlines-list {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.md};
          box-shadow: ${shadows.sm};
        }
        .pipeline-section {
          margin-bottom: ${spacing.lg};
        }
      `}</style>
    </main>
  )
}