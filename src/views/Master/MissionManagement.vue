<script setup lang="ts">
import { ref, computed, onMounted, h, reactive } from 'vue'
import {
  NCard, NDataTable, NButton, NSelect, NTag, NIcon, NSpace,
  NDrawer, NDrawerContent, NForm, NFormItem, NInput, NSwitch,
  NDatePicker, NInputNumber, NGrid, NGridItem, NStatistic,
  NPopconfirm, NDivider, NAlert, useMessage, DataTableColumns
} from 'naive-ui'
import {
  AddOutline, TrashOutline, SendOutline, CreateOutline
} from '@vicons/ionicons5'
import { missionApi } from '@/api/mission'
import type {
  Mission, MissionType, MissionStatus, ConditionType,
  RewardType, MissionReward, CheckinMilestone
} from '@/types/mission'
import {
  MISSION_TYPE_CONFIG, MISSION_STATUS_CONFIG,
  CONDITION_TYPE_CONFIG, REWARD_TYPE_CONFIG
} from '@/types/mission'

const message = useMessage()

// ── Data + Summary ────────────────────────────────────────────
const allItems = ref<Mission[]>([])
const loading  = ref(false)

const summary = computed(() => ({
  active:  allItems.value.filter(r => r.status === 'ACTIVE').length,
  pending: allItems.value.filter(r => r.status === 'PENDING').length,
  draft:   allItems.value.filter(r => r.status === 'DRAFT' || r.status === 'REJECTED').length,
  total:   allItems.value.length
}))

// ── Filters ───────────────────────────────────────────────────
const filterType   = ref<MissionType | undefined>(undefined)
const filterStatus = ref<MissionStatus | undefined>(undefined)
const filterKw     = ref('')

const typeOptions = [
  { label: '全部類型', value: undefined },
  ...Object.entries(MISSION_TYPE_CONFIG).map(([k, v]) => ({ label: v.label, value: k as MissionType }))
]
const statusOptions = [
  { label: '全部狀態',   value: undefined },
  { label: '草稿',      value: 'DRAFT'     as MissionStatus },
  { label: '待審核',    value: 'PENDING'   as MissionStatus },
  { label: '已拒絕',    value: 'REJECTED'  as MissionStatus },
  { label: '上線中',    value: 'ACTIVE'    as MissionStatus },
  { label: '排程中',    value: 'SCHEDULED' as MissionStatus },
  { label: '已過期',    value: 'EXPIRED'   as MissionStatus }
]

const filtered = computed(() => allItems.value.filter(r => {
  if (filterType.value   && r.type   !== filterType.value)    return false
  if (filterStatus.value && r.status !== filterStatus.value)  return false
  if (filterKw.value     && !r.name.includes(filterKw.value)) return false
  return true
}))

const load = async () => {
  loading.value = true
  const res = await missionApi.getMissions()
  if (res.code === 0) allItems.value = res.data ?? []
  loading.value = false
}
onMounted(load)

// ── Drawer ────────────────────────────────────────────────────
const showDrawer = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const saving     = ref(false)
const editId     = ref<string | undefined>(undefined)

type FormShape = {
  name: string; type: MissionType; description: string
  condition_type: ConditionType; condition_target: number; condition_desc: string
  rewards: MissionReward[]
  cycle_days: number; daily_silver: number; milestones: CheckinMilestone[]
  is_limited: boolean; scheduled_start?: string; scheduled_end?: string
}

const emptyForm = (): FormShape => ({
  name: '', type: 'DAILY', description: '',
  condition_type: 'LOGIN', condition_target: 1, condition_desc: '',
  rewards: [{ id: `r${Date.now()}`, type: 'SILVER', silver_amount: 100 }],
  cycle_days: 30, daily_silver: 100,
  milestones: [{ id: `ml${Date.now()}`, day: 7, rewards: [{ id: `r${Date.now()}`, type: 'SILVER', silver_amount: 500 }] }],
  is_limited: false, scheduled_start: undefined, scheduled_end: undefined
})

