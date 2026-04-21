<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard, NTabs, NTabPane, NDescriptions, NDescriptionsItem, NTag, NButton, NSpace,
  NDataTable, NSpin, NEmpty, NAlert, NStatistic, NGrid, NGridItem, NIcon, NBadge
} from 'naive-ui'
import {
  ArrowBackOutline, SettingsOutline, PersonOutline, ListOutline,
  PeopleOutline, BarChartOutline
} from '@vicons/ionicons5'
import { agentApi } from '@/api/agent'
import type { Agent, AgentOperationLog, AgentStats } from '@/types/agent'
import { useI18n } from 'vue-i18n'

const route  = useRoute()
const router = useRouter()
const { t }  = useI18n()
const agentId = route.params.id as string

// ── Data ──────────────────────────────────────────────────
const loading    = ref(false)
const agent      = ref<Agent | null>(null)
const logs       = ref<AgentOperationLog[]>([])
const subAgents  = ref<Agent[]>([])
const stats      = ref<AgentStats | null>(null)
const logsLoaded = ref(false)
const subsLoaded = ref(false)
const statsLoaded= ref(false)
const error      = ref('')
const activeTab  = ref('profile')

// ── Load agent ────────────────────────────────────────────
const loadAgent = async () => {
  loading.value = true
  error.value   = ''
  try {
    const res = await agentApi.getAgentById(agentId)
    if (res.code === 0 && res.data) {
      agent.value = res.data
    } else {
      error.value = res.msg || '代理不存在'
    }
  } finally {
    loading.value = false
  }
}

// ── Lazy tab loaders ──────────────────────────────────────
const handleTabChange = async (tab: string) => {
  activeTab.value = tab
  if (tab === 'logs' && !logsLoaded.value) {
    const res = await agentApi.getAgentOperationLogs(agentId)
    if (res.code === 0) logs.value = res.data ?? []
    logsLoaded.value = true
  }
  if (tab === 'sub-agents' && !subsLoaded.value) {
    const res = await agentApi.getAgentSubAgents(agentId)
    if (res.code === 0) subAgents.value = res.data ?? []
    subsLoaded.value = true
  }
  if (tab === 'stats' && !statsLoaded.value) {
    const res = await agentApi.getAgentStats(agentId)
    if (res.code === 0) stats.value = res.data ?? null
    statsLoaded.value = true
  }
}

onMounted(loadAgent)

// ── Helpers ───────────────────────────────────────────────
const identityTypeMap: Record<string, 'info' | 'success' | 'warning' | 'default' | 'error'> = {
  ADMIN: 'error', MASTER: 'info', SUB: 'success', ASSISTANT: 'warning'
}
const statusTypeMap: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  NORMAL: 'success', LOCKED: 'warning', FROZEN: 'info', DISABLED: 'error'
}

const identityLabel = computed(() => agent.value ? t(`agent.identity.${agent.value.identity}`) : '')
const statusLabel   = computed(() => agent.value ? t(`agent.status.${agent.value.status}`) : '')

// ── Logs table ────────────────────────────────────────────
const logColumns = [
  { title: '時間', key: 'timestamp', width: 180, render: (row: AgentOperationLog) => new Date(row.timestamp).toLocaleString() },
  { title: '操作人', key: 'operator', width: 140 },
  { title: '操作類型', key: 'action', width: 160 },
  { title: '詳情', key: 'detail', minWidth: 200 },
  {
    title: '結果', key: 'result', width: 90,
    render: (row: AgentOperationLog) => {
      const type = row.result === 'SUCCESS' ? 'success' : 'error'
      const label = row.result === 'SUCCESS' ? '成功' : '失敗'
      return h(NTag, { type, size: 'small', bordered: false }, { default: () => label })
    }
  }
]

