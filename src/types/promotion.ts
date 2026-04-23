export type PromotionType =
  | 'FIRST_DEPOSIT'
  | 'DEPOSIT'
  | 'WEB_DEPOSIT'
  | 'DAILY_CHECKIN'
  | 'PHONE_BINDING'
  | 'VIP_UPGRADE'

export type PromotionStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'SCHEDULED'
  | 'EXPIRED'

// For tier-based promotions (FIRST_DEPOSIT, DEPOSIT, WEB_DEPOSIT)
export interface DepositTier {
  id: string
  min_deposit: number   // gold coins required
  reward_silver: number // silver coins rewarded
}

export interface Promotion {
  id: string
  name: string
  type: PromotionType
  status: PromotionStatus
  description?: string

  // Tier-based (FIRST_DEPOSIT / DEPOSIT / WEB_DEPOSIT)
  tiers?: DepositTier[]

  // Flat-reward (DAILY_CHECKIN / PHONE_BINDING / VIP_UPGRADE)
  reward_silver?: number
  target_vip_level?: number  // VIP_UPGRADE only

  // Limits
  max_claims_per_user: number  // -1 = unlimited

  // Schedule / time-limited event
  is_limited: boolean
  scheduled_start?: string
  scheduled_end?: string

  // Workflow
  submitted_by?: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
  created_at: string
  created_by: string
}

export interface PromotionClaimRecord {
  id: string
  promotion_id: string
  promotion_name: string
  promotion_type: PromotionType
  player_id: string
  player_username: string
  claimed_at: string
  reward_silver: number
  trigger_deposit?: number  // gold amount that triggered (tier-based only)
  platform?: 'APP' | 'WEB'
}

// ── Config lookups ────────────────────────────────────────────

export const PROMOTION_TYPE_CONFIG: Record<PromotionType, { label: string; isTier: boolean }> = {
  FIRST_DEPOSIT: { label: '首儲優惠',     isTier: true  },
  DEPOSIT:       { label: '儲值優惠',     isTier: true  },
  WEB_DEPOSIT:   { label: '官網儲值引導', isTier: true  },
  DAILY_CHECKIN: { label: '簽到送禮',     isTier: false },
  PHONE_BINDING: { label: '手機綁定',     isTier: false },
  VIP_UPGRADE:   { label: 'VIP 升級禮',  isTier: false }
}

export const PROMOTION_STATUS_CONFIG: Record<PromotionStatus, {
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
