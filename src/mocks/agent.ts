import type { Agent, AgentCommissionConfig, AgentOperationLog } from '@/types/agent'

export const mockAgents: Agent[] = [
  // ── 總代理 (MASTER) ──────────────────────────────────────
  {
    id: '1',
    uid: '10001',
    username: 'master_wang',
    identity: 'MASTER',
    promo_code: 'PC888',
    path: '平台 > master_wang',
    cpa_price_matrix: [
      { level: 1, member_count: 10, price: 10 },
      { level: 2, member_count: 50, price: 15 },
      { level: 3, member_count: 100, price: 25 }
    ],
    deposit_commission_rate: 15,
    commission_wallet: 18500.50,
    promo_wallet: 5000,
    sub_agent_count: 3,
    direct_player_count: 120,
    created_at: '2026-01-01T10:00:00Z',
    status: 'NORMAL',
    name: '王大明',
    phone: '0912345678',
    contact_info: 'WeChat: wdming88',
    data_binding_threshold: { phone: true },
    deposit_threshold: 100,
    flow_threshold: 500,
    sensitive_data_permission: true,
    remark: '重點發展大型代理',
    two_fa_enabled: true
  },
  {
    id: '2',
    uid: '10002',
    username: 'master_chen',
    identity: 'MASTER',
    promo_code: 'CHEN99',
    path: '平台 > master_chen',
    cpa_price_matrix: [
      { level: 1, member_count: 10, price: 12 },
      { level: 2, member_count: 40, price: 18 },
      { level: 3, member_count: 80, price: 28 }
    ],
    deposit_commission_rate: 18,
    commission_wallet: 9200.00,
    promo_wallet: 3500,
    sub_agent_count: 2,
    direct_player_count: 85,
    created_at: '2026-01-15T08:30:00Z',
    status: 'NORMAL',
    name: '陳建國',
    phone: '0921111222',
    contact_info: 'Telegram: @chen_master',
    data_binding_threshold: { phone: true },
    deposit_threshold: 200,
    flow_threshold: 1000,
    sensitive_data_permission: true,
    remark: '',
    two_fa_enabled: false
  },
  {
    id: '3',
    uid: '10003',
    username: 'master_lin',
    identity: 'MASTER',
    promo_code: 'LINVIP',
    path: '平台 > master_lin',
    cpa_price_matrix: [
      { level: 1, member_count: 5, price: 8 },
      { level: 2, member_count: 30, price: 14 },
      { level: 3, member_count: 60, price: 22 }
    ],
    deposit_commission_rate: 12,
    commission_wallet: 4150.75,
    promo_wallet: 2000,
    sub_agent_count: 2,
    direct_player_count: 60,
    created_at: '2026-02-01T11:00:00Z',
    status: 'FROZEN',
    name: '林小榮',
    phone: '0933444555',
    contact_info: 'Line: linrong001',
    data_binding_threshold: { phone: false },
    deposit_threshold: 50,
    flow_threshold: 200,
    sensitive_data_permission: false,
    remark: '帳戶暫時凍結審查中',
    two_fa_enabled: true
  },

  // ── 子代理 (SUB) under master_wang ──────────────────────
  {
    id: '4',
    uid: '20001',
    username: 'sub_alpha',
    identity: 'SUB',
    promo_code: 'ALPHA01',
    path: '平台 > master_wang > sub_alpha',
    cpa_price_matrix: [
      { level: 1, member_count: 5, price: 8 },
      { level: 2, member_count: 20, price: 12 },
      { level: 3, member_count: 50, price: 18 }
    ],
    deposit_commission_rate: 10,
    commission_wallet: 3250.75,
    promo_wallet: 1000,
    sub_agent_count: 2,
    direct_player_count: 45,
    created_at: '2026-02-15T14:30:00Z',
    status: 'NORMAL',
    name: '陳小華',
    phone: '0987654321',
    contact_info: 'Telegram: @alpha_ch',
    data_binding_threshold: { phone: false },
    deposit_threshold: 50,
    flow_threshold: 200,
    sensitive_data_permission: false,
    remark: '',
    two_fa_enabled: false
  },
  {
    id: '5',
    uid: '20002',
    username: 'sub_beta',
    identity: 'SUB',
    promo_code: 'BETA02',
    path: '平台 > master_wang > sub_beta',
    cpa_price_matrix: [
      { level: 1, member_count: 5, price: 7 },
      { level: 2, member_count: 15, price: 11 },
      { level: 3, member_count: 40, price: 16 }
    ],
    deposit_commission_rate: 8,
    commission_wallet: 1120.00,
    promo_wallet: 500,
    sub_agent_count: 1,
    direct_player_count: 28,
    created_at: '2026-02-20T09:15:00Z',
    status: 'NORMAL',
    name: '張美玲',
    phone: '0955123456',
    contact_info: 'WeChat: meilingz',
    data_binding_threshold: { phone: true },
    deposit_threshold: 30,
    flow_threshold: 100,
    sensitive_data_permission: false,
    remark: '',
    two_fa_enabled: false
  },
  {
    id: '6',
    uid: '20003',
    username: 'sub_gamma',
    identity: 'SUB',
    promo_code: 'GAMMA03',
    path: '平台 > master_wang > sub_gamma',
    cpa_price_matrix: [
      { level: 1, member_count: 5, price: 9 },
      { level: 2, member_count: 25, price: 13 },
      { level: 3, member_count: 60, price: 19 }
    ],
    deposit_commission_rate: 11,
    commission_wallet: 2480.50,
    promo_wallet: 800,
    sub_agent_count: 0,
    direct_player_count: 35,
    created_at: '2026-03-01T13:00:00Z',
    status: 'LOCKED',
    name: '李勇志',
    phone: '0966777888',
    contact_info: 'Email: gamma@test.com',
    data_binding_threshold: { phone: false },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: false,
    remark: '帳號異常鎖定',
    two_fa_enabled: false
  },

  // ── 子代理 (SUB) under master_chen ──────────────────────
  {
    id: '7',
    uid: '20004',
    username: 'sub_delta',
    identity: 'SUB',
    promo_code: 'DELT04',
    path: '平台 > master_chen > sub_delta',
    cpa_price_matrix: [
      { level: 1, member_count: 8, price: 10 },
      { level: 2, member_count: 30, price: 15 },
      { level: 3, member_count: 70, price: 22 }
    ],
    deposit_commission_rate: 12,
    commission_wallet: 5600.00,
    promo_wallet: 2000,
    sub_agent_count: 1,
    direct_player_count: 55,
    created_at: '2026-02-10T10:20:00Z',
    status: 'NORMAL',
    name: '吳小豪',
    phone: '0900234567',
    contact_info: 'Line: haohao99',
    data_binding_threshold: { phone: true },
    deposit_threshold: 100,
    flow_threshold: 500,
    sensitive_data_permission: false,
    remark: '',
    two_fa_enabled: true
  },
  {
    id: '8',
    uid: '20005',
    username: 'sub_epsilon',
    identity: 'SUB',
    promo_code: 'EPSI05',
    path: '平台 > master_chen > sub_epsilon',
    cpa_price_matrix: [
      { level: 1, member_count: 5, price: 8 },
      { level: 2, member_count: 20, price: 13 },
      { level: 3, member_count: 50, price: 20 }
    ],
    deposit_commission_rate: 9,
    commission_wallet: 780.25,
    promo_wallet: 300,
    sub_agent_count: 0,
    direct_player_count: 18,
    created_at: '2026-03-05T08:00:00Z',
    status: 'NORMAL',
    name: '黃淑芬',
    phone: '0912000111',
    contact_info: 'Telegram: @shufenH',
    data_binding_threshold: { phone: false },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: false,
    remark: '',
    two_fa_enabled: false
  },

  // ── 子代理 (SUB) under master_lin ──────────────────────
  {
    id: '9',
    uid: '20006',
    username: 'sub_zeta',
    identity: 'SUB',
    promo_code: 'ZETA06',
    path: '平台 > master_lin > sub_zeta',
    cpa_price_matrix: [
      { level: 1, member_count: 3, price: 6 },
      { level: 2, member_count: 15, price: 10 },
      { level: 3, member_count: 30, price: 15 }
    ],
    deposit_commission_rate: 7,
    commission_wallet: 450.00,
    promo_wallet: 200,
    sub_agent_count: 0,
    direct_player_count: 22,
    created_at: '2026-02-25T16:00:00Z',
    status: 'DISABLED',
    name: '趙文強',
    phone: '0956789012',
    contact_info: '',
    data_binding_threshold: { phone: false },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: false,
    remark: '跟隨上級凍結一並停用',
    two_fa_enabled: false
  },

  // ── 助手 (ASSISTANT) ────────────────────────────────────
  {
    id: '10',
    uid: '30001',
    username: 'asst_wang_01',
    identity: 'ASSISTANT',
    promo_code: 'AWANG1',
    path: '平台 > master_wang > asst_wang_01',
    cpa_price_matrix: [
      { level: 1, member_count: 0, price: 0 },
      { level: 2, member_count: 0, price: 0 },
      { level: 3, member_count: 0, price: 0 }
    ],
    deposit_commission_rate: 5,
    commission_wallet: 200.00,
    promo_wallet: 0,
    sub_agent_count: 0,
    direct_player_count: 8,
    created_at: '2026-03-10T09:30:00Z',
    status: 'NORMAL',
    name: '許助理',
    phone: '0922333444',
    contact_info: 'Line: asst_hsu',
    data_binding_threshold: { phone: false },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: false,
    remark: 'master_wang 的業務助手',
    two_fa_enabled: false
  },
  {
    id: '11',
    uid: '30002',
    username: 'asst_alpha_01',
    identity: 'ASSISTANT',
    promo_code: 'AALT01',
    path: '平台 > master_wang > sub_alpha > asst_alpha_01',
    cpa_price_matrix: [
      { level: 1, member_count: 0, price: 0 },
      { level: 2, member_count: 0, price: 0 },
      { level: 3, member_count: 0, price: 0 }
    ],
    deposit_commission_rate: 4,
    commission_wallet: 90.50,
    promo_wallet: 0,
    sub_agent_count: 0,
    direct_player_count: 5,
    created_at: '2026-03-15T11:00:00Z',
    status: 'NORMAL',
    name: '劉小助',
    phone: '0933555666',
    contact_info: '',
    data_binding_threshold: { phone: false },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: false,
    remark: '',
    two_fa_enabled: false
  },
  {
    id: '12',
    uid: '30003',
    username: 'asst_beta_01',
    identity: 'ASSISTANT',
    promo_code: 'ABETA1',
    path: '平台 > master_wang > sub_beta > asst_beta_01',
    cpa_price_matrix: [
      { level: 1, member_count: 0, price: 0 },
      { level: 2, member_count: 0, price: 0 },
      { level: 3, member_count: 0, price: 0 }
    ],
    deposit_commission_rate: 4,
    commission_wallet: 55.00,
    promo_wallet: 0,
    sub_agent_count: 0,
    direct_player_count: 3,
    created_at: '2026-03-20T14:00:00Z',
    status: 'NORMAL',
    name: '鄭阿助',
    phone: '0944666777',
    contact_info: 'WeChat: asst_zheng',
    data_binding_threshold: { phone: false },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: false,
    remark: '',
    two_fa_enabled: false
  },
  {
    id: '13',
    uid: '30004',
    username: 'asst_delta_01',
    identity: 'ASSISTANT',
    promo_code: 'ADLT01',
    path: '平台 > master_chen > sub_delta > asst_delta_01',
    cpa_price_matrix: [
      { level: 1, member_count: 0, price: 0 },
      { level: 2, member_count: 0, price: 0 },
      { level: 3, member_count: 0, price: 0 }
    ],
    deposit_commission_rate: 5,
    commission_wallet: 310.00,
    promo_wallet: 0,
    sub_agent_count: 0,
    direct_player_count: 12,
    created_at: '2026-03-12T10:00:00Z',
    status: 'NORMAL',
    name: '曾志豪',
    phone: '0911222333',
    contact_info: 'Line: zeng_asst',
    data_binding_threshold: { phone: true },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: false,
    remark: '',
    two_fa_enabled: false
  },

  // ── 後台管理員 (ADMIN) ────────────────────────────────────
  {
    id: '14',
    uid: '10003',
    username: 'admin_ops_01',
    identity: 'ADMIN',
    promo_code: 'ADMXP',
    path: '平台 > admin_ops_01',
    cpa_price_matrix: [
      { level: 1, member_count: 0, price: 0 },
      { level: 2, member_count: 0, price: 0 },
      { level: 3, member_count: 0, price: 0 }
    ],
    deposit_commission_rate: 20,
    commission_wallet: 12500,
    promo_wallet: 0,
    sub_agent_count: 20,
    direct_player_count: 500,
    created_at: '2025-12-01T09:00:00Z',
    status: 'NORMAL',
    name: '林管理',
    phone: '0900111222',
    contact_info: 'Email: admin@test.com',
    data_binding_threshold: { phone: true },
    deposit_threshold: 0,
    flow_threshold: 0,
    sensitive_data_permission: true,
    remark: '內部管理測試用',
    two_fa_enabled: true
  }
]

