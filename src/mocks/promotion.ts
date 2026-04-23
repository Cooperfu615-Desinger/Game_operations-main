import type { Promotion, PromotionClaimRecord } from '@/types/promotion'

export const mockPromotions: Promotion[] = [
  // ── 首儲優惠 ──────────────────────────────────────────────
  {
    id: 'promo001',
    name: '標準首儲方案',
    type: 'FIRST_DEPOSIT',
    status: 'ACTIVE',
    description: '新玩家首次儲值，享專屬銀幣加碼',
    tiers: [
      { id: 't1', min_deposit: 100,  reward_silver: 500   },
      { id: 't2', min_deposit: 500,  reward_silver: 3000  },
      { id: 't3', min_deposit: 1000, reward_silver: 8000  },
      { id: 't4', min_deposit: 3000, reward_silver: 30000 }
    ],
    max_claims_per_user: 1,
    is_limited: false,
    submitted_by: 'operator_wang', submitted_at: '2026-03-20T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-21T09:00:00Z',
    created_at: '2026-03-20T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'promo002',
    name: '端午節首儲加碼！',
    type: 'FIRST_DEPOSIT',
    status: 'SCHEDULED',
    description: '端午節限定，首儲超值方案，錯過等明年！',
    tiers: [
      { id: 't1', min_deposit: 500,  reward_silver: 50000  },
      { id: 't2', min_deposit: 1000, reward_silver: 120000 },
      { id: 't3', min_deposit: 5000, reward_silver: 800000 }
    ],
    max_claims_per_user: 1,
    is_limited: true,
    scheduled_start: '2026-05-31T00:00:00Z',
    scheduled_end: '2026-06-08T23:59:59Z',
    submitted_by: 'operator_wang', submitted_at: '2026-04-20T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-04-21T09:00:00Z',
    created_at: '2026-04-20T09:00:00Z', created_by: 'operator_wang'
  },

  // ── 儲值優惠 ──────────────────────────────────────────────
  {
    id: 'promo003',
    name: '標準儲值方案',
    type: 'DEPOSIT',
    status: 'ACTIVE',
    description: '每次儲值均可享有銀幣回饋',
    tiers: [
      { id: 't1', min_deposit: 100,  reward_silver: 200   },
      { id: 't2', min_deposit: 500,  reward_silver: 1200  },
      { id: 't3', min_deposit: 1000, reward_silver: 3000  },
      { id: 't4', min_deposit: 5000, reward_silver: 18000 }
    ],
    max_claims_per_user: -1,
    is_limited: false,
    submitted_by: 'operator_lee', submitted_at: '2026-03-20T11:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-21T10:00:00Z',
    created_at: '2026-03-20T10:00:00Z', created_by: 'operator_lee'
  },
  {
    id: 'promo004',
    name: '勞動節週末儲值加碼',
    type: 'DEPOSIT',
    status: 'PENDING',
    description: '五一連假限定！儲值享雙倍銀幣',
    tiers: [
      { id: 't1', min_deposit: 300,  reward_silver: 6000  },
      { id: 't2', min_deposit: 1000, reward_silver: 25000 },
      { id: 't3', min_deposit: 3000, reward_silver: 90000 }
    ],
    max_claims_per_user: 3,
    is_limited: true,
    scheduled_start: '2026-05-01T00:00:00Z',
    scheduled_end: '2026-05-05T23:59:59Z',
    submitted_by: 'operator_lee', submitted_at: '2026-04-22T14:00:00Z',
    created_at: '2026-04-22T13:00:00Z', created_by: 'operator_lee'
  },
  {
    id: 'promo005',
    name: '清明節儲值活動',
    type: 'DEPOSIT',
    status: 'EXPIRED',
    description: '清明連假特別活動（已結束）',
    tiers: [
      { id: 't1', min_deposit: 200, reward_silver: 2000 },
      { id: 't2', min_deposit: 500, reward_silver: 6000 }
    ],
    max_claims_per_user: 2,
    is_limited: true,
    scheduled_start: '2026-04-03T00:00:00Z',
    scheduled_end: '2026-04-07T23:59:59Z',
    submitted_by: 'operator_wang', submitted_at: '2026-03-28T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z',
    created_at: '2026-03-28T09:00:00Z', created_by: 'operator_wang'
  },

  // ── 官網儲值引導 ──────────────────────────────────────────
  {
    id: 'promo006',
    name: '官網儲值專屬回饋',
    type: 'WEB_DEPOSIT',
    status: 'ACTIVE',
    description: '透過官網儲值，享有額外銀幣加碼，引導玩家至 WEB 版',
    tiers: [
      { id: 't1', min_deposit: 100,  reward_silver: 800   },
      { id: 't2', min_deposit: 500,  reward_silver: 5000  },
      { id: 't3', min_deposit: 1000, reward_silver: 12000 }
    ],
    max_claims_per_user: -1,
    is_limited: false,
    submitted_by: 'operator_lee', submitted_at: '2026-04-01T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-04-02T09:00:00Z',
    created_at: '2026-04-01T09:00:00Z', created_by: 'operator_lee'
  },
  {
    id: 'promo007',
    name: '母親節官網加碼活動（草稿）',
    type: 'WEB_DEPOSIT',
    status: 'DRAFT',
    description: '母親節限定官網儲值活動，草稿中...',
    tiers: [
      { id: 't1', min_deposit: 500, reward_silver: 8000 }
    ],
    max_claims_per_user: 1,
    is_limited: true,
    scheduled_start: '2026-05-10T00:00:00Z',
    scheduled_end: '2026-05-12T23:59:59Z',
    created_at: '2026-04-22T15:00:00Z', created_by: 'operator_wang'
  },

  // ── 簽到送禮 ──────────────────────────────────────────────
  {
    id: 'promo008',
    name: '每日簽到禮包',
    type: 'DAILY_CHECKIN',
    status: 'ACTIVE',
    description: '每日登入即可領取銀幣，養成登入習慣',
    reward_silver: 100,
    max_claims_per_user: -1,
    is_limited: false,
    submitted_by: 'operator_wang', submitted_at: '2026-03-01T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-02T09:00:00Z',
    created_at: '2026-03-01T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'promo009',
    name: '連假簽到加碼',
    type: 'DAILY_CHECKIN',
    status: 'REJECTED',
    description: '五一連假期間，每日簽到銀幣加倍',
    reward_silver: 500,
    max_claims_per_user: -1,
    is_limited: true,
    scheduled_start: '2026-05-01T00:00:00Z',
    scheduled_end: '2026-05-05T23:59:59Z',
    submitted_by: 'operator_lee', submitted_at: '2026-04-20T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-04-21T09:00:00Z',
    reject_reason: '與儲值加碼活動重疊，請調整時間區間後重新送審',
    created_at: '2026-04-20T09:00:00Z', created_by: 'operator_lee'
  },

  // ── 手機綁定 ──────────────────────────────────────────────
  {
    id: 'promo010',
    name: '手機號碼綁定禮',
    type: 'PHONE_BINDING',
    status: 'ACTIVE',
    description: '綁定手機號碼，立即獲得銀幣獎勵（每帳號僅限一次）',
    reward_silver: 300,
    max_claims_per_user: 1,
    is_limited: false,
    submitted_by: 'operator_wang', submitted_at: '2026-03-01T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-02T09:00:00Z',
    created_at: '2026-03-01T09:00:00Z', created_by: 'operator_wang'
  },

  // ── VIP 升級禮 ────────────────────────────────────────────
  {
    id: 'promo011',
    name: 'VIP 2 升級禮',
    type: 'VIP_UPGRADE',
    status: 'ACTIVE',
    description: '升級至 VIP 2 時自動發放銀幣',
    reward_silver: 1000,
    target_vip_level: 2,
    max_claims_per_user: 1,
    is_limited: false,
    submitted_by: 'operator_wang', submitted_at: '2026-03-01T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-02T09:00:00Z',
    created_at: '2026-03-01T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'promo012',
    name: 'VIP 5 升級禮',
    type: 'VIP_UPGRADE',
    status: 'ACTIVE',
    description: '升級至 VIP 5 時自動發放銀幣',
    reward_silver: 10000,
    target_vip_level: 5,
    max_claims_per_user: 1,
    is_limited: false,
    submitted_by: 'operator_wang', submitted_at: '2026-03-01T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-02T09:00:00Z',
    created_at: '2026-03-01T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'promo013',
    name: 'VIP 10 升級禮（待審）',
    type: 'VIP_UPGRADE',
    status: 'PENDING',
    description: '升級至 VIP 10 時自動發放超級銀幣大禮',
    reward_silver: 100000,
    target_vip_level: 10,
    max_claims_per_user: 1,
    is_limited: false,
    submitted_by: 'operator_lee', submitted_at: '2026-04-22T14:00:00Z',
    created_at: '2026-04-22T13:00:00Z', created_by: 'operator_lee'
  }
]

