<template>
  <div class="p-4">
    <n-space vertical size="large">

      <!-- Filter Bar -->
      <n-card>
        <n-space justify="space-between" align="center" :wrap="false">
          <n-space align="center" :wrap="true">
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              :shortcuts="dateShortcuts"
              clearable
              style="width: 280px"
            />
            <n-select
              v-model:value="selectedProviderIds"
              :options="providerOptions"
              multiple
              clearable
              :placeholder="t('providerReport.filterAllProviders')"
              style="width: 240px"
            />
            <n-button type="primary" @click="handleQuery">
              <template #icon><n-icon><search-icon /></n-icon></template>
              {{ t('common.search') }}
            </n-button>
          </n-space>
          <n-space>
            <n-button @click="handleExport">
              <template #icon><n-icon><download-icon /></n-icon></template>
              {{ t('providerReport.exportCsv') }}
            </n-button>
            <n-button type="primary" @click="handleAdd">
              <template #icon><n-icon><add-icon /></n-icon></template>
              {{ t('providerReport.addProvider') }}
            </n-button>
          </n-space>
        </n-space>
      </n-card>

      <!-- Report Table -->
      <n-card>
        <n-data-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :bordered="false"
          striped
          :summary="summaryRow"
        />
      </n-card>

    </n-space>

    <!-- Add / Edit Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? t('providerReport.editTitle') : t('providerReport.addTitle')"
      style="width: 520px; max-width: 95vw"
    >
      <n-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-placement="left"
        label-width="110"
        require-mark-placement="right-hanging"
      >
        <n-form-item :label="t('providerReport.form.code')" path="code">
          <n-input
            v-model:value="form.code"
            :disabled="isEdit"
            :placeholder="t('providerReport.form.codePlaceholder')"
          />
        </n-form-item>
        <n-form-item :label="t('providerReport.form.name')" path="name">
          <n-input v-model:value="form.name" :placeholder="t('providerReport.form.namePlaceholder')" />
        </n-form-item>
        <n-form-item :label="t('providerReport.form.type')" path="type">
          <n-select v-model:value="form.type" :options="typeOptions" />
        </n-form-item>
        <n-form-item :label="t('providerReport.form.billingBasis')" path="billingBasis">
          <n-select v-model:value="form.billingBasis" :options="billingBasisOptions" />
        </n-form-item>
        <n-form-item :label="t('providerReport.form.contractRate')" path="contractRate">
          <n-input-number
            v-model:value="form.contractRate"
            :min="0"
            :max="100"
            :precision="2"
            style="width: 100%"
          >
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('providerReport.form.activationDate')" path="activationDate">
          <n-date-picker
            v-model:value="form.activationDateTs"
            type="date"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item :label="t('providerReport.form.notes')">
          <n-input
            v-model:value="form.notes"
            type="textarea"
            :rows="3"
            :placeholder="t('providerReport.form.notesPlaceholder')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ t('common.save') }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NCard, NSpace, NButton, NIcon, NDataTable, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSelect, NDatePicker, DataTableColumns, FormInst,
  FormRules, useMessage, DataTableCreateSummary
} from 'naive-ui'
import { SearchOutline as SearchIcon, DownloadOutline as DownloadIcon, AddOutline as AddIcon, CreateOutline as EditIcon } from '@vicons/ionicons5'
import type { ProviderType } from '@/types/game'

const { t } = useI18n()
const message = useMessage()

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingBasis = 'valid_turnover' | 'ggr'

interface ProviderContract {
  id: string
  code: string
  name: string
  type: ProviderType
  billingBasis: BillingBasis
  contractRate: number
  activationDate: string
  notes?: string
}

