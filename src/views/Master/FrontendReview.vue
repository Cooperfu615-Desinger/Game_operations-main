<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSelect, NTag, NIcon, NSpace,
  NModal, NForm, NFormItem, NInput, NStatistic, NGrid, NGridItem,
  useMessage, DataTableColumns
} from 'naive-ui'
import { CheckmarkCircleOutline, CloseCircleOutline, SearchOutline } from '@vicons/ionicons5'
import { frontendApi } from '@/api/frontend'
import type { SlotContent, ContentStatus, FrontendPlatform, SlotType } from '@/types/frontend'
import { SLOT_CONFIGS, STATUS_CONFIG } from '@/types/frontend'

const message = useMessage()

// ── Filter ────────────────────────────────────────────────
const filterStatus   = ref<ContentStatus | undefined>(undefined)
const filterPlatform = ref<FrontendPlatform | undefined>(undefined)
const filterSlotType = ref<SlotType | undefined>(undefined)

const statusOptions = [
  { label: '全部',   value: undefined },
  { label: '待審核', value: 'PENDING' as ContentStatus },
  { label: '已核准', value: 'APPROVED' as ContentStatus },
  { label: '已拒絕', value: 'REJECTED' as ContentStatus }
]
const platformOptions = [
  { label: '全部',  value: undefined },
  { label: 'APP',  value: 'APP' as FrontendPlatform },
  { label: '官網',  value: 'WEB' as FrontendPlatform }
]
const slotTypeOptions = [
  { label: '全部', value: undefined },
  ...Object.entries(SLOT_CONFIGS).map(([k, v]) => ({ label: v.label, value: k as SlotType }))
]

// ── Data ──────────────────────────────────────────────────
const loading = ref(false)
const allRows = ref<SlotContent[]>([])

const filtered = computed(() => allRows.value.filter(r => {
  if (filterStatus.value   && r.status    !== filterStatus.value)   return false
  if (filterPlatform.value && r.platform  !== filterPlatform.value) return false
  if (filterSlotType.value && r.slot_type !== filterSlotType.value) return false
  return true
}))

const summary = computed(() => ({
  pending:  allRows.value.filter(r => r.status === 'PENDING').length,
  approved: allRows.value.filter(r => r.status === 'APPROVED').length,
  rejected: allRows.value.filter(r => r.status === 'REJECTED').length
}))

const load = async () => {
  loading.value = true
  const res = await frontendApi.getAllPendingContents()
  if (res.code === 0) allRows.value = res.data ?? []
  loading.value = false
}
onMounted(load)

// ── Review modal ──────────────────────────────────────────
const showModal     = ref(false)
const reviewAction  = ref<'approve' | 'reject'>('approve')
const activeItem    = ref<SlotContent | null>(null)
const rejectReason  = ref('')
const processing    = ref(false)

const openReview = (item: SlotContent, action: 'approve' | 'reject') => {
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
  const res = await frontendApi.reviewContent(
    activeItem.value.id,
    reviewAction.value,
    reviewAction.value === 'reject' ? rejectReason.value : undefined
  )
  processing.value = false
  if (res.code === 0) {
    message.success(reviewAction.value === 'approve' ? '已核准，內容將於排程時間上線' : '已拒絕，通知已傳送給營運')
    showModal.value = false
    await load()
  } else {
    message.error('操作失敗')
  }
}

// ── Table ─────────────────────────────────────────────────
const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('zh-TW') : '—'
const formatDateTime = (iso?: string) => iso ? new Date(iso).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

const columns = computed<DataTableColumns<SlotContent>>(() => [
  {
    title: '預覽',
    key: 'preview',
    width: 100,
    render: (row) => h('img', {
      src: row.image_url,
      style: 'width:80px;height:45px;object-fit:cover;border-radius:6px'
    })
  },
  {
    title: '名稱 / 版位',
    key: 'title',
    minWidth: 160,
    render: (row) => h('div', [
      h('div', { class: 'font-semibold text-sm text-gray-800' }, row.title),
      h('div', { class: 'text-xs text-gray-400 mt-0.5' }, `${SLOT_CONFIGS[row.slot_type].label}`)
    ])
  },
  {
    title: '平台',
    key: 'platform',
    width: 80,
    render: (row) => h(NTag, { size: 'small', bordered: false, type: row.platform === 'APP' ? 'info' : 'success' }, { default: () => row.platform === 'APP' ? '📱 APP' : '🌐 官網' })
  },
  {
    title: '狀態',
    key: 'status',
    width: 100,
    render: (row) => h(NTag, { size: 'small', bordered: false, type: STATUS_CONFIG[row.status].type }, { default: () => STATUS_CONFIG[row.status].label })
  },
  {
    title: '排程',
    key: 'schedule',
    width: 150,
    render: (row) => h('div', { class: 'text-xs text-gray-500' }, [
      h('div', `上線：${formatDate(row.scheduled_start)}`),
      h('div', `下線：${formatDate(row.scheduled_end)}`)
    ])
  },
  {
    title: '提交人 / 時間',
    key: 'submitted',
    width: 140,
    render: (row) => h('div', { class: 'text-xs text-gray-500' }, [
      h('div', row.submitted_by),
      h('div', formatDateTime(row.submitted_at))
    ])
  },
  {
    title: '審核人 / 拒絕原因',
    key: 'reviewed',
    minWidth: 160,
    render: (row) => {
      if (row.status === 'PENDING') return h('span', { class: 'text-xs text-gray-400' }, '—')
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'text-gray-500' }, `${row.reviewed_by ?? ''} ${formatDateTime(row.reviewed_at)}`),
        row.reject_reason ? h('div', { class: 'text-red-500 mt-0.5' }, row.reject_reason) : null
      ])
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
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
      <h2 class="text-xl font-bold text-gray-800">前台內容審核</h2>
      <p class="text-sm text-gray-400 mt-1">審核營運提交的前台版位內容，核准後將於排程時間自動上線</p>
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
        <NSelect v-model:value="filterStatus"   :options="statusOptions"   placeholder="審核狀態" clearable style="width:130px" />
        <NSelect v-model:value="filterPlatform" :options="platformOptions" placeholder="平台"     clearable style="width:110px" />
        <NSelect v-model:value="filterSlotType" :options="slotTypeOptions" placeholder="版位類型" clearable style="width:160px" />
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
    <NModal v-model:show="showModal" preset="card" style="width: 460px"
      :title="reviewAction === 'approve' ? '確認核准' : '拒絕並退回'"
    >
      <div v-if="activeItem">
        <div class="flex gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <img :src="activeItem.image_url" class="w-20 h-12 object-cover rounded-lg flex-shrink-0" alt="" />
          <div>
            <p class="font-semibold text-gray-800 text-sm">{{ activeItem.title }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ SLOT_CONFIGS[activeItem.slot_type].label }} · {{ activeItem.platform }}</p>
            <p class="text-xs text-gray-500 mt-0.5">排程：{{ formatDate(activeItem.scheduled_start) }} — {{ formatDate(activeItem.scheduled_end) }}</p>
          </div>
        </div>

        <p v-if="reviewAction === 'approve'" class="text-sm text-gray-600 mb-4">
          核准後，此內容將於排程時間自動上線，請確認圖片與連結設定無誤。
        </p>

        <NForm v-if="reviewAction === 'reject'" label-placement="top">
          <NFormItem label="拒絕原因" required>
            <NInput
              v-model:value="rejectReason"
              type="textarea"
              :rows="3"
              placeholder="請說明拒絕原因，例如：圖片尺寸不符、內容有誤..."
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
