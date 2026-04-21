<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NDataTable, NButton, NSelect, NDatePicker, NSpace, NTag,
  NGrid, NGridItem, NStatistic, NIcon, DataTableColumns
} from 'naive-ui'
import { SearchOutline, EyeOutline } from '@vicons/ionicons5'
import { agentApi } from '@/api/agent'
import type { AgentReportRow, AgentReportParams, AgentIdentity } from '@/types/agent'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t }  = useI18n()

// ── Filter form ───────────────────────────────────────────
const filterForm = reactive<AgentReportParams>({
  identity:   undefined,
  date_start: undefined,
  date_end:   undefined,
  page:       1,
  page_size:  20
})

const dateRange = ref<[number, number] | null>(null)

const identityOptions = [
  { label: '全部', value: null },
  { label: '總代理', value: 'MASTER' },
  { label: '子代理', value: 'SUB' },
  { label: '助手',   value: 'ASSISTANT' }
]

// ── Data ──────────────────────────────────────────────────
const loading = ref(false)
const rows    = ref<AgentReportRow[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page
    filterForm.page = page
    fetchData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    filterForm.page_size = pageSize
    filterForm.page = 1
    fetchData()
  }
})

// ── Summary stats ─────────────────────────────────────────
const summary = computed(() => {
  const totalDeposit  = rows.value.reduce((s, r) => s + r.total_deposit, 0)
  const totalWithdraw = rows.value.reduce((s, r) => s + r.total_withdrawal, 0)
  const totalTurnover = rows.value.reduce((s, r) => s + r.valid_turnover, 0)
  const totalWin      = rows.value.reduce((s, r) => s + r.platform_win, 0)
  const totalComm     = rows.value.reduce((s, r) => s + r.commission_due, 0)
  return { totalDeposit, totalWithdraw, totalTurnover, totalWin, totalComm }
})

// ── Fetch ─────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const res = await agentApi.getAgentReport(filterForm)
    if (res.code === 0 && res.data) {
      rows.value = res.data.items
      pagination.itemCount = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (dateRange.value) {
    filterForm.date_start = new Date(dateRange.value[0]).toISOString()
    filterForm.date_end   = new Date(dateRange.value[1]).toISOString()
  } else {
    filterForm.date_start = undefined
    filterForm.date_end   = undefined
  }
  filterForm.page = 1
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  filterForm.identity   = undefined
  filterForm.date_start = undefined
  filterForm.date_end   = undefined
  dateRange.value = null
  filterForm.page = 1
  pagination.page = 1
  fetchData()
}

onMounted(fetchData)

// ── Table columns ─────────────────────────────────────────
const identityTypeMap: Record<string, 'info' | 'success' | 'warning' | 'default' | 'error'> = {
  MASTER: 'info', SUB: 'success', ASSISTANT: 'warning', ADMIN: 'error'
}
const identityLabelMap: Record<string, string> = {
  MASTER: '總代理', SUB: '子代理', ASSISTANT: '助手', ADMIN: '管理員'
}

const columns = computed<DataTableColumns<AgentReportRow>>(() => [
  {
    title: '代理帳號 / UID',
    key: 'agent_username',
    width: 180,
    render: (row) => h('div', [
      h('div', { class: 'font-bold text-gray-800' }, row.agent_username),
      h('div', { class: 'text-xs text-gray-400' }, `UID: ${row.agent_uid}`)
    ])
  },
  {
    title: '身份',
    key: 'identity',
    width: 100,
    render: (row) => h(NTag, { type: identityTypeMap[row.identity], bordered: false, size: 'small' }, { default: () => identityLabelMap[row.identity] })
  },
  {
    title: '代理路徑',
    key: 'path',
    minWidth: 180,
    ellipsis: { tooltip: true }
  },
  {
    title: '直屬會員',
    key: 'total_players',
    width: 90,
    align: 'center' as const
  },
  {
    title: '總儲值',
    key: 'total_deposit',
    width: 120,
    align: 'right' as const,
    render: (row) => `$ ${row.total_deposit.toLocaleString()}`
  },
  {
    title: '總提款',
    key: 'total_withdrawal',
    width: 120,
    align: 'right' as const,
    render: (row) => `$ ${row.total_withdrawal.toLocaleString()}`
  },
  {
    title: '有效流水',
    key: 'valid_turnover',
    width: 130,
    align: 'right' as const,
    render: (row) => `$ ${row.valid_turnover.toLocaleString()}`
  },
  {
    title: '平台輸贏',
    key: 'platform_win',
    width: 130,
    align: 'right' as const,
    render: (row) => h('span', { class: row.platform_win >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold' }, `$ ${row.platform_win.toLocaleString()}`)
  },
  {
    title: '應付佣金',
    key: 'commission_due',
    width: 120,
    align: 'right' as const,
    render: (row) => h('span', { class: 'font-bold text-orange-500' }, `$ ${row.commission_due.toLocaleString()}`)
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right' as const,
    render: (row) => h(NButton, { size: 'small', quaternary: true, type: 'info', onClick: () => router.push(`/admin/agent/${row.agent_id}`) }, { default: () => [h(NIcon, { style: { marginRight: '4px' } }, { default: () => h(EyeOutline) }), '詳情'] })
  }
])
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">代理統計報表</h2>
      <p class="text-sm text-gray-400 mt-1">查看全代理層級的業績與佣金概覽</p>
    </div>

    <!-- Summary cards -->
    <NGrid :cols="5" :x-gap="16" :y-gap="16" class="mb-6">
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="總儲值" :value="`$ ${summary.totalDeposit.toLocaleString()}`" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="總提款" :value="`$ ${summary.totalWithdraw.toLocaleString()}`" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="有效流水" :value="`$ ${summary.totalTurnover.toLocaleString()}`" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="平台輸贏" :value="`$ ${summary.totalWin.toLocaleString()}`" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded class="border-l-4 border-orange-400">
          <NStatistic label="應付佣金合計" :value="`$ ${summary.totalComm.toLocaleString()}`" />
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- Filter bar -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm mb-5">
      <NSpace wrap align="center">
        <NSelect
          v-model:value="filterForm.identity"
          :options="identityOptions"
          placeholder="身份類型"
          clearable
          style="width: 140px"
        />
        <NDatePicker
          v-model:value="dateRange"
          type="daterange"
          clearable
          placeholder="統計日期範圍"
          style="width: 280px"
        />
        <NButton type="primary" @click="handleSearch">
          <template #icon><NIcon :component="SearchOutline" /></template>
          查詢
        </NButton>
        <NButton quaternary @click="handleReset">重置</NButton>
      </NSpace>
    </NCard>

    <!-- Data table -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm">
      <NDataTable
        :columns="columns"
        :data="rows"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        striped
        size="small"
        scroll-x="1200"
      />
    </NCard>
  </div>
</template>
