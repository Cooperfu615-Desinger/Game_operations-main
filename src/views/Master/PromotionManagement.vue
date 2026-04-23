<script setup lang="ts">
import { ref, computed, onMounted, h, reactive } from 'vue'
import {
  NCard, NDataTable, NButton, NSelect, NTag, NIcon, NSpace,
  NDrawer, NDrawerContent, NForm, NFormItem, NInput, NSwitch,
  NDatePicker, NInputNumber, NGrid, NGridItem, NStatistic,
  NPopconfirm, NTooltip, NDivider, useMessage, DataTableColumns
} from 'naive-ui'
import {
  AddOutline, TrashOutline, CheckmarkCircleOutline,
  SendOutline, CreateOutline, EyeOutline
} from '@vicons/ionicons5'
import { promotionApi } from '@/api/promotion'
import type { Promotion, PromotionType, PromotionStatus, DepositTier } from '@/types/promotion'
import { PROMOTION_TYPE_CONFIG, PROMOTION_STATUS_CONFIG } from '@/types/promotion'

const message = useMessage()

// ── Summary ───────────────────────────────────────────────────
const allItems = ref<Promotion[]>([])
const loading  = ref(false)

const summary = computed(() => ({
  active:  allItems.value.filter(r => r.status === 'ACTIVE').length,
  pending: allItems.value.filter(r => r.status === 'PENDING').length,
  draft:   allItems.value.filter(r => r.status === 'DRAFT' || r.status === 'REJECTED').length,
  total:   allItems.value.length
}))

// ── Filters ───────────────────────────────────────────────────
const filterType   = ref<PromotionType | undefined>(undefined)
const filterStatus = ref<PromotionStatus | undefined>(undefined)
const filterKw     = ref('')

const typeOptions = [
  { label: '全部類型', value: undefined },
  ...Object.entries(PROMOTION_TYPE_CONFIG).map(([k, v]) => ({ label: v.label, value: k as PromotionType }))
]
const statusOptions = [
  { label: '全部狀態',  value: undefined },
  { label: '草稿',     value: 'DRAFT'     as PromotionStatus },
  { label: '待審核',   value: 'PENDING'   as PromotionStatus },
  { label: '已核准',   value: 'APPROVED'  as PromotionStatus },
  { label: '已拒絕',   value: 'REJECTED'  as PromotionStatus },
  { label: '上線中',   value: 'ACTIVE'    as PromotionStatus },
  { label: '排程中',   value: 'SCHEDULED' as PromotionStatus },
  { label: '已過期',   value: 'EXPIRED'   as PromotionStatus }
]

const filtered = computed(() => allItems.value.filter(r => {
  if (filterType.value   && r.type   !== filterType.value)   return false
  if (filterStatus.value && r.status !== filterStatus.value) return false
  if (filterKw.value     && !r.name.includes(filterKw.value)) return false
  return true
}))

const load = async () => {
  loading.value = true
  const res = await promotionApi.getPromotions()
  if (res.code === 0) allItems.value = res.data ?? []
  loading.value = false
}
onMounted(load)

// ── Drawer ────────────────────────────────────────────────────
const showDrawer  = ref(false)
const drawerMode  = ref<'create' | 'edit'>('create')
const saving      = ref(false)
const submitting  = ref(false)

const emptyForm = (): Partial<Promotion> => ({
  name: '', type: 'DEPOSIT', description: '',
  tiers: [{ id: 't1', min_deposit: 100, reward_silver: 500 }],
  reward_silver: 100, target_vip_level: undefined,
  max_claims_per_user: -1,
  is_limited: false, scheduled_start: undefined, scheduled_end: undefined
})

const form = reactive<Partial<Promotion>>(emptyForm())
const editId = ref<string | undefined>(undefined)

const isTierType = computed(() =>
  form.type ? PROMOTION_TYPE_CONFIG[form.type as PromotionType].isTier : false
)

const openCreate = () => {
  Object.assign(form, emptyForm())
  editId.value = undefined
  drawerMode.value = 'create'
  showDrawer.value = true
}

