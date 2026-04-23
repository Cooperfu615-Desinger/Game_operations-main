import type { Promotion, PromotionClaimRecord, PromotionType, PromotionStatus } from '@/types/promotion'
import { mockPromotions, mockClaimRecords } from '@/mocks/promotion'
import type { ApiResponse } from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))
let idSeq = mockPromotions.length + 1

export interface GetPromotionsParams {
  type?: PromotionType
  status?: PromotionStatus
  keyword?: string
}

export interface GetClaimRecordsParams {
  promotion_id?: string
  type?: PromotionType
  player_id?: string
  date_start?: string
  date_end?: string
  page: number
  page_size: number
}

export const promotionApi = {
  async getPromotions(params?: GetPromotionsParams): Promise<ApiResponse<Promotion[]>> {
    await delay()
    let items = [...mockPromotions]
    if (params?.type)    items = items.filter(i => i.type === params.type)
    if (params?.status)  items = items.filter(i => i.status === params.status)
    if (params?.keyword) items = items.filter(i => i.name.includes(params.keyword!))
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { code: 0, msg: 'success', data: items }
  },

  async getPromotionById(id: string): Promise<ApiResponse<Promotion>> {
    await delay()
    const item = mockPromotions.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    return { code: 0, msg: 'success', data: item }
  },

  async savePromotion(payload: Partial<Promotion> & { id?: string }): Promise<ApiResponse<Promotion>> {
    await delay()
    if (payload.id) {
      const idx = mockPromotions.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        Object.assign(mockPromotions[idx], payload)
        return { code: 0, msg: 'success', data: mockPromotions[idx] }
      }
      return { code: 404, msg: 'Not found' }
    }
    const newItem: Promotion = {
      id: `promo${String(idSeq++).padStart(3, '0')}`,
      name: payload.name ?? '',
      type: payload.type ?? 'DEPOSIT',
      status: 'DRAFT',
      description: payload.description,
      tiers: payload.tiers,
      reward_silver: payload.reward_silver,
      target_vip_level: payload.target_vip_level,
      max_claims_per_user: payload.max_claims_per_user ?? -1,
      is_limited: payload.is_limited ?? false,
      scheduled_start: payload.scheduled_start,
      scheduled_end: payload.scheduled_end,
      created_at: new Date().toISOString(),
      created_by: payload.created_by ?? 'operator'
    }
    mockPromotions.push(newItem)
    return { code: 0, msg: 'success', data: newItem }
  },

  async submitForReview(id: string): Promise<ApiResponse<void>> {
    await delay()
    const item = mockPromotions.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    item.status = 'PENDING'
    item.submitted_at = new Date().toISOString()
    return { code: 0, msg: 'success' }
  },

  async reviewPromotion(id: string, action: 'approve' | 'reject', rejectReason?: string): Promise<ApiResponse<void>> {
    await delay()
    const item = mockPromotions.find(i => i.id === id)
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
    const item = mockPromotions.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    item.status = active ? 'ACTIVE' : 'EXPIRED'
    return { code: 0, msg: 'success' }
  },

  async deletePromotion(id: string): Promise<ApiResponse<void>> {
    await delay()
    const idx = mockPromotions.findIndex(i => i.id === id)
    if (idx !== -1) mockPromotions.splice(idx, 1)
    return { code: 0, msg: 'success' }
  },

  async getClaimRecords(params: GetClaimRecordsParams): Promise<ApiResponse<{ list: PromotionClaimRecord[]; total: number }>> {
    await delay()
    let items = [...mockClaimRecords]
    if (params.promotion_id) items = items.filter(i => i.promotion_id === params.promotion_id)
    if (params.type)         items = items.filter(i => i.promotion_type === params.type)
    if (params.player_id)    items = items.filter(i => i.player_id.includes(params.player_id!) || i.player_username.includes(params.player_id!))
    if (params.date_start)   items = items.filter(i => i.claimed_at >= params.date_start!)
    if (params.date_end)     items = items.filter(i => i.claimed_at <= params.date_end!)
    items.sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime())
    const total = items.length
    const start = (params.page - 1) * params.page_size
    return { code: 0, msg: 'success', data: { list: items.slice(start, start + params.page_size), total } }
  }
}
