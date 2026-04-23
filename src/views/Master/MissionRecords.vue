<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSelect, NTag, NIcon,
  NInput, NDatePicker, NStatistic, NGrid, NGridItem, useMessage,
  DataTableColumns
} from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { missionApi } from '@/api/mission'
import type { MissionClaimRecord, MissionType } from '@/types/mission'
import { MISSION_TYPE_CONFIG, REWARD_TYPE_CONFIG } from '@/types/mission'

const message = useMessage()

// ── Filters ───────────────────────────────────────────────────
const filterType     = ref<MissionType | undefined>(undefined)
const filterPlayerId = ref('')
const filterRange    = ref<[number, number] | null>(null)
const page           = ref(1)
const pageSize       = ref(20)

const typeOptions = [
  { label: '全部類型', value: undefined },
  ...Object.entries(MISSION_TYPE_CONFIG).map(([k, v]) => ({ label: v.label, value: k as MissionType }))
]

// ── Data ──────────────────────────────────────────────────────
const loading   = ref(false)
const records   = ref<MissionClaimRecord[]>([])
const total     = ref(0)
const summaryData = ref({ total: 0, uniquePlayers: 0, silverTotal: 0 })

const load = async () => {
  loading.value = true
  const dateStart = filterRange.value ? new Date(filterRange.value[0]).toISOString() : undefined
  const dateEnd   = filterRange.value ? new Date(filterRange.value[1]).toISOString() : undefined
  const res = await missionApi.getClaimRecords({
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
  const res = await missionApi.getClaimRecords({ page: 1, page_size: 9999 })
  if (res.code === 0 && res.data) {
    const all = res.data.list
    let silver = 0
    all.forEach(r => r.rewards.forEach(rw => { if (rw.type === 'SILVER') silver += rw.silver_amount ?? 0 }))
    summaryData.value = {
      total: all.length,
      uniquePlayers: new Set(all.map(r => r.player_id)).size,
      silverTotal: silver
    }
  }
}

onMounted(() => { load(); loadSummary() })

const handleSearch = () => { page.value = 1; load() }
const handleReset = () => {
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

const rewardTags = (rewards: MissionClaimRecord['rewards']) =>
  rewards.map(r => {
    const icon = REWARD_TYPE_CONFIG[r.type].icon
    if (r.type === 'SILVER') return `${icon} ${fmtNum(r.silver_amount ?? 0)} 銀幣`
    return `${icon} ${r.item_name ?? REWARD_TYPE_CONFIG[r.type].label}`
  })

// ── Table ─────────────────────────────────────────────────────
const columns: DataTableColumns<MissionClaimRecord> = [
  {
    title: '玩家',
    key: 'player',
    width: 130,
    render: (row) => h('div', [
      h('div', { class: 'text-sm font-medium text-gray-700' }, row.player_id),
      h('div', { class: 'text-xs text-gray-400' }, row.player_username)
    ])
  },
  {
    title: '任務名稱',
    key: 'mission_name',
    minWidth: 160,
    render: (row) => h('span', { class: 'text-sm text-gray-700' }, row.mission_name)
  },
  {
    title: '任務類型',
    key: 'mission_type',
    width: 100,
    render: (row) => h(NTag, {
      size: 'small', bordered: false,
      type: MISSION_TYPE_CONFIG[row.mission_type].color as any
    }, { default: () => MISSION_TYPE_CONFIG[row.mission_type].label })
  },
  {
    title: '完成進度',
    key: 'progress',
    width: 100,
    render: (row) => {
      if (row.checkin_day != null) {
        return h('span', { class: 'text-sm text-gray-600' }, `第 ${row.checkin_day} 天`)
      }
      return row.progress != null
        ? h('span', { class: 'text-sm text-gray-600' }, fmtNum(row.progress))
        : h('span', { class: 'text-xs text-gray-400' }, '—')
    }
  },
  {
    title: '獲得獎勵',
    key: 'rewards',
    minWidth: 200,
    render: (row) => h('div', { class: 'flex flex-wrap gap-1' },
      rewardTags(row.rewards).map(t =>
        h('span', { class: 'text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-1.5 py-0.5' }, t)
      )
    )
  },
  {
    title: '完成時間',
    key: 'completed_at',
    width: 120,
    render: (row) => h('div', { class: 'text-xs text-gray-500' }, [
      h('div', fmtDateTime(row.completed_at)),
      h('div', { class: 'text-gray-400' }, `領取：${fmtDateTime(row.claimed_at)}`)
    ])
  }
]
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">任務領取紀錄</h2>
      <p class="text-sm text-gray-400 mt-1">查詢玩家任務完成與獎勵領取明細</p>
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
            <template #default>{{ fmtNum(summaryData.silverTotal) }}</template>
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
        <NInput v-model:value="filterPlayerId" placeholder="玩家 ID 或暱稱" clearable style="width:180px" />
        <NSelect v-model:value="filterType" :options="typeOptions" placeholder="任務類型" clearable style="width:140px" />
        <NDatePicker v-model:value="filterRange" type="daterange" clearable style="width:260px" />
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
