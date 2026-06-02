import { DashboardMetrics, DeadlineItem, ActionRequired, CaseStatus } from '@/types'

// Placeholder data - will be replaced with actual database/API calls
const PLACEHOLDER_METRICS: DashboardMetrics = {
  totalAR: 47230,
  totalCases: 18,
  currentAR: 12400,
  currentCases: 5,
  thirtyDayAR: 18650,
  thirtyDayCases: 7,
  sixtyDayAR: 16180,
  sixtyDayCases: 6,
  ninetyPlusAR: 0,
  ninetyPlusCases: 0,
}

const PLACEHOLDER_DEADLINES: DeadlineItem[] = [
  {
    id: '1',
    caseId: '1',
    caseNumber: '2024-042',
    eventType: 'SC-104 Filing',
    deadline: new Date('2024-06-15'),
    daysRemaining: 2,
    urgency: 'danger',
    debtorName: 'Dr. Sarah Kim',
  },
  {
    id: '2',
    caseId: '2',
    caseNumber: '2024-043',
    eventType: 'Court Hearing',
    deadline: new Date('2024-06-18'),
    daysRemaining: 5,
    urgency: 'warning',
    debtorName: 'Dr. Michael Chen',
  },
  {
    id: '3',
    caseId: '3',
    caseNumber: '2024-044',
    eventType: 'Service Deadline',
    deadline: new Date('2024-06-22'),
    daysRemaining: 9,
    urgency: 'normal',
    debtorName: 'Bright Smile Dental',
  },
]

const PLACEHOLDER_ACTIONS: ActionRequired[] = [
  {
    id: '1',
    caseId: '1',
    caseNumber: '2024-042',
    actionType: 'service',
    description: 'Service due in 2 days',
    amount: 3200,
    deadline: new Date('2024-06-15'),
  },
  {
    id: '2',
    caseId: '4',
    caseNumber: '2024-045',
    actionType: 'demand-response',
    description: 'Demand letter overdue (30+ days)',
    amount: 5100,
  },
]

export interface PipelineColumn {
  status: CaseStatus
  label: string
  count: number
  cases: { id: string; debtor: string; amount: number; deadline: string }[]
}

const PLACEHOLDER_PIPELINE: PipelineColumn[] = [
  { status: 'demand', label: 'Demand', count: 4, cases: [] },
  { status: 'filed', label: 'Filed', count: 2, cases: [] },
  { status: 'served', label: 'Served', count: 3, cases: [] },
  { status: 'hearing', label: 'Hearing', count: 1, cases: [] },
  { status: 'judgment', label: 'Judgment', count: 2, cases: [] },
]

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // TODO: Replace with actual API call
  return PLACEHOLDER_METRICS
}

export async function getUpcomingDeadlines(limit = 10): Promise<DeadlineItem[]> {
  // TODO: Replace with actual API call
  return PLACEHOLDER_DEADLINES
}

export async function getActionsRequired(): Promise<ActionRequired[]> {
  // TODO: Replace with actual API call
  return PLACEHOLDER_ACTIONS
}

export async function getCasesPipeline(): Promise<PipelineColumn[]> {
  // TODO: Replace with actual API call
  return PLACEHOLDER_PIPELINE
}