export const mockAgentCommissions: AgentCommissionConfig[] = [
  { agent_id: '1',  settlement_cycle: 'WEEKLY',  settlement_day: 1, commission_rate: 15, promotion_share: 5,  fee_share: 2, updated_at: '2026-03-01T10:00:00Z', updated_by: 'admin' },
  { agent_id: '2',  settlement_cycle: 'MONTHLY', settlement_day: 5, commission_rate: 18, promotion_share: 6,  fee_share: 3, updated_at: '2026-03-10T11:00:00Z', updated_by: 'admin' },
  { agent_id: '3',  settlement_cycle: 'WEEKLY',  settlement_day: 5, commission_rate: 12, promotion_share: 4,  fee_share: 2, updated_at: '2026-02-20T09:00:00Z', updated_by: 'admin' },
  { agent_id: '4',  settlement_cycle: 'MONTHLY', settlement_day: 1, commission_rate: 10, promotion_share: 3,  fee_share: 1, updated_at: '2026-03-05T14:00:00Z', updated_by: 'admin' },
  { agent_id: '5',  settlement_cycle: 'MONTHLY', settlement_day: 1, commission_rate: 8,  promotion_share: 2,  fee_share: 1, updated_at: '2026-03-05T14:00:00Z', updated_by: 'admin' },
  { agent_id: '6',  settlement_cycle: 'WEEKLY',  settlement_day: 3, commission_rate: 11, promotion_share: 3,  fee_share: 2, updated_at: '2026-03-08T10:00:00Z', updated_by: 'admin' },
  { agent_id: '7',  settlement_cycle: 'MONTHLY', settlement_day: 10,commission_rate: 12, promotion_share: 4,  fee_share: 2, updated_at: '2026-03-02T16:00:00Z', updated_by: 'admin' },
  { agent_id: '8',  settlement_cycle: 'MONTHLY', settlement_day: 10,commission_rate: 9,  promotion_share: 2,  fee_share: 1, updated_at: '2026-03-06T09:00:00Z', updated_by: 'admin' },
  { agent_id: '9',  settlement_cycle: 'WEEKLY',  settlement_day: 7, commission_rate: 7,  promotion_share: 2,  fee_share: 1, updated_at: '2026-02-28T11:00:00Z', updated_by: 'admin' },
  { agent_id: '10', settlement_cycle: 'MONTHLY', settlement_day: 1, commission_rate: 5,  promotion_share: 1,  fee_share: 0, updated_at: '2026-03-15T10:00:00Z', updated_by: 'admin' },
  { agent_id: '11', settlement_cycle: 'MONTHLY', settlement_day: 1, commission_rate: 4,  promotion_share: 1,  fee_share: 0, updated_at: '2026-03-15T10:00:00Z', updated_by: 'admin' },
  { agent_id: '12', settlement_cycle: 'MONTHLY', settlement_day: 1, commission_rate: 4,  promotion_share: 1,  fee_share: 0, updated_at: '2026-03-20T14:00:00Z', updated_by: 'admin' },
  { agent_id: '13', settlement_cycle: 'MONTHLY', settlement_day: 1, commission_rate: 5,  promotion_share: 1,  fee_share: 0, updated_at: '2026-03-12T10:00:00Z', updated_by: 'admin' },
  { agent_id: '14', settlement_cycle: 'CUSTOM',  settlement_day: 15,commission_rate: 20, promotion_share: 8,  fee_share: 4, updated_at: '2026-01-01T00:00:00Z', updated_by: 'system' }
]

