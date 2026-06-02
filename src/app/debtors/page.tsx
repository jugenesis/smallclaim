'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { getDebtors, getARSummary } from '@/lib/debtors-api'
import DebtorRow from '@/components/DebtorRow'
import FilterBar from '@/components/FilterBar'
import { useEffect, useState } from 'react'
import { DebtorWithInvoices } from '@/lib/debtors-api'
import { useRouter } from 'next/navigation'

export default function DebtorsPage() {
  const [debtors, setDebtors] = useState<DebtorWithInvoices[]>([])
  const [filteredDebtors, setFilteredDebtors] = useState<DebtorWithInvoices[]>([])
  const [summary, setSummary] = useState({ total: 0, current: 0, thirtyDay: 0, sixtyDay: 0, ninetyPlus: 0, eligibleCount: 0, ineligibleCount: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    getDebtors().then(data => {
      setDebtors(data)
      setFilteredDebtors(data)
    })
    getARSummary().then(setSummary)
  }, [])

  useEffect(() => {
    let result = debtors

    // Apply filter
    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'eligible':
          result = result.filter(d => d.eligibleForSmallClaims)
          break
        case 'ineligible':
          result = result.filter(d => !d.eligibleForSmallClaims)
          break
        case '30day':
          result = result.filter(d => d.agingBucket === '30-day')
          break
        case '60day':
          result = result.filter(d => d.agingBucket === '60-day')
          break
        case '90plus':
          result = result.filter(d => d.agingBucket === '90-plus')
          break
      }
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.dbaName?.toLowerCase().includes(query) ||
        d.licenseNumber?.toLowerCase().includes(query)
      )
    }

    setFilteredDebtors(result)
  }, [debtors, searchQuery, activeFilter])

  const handleImport = () => {
    alert('Import A/R feature coming soon')
  }

  return (
    <main className="debtors-page">
      <header className="page-header">
        <div className="header-left">
          <h1 className="large-title">Debtors</h1>
          <span className="total-amount">${summary.total.toLocaleString()} total A/R</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleImport}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
            </svg>
            Import A/R
          </button>
          <button className="btn btn-primary" onClick={() => router.push('/debtors/new')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add Debtor
          </button>
        </div>
      </header>

      <FilterBar
        onSearchChange={setSearchQuery}
        onFilterChange={setActiveFilter}
        counts={{
          all: summary.eligibleCount + summary.ineligibleCount,
          eligible: summary.eligibleCount,
          ineligible: summary.ineligibleCount,
          '30day': debtors.filter(d => d.agingBucket === '30-day').length,
          '60day': debtors.filter(d => d.agingBucket === '60-day').length,
          '90plus': debtors.filter(d => d.agingBucket === '90-plus').length,
        }}
      />

      <div className="debtors-list">
        {filteredDebtors.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill={colors.textSecondary}>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <h3>No debtors found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredDebtors.map(debtor => (
            <DebtorRow key={debtor.id} debtor={debtor} />
          ))
        )}
      </div>

      <style jsx>{`
        .debtors-page {
          max-width: 1200px;
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
        .total-amount {
          font-size: 15px;
          color: ${colors.textSecondary};
        }
        .header-actions {
          display: flex;
          gap: ${spacing.sm};
        }
        .debtors-list {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: ${spacing.xxl};
          background: ${colors.surface};
          border-radius: 12px;
          text-align: center;
        }
        .empty-state h3 {
          margin-top: ${spacing.md};
          font-size: 17px;
          font-weight: 600;
        }
        .empty-state p {
          margin-top: ${spacing.xs};
          font-size: 15px;
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
      `}</style>
    </main>
  )
}