// ── Sub-agents table ──────────────────────────────────────
const subAgentColumns = [
  {
    title: '帳號 / UID', key: 'username', width: 160,
    render: (row: Agent) => h('div', [
      h('div', { class: 'font-bold' }, row.username),
      h('div', { class: 'text-xs text-gray-400' }, `UID: ${row.uid}`)
    ])
  },
  {
    title: '身份', key: 'identity', width: 110,
    render: (row: Agent) => h(NTag, { type: identityTypeMap[row.identity], bordered: false, size: 'small' }, { default: () => t(`agent.identity.${row.identity}`) })
  },
  { title: '推廣碼', key: 'promo_code', width: 100 },
  { title: '下線代理', key: 'sub_agent_count', width: 90, align: 'center' as const },
  { title: '直屬會員', key: 'direct_player_count', width: 90, align: 'center' as const },
  {
    title: '狀態', key: 'status', width: 90,
    render: (row: Agent) => h(NTag, { type: statusTypeMap[row.status], bordered: false, size: 'small' }, { default: () => t(`agent.status.${row.status}`) })
  },
  {
    title: '操作', key: 'actions', width: 100,
    render: (row: Agent) => h(NButton, { size: 'small', quaternary: true, type: 'info', onClick: () => router.push(`/admin/agent/${row.id}`) }, { default: () => '查看詳情' })
  }
]
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <NButton quaternary @click="router.back()">
        <template #icon><NIcon :component="ArrowBackOutline" /></template>
        返回
      </NButton>
      <div class="flex-1">
        <h2 class="text-xl font-bold text-gray-800">代理詳情</h2>
        <p class="text-sm text-gray-400 mt-0.5" v-if="agent">{{ agent.path }}</p>
      </div>
      <NButton type="warning" @click="router.push(`/admin/agent-commission/${agentId}`)" v-if="agent && agent.identity !== 'ADMIN'">
        <template #icon><NIcon :component="SettingsOutline" /></template>
        佣金設置
      </NButton>
    </div>

    <NSpin :show="loading">
      <NAlert v-if="error" type="error" class="mb-4">{{ error }}</NAlert>

      <NCard v-if="agent" :bordered="false" class="rounded-2xl shadow-sm">
        <NTabs type="line" animated :value="activeTab" @update:value="handleTabChange">

          <!-- ── Tab 1: 基本資料 ─────────────────────────────────── -->
          <NTabPane name="profile" tab="基本資料">
            <template #tab>
              <span class="flex items-center gap-1.5">
                <NIcon :component="PersonOutline" />基本資料
              </span>
            </template>

            <NDescriptions :columns="2" bordered label-placement="left" class="mt-4" label-style="width:140px;font-weight:600">
              <NDescriptionsItem label="帳號">
                <span class="font-bold">{{ agent.username }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem label="UID">{{ agent.uid }}</NDescriptionsItem>
              <NDescriptionsItem label="身份">
                <NTag :type="identityTypeMap[agent.identity]" :bordered="false">{{ identityLabel }}</NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="狀態">
                <NTag :type="statusTypeMap[agent.status]" :bordered="false">{{ statusLabel }}</NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="推廣碼">{{ agent.promo_code }}</NDescriptionsItem>
              <NDescriptionsItem label="建立時間">{{ new Date(agent.created_at).toLocaleString() }}</NDescriptionsItem>
              <NDescriptionsItem label="代理路徑" :span="2">{{ agent.path }}</NDescriptionsItem>

              <NDescriptionsItem label="真實姓名">{{ agent.name || '—' }}</NDescriptionsItem>
              <NDescriptionsItem label="手機號碼">{{ agent.phone || '—' }}</NDescriptionsItem>
              <NDescriptionsItem label="聯絡方式" :span="2">{{ agent.contact_info || '—' }}</NDescriptionsItem>

              <NDescriptionsItem label="二階段驗證 (2FA)">
                <NTag :type="agent.two_fa_enabled ? 'success' : 'default'" :bordered="false" size="small">
                  {{ agent.two_fa_enabled ? '已啟用' : '未啟用' }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="敏感資料權限">
                <NTag :type="agent.sensitive_data_permission ? 'warning' : 'default'" :bordered="false" size="small">
                  {{ agent.sensitive_data_permission ? '已開啟' : '未開啟' }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="手機綁定門檻">
                <NTag :type="agent.data_binding_threshold.phone ? 'info' : 'default'" :bordered="false" size="small">
                  {{ agent.data_binding_threshold.phone ? '需綁定手機' : '無需求' }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="儲值門檻">{{ agent.deposit_threshold > 0 ? `$ ${agent.deposit_threshold.toLocaleString()}` : '無' }}</NDescriptionsItem>
              <NDescriptionsItem label="流水門檻">{{ agent.flow_threshold > 0 ? `$ ${agent.flow_threshold.toLocaleString()}` : '無' }}</NDescriptionsItem>
              <NDescriptionsItem label="儲值抽成(%)">
                <span :class="agent.identity !== 'ADMIN' ? 'font-bold text-blue-600' : ''">
                  {{ agent.identity !== 'ADMIN' ? `${agent.deposit_commission_rate}%` : '—' }}
                </span>
              </NDescriptionsItem>

              <NDescriptionsItem label="佣金錢包">
                <span class="font-bold text-green-600">$ {{ agent.commission_wallet.toLocaleString() }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem label="推廣金錢包">
                <span class="font-bold text-sky-600">{{ agent.identity !== 'ADMIN' ? `$ ${agent.promo_wallet.toLocaleString()}` : '—' }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem label="下線代理">{{ agent.sub_agent_count }}</NDescriptionsItem>
              <NDescriptionsItem label="直屬會員">{{ agent.direct_player_count }}</NDescriptionsItem>

              <NDescriptionsItem label="備註" :span="2">{{ agent.remark || '—' }}</NDescriptionsItem>
            </NDescriptions>

            <!-- CPA Matrix -->
            <div class="mt-6" v-if="agent.identity !== 'ADMIN'">
              <p class="text-sm font-bold text-gray-600 mb-3">CPA 獲客單價矩陣</p>
              <NGrid :cols="3" :x-gap="12">
                <NGridItem v-for="level in agent.cpa_price_matrix" :key="level.level">
                  <NCard size="small" :title="`級距 ${level.level}`" embedded>
                    <div class="text-sm text-gray-500">門檻人數：<span class="font-bold text-gray-800">{{ level.member_count }}</span></div>
                    <div class="text-sm text-gray-500 mt-1">獲客單價：<span class="font-bold text-blue-600">$ {{ level.price }}</span></div>
                  </NCard>
                </NGridItem>
              </NGrid>
            </div>
          </NTabPane>

          <!-- ── Tab 2: 操作日誌 ─────────────────────────────────── -->
          <NTabPane name="logs" tab="操作日誌">
            <template #tab>
              <span class="flex items-center gap-1.5">
                <NIcon :component="ListOutline" />操作日誌
              </span>
            </template>
            <div class="mt-4">
              <NEmpty v-if="logsLoaded && logs.length === 0" description="暫無操作記錄" class="py-12" />
              <NDataTable
                v-else
                :columns="logColumns"
                :data="logs"
                :loading="!logsLoaded"
                :bordered="false"
                size="small"
                striped
              />
            </div>
          </NTabPane>

          <!-- ── Tab 3: 下層代理 ─────────────────────────────────── -->
          <NTabPane name="sub-agents" tab="下層代理">
            <template #tab>
              <span class="flex items-center gap-1.5">
                <NIcon :component="PeopleOutline" />下層代理
                <NBadge v-if="agent.sub_agent_count > 0" :value="agent.sub_agent_count" />
              </span>
            </template>
            <div class="mt-4">
              <NEmpty v-if="subsLoaded && subAgents.length === 0" description="此代理無直屬下線代理" class="py-12" />
              <NDataTable
                v-else
                :columns="subAgentColumns"
                :data="subAgents"
                :loading="!subsLoaded"
                :bordered="false"
                size="small"
                striped
              />
            </div>
          </NTabPane>

          <!-- ── Tab 4: 相關報表 ─────────────────────────────────── -->
          <NTabPane name="stats" tab="相關報表">
            <template #tab>
              <span class="flex items-center gap-1.5">
                <NIcon :component="BarChartOutline" />相關報表
              </span>
            </template>
            <div class="mt-4">
              <NSpin :show="!statsLoaded && activeTab === 'stats'" />
              <div v-if="stats">
                <NGrid :cols="4" :x-gap="16" :y-gap="16">
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="總會員數" :value="stats.total_players" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="活躍會員" :value="stats.active_players" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="新增會員" :value="stats.new_players" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="有效流水" :value="`$ ${stats.valid_turnover.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="總儲值" :value="`$ ${stats.total_deposit.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="總提款" :value="`$ ${stats.total_withdrawal.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="淨存款" :value="`$ ${stats.net_deposit.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="平台輸贏" :value="`$ ${stats.platform_win.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                  <NGridItem :span="2">
                    <NCard size="small" embedded class="border-l-4 border-green-500">
                      <NStatistic label="應付佣金" :value="`$ ${stats.commission_due.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded>
                      <NStatistic label="已付佣金" :value="`$ ${stats.commission_paid.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                  <NGridItem>
                    <NCard size="small" embedded class="border-l-4 border-orange-400">
                      <NStatistic label="待付佣金" :value="`$ ${stats.commission_pending.toLocaleString()}`" />
                    </NCard>
                  </NGridItem>
                </NGrid>
              </div>
            </div>
          </NTabPane>

        </NTabs>
      </NCard>
    </NSpin>
  </div>
</template>
