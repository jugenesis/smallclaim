import { CaseWithDebtor } from './cases-api'

export type CalendarEventType = 'hearing' | 'deadline' | 'filing' | 'service' | 'payment'
export type EventType = CalendarEventType

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  description: string
  date: Date
  caseId?: string
  caseNumber?: string
  debtorName?: string
  urgency: 'danger' | 'warning' | 'normal'
  daysRemaining: number
  color: string
}

export interface DayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

const EVENT_COLORS: Record<CalendarEventType, string> = {
  hearing: '#007AFF',
  deadline: '#FF9500',
  filing: '#5856D6',
  service: '#FF3B30',
  payment: '#34C759',
}

function createEvent(
  id: string,
  type: CalendarEventType,
  title: string,
  description: string,
  date: Date,
  caseId?: string,
  caseNumber?: string,
  debtorName?: string
): CalendarEvent {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysRemaining = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  let urgency: 'danger' | 'warning' | 'normal' = 'normal'
  if (daysRemaining < 0) urgency = 'danger'
  else if (daysRemaining < 3) urgency = 'danger'
  else if (daysRemaining < 7) urgency = 'warning'
  
  return {
    id,
    type,
    title,
    description,
    date,
    caseId,
    caseNumber,
    debtorName,
    daysRemaining,
    urgency,
    color: EVENT_COLORS[type],
  }
}

export async function getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  // Placeholder events based on the case data
  const events: CalendarEvent[] = [
    createEvent(
      'ev1',
      'hearing',
      'Court Hearing',
      'Santa Monica Courthouse - Case #2024-042',
      new Date('2024-06-18'),
      '1',
      '2024-042',
      'Dr. Sarah Kim, DDS'
    ),
    createEvent(
      'ev2',
      'deadline',
      'Service Deadline',
      'Personal service must be completed - Case #2024-089',
      new Date('2024-06-22'),
      '2',
      '2024-089',
      'Michael Chen'
    ),
    createEvent(
      'ev3',
      'filing',
      'SC-104 Filing Due',
      'Proof of service filing - Case #2024-056',
      new Date('2024-06-15'),
      '3',
      '2024-056',
      'Green Valley Apartments'
    ),
    createEvent(
      'ev4',
      'payment',
      'Payment Due',
      'Judgment payment installment - Case #2023-211',
      new Date('2024-06-30'),
      '4',
      '2023-211',
      'Jennifer Martinez'
    ),
    createEvent(
      'ev5',
      'hearing',
      'Trial Setting Conference',
      'San Fernando Courthouse - Case #2024-112',
      new Date('2024-07-02'),
      '5',
      '2024-112',
      'Robert Williams'
    ),
    createEvent(
      'ev6',
      'deadline',
      'Response Deadline',
      'Demand letter response overdue - Case #2024-098',
      new Date('2024-06-08'),
      '6',
      '2024-098',
      'Amanda Thompson'
    ),
  ]
  
  return events.filter(e => e.date >= startDate && e.date <= endDate)
}

export async function getDeadlines(): Promise<CalendarEvent[]> {
  const today = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 3)
  
  const events = await getCalendarEvents(today, endDate)
  return events.sort((a, b) => a.daysRemaining - b.daysRemaining)
}

export function getMonthData(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const result: DayData[] = []
  
  // Previous month days
  const prevMonth = new Date(year, month, 0)
  const prevMonthDays = prevMonth.getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i)
    result.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      events: [],
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    result.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      events: [],
    })
  }
  
  // Next month days to fill grid
  const remaining = 42 - result.length
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day)
    result.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      events: [],
    })
  }
  
  return result
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
}