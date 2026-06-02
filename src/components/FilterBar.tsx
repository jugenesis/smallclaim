'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { useState } from 'react'

interface FilterBarProps {
  onSearchChange: (query: string) => void
  onFilterChange: (filter: string) => void
  counts: { all: number; eligible: number; ineligible: number; '30day': number; '60day': number; '90plus': number }
}

export default function FilterBar({ onSearchChange, onFilterChange, counts }: FilterBarProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const handleSearch = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter)
    onFilterChange(filter)
  }

  const filters = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'eligible', label: 'Eligible', count: counts.eligible },
    { key: 'ineligible', label: 'Ineligible', count: counts.ineligible },
    { key: '30day', label: '30-Day', count: counts['30day'] },
    { key: '60day', label: '60-Day', count: counts['60day'] },
    { key: '90plus', label: '90+ Day', count: counts['90plus'] },
  ]

  return (
    <div className="filter-bar">
      <div className="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="search-icon">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="text"
          placeholder="Search debtors..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>
      <div className="filter-tabs">
        {filters.map(f => (
          <button
            key={f.key}
            className={`filter-tab ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => handleFilterClick(f.key)}
          >
            {f.label}
            <span className="count">{f.count}</span>
          </button>
        ))}
      </div>
      <style jsx>{`
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
          margin-bottom: ${spacing.lg};
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: ${spacing.md};
          color: ${colors.textSecondary};
        }
        .search-box input {
          width: 100%;
          padding: ${spacing.sm} ${spacing.md};
          padding-left: 44px;
          border: 1px solid ${colors.separator};
          border-radius: 10px;
          font-size: 16px;
          background: ${colors.surface};
          outline: none;
          transition: border-color 0.15s ease;
        }
        .search-box input:focus {
          border-color: ${colors.primary};
        }
        .filter-tabs {
          display: flex;
          gap: ${spacing.xs};
          overflow-x: auto;
          padding-bottom: ${spacing.xs};
        }
        .filter-tab {
          display: flex;
          align-items: center;
          gap: ${spacing.xs};
          padding: ${spacing.sm} ${spacing.md};
          border: none;
          border-radius: 20px;
          background: ${colors.surface};
          color: ${colors.textSecondary};
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .filter-tab:hover {
          background: ${colors.background};
        }
        .filter-tab.active {
          background: ${colors.primary};
          color: white;
        }
        .filter-tab.active .count {
          background: rgba(255,255,255,0.2);
        }
        .count {
          background: ${colors.background};
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
        }
        @media (min-width: 768px) {
          .filter-bar {
            flex-direction: row;
            align-items: center;
          }
          .search-box {
            max-width: 300px;
          }
          .filter-tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}