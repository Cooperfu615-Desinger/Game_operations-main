import type { SlotContent } from '@/types/frontend'

// picsum.photos gives consistent images based on seed
const img = (seed: string, w = 400, h = 200) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const mockSlotContents: SlotContent[] = [
  // ── APP BANNER (max 5) ────────────────────────────────────
  { id: 'fb001', slot_type: 'BANNER', platform: 'APP', title: '4月熱門活動', image_url: img('banner1'), link_target: '/events/april', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z', created_at: '2026-03-28T09:00:00Z' },
  { id: 'fb002', slot_type: 'BANNER', platform: 'APP', title: '週末儲值加碼', image_url: img('banner2'), link_target: '/deposit', sort_order: 2, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T11:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T09:30:00Z', created_at: '2026-03-28T10:30:00Z' },
  { id: 'fb003', slot_type: 'BANNER', platform: 'APP', title: '新手禮包', image_url: img('banner3'), link_target: '/newbie', sort_order: 3, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-05-31T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-30T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-31T09:00:00Z', created_at: '2026-03-30T09:00:00Z' },
  { id: 'fb004', slot_type: 'BANNER', platform: 'APP', title: '5月勞動節活動', image_url: img('banner4'), link_target: '/events/labor', sort_order: 4, status: 'SCHEDULED', scheduled_start: '2026-05-01T00:00:00Z', scheduled_end: '2026-05-07T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-04-20T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-04-21T09:00:00Z', created_at: '2026-04-20T09:00:00Z' },
  { id: 'fb005', slot_type: 'BANNER', platform: 'APP', title: '母親節優惠草稿', image_url: img('banner5'), link_target: '', sort_order: 5, status: 'DRAFT', submitted_by: 'operator', created_at: '2026-04-22T14:00:00Z' },

  // ── WEB BANNER ────────────────────────────────────────────
  { id: 'fb006', slot_type: 'BANNER', platform: 'WEB', title: '官網首頁主視覺', image_url: img('webbanner1', 800, 300), link_target: '/events', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z', created_at: '2026-03-28T09:00:00Z' },
  { id: 'fb007', slot_type: 'BANNER', platform: 'WEB', title: '官網週末活動', image_url: img('webbanner2', 800, 300), link_target: '/deposit', sort_order: 2, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-29T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-30T09:00:00Z', created_at: '2026-03-29T09:00:00Z' },
  { id: 'fb008', slot_type: 'BANNER', platform: 'WEB', title: '官網5月活動', image_url: img('webbanner3', 800, 300), link_target: '/events/may', sort_order: 3, status: 'PENDING', submitted_by: 'operator', submitted_at: '2026-04-22T10:00:00Z', created_at: '2026-04-22T09:00:00Z' },

  // ── APP LOBBY_BG ──────────────────────────────────────────
  { id: 'fb009', slot_type: 'LOBBY_BG', platform: 'APP', title: '春季大廳底圖', image_url: img('lobby1', 375, 812), sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-03-01T00:00:00Z', scheduled_end: '2026-05-31T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-02-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-02-28T15:00:00Z', created_at: '2026-02-28T09:00:00Z' },

  // ── APP EVENT ─────────────────────────────────────────────
  { id: 'fb010', slot_type: 'EVENT', platform: 'APP', title: '登入送禮', image_url: img('event1'), link_target: '/events/login', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z', created_at: '2026-03-28T09:00:00Z' },
  { id: 'fb011', slot_type: 'EVENT', platform: 'APP', title: '好友邀請活動', image_url: img('event2'), link_target: '/events/invite', sort_order: 2, status: 'ACTIVE', scheduled_start: '2026-04-15T00:00:00Z', scheduled_end: '2026-05-15T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-04-10T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-04-11T09:00:00Z', created_at: '2026-04-10T09:00:00Z' },
  { id: 'fb012', slot_type: 'EVENT', platform: 'APP', title: '5月新活動（待審）', image_url: img('event3'), link_target: '/events/may', sort_order: 3, status: 'PENDING', submitted_by: 'operator', submitted_at: '2026-04-22T14:00:00Z', created_at: '2026-04-22T13:00:00Z' },

  // ── WEB EVENT ─────────────────────────────────────────────
  { id: 'fb013', slot_type: 'EVENT', platform: 'WEB', title: '官網登入禮', image_url: img('webevent1'), link_target: '/events/login', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z', created_at: '2026-03-28T09:00:00Z' },

  // ── APP POPUP ─────────────────────────────────────────────
  { id: 'fb014', slot_type: 'POPUP', platform: 'APP', title: '4月彈窗公告', image_url: img('popup1', 300, 400), link_target: '/events/april', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-30T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-31T09:00:00Z', created_at: '2026-03-30T09:00:00Z' },

  // ── WEB POPUP ─────────────────────────────────────────────
  { id: 'fb015', slot_type: 'POPUP', platform: 'WEB', title: '官網4月彈窗', image_url: img('webpopup1', 400, 500), link_target: '/events/april', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-30T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-31T09:00:00Z', created_at: '2026-03-30T09:00:00Z' },
  { id: 'fb016', slot_type: 'POPUP', platform: 'WEB', title: '官網5月彈窗', image_url: img('webpopup2', 400, 500), link_target: '', sort_order: 1, status: 'REJECTED', submitted_by: 'operator', submitted_at: '2026-04-20T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-04-21T09:00:00Z', reject_reason: '圖片尺寸不符合規範，請重新上傳 400x500 的圖片', created_at: '2026-04-20T09:00:00Z' },

  // ── APP SPLASH ────────────────────────────────────────────
  { id: 'fb017', slot_type: 'SPLASH', platform: 'APP', title: '春季啟動頁', image_url: img('splash1', 375, 812), sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-03-01T00:00:00Z', scheduled_end: '2026-05-31T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-02-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-02-28T15:00:00Z', created_at: '2026-02-28T09:00:00Z' },

  // ── APP DEPOSIT_PROMO ─────────────────────────────────────
  { id: 'fb018', slot_type: 'DEPOSIT_PROMO', platform: 'APP', title: '首儲雙倍', image_url: img('deposit1', 600, 300), link_target: '/deposit/promo1', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-06-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z', created_at: '2026-03-28T09:00:00Z' },
  { id: 'fb019', slot_type: 'DEPOSIT_PROMO', platform: 'APP', title: '週末加碼50%', image_url: img('deposit2', 600, 300), link_target: '/deposit/weekend', sort_order: 2, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-04-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T11:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T10:00:00Z', created_at: '2026-03-28T10:00:00Z' },

  // ── WEB DEPOSIT_PROMO ─────────────────────────────────────
  { id: 'fb020', slot_type: 'DEPOSIT_PROMO', platform: 'WEB', title: '官網首儲活動', image_url: img('webdeposit1', 600, 300), link_target: '/deposit/promo1', sort_order: 1, status: 'ACTIVE', scheduled_start: '2026-04-01T00:00:00Z', scheduled_end: '2026-06-30T23:59:59Z', submitted_by: 'operator', submitted_at: '2026-03-28T10:00:00Z', reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z', created_at: '2026-03-28T09:00:00Z' }
]
