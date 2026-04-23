<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  NCard, NButton, NTag, NIcon, NDrawer, NDrawerContent, NForm, NFormItem,
  NInput, NDatePicker, NSpace, NDivider, NAlert, NEmpty, useMessage,
  NTooltip, NGrid, NGridItem, NTabs, NTabPane, NBadge
} from 'naive-ui'
import {
  AddOutline, CreateOutline, TrashOutline, CloudUploadOutline,
  ArrowUpOutline, ArrowDownOutline, CheckmarkCircleOutline
} from '@vicons/ionicons5'
import { frontendApi } from '@/api/frontend'
import type { SlotContent, FrontendPlatform, SlotType, ContentStatus } from '@/types/frontend'
import { SLOT_CONFIGS, STATUS_CONFIG } from '@/types/frontend'

const message = useMessage()

// ── Platform tab ──────────────────────────────────────────
const platform = ref<FrontendPlatform>('APP')

// ── Slot data ─────────────────────────────────────────────
const slotMap = ref<Record<string, SlotContent[]>>({})
const loading = ref(false)

const slotKey = (st: SlotType) => `${platform.value}_${st}`
const itemsFor = (st: SlotType): SlotContent[] => slotMap.value[slotKey(st)] ?? []
const pendingCount = (st: SlotType) => itemsFor(st).filter(i => i.status === 'PENDING').length

