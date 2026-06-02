'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { CalendarEvent, EventType } from '@/lib/calendar-api'
import { useRouter } from 'next/navigation'

const EVENT_ICONS: Record<EventType, JSX.Element> = {
  hearing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
    </svg>
  ),
  deadline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  ),
  filing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  ),
  service: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  payment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </svg>
  ),
}

const EVENT_LABELS: Record<EventType, string> = {
  hearing: 'Hearing',
  deadline: 'Deadline',
  filing: 'Filing',
  service: 'Service',
  payment: 'Payment',
}

interface DeadlineCardProps {
  event: CalendarEvent
}

export default function DeadlineCard({ event }: DeadlineCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (event.caseId) {
      router.push(`/cases/${event.caseId}`)
    }
  }

  return (
    <div className={`deadline-card ${event.urgency}`} onClick={handleClick}>
      <div className="card-header">
        <div className="event-type" style={{ color: event.color }}>
          {EVENT_ICONS[event.type]}
          <span>{EVENT_LABELS[event.type]}</span>
        </div>
        <span className={`urgency-badge ${event.urgency}`}>
          {event.daysRemaining <= 0 ? 'Today' : event.daysRemaining === 1 ? '1 day' : `${event.daysRemaining} days`}
        </span>
      </div>
      
      <h3 className="card-title">{event.title}</h3>
      <p className="card-desc">{event.description}</p>
      
      <div className="card-footer">
        {event.caseNumber && (
          <span className="case-ref">{event.caseNumber}</span>
        )}
        {event.debtorName && (
          <span className="debtor-name">{event.debtorName}</span>
        )}
        <span className="event-date">
          {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <style jsx>{`
        .deadline-card {
          background: ${colors.surface};
          border-radius: 12px;
          padding: ${spacing.md};
          box-shadow: ${shadows.sm};
          border-left: 4px solid;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .deadline-card:hover {
          transform: translateY(-2px);
          box-shadow: ${shadows.md};
        }
        .deadline-card.danger {
          border-left-color: ${colors.danger};
        }
        .deadline-card.warning {
          border-left-color: ${colors.warning};
        }
        .deadline-card.normal {
          border-left-color: ${colors.success};
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.sm};
        }
        .event-type {
          display: flex;
          align-items: center;
          gap: ${spacing.xs};
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .urgency-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .urgency-badge.danger {
          background: ${colors.danger}20;
          color: ${colors.danger};
        }
        .urgency-badge.warning {
          background: ${colors.warning}20;
          color: ${colors.warning};
        }
        .urgency-badge.normal {
          background: ${colors.success}20;
          color: ${colors.success};
        }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: ${spacing.xs};
        }
        .card-desc {
          font-size: 14px;
          color: ${colors.textSecondary};
          margin-bottom: ${spacing.md};
        }
        .card-footer {
          display: flex;
          gap: ${spacing.sm};
          align-items: center;
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .case-ref {
          color: ${colors.primary};
          font-weight: 600;
        }
        .debtor-name {
          flex: 1;
        }
        .event-date {
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}