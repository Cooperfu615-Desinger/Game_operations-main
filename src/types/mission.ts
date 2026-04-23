export type MissionType   = 'DAILY' | 'EVENT' | 'CHECKIN'
export type MissionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED'
export type ConditionType = 'LOGIN' | 'GAME_PLAY' | 'DEPOSIT_COUNT' | 'DEPOSIT_AMOUNT' | 'INVITE_FRIEND' | 'CUSTOM'
export type RewardType    = 'SILVER' | 'AVATAR' | 'AVATAR_FRAME' | 'GIFT_CARD'

// ── Reward ────────────────────────────────────────────────────
export interface MissionReward {
  id: string
  type: RewardType
  silver_amount?: number  // SILVER only
  item_name?: string      // AVATAR / AVATAR_FRAME / GIFT_CARD
  item_desc?: string      // GIFT_CARD text description, e.g. "7-11 禮物卡 100 元"
}

// ── Check-in milestone ────────────────────────────────────────
export interface CheckinMilestone {
  id: string
  day: number
  rewards: MissionReward[]
}

// ── Mission ───────────────────────────────────────────────────
export interface Mission {
  id: string
  name: string
  type: MissionType
  status: MissionStatus
  description?: string

  // DAILY / EVENT — condition
  condition_type?: ConditionType
  condition_target?: number   // e.g. 5 (play 5 games)
  condition_desc?: string     // human-readable label

  // DAILY / EVENT — reward (single reward bundle per completion)
  rewards?: MissionReward[]

  // CHECKIN — specific fields
  cycle_days?: number         // total days in cycle, e.g. 30
  daily_silver?: number       // base silver every day
  milestones?: CheckinMilestone[]

  // EVENT — time range
  is_limited: boolean
  scheduled_start?: string
  scheduled_end?: string

  // Stats
  claim_count: number

  // Workflow
  submitted_by?: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
  created_at: string
  created_by: string
}

// ── Claim record ──────────────────────────────────────────────
export interface MissionClaimRecord {
  id: string
  mission_id: string
  mission_name: string
  mission_type: MissionType
  player_id: string
  player_username: string
  completed_at: string
  claimed_at: string
  progress?: number       // current progress value
  rewards: MissionReward[]
  checkin_day?: number    // for CHECKIN milestone claims
}

// ── Config lookups ────────────────────────────────────────────
export const MISSION_TYPE_CONFIG: Record<MissionType, { label: string; color: string }> = {
  DAILY:   { label: '每日任務', color: 'info'    },
  EVENT:   { label: '活動任務', color: 'warning' },
  CHECKIN: { label: '每日簽到', color: 'success' }
}

export const CONDITION_TYPE_CONFIG: Record<ConditionType, { label: string; unit: string }> = {
  LOGIN:          { label: '每日登入',   unit: '次'  },
  GAME_PLAY:      { label: '遊玩場次',   unit: '場'  },
  DEPOSIT_COUNT:  { label: '儲值次數',   unit: '次'  },
  DEPOSIT_AMOUNT: { label: '儲值金額',   unit: '金幣' },
  INVITE_FRIEND:  { label: '邀請好友',   unit: '人'  },
  CUSTOM:         { label: '自定義條件', unit: ''    }
}

export const REWARD_TYPE_CONFIG: Record<RewardType, { label: string; icon: string }> = {
  SILVER:       { label: '銀幣',   icon: '🪙' },
  AVATAR:       { label: '頭像',   icon: '🖼️' },
  AVATAR_FRAME: { label: '頭像框', icon: '🔲' },
  GIFT_CARD:    { label: '禮物卡', icon: '🎁' }
}

export const MISSION_STATUS_CONFIG: Record<MissionStatus, {
  label: string
  type: 'default' | 'warning' | 'success' | 'error' | 'info'
}> = {
  DRAFT:     { label: '草稿',   type: 'default'  },
  PENDING:   { label: '待審核', type: 'warning'  },
  APPROVED:  { label: '已核准', type: 'success'  },
  REJECTED:  { label: '已拒絕', type: 'error'    },
  ACTIVE:    { label: '上線中', type: 'success'  },
  SCHEDULED: { label: '排程中', type: 'info'     },
  EXPIRED:   { label: '已過期', type: 'default'  }
}