interface ProviderReportRow extends ProviderContract {
  totalBet: number
  validTurnover: number
  ggr: number
  billingAmount: number
  paymentAmount: number
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

let mockContracts: ProviderContract[] = [
  { id: 'PV-001', code: 'PG',   name: 'PG Soft',          type: 'SLOT',   billingBasis: 'valid_turnover', contractRate: 3.50, activationDate: '2024-01-01', notes: '長期合作夥伴' },
  { id: 'PV-002', code: 'EVO',  name: 'Evolution Gaming',  type: 'LIVE',   billingBasis: 'ggr',            contractRate: 12.0, activationDate: '2024-03-01', notes: '真人視訊' },
  { id: 'PV-003', code: 'JILI', name: 'JILI Games',        type: 'SLOT',   billingBasis: 'valid_turnover', contractRate: 4.00, activationDate: '2024-06-01' },
  { id: 'PV-004', code: 'PP',   name: 'Pragmatic Play',    type: 'SLOT',   billingBasis: 'valid_turnover', contractRate: 3.80, activationDate: '2024-08-15' },
  { id: 'PV-005', code: 'SABA', name: 'SABA Sports',       type: 'SPORTS', billingBasis: 'ggr',            contractRate: 8.00, activationDate: '2025-01-01', notes: '體育彩票' },
  { id: 'PV-006', code: 'KY',   name: 'KY Fishing',        type: 'SLOT',   billingBasis: 'valid_turnover', contractRate: 4.50, activationDate: '2024-09-01' },
]

// ─── Date helpers ──────────────────────────────────────────────────────────────

function getThisMonthRange(): [number, number] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return [start.getTime(), end.getTime()]
}

function getLastMonthRange(): [number, number] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end   = new Date(now.getFullYear(), now.getMonth(), 0)
  return [start.getTime(), end.getTime()]
}

// ─── State ─────────────────────────────────────────────────────────────────────

const loading = ref(false)
const contracts = ref<ProviderContract[]>([])
const dateRange = ref<[number, number]>(getThisMonthRange())
const selectedProviderIds = ref<string[]>([])
const reportRows = ref<ProviderReportRow[]>([])

const dateShortcuts = {
  [t('providerReport.thisMonth')]: getThisMonthRange,
  [t('providerReport.lastMonth')]: getLastMonthRange,
}

const showModal = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInst | null>(null)

const emptyForm = (): {
  id: string; code: string; name: string; type: ProviderType | null
  billingBasis: BillingBasis | null; contractRate: number | null
  activationDateTs: number | null; notes: string
} => ({
  id: '', code: '', name: '', type: null,
  billingBasis: null, contractRate: null,
  activationDateTs: null, notes: ''
})

const form = ref(emptyForm())

// ─── Options ───────────────────────────────────────────────────────────────────

const providerOptions = computed(() =>
  contracts.value.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))
)

const typeOptions: { label: string; value: ProviderType }[] = [
  { label: 'Slot',    value: 'SLOT' },
  { label: 'Live',    value: 'LIVE' },
  { label: 'Sports',  value: 'SPORTS' },
  { label: 'Lottery', value: 'LOTTERY' },
  { label: 'Card',    value: 'CARD' },
]

const billingBasisOptions = computed(() => [
  { label: t('providerReport.basisValidTurnover'), value: 'valid_turnover' },
  { label: t('providerReport.basisGgr'),           value: 'ggr' },
])

// ─── Form rules ────────────────────────────────────────────────────────────────

const formRules: FormRules = {
  code:            { required: true, message: t('providerReport.form.codeRequired'),    trigger: 'blur' },
  name:            { required: true, message: t('providerReport.form.nameRequired'),    trigger: 'blur' },
  type:            { required: true, message: t('providerReport.form.typeRequired'),    trigger: 'change' },
  billingBasis:    { required: true, message: t('providerReport.form.basisRequired'),   trigger: 'change' },
  contractRate:    { required: true, type: 'number', message: t('providerReport.form.rateRequired'), trigger: 'change' },
  activationDate:  { required: true, message: t('providerReport.form.dateRequired'),   trigger: 'change' },
}

// ─── Mock stat calculation ─────────────────────────────────────────────────────

