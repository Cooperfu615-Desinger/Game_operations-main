<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  NCard, NDataTable, NGrid, NGridItem, NTag, NStatistic, 
  NSpace, NDivider, NAvatar, NSkeleton, NEmpty, NButton, NIcon
} from 'naive-ui'
import { EyeOutline } from '@vicons/ionicons5'
import * as echarts from 'echarts'
import { vipApi } from '@/api/vip'
import { VIPLevel } from '@/types/vip'

const { t } = useI18n()
const loading = ref(true)
const vipLevels = ref<VIPLevel[]>([])
const selectedRank = ref(3) // Default selected VIP 3

// Chart Refs
const distributionRef = ref<HTMLElement | null>(null)
const retentionRef = ref<HTMLElement | null>(null)
const demotionRef = ref<HTMLElement | null>(null)
const promotionRef = ref<HTMLElement | null>(null)

let charts: echarts.ECharts[] = []

// Mock Animation Stats Data
const statsData = reactive({
  settledDate: '2026/04/01',
  distribution: [
    { value: 1200, name: 'VIP 0', rank: 0 },
    { value: 850, name: 'VIP 1', rank: 1 },
    { value: 450, name: 'VIP 2', rank: 2 },
    { value: 300, name: 'VIP 3', rank: 3 },
    { value: 150, name: 'VIP 4', rank: 4 },
    { value: 80, name: 'VIP 5', rank: 5 },
    { value: 40, name: 'VIP 6', rank: 6 },
    { value: 20, name: 'VIP 7', rank: 7 },
    { value: 10, name: 'VIP 8', rank: 8 },
    { value: 5, name: 'VIP 9', rank: 9 },
    { value: 2, name: 'VIP 10', rank: 10 }
  ],
  // Rates for each rank
  rates: {
    0: { retention: 85, demotion: 0, promotion: 15 },
    1: { retention: 80, demotion: 0, promotion: 20 },
    2: { retention: 75, demotion: 0, promotion: 25 },
    3: { retention: 72, demotion: 12, promotion: 16 },
    4: { retention: 80, demotion: 8, promotion: 12 },
    5: { retention: 82, demotion: 6, promotion: 12 },
    6: { retention: 85, demotion: 5, promotion: 10 },
    7: { retention: 88, demotion: 4, promotion: 8 },
    8: { retention: 90, demotion: 3, promotion: 7 },
    9: { retention: 92, demotion: 2, promotion: 6 },
    10: { retention: 95, demotion: 5, promotion: 0 }
  },
  promotionCounts: {
    0: { count: 120, trend: '+5%' },
    1: { count: 245, trend: '+8%' },
    2: { count: 180, trend: '+12%' },
    3: { count: 423, trend: '+12%' },
    4: { count: 95, trend: '+4%' },
    5: { count: 56, trend: '+2%' },
    6: { count: 24, trend: '-2%' },
    7: { count: 15, trend: '+1%' },
    8: { count: 8, trend: '0%' },
    9: { count: 3, trend: '-1%' },
    10: { count: 0, trend: '0%' }
  }
})

const getRateChartOption = (title: string, value: number, color: string) => {
  return {
    title: [
      {
        text: title,
        left: 'center',
        top: '85%',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: '#666'
        }
      },
      {
        text: `${value}%`,
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: color
        }
      }
    ],
    series: [
      {
        type: 'pie',
        radius: ['55%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { disabled: true },
        data: [
          { 
            value: value, 
            name: 'Rate',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: color },
                { offset: 1, color: color + '99' }
              ])
            }
          },
          { 
            value: 100 - value, 
            name: 'Remaining',
            itemStyle: { color: '#f3f4f6' }
          }
        ]
      }
    ]
  }
}

const updateRatesCharts = () => {
  const currentRates = statsData.rates[selectedRank.value as keyof typeof statsData.rates]
  if (!charts[1] || !charts[2] || !charts[3]) return

  charts[1].setOption(getRateChartOption(t('vipStats.retentionChart'), currentRates.retention, '#3b82f6'))
  charts[2].setOption(getRateChartOption(t('vipStats.demotionChart'), currentRates.demotion, '#ef4444'))
  charts[3].setOption(getRateChartOption(t('vipStats.promotionChart'), currentRates.promotion, '#10b981'))
}

const initCharts = () => {
  if (!distributionRef.value) return

  // 1. Distribution Chart
  const distChart = echarts.init(distributionRef.value)
  const distOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center', icon: 'circle', textStyle: { fontSize: 11 } },
    series: [
      {
        name: t('vipStats.distributionChart'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: statsData.distribution
      }
    ]
  }
  distChart.setOption(distOption)
  distChart.on('click', (params: any) => {
    if (params.data && typeof params.data.rank === 'number') {
      selectedRank.value = params.data.rank
    }
  })

  // 2. Rate Charts
  const retChart = echarts.init(retentionRef.value!)
  const demChart = echarts.init(demotionRef.value!)
  const proChart = echarts.init(promotionRef.value!)

  charts = [distChart, retChart, demChart, proChart]
  updateRatesCharts()
}