// ── Claim Records ─────────────────────────────────────────────
const players = [
  { id: 'U-10045', username: 'dragon_king'    },
  { id: 'U-20891', username: 'lucky_star88'   },
  { id: 'U-55678', username: 'golden_phoenix' },
  { id: 'U-33412', username: 'night_wolf'     },
  { id: 'U-77001', username: 'crystal_blade'  },
  { id: 'U-44520', username: 'thunder_god'    },
  { id: 'U-61233', username: 'jade_empress'   }
]

let claimSeq = 1
const claimId = () => `cr${String(claimSeq++).padStart(4, '0')}`

export const mockClaimRecords: PromotionClaimRecord[] = [
  // promo001 首儲
  { id: claimId(), promotion_id: 'promo001', promotion_name: '標準首儲方案',     promotion_type: 'FIRST_DEPOSIT', player_id: 'U-10045', player_username: 'dragon_king',    claimed_at: '2026-04-01T10:23:00Z', reward_silver: 8000,   trigger_deposit: 1000, platform: 'APP' },
  { id: claimId(), promotion_id: 'promo001', promotion_name: '標準首儲方案',     promotion_type: 'FIRST_DEPOSIT', player_id: 'U-20891', player_username: 'lucky_star88',   claimed_at: '2026-04-02T14:11:00Z', reward_silver: 500,    trigger_deposit: 100,  platform: 'APP' },
  { id: claimId(), promotion_id: 'promo001', promotion_name: '標準首儲方案',     promotion_type: 'FIRST_DEPOSIT', player_id: 'U-55678', player_username: 'golden_phoenix', claimed_at: '2026-04-03T09:05:00Z', reward_silver: 30000,  trigger_deposit: 3000, platform: 'WEB' },
  { id: claimId(), promotion_id: 'promo001', promotion_name: '標準首儲方案',     promotion_type: 'FIRST_DEPOSIT', player_id: 'U-33412', player_username: 'night_wolf',     claimed_at: '2026-04-05T18:44:00Z', reward_silver: 3000,   trigger_deposit: 500,  platform: 'APP' },
  { id: claimId(), promotion_id: 'promo001', promotion_name: '標準首儲方案',     promotion_type: 'FIRST_DEPOSIT', player_id: 'U-77001', player_username: 'crystal_blade',  claimed_at: '2026-04-07T11:30:00Z', reward_silver: 8000,   trigger_deposit: 1000, platform: 'APP' },
  // promo003 儲值
  { id: claimId(), promotion_id: 'promo003', promotion_name: '標準儲值方案',     promotion_type: 'DEPOSIT',       player_id: 'U-10045', player_username: 'dragon_king',    claimed_at: '2026-04-10T15:20:00Z', reward_silver: 3000,   trigger_deposit: 1000, platform: 'APP' },
  { id: claimId(), promotion_id: 'promo003', promotion_name: '標準儲值方案',     promotion_type: 'DEPOSIT',       player_id: 'U-44520', player_username: 'thunder_god',    claimed_at: '2026-04-10T16:45:00Z', reward_silver: 18000,  trigger_deposit: 5000, platform: 'APP' },
  { id: claimId(), promotion_id: 'promo003', promotion_name: '標準儲值方案',     promotion_type: 'DEPOSIT',       player_id: 'U-20891', player_username: 'lucky_star88',   claimed_at: '2026-04-11T09:00:00Z', reward_silver: 1200,   trigger_deposit: 500,  platform: 'WEB' },
  { id: claimId(), promotion_id: 'promo003', promotion_name: '標準儲值方案',     promotion_type: 'DEPOSIT',       player_id: 'U-61233', player_username: 'jade_empress',   claimed_at: '2026-04-12T20:10:00Z', reward_silver: 3000,   trigger_deposit: 1000, platform: 'APP' },
  // promo006 官網儲值
  { id: claimId(), promotion_id: 'promo006', promotion_name: '官網儲值專屬回饋', promotion_type: 'WEB_DEPOSIT',   player_id: 'U-55678', player_username: 'golden_phoenix', claimed_at: '2026-04-08T13:22:00Z', reward_silver: 12000,  trigger_deposit: 1000, platform: 'WEB' },
  { id: claimId(), promotion_id: 'promo006', promotion_name: '官網儲值專屬回饋', promotion_type: 'WEB_DEPOSIT',   player_id: 'U-33412', player_username: 'night_wolf',     claimed_at: '2026-04-09T17:55:00Z', reward_silver: 5000,   trigger_deposit: 500,  platform: 'WEB' },
  // promo008 簽到
  { id: claimId(), promotion_id: 'promo008', promotion_name: '每日簽到禮包',     promotion_type: 'DAILY_CHECKIN', player_id: 'U-10045', player_username: 'dragon_king',    claimed_at: '2026-04-20T00:05:00Z', reward_silver: 100,    platform: 'APP' },
  { id: claimId(), promotion_id: 'promo008', promotion_name: '每日簽到禮包',     promotion_type: 'DAILY_CHECKIN', player_id: 'U-20891', player_username: 'lucky_star88',   claimed_at: '2026-04-20T08:30:00Z', reward_silver: 100,    platform: 'APP' },
  { id: claimId(), promotion_id: 'promo008', promotion_name: '每日簽到禮包',     promotion_type: 'DAILY_CHECKIN', player_id: 'U-44520', player_username: 'thunder_god',    claimed_at: '2026-04-21T00:01:00Z', reward_silver: 100,    platform: 'APP' },
  { id: claimId(), promotion_id: 'promo008', promotion_name: '每日簽到禮包',     promotion_type: 'DAILY_CHECKIN', player_id: 'U-61233', player_username: 'jade_empress',   claimed_at: '2026-04-21T09:15:00Z', reward_silver: 100,    platform: 'WEB' },
  { id: claimId(), promotion_id: 'promo008', promotion_name: '每日簽到禮包',     promotion_type: 'DAILY_CHECKIN', player_id: 'U-10045', player_username: 'dragon_king',    claimed_at: '2026-04-21T00:03:00Z', reward_silver: 100,    platform: 'APP' },
  { id: claimId(), promotion_id: 'promo008', promotion_name: '每日簽到禮包',     promotion_type: 'DAILY_CHECKIN', player_id: 'U-77001', player_username: 'crystal_blade',  claimed_at: '2026-04-22T10:00:00Z', reward_silver: 100,    platform: 'APP' },
  // promo010 手機綁定
  { id: claimId(), promotion_id: 'promo010', promotion_name: '手機號碼綁定禮',   promotion_type: 'PHONE_BINDING', player_id: 'U-10045', player_username: 'dragon_king',    claimed_at: '2026-04-01T10:30:00Z', reward_silver: 300,    platform: 'APP' },
  { id: claimId(), promotion_id: 'promo010', promotion_name: '手機號碼綁定禮',   promotion_type: 'PHONE_BINDING', player_id: 'U-20891', player_username: 'lucky_star88',   claimed_at: '2026-04-02T14:20:00Z', reward_silver: 300,    platform: 'APP' },
  { id: claimId(), promotion_id: 'promo010', promotion_name: '手機號碼綁定禮',   promotion_type: 'PHONE_BINDING', player_id: 'U-55678', player_username: 'golden_phoenix', claimed_at: '2026-04-03T09:10:00Z', reward_silver: 300,    platform: 'WEB' },
  { id: claimId(), promotion_id: 'promo010', promotion_name: '手機號碼綁定禮',   promotion_type: 'PHONE_BINDING', player_id: 'U-44520', player_username: 'thunder_god',    claimed_at: '2026-04-10T16:50:00Z', reward_silver: 300,    platform: 'APP' },
  // promo011 VIP 升級
  { id: claimId(), promotion_id: 'promo011', promotion_name: 'VIP 2 升級禮',     promotion_type: 'VIP_UPGRADE',   player_id: 'U-10045', player_username: 'dragon_king',    claimed_at: '2026-04-05T20:00:00Z', reward_silver: 1000,   platform: 'APP' },
  { id: claimId(), promotion_id: 'promo011', promotion_name: 'VIP 2 升級禮',     promotion_type: 'VIP_UPGRADE',   player_id: 'U-20891', player_username: 'lucky_star88',   claimed_at: '2026-04-08T12:00:00Z', reward_silver: 1000,   platform: 'APP' },
  { id: claimId(), promotion_id: 'promo012', promotion_name: 'VIP 5 升級禮',     promotion_type: 'VIP_UPGRADE',   player_id: 'U-44520', player_username: 'thunder_god',    claimed_at: '2026-04-15T22:10:00Z', reward_silver: 10000,  platform: 'APP' },
  { id: claimId(), promotion_id: 'promo012', promotion_name: 'VIP 5 升級禮',     promotion_type: 'VIP_UPGRADE',   player_id: 'U-77001', player_username: 'crystal_blade',  claimed_at: '2026-04-18T08:00:00Z', reward_silver: 10000,  platform: 'APP' }
]
