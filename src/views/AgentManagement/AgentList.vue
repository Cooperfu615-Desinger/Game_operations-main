<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NInput, NSelect, NDatePicker, NButton, NDataTable, NSpace, NTag,
  NModal, NForm, NFormItem, useMessage, DataTableColumns, NRadioGroup, NRadio, NSwitch, NInputNumber,
  NGrid, NGridItem, NIcon, NDivider
} from 'naive-ui'
import {
  SearchOutline, CreateOutline, CashOutline, InformationCircleOutline,
  PeopleOutline, AddOutline, EyeOutline, SettingsOutline
} from '@vicons/ionicons5'
import { agentApi } from '@/api/agent'
import { Agent, AgentSearchParams, AgentStatus, AgentIdentity } from '@/types/agent'
import { useI18n } from 'vue-i18n'

const router = useRouter()

const message = useMessage()
const { t } = useI18n()

// Search State
const searchForm = reactive<AgentSearchParams>({
  q: '',
  search_type: 'username',
  identity: undefined,
  status: undefined,
  start_time: undefined,
  end_time: undefined,
  page: 1,
  page_size: 10
})

const dateRange = ref<[number, number] | null>(null)

const identityOptions = computed(() => [
  { label: t('agent.identity.ADMIN'), value: 'ADMIN' },
  { label: t('agent.identity.MASTER'), value: 'MASTER' },
  { label: t('agent.identity.SUB'), value: 'SUB' },
  { label: t('agent.identity.ASSISTANT'), value: 'ASSISTANT' }
])

const statusOptions = computed(() => [
  { label: t('agent.status.NORMAL'), value: 'NORMAL' },
  { label: t('agent.status.LOCKED'), value: 'LOCKED' },
  { label: t('agent.status.FROZEN'), value: 'FROZEN' },
  { label: t('agent.status.DISABLED'), value: 'DISABLED' }
])

// Data Table
const loading = ref(false)
const agents = ref<Agent[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page
    searchForm.page = page
    fetchData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    searchForm.page_size = pageSize
    searchForm.page = 1
    fetchData()
  }
})