function calcStats(contract: ProviderContract, _range: [number, number]): ProviderReportRow {
  const seed = contract.id.charCodeAt(contract.id.length - 1)
  const totalBet     = Math.round((seed * 180000 + 500000) * (0.85 + Math.random() * 0.3))
  const validTurnover = Math.round(totalBet * (0.88 + Math.random() * 0.06))
  const payout       = Math.round(totalBet * (0.92 + Math.random() * 0.05))
  const ggr          = totalBet - payout
  const billingAmount = contract.billingBasis === 'valid_turnover' ? validTurnover : Math.max(ggr, 0)
  const paymentAmount = Math.round(billingAmount * contract.contractRate / 100)
  return { ...contract, totalBet, validTurnover, ggr: Math.max(ggr, 0), billingAmount, paymentAmount }
}

// ─── Table ─────────────────────────────────────────────────────────────────────

const tableData = computed<ProviderReportRow[]>(() => reportRows.value)

const typeTagType: Record<ProviderType, 'info' | 'success' | 'warning' | 'default' | 'primary' | 'error'> = {
  SLOT: 'info', LIVE: 'success', SPORTS: 'warning', LOTTERY: 'primary', CARD: 'default'
}

const fmt = (n: number) => n.toLocaleString('zh-TW')

const columns = computed<DataTableColumns<ProviderReportRow>>(() => [
  {
    title: t('providerReport.col.provider'),
    key: 'name',
    width: 160,
    render: row => h('div', [
      h('div', { class: 'font-semibold text-sm' }, row.name),
      h('div', { class: 'text-xs text-gray-400' }, row.code)
    ])
  },
  {
    title: t('providerReport.col.type'),
    key: 'type',
    width: 90,
    render: row => h('n-tag' as any, { type: typeTagType[row.type], size: 'small', bordered: false }, { default: () => row.type })
  },
  {
    title: t('providerReport.col.billingBasis'),
    key: 'billingBasis',
    width: 120,
    render: row => h('span', { class: 'text-sm' },
      row.billingBasis === 'valid_turnover'
        ? t('providerReport.basisValidTurnover')
        : t('providerReport.basisGgr')
    )
  },
  {
    title: t('providerReport.col.contractRate'),
    key: 'contractRate',
    width: 100,
    render: row => h('span', { class: 'font-mono font-semibold text-blue-500' }, `${row.contractRate.toFixed(2)}%`)
  },
  {
    title: t('providerReport.col.activationDate'),
    key: 'activationDate',
    width: 110,
    render: row => h('span', { class: 'text-sm text-gray-500' }, row.activationDate)
  },
  {
    title: t('providerReport.col.totalBet'),
    key: 'totalBet',
    width: 130,
    render: row => h('span', { class: 'font-mono' }, fmt(row.totalBet))
  },
  {
    title: t('providerReport.col.billingAmount'),
    key: 'billingAmount',
    width: 140,
    render: row => h('div', [
      h('div', { class: 'font-mono' }, fmt(row.billingAmount)),
      h('div', { class: 'text-xs text-gray-400' },
        row.billingBasis === 'valid_turnover'
          ? t('providerReport.basisValidTurnover')
          : t('providerReport.basisGgr')
      )
    ])
  },
  {
    title: t('providerReport.col.paymentAmount'),
    key: 'paymentAmount',
    width: 140,
    render: row => h('span', { class: 'font-mono font-bold text-red-500 text-base' }, fmt(row.paymentAmount))
  },
  {
    title: t('common.action'),
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: row => h(NButton, {
      size: 'small',
      secondary: true,
      onClick: () => handleEdit(row)
    }, {
      default: () => t('common.edit'),
      icon: () => h(NIcon, null, { default: () => h(EditIcon) })
    })
  }
])

