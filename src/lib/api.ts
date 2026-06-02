import type { DashboardMetrics, DeadlineItem, ActionRequired, PipelineColumn } from '@/types'

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch('/api/metrics')
  if (!res.ok) throw new Error('Failed to fetch metrics')
  const data = await res.json()
  return {
    totalAR: data.totalAR,
    totalCases: data.totalCases,
    currentAR: data.currentAR,
    currentCases: 0,
    thirtyDayAR: data.thirtyDayAR,
    thirtyDayCases: 0,
    sixtyDayAR: data.sixtyDayAR,
    sixtyDayCases: 0,
    ninetyPlusAR: data.ninetyPlusAR,
    ninetyPlusCases: 0,
  }
}

export async function getUpcomingDeadlines(limit = 10): Promise<DeadlineItem[]> {
  const res = await fetch(`/api/deadlines?limit=${limit}`)
  if (!res.ok) return []
  return res.json()
}

export async function getActionsRequired(): Promise<ActionRequired[]> {
  const res = await fetch('/api/actions')
  if (!res.ok) return []
  return res.json()
}

export async function getCasesPipeline(): Promise<PipelineColumn[]> {
  const res = await fetch('/api/metrics')
  if (!res.ok) return []
  const data = await res.json()
  return data.pipeline || []
}