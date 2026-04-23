import type { Mission, MissionClaimRecord, MissionType, MissionStatus } from '@/types/mission'
import { mockMissions, mockMissionClaimRecords } from '@/mocks/mission'
import type { ApiResponse } from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))
let idSeq = mockMissions.length + 1

export interface GetMissionsParams {
  type?: MissionType
  status?: MissionStatus
  keyword?: string
}

export interface GetClaimRecordsParams {
  mission_id?: string
  type?: MissionType
  player_id?: string
  date_start?: string
  date_end?: string
  page: number
  page_size: number
}

export const missionApi = {
  async getMissions(params?: GetMissionsParams): Promise<ApiResponse<Mission[]>> {
    await delay()
    let items = [...mockMissions]
    if (params?.type)    items = items.filter(i => i.type === params.type)
    if (params?.status)  items = items.filter(i => i.status === params.status)
    if (params?.keyword) items = items.filter(i => i.name.includes(params.keyword!))
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { code: 0, msg: 'success', data: items }
  },

  async getMissionById(id: string): Promise<ApiResponse<Mission>> {
    await delay()
    const item = mockMissions.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    return { code: 0, msg: 'success', data: item }
  },

  async saveMission(payload: Partial<Mission> & { id?: string }): Promise<ApiResponse<Mission>> {
    await delay()
    if (payload.id) {
      const idx = mockMissions.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        Object.assign(mockMissions[idx], payload)
        return { code: 0, msg: 'success', data: mockMissions[idx] }
      }
      return { code: 404, msg: 'Not found' }
    }
    const newItem: Mission = {
      id: `ms${String(idSeq++).padStart(3, '0')}`,
      name: payload.name ?? '',
      type: payload.type ?? 'DAILY',
      status: 'DRAFT',
      description: payload.description,
      condition_type: payload.condition_type,
      condition_target: payload.condition_target,
      condition_desc: payload.condition_desc,
      rewards: payload.rewards ?? [],
      cycle_days: payload.cycle_days,
      daily_silver: payload.daily_silver,
      milestones: payload.milestones ?? [],
      is_limited: payload.is_limited ?? false,
      scheduled_start: payload.scheduled_start,
      scheduled_end: payload.scheduled_end,
      claim_count: 0,
      created_at: new Date().toISOString(),
      created_by: payload.created_by ?? 'operator'
    }
    mockMissions.push(newItem)
    return { code: 0, msg: 'success', data: newItem }
  },

  async submitForReview(id: string, submittedBy: string): Promise<ApiResponse<void>> {
    await delay()
    const item = mockMissions.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    item.status = 'PENDING'
    item.submitted_by = submittedBy
    item.submitted_at = new Date().toISOString()
    return { code: 0, msg: 'success' }
  },

  async reviewMission(id: string, action: 'approve' | 'reject', rejectReason?: string): Promise<ApiResponse<void>> {
    await delay()
    const item = mockMissions.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    if (action === 'approve') {
      item.status = item.is_limited && item.scheduled_start
        && new Date(item.scheduled_start) > new Date() ? 'SCHEDULED' : 'ACTIVE'
    } else {
      item.status = 'REJECTED'
      item.reject_reason = rejectReason
    }
    item.reviewed_by = 'manager'
    item.reviewed_at = new Date().toISOString()
    return { code: 0, msg: 'success' }
  },

  async toggleStatus(id: string, active: boolean): Promise<ApiResponse<void>> {
    await delay()
    const item = mockMissions.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    item.status = active ? 'ACTIVE' : 'EXPIRED'
    return { code: 0, msg: 'success' }
  },

  async deleteMission(id: string): Promise<ApiResponse<void>> {
    await delay()
    const idx = mockMissions.findIndex(i => i.id === id)
    if (idx !== -1) mockMissions.splice(idx, 1)
    return { code: 0, msg: 'success' }
  },

  async getClaimRecords(params: GetClaimRecordsParams): Promise<ApiResponse<{ list: MissionClaimRecord[]; total: number }>> {
    await delay()
    let items = [...mockMissionClaimRecords]
    if (params.mission_id) items = items.filter(i => i.mission_id === params.mission_id)
    if (params.type)       items = items.filter(i => i.mission_type === params.type)
    if (params.player_id)  items = items.filter(i => i.player_id.includes(params.player_id!) || i.player_username.includes(params.player_id!))
    if (params.date_start) items = items.filter(i => i.claimed_at >= params.date_start!)
    if (params.date_end)   items = items.filter(i => i.claimed_at <= params.date_end!)
    items.sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime())
    const total = items.length
    const start = (params.page - 1) * params.page_size
    return { code: 0, msg: 'success', data: { list: items.slice(start, start + params.page_size), total } }
  }
}
