import { GameLog, GameSearchParams, GameReportStatus, ProviderType } from '@/types/game'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Provider metadata
const providerMeta: Record<string, { type: ProviderType; games: string[] }> = {
    PG:        { type: 'SLOT',    games: ['Mahjong Ways 2', 'Lucky Neko', 'Treasures of Aztec', 'Wild Bandito'] },
    JILI:      { type: 'SLOT',    games: ['Super Ace', 'Golden Empire', 'Boxing King', 'Charge Buffalo'] },
    EVOLUTION: { type: 'LIVE',    games: ['Crazy Time', 'Lightning Roulette', 'Baccarat A', 'Dragon Tiger'] },
    PP:        { type: 'SLOT',    games: ['Gates of Olympus', 'Sweet Bonanza', 'Big Bass Bonanza'] },
    JDB:       { type: 'SLOT',    games: ['Birds Party', 'Dragon Master', 'Lucky Tiger'] },
    SABA:      { type: 'SPORTS',  games: ['Football', 'Basketball', 'Baseball', 'Tennis'] },
    KY:        { type: 'SLOT',    games: ['Fishing War', 'Ocean King', 'Crab King'] },
}
const providerKeys = Object.keys(providerMeta)

// Weighted provider selection (SLOT heaviest, SPORTS/LIVE lighter)
const providerWeights = [30, 25, 15, 15, 5, 5, 5] // PG JILI EVO PP JDB SABA KY

function weightedProvider(): string {
    const total = providerWeights.reduce((s, w) => s + w, 0)
    let r = Math.random() * total
    for (let i = 0; i < providerKeys.length; i++) {
        r -= providerWeights[i]
        if (r <= 0) return providerKeys[i]
    }
    return providerKeys[0]
}

export const mockGameLogs: GameLog[] = []

