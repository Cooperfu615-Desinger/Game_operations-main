<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSelect, NTag, NIcon, NSpace,
  NModal, NForm, NFormItem, NInput, NStatistic, NGrid, NGridItem,
  NDivider, useMessage, DataTableColumns
} from 'naive-ui'
import { CheckmarkCircleOutline, CloseCircleOutline } from '@vicons/ionicons5'
import { missionApi } from '@/api/mission'
import type { Mission, MissionType, MissionStatus } from '@/types/mission'
import {
  MISSION_TYPE_CONFIG, MISSION_STATUS_CONFIG,
  CONDITION_TYPE_CONFIG, REWARD_TYPE_CONFIG
} from '@/types/mission'

const message = useMessage()

// ── Filters ───────────────────────────────────────────────────
const filterStatus = ref<MissionStatus | undefined>(undefined)
const filterType   = ref<MissionType | undefined>(undefined)

const statusOptions = [
  { label: '全部',   value: undefined },
  { label: '待審核', value: 'PENDING'  as MissionStatus },
  { label: '已核准', value: 'APPROVED' as MissionStatus },
  { label: '已拒絕', value: 'REJECTED' as MissionStatus }
]
const typeOptions = [
  { label: '全部類型', value: undefined },
  ...Object.entries(MISSION_TYPE_CONFIG).map(([k, v]) => ({ label: v.label, value: k as MissionType }))
]

// ── Data ──────────────────────────────────────────────────────
const loading = ref(false)
const allRows = ref<Mission[]>([])

const filtered = computed(() => allRows.value.filter(r => {
  if (filterStatus.value && r.status !== filterStatus.value) return false
  if (filterType.value   && r.type   !== filterType.value)   return false
  return true
}))

const summary = computed(() => ({
  pending:  allRows.value.filter(r => r.status === 'PENDING').length,
  approved: allRows.value.filter(r => r.status === 'APPROVED').length,
  rejected: allRows.value.filter(r => r.status === 'REJECTED').length
}))

const load = async () => {
  loading.value = true
  const res = await missionApi.getMissions()
  if (res.code === 0) {
    allRows.value = (res.data ?? []).filter(r =>
      ['PENDING', 'APPROVED', 'REJECTED'].includes(r.status)
    )
  }
  loading.value = false
}
onMounted(load)

// ── Review modal ──────────────────────────────────────────────
const showModal    = ref(false)
const reviewAction = ref<'approve' | 'reject'>('approve')
const activeItem   = ref<Mission | null>(null)
const rejectReason = ref('')
const processing   = ref(false)

const openReview = (item: Mission, action: 'approve' | 'reject') => {
  activeItem.value   = item
  reviewAction.value = action
  rejectReason.value = ''
  showModal.value    = true
}

const handleConfirm = async () => {
  if (!activeItem.value) return
  if (reviewAction.value === 'reject' && !rejectReason.value.trim()) {
    message.warning('請填寫拒絕原因')
    return
  }
  processing.value = true
  const res = await missionApi.reviewMission(
    activeItem.value.id,
    reviewAction.value,
    reviewAction.value === 'reject' ? rejectReason.value : undefined
  )
  processing.value = false
  if (res.code === 0) {
    message.success(reviewAction.value === 'approve' ? '已核准，任務即將上線' : '已拒絕，通知已傳送給營運')
    showModal.value = false
    await load()
  } else {
    message.error('操作失敗')
  }
}

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('zh-TW') : '—'
const fmtDateTime = (iso?: string) => iso
  ? new Date(iso).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  : '—'
const fmtNum = (n: number) => n.toLocaleString()

const rewardSummary = (rewards?: import('@/types/mission').MissionReward[]) => {
  if (!rewards?.length) return '—'
  return rewards.map(r => {
    if (r.type === 'SILVER') return `${fmtNum(r.silver_amount ?? 0)} 銀幣`
    return `${REWARD_TYPE_CONFIG[r.type].icon} ${r.item_name ?? r.type}`
  }).join('、')
}