const openEdit = (row: Promotion) => {
  Object.assign(form, {
    ...row,
    tiers: row.tiers ? row.tiers.map(t => ({ ...t })) : [{ id: 't1', min_deposit: 100, reward_silver: 500 }]
  })
  editId.value = row.id
  drawerMode.value = 'edit'
  showDrawer.value = true
}

// Tier helpers
const addTier = () => {
  if (!form.tiers) form.tiers = []
  form.tiers.push({ id: `t${Date.now()}`, min_deposit: 0, reward_silver: 0 })
}
const removeTier = (idx: number) => { form.tiers?.splice(idx, 1) }

const saveDraft = async () => {
  if (!form.name?.trim()) { message.warning('請填寫活動名稱'); return }
  saving.value = true
  const res = await promotionApi.savePromotion({ ...form, id: editId.value, status: 'DRAFT', created_by: 'operator' })
  saving.value = false
  if (res.code === 0) {
    message.success('已儲存草稿')
    showDrawer.value = false
    await load()
  }
}

const saveAndSubmit = async () => {
  if (!form.name?.trim()) { message.warning('請填寫活動名稱'); return }
  saving.value = true
  const saveRes = await promotionApi.savePromotion({ ...form, id: editId.value, status: 'DRAFT', created_by: 'operator' })
  if (saveRes.code !== 0) { saving.value = false; message.error('儲存失敗'); return }
  const submitRes = await promotionApi.submitForReview(saveRes.data!.id)
  saving.value = false
  if (submitRes.code === 0) {
    message.success('已送出審核')
    showDrawer.value = false
    await load()
  }
}

// Submit existing DRAFT/REJECTED item
const submitItem = async (row: Promotion) => {
  submitting.value = true
  const res = await promotionApi.submitForReview(row.id)
  submitting.value = false
  if (res.code === 0) { message.success('已送出審核'); await load() }
}

// Toggle active/expired
const handleToggle = async (row: Promotion, active: boolean) => {
  const res = await promotionApi.toggleStatus(row.id, active)
  if (res.code === 0) { message.success(active ? '已上線' : '已下架'); await load() }
}

const handleDelete = async (row: Promotion) => {
  const res = await promotionApi.deletePromotion(row.id)
  if (res.code === 0) { message.success('已刪除'); await load() }
}

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('zh-TW') : '—'
const fmtNum  = (n: number) => n.toLocaleString()
const canEdit = (s: PromotionStatus) => s === 'DRAFT' || s === 'REJECTED'