const summaryRow: DataTableCreateSummary = (pageData) => {
  const rows = pageData as unknown as ProviderReportRow[]
  const sumBet     = rows.reduce((s, r) => s + r.totalBet, 0)
  const sumBilling = rows.reduce((s, r) => s + r.billingAmount, 0)
  const sumPayment = rows.reduce((s, r) => s + r.paymentAmount, 0)
  return {
    name:          { value: h('span', { class: 'font-bold' }, t('providerReport.totalRow')) },
    type:          { value: '' },
    billingBasis:  { value: '' },
    contractRate:  { value: '' },
    activationDate:{ value: '' },
    totalBet:      { value: h('span', { class: 'font-mono font-bold' }, fmt(sumBet)) },
    billingAmount: { value: h('span', { class: 'font-mono font-bold' }, fmt(sumBilling)) },
    paymentAmount: { value: h('span', { class: 'font-mono font-bold text-red-500 text-base' }, fmt(sumPayment)) },
    actions:       { value: '' }
  }
}

// ─── Actions ───────────────────────────────────────────────────────────────────

async function handleQuery() {
  loading.value = true
  await new Promise(r => setTimeout(r, 400))
  let filtered = contracts.value
  if (selectedProviderIds.value.length > 0) {
    filtered = filtered.filter(c => selectedProviderIds.value.includes(c.id))
  }
  reportRows.value = filtered.map(c => calcStats(c, dateRange.value))
  loading.value = false
}

function handleAdd() {
  isEdit.value = false
  form.value = emptyForm()
  showModal.value = true
}

function handleEdit(row: ProviderReportRow) {
  isEdit.value = true
  form.value = {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    billingBasis: row.billingBasis,
    contractRate: row.contractRate,
    activationDateTs: new Date(row.activationDate).getTime(),
    notes: row.notes ?? ''
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  submitLoading.value = true
  await new Promise(r => setTimeout(r, 400))

  const activationDate = form.value.activationDateTs
    ? new Date(form.value.activationDateTs).toISOString().split('T')[0]
    : ''

  if (isEdit.value) {
    const idx = mockContracts.findIndex(c => c.id === form.value.id)
    if (idx !== -1) {
      mockContracts[idx] = {
        ...mockContracts[idx],
        name: form.value.name,
        type: form.value.type!,
        billingBasis: form.value.billingBasis!,
        contractRate: form.value.contractRate!,
        activationDate,
        notes: form.value.notes
      }
    }
    message.success(t('providerReport.editSuccess'))
  } else {
    const newId = `PV-${String(mockContracts.length + 1).padStart(3, '0')}`
    const exists = mockContracts.find(c => c.code.toUpperCase() === form.value.code.toUpperCase())
    if (exists) {
      message.error(t('providerReport.codeDuplicate'))
      submitLoading.value = false
      return
    }
    mockContracts.push({
      id: newId,
      code: form.value.code.toUpperCase(),
      name: form.value.name,
      type: form.value.type!,
      billingBasis: form.value.billingBasis!,
      contractRate: form.value.contractRate!,
      activationDate,
      notes: form.value.notes
    })
    message.success(t('providerReport.addSuccess'))
  }

  contracts.value = [...mockContracts]
  showModal.value = false
  submitLoading.value = false
  handleQuery()
}

function handleExport() {
  const headers = [
    t('providerReport.col.provider'),
    t('providerReport.col.type'),
    t('providerReport.col.billingBasis'),
    t('providerReport.col.contractRate'),
    t('providerReport.col.activationDate'),
    t('providerReport.col.totalBet'),
    t('providerReport.col.billingAmount'),
    t('providerReport.col.paymentAmount')
  ]
  const rows = tableData.value.map(r => [
    r.name, r.type,
    r.billingBasis === 'valid_turnover' ? t('providerReport.basisValidTurnover') : t('providerReport.basisGgr'),
    `${r.contractRate}%`,
    r.activationDate,
    r.totalBet, r.billingAmount, r.paymentAmount
  ])
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `provider_report_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  message.success(t('providerReport.exportSuccess'))
}

// ─── Init ──────────────────────────────────────────────────────────────────────

onMounted(() => {
  contracts.value = [...mockContracts]
  handleQuery()
})
</script>
