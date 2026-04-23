<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  NCard, NTag, NButton, NInput, NAvatar, NScrollbar,
  NIcon, NSpace, NTooltip, NBadge, NAlert, NDivider
} from 'naive-ui'
import {
  SearchOutline, FlagOutline, BanOutline, EyeOffOutline,
  RefreshOutline, VolumeHighOutline, VolumeMuteOutline
} from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

const message = useMessage()

// ── Types ─────────────────────────────────────────────────
interface WorldMessage {
  id: string
  player_id: string
  player_name: string
  avatar_color: string
  content: string
  timestamp: string
  flagged: boolean
  muted: boolean
  hidden: boolean
}

// ── Mock messages ─────────────────────────────────────────
const colors = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#0ea5e9','#f97316','#14b8a6']
const msgPool = [
  { pid: 'U-10045', name: '陳大文',   content: '剛抽到S級角色！！！😱' },
  { pid: 'U-20891', name: '林小美',   content: '請問今天有什麼活動？' },
  { pid: 'U-33412', name: '張志成',   content: '這遊戲好好玩，推推推' },
  { pid: 'U-55678', name: '黃建宏',   content: '有人要組隊嗎' },
  { pid: 'U-88231', name: '吳淑芬',   content: '客服快點處理我的問題！！！' },
  { pid: 'U-29041', name: '鄭雅玲',   content: '這個活動CP值超高的' },
  { pid: 'U-44123', name: '王小明',   content: '哈哈哈剛輸了1000金幣' },
  { pid: 'U-76543', name: '趙大勇',   content: '有沒有人分享抽卡技巧' },
  { pid: 'U-11111', name: '李曉晴',   content: '這遊戲根本是詐騙！完全抽不到！！', },
  { pid: 'U-22222', name: '周文豪',   content: 'GG大家早' },
  { pid: 'U-33333', name: '陳玉珊',   content: '我充了5000還是沒抽到，退費！！！' },
  { pid: 'U-44444', name: '蔡志宏',   content: '新手有什麼推薦角色嗎' },
]

let idSeq = 1
interface MsgSeed { pid: string; name: string; content: string }
const makeMsg = (override?: MsgSeed): WorldMessage => {
  const src: MsgSeed = override ?? msgPool[Math.floor(Math.random() * msgPool.length)]
  const now = new Date()
  return {
    id:           `wm_${String(idSeq++).padStart(4,'0')}`,
    player_id:    src.pid,
    player_name:  src.name,
    avatar_color: colors[msgPool.findIndex(m => m.pid === src.pid) % colors.length],
    content:      src.content,
    timestamp:    new Date(now.getTime() - Math.floor(Math.random() * 30000)).toISOString(),
    flagged:      false,
    muted:        false,
    hidden:       false
  }
}

// ── State ─────────────────────────────────────────────────
const messages   = ref<WorldMessage[]>([])
const filterQ    = ref('')
const autoScroll = ref(true)
const paused     = ref(false)
let   timer: ReturnType<typeof setInterval> | null = null

const flaggedCount = ref(0)
const mutedPlayers = ref<Set<string>>(new Set())

