'use client'

import { colors, spacing } from '@/lib/design-tokens'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function NewCasePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    debtorId: '',
    claimAmount: '',
    courtName: '',
    venueCounty: '',
    caseType: 'unlimited',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement case creation API
    console.log('Creating case:', formData)
    router.push('/cases')
  }

  return (
    <main className="new-case-page">
      <header className="page-header">
        <Link href="/cases" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Cases
        </Link>
        <h1 className="large-title">New Case</h1>
        <p className="subtitle">Create a new small claims case</p>
      </header>

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-num">1</span>
          <span className="step-label">Debtor</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Details</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-label">Review</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-card">
          <h2 className="title-2">Select Debtor</h2>
          <p className="helper-text">Search for an existing debtor or create a new one</p>
          
          <div className="search-field">
            <input
              type="text"
              placeholder="Search debtors by name or account number..."
              className="text-input"
              value={formData.debtorId}
              onChange={(e) => setFormData({ ...formData, debtorId: e.target.value })}
            />
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-secondary">Create New Debtor</button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </div>

        <div className="form-card">
          <h2 className="title-2">Case Details</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Claim Amount</label>
              <div className="input-with-prefix">
                <span className="prefix">$</span>
                <input
                  type="number"
                  className="text-input"
                  placeholder="0.00"
                  value={formData.claimAmount}
                  onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Court</label>
              <select
                className="select-input"
                value={formData.courtName}
                onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
              >
                <option value="">Select court...</option>
                <option value="Stanley Mosk Courthouse">Stanley Mosk Courthouse - LA Superior Court</option>
                <option value="San Francisco Superior Court">San Francisco Superior Court</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Venue County</label>
              <select
                className="select-input"
                value={formData.venueCounty}
                onChange={(e) => setFormData({ ...formData, venueCounty: e.target.value })}
              >
                <option value="">Select county...</option>
                <option value="Los Angeles">Los Angeles County</option>
                <option value="San Francisco">San Francisco County</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Case Type</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="caseType"
                    value="limited"
                    checked={formData.caseType === 'limited'}
                    onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                  />
                  <span className="radio-label">Limited (≤$10,000)</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="caseType"
                    value="unlimited"
                    checked={formData.caseType === 'unlimited'}
                    onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                  />
                  <span className="radio-label">Unlimited (&gt;$10,000)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea-input"
              placeholder="Brief description of the claim..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
          </div>
        </div>

        <div className="form-card">
          <h2 className="title-2">Review &amp; Submit</h2>
          <p className="helper-text">Review case details before filing</p>
          
          <div className="review-summary">
            <div className="review-row">
              <span className="review-label">Debtor</span>
              <span className="review-value">{formData.debtorId || 'Not selected'}</span>
            </div>
            <div className="review-row">
              <span className="review-label">Claim Amount</span>
              <span className="review-value">${formData.claimAmount || '0.00'}</span>
            </div>
            <div className="review-row">
              <span className="review-label">Court</span>
              <span className="review-value">{formData.courtName || 'Not selected'}</span>
            </div>
            <div className="review-row">
              <span className="review-label">Case Type</span>
              <span className="review-value">{formData.caseType === 'limited' ? 'Limited' : 'Unlimited'}</span>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
            <button type="submit" className="btn btn-primary">File Case</button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .new-case-page {
          max-width: 680px;
          margin: 0 auto;
          padding: ${spacing.lg};
        }
        .page-header {
          margin-bottom: ${spacing.lg};
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: ${spacing.xs};
          color: ${colors.primary};
          text-decoration: none;
          font-size: 15px;
          margin-bottom: ${spacing.md};
        }
        .subtitle {
          color: ${colors.textSecondary};
          margin-top: ${spacing.xs};
        }
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${spacing.sm};
          margin-bottom: ${spacing.xl};
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${colors.background};
          border: 2px solid ${colors.separator};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          color: ${colors.textSecondary};
        }
        .step.active .step-num {
          background: ${colors.primary};
          border-color: ${colors.primary};
          color: white;
        }
        .step-label {
          font-size: 12px;
          color: ${colors.textSecondary};
        }
        .step.active .step-label {
          color: ${colors.primary};
          font-weight: 600;
        }
        .step-line {
          width: 40px;
          height: 2px;
          background: ${colors.separator};
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: ${spacing.lg};
        }
        .form-card {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.lg};
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .helper-text {
          color: ${colors.textSecondary};
          font-size: 14px;
          margin-bottom: ${spacing.md};
        }
        .search-field {
          margin-bottom: ${spacing.md};
        }
        .text-input, .select-input, .textarea-input {
          width: 100%;
          padding: ${spacing.sm} ${spacing.md};
          border: 1px solid ${colors.separator};
          border-radius: 10px;
          font-size: 16px;
          min-height: 48px;
          background: ${colors.surface};
          transition: border-color 0.15s ease;
        }
        .text-input:focus, .select-input:focus, .textarea-input:focus {
          outline: none;
          border-color: ${colors.primary};
        }
        .textarea-input {
          resize: vertical;
          min-height: 100px;
        }
        .input-with-prefix {
          display: flex;
          align-items: center;
        }
        .prefix {
          padding: ${spacing.sm} ${spacing.md};
          background: ${colors.background};
          border: 1px solid ${colors.separator};
          border-right: none;
          border-radius: 10px 0 0 10px;
          color: ${colors.textSecondary};
          font-weight: 500;
        }
        .input-with-prefix .text-input {
          border-radius: 0 10px 10px 0;
        }
        .form-grid {
          display: grid;
          gap: ${spacing.md};
          margin-bottom: ${spacing.md};
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
        }
        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: ${colors.textPrimary};
        }
        .radio-group {
          display: flex;
          gap: ${spacing.md};
        }
        .radio-option {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          cursor: pointer;
        }
        .radio-label {
          font-size: 15px;
        }
        .action-row {
          display: flex;
          justify-content: flex-end;
          gap: ${spacing.sm};
          margin-top: ${spacing.lg};
        }
        .review-summary {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
          padding: ${spacing.md};
          background: ${colors.background};
          border-radius: 10px;
          margin-bottom: ${spacing.md};
        }
        .review-row {
          display: flex;
          justify-content: space-between;
        }
        .review-label {
          color: ${colors.textSecondary};
        }
        .review-value {
          font-weight: 600;
        }
        :global(.btn) {
          display: inline-flex;
          align-items: center;
          gap: ${spacing.xs};
          padding: ${spacing.sm} ${spacing.lg};
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
        :global(.btn-primary) {
          background: ${colors.primary};
          color: white;
        }
      `}</style>
    </main>
  )
}