'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { useState, useEffect } from 'react'
import { getSettings, updateSettings, UserSettings, AVAILABLE_COURTS, COUNTIES } from '@/lib/settings-api'

type SettingsSection = 'business' | 'court' | 'templates' | 'notifications'

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [activeSection, setActiveSection] = useState<SettingsSection>('business')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await updateSettings(settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateField = (field: keyof UserSettings, value: string | number | boolean) => {
    if (settings) {
      setSettings({ ...settings, [field]: value })
    }
  }

  if (!settings) {
    return (
      <main className="settings-page">
        <div className="loading">Loading settings...</div>
      </main>
    )
  }

  return (
    <main className="settings-page">
      <header className="page-header">
        <div>
          <h1 className="large-title">Settings</h1>
          <p className="subtitle">Configure your small claims workflow</p>
        </div>
        <div className="header-actions">
          {saved && <span className="save-confirm">✓ Saved</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav">
          <button
            className={`nav-item ${activeSection === 'business' ? 'active' : ''}`}
            onClick={() => setActiveSection('business')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
            </svg>
            Business Info
          </button>
          <button
            className={`nav-item ${activeSection === 'court' ? 'active' : ''}`}
            onClick={() => setActiveSection('court')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Court Defaults
          </button>
          <button
            className={`nav-item ${activeSection === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveSection('templates')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            Templates
          </button>
          <button
            className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            Notifications
          </button>
        </nav>

        <div className="settings-content">
          {activeSection === 'business' && (
            <section className="settings-section">
              <h2 className="title-2">Business Information</h2>
              <p className="section-desc">Your business details for demand letters and court filings</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    className="text-input"
                    value={settings.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="text-input"
                    value={settings.businessPhone}
                    onChange={(e) => updateField('businessPhone', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Address</label>
                  <textarea
                    className="textarea-input"
                    rows={3}
                    value={settings.businessAddress}
                    onChange={(e) => updateField('businessAddress', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="text-input"
                    value={settings.businessEmail}
                    onChange={(e) => updateField('businessEmail', e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {activeSection === 'court' && (
            <section className="settings-section">
              <h2 className="title-2">Court Defaults</h2>
              <p className="section-desc">Default venue for new cases</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Default County</label>
                  <select
                    className="select-input"
                    value={settings.defaultVenueCounty}
                    onChange={(e) => updateField('defaultVenueCounty', e.target.value)}
                  >
                    {COUNTIES.map(c => (
                      <option key={c} value={c}>{c} County</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Default Court</label>
                  <select
                    className="select-input"
                    value={settings.defaultCourt}
                    onChange={(e) => updateField('defaultCourt', e.target.value)}
                  >
                    {AVAILABLE_COURTS.filter(c => c.county === settings.defaultVenueCounty).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 className="title-3" style={{ marginTop: spacing.xl }}>Available Courts</h3>
              <div className="courts-list">
                {AVAILABLE_COURTS.map(court => (
                  <div key={court.name} className="court-card">
                    <div className="court-info">
                      <span className="court-name">{court.name}</span>
                      <span className="court-address">{court.address}</span>
                      <span className="court-phone">{court.phone}</span>
                    </div>
                    <span className="court-county">{court.county} County</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'templates' && (
            <section className="settings-section">
              <h2 className="title-2">Document Templates</h2>
              <p className="section-desc">Customize letter templates with placeholders</p>
              
              <div className="form-group">
                <label className="form-label">Demand Letter Template</label>
                <p className="helper-text">
                  Available placeholders: {'{{debtorName}}'}, {'{{amount}}'}, {'{{serviceDate}}'}, {'{{signatureName}}'}, {'{{signatureTitle}}'}
                </p>
                <textarea
                  className="textarea-input template-textarea"
                  rows={12}
                  value={settings.demandLetterTemplate}
                  onChange={(e) => updateField('demandLetterTemplate', e.target.value)}
                />
              </div>

              <div className="form-grid" style={{ marginTop: spacing.lg }}>
                <div className="form-group">
                  <label className="form-label">Signature Name</label>
                  <input
                    type="text"
                    className="text-input"
                    value={settings.signatureName}
                    onChange={(e) => updateField('signatureName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Signature Title</label>
                  <input
                    type="text"
                    className="text-input"
                    value={settings.signatureTitle}
                    onChange={(e) => updateField('signatureTitle', e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="settings-section">
              <h2 className="title-2">Notification Settings</h2>
              <p className="section-desc">Configure when and how you receive alerts</p>
              
              <div className="notifications-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Email Notifications</span>
                    <span className="notification-desc">Receive updates about case changes</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => updateField('emailNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Deadline Reminders</span>
                    <span className="notification-desc">Get reminded before upcoming deadlines</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.deadlineReminders}
                      onChange={(e) => updateField('deadlineReminders', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {settings.deadlineReminders && (
                  <div className="notification-sub-item">
                    <span className="sub-label">Remind me</span>
                    <select
                      className="select-input small"
                      value={settings.reminderDaysBefore}
                      onChange={(e) => updateField('reminderDaysBefore', parseInt(e.target.value))}
                    >
                      <option value={1}>1 day before</option>
                      <option value={2}>2 days before</option>
                      <option value={3}>3 days before</option>
                      <option value={5}>5 days before</option>
                      <option value={7}>1 week before</option>
                    </select>
                  </div>
                )}

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Case Updates</span>
                    <span className="notification-desc">Status changes, filings, and court responses</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.caseUpdates}
                      onChange={(e) => updateField('caseUpdates', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Weekly Digest</span>
                    <span className="notification-desc">Summary of all activity every Monday</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.weeklyDigest}
                      onChange={(e) => updateField('weeklyDigest', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <style jsx>{`
        .settings-page {
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
        .subtitle {
          color: ${colors.textSecondary};
          margin-top: ${spacing.xs};
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: ${spacing.md};
        }
        .save-confirm {
          color: ${colors.success};
          font-weight: 600;
          font-size: 14px;
        }
        .settings-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: ${spacing.lg};
        }
        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
        }
        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
        }
        @media (max-width: 768px) {
          .settings-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: ${spacing.sm};
          }
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          padding: ${spacing.md};
          border: none;
          border-radius: 10px;
          background: transparent;
          color: ${colors.textSecondary};
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease, color 0.15s ease;
          white-space: nowrap;
        }
        .nav-item:hover {
          background: ${colors.background};
        }
        .nav-item.active {
          background: ${colors.primary}10;
          color: ${colors.primary};
        }
        .settings-content {
          background: ${colors.surface};
          border-radius: 12px;
          box-shadow: ${shadows.sm};
          padding: ${spacing.lg};
        }
        .settings-section {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .section-desc {
          color: ${colors.textSecondary};
          margin-bottom: ${spacing.lg};
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: ${spacing.md};
        }
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: ${colors.textPrimary};
        }
        .helper-text {
          font-size: 13px;
          color: ${colors.textSecondary};
          margin-bottom: ${spacing.xs};
        }
        .text-input, .select-input, .textarea-input {
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
        .template-textarea {
          font-family: monospace;
          font-size: 14px;
        }
        .select-input.small {
          min-height: 36px;
          font-size: 14px;
        }
        .courts-list {
          display: grid;
          gap: ${spacing.sm};
        }
        .court-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${spacing.md};
          background: ${colors.background};
          border-radius: 10px;
        }
        .court-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .court-name {
          font-weight: 600;
        }
        .court-address {
          font-size: 14px;
          color: ${colors.textSecondary};
        }
        .court-phone {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .court-county {
          font-size: 13px;
          color: ${colors.primary};
          font-weight: 500;
        }
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
        }
        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${spacing.md};
          background: ${colors.background};
          border-radius: 10px;
        }
        .notification-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .notification-title {
          font-weight: 600;
        }
        .notification-desc {
          font-size: 14px;
          color: ${colors.textSecondary};
        }
        .notification-sub-item {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          padding: ${spacing.sm} ${spacing.md};
          margin-left: ${spacing.lg};
          background: ${colors.surface};
          border-radius: 8px;
        }
        .sub-label {
          font-size: 14px;
          color: ${colors.textSecondary};
        }
        .toggle {
          position: relative;
          width: 51px;
          height: 31px;
        }
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${colors.separator};
          border-radius: 31px;
          transition: background 0.2s ease;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 27px;
          width: 27px;
          left: 2px;
          bottom: 2px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle input:checked + .toggle-slider {
          background: ${colors.success};
        }
        .toggle input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${spacing.xxl};
          color: ${colors.textSecondary};
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
        :global(.btn-primary) {
          background: ${colors.primary};
          color: white;
        }
        :global(.btn-primary:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  )
}