const ACTIONS = [
  { action: '更新佣金設定', detail: '將抽成比調整為 15%，結算週期改為每週' },
  { action: '修改帳號資料', detail: '更新聯絡方式及備註欄位' },
  { action: '調整推廣金', detail: '增加推廣金 $500，原因：季度獎勵' },
  { action: '凍結帳戶', detail: '因異常充值行為啟動凍結程序' },
  { action: '解除凍結', detail: '審查通過，恢復正常狀態' },
  { action: '重置密碼', detail: '應代理要求重置登入密碼' },
  { action: '新增下線代理', detail: '新增子代理帳號 sub_new_01' },
  { action: '開啟 2FA', detail: '啟用二階段驗證' },
  { action: 'CPA 矩陣調整', detail: '級距 2 人數門檻由 20 調整為 30' }
]

let logIdSeq = 1
function genLogs(agentId: string, count: number): AgentOperationLog[] {
  const logs: AgentOperationLog[] = []
  const now = new Date('2026-04-01').getTime()
  for (let i = 0; i < count; i++) {
    const act = ACTIONS[(logIdSeq + i) % ACTIONS.length]
    logs.push({
      id: `log_${String(logIdSeq++).padStart(4, '0')}`,
      agent_id: agentId,
      timestamp: new Date(now - i * 86400000 * 2).toISOString(),
      operator: i % 3 === 0 ? 'admin_ops_01' : i % 3 === 1 ? 'admin' : 'system',
      action: act.action,
      detail: act.detail,
      result: i % 7 === 0 ? 'FAILED' : 'SUCCESS'
    })
  }
  return logs
}

export const mockAgentOperationLogs: AgentOperationLog[] = [
  ...genLogs('1', 8),
  ...genLogs('2', 5),
  ...genLogs('3', 6),
  ...genLogs('4', 4),
  ...genLogs('5', 3),
  ...genLogs('6', 4),
  ...genLogs('7', 3),
  ...genLogs('8', 2),
  ...genLogs('14', 7)
]