const form = reactive<FormShape>(emptyForm())

const isCheckin = computed(() => form.type === 'CHECKIN')

const openCreate = () => {
  Object.assign(form, emptyForm())
  editId.value = undefined
  drawerMode.value = 'create'
  showDrawer.value = true
}

const openEdit = (row: Mission) => {
  Object.assign(form, {
    name: row.name, type: row.type, description: row.description ?? '',
    condition_type: row.condition_type ?? 'LOGIN',
    condition_target: row.condition_target ?? 1,
    condition_desc: row.condition_desc ?? '',
    rewards: (row.rewards ?? []).map(r => ({ ...r })),
    cycle_days: row.cycle_days ?? 30,
    daily_silver: row.daily_silver ?? 100,
    milestones: (row.milestones ?? []).map(m => ({
      ...m, rewards: m.rewards.map(r => ({ ...r }))
    })),
    is_limited: row.is_limited,
    scheduled_start: row.scheduled_start,
    scheduled_end: row.scheduled_end
  })
  editId.value = row.id
  drawerMode.value = 'edit'
  showDrawer.value = true
}

// ── Reward helpers ────────────────────────────────────────────
const rewardTypeOptions = Object.entries(REWARD_TYPE_CONFIG).map(([k, v]) => ({
  label: `${v.icon} ${v.label}`, value: k as RewardType
}))

const newReward = (): MissionReward => ({ id: `r${Date.now()}`, type: 'SILVER', silver_amount: 100 })

const addReward = (list: MissionReward[]) => list.push(newReward())
const removeReward = (list: MissionReward[], idx: number) => list.splice(idx, 1)

// ── Milestone helpers ─────────────────────────────────────────
const addMilestone = () => {
  form.milestones.push({ id: `ml${Date.now()}`, day: 0, rewards: [newReward()] })
}
const removeMilestone = (idx: number) => form.milestones.splice(idx, 1)

// ── Condition label auto-fill ─────────────────────────────────
const conditionOptions = Object.entries(CONDITION_TYPE_CONFIG).map(([k, v]) => ({
  label: v.label, value: k as ConditionType
}))

const onConditionChange = () => {
  if (form.condition_type !== 'CUSTOM') {
    const cfg = CONDITION_TYPE_CONFIG[form.condition_type]
    form.condition_desc = `${cfg.label} ${form.condition_target} ${cfg.unit}`
  }
}

// ── Save / Submit ─────────────────────────────────────────────
const buildPayload = () => ({
  name: form.name, type: form.type, description: form.description,
  condition_type: isCheckin.value ? undefined : form.condition_type,
  condition_target: isCheckin.value ? undefined : form.condition_target,
  condition_desc: isCheckin.value ? undefined : form.condition_desc,
  rewards: isCheckin.value ? [] : form.rewards,
  cycle_days: isCheckin.value ? form.cycle_days : undefined,
  daily_silver: isCheckin.value ? form.daily_silver : undefined,
  milestones: isCheckin.value ? form.milestones : [],
  is_limited: form.is_limited,
  scheduled_start: form.is_limited ? form.scheduled_start : undefined,
  scheduled_end:   form.is_limited ? form.scheduled_end   : undefined,
  created_by: 'operator'
})

const saveDraft = async () => {
  if (!form.name.trim()) { message.warning('請填寫任務名稱'); return }
  saving.value = true
  const res = await missionApi.saveMission({ ...buildPayload(), id: editId.value })
  saving.value = false
  if (res.code === 0) {
    message.success('已儲存草稿')
    showDrawer.value = false
    await load()
  }
}

const saveAndSubmit = async () => {
  if (!form.name.trim()) { message.warning('請填寫任務名稱'); return }
  saving.value = true
  const saveRes = await missionApi.saveMission({ ...buildPayload(), id: editId.value })
  if (saveRes.code !== 0) { saving.value = false; message.error('儲存失敗'); return }
  const submitRes = await missionApi.submitForReview(saveRes.data!.id, 'operator')
  saving.value = false
  if (submitRes.code === 0) {
    message.success('已送出審核')
    showDrawer.value = false
    await load()
  }
}

