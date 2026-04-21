import { ApiResponse, PaginatedResponse } from '@/types'
import { Agent, AgentSearchParams, UpdateAgentParams, CreateAgentParams, AgentCommissionConfig, AgentOperationLog, AgentStats, AgentReportRow, AgentReportParams } from '@/types/agent'
import { mockAgents, mockAgentCommissions, mockAgentOperationLogs } from '@/mocks/agent'

const SIMULATE_DELAY = 500
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const agentApi = {
  async getAgents(params: AgentSearchParams): Promise<ApiResponse<PaginatedResponse<Agent>>> {
    await delay(SIMULATE_DELAY)

    let filtered = [...mockAgents]

    if (params.q) {
      const q = params.q.toLowerCase()
      switch (params.search_type) {
        case 'uid':
          filtered = filtered.filter(a => a.uid.toLowerCase().includes(q))
          break
        case 'username':
          filtered = filtered.filter(a => a.username.toLowerCase().includes(q))
          break
        case 'promo_code':
          filtered = filtered.filter(a => a.promo_code.toLowerCase().includes(q))
          break
      }
    }

    if (params.identity) {
      filtered = filtered.filter(a => a.identity === params.identity)
    }

    if (params.status) {
      filtered = filtered.filter(a => a.status === params.status)
    }

    if (params.start_time) {
      const start = new Date(params.start_time).getTime()
      filtered = filtered.filter(a => new Date(a.created_at).getTime() >= start)
    }

    if (params.end_time) {
      const end = new Date(params.end_time).getTime()
      filtered = filtered.filter(a => new Date(a.created_at).getTime() <= end)
    }

    const total = filtered.length
    const startIdx = (params.page - 1) * params.page_size
    const endIdx = startIdx + params.page_size
    const items = filtered.slice(startIdx, endIdx)

    return {
      code: 0,
      msg: 'success',
      data: { items, total, page: params.page, pageSize: params.page_size }
    }
  },

  async getAgentById(id: string): Promise<ApiResponse<Agent>> {
    await delay(SIMULATE_DELAY)
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) return { code: 404, msg: 'Agent not found' }
    return { code: 0, msg: 'success', data: agent }
  },

  async getAgentSubAgents(agentId: string): Promise<ApiResponse<Agent[]>> {
    await delay(SIMULATE_DELAY)
    const agent = mockAgents.find(a => a.id === agentId)
    if (!agent) return { code: 404, msg: 'Agent not found' }
    // Find agents whose path directly continues from this agent's username
    const prefix = `${agent.path} > `
    const direct = mockAgents.filter(a => {
      if (a.id === agentId) return false
      // direct sub = path starts with prefix and has no additional '>' after
      if (!a.path.startsWith(prefix)) return false
      const remainder = a.path.slice(prefix.length)
      return !remainder.includes(' > ')
    })
    return { code: 0, msg: 'success', data: direct }
  },

  async getAgentOperationLogs(agentId: string): Promise<ApiResponse<AgentOperationLog[]>> {
    await delay(SIMULATE_DELAY)
    const logs = mockAgentOperationLogs.filter(l => l.agent_id === agentId)
    return { code: 0, msg: 'success', data: logs }
  },

  async getAgentStats(agentId: string): Promise<ApiResponse<AgentStats>> {
    await delay(SIMULATE_DELAY)
    const agent = mockAgents.find(a => a.id === agentId)
    if (!agent) return { code: 404, msg: 'Agent not found' }

    // Generate deterministic-ish mock stats based on agent id
    const seed = parseInt(agentId) * 137
    const totalDeposit  = Math.round((seed * 1234 % 500000) + 10000)
    const totalWithdraw = Math.round(totalDeposit * 0.72)
    const netDeposit    = totalDeposit - totalWithdraw
    const turnover      = Math.round(totalDeposit * 3.4)
    const platformWin   = Math.round(netDeposit * 0.18)
    const commDue       = Math.round(platformWin * (agent.deposit_commission_rate / 100))
    const commPaid      = Math.round(commDue * 0.6)

    const stats: AgentStats = {
      total_players:     agent.direct_player_count + agent.sub_agent_count * 20,
      active_players:    Math.round((agent.direct_player_count + agent.sub_agent_count * 20) * 0.6),
      new_players:       Math.round((agent.direct_player_count) * 0.15),
      total_deposit:     totalDeposit,
      total_withdrawal:  totalWithdraw,
      net_deposit:       netDeposit,
      valid_turnover:    turnover,
      platform_win:      platformWin,
      commission_due:    commDue,
      commission_paid:   commPaid,
      commission_pending: commDue - commPaid
    }
    return { code: 0, msg: 'success', data: stats }
  },

  async getAgentCommission(agentId: string): Promise<ApiResponse<AgentCommissionConfig>> {
    await delay(SIMULATE_DELAY)
    const config = mockAgentCommissions.find(c => c.agent_id === agentId)
    if (!config) return { code: 404, msg: 'Commission config not found' }
    return { code: 0, msg: 'success', data: { ...config } }
  },

  async updateAgentCommission(agentId: string, payload: Partial<AgentCommissionConfig>): Promise<ApiResponse<void>> {
    await delay(SIMULATE_DELAY)
    const idx = mockAgentCommissions.findIndex(c => c.agent_id === agentId)
    if (idx === -1) {
      mockAgentCommissions.push({ agent_id: agentId, settlement_cycle: 'MONTHLY', settlement_day: 1, commission_rate: 0, promotion_share: 0, fee_share: 0, updated_at: new Date().toISOString(), updated_by: 'admin', ...payload })
    } else {
      Object.assign(mockAgentCommissions[idx], { ...payload, updated_at: new Date().toISOString() })
    }
    return { code: 0, msg: 'success' }
  },

  async getAgentReport(params: AgentReportParams): Promise<ApiResponse<PaginatedResponse<AgentReportRow>>> {
    await delay(SIMULATE_DELAY)

    let rows: AgentReportRow[] = mockAgents
      .filter(a => a.identity !== 'ADMIN')
      .map(a => {
        const seed = parseInt(a.id) * 137
        const totalDeposit  = Math.round((seed * 1234 % 300000) + 5000)
        const totalWithdraw = Math.round(totalDeposit * 0.72)
        const turnover      = Math.round(totalDeposit * 3.4)
        const platformWin   = Math.round((totalDeposit - totalWithdraw) * 0.18)
        const commDue       = Math.round(platformWin * (a.deposit_commission_rate / 100))
        return {
          agent_id:       a.id,
          agent_uid:      a.uid,
          agent_username: a.username,
          identity:       a.identity,
          path:           a.path,
          total_players:  a.direct_player_count,
          total_deposit:  totalDeposit,
          total_withdrawal: totalWithdraw,
          valid_turnover:   turnover,
          platform_win:     platformWin,
          commission_due:   commDue
        }
      })

    if (params.identity) {
      rows = rows.filter(r => r.identity === params.identity)
    }

    const total = rows.length
    const startIdx = (params.page - 1) * params.page_size
    const items = rows.slice(startIdx, startIdx + params.page_size)
    return {
      code: 0, msg: 'success',
      data: { items, total, page: params.page, pageSize: params.page_size }
    }
  },

  async createAgent(params: CreateAgentParams): Promise<ApiResponse<Agent>> {
    await delay(SIMULATE_DELAY)
    const newAgent: Agent = {
      ...params,
      id: (mockAgents.length + 1).toString(),
      uid: (10000 + mockAgents.length + 1).toString(),
      path: `平台 > ${params.username}`,
      commission_wallet: 0,
      promo_wallet: 0,
      sub_agent_count: 0,
      direct_player_count: 0,
      created_at: new Date().toISOString()
    }
    mockAgents.unshift(newAgent)
    return { code: 0, msg: 'success', data: newAgent }
  },

  async updateAgent(params: UpdateAgentParams): Promise<ApiResponse<void>> {
    await delay(SIMULATE_DELAY)
    const index = mockAgents.findIndex(a => a.id === params.id)
    if (index === -1) return { code: 404, msg: 'Agent not found' }

    console.log(`[Audit] Update Agent ${params.id}:`, params, `Reason: ${params.change_reason}`)
    mockAgents[index] = { ...mockAgents[index], ...params }
    return { code: 0, msg: 'success' }
  },

  async toggleStatus(id: string, status: string): Promise<ApiResponse<void>> {
    await delay(SIMULATE_DELAY)
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) return { code: 404, msg: 'Agent not found' }
    agent.status = status as any
    console.log(`[Audit] Toggle Status ${id} -> ${status}`)
    return { code: 0, msg: 'success' }
  },

  async adjustPromoWallet(id: string, amount: number, reason: string): Promise<ApiResponse<void>> {
    await delay(SIMULATE_DELAY)
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) return { code: 404, msg: 'Agent not found' }
    agent.promo_wallet += amount
    console.log(`[Audit] Adjust Promo Wallet ${id}: ${amount}. Reason: ${reason}`)
    return { code: 0, msg: 'success' }
  }
}