const generateMockLogs = () => {
    // Generate 500 logs covering 30 days (to yesterday)
    const now = new Date()
    // Cap at end of yesterday to enforce "data up to yesterday"
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime() - 1

    for (let i = 0; i < 500; i++) {
        const provKey = weightedProvider()
        const meta = providerMeta[provKey]
        const gameName = meta.games[Math.floor(Math.random() * meta.games.length)]

        const isVoid = Math.random() < 0.04
        const isFreeSpin = Math.random() < 0.08

        // LIVE / SPORTS tend to have higher bets
        const betBase = meta.type === 'LIVE' ? 500 : meta.type === 'SPORTS' ? 300 : 100
        const bet = isFreeSpin ? 0 : Math.floor(Math.random() * betBase * 5) + betBase

        let win = 0
        if (!isVoid && Math.random() > 0.55) {
            const multiplier = meta.type === 'LIVE' ? 2.5 : meta.type === 'SPORTS' ? 1.9 : 4
            win = Math.floor(bet * (Math.random() * multiplier))
        }

        let status: GameReportStatus = 'SETTLED'
        if (isVoid) status = 'void'

        let net = win - bet
        let validTurnover = bet
        if (status === 'void') { win = 0; net = 0; validTurnover = 0 }

        // Spread across last 30 days (all before today)
        const timeOffset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) + 24 * 60 * 60 * 1000
        const settleTime = new Date(endOfYesterday - timeOffset)
        const createTime = new Date(settleTime.getTime() - (Math.floor(Math.random() * 300000) + 1000))

        const uid = `GID_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        const playerId = `P${10000 + Math.floor(Math.random() * 30)}`  // 30 players

        mockGameLogs.push({
            id: uid,
            provider_id: provKey,
            provider_round_id: `R_${Math.random().toString(36).substr(2, 12)}`,
            game_name: gameName,
            game_type: meta.type,
            player_id: playerId,
            bet_amount: bet,
            win_amount: win,
            net_amount: net,
            valid_turnover: validTurnover,
            settle_time: settleTime.toISOString(),
            create_time: createTime.toISOString(),
            status,
            raw_json: JSON.stringify({ transaction_id: uid, vendor: provKey, game: gameName, user: playerId, amount_bet: bet, amount_win: win, status, ts: settleTime.getTime() }),
            currency: 'SILVER'
        })
    }
    mockGameLogs.sort((a, b) => new Date(b.settle_time).getTime() - new Date(a.settle_time).getTime())
}

generateMockLogs()

export const gameApi = {
    getLogs: async (params: GameSearchParams): Promise<{ code: number; msg: string; data: { list: GameLog[]; total: number } }> => {
        await delay(300)

        let logs = [...mockGameLogs]

        // Filtering
        if (params.player_id) {
            logs = logs.filter(l => l.player_id.includes(params.player_id!))
        }
        if (params.provider) {
            logs = logs.filter(l => l.provider_id === params.provider)
        }
        if (params.game_name) {
            logs = logs.filter(l => l.game_name.toLowerCase().includes(params.game_name!.toLowerCase()))
        }
        if (params.round_id) {
            logs = logs.filter(l => l.provider_round_id.includes(params.round_id!))
        }
        if (params.date_start && params.date_end) {
            const start = new Date(params.date_start).getTime()
            const end = new Date(params.date_end).getTime()
            logs = logs.filter(l => {
                const t = new Date(l.settle_time).getTime()
                return t >= start && t <= end
            })
        }

        const total = logs.length
        const start = (params.page - 1) * params.page_size
        const end = start + params.page_size
        const list = logs.slice(start, end)

        return {
            code: 0,
            msg: 'success',
            data: {
                list,
                total
            }
        }
    }
}

// OPE-302: Game List Management
import { Game, GameListSearchParams, GameUpdateRequest } from '@/types/game'

// Calculate final rate based on priority: manual tag > tag rate > type rate
const calculateFinalRate = (typeRate: number, tagRate: number): number => {
    return tagRate > 0 ? tagRate : typeRate
}

let mockGames: Game[] = [
    // PG Games
    { id: 'G001', provider_id: 'PV-001', provider_game_id: 'PG_MAHJONG2', type_id: 'T001', name: '麻將胡了2', name_en: 'Mahjong Ways 2', cumulative_turnover: 1250000, total_bet: 1250000, total_payout: 1187500, marketing_tag: 'HOT', tag_source: 'AUTO', type_rate: 100, tag_rate: 150, final_rate: 150, allowed_currencies: ['GOLD', 'SILVER'], min_vip_level: 0, sort_order: 1, status: 'ACTIVE', updated_at: '2026-01-29T10:00:00Z', profit_rate: 5.0 },
    { id: 'G002', provider_id: 'PV-001', provider_game_id: 'PG_NEKO', type_id: 'T001', name: '招財貓', name_en: 'Lucky Neko', cumulative_turnover: 850000, total_bet: 850000, total_payout: 807500, marketing_tag: 'RECOMMENDED', tag_source: 'MANUAL', type_rate: 100, tag_rate: 120, final_rate: 120, allowed_currencies: ['GOLD'], min_vip_level: 0, sort_order: 3, status: 'ACTIVE', updated_at: '2026-01-28T14:00:00Z', profit_rate: 5.0 },
    { id: 'G003', provider_id: 'PV-001', provider_game_id: 'PG_AZTEC', type_id: 'T001', name: '阿茲特克寶藏', name_en: 'Treasures of Aztec', cumulative_turnover: 450000, total_bet: 450000, total_payout: 427500, marketing_tag: null, tag_source: 'AUTO', type_rate: 100, tag_rate: 0, final_rate: 100, allowed_currencies: ['GOLD', 'SILVER'], min_vip_level: 0, sort_order: 10, status: 'ACTIVE', updated_at: '2026-01-20T10:00:00Z', profit_rate: 5.0 },

    // JILI Games
    { id: 'G004', provider_id: 'PV-003', provider_game_id: 'JILI_SUPERACE', type_id: 'T001', name: '超級王牌', name_en: 'Super Ace', cumulative_turnover: 2100000, total_bet: 2100000, total_payout: 1995000, marketing_tag: 'DOUBLE_TURNOVER', tag_source: 'MANUAL', type_rate: 100, tag_rate: 200, final_rate: 200, allowed_currencies: ['GOLD', 'SILVER'], min_vip_level: 0, sort_order: 2, status: 'ACTIVE', updated_at: '2026-01-27T16:00:00Z', profit_rate: 5.0 },
    { id: 'G005', provider_id: 'PV-003', provider_game_id: 'JILI_EMPIRE', type_id: 'T001', name: '黃金帝國', name_en: 'Golden Empire', cumulative_turnover: 680000, total_bet: 680000, total_payout: 646000, marketing_tag: null, tag_source: 'AUTO', type_rate: 100, tag_rate: 0, final_rate: 100, allowed_currencies: ['GOLD'], min_vip_level: 1, sort_order: 8, status: 'ACTIVE', updated_at: '2026-01-25T10:00:00Z', profit_rate: 5.0 },
    { id: 'G006', provider_id: 'PV-003', provider_game_id: 'JILI_BOXING', type_id: 'T001', name: '拳擊之王', name_en: 'Boxing King', cumulative_turnover: 120000, total_bet: 120000, total_payout: 114000, marketing_tag: null, tag_source: 'AUTO', type_rate: 100, tag_rate: 0, final_rate: 100, allowed_currencies: ['SILVER'], min_vip_level: 0, sort_order: 20, status: 'MAINTENANCE', updated_at: '2026-01-15T09:00:00Z', profit_rate: 5.0 },

    // Evolution Games
    { id: 'G007', provider_id: 'PV-002', provider_game_id: 'EVO_CRAZYTIME', type_id: 'T002', name: '瘋狂時刻', name_en: 'Crazy Time', cumulative_turnover: 3500000, total_bet: 3500000, total_payout: 3325000, marketing_tag: 'HOT', tag_source: 'AUTO', type_rate: 80, tag_rate: 150, final_rate: 150, allowed_currencies: ['GOLD'], min_vip_level: 0, sort_order: 1, status: 'ACTIVE', updated_at: '2026-01-29T08:00:00Z', profit_rate: 5.0 },
    { id: 'G008', provider_id: 'PV-002', provider_game_id: 'EVO_LIGHTNING', type_id: 'T002', name: '閃電輪盤', name_en: 'Lightning Roulette', cumulative_turnover: 1800000, total_bet: 1800000, total_payout: 1710000, marketing_tag: 'RECOMMENDED', tag_source: 'AUTO', type_rate: 80, tag_rate: 120, final_rate: 120, allowed_currencies: ['GOLD'], min_vip_level: 2, sort_order: 5, status: 'ACTIVE', updated_at: '2026-01-28T10:00:00Z', profit_rate: 5.0 },
    { id: 'G009', provider_id: 'PV-002', provider_game_id: 'EVO_BACCARAT_A', type_id: 'T002', name: '百家樂 A', name_en: 'Baccarat A', cumulative_turnover: 5200000, total_bet: 5200000, total_payout: 4940000, marketing_tag: null, tag_source: 'AUTO', type_rate: 80, tag_rate: 0, final_rate: 80, allowed_currencies: ['GOLD'], min_vip_level: 3, sort_order: 4, status: 'ACTIVE', updated_at: '2026-01-26T14:00:00Z', profit_rate: 5.0 },

    // PP Games
    { id: 'G010', provider_id: 'PV-004', provider_game_id: 'PP_GATES', type_id: 'T001', name: '眾神之門', name_en: 'Gates of Olympus', cumulative_turnover: 980000, total_bet: 980000, total_payout: 931000, marketing_tag: 'HOT', tag_source: 'MANUAL', type_rate: 100, tag_rate: 150, final_rate: 150, allowed_currencies: ['GOLD', 'SILVER'], min_vip_level: 0, sort_order: 6, status: 'ACTIVE', updated_at: '2026-01-28T12:00:00Z', profit_rate: 5.0 },
    { id: 'G011', provider_id: 'PV-004', provider_game_id: 'PP_BONANZA', type_id: 'T001', name: '甜蜜糖果', name_en: 'Sweet Bonanza', cumulative_turnover: 620000, total_bet: 620000, total_payout: 589000, marketing_tag: null, tag_source: 'AUTO', type_rate: 100, tag_rate: 0, final_rate: 100, allowed_currencies: ['GOLD'], min_vip_level: 0, sort_order: 12, status: 'ACTIVE', updated_at: '2026-01-22T10:00:00Z', profit_rate: 5.0 },

    // KY Games
    { id: 'G012', provider_id: 'PV-006', provider_game_id: 'KY_BIRD', type_id: 'T001', name: '捕鳥達人', name_en: 'Birds Party', cumulative_turnover: 350000, total_bet: 350000, total_payout: 332500, marketing_tag: null, tag_source: 'AUTO', type_rate: 100, tag_rate: 0, final_rate: 100, allowed_currencies: ['SILVER', 'BRONZE'], min_vip_level: 0, sort_order: 15, status: 'MAINTENANCE', updated_at: '2026-01-20T08:00:00Z', profit_rate: 5.0 },
    { id: 'G013', provider_id: 'PV-006', provider_game_id: 'KY_DRAGON', type_id: 'T001', name: '神龍寶藏', name_en: 'Dragon Master', cumulative_turnover: 180000, total_bet: 180000, total_payout: 171000, marketing_tag: null, tag_source: 'AUTO', type_rate: 100, tag_rate: 0, final_rate: 100, allowed_currencies: ['GOLD', 'BRONZE', 'SILVER'], min_vip_level: 1, sort_order: 18, status: 'ACTIVE', updated_at: '2026-01-18T10:00:00Z', profit_rate: 5.0 }
]

export const gameListApi = {
    getGames: async (params: GameListSearchParams): Promise<{ code: number; msg: string; data: { list: Game[]; total: number } }> => {
        await delay(300)

        let games = [...mockGames]

        // Filtering
        if (params.provider_id) {
            games = games.filter(g => g.provider_id === params.provider_id)
        }
        if (params.type_id) {
            games = games.filter(g => g.type_id === params.type_id)
        }
        if (params.game_id) {
            games = games.filter(g => g.id.includes(params.game_id!) || g.provider_game_id.toLowerCase().includes(params.game_id!.toLowerCase()))
        }
        if (params.name) {
            games = games.filter(g => g.name.includes(params.name!) || g.name_en.toLowerCase().includes(params.name!.toLowerCase()))
        }
        if (params.status) {
            games = games.filter(g => g.status === params.status)
        }
        if (params.marketing_tag !== undefined) {
            games = games.filter(g => g.marketing_tag === params.marketing_tag)
        }
        if (params.tag_source) {
            games = games.filter(g => g.tag_source === params.tag_source)
        }

        if (params.date_start || params.date_end) {
            // Simulate cumulative logic by scaling values
            games = games.map(g => ({
                ...g,
                cumulative_turnover: g.cumulative_turnover * (0.8 + Math.random() * 0.4),
                total_bet: g.total_bet * (0.8 + Math.random() * 0.4),
                total_payout: g.total_payout * (0.8 + Math.random() * 0.4)
            }))
        }

        const total = games.length
        const start = (params.page - 1) * params.page_size
        const end = start + params.page_size
        const list = games.slice(start, end)

        return { code: 0, msg: 'success', data: { list, total } }
    },

    updateGame: async (id: string, updates: GameUpdateRequest): Promise<{ code: number; msg: string }> => {
        await delay(300)

        const game = mockGames.find(g => g.id === id)
        if (!game) {
            return { code: 404, msg: '遊戲不存在' }
        }

        // Update fields
        if (updates.marketing_tag !== undefined) {
            game.marketing_tag = updates.marketing_tag
            game.tag_source = 'MANUAL' // Setting tag_source to MANUAL if marketing_tag is updated

            // Update tag_rate based on new tag
            // const tagConfig = configApi.mockMarketingTags.find(t => t.id === updates.marketing_tag) // Wait, configApi is not imported here?
            // Simplified mock logic:
            if (updates.marketing_tag === 'HOT') game.tag_rate = 150
            else if (updates.marketing_tag === 'RECOMMENDED') game.tag_rate = 120
            else if (updates.marketing_tag === 'DOUBLE_TURNOVER') game.tag_rate = 200
            else game.tag_rate = 0

            // Only recalculate if final_rate is NOT being manually set in this request
            if (updates.final_rate === undefined) {
                game.final_rate = calculateFinalRate(game.type_rate, game.tag_rate)
            }
        }

        if (updates.final_rate !== undefined) {
            game.final_rate = updates.final_rate
        }

        if (updates.allowed_currencies) {
            game.allowed_currencies = updates.allowed_currencies
        }
        if (updates.min_vip_level !== undefined) {
            game.min_vip_level = updates.min_vip_level
        }
        if (updates.sort_order !== undefined) {
            game.sort_order = updates.sort_order
        }
        if (updates.status) {
            game.status = updates.status
        }
        if (updates.profit_rate !== undefined) {
            game.profit_rate = updates.profit_rate
        }

        game.updated_at = new Date().toISOString()

        return { code: 0, msg: 'success' }
    }
}

