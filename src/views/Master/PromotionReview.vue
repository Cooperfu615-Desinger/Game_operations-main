<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSelect, NTag, NIcon, NSpace,
  NModal, NForm, NFormItem, NInput, NStatistic, NGrid, NGridItem,
  NDivider, useMessage, DataTableColumns
} from 'naive-ui'
import { CheckmarkCircleOutline, CloseCircleOutline } from '@vicons/ionicons5'
import { promotionApi } from '@/api/promotion'
import type { Promotion, PromotionType, PromotionStatus } from '@/types/promotion'
import { PROMOTION_TYPE_CONFIG, PROMOTION_STATUS_CONFIG } from '@/types/promotion'

const message = useMessage()

// ── Filters ───────────────────────────────────────────────────
const filterStatus = ref<PromotionStatus | undefined>(undefined)
const filterType   = ref<PromotionType | undefined>(undefined)

const statusOptions = [
  { label: '全部',   value: undefined },
  { label: '待審核', value: 'PENDING'  as PromotionStatus },
  { label: '已核准', value: 'APPROVED' as PromotionStatus },
  { label: '已拒絕', value: 'REJECTED' as PromotionStatus }
]
const typeOptions = [
  { label: '全部類型', value: undefined },
  ...Object.entries(PROMOTION_TYPE_CONFIG).map(([k, v]) => ({ label: v.label, value: k as PromotionType }))
]

// ── Data ──────────────────────────────────────────────────────
const loading = ref(false)
const allRows = ref<Promotion[]>([])

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
  const res = await promotionApi.getPromotions()
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
const activeItem   = ref<Promotion | null>(null)
const rejectReason = ref('')
const processing   = ref(false)

const openReview = (item: Promotion, action: 'approve' | 'reject') => {
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
  const res = await promotionApi.reviewPromotion(
    activeItem.value.id,
    reviewAction.value,
    reviewAction.value === 'reject' ? rejectReason.value : undefined
  )
  processing.value = false
  if (res.code === 0) {
    message.success(reviewAction.value === 'approve' ? '已核准，優惠活動即將上線' : '已拒絕，通知已傳送給營運')
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

// ── Table ─────────────────────────────────────────────────────
const columns = computed<DataTableColumns<Promotion>>(() => [
  {
    title: '活動名稱',
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
    width: 120,
    render: (row) => h(NTag, { size: 'small', bordered: false, type: 'info' }, {
      default: () => PROMOTION_TYPE_CONFIG[row.type].label
    })
  },
  {
    title: '方案 / 獎勵',
    key: 'reward',
    minWidth: 160,
    render: (row) => {
      if (PROMOTION_TYPE_CONFIG[row.type].isTier && row.tiers?.length) {
        return h('div', { class: 'text-xs text-gray-600 space-y-0.5' },
          row.tiers.map(t =>
            h('div', `儲 ${fmtNum(t.min_deposit)} 金 → ${fmtNum(t.reward_silver)} 銀`)
          )
        )
      }
      return h('div', { class: 'text-sm' }, [
        h('span', { class: 'font-semibold text-yellow-600' }, `${fmtNum(row.reward_silver ?? 0)} 銀幣`),
        row.target_vip_level ? h('div', { class: 'text-xs text-gray-400' }, `VIP ${row.target_vip_level}`) : null
      ])
    }
  },
  {
    title: '有效期間',
    key: 'schedule',
    width: 150,
    render: (row) => {
      if (!row.is_limited) return h('span', { class: 'text-xs text-gray-400' }, '長期有效')
      return h('div', { class: 'text-xs text-gray-500' }, [
        h('div', `${fmtDate(row.scheduled_start)}`),
        h('div', `~ ${fmtDate(row.scheduled_end)}`)
      ])
    }
  },
  {
    title: '狀態',
    key: 'status',
    width: 90,
    render: (row) => h(NTag, {
      size: 'small', bordered: false,
      type: PROMOTION_STATUS_CONFIG[row.status].type
    }, { default: () => PROMOTION_STATUS_CONFIG[row.status].label })
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
    minWidth: 160,
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
      <h2 class="text-xl font-bold text-gray-800">優惠活動審核</h2>
      <p class="text-sm text-gray-400 mt-1">審核營運提交的優惠活動，核准後依設定自動上線或排程</p>
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
        <NSelect v-model:value="filterType"   :options="typeOptions"   placeholder="優惠類型" clearable style="width:150px" />
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
        scroll-x="1100"
      />
    </NCard>

    <!-- Review Modal -->
    <NModal v-model:show="showModal" preset="card" style="width:500px"
      :title="reviewAction === 'approve' ? '確認核准' : '拒絕並退回'"
    >
      <div v-if="activeItem">
        <div class="p-4 bg-gray-50 rounded-xl mb-4">
          <p class="font-semibold text-gray-800">{{ activeItem.name }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ PROMOTION_TYPE_CONFIG[activeItem.type].label }}</p>

          <!-- Tier preview -->
          <template v-if="PROMOTION_TYPE_CONFIG[activeItem.type].isTier && activeItem.tiers?.length">
            <NDivider class="my-3" />
            <div class="space-y-1">
              <div v-for="t in activeItem.tiers" :key="t.id" class="flex justify-between text-sm text-gray-700">
                <span>儲值 {{ t.min_deposit.toLocaleString() }} 金幣</span>
                <span class="text-yellow-600 font-medium">→ {{ t.reward_silver.toLocaleString() }} 銀幣</span>
              </div>
            </div>
          </template>

          <!-- Flat reward preview -->
          <template v-else>
            <NDivider class="my-3" />
            <div class="flex justify-between text-sm text-gray-700">
              <span>獎勵</span>
              <span class="text-yellow-600 font-medium">{{ (activeItem.reward_silver ?? 0).toLocaleString() }} 銀幣</span>
            </div>
            <div v-if="activeItem.target_vip_level" class="text-xs text-gray-400 mt-1">
              目標等級：VIP {{ activeItem.target_vip_level }}
            </div>
          </template>

          <div v-if="activeItem.is_limited" class="text-xs text-gray-500 mt-2">
            有效期間：{{ fmtDate(activeItem.scheduled_start) }} — {{ fmtDate(activeItem.scheduled_end) }}
          </div>
        </div>

        <p v-if="reviewAction === 'approve'" class="text-sm text-gray-600 mb-4">
          核准後活動將依設定時間自動上線，請確認方案內容與獎勵設定無誤。
        </p>

        <NForm v-if="reviewAction === 'reject'" label-placement="top">
          <NFormItem label="拒絕原因" required>
            <NInput
              v-model:value="rejectReason"
              type="textarea"
              :rows="3"
              placeholder="請說明拒絕原因，例如：獎勵比例過高、活動時間與其他活動衝突..."
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
