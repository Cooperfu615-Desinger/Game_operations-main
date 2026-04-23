import type { SlotContent, FrontendPlatform, SlotType, ContentStatus } from '@/types/frontend'
import { mockSlotContents } from '@/mocks/frontend'
import type { ApiResponse } from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))
let idSeq = mockSlotContents.length + 1

export const frontendApi = {
  async getSlotContents(platform: FrontendPlatform, slotType?: SlotType): Promise<ApiResponse<SlotContent[]>> {
    await delay()
    let items = mockSlotContents.filter(i => i.platform === platform)
    if (slotType) items = items.filter(i => i.slot_type === slotType)
    items = [...items].sort((a, b) => a.sort_order - b.sort_order)
    return { code: 0, msg: 'success', data: items }
  },

  async getAllPendingContents(): Promise<ApiResponse<SlotContent[]>> {
    await delay()
    const items = mockSlotContents.filter(i => i.status === 'PENDING' || i.status === 'REJECTED' || i.status === 'APPROVED')
    return { code: 0, msg: 'success', data: [...items].sort((a, b) => new Date(b.submitted_at ?? b.created_at).getTime() - new Date(a.submitted_at ?? a.created_at).getTime()) }
  },

  async saveContent(payload: Partial<SlotContent> & { id?: string }): Promise<ApiResponse<SlotContent>> {
    await delay()
    if (payload.id) {
      const idx = mockSlotContents.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        Object.assign(mockSlotContents[idx], payload)
        return { code: 0, msg: 'success', data: mockSlotContents[idx] }
      }
      return { code: 404, msg: 'Not found' }
    }
    const newItem: SlotContent = {
      id: `fb${String(idSeq++).padStart(3, '0')}`,
      slot_type: payload.slot_type!,
      platform: payload.platform!,
      title: payload.title ?? '',
      image_url: payload.image_url ?? '',
      link_target: payload.link_target,
      sort_order: payload.sort_order ?? 99,
      status: payload.status ?? 'DRAFT',
      scheduled_start: payload.scheduled_start,
      scheduled_end: payload.scheduled_end,
      submitted_by: payload.submitted_by ?? 'operator',
      created_at: new Date().toISOString()
    }
    mockSlotContents.push(newItem)
    return { code: 0, msg: 'success', data: newItem }
  },

  async submitForReview(id: string): Promise<ApiResponse<void>> {
    await delay()
    const item = mockSlotContents.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    item.status = 'PENDING'
    item.submitted_at = new Date().toISOString()
    return { code: 0, msg: 'success' }
  },

  async reviewContent(id: string, action: 'approve' | 'reject', rejectReason?: string): Promise<ApiResponse<void>> {
    await delay()
    const item = mockSlotContents.find(i => i.id === id)
    if (!item) return { code: 404, msg: 'Not found' }
    item.status = action === 'approve' ? 'APPROVED' : 'REJECTED'
    item.reviewed_by = 'manager'
    item.reviewed_at = new Date().toISOString()
    if (action === 'reject') item.reject_reason = rejectReason
    return { code: 0, msg: 'success' }
  },

  async updateSortOrder(platform: FrontendPlatform, slotType: SlotType, orderedIds: string[]): Promise<ApiResponse<void>> {
    await delay(200)
    orderedIds.forEach((id, index) => {
      const item = mockSlotContents.find(i => i.id === id)
      if (item) item.sort_order = index + 1
    })
    return { code: 0, msg: 'success' }
  },

  async deleteContent(id: string): Promise<ApiResponse<void>> {
    await delay()
    const idx = mockSlotContents.findIndex(i => i.id === id)
    if (idx !== -1) mockSlotContents.splice(idx, 1)
    return { code: 0, msg: 'success' }
  }
}