const fetchVIPData = async () => {
  try {
    const res = await vipApi.getVIPLevels()
    if (res.code === 0) {
      vipLevels.value = res.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    nextTick(() => {
      initCharts()
    })
  }
}

const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

watch(selectedRank, () => {
  updateRatesCharts()
})

onMounted(() => {
  fetchVIPData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})

// Table Columns for Reference
const columns = [
  { 
    title: t('vip.tableRank'), 
    key: 'rank', 
    width: 80, 
    render: (row: VIPLevel) => h(NTag, { type: 'info', bordered: false, round: true }, { default: () => `VIP ${row.rank}` })
  },
  { 
    title: t('vip.tableName'), 
    key: 'name', 
    width: 140,
    render: (row: VIPLevel) => h('div', { class: 'flex items-center gap-2' }, [
      h(NAvatar, { size: 24, round: true, src: row.icon_url }, { default: () => row.name[0] }),
      h('span', { class: 'font-bold' }, row.name)
    ])
  },
  { 
    title: '晉升條件概覽', 
    key: 'promotion_desc',
    render: (row: VIPLevel) => h('div', { class: 'text-xs text-gray-500' }, row.promotion_desc)
  },
  { 
    title: '保級與優惠', 
    key: 'retention_desc',
    render: (row: VIPLevel) => h('div', { class: 'text-xs text-gray-500' }, [
      h('div', row.is_perpetual ? '無條件保級' : '需保級'),
      h('div', `返水: ${row.rebate_rate}% | 手續費: ${row.gift_fee_rate}%`)
    ])
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render: (row: VIPLevel) => h(
      NButton,
      {
        size: 'small',
        quaternary: true,
        circle: true,
        type: row.rank === selectedRank.value ? 'primary' : 'default',
        onClick: () => { selectedRank.value = row.rank }
      },
      { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }
    )
  }
]
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Header Summary -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">{{ t('vipStats.title') }}</h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ t('vipStats.settledUntil') }} <NTag size="small" :bordered="false" type="warning">{{ statsData.settledDate }}</NTag>
          <span class="ml-2">※ 每月自動結算成長變動快照</span>
        </p>
      </div>
      <NSpace>
        <NCard class="premium-glass !p-3" size="small">
          <NStatistic :label="t('vipStats.totalVIP')" :value="3107">
            <template #prefix>👑</template>
          </NStatistic>
        </NCard>
        <NCard class="premium-glass !p-3" size="small">
          <NStatistic :label="`${t('vipStats.selectedLevel')} VIP ${selectedRank} ${t('vipStats.metrics.promotion')}`" :value="statsData.promotionCounts[selectedRank as keyof typeof statsData.promotionCounts].count">
            <template #prefix>📈</template>
            <template #suffix>
              <span class="text-xs text-green-500 ml-1">
                {{ statsData.promotionCounts[selectedRank as keyof typeof statsData.promotionCounts].trend }}
              </span>
            </template>
          </NStatistic>
        </NCard>
      </NSpace>
    </div>

    <!-- Charts Dashboard -->
    <NGrid :cols="12" :x-gap="16" :y-gap="16">
      <!-- Main Distribution -->
      <NGridItem :span="5">
        <NCard :title="t('vipStats.distributionChart')" class="premium-glass h-full shadow-sm" header-style="font-weight: bold">
          <div ref="distributionRef" class="w-full h-[400px]"></div>
          <div class="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 italic text-xs text-blue-600">
            💡 點擊圖表區塊可查看該等級的詳細變動率
          </div>
        </NCard>
      </NGridItem>

      <!-- Sub Rates -->
      <NGridItem :span="7">
        <div class="flex flex-col h-full gap-4">
          <NCard class="premium-glass flex-1 shadow-sm" :title="`${t('vipStats.selectedLevel')}: VIP ${selectedRank}`">
            <NGrid :cols="3" :x-gap="12">
              <NGridItem>
                <div ref="retentionRef" class="w-full h-[300px]"></div>
              </NGridItem>
              <NGridItem>
                <div ref="demotionRef" class="w-full h-[300px]"></div>
              </NGridItem>
              <NGridItem>
                <div ref="promotionRef" class="w-full h-[300px]"></div>
              </NGridItem>
            </NGrid>
          </NCard>
        </div>
      </NGridItem>
    </NGrid>

    <!-- Detailed List -->
    <NCard :title="t('vipStats.levelList')" class="premium-glass shadow-sm" header-style="font-weight: bold">
      <NDataTable 
        :columns="columns" 
        :data="vipLevels" 
        :loading="loading" 
        :bordered="false"
        class="premium-table"
      />
    </NCard>
  </div>
</template>

<style scoped>
.premium-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  border-radius: 16px;
}

.premium-table :deep(.n-data-table-th) {
  background-color: rgba(249, 250, 251, 0.5);
  font-weight: bold;
}

:deep(.n-statistic .n-statistic-value__content) {
  font-size: 20px;
  font-weight: 800;
}
</style>
