<template>
  <div class="p-4">
    <n-space vertical size="large">

      <!-- Filter Bar -->
      <n-card>
        <n-space align="center" :wrap="true">
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            :is-date-disabled="isDateDisabled"
            :shortcuts="dateShortcuts"
            clearable
            style="width: 280px"
          />
          <n-radio-group v-model:value="dimension">
            <n-radio-button value="type">{{ t('playerWinLoss.dimType') }}</n-radio-button>
            <n-radio-button value="provider">{{ t('playerWinLoss.dimProvider') }}</n-radio-button>
          </n-radio-group>
          <n-select
            v-model:value="topN"
            :options="topNOptions"
            style="width: 110px"
          />
          <n-button type="primary" :loading="loading" @click="handleQuery">
            <template #icon><n-icon><search-icon /></n-icon></template>
            {{ t('common.search') }}
          </n-button>
        </n-space>
      </n-card>

      <!-- Ranking Blocks -->
      <template v-if="rankingBlocks.length > 0">
        <n-card v-for="block in rankingBlocks" :key="block.key">
          <template #header>
            <n-space align="center">
              <n-tag :bordered="false" type="info">{{ block.label }}</n-tag>
            </n-space>
          </template>
          <n-tabs type="line" animated>
            <n-tab-pane name="win" :tab="t('playerWinLoss.tabWin')">
              <n-data-table
                :columns="rankColumns"
                :data="block.winRanking"
                :bordered="false"
                size="small"
                striped
              />
            </n-tab-pane>
            <n-tab-pane name="loss" :tab="t('playerWinLoss.tabLoss')">
              <n-data-table
                :columns="rankColumns"
                :data="block.lossRanking"
                :bordered="false"
                size="small"
                striped
              />
            </n-tab-pane>
            <n-tab-pane name="avg" :tab="t('playerWinLoss.tabAvgBet')">
              <n-data-table
                :columns="avgColumns"
                :data="block.avgRanking"
                :bordered="false"
                size="small"
                striped
              />
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </template>

      <n-empty v-else-if="!loading" :description="t('playerWinLoss.emptyHint')" />

    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NSpace, NButton, NIcon, NDatePicker, NRadioGroup, NRadioButton,
  NSelect, NTabs, NTabPane, NDataTable, NTag, NEmpty, NText
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { SearchOutline as SearchIcon } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { mockGameLogs } from '@/api/game'
import type { ProviderType } from '@/types/game'

const { t } = useI18n()

// ─── Date helpers ───────────────────────────────────────────────────────────
const today = new Date()
today.setHours(0, 0, 0, 0)
const yesterday = new Date(today.getTime() - 1)
yesterday.setHours(0, 0, 0, 0)

const thirtyDaysAgo = new Date(yesterday)
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

// ─── State ───────────────────────────────────────────────────────────────────
const loading = ref(false)
const dimension = ref<'type' | 'provider'>('type')
const topN = ref(10)
const dateRange = ref<[number, number]>([thirtyDaysAgo.getTime(), yesterday.getTime()])

const topNOptions = [
  { label: 'Top 10', value: 10 },
  { label: 'Top 20', value: 20 },
  { label: 'Top 50', value: 50 }
]

const dateShortcuts = {
  [t('playerWinLoss.shortcutLast7')]: (): [number, number] => {
    const end = new Date(yesterday)
    const start = new Date(yesterday)
    start.setDate(start.getDate() - 6)
    return [start.getTime(), end.getTime()]
  },
  [t('playerWinLoss.shortcutLast30')]: (): [number, number] => {
    const end = new Date(yesterday)
    const start = new Date(yesterday)
    start.setDate(start.getDate() - 29)
    return [start.getTime(), end.getTime()]
  },
  [t('playerWinLoss.shortcutLastMonth')]: (): [number, number] => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    if (end >= today) {
      end.setTime(yesterday.getTime())
    }
    return [start.getTime(), end.getTime()]
  }
}

