import type { Mission, MissionClaimRecord } from '@/types/mission'

export const mockMissions: Mission[] = [
  // ── 每日任務 ──────────────────────────────────────────────
  {
    id: 'ms001',
    name: '每日登入',
    type: 'DAILY',
    status: 'ACTIVE',
    description: '每天登入即可完成，獎勵自動存入信箱',
    condition_type: 'LOGIN',
    condition_target: 1,
    condition_desc: '每日登入 1 次',
    rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 50 }],
    is_limited: false,
    claim_count: 1842,
    submitted_by: 'operator_wang', submitted_at: '2026-03-01T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-02T09:00:00Z',
    created_at: '2026-03-01T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'ms002',
    name: '每日對戰達人',
    type: 'DAILY',
    status: 'ACTIVE',
    description: '今日完成指定場次遊戲，挑戰自我',
    condition_type: 'GAME_PLAY',
    condition_target: 5,
    condition_desc: '今日遊玩 5 場',
    rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 200 }],
    is_limited: false,
    claim_count: 765,
    submitted_by: 'operator_lee', submitted_at: '2026-03-01T11:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-02T10:00:00Z',
    created_at: '2026-03-01T10:00:00Z', created_by: 'operator_lee'
  },
  {
    id: 'ms003',
    name: '邀請好友',
    type: 'DAILY',
    status: 'ACTIVE',
    description: '成功邀請好友加入平台，雙方均可獲得獎勵',
    condition_type: 'INVITE_FRIEND',
    condition_target: 1,
    condition_desc: '成功邀請 1 位好友',
    rewards: [
      { id: 'r1', type: 'SILVER', silver_amount: 500 },
      { id: 'r2', type: 'GIFT_CARD', item_name: '好友邀請禮物卡', item_desc: '全家禮物卡 50 元，每月限兌 1 張' }
    ],
    is_limited: false,
    claim_count: 312,
    submitted_by: 'operator_wang', submitted_at: '2026-03-15T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-16T09:00:00Z',
    created_at: '2026-03-15T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'ms004',
    name: '每日儲值任務',
    type: 'DAILY',
    status: 'PENDING',
    description: '今日儲值即可完成，享有額外銀幣獎勵',
    condition_type: 'DEPOSIT_COUNT',
    condition_target: 1,
    condition_desc: '今日儲值 1 次',
    rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 300 }],
    is_limited: false,
    claim_count: 0,
    submitted_by: 'operator_lee', submitted_at: '2026-04-22T14:00:00Z',
    created_at: '2026-04-22T13:00:00Z', created_by: 'operator_lee'
  },

  // ── 活動任務 ──────────────────────────────────────────────
  {
    id: 'ms005',
    name: '端午節限定：龍舟競速！',
    type: 'EVENT',
    status: 'SCHEDULED',
    description: '端午節活動期間，累計遊玩達標即可領取限定頭像框！',
    condition_type: 'GAME_PLAY',
    condition_target: 20,
    condition_desc: '活動期間累計遊玩 20 場',
    rewards: [
      { id: 'r1', type: 'SILVER', silver_amount: 3000 },
      { id: 'r2', type: 'AVATAR_FRAME', item_name: '端午龍舟框' }
    ],
    is_limited: true,
    scheduled_start: '2026-05-31T00:00:00Z',
    scheduled_end: '2026-06-08T23:59:59Z',
    claim_count: 0,
    submitted_by: 'operator_wang', submitted_at: '2026-04-20T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-04-21T09:00:00Z',
    created_at: '2026-04-20T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'ms006',
    name: '4 月儲值衝刺！',
    type: 'EVENT',
    status: 'ACTIVE',
    description: '4 月份累計儲值達標，解鎖限定頭像！',
    condition_type: 'DEPOSIT_AMOUNT',
    condition_target: 5000,
    condition_desc: '4 月累計儲值 5000 金幣',
    rewards: [
      { id: 'r1', type: 'SILVER', silver_amount: 10000 },
      { id: 'r2', type: 'AVATAR', item_name: '4 月限定頭像 — 金龍' }
    ],
    is_limited: true,
    scheduled_start: '2026-04-01T00:00:00Z',
    scheduled_end: '2026-04-30T23:59:59Z',
    claim_count: 88,
    submitted_by: 'operator_lee', submitted_at: '2026-03-28T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z',
    created_at: '2026-03-28T09:00:00Z', created_by: 'operator_lee'
  },
  {
    id: 'ms007',
    name: '勞動節好禮活動（草稿）',
    type: 'EVENT',
    status: 'DRAFT',
    description: '五一連假特別活動，完成任務拿好禮',
    condition_type: 'GAME_PLAY',
    condition_target: 10,
    condition_desc: '活動期間累計遊玩 10 場',
    rewards: [
      { id: 'r1', type: 'SILVER', silver_amount: 2000 },
      { id: 'r2', type: 'GIFT_CARD', item_name: '勞動節禮物卡', item_desc: '7-11 禮物卡 200 元，限兌 1 張' }
    ],
    is_limited: true,
    scheduled_start: '2026-05-01T00:00:00Z',
    scheduled_end: '2026-05-05T23:59:59Z',
    claim_count: 0,
    created_at: '2026-04-22T15:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'ms008',
    name: '清明節活動（已過期）',
    type: 'EVENT',
    status: 'EXPIRED',
    description: '清明連假活動（已結束）',
    condition_type: 'LOGIN',
    condition_target: 3,
    condition_desc: '連假期間登入 3 天',
    rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 1000 }],
    is_limited: true,
    scheduled_start: '2026-04-03T00:00:00Z',
    scheduled_end: '2026-04-07T23:59:59Z',
    claim_count: 423,
    submitted_by: 'operator_lee', submitted_at: '2026-03-30T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-31T09:00:00Z',
    created_at: '2026-03-30T09:00:00Z', created_by: 'operator_lee'
  },

  // ── 每日簽到 ──────────────────────────────────────────────
  {
    id: 'ms009',
    name: '每日簽到禮（4 月版）',
    type: 'CHECKIN',
    status: 'ACTIVE',
    description: '每天簽到累積天數，里程碑日有額外大獎等你拿！',
    cycle_days: 30,
    daily_silver: 100,
    milestones: [
      {
        id: 'ml1', day: 5,
        rewards: [
          { id: 'r1', type: 'SILVER', silver_amount: 500 }
        ]
      },
      {
        id: 'ml2', day: 10,
        rewards: [
          { id: 'r1', type: 'SILVER', silver_amount: 1000 },
          { id: 'r2', type: 'AVATAR', item_name: '簽到達人頭像' }
        ]
      },
      {
        id: 'ml3', day: 15,
        rewards: [
          { id: 'r1', type: 'SILVER', silver_amount: 2000 },
          { id: 'r2', type: 'AVATAR_FRAME', item_name: '月半之輝頭像框' }
        ]
      },
      {
        id: 'ml4', day: 30,
        rewards: [
          { id: 'r1', type: 'SILVER', silver_amount: 10000 },
          { id: 'r2', type: 'AVATAR_FRAME', item_name: '滿月金框' },
          { id: 'r3', type: 'GIFT_CARD', item_name: '簽到滿月大禮', item_desc: '全家禮物卡 500 元，需本人到店兌換' }
        ]
      }
    ],
    is_limited: false,
    claim_count: 2341,
    submitted_by: 'operator_wang', submitted_at: '2026-03-28T10:00:00Z',
    reviewed_by: 'manager', reviewed_at: '2026-03-29T09:00:00Z',
    created_at: '2026-03-28T09:00:00Z', created_by: 'operator_wang'
  },
  {
    id: 'ms010',
    name: '端午節限定簽到（草稿）',
    type: 'CHECKIN',
    status: 'DRAFT',
    description: '端午節特別版簽到，里程碑獎勵更豐厚！',
    cycle_days: 7,
    daily_silver: 200,
    milestones: [
      {
        id: 'ml1', day: 3,
        rewards: [
          { id: 'r1', type: 'SILVER', silver_amount: 1000 },
          { id: 'r2', type: 'AVATAR', item_name: '端午粽子頭像' }
        ]
      },
      {
        id: 'ml2', day: 7,
        rewards: [
          { id: 'r1', type: 'SILVER', silver_amount: 5000 },
          { id: 'r2', type: 'AVATAR_FRAME', item_name: '端午龍舟框' },
          { id: 'r3', type: 'GIFT_CARD', item_name: '端午好禮', item_desc: '7-11 禮物卡 300 元' }
        ]
      }
    ],
    is_limited: true,
    scheduled_start: '2026-05-31T00:00:00Z',
    scheduled_end: '2026-06-08T23:59:59Z',
    claim_count: 0,
    created_at: '2026-04-22T16:00:00Z', created_by: 'operator_wang'
  }
]