// ── Table ─────────────────────────────────────────────────────
const columns = computed<DataTableColumns<Mission>>(() => [
  {
    title: '任務名稱',
    key: 'name',
    minWidth: 180,
    render: (row) => h('div', [
      h('div', { class: 'font-semibold text-sm text-gray-800' }, row.name),
      row.description ? h('div', { class: 'text-xs text-gray-400 mt-0.5' }, row.description) : null
    ])
  },
  {
    title: '類型',
    key: 'type',
    width: 100,
    render: (row) => h(NTag, {
      size: 'small', bordered: false,
      type: MISSION_TYPE_CONFIG[row.type].color as any
    }, { default: () => MISSION_TYPE_CONFIG[row.type].label })
  },
  {
    title: '條件 / 設定',
    key: 'condition',
    minWidth: 150,
    render: (row) => {
      if (row.type === 'CHECKIN') {
        return h('div', { class: 'text-xs text-gray-600' }, [
          h('div', `循環 ${row.cycle_days} 天，每日 ${fmtNum(row.daily_silver ?? 0)} 銀幣`),
          h('div', { class: 'text-gray-400 mt-0.5' },
            `里程碑：第 ${(row.milestones ?? []).map(m => m.day).join('、')} 天`)
        ])
      }
      return h('div', { class: 'text-xs text-gray-600' }, row.condition_desc ?? '—')
    }
  },
  {
    title: '狀態',
    key: 'status',
    width: 90,
    render: (row) => h(NTag, {
      size: 'small', bordered: false,
      type: MISSION_STATUS_CONFIG[row.status].type
    }, { default: () => MISSION_STATUS_CONFIG[row.status].label })
  },
  {
    title: '提交人 / 時間',
    key: 'submitted',
    width: 130,
    render: (row) => h('div', { class: 'text-xs text-gray-500' }, [
      h('div', row.submitted_by ?? '—'),
      h('div', fmtDateTime(row.submitted_at))
    ])
  },
  {
    title: '審核人 / 原因',
    key: 'reviewed',
    minWidth: 150,
    render: (row) => {
      if (row.status === 'PENDING') return h('span', { class: 'text-xs text-gray-400' }, '—')
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'text-gray-500' }, `${row.reviewed_by ?? ''} ${fmtDateTime(row.reviewed_at)}`),
        row.reject_reason ? h('div', { class: 'text-red-500 mt-0.5' }, row.reject_reason) : null
      ])
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
    render: (row) => {
      if (row.status !== 'PENDING') {
        return h('span', { class: 'text-xs text-gray-400' }, '已處理')
      }
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small', type: 'success', quaternary: true,
            onClick: () => openReview(row, 'approve')
          }, { default: () => [h(NIcon, { style: 'margin-right:4px' }, { default: () => h(CheckmarkCircleOutline) }), '核准'] }),
          h(NButton, {
            size: 'small', type: 'error', quaternary: true,
            onClick: () => openReview(row, 'reject')
          }, { default: () => [h(NIcon, { style: 'margin-right:4px' }, { default: () => h(CloseCircleOutline) }), '拒絕'] })
        ]
      })
    }
  }
])
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">任務審核</h2>
      <p class="text-sm text-gray-400 mt-1">審核營運提交的任務設定，核准後依設定自動上線</p>
    </div>

    <!-- Summary -->
    <NGrid :cols="3" :x-gap="16" class="mb-5">
      <NGridItem>
        <NCard size="small" embedded class="border-l-4 border-yellow-400">
          <NStatistic label="待審核" :value="summary.pending" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="已核准" :value="summary.approved" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="已拒絕" :value="summary.rejected" />
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- Filters -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm mb-5">
      <NSpace wrap align="center">
        <NSelect v-model:value="filterStatus" :options="statusOptions" placeholder="審核狀態" clearable style="width:130px" />
        <NSelect v-model:value="filterType"   :options="typeOptions"   placeholder="任務類型" clearable style="width:130px" />
      </NSpace>
    </NCard>

    <!-- Table -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm">
      <NDataTable
        :columns="columns"
        :data="filtered"
        :loading="loading"
        :bordered="false"
        striped
        size="small"
        scroll-x="1050"
      />
    </NCard>

    <!-- Review Modal -->
    <NModal v-model:show="showModal" preset="card" style="width:520px"
      :title="reviewAction === 'approve' ? '確認核准' : '拒絕並退回'"
    >
      <div v-if="activeItem">
        <div class="p-4 bg-gray-50 rounded-xl mb-4">
          <div class="flex items-center gap-2 mb-2">
            <NTag size="small" :type="MISSION_TYPE_CONFIG[activeItem.type].color as any">
              {{ MISSION_TYPE_CONFIG[activeItem.type].label }}
            </NTag>
            <span class="font-semibold text-gray-800">{{ activeItem.name }}</span>
          </div>
          <p v-if="activeItem.description" class="text-xs text-gray-400 mb-3">{{ activeItem.description }}</p>

          <!-- CHECKIN detail -->
          <template v-if="activeItem.type === 'CHECKIN'">
            <div class="text-sm text-gray-700 mb-2">
              循環 <strong>{{ activeItem.cycle_days }}</strong> 天，每日基礎
              <strong class="text-yellow-600">{{ fmtNum(activeItem.daily_silver ?? 0) }} 銀幣</strong>
            </div>
            <NDivider class="my-2" />
            <div class="space-y-1.5">
              <div v-for="ms in activeItem.milestones" :key="ms.id"
                class="flex justify-between items-start text-sm"
              >
                <span class="text-gray-500 w-16 flex-shrink-0">第 {{ ms.day }} 天</span>
                <span class="text-yellow-600 text-right">{{ rewardSummary(ms.rewards) }}</span>
              </div>
            </div>
          </template>

          <!-- DAILY / EVENT detail -->
          <template v-else>
            <div class="text-sm text-gray-600 mb-2">
              完成條件：<strong>{{ activeItem.condition_desc }}</strong>
            </div>
            <div class="text-sm">
              完成獎勵：<span class="text-yellow-600 font-medium">{{ rewardSummary(activeItem.rewards) }}</span>
            </div>
          </template>

          <div v-if="activeItem.is_limited" class="text-xs text-gray-400 mt-2">
            活動期間：{{ fmtDate(activeItem.scheduled_start) }} — {{ fmtDate(activeItem.scheduled_end) }}
          </div>
        </div>

        <p v-if="reviewAction === 'approve'" class="text-sm text-gray-600 mb-4">
          核准後任務將依設定時間自動上線，請確認條件與獎勵內容無誤。
        </p>

        <NForm v-if="reviewAction === 'reject'" label-placement="top">
          <NFormItem label="拒絕原因" required>
            <NInput
              v-model:value="rejectReason"
              type="textarea"
              :rows="3"
              placeholder="請說明拒絕原因，例如：獎勵過高、條件設定有誤..."
            />
          </NFormItem>
        </NForm>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton quaternary @click="showModal = false">取消</NButton>
          <NButton
            :type="reviewAction === 'approve' ? 'success' : 'error'"
            :loading="processing"
            @click="handleConfirm"
          >
            <template #icon>
              <NIcon :component="reviewAction === 'approve' ? CheckmarkCircleOutline : CloseCircleOutline" />
            </template>
            確認{{ reviewAction === 'approve' ? '核准' : '拒絕' }}
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>
