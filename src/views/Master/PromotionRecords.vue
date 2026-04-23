<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSelect, NTag, NIcon, NSpace,
  NInput, NDatePicker, NStatistic, NGrid, NGridItem, useMessage,
  DataTableColumns
} from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { promotionApi } from '@/api/promotion'
import type { PromotionClaimRecord, PromotionType } from '@/types/promotion'
import { PROMOTION_TYPE_CONFIG } from '@/types/promotion'

const message = useMessage()

// ── Filters ───────────────────────────────────────────────────
const filterType     = ref<PromotionType | undefined>(undefined)
const filterPlayerId = ref('')
const filterRange    = ref<[number, number] | null>(null)
const page           = ref(1)
const pageSize       = ref(20)

const typeOptions = [
  { label: '全部類型', value: undefined },
  ...Object.entries(PROMOTION_TYPE_CONFIG).map(([k, v]) => ({ label: v.label, value: k as PromotionType }))
]

// ── Data ──────────────────────────────────────────────────────
const loading  = ref(false)
const records  = ref<PromotionClaimRecord[]>([])
const total    = ref(0)

// Summary across all records (fetch unfiltered for KPIs)
const summaryData = ref({ total: 0, totalSilver: 0, uniquePlayers: 0 })

const load = async () => {
  loading.value = true
  const dateStart = filterRange.value ? new Date(filterRange.value[0]).toISOString() : undefined
  const dateEnd   = filterRange.value ? new Date(filterRange.value[1]).toISOString() : undefined
  const res = await promotionApi.getClaimRecords({
    type: filterType.value,
    player_id: filterPlayerId.value || undefined,
    date_start: dateStart,
    date_end: dateEnd,
    page: page.value,
    page_size: pageSize.value
  })
  if (res.code === 0 && res.data) {
    records.value = res.data.list
    total.value   = res.data.total
  }
  loading.value = false
}

const loadSummary = async () => {
  const res = await promotionApi.getClaimRecords({ page: 1, page_size: 9999 })
  if (res.code === 0 && res.data) {
    const all = res.data.list
    summaryData.value = {
      total: all.length,
      totalSilver: all.reduce((sum, r) => sum + r.reward_silver, 0),
      uniquePlayers: new Set(all.map(r => r.player_id)).size
    }
  }
}

onMounted(() => { load(); loadSummary() })

const handleSearch = () => { page.value = 1; load() }
const handleReset  = () => {
  filterType.value = undefined
  filterPlayerId.value = ''
  filterRange.value = null
  page.value = 1
  load()
}

// ── Helpers ───────────────────────────────────────────────────
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
const fmtNum = (n: number) => n.toLocaleString()

// ── Table ─────────────────────────────────────────────────────
const columns: DataTableColumns<PromotionClaimRecord> = [
  {
    title: '玩家 ID',
    key: 'player_id',
    width: 110,
    render: (row) => h('div', [
      h('div', { class: 'text-sm font-medium text-gray-700' }, row.player_id),
      h('div', { class: 'text-xs text-gray-400' }, row.player_username)
    ])
  },
  {
    title: '活動名稱',
    key: 'promotion_name',
    minWidth: 160,
    render: (row) => h('span', { class: 'text-sm text-gray-700' }, row.promotion_name)
  },
  {
    title: '優惠類型',
    key: 'promotion_type',
    width: 120,
    render: (row) => h(NTag, { size: 'small', bordered: false, type: 'info' }, {
      default: () => PROMOTION_TYPE_CONFIG[row.promotion_type].label
    })
  },
  {
    title: '觸發金額',
    key: 'trigger_deposit',
    width: 110,
    render: (row) => row.trigger_deposit
      ? h('span', { class: 'text-sm text-gray-700' }, `${fmtNum(row.trigger_deposit)} 金幣`)
      : h('span', { class: 'text-xs text-gray-400' }, '—')
  },
  {
    title: '獲得銀幣',
    key: 'reward_silver',
    width: 120,
    render: (row) => h('span', { class: 'text-sm font-semibold text-yellow-600' }, `${fmtNum(row.reward_silver)} 銀`)
  },
  {
    title: '平台',
    key: 'platform',
    width: 80,
    render: (row) => row.platform
      ? h(NTag, { size: 'small', bordered: false, type: row.platform === 'APP' ? 'info' : 'success' }, {
          default: () => row.platform === 'APP' ? '📱 APP' : '🌐 官網'
        })
      : h('span', { class: 'text-xs text-gray-400' }, '—')
  },
  {
    title: '領取時間',
    key: 'claimed_at',
    width: 130,
    render: (row) => h('span', { class: 'text-xs text-gray-500' }, fmtDateTime(row.claimed_at))
  }
]
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">優惠領取紀錄</h2>
      <p class="text-sm text-gray-400 mt-1">查詢玩家優惠領取明細</p>
    </div>

    <!-- Summary -->
    <NGrid :cols="3" :x-gap="16" class="mb-5">
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="總領取筆數" :value="summaryData.total" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded class="border-l-4 border-yellow-400">
          <NStatistic label="累計發放銀幣">
            <template #default>{{ fmtNum(summaryData.totalSilver) }}</template>
          </NStatistic>
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="受惠玩家人數" :value="summaryData.uniquePlayers" />
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- Filters -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm mb-5">
      <div class="flex flex-wrap items-center gap-3">
        <NInput
          v-model:value="filterPlayerId"
          placeholder="玩家 ID 或暱稱"
          clearable
          style="width:180px"
        />
        <NSelect
          v-model:value="filterType"
          :options="typeOptions"
          placeholder="優惠類型"
          clearable
          style="width:150px"
        />
        <NDatePicker
          v-model:value="filterRange"
          type="daterange"
          clearable
          style="width:260px"
        />
        <NButton type="primary" @click="handleSearch">
          <template #icon><NIcon :component="SearchOutline" /></template>
          查詢
        </NButton>
        <NButton quaternary @click="handleReset">重置</NButton>
      </div>
    </NCard>

    <!-- Table -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm">
      <NDataTable
        :columns="columns"
        :data="records"
        :loading="loading"
        :bordered="false"
        striped
        size="small"
        :pagination="{
          page,
          pageSize,
          itemCount: total,
          onChange: (p: number) => { page = p; load() },
          onUpdatePageSize: (ps: number) => { pageSize = ps; page = 1; load() }
        }"
      />
    </NCard>
  </div>
</template>