// seed 10 messages
onMounted(() => {
  for (let i = 0; i < 10; i++) {
    const m = makeMsg()
    m.timestamp = new Date(Date.now() - (10 - i) * 8000).toISOString()
    messages.value.push(m)
  }
  startStream()
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const startStream = () => {
  timer = setInterval(() => {
    if (paused.value) return
    const m = makeMsg()
    messages.value.push(m)
    if (messages.value.length > 200) messages.value.shift()
  }, 3500)
}

const togglePause = () => { paused.value = !paused.value }

const flagMsg = (msg: WorldMessage) => {
  msg.flagged = !msg.flagged
  flaggedCount.value += msg.flagged ? 1 : -1
  message.info(msg.flagged ? `已標記 ${msg.player_name} 的訊息` : '已取消標記')
}

const hideMsg = (msg: WorldMessage) => {
  msg.hidden = true
  message.success('訊息已隱藏')
}

const mutePlayer = (msg: WorldMessage) => {
  if (mutedPlayers.value.has(msg.player_id)) {
    mutedPlayers.value.delete(msg.player_id)
    messages.value.forEach(m => { if (m.player_id === msg.player_id) m.muted = false })
    message.info(`已解除 ${msg.player_name} 的靜音`)
  } else {
    mutedPlayers.value.add(msg.player_id)
    messages.value.forEach(m => { if (m.player_id === msg.player_id) m.muted = true })
    message.warning(`已靜音 ${msg.player_name}`)
  }
}

const isMuted = (playerId: string) => mutedPlayers.value.has(playerId)

const visibleMessages = () =>
  messages.value.filter(m =>
    !m.hidden &&
    (filterQ.value === '' ||
      m.player_name.includes(filterQ.value) ||
      m.player_id.toLowerCase().includes(filterQ.value.toLowerCase()) ||
      m.content.includes(filterQ.value))
  )

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-xl font-bold text-gray-800">世界頻道監控</h2>
        <p class="text-sm text-gray-400 mt-1">即時監控世界頻道訊息，可標記、隱藏、靜音玩家</p>
      </div>
      <NSpace>
        <NBadge :value="flaggedCount" :show="flaggedCount > 0">
          <NTag type="error" :bordered="false">
            <template #icon><NIcon :component="FlagOutline" /></template>
            待處理標記
          </NTag>
        </NBadge>
        <NBadge :value="mutedPlayers.size" :show="mutedPlayers.size > 0">
          <NTag type="warning" :bordered="false">
            <template #icon><NIcon :component="VolumeMuteOutline" /></template>
            已靜音玩家
          </NTag>
        </NBadge>
      </NSpace>
    </div>

    <!-- Controls -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm mb-4">
      <div class="flex items-center gap-3 flex-wrap">
        <NInput
          v-model:value="filterQ"
          placeholder="篩選玩家或訊息關鍵字"
          clearable
          style="width: 260px"
        >
          <template #prefix><NIcon :component="SearchOutline" /></template>
        </NInput>
        <NButton
          :type="paused ? 'primary' : 'default'"
          @click="togglePause"
        >
          <template #icon>
            <NIcon :component="paused ? VolumeHighOutline : VolumeMuteOutline" />
          </template>
          {{ paused ? '繼續接收' : '暫停接收' }}
        </NButton>
        <NTag type="success" :bordered="false" size="small" v-if="!paused">
          ● 即時接收中
        </NTag>
        <NTag type="default" :bordered="false" size="small" v-else>
          ⏸ 已暫停
        </NTag>
        <span class="text-xs text-gray-400 ml-auto">共 {{ visibleMessages().length }} 則顯示中</span>
      </div>
    </NCard>

    <!-- Message feed -->
    <NCard :bordered="false" class="rounded-2xl shadow-sm">
      <NScrollbar style="max-height: calc(100vh - 340px)">
        <div class="space-y-1 pr-2">
          <div
            v-for="msg in visibleMessages()"
            :key="msg.id"
            :class="[
              'flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors group',
              msg.flagged ? 'bg-red-50 border border-red-100' : 'hover:bg-gray-50'
            ]"
          >
            <!-- Avatar -->
            <NAvatar
              round size="small"
              :style="{ backgroundColor: msg.avatar_color, opacity: isMuted(msg.player_id) ? 0.4 : 1 }"
            >
              {{ msg.player_name[0] }}
            </NAvatar>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span :class="['text-sm font-semibold', isMuted(msg.player_id) ? 'text-gray-400 line-through' : 'text-gray-800']">
                  {{ msg.player_name }}
                </span>
                <span class="text-xs text-gray-400">{{ msg.player_id }}</span>
                <NTag v-if="msg.flagged" type="error" size="tiny" :bordered="false">已標記</NTag>
                <NTag v-if="isMuted(msg.player_id)" type="warning" size="tiny" :bordered="false">已靜音</NTag>
                <span class="text-xs text-gray-300 ml-auto">{{ formatTime(msg.timestamp) }}</span>
              </div>
              <p :class="['text-sm mt-0.5', isMuted(msg.player_id) ? 'text-gray-300 line-through' : 'text-gray-700']">
                {{ msg.content }}
              </p>
            </div>

            <!-- Actions (show on hover) -->
            <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <NSpace size="small">
                <NTooltip>
                  <template #trigger>
                    <NButton
                      circle quaternary size="tiny"
                      :type="msg.flagged ? 'error' : 'default'"
                      @click="flagMsg(msg)"
                    >
                      <template #icon><NIcon :component="FlagOutline" /></template>
                    </NButton>
                  </template>
                  {{ msg.flagged ? '取消標記' : '標記此訊息' }}
                </NTooltip>
                <NTooltip>
                  <template #trigger>
                    <NButton
                      circle quaternary size="tiny"
                      :type="isMuted(msg.player_id) ? 'warning' : 'default'"
                      @click="mutePlayer(msg)"
                    >
                      <template #icon><NIcon :component="isMuted(msg.player_id) ? VolumeHighOutline : VolumeMuteOutline" /></template>
                    </NButton>
                  </template>
                  {{ isMuted(msg.player_id) ? '解除靜音' : '靜音此玩家' }}
                </NTooltip>
                <NTooltip>
                  <template #trigger>
                    <NButton circle quaternary size="tiny" @click="hideMsg(msg)">
                      <template #icon><NIcon :component="EyeOffOutline" /></template>
                    </NButton>
                  </template>
                  隱藏此訊息
                </NTooltip>
              </NSpace>
            </div>
          </div>

          <NAlert v-if="visibleMessages().length === 0" type="info" class="mt-4">
            {{ filterQ ? '無符合篩選條件的訊息' : '目前沒有訊息' }}
          </NAlert>
        </div>
      </NScrollbar>
    </NCard>
  </div>
</template>
