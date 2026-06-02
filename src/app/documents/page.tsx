'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { GeneratedDocument, DocumentFormType, DocumentStatus, FORM_LABELS } from '@/lib/documents-api'
import { useState, useEffect } from 'react'
import { getDocuments } from '@/lib/documents-api'
import DocumentRow from '@/components/DocumentRow'
import { useRouter } from 'next/navigation'

type FilterStatus = 'all' | DocumentStatus

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([])
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterType, setFilterType] = useState<DocumentFormType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getDocuments().then(docs => {
      setDocuments(docs)
      setLoading(false)
    })
  }, [])

  const filteredDocs = documents.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false
    if (filterType !== 'all' && doc.formType !== filterType) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        doc.debtorName.toLowerCase().includes(query) ||
        doc.caseNumber.toLowerCase().includes(query) ||
        doc.fileName.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: documents.length }
    documents.forEach(doc => {
      counts[doc.status] = (counts[doc.status] || 0) + 1
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  const getTypeCounts = () => {
    const counts: Record<string, number> = { all: documents.length }
    documents.forEach(doc => {
      counts[doc.formType] = (counts[doc.formType] || 0) + 1
    })
    return counts
  }

  const typeCounts = getTypeCounts()

  if (loading) {
    return (
      <main className="documents-page">
        <div className="loading">Loading documents...</div>
      </main>
    )
  }

  return (
    <main className="documents-page">
      <header className="page-header">
        <div>
          <h1 className="large-title">Documents</h1>
          <p className="doc-count">{documents.length} documents</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => router.push('/cases/new')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Generate New
          </button>
        </div>
      </header>

      <div className="filters-row">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button
            className={`pill ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({statusCounts.all || 0})
          </button>
          <button
            className={`pill ${filterStatus === 'draft' ? 'active' : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Draft ({statusCounts.draft || 0})
          </button>
          <button
            className={`pill ${filterStatus === 'generated' ? 'active' : ''}`}
            onClick={() => setFilterStatus('generated')}
          >
            Generated ({statusCounts.generated || 0})
          </button>
          <button
            className={`pill ${filterStatus === 'filed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('filed')}
          >
            Filed ({statusCounts.filed || 0})
          </button>
        </div>
      </div>

      <div className="type-filter">
        <span className="type-label">Form type:</span>
        <div className="type-pills">
          <button
            className={`type-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({typeCounts.all})
          </button>
          <button
            className={`type-pill ${filterType === 'sc100' ? 'active' : ''}`}
            onClick={() => setFilterType('sc100')}
          >
            SC-100 ({typeCounts.sc100 || 0})
          </button>
          <button
            className={`type-pill ${filterType === 'sc104' ? 'active' : ''}`}
            onClick={() => setFilterType('sc104')}
          >
            SC-104 ({typeCounts.sc104 || 0})
          </button>
          <button
            className={`type-pill ${filterType === 'demand_letter' ? 'active' : ''}`}
            onClick={() => setFilterType('demand_letter')}
          >
            Demand Letter ({typeCounts.demand_letter || 0})
          </button>
        </div>
      </div>

      <div className="documents-list">
        <div className="list-header">
          <span className="col-name">Document</span>
          <span className="col-case">Case</span>
          <span className="col-type">Type</span>
          <span className="col-status">Status</span>
          <span className="col-date">Created</span>
          <span className="col-actions">Actions</span>
        </div>
        <div className="list-body">
          {filteredDocs.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill={colors.textSecondary}>
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
              </svg>
              <p>No documents found</p>
            </div>
          ) : (
            filteredDocs.map(doc => (
              <DocumentRow key={doc.id} document={doc} />
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .documents-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${spacing.lg};
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: ${spacing.lg};
        }
        .doc-count {
          color: ${colors.textSecondary};
          margin-top: ${spacing.xs};
        }
        .header-actions {
          display: flex;
          gap: ${spacing.sm};
        }
        .filters-row {
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
          margin-bottom: ${spacing.md};
        }
        @media (min-width: 768px) {
          .filters-row {
            flex-direction: row;
            align-items: center;
          }
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          padding: ${spacing.sm} ${spacing.md};
          background: ${colors.surface};
          border: 1px solid ${colors.separator};
          border-radius: 10px;
          min-height: 44px;
        }
        .search-box svg {
          color: ${colors.textSecondary};
          flex-shrink: 0;
        }
        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 15px;
          outline: none;
        }
        .filter-pills {
          display: flex;
          gap: ${spacing.xs};
          overflow-x: auto;
          padding-bottom: ${spacing.xs};
        }
        .pill {
          padding: ${spacing.xs} ${spacing.md};
          border: none;
          border-radius: 20px;
          background: ${colors.background};
          color: ${colors.textSecondary};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .pill:hover {
          background: ${colors.separator};
        }
        .pill.active {
          background: ${colors.primary};
          color: white;
        }
        .type-filter {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          margin-bottom: ${spacing.lg};
          flex-wrap: wrap;
        }
        .type-label {
          font-size: 14px;
          color: ${colors.textSecondary};
        }
        .type-pills {
          display: flex;
          gap: ${spacing.xs};
        }
        .type-pill {
          padding: 4px 12px;
          border: 1px solid ${colors.separator};
          border-radius: 8px;
          background: transparent;
          color: ${colors.textSecondary};
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .type-pill:hover {
          border-color: ${colors.primary};
          color: ${colors.primary};
        }
        .type-pill.active {
          border-color: ${colors.primary};
          background: ${colors.primary}10;
          color: ${colors.primary};
        }
        .documents-list {
          background: ${colors.surface};
          border-radius: 12px;
          box-shadow: ${shadows.sm};
          overflow: hidden;
        }
        .list-header {
          display: grid;
          grid-template-columns: 2fr 1fr 100px 100px 100px 120px;
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
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: ${spacing.xxl};
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
        :global(.btn-secondary) {
          background: ${colors.surface};
          color: ${colors.textPrimary};
          border: 1px solid ${colors.separator};
        }
        @media (max-width: 768px) {
          .list-header {
            grid-template-columns: 1fr 100px 80px;
          }
          .col-case, .col-type, .col-date {
            display: none;
          }
        }
      `}</style>
    </main>
  )
}