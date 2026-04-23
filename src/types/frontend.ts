export type SlotType = 'BANNER' | 'LOBBY_BG' | 'EVENT' | 'POPUP' | 'SPLASH' | 'DEPOSIT_PROMO'
export type FrontendPlatform = 'APP' | 'WEB'
export type ContentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED'

export interface SlotContent {
  id: string
  slot_type: SlotType
  platform: FrontendPlatform
  title: string
  image_url: string
  link_target?: string
  sort_order: number
  status: ContentStatus
  scheduled_start?: string
  scheduled_end?: string
  submitted_by: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
  created_at: string
}

export interface SlotConfig {
  label: string
  platforms: FrontendPlatform[]
  maxItems: number
  hasLink: boolean
  description: string
  aspectLabel: string
}

export const SLOT_CONFIGS: Record<SlotType, SlotConfig> = {
  BANNER:       { label: '首頁輪播 Banner',  platforms: ['APP', 'WEB'], maxItems: 5, hasLink: true,  description: '首頁頂部輪播廣告，最多 5 張，可拖拉調整順序', aspectLabel: '16:9' },
  LOBBY_BG:     { label: 'Lobby 底圖',       platforms: ['APP'],        maxItems: 1, hasLink: false, description: 'APP 大廳背景圖',                             aspectLabel: '9:16' },
  EVENT:        { label: '活動專區圖',        platforms: ['APP', 'WEB'], maxItems: 3, hasLink: true,  description: '活動入口視覺圖，最多 3 張',                   aspectLabel: '4:3' },
  POPUP:        { label: '彈窗公告圖',        platforms: ['APP', 'WEB'], maxItems: 1, hasLink: true,  description: '進入 APP / 官網時跳出的公告彈窗',             aspectLabel: '3:4' },
  SPLASH:       { label: 'Splash 啟動頁',    platforms: ['APP'],        maxItems: 1, hasLink: false, description: 'APP 開啟時的啟動畫面',                       aspectLabel: '9:16' },
  DEPOSIT_PROMO:{ label: '儲值優惠廣告圖',   platforms: ['APP', 'WEB'], maxItems: 3, hasLink: true,  description: '儲值頁面的活動廣告圖，最多 3 張',             aspectLabel: '2:1' }
}

export const STATUS_CONFIG: Record<ContentStatus, { label: string; type: 'default' | 'warning' | 'success' | 'error' | 'info' }> = {
  DRAFT:     { label: '草稿',   type: 'default' },
  PENDING:   { label: '待審核', type: 'warning' },
  APPROVED:  { label: '已核准', type: 'success' },
  REJECTED:  { label: '已拒絕', type: 'error' },
  ACTIVE:    { label: '上線中', type: 'success' },
  SCHEDULED: { label: '排程中', type: 'info' },
  EXPIRED:   { label: '已過期', type: 'default' }
}
