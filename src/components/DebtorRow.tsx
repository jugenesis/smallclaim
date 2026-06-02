'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { DebtorWithInvoices } from '@/lib/debtors-api'
import Link from 'next/link'

interface DebtorRowProps {
  debtor: DebtorWithInvoices
}

function EligibilityBadge({ eligible }: { eligible: boolean }) {
  return (
    <span className={`badge ${eligible ? 'eligible' : 'not-eligible'}`}>
      {eligible ? '✓ Eligible' : '✗ Exceeds Limit'}
      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .eligible {
          background: ${colors.success}20;
          color: ${colors.success};
        }
        .not-eligible {
          background: ${colors.textSecondary}20;
          color: ${colors.textSecondary};
        }
      `}</style>
    </span>
  )
}

function AgingDot({ bucket }: { bucket: string }) {
  const colorMap: Record<string, string> = {
    'current': colors.success,
    '30-day': colors.primary,
    '60-day': colors.warning,
    '90-plus': colors.danger,
  }
  return (
    <span className="aging-dot" style={{ background: colorMap[bucket] || colors.textSecondary }} />
  )
}

export default function DebtorRow({ debtor }: DebtorRowProps) {
  return (
    <Link href={`/debtors/${debtor.id}`} className="debtor-row">
      <div className="debtor-info">
        <span className="debtor-name">{debtor.name}</span>
        <span className="debtor-meta">
          {debtor.dbaName && `${debtor.dbaName} · `}
          {debtor.licenseNumber}
        </span>
      </div>
      <div className="debtor-aging">
        <AgingDot bucket={debtor.agingBucket} />
        <span className="aging-label">{debtor.agingBucket}</span>
      </div>
      <div className="debtor-amount">
        <span className="amount">${debtor.totalOwed.toLocaleString()}</span>
        <span className="invoice-count">{debtor.invoiceCount} invoice{debtor.invoiceCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="debtor-status">
        <EligibilityBadge eligible={debtor.eligibleForSmallClaims} />
        {debtor.hasActiveCase && (
          <span className="case-badge">In Case</span>
        )}
      </div>
      <div className="debtor-actions">
        <button className="action-btn" title="Send Demand Letter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
        <button className="action-btn" title="Create Case">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>
      <style jsx>{`
        .debtor-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          align-items: center;
          gap: ${spacing.md};
          padding: ${spacing.md};
          background: ${colors.surface};
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .debtor-row:hover {
          transform: scale(1.01);
          box-shadow: ${shadows.md};
        }
        .debtor-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .debtor-name {
          font-size: 15px;
          font-weight: 600;
          color: ${colors.textPrimary};
        }
        .debtor-meta {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .debtor-aging {
          display: flex;
          align-items: center;
          gap: ${spacing.xs};
        }
        .aging-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .aging-label {
          font-size: 13px;
          color: ${colors.textSecondary};
          text-transform: capitalize;
        }
        .debtor-amount {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: right;
        }
        .amount {
          font-size: 15px;
          font-weight: 700;
          color: ${colors.textPrimary};
        }
        .invoice-count {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .debtor-status {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
          align-items: flex-start;
        }
        .case-badge {
          background: ${colors.primary}20;
          color: ${colors.primary};
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .debtor-actions {
          display: flex;
          gap: ${spacing.xs};
        }
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: ${colors.background};
          color: ${colors.textSecondary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .action-btn:hover {
          background: ${colors.primary};
          color: white;
        }
        @media (max-width: 768px) {
          .debtor-row {
            grid-template-columns: 1fr auto;
          }
          .debtor-aging, .debtor-status {
            display: none;
          }
        }
      `}</style>
    </Link>
  )
}