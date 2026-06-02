'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import { DayData, CalendarEvent, EventType } from '@/lib/calendar-api'
import { useState, useEffect } from 'react'
import { getMonthData, formatMonthYear, getCalendarEvents, getDeadlines, isSameDay } from '@/lib/calendar-api'
import DeadlineCard from '@/components/DeadlineCard'
import { useRouter } from 'next/navigation'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_LABELS: Record<EventType, string> = {
  hearing: 'Hearing',
  deadline: 'Deadline',
  filing: 'Filing',
  service: 'Service',
  payment: 'Payment',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthData, setMonthData] = useState<DayData[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [deadlines, setDeadlines] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'calendar' | 'deadlines'>('calendar')
  const router = useRouter()

  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const data = getMonthData(year, month)
    setMonthData(data)
    
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month + 2, 0)
    
    Promise.all([
      getCalendarEvents(startDate, endDate),
      getDeadlines(),
    ]).then(([evs, dls]) => {
      setEvents(evs)
      setDeadlines(dls)
      
      const updatedData = data.map(day => ({
        ...day,
        events: evs.filter(e => isSameDay(e.date, day.date)),
      }))
      setMonthData(updatedData)
    })
  }, [currentDate])

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const selectedDayEvents = selectedDate
    ? events.filter(e => isSameDay(e.date, selectedDate))
    : []

  return (
    <main className="calendar-page">
      <header className="page-header">
        <div className="header-left">
          <h1 className="large-title">Calendar</h1>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
              </svg>
            </button>
            <button
              className={`toggle-btn ${view === 'deadlines' ? 'active' : ''}`}
              onClick={() => setView('deadlines')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </button>
          </div>
          <button className="btn btn-secondary" onClick={goToToday}>Today</button>
        </div>
      </header>

      {view === 'calendar' ? (
        <div className="calendar-view">
          <div className="calendar-nav">
            <button className="nav-btn" onClick={prevMonth}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <span className="month-title">{formatMonthYear(currentDate)}</span>
            <button className="nav-btn" onClick={nextMonth}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekday-header">
              {WEEKDAYS.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="days-grid">
              {monthData.map((day, idx) => (
                <div
                  key={idx}
                  className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${selectedDate && isSameDay(day.date, selectedDate) ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <span className="day-number">{day.date.getDate()}</span>
                  <div className="event-dots">
                    {day.events.slice(0, 3).map(ev => (
                      <span
                        key={ev.id}
                        className="event-dot"
                        style={{ backgroundColor: ev.color }}
                        title={ev.title}
                      />
                    ))}
                    {day.events.length > 3 && (
                      <span className="more-events">+{day.events.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="day-detail-panel">
              <div className="panel-header">
                <h2 className="title-3">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <button className="close-btn" onClick={() => setSelectedDate(null)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
              {selectedDayEvents.length === 0 ? (
                <p className="no-events">No events scheduled</p>
              ) : (
                <div className="events-list">
                  {selectedDayEvents.map(ev => (
                    <div
                      key={ev.id}
                      className="event-item"
                      onClick={() => ev.caseId && router.push(`/cases/${ev.caseId}`)}
                    >
                      <div className="event-color" style={{ backgroundColor: ev.color }} />
                      <div className="event-info">
                        <span className="event-title">{ev.title}</span>
                        <span className="event-desc">{ev.description}</span>
                        {ev.caseNumber && (
                          <span className="event-case">{ev.caseNumber}</span>
                        )}
                      </div>
                      <span className={`urgency-badge ${ev.urgency}`}>
                        {ev.daysRemaining <= 0 ? 'Today' : `${ev.daysRemaining}d`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="deadlines-view">
          <div className="deadlines-header">
            <h2 className="title-2">Upcoming Deadlines</h2>
            <span className="deadline-count">{deadlines.length} events</span>
          </div>
          <div className="deadlines-grid">
            {deadlines.map(ev => (
              <DeadlineCard key={ev.id} event={ev} />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${spacing.lg};
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.lg};
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
        .calendar-view {
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
        }
        .calendar-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${spacing.lg};
        }
        .nav-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: ${colors.surface};
          color: ${colors.textPrimary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${shadows.sm};
        }
        .nav-btn:hover {
          background: ${colors.primary};
          color: white;
        }
        .month-title {
          font-size: 20px;
          font-weight: 700;
          min-width: 180px;
          text-align: center;
        }
        .calendar-grid {
          background: ${colors.surface};
          border-radius: 12px;
          box-shadow: ${shadows.sm};
          overflow: hidden;
        }
        .weekday-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: ${colors.background};
          border-bottom: 1px solid ${colors.separator};
        }
        .weekday {
          padding: ${spacing.sm};
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: ${colors.textSecondary};
          text-transform: uppercase;
        }
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .day-cell {
          min-height: 80px;
          padding: ${spacing.xs};
          border-right: 1px solid ${colors.separator};
          border-bottom: 1px solid ${colors.separator};
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .day-cell:nth-child(7n) {
          border-right: none;
        }
        .day-cell:hover {
          background: ${colors.background};
        }
        .day-cell.other-month {
          background: ${colors.background};
        }
        .day-cell.other-month .day-number {
          color: ${colors.textSecondary};
        }
        .day-cell.today .day-number {
          background: ${colors.primary};
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .day-cell.selected {
          background: ${colors.primary}10;
        }
        .day-number {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: ${spacing.xs};
        }
        .event-dots {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
        }
        .event-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .more-events {
          font-size: 10px;
          color: ${colors.textSecondary};
        }
        .day-detail-panel {
          background: ${colors.surface};
          border-radius: 12px;
          box-shadow: ${shadows.sm};
          padding: ${spacing.md};
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.md};
          padding-bottom: ${spacing.md};
          border-bottom: 1px solid ${colors.separator};
        }
        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: ${colors.background};
          color: ${colors.textSecondary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .no-events {
          color: ${colors.textSecondary};
          text-align: center;
          padding: ${spacing.lg};
        }
        .events-list {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm};
        }
        .event-item {
          display: flex;
          align-items: center;
          gap: ${spacing.md};
          padding: ${spacing.sm};
          background: ${colors.background};
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .event-item:hover {
          background: ${colors.primary}10;
        }
        .event-color {
          width: 4px;
          height: 40px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .event-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .event-title {
          font-size: 15px;
          font-weight: 600;
        }
        .event-desc {
          font-size: 13px;
          color: ${colors.textSecondary};
        }
        .event-case {
          font-size: 12px;
          color: ${colors.primary};
          font-weight: 500;
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
        .deadlines-view {
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
        }
        .deadlines-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .deadline-count {
          font-size: 14px;
          color: ${colors.textSecondary};
        }
        .deadlines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: ${spacing.md};
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
          .day-cell {
            min-height: 60px;
          }
          .event-dots {
            display: none;
          }
          .deadlines-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}