const submitItem = async (row: Mission) => {
  const res = await missionApi.submitForReview(row.id, 'operator')
  if (res.code === 0) { message.success('已送出審核'); await load() }
}

const handleToggle = async (row: Mission, active: boolean) => {
  const res = await missionApi.toggleStatus(row.id, active)
  if (res.code === 0) { message.success(active ? '已上線' : '已下架'); await load() }
}

const handleDelete = async (row: Mission) => {
  const res = await missionApi.deleteMission(row.id)
  if (res.code === 0) { message.success('已刪除'); await load() }
}

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('zh-TW') : '—'
const fmtNum  = (n: number) => n.toLocaleString()
const canEdit = (s: MissionStatus) => s === 'DRAFT' || s === 'REJECTED'

const rewardSummary = (rewards?: MissionReward[]) => {
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
      row.description ? h('div', { class: 'text-xs text-gray-400 mt-0.5 truncate max-w-[200px]' }, row.description) : null
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
    title: '完成條件 / 設定',
    key: 'condition',
    minWidth: 160,
    render: (row) => {
      if (row.type === 'CHECKIN') {
        return h('div', { class: 'text-xs text-gray-600 space-y-0.5' }, [
          h('div', `循環 ${row.cycle_days} 天，每日 ${fmtNum(row.daily_silver ?? 0)} 銀幣`),
          h('div', { class: 'text-gray-400' }, `里程碑：第 ${(row.milestones ?? []).map(m => m.day).join('、')} 天`)
        ])
      }
      return h('div', { class: 'text-xs text-gray-600' }, [
        h('div', row.condition_desc ?? '—'),
        h('div', { class: 'text-gray-400 mt-0.5' },
          `進度：0 / ${row.condition_target}${CONDITION_TYPE_CONFIG[row.condition_type!]?.unit ?? ''}`
        )
      ])
    }
  },
  {
    title: '獎勵',
    key: 'rewards',
    minWidth: 150,
    render: (row) => {
      if (row.type === 'CHECKIN') {
        const ms = row.milestones ?? []
        const lastMs = ms[ms.length - 1]
        return h('div', { class: 'text-xs text-gray-600' }, [
          h('div', '每日基礎 + 里程碑額外獎勵'),
          lastMs ? h('div', { class: 'text-gray-400 mt-0.5' }, `最終獎：${rewardSummary(lastMs.rewards)}`) : null
        ])
      }
      return h('span', { class: 'text-xs text-gray-700' }, rewardSummary(row.rewards))
    }
  },
  {
    title: '有效期間',
    key: 'schedule',
    width: 130,
    render: (row) => {
      if (!row.is_limited) return h('span', { class: 'text-xs text-gray-400' }, '長期')
      return h('div', { class: 'text-xs text-gray-500' }, [
        h('div', fmtDate(row.scheduled_start)),
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
      type: MISSION_STATUS_CONFIG[row.status].type
    }, { default: () => MISSION_STATUS_CONFIG[row.status].label })
  },
  {
    title: '領取數',
    key: 'claim_count',
    width: 80,
    render: (row) => h('span', { class: 'text-sm text-gray-600' }, fmtNum(row.claim_count))
  },
  {
    title: '操作',
    key: 'actions',
    width: 190,
    fixed: 'right' as const,
    render: (row) => h(NSpace, { size: 4 }, {
      default: () => {
        const btns = []
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
        if (row.status === 'ACTIVE') {
          btns.push(h(NPopconfirm, { onPositiveClick: () => handleToggle(row, false) }, {
            trigger: () => h(NButton, { size: 'small', type: 'default', quaternary: true }, { default: () => '下架' }),
            default: () => '確認下架此任務？'
          }))
        }
        if (row.status === 'APPROVED' || row.status === 'SCHEDULED') {
          btns.push(h(NButton, {
            size: 'small', type: 'success', quaternary: true,
            onClick: () => handleToggle(row, true)
          }, { default: () => '上線' }))
        }
        if (row.status === 'DRAFT') {
          btns.push(h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
            trigger: () => h(NButton, { size: 'small', type: 'error', quaternary: true },
              { default: () => h(NIcon, null, { default: () => h(TrashOutline) }) }),
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
      <h2 class="text-xl font-bold text-gray-800">任務管理</h2>
      <p class="text-sm text-gray-400 mt-1">管理每日任務、活動任務與每日簽到，完成後自動寄送信箱供玩家領取</p>
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
          <NStatistic label="任務總數" :value="summary.total" />
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- Filters + Add -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm mb-5">
      <div class="flex flex-wrap items-center gap-3">
        <NInput v-model:value="filterKw" placeholder="搜尋任務名稱" clearable style="width:200px" />
        <NSelect v-model:value="filterType"   :options="typeOptions"   placeholder="任務類型" clearable style="width:130px" />
        <NSelect v-model:value="filterStatus" :options="statusOptions" placeholder="狀態"     clearable style="width:130px" />
        <div class="ml-auto">
          <NButton type="primary" @click="openCreate">
            <template #icon><NIcon :component="AddOutline" /></template>
            新增任務
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
        scroll-x="1100"
      />
    </NCard>

    <!-- Drawer -->
    <NDrawer v-model:show="showDrawer" :width="560" placement="right">
      <NDrawerContent :title="drawerMode === 'create' ? '新增任務' : '編輯任務'" closable>
        <NForm label-placement="top" size="medium">

          <!-- 基本資訊 -->
          <NFormItem label="任務名稱" required>
            <NInput v-model:value="form.name" placeholder="例：端午節限定：龍舟競速！" />
          </NFormItem>

          <NFormItem label="任務類型" required>
            <NSelect
              v-model:value="form.type"
              :options="typeOptions.filter(o => o.value !== undefined)"
              placeholder="選擇類型"
            />
          </NFormItem>

          <NFormItem label="任務說明">
            <NInput v-model:value="form.description" type="textarea" :rows="2" placeholder="選填" />
          </NFormItem>

          <NDivider />

          <!-- ── DAILY / EVENT ── -->
          <template v-if="!isCheckin">
            <NFormItem label="完成條件">
              <div class="flex gap-2 w-full">
                <NSelect
                  v-model:value="form.condition_type"
                  :options="conditionOptions"
                  style="flex:1"
                  @update:value="onConditionChange"
                />
                <NInputNumber
                  v-if="form.condition_type !== 'CUSTOM'"
                  v-model:value="form.condition_target"
                  :min="1"
                  style="width:100px"
                  @update:value="onConditionChange"
                />
              </div>
            </NFormItem>

            <NFormItem v-if="form.condition_type === 'CUSTOM'" label="條件說明">
              <NInput v-model:value="form.condition_desc" placeholder="自行描述完成條件" />
            </NFormItem>

            <NFormItem label="完成獎勵">
              <div class="w-full space-y-2">
                <div
                  v-for="(reward, idx) in form.rewards"
                  :key="reward.id"
                  class="flex gap-2 items-start"
                >
                  <NSelect
                    v-model:value="reward.type"
                    :options="rewardTypeOptions"
                    style="width:130px; flex-shrink:0"
                  />
                  <NInputNumber
                    v-if="reward.type === 'SILVER'"
                    v-model:value="reward.silver_amount"
                    :min="1"
                    placeholder="銀幣數量"
                    style="flex:1"
                  />
                  <template v-else>
                    <NInput v-model:value="reward.item_name" placeholder="名稱" style="flex:1" />
                    <NInput
                      v-if="reward.type === 'GIFT_CARD'"
                      v-model:value="reward.item_desc"
                      placeholder="禮物卡描述，例：7-11 禮物卡 100 元"
                      style="flex:1"
                    />
                  </template>
                  <NButton size="small" quaternary type="error" @click="removeReward(form.rewards, idx as number)" :disabled="form.rewards.length <= 1">
                    <NIcon :component="TrashOutline" />
                  </NButton>
                </div>
                <NButton dashed size="small" class="w-full" @click="addReward(form.rewards)">
                  <template #icon><NIcon :component="AddOutline" /></template>
                  新增獎勵
                </NButton>
              </div>
            </NFormItem>
          </template>

          <!-- ── CHECKIN ── -->
          <template v-else>
            <NGrid :cols="2" :x-gap="12">
              <NGridItem>
                <NFormItem label="循環天數">
                  <NInputNumber v-model:value="form.cycle_days" :min="1" :max="365" class="w-full" />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="每日基本銀幣">
                  <NInputNumber v-model:value="form.daily_silver" :min="1" class="w-full" />
                </NFormItem>
              </NGridItem>
            </NGrid>

            <NFormItem label="里程碑設定">
              <div class="w-full space-y-3">
                <div
                  v-for="(ms, mIdx) in form.milestones"
                  :key="ms.id"
                  class="border border-gray-200 rounded-xl p-3 bg-gray-50"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">第</span>
                      <NInputNumber v-model:value="ms.day" :min="1" :max="form.cycle_days" style="width:80px" />
                      <span class="text-xs text-gray-500">天 — 額外獎勵</span>
                    </div>
                    <NButton size="tiny" quaternary type="error" @click="removeMilestone(mIdx as number)" :disabled="form.milestones.length <= 1">
                      <NIcon :component="TrashOutline" />
                    </NButton>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="(reward, rIdx) in ms.rewards"
                      :key="reward.id"
                      class="flex gap-2 items-start"
                    >
                      <NSelect
                        v-model:value="reward.type"
                        :options="rewardTypeOptions"
                        style="width:120px; flex-shrink:0"
                      />
                      <NInputNumber
                        v-if="reward.type === 'SILVER'"
                        v-model:value="reward.silver_amount"
                        :min="1"
                        placeholder="銀幣"
                        style="flex:1"
                      />
                      <template v-else>
                        <NInput v-model:value="reward.item_name" placeholder="名稱" style="flex:1" />
                        <NInput
                          v-if="reward.type === 'GIFT_CARD'"
                          v-model:value="reward.item_desc"
                          placeholder="禮物卡描述"
                          style="flex:1"
                        />
                      </template>
                      <NButton size="small" quaternary type="error" @click="removeReward(ms.rewards, rIdx as number)" :disabled="ms.rewards.length <= 1">
                        <NIcon :component="TrashOutline" />
                      </NButton>
                    </div>
                    <NButton dashed size="small" class="w-full" @click="addReward(ms.rewards)">
                      <template #icon><NIcon :component="AddOutline" /></template>
                      新增獎勵
                    </NButton>
                  </div>
                </div>
                <NButton dashed size="small" class="w-full" @click="addMilestone">
                  <template #icon><NIcon :component="AddOutline" /></template>
                  新增里程碑
                </NButton>
              </div>
            </NFormItem>
          </template>

          <NDivider />

          <!-- 時間設定 -->
          <NFormItem label="時間限定">
            <NSwitch v-model:value="form.is_limited" />
            <span class="ml-3 text-sm text-gray-500">
              {{ form.is_limited ? '指定起訖時間' : '長期有效' }}
            </span>
          </NFormItem>

          <template v-if="form.is_limited">
            <NGrid :cols="2" :x-gap="12">
              <NGridItem>
                <NFormItem label="開始時間">
                  <NDatePicker
                    v-model:value="form.scheduled_start"
                    type="datetime"
                    value-format="yyyy-MM-dd'T'HH:mm:ss'Z'"
                    clearable class="w-full"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="結束時間">
                  <NDatePicker
                    v-model:value="form.scheduled_end"
                    type="datetime"
                    value-format="yyyy-MM-dd'T'HH:mm:ss'Z'"
                    clearable class="w-full"
                  />
                </NFormItem>
              </NGridItem>
            </NGrid>
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