// ── Claim Records ─────────────────────────────────────────────
const players = [
  { id: 'U-10045', username: 'dragon_king'    },
  { id: 'U-20891', username: 'lucky_star88'   },
  { id: 'U-55678', username: 'golden_phoenix' },
  { id: 'U-33412', username: 'night_wolf'     },
  { id: 'U-77001', username: 'crystal_blade'  },
  { id: 'U-44520', username: 'thunder_god'    }
]

let seq = 1
const cid = () => `mcr${String(seq++).padStart(4, '0')}`

export const mockMissionClaimRecords: MissionClaimRecord[] = [
  // ms001 每日登入
  { id: cid(), mission_id: 'ms001', mission_name: '每日登入',        mission_type: 'DAILY',   player_id: 'U-10045', player_username: 'dragon_king',    completed_at: '2026-04-20T00:05:00Z', claimed_at: '2026-04-20T00:05:10Z', progress: 1, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 50  }] },
  { id: cid(), mission_id: 'ms001', mission_name: '每日登入',        mission_type: 'DAILY',   player_id: 'U-20891', player_username: 'lucky_star88',   completed_at: '2026-04-20T08:30:00Z', claimed_at: '2026-04-20T08:30:10Z', progress: 1, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 50  }] },
  { id: cid(), mission_id: 'ms001', mission_name: '每日登入',        mission_type: 'DAILY',   player_id: 'U-44520', player_username: 'thunder_god',    completed_at: '2026-04-21T00:01:00Z', claimed_at: '2026-04-21T00:01:10Z', progress: 1, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 50  }] },
  // ms002 每日對戰
  { id: cid(), mission_id: 'ms002', mission_name: '每日對戰達人',    mission_type: 'DAILY',   player_id: 'U-10045', player_username: 'dragon_king',    completed_at: '2026-04-20T21:00:00Z', claimed_at: '2026-04-20T21:05:00Z', progress: 5, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 200 }] },
  { id: cid(), mission_id: 'ms002', mission_name: '每日對戰達人',    mission_type: 'DAILY',   player_id: 'U-77001', player_username: 'crystal_blade',  completed_at: '2026-04-21T22:00:00Z', claimed_at: '2026-04-21T22:10:00Z', progress: 5, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 200 }] },
  // ms003 邀請好友
  { id: cid(), mission_id: 'ms003', mission_name: '邀請好友',        mission_type: 'DAILY',   player_id: 'U-55678', player_username: 'golden_phoenix', completed_at: '2026-04-10T15:00:00Z', claimed_at: '2026-04-10T15:05:00Z', progress: 1, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 500 }, { id: 'r2', type: 'GIFT_CARD', item_name: '好友邀請禮物卡', item_desc: '全家禮物卡 50 元' }] },
  // ms006 4月儲值活動
  { id: cid(), mission_id: 'ms006', mission_name: '4 月儲值衝刺！',  mission_type: 'EVENT',   player_id: 'U-44520', player_username: 'thunder_god',    completed_at: '2026-04-18T16:00:00Z', claimed_at: '2026-04-18T16:30:00Z', progress: 5000, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 10000 }, { id: 'r2', type: 'AVATAR', item_name: '4 月限定頭像 — 金龍' }] },
  { id: cid(), mission_id: 'ms006', mission_name: '4 月儲值衝刺！',  mission_type: 'EVENT',   player_id: 'U-10045', player_username: 'dragon_king',    completed_at: '2026-04-20T10:00:00Z', claimed_at: '2026-04-20T10:15:00Z', progress: 5000, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 10000 }, { id: 'r2', type: 'AVATAR', item_name: '4 月限定頭像 — 金龍' }] },
  // ms009 簽到
  { id: cid(), mission_id: 'ms009', mission_name: '每日簽到禮（4 月版）', mission_type: 'CHECKIN', player_id: 'U-10045', player_username: 'dragon_king',    completed_at: '2026-04-15T00:01:00Z', claimed_at: '2026-04-15T00:01:30Z', progress: 15, checkin_day: 15, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 2000 }, { id: 'r2', type: 'AVATAR_FRAME', item_name: '月半之輝頭像框' }] },
  { id: cid(), mission_id: 'ms009', mission_name: '每日簽到禮（4 月版）', mission_type: 'CHECKIN', player_id: 'U-20891', player_username: 'lucky_star88',   completed_at: '2026-04-10T00:01:00Z', claimed_at: '2026-04-10T00:01:30Z', progress: 10, checkin_day: 10, rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 1000 }, { id: 'r2', type: 'AVATAR', item_name: '簽到達人頭像' }] },
  { id: cid(), mission_id: 'ms009', mission_name: '每日簽到禮（4 月版）', mission_type: 'CHECKIN', player_id: 'U-44520', player_username: 'thunder_god',    completed_at: '2026-04-05T00:01:00Z', claimed_at: '2026-04-05T00:01:30Z', progress: 5,  checkin_day: 5,  rewards: [{ id: 'r1', type: 'SILVER', silver_amount: 500 }] }
]
