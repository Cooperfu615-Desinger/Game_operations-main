<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard, NForm, NFormItem, NInputNumber, NSelect, NButton, NSpace,
  NSpin, NAlert, useMessage, NDivider, NDescriptions, NDescriptionsItem,
  NTag, NIcon
} from 'naive-ui'
import { ArrowBackOutline, SaveOutline } from '@vicons/ionicons5'
import { agentApi } from '@/api/agent'
import type { Agent, AgentCommissionConfig, SettlementCycle } from '@/types/agent'

const route   = useRoute()
const router  = useRouter()
const message = useMessage()
const agentId = route.params.id as string

const loadingAgent  = ref(false)
const loadingConfig = ref(false)
const saving        = ref(false)
const agent         = ref<Agent | null>(null)
const error         = ref('')

const form = reactive<Omit<AgentCommissionConfig, 'agent_id' | 'updated_at' | 'updated_by'>>({
  settlement_cycle:  'MONTHLY',
  settlement_day:    1,
  commission_rate:   0,
  promotion_share:   0,
  fee_share:         0
})

const cycleOptions = [
  { label: '每週結算', value: 'WEEKLY' },
  { label: '每月結算', value: 'MONTHLY' },
  { label: '自定義',   value: 'CUSTOM' }
]

const weekdayOptions = [
  { label: '週一', value: 1 },
  { label: '週二', value: 2 },
  { label: '週三', value: 3 },
  { label: '週四', value: 4 },
  { label: '週五', value: 5 },
  { label: '週六', value: 6 },
  { label: '週日', value: 7 }
]

const monthDayOptions = Array.from({ length: 28 }, (_, i) => ({
  label: `每月 ${i + 1} 日`,
  value: i + 1
}))

const settlementDayOptions = computed(() =>
  form.settlement_cycle === 'WEEKLY' ? weekdayOptions : monthDayOptions
)

const identityTypeMap: Record<string, 'info' | 'success' | 'warning' | 'default' | 'error'> = {
  ADMIN: 'error', MASTER: 'info', SUB: 'success', ASSISTANT: 'warning'
}

const identityLabelMap: Record<string, string> = {
  ADMIN: '後台管理員', MASTER: '總代理', SUB: '子代理', ASSISTANT: '助手'
}

const load = async () => {
  loadingAgent.value  = true
  loadingConfig.value = true
  try {
    const [agentRes, configRes] = await Promise.all([
      agentApi.getAgentById(agentId),
      agentApi.getAgentCommission(agentId)
    ])
    if (agentRes.code === 0 && agentRes.data) {
      agent.value = agentRes.data
    } else {
      error.value = agentRes.msg || '代理不存在'
    }
    if (configRes.code === 0 && configRes.data) {
      const c = configRes.data
      Object.assign(form, {
        settlement_cycle: c.settlement_cycle,
        settlement_day:   c.settlement_day,
        commission_rate:  c.commission_rate,
        promotion_share:  c.promotion_share,
        fee_share:        c.fee_share
      })
    }
  } finally {
    loadingAgent.value  = false
    loadingConfig.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const res = await agentApi.updateAgentCommission(agentId, { ...form })
    if (res.code === 0) {
      message.success('佣金設置已儲存')
    } else {
      message.error(res.msg || '儲存失敗')
    }
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <NButton quaternary @click="router.back()">
        <template #icon><NIcon :component="ArrowBackOutline" /></template>
        返回
      </NButton>
      <div class="flex-1">
        <h2 class="text-xl font-bold text-gray-800">佣金設置</h2>
        <p class="text-sm text-gray-400 mt-0.5" v-if="agent">{{ agent.path }}</p>
      </div>
    </div>

    <NAlert v-if="error" type="error" class="mb-4">{{ error }}</NAlert>

    <NSpin :show="loadingAgent || loadingConfig">
      <!-- Agent summary card -->
      <NCard v-if="agent" size="small" class="mb-5 rounded-xl bg-slate-50" :bordered="false">
        <NDescriptions :columns="3" label-style="color:#64748b;font-size:12px">
          <NDescriptionsItem label="帳號">
            <span class="font-bold">{{ agent.username }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="身份">
            <NTag :type="identityTypeMap[agent.identity]" :bordered="false" size="small">
              {{ identityLabelMap[agent.identity] }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="UID">{{ agent.uid }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard :bordered="false" class="rounded-2xl shadow-sm">
        <NForm label-placement="left" label-width="140" :model="form">

          <NDivider title-placement="left" class="!mt-0">結算週期設定</NDivider>

          <NFormItem label="結算週期" required>
            <NSelect
              v-model:value="form.settlement_cycle"
              :options="cycleOptions"
              style="width: 200px"
            />
          </NFormItem>

          <NFormItem label="結算日" required v-if="form.settlement_cycle !== 'CUSTOM'">
            <NSelect
              v-model:value="form.settlement_day"
              :options="settlementDayOptions"
              style="width: 200px"
            />
          </NFormItem>

          <NDivider title-placement="left">分潤比例設定</NDivider>

          <NFormItem label="抽成比 (%)" required>
            <NInputNumber
              v-model:value="form.commission_rate"
              :min="0"
              :max="100"
              :step="0.5"
              :precision="2"
              style="width: 180px"
            />
            <span class="ml-3 text-xs text-gray-400">代理需回繳給平台的流水比例</span>
          </NFormItem>

          <NFormItem label="優惠佔比 (%)">
            <NInputNumber
              v-model:value="form.promotion_share"
              :min="0"
              :max="100"
              :step="0.5"
              :precision="2"
              style="width: 180px"
            />
            <span class="ml-3 text-xs text-gray-400">從佣金中扣抵的優惠攤提比</span>
          </NFormItem>

          <NFormItem label="手續費佔比 (%)">
            <NInputNumber
              v-model:value="form.fee_share"
              :min="0"
              :max="100"
              :step="0.5"
              :precision="2"
              style="width: 180px"
            />
            <span class="ml-3 text-xs text-gray-400">從佣金中扣抵的金流手續費攤提比</span>
          </NFormItem>

          <!-- Summary row -->
          <NDivider title-placement="left" dashed>計算預覽</NDivider>
          <div class="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 leading-relaxed">
            <p>以平台輸贏 <strong>$ 100,000</strong> 為例：</p>
            <p class="mt-1">
              代理回繳抽成：<strong>$ {{ (100000 * form.commission_rate / 100).toLocaleString() }}</strong>（{{ form.commission_rate }}%）
            </p>
            <p>
              扣抵優惠攤提：<strong>$ {{ (100000 * form.promotion_share / 100).toLocaleString() }}</strong>（{{ form.promotion_share }}%）
            </p>
            <p>
              扣抵手續費攤提：<strong>$ {{ (100000 * form.fee_share / 100).toLocaleString() }}</strong>（{{ form.fee_share }}%）
            </p>
            <p class="mt-2 font-bold border-t border-blue-200 pt-2">
              最終應付佣金：
              <span class="text-green-700">
                $ {{ Math.max(0, 100000 * form.commission_rate / 100 - 100000 * form.promotion_share / 100 - 100000 * form.fee_share / 100).toLocaleString() }}
              </span>
            </p>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <NButton quaternary @click="router.back()">取消</NButton>
            <NButton type="primary" :loading="saving" @click="handleSave">
              <template #icon><NIcon :component="SaveOutline" /></template>
              儲存設置
            </NButton>
          </div>
        </NForm>
      </NCard>
    </NSpin>
  </div>
</template>
