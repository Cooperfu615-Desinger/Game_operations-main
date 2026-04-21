export type AgentIdentity = 'ADMIN' | 'MASTER' | 'SUB' | 'ASSISTANT'
export type AgentStatus = 'NORMAL' | 'LOCKED' | 'FROZEN' | 'DISABLED'
export type SettlementCycle = 'WEEKLY' | 'MONTHLY' | 'CUSTOM'

export interface CPAMatrix {
  level: number // Level 1, 2, 3
  member_count: number // Number of members required for this level
  price: number // Price per member at this level
}

export interface Agent {
  id: string
  uid: string
  username: string
  identity: AgentIdentity
  promo_code: string
  path: string
  cpa_price_matrix: CPAMatrix[]
  deposit_commission_rate: number
  commission_wallet: number
  promo_wallet: number
  sub_agent_count: number
  direct_player_count: number
  created_at: string
  status: AgentStatus
  
  // Detail info
  name: string
  phone: string
  contact_info: string
  data_binding_threshold: {
    phone: boolean
  }
  deposit_threshold: number
  flow_threshold: number
  sensitive_data_permission: boolean
  remark: string
  two_fa_enabled: boolean
}

export interface AgentSearchParams {
  q?: string
  search_type: 'username' | 'uid' | 'promo_code'
  identity?: AgentIdentity
  status?: AgentStatus
  start_time?: string
  end_time?: string
  page: number
  page_size: number
}

export interface UpdateAgentParams extends Partial<Omit<Agent, 'id' | 'uid' | 'username' | 'promo_code' | 'path' | 'created_at'>> {
  id: string
  password?: string
  change_reason: string
}

export interface CreateAgentParams extends Omit<Agent, 'id' | 'uid' | 'path' | 'created_at' | 'sub_agent_count' | 'direct_player_count' | 'commission_wallet' | 'promo_wallet'> {
  password: string
}

export interface AgentCommissionConfig {
  agent_id: string
  settlement_cycle: SettlementCycle
  settlement_day: number          // 結算日: 1-7 for WEEKLY, 1-28 for MONTHLY
  commission_rate: number         // 抽成比(%) 代理需回繳給平台的比例
  promotion_share: number         // 優惠佔比(%)
  fee_share: number               // 手續費佔比(%)
  updated_at: string
  updated_by: string
}

export interface AgentOperationLog {
  id: string
  agent_id: string
  timestamp: string
  operator: string                // 操作人
  action: string                  // 操作類型
  detail: string                  // 操作詳情
  result: 'SUCCESS' | 'FAILED'
}

export interface AgentStats {
  total_players: number
  active_players: number
  new_players: number
  total_deposit: number
  total_withdrawal: number
  net_deposit: number
  valid_turnover: number
  platform_win: number
  commission_due: number
  commission_paid: number
  commission_pending: number
}

export interface AgentReportRow {
  agent_id: string
  agent_uid: string
  agent_username: string
  identity: AgentIdentity
  path: string
  total_players: number
  total_deposit: number
  total_withdrawal: number
  valid_turnover: number
  platform_win: number
  commission_due: number
}

export interface AgentReportParams {
  date_start?: string
  date_end?: string
  agent_ids?: string[]
  identity?: AgentIdentity
  page: number
  page_size: number
}