const loadAll = async () => {
  loading.value = true
  const res = await frontendApi.getSlotContents(platform.value)
  if (res.code === 0 && res.data) {
    const map: Record<string, SlotContent[]> = {}
    for (const item of res.data) {
      const key = `${item.platform}_${item.slot_type}`
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    slotMap.value = { ...slotMap.value, ...map }
  }
  loading.value = false
}

onMounted(loadAll)
const handlePlatformChange = () => loadAll()

// ── Visible slots ─────────────────────────────────────────
const visibleSlots = computed<SlotType[]>(() =>
  (Object.keys(SLOT_CONFIGS) as SlotType[]).filter(st =>
    SLOT_CONFIGS[st].platforms.includes(platform.value)
  )
)

// ── Drawer ────────────────────────────────────────────────
const showDrawer = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const drawerSlot = ref<SlotType>('BANNER')
const saving     = ref(false)
const submitting = ref(false)
const activeItem = ref<SlotContent | null>(null)

const form = reactive({
  id: '',
  title: '',
  image_url: '',
  link_target: '',
  scheduled_start: null as number | null,
  scheduled_end:   null as number | null
})

const currentSlotConfig = computed(() => SLOT_CONFIGS[drawerSlot.value])
const isReadonly = computed(() =>
  !!activeItem.value && !['DRAFT', 'REJECTED'].includes(activeItem.value.status)
)

const openCreate = (st: SlotType) => {
  drawerMode.value = 'create'; drawerSlot.value = st; activeItem.value = null
  Object.assign(form, { id: '', title: '', image_url: '', link_target: '', scheduled_start: null, scheduled_end: null })
  showDrawer.value = true
}

const openEdit = (item: SlotContent) => {
  drawerMode.value = 'edit'; drawerSlot.value = item.slot_type; activeItem.value = item
  Object.assign(form, {
    id: item.id, title: item.title, image_url: item.image_url,
    link_target: item.link_target ?? '',
    scheduled_start: item.scheduled_start ? new Date(item.scheduled_start).getTime() : null,
    scheduled_end:   item.scheduled_end   ? new Date(item.scheduled_end).getTime()   : null
  })
  showDrawer.value = true
}

const handleSaveDraft = async () => {
  if (!form.title) { message.warning('請填寫名稱'); return }
  saving.value = true
  const res = await frontendApi.saveContent({
    id: form.id || undefined, slot_type: drawerSlot.value, platform: platform.value,
    title: form.title,
    image_url: form.image_url || `https://picsum.photos/seed/${encodeURIComponent(form.title)}/400/200`,
    link_target: form.link_target,
    scheduled_start: form.scheduled_start ? new Date(form.scheduled_start).toISOString() : undefined,
    scheduled_end:   form.scheduled_end   ? new Date(form.scheduled_end).toISOString()   : undefined,
    status: 'DRAFT', submitted_by: 'operator',
    sort_order: itemsFor(drawerSlot.value).length + 1
  })
  saving.value = false
  if (res.code === 0) { message.success('已儲存草稿'); showDrawer.value = false; await loadAll() }
  else message.error('儲存失敗')
}

const handleSubmitReview = async () => {
  if (!form.title) { message.warning('請填寫名稱'); return }
  if (!form.scheduled_start || !form.scheduled_end) { message.warning('請設定上下架時間'); return }
  submitting.value = true
  let targetId = form.id
  if (!targetId) {
    const res = await frontendApi.saveContent({
      slot_type: drawerSlot.value, platform: platform.value, title: form.title,
      image_url: form.image_url || `https://picsum.photos/seed/${encodeURIComponent(form.title)}/400/200`,
      link_target: form.link_target,
      scheduled_start: new Date(form.scheduled_start!).toISOString(),
      scheduled_end:   new Date(form.scheduled_end!).toISOString(),
      status: 'DRAFT', submitted_by: 'operator', sort_order: itemsFor(drawerSlot.value).length + 1
    })
    if (res.code === 0 && res.data) targetId = res.data.id
  } else {
    await frontendApi.saveContent({
      id: targetId, title: form.title, image_url: form.image_url, link_target: form.link_target,
      scheduled_start: new Date(form.scheduled_start!).toISOString(),
      scheduled_end:   new Date(form.scheduled_end!).toISOString()
    })
  }
  if (targetId) {
    const r = await frontendApi.submitForReview(targetId)
    if (r.code === 0) { message.success('已提交審核，等待主管核准'); showDrawer.value = false; await loadAll() }
    else message.error('提交失敗')
  }
  submitting.value = false
}

const handleDelete = async (item: SlotContent) => {
  if (await frontendApi.deleteContent(item.id), true) { message.success('已刪除'); await loadAll() }
}

// ── Banner drag sort ───────────────────────────────────────
const dragFrom = ref<number | null>(null)

const onDragStart = (index: number) => { dragFrom.value = index }

const onDrop = async (toIndex: number, st: SlotType) => {
  if (dragFrom.value === null || dragFrom.value === toIndex) { dragFrom.value = null; return }
  const items = [...itemsFor(st)]
  const [moved] = items.splice(dragFrom.value, 1)
  items.splice(toIndex, 0, moved)
  slotMap.value = { ...slotMap.value, [slotKey(st)]: items }
  await frontendApi.updateSortOrder(platform.value, st, items.map(i => i.id))
  dragFrom.value = null
  message.success('排序已更新')
}

const moveBanner = async (index: number, dir: -1 | 1, st: SlotType) => {
  const items = [...itemsFor(st)]
  const target = index + dir
  if (target < 0 || target >= items.length) return
  ;[items[index], items[target]] = [items[target], items[index]]
  slotMap.value = { ...slotMap.value, [slotKey(st)]: items }
  await frontendApi.updateSortOrder(platform.value, st, items.map(i => i.id))
}

// ── Helpers ───────────────────────────────────────────────
const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('zh-TW') : '—'
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-xl font-bold text-gray-800">前台管理</h2>
        <p class="text-sm text-gray-400 mt-1">管理 APP 與官網各版位的視覺內容，上傳後需主管審核才能上線</p>
      </div>
    </div>

    <!-- Platform tabs -->
    <NTabs v-model:value="platform" type="segment" @update:value="handlePlatformChange" class="mb-6">
      <NTabPane name="APP" tab="📱 APP" />
      <NTabPane name="WEB" tab="🌐 官網" />
    </NTabs>

    <!-- Slot sections -->
    <div class="space-y-5">
      <NCard v-for="st in visibleSlots" :key="st" :bordered="false" class="rounded-2xl shadow-sm">
        <!-- Section header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <span class="font-bold text-gray-800">{{ SLOT_CONFIGS[st].label }}</span>
              <NTag size="tiny" :bordered="false">{{ SLOT_CONFIGS[st].aspectLabel }}</NTag>
              <NTag v-if="pendingCount(st) > 0" size="tiny" type="warning" :bordered="false">
                待審 {{ pendingCount(st) }}
              </NTag>
            </div>
            <p class="text-xs text-gray-400">{{ SLOT_CONFIGS[st].description }}</p>
          </div>
          <NButton
            size="small" type="primary" quaternary
            :disabled="itemsFor(st).length >= SLOT_CONFIGS[st].maxItems"
            @click="openCreate(st)"
          >
            <template #icon><NIcon :component="AddOutline" /></template>
            新增（{{ itemsFor(st).length }}/{{ SLOT_CONFIGS[st].maxItems }}）
          </NButton>
        </div>

        <!-- Empty -->
        <NEmpty v-if="itemsFor(st).length === 0" description="尚無內容，點擊「新增」開始上傳" style="padding: 24px 0" />

        <!-- Banner: draggable -->
        <div v-else-if="st === 'BANNER'" class="flex flex-wrap gap-4">
          <div
            v-for="(item, idx) in itemsFor(st)"
            :key="item.id"
            draggable="true"
            @dragstart="onDragStart(idx)"
            @dragover.prevent
            @drop="onDrop(idx, st)"
            :class="[
              'group relative rounded-xl overflow-hidden border-2 transition-all cursor-grab',
              dragFrom === idx ? 'border-blue-400 opacity-50 scale-95' : 'border-transparent hover:border-blue-200'
            ]"
            style="width: 210px"
          >
            <img :src="item.image_url" class="w-full object-cover" style="height: 118px" :alt="item.title" />
            <div class="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">#{{ idx + 1 }}</div>
            <div class="absolute top-2 right-2">
              <NTag :type="STATUS_CONFIG[item.status].type" size="tiny" :bordered="false">{{ STATUS_CONFIG[item.status].label }}</NTag>
            </div>
            <div class="bg-white px-2 py-1.5">
              <p class="text-xs font-semibold text-gray-700 truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(item.scheduled_start) }} — {{ formatDate(item.scheduled_end) }}</p>
            </div>
            <!-- Hover actions -->
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <NTooltip><template #trigger>
                <NButton circle size="small" @click.stop="moveBanner(idx, -1, st)" :disabled="idx === 0">
                  <template #icon><NIcon :component="ArrowUpOutline" /></template>
                </NButton>
              </template>向前移</NTooltip>
              <NButton circle size="small" type="info" @click.stop="openEdit(item)">
                <template #icon><NIcon :component="CreateOutline" /></template>
              </NButton>
              <NTooltip><template #trigger>
                <NButton circle size="small" @click.stop="moveBanner(idx, 1, st)" :disabled="idx === itemsFor(st).length - 1">
                  <template #icon><NIcon :component="ArrowDownOutline" /></template>
                </NButton>
              </template>向後移</NTooltip>
              <NButton
                v-if="['DRAFT','REJECTED'].includes(item.status)"
                circle size="small" type="error"
                @click.stop="handleDelete(item)"
              >
                <template #icon><NIcon :component="TrashOutline" /></template>
              </NButton>
            </div>
          </div>
        </div>

        <!-- Other slots -->
        <div v-else class="flex flex-wrap gap-4">
          <div
            v-for="item in itemsFor(st)"
            :key="item.id"
            class="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all"
            style="width: 210px"
          >
            <img :src="item.image_url" class="w-full object-cover" style="height: 118px" :alt="item.title" />
            <div class="absolute top-2 right-2">
              <NTag :type="STATUS_CONFIG[item.status].type" size="tiny" :bordered="false">{{ STATUS_CONFIG[item.status].label }}</NTag>
            </div>
            <div class="bg-white px-2 py-1.5">
              <p class="text-xs font-semibold text-gray-700 truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(item.scheduled_start) }} — {{ formatDate(item.scheduled_end) }}</p>
            </div>
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <NButton circle size="small" type="info" @click.stop="openEdit(item)">
                <template #icon><NIcon :component="CreateOutline" /></template>
              </NButton>
              <NButton
                v-if="['DRAFT','REJECTED'].includes(item.status)"
                circle size="small" type="error"
                @click.stop="handleDelete(item)"
              >
                <template #icon><NIcon :component="TrashOutline" /></template>
              </NButton>
            </div>
          </div>
        </div>
      </NCard>
    </div>

    <!-- ── Edit / Create Drawer ───────────────────────────── -->
    <NDrawer v-model:show="showDrawer" :width="460" placement="right">
      <NDrawerContent :title="drawerMode === 'create' ? `新增 ${currentSlotConfig.label}` : `編輯 ${currentSlotConfig.label}`" closable>

        <NAlert v-if="isReadonly" type="info" class="mb-4">此內容已提交審核或已上線，僅供檢視</NAlert>
        <NAlert v-if="activeItem?.status === 'REJECTED'" type="error" class="mb-4">
          <b>拒絕原因：</b>{{ activeItem.reject_reason }}
        </NAlert>

        <NForm label-placement="top" :disabled="isReadonly">
          <NFormItem label="內部識別名稱" required>
            <NInput v-model:value="form.title" placeholder="例如：4月活動Banner" />
          </NFormItem>

          <NFormItem label="圖片上傳">
            <div
              class="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors cursor-pointer overflow-hidden bg-gray-50"
              style="height: 140px"
            >
              <img
                v-if="form.image_url || activeItem?.image_url"
                :src="form.image_url || activeItem?.image_url"
                class="w-full h-full object-cover"
                alt=""
              />
              <div v-else class="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                <NIcon :component="CloudUploadOutline" size="28" />
                <span class="text-sm">點擊選擇圖片</span>
                <span class="text-xs">建議比例 {{ currentSlotConfig.aspectLabel }}</span>
              </div>
            </div>
            <span class="text-xs text-gray-400 mt-1">原型模式：實際部署時串接上傳 API</span>
          </NFormItem>

          <NFormItem v-if="currentSlotConfig.hasLink" label="點擊連結目標（選填）">
            <NInput v-model:value="form.link_target" placeholder="例如：/events/april" />
          </NFormItem>

          <NGrid :cols="2" :x-gap="12">
            <NGridItem>
              <NFormItem label="排程上線時間" required>
                <NDatePicker v-model:value="form.scheduled_start" type="datetime" placeholder="選擇上線時間" style="width:100%" />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem label="排程下線時間" required>
                <NDatePicker v-model:value="form.scheduled_end" type="datetime" placeholder="選擇下線時間" style="width:100%" />
              </NFormItem>
            </NGridItem>
          </NGrid>

          <!-- Current status -->
          <div v-if="activeItem" class="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>目前狀態：</span>
            <NTag :type="STATUS_CONFIG[activeItem.status].type" :bordered="false">{{ STATUS_CONFIG[activeItem.status].label }}</NTag>
            <span v-if="activeItem.submitted_at" class="text-xs text-gray-400">
              提交於 {{ formatDate(activeItem.submitted_at) }}
            </span>
          </div>

          <NDivider dashed class="!my-4" />

          <div class="flex gap-2" v-if="!isReadonly">
            <NButton quaternary :loading="saving" @click="handleSaveDraft">儲存草稿</NButton>
            <NButton type="primary" style="flex:1" :loading="submitting" @click="handleSubmitReview">
              <template #icon><NIcon :component="CheckmarkCircleOutline" /></template>
              提交審核
            </NButton>
          </div>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