// ── Table ─────────────────────────────────────────────────────
const columns = computed<DataTableColumns<Promotion>>(() => [
  {
    title: '活動名稱',
    key: 'name',
    minWidth: 180,
    render: (row) => h('div', [
      h('div', { class: 'font-semibold text-sm text-gray-800' }, row.name),
      row.description ? h('div', { class: 'text-xs text-gray-400 mt-0.5 truncate max-w-[200px]' }, row.description) : null
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
          row.tiers.slice(0, 3).map(t =>
            h('div', `儲 ${fmtNum(t.min_deposit)} 金 → ${fmtNum(t.reward_silver)} 銀`)
          ).concat(row.tiers.length > 3 ? [h('div', { class: 'text-gray-400' }, `...共 ${row.tiers.length} 組`)] : [])
        )
      }
      return h('div', { class: 'text-sm text-gray-700' }, [
        h('span', '獎勵 '),
        h('span', { class: 'font-semibold text-yellow-600' }, `${fmtNum(row.reward_silver ?? 0)} 銀幣`),
        row.target_vip_level ? h('div', { class: 'text-xs text-gray-400 mt-0.5' }, `VIP ${row.target_vip_level}`) : null
      ])
    }
  },
  {
    title: '每人上限',
    key: 'max_claims_per_user',
    width: 90,
    render: (row) => h('span', { class: 'text-sm text-gray-600' },
      row.max_claims_per_user === -1 ? '不限' : `${row.max_claims_per_user} 次`
    )
  },
  {
    title: '有效期間',
    key: 'schedule',
    width: 150,
    render: (row) => {
      if (!row.is_limited) return h('span', { class: 'text-xs text-gray-400' }, '長期有效')
      return h('div', { class: 'text-xs text-gray-500' }, [
        h('div', `開始：${fmtDate(row.scheduled_start)}`),
        h('div', `結束：${fmtDate(row.scheduled_end)}`)
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
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right' as const,
    render: (row) => h(NSpace, { size: 4 }, {
      default: () => {
        const btns = []
        // Edit (only DRAFT/REJECTED)
        if (canEdit(row.status)) {
          btns.push(h(NButton, {
            size: 'small', type: 'primary', quaternary: true,
            onClick: () => openEdit(row)
          }, { default: () => [h(NIcon, null, { default: () => h(CreateOutline) }), ' 編輯'] }))
          btns.push(h(NButton, {
            size: 'small', type: 'warning', quaternary: true,
            onClick: () => submitItem(row)
          }, { default: () => [h(NIcon, null, { default: () => h(SendOutline) }), ' 送審'] }))
        }
        // Toggle ACTIVE/EXPIRED
        if (row.status === 'ACTIVE') {
          btns.push(h(NPopconfirm, { onPositiveClick: () => handleToggle(row, false) }, {
            trigger: () => h(NButton, { size: 'small', type: 'default', quaternary: true },
              { default: () => '下架' }),
            default: () => '確認下架此優惠活動？'
          }))
        }
        if (row.status === 'APPROVED' || row.status === 'SCHEDULED') {
          btns.push(h(NButton, {
            size: 'small', type: 'success', quaternary: true,
            onClick: () => handleToggle(row, true)
          }, { default: () => '上線' }))
        }
        // Delete (DRAFT only)
        if (row.status === 'DRAFT') {
          btns.push(h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
            trigger: () => h(NButton, { size: 'small', type: 'error', quaternary: true },
              { default: () => [h(NIcon, null, { default: () => h(TrashOutline) })] }),
            default: () => '確認刪除草稿？'
          }))
        }
        if (btns.length === 0) return [h('span', { class: 'text-xs text-gray-400' }, '—')]
        return btns
      }
    })
  }
])
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">優惠活動管理</h2>
      <p class="text-sm text-gray-400 mt-1">管理各類優惠活動方案，送審後由主管核准上線</p>
    </div>

    <!-- Summary -->
    <NGrid :cols="4" :x-gap="16" class="mb-5">
      <NGridItem>
        <NCard size="small" embedded class="border-l-4 border-green-400">
          <NStatistic label="上線中" :value="summary.active" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded class="border-l-4 border-yellow-400">
          <NStatistic label="待審核" :value="summary.pending" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded class="border-l-4 border-gray-300">
          <NStatistic label="草稿/已拒絕" :value="summary.draft" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard size="small" embedded>
          <NStatistic label="活動總數" :value="summary.total" />
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- Filters + Add -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm mb-5">
      <div class="flex flex-wrap items-center gap-3">
        <NInput v-model:value="filterKw" placeholder="搜尋活動名稱" clearable style="width:200px" />
        <NSelect v-model:value="filterType"   :options="typeOptions"   placeholder="優惠類型" clearable style="width:150px" />
        <NSelect v-model:value="filterStatus" :options="statusOptions" placeholder="狀態"     clearable style="width:130px" />
        <div class="ml-auto">
          <NButton type="primary" @click="openCreate">
            <template #icon><NIcon :component="AddOutline" /></template>
            新增活動
          </NButton>
        </div>
      </div>
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
        scroll-x="1000"
      />
    </NCard>

    <!-- Drawer -->
    <NDrawer v-model:show="showDrawer" :width="520" placement="right">
      <NDrawerContent :title="drawerMode === 'create' ? '新增優惠活動' : '編輯優惠活動'" closable>
        <NForm label-placement="top" :label-width="80" size="medium">

          <NFormItem label="活動名稱" required>
            <NInput v-model:value="(form as any).name" placeholder="例：端午節加碼！儲值 500 送 50000" />
          </NFormItem>

          <NFormItem label="優惠類型" required>
            <NSelect
              v-model:value="(form as any).type"
              :options="Object.entries(PROMOTION_TYPE_CONFIG).map(([k,v]) => ({ label: v.label, value: k }))"
              placeholder="選擇類型"
            />
          </NFormItem>

          <NFormItem label="活動說明">
            <NInput v-model:value="(form as any).description" type="textarea" :rows="2" placeholder="選填，顯示於活動列表" />
          </NFormItem>

          <NDivider />

          <!-- Tier-based -->
          <template v-if="isTierType">
            <NFormItem label="儲值方案">
              <div class="w-full space-y-2">
                <div class="grid grid-cols-[1fr_1fr_36px] gap-2 text-xs text-gray-500 px-1">
                  <span>儲值金額（金幣）</span>
                  <span>獲得銀幣</span>
                  <span></span>
                </div>
                <div
                  v-for="(tier, idx) in (form as any).tiers"
                  :key="tier.id"
                  class="grid grid-cols-[1fr_1fr_36px] gap-2 items-center"
                >
                  <NInputNumber v-model:value="tier.min_deposit"  :min="1" placeholder="金幣" />
                  <NInputNumber v-model:value="tier.reward_silver" :min="1" placeholder="銀幣" />
                  <NButton size="small" quaternary type="error" @click="removeTier(idx)" :disabled="(form as any).tiers?.length <= 1">
                    <NIcon :component="TrashOutline" />
                  </NButton>
                </div>
                <NButton dashed size="small" class="w-full mt-1" @click="addTier">
                  <template #icon><NIcon :component="AddOutline" /></template>
                  新增一組方案
                </NButton>
              </div>
            </NFormItem>
          </template>

          <!-- Flat reward -->
          <template v-else>
            <NFormItem label="獎勵銀幣" required>
              <NInputNumber v-model:value="(form as any).reward_silver" :min="1" placeholder="銀幣數量" class="w-full" />
            </NFormItem>
            <NFormItem v-if="(form as any).type === 'VIP_UPGRADE'" label="目標 VIP 等級" required>
              <NInputNumber v-model:value="(form as any).target_vip_level" :min="1" :max="20" placeholder="等級" class="w-full" />
            </NFormItem>
          </template>

          <NDivider />

          <NFormItem label="每人最多領取次數">
            <div class="flex items-center gap-3">
              <NSwitch
                :value="(form as any).max_claims_per_user !== -1"
                @update:value="(v: boolean) => { (form as any).max_claims_per_user = v ? 1 : -1 }"
              />
              <span class="text-sm text-gray-500">
                {{ (form as any).max_claims_per_user === -1 ? '不限次數' : '限制次數' }}
              </span>
              <NInputNumber
                v-if="(form as any).max_claims_per_user !== -1"
                v-model:value="(form as any).max_claims_per_user"
                :min="1" style="width:100px"
              />
            </div>
          </NFormItem>

          <NFormItem label="時間限定活動">
            <NSwitch v-model:value="(form as any).is_limited" />
            <span class="ml-3 text-sm text-gray-500">
              {{ (form as any).is_limited ? '指定起訖時間' : '長期有效' }}
            </span>
          </NFormItem>

          <template v-if="(form as any).is_limited">
            <NFormItem label="開始時間">
              <NDatePicker
                v-model:value="(form as any).scheduled_start"
                type="datetime"
                value-format="yyyy-MM-dd'T'HH:mm:ss'Z'"
                clearable
                class="w-full"
              />
            </NFormItem>
            <NFormItem label="結束時間">
              <NDatePicker
                v-model:value="(form as any).scheduled_end"
                type="datetime"
                value-format="yyyy-MM-dd'T'HH:mm:ss'Z'"
                clearable
                class="w-full"
              />
            </NFormItem>
          </template>

        </NForm>

        <template #footer>
          <div class="flex justify-end gap-3">
            <NButton quaternary @click="showDrawer = false">取消</NButton>
            <NButton :loading="saving" @click="saveDraft">儲存草稿</NButton>
            <NButton type="primary" :loading="saving" @click="saveAndSubmit">
              <template #icon><NIcon :component="SendOutline" /></template>
              送出審核
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