function isDateDisabled(ts: number) {
  return ts >= today.getTime()
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface PlayerStat {
  rank: number
  player_id: string
  total_bet: number
  total_win: number
  net_amount: number
  round_count: number
  avg_bet: number
}

interface RankingBlock {
  key: string
  label: string
  winRanking: PlayerStat[]
  lossRanking: PlayerStat[]
  avgRanking: PlayerStat[]
}

// ─── Dimension labels ────────────────────────────────────────────────────────
const typeLabels: Record<ProviderType, string> = {
  SLOT: '老虎機 (SLOT)',
  LIVE: '真人娛樂城 (LIVE)',
  SPORTS: '體育投注 (SPORTS)',
  LOTTERY: '彩票 (LOTTERY)',
  CARD: '棋牌 (CARD)'
}

const providerLabels: Record<string, string> = {
  PG: 'PG Soft',
  JILI: 'JILI',
  EVOLUTION: 'Evolution Gaming',
  PP: 'Pragmatic Play',
  JDB: 'JDB',
  SABA: 'SABA Sports',
  KY: 'KY Gaming'
}

// ─── Computed ranking blocks ─────────────────────────────────────────────────
const rankingBlocks = ref<RankingBlock[]>([])

function buildRankings(): RankingBlock[] {
  if (!dateRange.value) return []
  const [startTs, endTs] = dateRange.value
  const startDate = new Date(startTs)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(endTs)
  endDate.setHours(23, 59, 59, 999)

  // Filter logs within date range (exclude VOID/free spins with 0 bet)
  const filtered = mockGameLogs.filter(log => {
    const logTime = new Date(log.settle_time).getTime()
    return logTime >= startDate.getTime() && logTime <= endDate.getTime() && log.bet_amount > 0
  })

  // Group key extractor
  type GroupKey = string
  const getGroupKey = (log: typeof filtered[0]): GroupKey =>
    dimension.value === 'type' ? log.game_type : log.provider_id

  // Collect all group keys
  const groupKeys = [...new Set(filtered.map(getGroupKey))]

  // Build per-group player stats
  const blocks: RankingBlock[] = groupKeys.map(gKey => {
    const groupLogs = filtered.filter(log => getGroupKey(log) === gKey)

    // Aggregate by player
    const playerMap = new Map<string, { total_bet: number; total_win: number; net_amount: number; round_count: number }>()
    groupLogs.forEach(log => {
      const existing = playerMap.get(log.player_id) ?? { total_bet: 0, total_win: 0, net_amount: 0, round_count: 0 }
      existing.total_bet += log.bet_amount
      existing.total_win += log.win_amount
      existing.net_amount += log.net_amount
      existing.round_count += 1
      playerMap.set(log.player_id, existing)
    })

    const players: PlayerStat[] = [...playerMap.entries()].map(([pid, s]) => ({
      rank: 0,
      player_id: pid,
      total_bet: Math.round(s.total_bet),
      total_win: Math.round(s.total_win),
      net_amount: Math.round(s.net_amount),
      round_count: s.round_count,
      avg_bet: Math.round(s.total_bet / s.round_count)
    }))

    const rank = (arr: PlayerStat[]) =>
      arr.slice(0, topN.value).map((p, i) => ({ ...p, rank: i + 1 }))

    // 贏最多：net_amount 最高（對玩家而言 win 最多，即 net > 0 降序）
    const winRanking = rank([...players].sort((a, b) => b.net_amount - a.net_amount))

    // 輸最多：net_amount 最低（對玩家而言 lose 最多，即 net < 0 升序）
    const lossRanking = rank([...players].sort((a, b) => a.net_amount - b.net_amount))

    // 平均投注額
    const avgRanking = rank([...players].sort((a, b) => b.avg_bet - a.avg_bet))

    const label = dimension.value === 'type'
      ? (typeLabels[gKey as ProviderType] ?? gKey)
      : (providerLabels[gKey] ?? gKey)

    return { key: gKey, label, winRanking, lossRanking, avgRanking }
  })

  // Sort blocks by total bet volume descending
  return blocks.sort((a, b) => {
    const sumBet = (arr: PlayerStat[]) => arr.reduce((s, p) => s + p.total_bet, 0)
    return sumBet(b.winRanking) - sumBet(a.winRanking)
  })
}

// ─── Columns ─────────────────────────────────────────────────────────────────
const rankColumns: DataTableColumns<PlayerStat> = [
  {
    title: '#',
    key: 'rank',
    width: 50,
    render: (row) => h(NText, { strong: row.rank <= 3 }, () => String(row.rank))
  },
  { title: t('playerWinLoss.colPlayerId'), key: 'player_id', width: 140 },
  {
    title: t('playerWinLoss.colTotalBet'),
    key: 'total_bet',
    align: 'right',
    render: row => row.total_bet.toLocaleString()
  },
  {
    title: t('playerWinLoss.colTotalWin'),
    key: 'total_win',
    align: 'right',
    render: row => row.total_win.toLocaleString()
  },
  {
    title: t('playerWinLoss.colNetAmount'),
    key: 'net_amount',
    align: 'right',
    render: (row) =>
      h(NText, { type: row.net_amount >= 0 ? 'success' : 'error' }, () =>
        (row.net_amount >= 0 ? '+' : '') + row.net_amount.toLocaleString()
      )
  },
  { title: t('playerWinLoss.colRoundCount'), key: 'round_count', align: 'right' }
]

const avgColumns: DataTableColumns<PlayerStat> = [
  {
    title: '#',
    key: 'rank',
    width: 50,
    render: (row) => h(NText, { strong: row.rank <= 3 }, () => String(row.rank))
  },
  { title: t('playerWinLoss.colPlayerId'), key: 'player_id', width: 140 },
  {
    title: t('playerWinLoss.colAvgBet'),
    key: 'avg_bet',
    align: 'right',
    render: row => row.avg_bet.toLocaleString()
  },
  {
    title: t('playerWinLoss.colTotalBet'),
    key: 'total_bet',
    align: 'right',
    render: row => row.total_bet.toLocaleString()
  },
  { title: t('playerWinLoss.colRoundCount'), key: 'round_count', align: 'right' }
]

// ─── Actions ─────────────────────────────────────────────────────────────────
function handleQuery() {
  loading.value = true
  setTimeout(() => {
    rankingBlocks.value = buildRankings()
    loading.value = false
  }, 300)
}

// Initial load
handleQuery()
</script>
