'use client'

import { colors, spacing } from '@/lib/design-tokens'
import { GeneratedDocument, FORM_LABELS } from '@/lib/documents-api'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: colors.background, text: colors.textSecondary },
  generated: { bg: '#5856D620', text: '#5856D6' },
  sent: { bg: colors.warning + '20', text: colors.warning },
  filed: { bg: colors.success + '20', text: colors.success },
  archived: { bg: colors.textSecondary + '20', text: colors.textSecondary },
}

interface DocumentRowProps {
  document: GeneratedDocument
}

export default function DocumentRow({ document }: DocumentRowProps) {
  const router = useRouter()
  const statusStyle = STATUS_COLORS[document.status] || STATUS_COLORS.draft

  return (
    <div className="doc-row" onClick={() => router.push(`/documents/${document.id}`)}>
      <div className="col-name">
        <div className="doc-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
          </svg>
        </div>
        <div className="doc-info">
          <span className="doc-filename">{document.fileName}</span>
          <span className="doc-debtor">{document.debtorName}</span>
        </div>
      </div>
      
      <div className="col-case">
        <span className="case-number">{document.caseNumber}</span>
      </div>
      
      <div className="col-type">
        <span className="form-type">{FORM_LABELS[document.formType]}</span>
      </div>
      
      <div className="col-status">
        <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>
          {document.status}
        </span>
      </div>
      
      <div className="col-date">
        <span className="date-text">
          {document.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      <div className="col-actions">
        <button className="action-btn" title="View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        </button>
        <button className="action-btn" title="Download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        </button>
        <button className="action-btn" title="Print">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .doc-row {
          display: grid;
          grid-template-columns: 2fr 1fr 100px 100px 100px 120px;
          gap: ${spacing.md};
          padding: ${spacing.md};
          border-bottom: 1px solid ${colors.separator};
          cursor: pointer;
          transition: background 0.15s ease;
          align-items: center;
        }
        .doc-row:last-child {
          border-bottom: none;
        }
        .doc-row:hover {
          background: ${colors.background};
        }
        .col-name {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
        }
        .doc-icon {
          width: 40px;
          height: 40px;
          background: ${colors.background};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.primary};
          flex-shrink: 0;
        }
        .doc-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .doc-filename {
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .doc-debtor {
          font-size: 13px;
          color: ${colors.textSecondary};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .col-case {
          display: flex;
          align-items: center;
        }
        .case-number {
          font-size: 14px;
          font-weight: 500;
          color: ${colors.primary};
        }
        .col-type {
          display: flex;
          align-items: center;
        }
        .form-type {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .col-status {
          display: flex;
          align-items: center;
        }
        .status-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 8px;
          text-transform: capitalize;
        }
        .col-date {
          display: flex;
          align-items: center;
        }
        .date-text {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .col-actions {
          display: flex;
          gap: ${spacing.xs};
          justify-content: flex-end;
        }
        .action-btn {
          width: 32px;
          height: 32px;
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
        .action-btn:hover {
          background: ${colors.background};
          color: ${colors.primary};
        }
        @media (max-width: 768px) {
          .doc-row {
            grid-template-columns: 1fr 100px 80px;
          }
          .col-case, .col-type, .col-date {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}