const columns = computed<DataTableColumns<Agent>>(() => [
  { 
    title: t('agent.list.uid'), 
    key: 'uid', 
    width: 120,
    render(row) {
      return h('div', [
        h('div', { class: 'font-bold' }, row.username),
        h('div', { class: 'text-xs text-gray-400' }, `UID: ${row.uid}`)
      ])
    }
  },
  { 
    title: t('agent.list.identity'), 
    key: 'identity', 
    width: 120,
    render(row) {
      const typeMap: Record<string, 'info' | 'success' | 'warning' | 'default' | 'error'> = {
        'ADMIN': 'error',
        'MASTER': 'info',
        'SUB': 'success',
        'ASSISTANT': 'warning'
      }
      return h(NTag, { type: typeMap[row.identity] as any, bordered: false }, { default: () => t(`agent.identity.${row.identity}`) })
    }
  },
  { title: t('agent.list.promoCode'), key: 'promo_code', width: 100 },
  { title: t('agent.list.path'), key: 'path', minWidth: 200 },
  { 
    title: t('agent.list.cpaMatrix'), 
    key: 'cpa', 
    width: 100,
    align: 'center',
    render(row) {
      if (row.identity === 'ADMIN') return '-'
      return h(NButton, { 
        circle: true, 
        quaternary: true, 
        onClick: () => showCPAModal(row) 
      }, { icon: () => h(NIcon, null, { default: () => h(InformationCircleOutline) }) })
    }
  },
  { 
    title: t('agent.list.commissionRate'), 
    key: 'deposit_commission_rate', 
    width: 120,
    render: (row) => row.identity === 'ADMIN' ? '-' : `${row.deposit_commission_rate}%`
  },
  { 
    title: t('agent.list.commissionWallet'), 
    key: 'commission_wallet', 
    width: 120,
    render: (row) => `$ ${row.commission_wallet.toLocaleString()}`
  },
  { 
    title: t('agent.list.promoWallet'), 
    key: 'promo_wallet', 
    width: 120,
    render: (row) => row.identity === 'ADMIN' ? '-' : `$ ${row.promo_wallet.toLocaleString()}`
  },
  { title: t('agent.list.subAgentCount'), key: 'sub_agent_count', width: 120, align: 'center' },
  { title: t('agent.list.directPlayerCount'), key: 'direct_player_count', width: 100, align: 'center' },
  { 
    title: t('agent.list.status'), 
    key: 'status', 
    width: 100,
    render(row) {
      const typeMap: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
        'NORMAL': 'success',
        'LOCKED': 'warning',
        'FROZEN': 'info',
        'DISABLED': 'error'
      }
      return h(NTag, { type: typeMap[row.status] as any, bordered: false }, { default: () => t(`agent.status.${row.status}`) })
    }
  },
  { 
    title: t('agent.list.createdAt'), 
    key: 'created_at', 
    width: 170,
    render: (row) => new Date(row.created_at).toLocaleString()
  },
  {
    title: t('agent.list.actions'),
    key: 'actions',
    width: 260,
    fixed: 'right',
    render(row) {
      const actions = [
        h(NButton, { size: 'small', quaternary: true, type: 'info', onClick: () => router.push(`/admin/agent/${row.id}`) }, {
          default: () => [h(NIcon, { style: { marginRight: '4px' } }, { default: () => h(EyeOutline) }), t('agent.list.details')]
        }),
        h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => showEditModal(row) }, {
          default: () => [h(NIcon, { style: { marginRight: '4px' } }, { default: () => h(CreateOutline) }), t('agent.list.edit')]
        })
      ]
      if (row.identity !== 'ADMIN') {
        actions.push(
          h(NButton, { size: 'small', quaternary: true, type: 'warning', onClick: () => router.push(`/admin/agent-commission/${row.id}`) }, {
            default: () => [h(NIcon, { style: { marginRight: '4px' } }, { default: () => h(SettingsOutline) }), t('agent.list.commission')]
          })
        )
      }
      if (row.identity !== 'ADMIN') {
        actions.push(
          h(NButton, { size: 'small', quaternary: true, type: 'default', onClick: () => showPromoModal(row) }, {
            default: () => [h(NIcon, { style: { marginRight: '4px' } }, { default: () => h(CashOutline) }), t('agent.list.promoMoney')]
          })
        )
      }
      return h(NSpace, {}, { default: () => actions })
    }
  }
])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agentApi.getAgents(searchForm)
    if (res.code === 0 && res.data) {
      agents.value = res.data.items
      pagination.itemCount = res.data.total
    } else {
      message.error(res.msg || t('common.loadFailed'))
    }
  } catch (err) {
    message.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// Modal States
const showEdit = ref(false)
const showCreate = ref(false)
const showCPA = ref(false)
const showPromo = ref(false)
const activeAgent = ref<Agent | null>(null)

// Forms
const defaultCpaMatrix = () => [
    { level: 1, member_count: 0, price: 0 },
    { level: 2, member_count: 0, price: 0 },
    { level: 3, member_count: 0, price: 0 }
]

const editForm = reactive({
  password: '',
  two_fa_enabled: false,
  cpa_price_matrix: defaultCpaMatrix(),
  deposit_commission_rate: 0,
  data_binding_threshold: { phone: false },
  deposit_threshold: 0,
  flow_threshold: 0,
  status: 'NORMAL' as AgentStatus,
  name: '',
  phone: '',
  contact_info: '',
  sensitive_data_permission: false,
  remark: '',
  change_reason: ''
})

const createForm = reactive({
    username: '',
    promo_code: '',
    identity: 'SUB' as AgentIdentity,
    password: '',
    two_fa_enabled: false,
    cpa_price_matrix: defaultCpaMatrix(),
    deposit_commission_rate: 0,
    data_binding_threshold: { phone: false },
    deposit_threshold: 0,
    flow_threshold: 0,
    status: 'NORMAL' as AgentStatus,
    name: '',
    phone: '',
    contact_info: '',
    sensitive_data_permission: false,
    remark: ''
})

// Handlers
const showCPAModal = (agent: Agent) => {
  activeAgent.value = agent
  showCPA.value = true
}

const openCreateModal = () => {
    Object.assign(createForm, {
        username: '',
        promo_code: '',
        identity: 'SUB',
        password: '',
        two_fa_enabled: false,
        cpa_price_matrix: defaultCpaMatrix(),
        deposit_commission_rate: 0,
        data_binding_threshold: { phone: false },
        deposit_threshold: 0,
        flow_threshold: 0,
        status: 'NORMAL',
        name: '',
        phone: '',
        contact_info: '',
        sensitive_data_permission: false,
        remark: ''
    })
    showCreate.value = true
}

const showEditModal = (agent: Agent) => {
  activeAgent.value = agent
  Object.assign(editForm, {
    password: '',
    two_fa_enabled: agent.two_fa_enabled,
    cpa_price_matrix: agent.cpa_price_matrix && agent.cpa_price_matrix.length === 3 
        ? JSON.parse(JSON.stringify(agent.cpa_price_matrix)) 
        : defaultCpaMatrix(),
    deposit_commission_rate: agent.deposit_commission_rate,
    data_binding_threshold: { ...agent.data_binding_threshold },
    deposit_threshold: agent.deposit_threshold,
    flow_threshold: agent.flow_threshold,
    status: agent.status,
    name: agent.name,
    phone: agent.phone,
    contact_info: agent.contact_info,
    sensitive_data_permission: agent.sensitive_data_permission,
    remark: agent.remark,
    change_reason: ''
  })
  showEdit.value = true
}

const handleUpdate = async () => {
  if (!editForm.change_reason) {
    message.warning(t('agent.edit.reasonPlaceholder'))
    return
  }
  
  try {
    const res = await agentApi.updateAgent({
      id: activeAgent.value!.id,
      ...editForm
    })
    if (res.code === 0) {
        message.success(t('agent.edit.saveSuccess'))
        showEdit.value = false
        fetchData()
    }
  } catch (e) {}
}

const handleCreate = async () => {
    if (!createForm.username || !createForm.password) {
        message.warning('請填寫帳號與密碼')
        return
    }
    try {
        const res = await agentApi.createAgent(createForm)
        if (res.code === 0) {
            message.success(t('common.success'))
            showCreate.value = false
            fetchData()
        }
    } catch (e) {}
}

const promoForm = reactive({ amount: 0, reason: '' })
const showPromoModal = (agent: Agent) => {
    activeAgent.value = agent
    promoForm.amount = 0
    promoForm.reason = ''
    showPromo.value = true
}
const handlePromoAdjust = async () => {
    if (!promoForm.reason) {
        message.warning(t('agent.edit.reasonPlaceholder'))
        return
    }
    try {
        const res = await agentApi.adjustPromoWallet(activeAgent.value!.id, promoForm.amount, promoForm.reason)
        if (res.code === 0) {
            message.success(t('common.success'))
            showPromo.value = false
            fetchData()
        }
    } catch(e) {}
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <NCard class="premium-glass mb-6">
      <template #header>
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
                <NIcon size="24" color="#0ea5e9"><PeopleOutline /></NIcon>
                <span class="text-lg font-black">{{ t('agent.list.title') }}</span>
            </div>
            <NButton type="primary" rounded @click="openCreateModal">
                <template #icon><NIcon><AddOutline /></NIcon></template>
                {{ t('agent.list.addAgent') }}
            </NButton>
        </div>
      </template>

      <NForm inline :model="searchForm" label-placement="left" class="flex-wrap gap-x-8 gap-y-6 mt-4">
        <NFormItem :label="t('common.search')">
            <div class="relative">
                <NRadioGroup v-model:value="searchForm.search_type" name="searchType" size="small" class="absolute -top-7 left-0 whitespace-nowrap">
                    <NRadio value="username">{{ t('agent.list.searchTypeAccount') }}</NRadio>
                    <NRadio value="uid">{{ t('agent.list.searchTypeUid') }}</NRadio>
                    <NRadio value="promo_code">{{ t('agent.list.searchTypePromo') }}</NRadio>
                </NRadioGroup>
                <NInput v-model:value="searchForm.q" :placeholder="t('common.keywordPlaceholder')" style="width: 200px" />
            </div>
        </NFormItem>

        <NFormItem :label="t('agent.list.identity')">
          <NSelect v-model:value="searchForm.identity" :options="identityOptions" :placeholder="t('common.all')" clearable style="width: 140px" />
        </NFormItem>

        <NFormItem :label="t('agent.list.status')">
          <NSelect v-model:value="searchForm.status" :options="statusOptions" :placeholder="t('common.all')" clearable style="width: 120px" />
        </NFormItem>

        <NFormItem :label="t('agent.list.createTime')">
            <NDatePicker 
                v-model:value="dateRange" 
                type="daterange" 
                clearable 
                @update:value="([start, end]: any) => {
                    searchForm.start_time = start ? new Date(start).toISOString() : undefined
                    searchForm.end_time = end ? new Date(end).toISOString() : undefined
                }"
            />
        </NFormItem>

        <NFormItem>
          <NButton type="primary" secondary @click="fetchData">
            <template #icon><SearchOutline /></template>
            {{ t('common.search') }}
          </NButton>
        </NFormItem>
      </NForm>
    </NCard>

    <NDataTable
        remote
        :loading="loading"
        :columns="columns"
        :data="agents"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        scroll-x="1800"
        class="premium-table"
    />

    <!-- Create Agent Modal -->
    <NModal 
        v-model:show="showCreate" 
        preset="card" 
        :title="t('agent.edit.createTitle')" 
        style="width: 850px; border-radius: 20px;"
    >
        <div class="max-h-[75vh] overflow-y-auto px-4">
            <NForm :model="createForm" label-placement="left" label-width="140" label-align="right">
                <NDivider title-placement="left">核心設定</NDivider>
                <NGrid :cols="2" :x-gap="24">
                    <NGridItem>
                        <NFormItem :label="t('agent.list.searchTypeAccount')" required>
                            <NInput v-model:value="createForm.username" placeholder="請輸入帳號" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.list.identity')" required>
                            <NSelect v-model:value="createForm.identity" :options="identityOptions" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.list.promoCode')">
                             <NInput v-model:value="createForm.promo_code" placeholder="請輸入推廣碼 (選填)" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.edit.password')" required>
                            <NInput 
                                v-model:value="createForm.password" 
                                type="password" 
                                show-password-on="click" 
                                :placeholder="t('agent.edit.createPasswordPlaceholder')" 
                            />
                        </NFormItem>
                    </NGridItem>
                </NGrid>

                <template v-if="createForm.identity !== 'ADMIN'">
                    <NDivider title-placement="left">{{ t('agent.edit.cpaMatrix') }}</NDivider>
                    <NGrid :cols="3" :x-gap="12">
                        <NGridItem v-for="level in [1, 2, 3]" :key="level">
                            <NCard size="small" :title="t('agent.edit.cpaLevel', { level })" embedded>
                                <NFormItem :label="t('agent.edit.cpaMemberCount')" label-placement="top">
                                    <NInputNumber v-model:value="createForm.cpa_price_matrix[level-1].member_count" :min="0" style="width: 100%" />
                                </NFormItem>
                                <NFormItem :label="t('agent.edit.cpaPrice')" label-placement="top">
                                    <NInputNumber v-model:value="createForm.cpa_price_matrix[level-1].price" :min="0" style="width: 100%" />
                                </NFormItem>
                            </NCard>
                        </NGridItem>
                    </NGrid>

                    <NDivider title-placement="left" class="mt-6">分潤與門檻</NDivider>
                    <NFormItem :label="t('agent.edit.commissionRate')">
                        <NInputNumber v-model:value="createForm.deposit_commission_rate" :min="0" :max="100" />
                    </NFormItem>
                    
                    <NFormItem :label="t('agent.edit.bindingThreshold')">
                        <NSpace>
                            <NTag checkable v-model:checked="createForm.data_binding_threshold.phone" type="primary">
                                {{ t('agent.edit.phoneBinding') }}
                            </NTag>
                        </NSpace>
                    </NFormItem>

                    <NGrid :cols="2" :x-gap="24">
                        <NGridItem>
                            <NFormItem :label="t('agent.edit.depositThreshold')">
                                <NInputNumber v-model:value="createForm.deposit_threshold" :min="0" style="width: 100%" />
                            </NFormItem>
                        </NGridItem>
                        <NGridItem>
                            <NFormItem :label="t('agent.edit.flowThreshold')">
                                <NInputNumber v-model:value="createForm.flow_threshold" :min="0" style="width: 100%" />
                            </NFormItem>
                        </NGridItem>
                    </NGrid>
                </template>

                <NDivider title-placement="left">{{ createForm.identity === 'ADMIN' ? '狀態與進階' : '基本資料與狀態' }}</NDivider>

                <NGrid :cols="2" :x-gap="24">
                    <NGridItem>
                        <NFormItem :label="t('agent.list.status')">
                            <NSelect v-model:value="createForm.status" :options="statusOptions" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.edit.twoFactor')">
                            <NSwitch v-model:value="createForm.two_fa_enabled" />
                        </NFormItem>
                    </NGridItem>
                    
                    <NGridItem v-if="createForm.identity !== 'ADMIN'">
                        <NFormItem :label="t('agent.edit.name')">
                            <NInput v-model:value="createForm.name" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem v-if="createForm.identity !== 'ADMIN'">
                        <NFormItem :label="t('agent.edit.phone')">
                            <NInput v-model:value="createForm.phone" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem v-if="createForm.identity !== 'ADMIN'">
                        <NFormItem :label="t('agent.edit.contact')">
                            <NInput v-model:value="createForm.contact_info" />
                        </NFormItem>
                    </NGridItem>
                </NGrid>

                <NFormItem v-if="createForm.identity !== 'ADMIN'" :label="t('agent.edit.sensitivePermission')">
                    <NSpace vertical>
                        <NSwitch v-model:value="createForm.sensitive_data_permission" />
                        <span class="text-xs text-gray-400">{{ t('agent.edit.sensitivePermissionDesc') }}</span>
                    </NSpace>
                </NFormItem>

                <NFormItem :label="t('agent.edit.remark')">
                    <NInput v-model:value="createForm.remark" type="textarea" :rows="2" />
                </NFormItem>
            </NForm>
        </div>
        <template #footer>
            <div class="flex justify-end gap-3">
                <NButton quaternary @click="showCreate = false">{{ t('common.cancel') }}</NButton>
                <NButton type="primary" rounded @click="handleCreate()">{{ t('common.save') }}</NButton>
            </div>
        </template>
    </NModal>

    <!-- Edit Agent Modal -->
    <NModal 
        v-model:show="showEdit" 
        preset="card" 
        :title="t('agent.edit.title')" 
        style="width: 850px; border-radius: 20px;"
    >
        <div class="max-h-[75vh] overflow-y-auto px-4">
            <NForm :model="editForm" label-placement="left" label-width="140" label-align="right">
                <NDivider title-placement="left">核心設定</NDivider>
                <NGrid :cols="2" :x-gap="24">
                    <NGridItem>
                        <NFormItem :label="t('agent.list.uid')">
                            <NInput :value="activeAgent?.uid" disabled />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.list.identity')">
                            <NTag type="info" :bordered="false">{{ t(`agent.identity.${activeAgent?.identity}`) }}</NTag>
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.list.promoCode')">
                             <NInput :value="activeAgent?.promo_code" disabled />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.edit.password')">
                            <NInput 
                                v-model:value="editForm.password" 
                                type="password" 
                                show-password-on="click" 
                                :placeholder="t('agent.edit.passwordPlaceholder')" 
                            />
                        </NFormItem>
                    </NGridItem>
                </NGrid>

                <template v-if="activeAgent?.identity !== 'ADMIN'">
                    <NDivider title-placement="left">{{ t('agent.edit.cpaMatrix') }}</NDivider>
                    <NGrid :cols="3" :x-gap="12">
                        <NGridItem v-for="level in [1, 2, 3]" :key="level">
                            <NCard size="small" :title="t('agent.edit.cpaLevel', { level })" embedded>
                                <NFormItem :label="t('agent.edit.cpaMemberCount')" label-placement="top">
                                    <NInputNumber v-model:value="editForm.cpa_price_matrix[level-1].member_count" :min="0" style="width: 100%" />
                                </NFormItem>
                                <NFormItem :label="t('agent.edit.cpaPrice')" label-placement="top">
                                    <NInputNumber v-model:value="editForm.cpa_price_matrix[level-1].price" :min="0" style="width: 100%" />
                                </NFormItem>
                            </NCard>
                        </NGridItem>
                    </NGrid>

                    <NDivider title-placement="left" class="mt-6">分潤與門檻</NDivider>
                    <NFormItem :label="t('agent.edit.commissionRate')">
                        <NInputNumber v-model:value="editForm.deposit_commission_rate" :min="0" :max="100" />
                    </NFormItem>
                    
                    <NFormItem :label="t('agent.edit.bindingThreshold')">
                        <NSpace>
                            <NTag checkable v-model:checked="editForm.data_binding_threshold.phone" type="primary">
                                {{ t('agent.edit.phoneBinding') }}
                            </NTag>
                        </NSpace>
                    </NFormItem>

                    <NGrid :cols="2" :x-gap="24">
                        <NGridItem>
                            <NFormItem :label="t('agent.edit.depositThreshold')">
                                <NInputNumber v-model:value="editForm.deposit_threshold" :min="0" style="width: 100%" />
                            </NFormItem>
                        </NGridItem>
                        <NGridItem>
                            <NFormItem :label="t('agent.edit.flowThreshold')">
                                <NInputNumber v-model:value="editForm.flow_threshold" :min="0" style="width: 100%" />
                            </NFormItem>
                        </NGridItem>
                    </NGrid>
                </template>

                <NDivider title-placement="left">{{ activeAgent?.identity === 'ADMIN' ? '狀態與進階' : '基本資料與狀態' }}</NDivider>

                <NGrid :cols="2" :x-gap="24">
                    <NGridItem>
                        <NFormItem :label="t('agent.list.status')">
                            <NSelect v-model:value="editForm.status" :options="statusOptions" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem>
                        <NFormItem :label="t('agent.edit.twoFactor')">
                            <NSwitch v-model:value="editForm.two_fa_enabled" />
                        </NFormItem>
                    </NGridItem>
                    
                    <NGridItem v-if="activeAgent?.identity !== 'ADMIN'">
                        <NFormItem :label="t('agent.edit.name')">
                            <NInput v-model:value="editForm.name" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem v-if="activeAgent?.identity !== 'ADMIN'">
                        <NFormItem :label="t('agent.edit.phone')">
                            <NInput v-model:value="editForm.phone" />
                        </NFormItem>
                    </NGridItem>
                    <NGridItem v-if="activeAgent?.identity !== 'ADMIN'">
                        <NFormItem :label="t('agent.edit.contact')">
                            <NInput v-model:value="editForm.contact_info" />
                        </NFormItem>
                    </NGridItem>
                </NGrid>

                <NFormItem v-if="activeAgent?.identity !== 'ADMIN'" :label="t('agent.edit.sensitivePermission')">
                    <NSpace vertical>
                        <NSwitch v-model:value="editForm.sensitive_data_permission" />
                        <span class="text-xs text-gray-400">{{ t('agent.edit.sensitivePermissionDesc') }}</span>
                    </NSpace>
                </NFormItem>

                <NFormItem :label="t('agent.edit.remark')">
                    <NInput v-model:value="editForm.remark" type="textarea" :rows="2" />
                </NFormItem>

                <NDivider title-placement="left" dashed>{{ t('agent.edit.reason') }}</NDivider>
                <NFormItem :label="t('agent.edit.reason')" required>
                    <NInput v-model:value="editForm.change_reason" type="textarea" :placeholder="t('agent.edit.reasonPlaceholder')" />
                </NFormItem>
            </NForm>
        </div>
        <template #footer>
            <div class="flex justify-end gap-3">
                <NButton quaternary @click="showEdit = false">{{ t('common.cancel') }}</NButton>
                <NButton type="primary" rounded @click="handleUpdate()">{{ t('common.save') }}</NButton>
            </div>
        </template>
    </NModal>

    <!-- CPA Matrix Modal (Table View) -->
    <NModal v-model:show="showCPA" preset="card" :title="t('agent.list.cpaMatrix')" style="width: 450px">
        <NDataTable 
            :columns="[
                { title: '級距', key: 'level', render: (row) => `級距 ${row.level}` },
                { title: '門檻人數', key: 'member_count' },
                { title: '獲客單價 (CPA)', key: 'price', render: (row) => `$ ${row.price}` }
            ]" 
            :data="activeAgent?.cpa_price_matrix || []"
            :bordered="false"
        />
    </NModal>

    <!-- Promotion Money Modal -->
    <NModal v-model:show="showPromo" preset="card" :title="t('agent.list.promoMoney')" style="width: 450px">
        <NForm label-placement="left" label-width="100">
            <NFormItem label="當前餘額">
                <span class="font-bold text-lg text-sky-600">$ {{ activeAgent?.promo_wallet.toLocaleString() }}</span>
            </NFormItem>
            <NFormItem label="調整金額">
                <NInputNumber v-model:value="promoForm.amount" :step="100" style="width: 100%" placeholder="正數增加，負數扣除" />
            </NFormItem>
            <NFormItem :label="t('agent.edit.reason')" required>
                <NInput v-model:value="promoForm.reason" type="textarea" :placeholder="t('agent.edit.reasonPlaceholder')" />
            </NFormItem>
        </NForm>
        <template #footer>
             <div class="flex justify-end gap-3">
                <NButton quaternary @click="showPromo = false">{{ t('common.cancel') }}</NButton>
                <NButton type="primary" @click="handlePromoAdjust">{{ t('common.confirm') }}</NButton>
            </div>
        </template>
    </NModal>
  </div>
</template>

<style scoped>
.premium-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

:deep(.premium-table .n-data-table-td) {
  padding: 16px;
}

:deep(.premium-table .n-data-table-th) {
  background-color: rgba(248, 250, 252, 0.8);
  font-weight: 800;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: #64748b;
}

:deep(.n-modal.n-card) {
    border-radius: 24px !important;
}

:deep(.n-divider .n-divider__title) {
    font-weight: 700;
    color: #0ea5e9;
}
</style>
