# 開發日誌 — Game Operations 後台改版紀錄
> 期間：2026-04-20 ～ 2026-04-23  
> Commits 涵蓋範圍：`5f94bff` → `dd7f83c`（共 20 筆）  
> 技術棧：Vue 3.3 · TypeScript · Vite 5 · Pinia · Vue Router 4 · Naive UI 2.36 · Tailwind CSS

---

## 目錄

1. [整體架構說明](#1-整體架構說明)
2. [角色型導覽系統重構](#2-角色型導覽系統重構)
3. [代理管理模組](#3-代理管理模組)
4. [財務管理補強](#4-財務管理補強)
5. [客服管理模組](#5-客服管理模組)
6. [前台管理模組](#6-前台管理模組)
7. [優惠管理模組](#7-優惠管理模組)
8. [任務管理模組](#8-任務管理模組)
9. [設計規範與共用模式](#9-設計規範與共用模式)
10. [已修復的型別錯誤](#10-已修復的型別錯誤)
11. [尚未實作 / 待討論](#11-尚未實作--待討論)

---

## 1. 整體架構說明

### 技術層架

```
src/
├── api/           # Mock API 層（含 delay 模擬、in-memory CRUD）
├── mocks/         # 靜態 Mock 資料（陣列與 singleton 直接操作）
├── types/         # TypeScript 介面、type union、config lookup 表
├── views/
│   ├── Master/    # 主要後台頁面
│   ├── DataCenter/
│   ├── AgentManagement/
│   ├── CustomerService/
│   └── VIPManagement/
├── stores/        # Pinia stores（useAuthStore、useConfigStore）
├── router/        # Vue Router，所有 admin 路由集中於 masterRoutes[]
└── locales/       # i18n：zh-TW / zh-CN / en
```

### 角色定義

| 角色代碼 | 說明 | 群組 |
|---|---|---|
| `BOSS` | 老闆 | LEADERSHIP |
| `DEVELOPER` | 開發者（全權限） | LEADERSHIP |
| `PM` | 產品經理 | LEADERSHIP |
| `MANAGER` | 營運管理者 | LEADERSHIP |
| `OPERATOR` | 一般營運 | BROAD_ADMIN |
| `FINANCE` | 財務 | BROAD_ADMIN |
| `DEVOPS` | 運維 | BROAD_ADMIN |
| `TECH` | 技術 | BROAD_ADMIN |
| `CS` | 客服 | BROAD_ADMIN |
| `RISK` | 風控 | — |

```typescript
// Layout.vue 角色可見性 helper
const sees = (...roles: string[]) => roles.includes(authStore.user?.role ?? '')
const LEADERSHIP  = ['BOSS', 'DEVELOPER', 'PM', 'MANAGER']
const BROAD_ADMIN = [...LEADERSHIP, 'OPERATOR', 'DEVOPS', 'FINANCE', 'CS', 'TECH']
```

---

## 2. 角色型導覽系統重構

**Commits:** `5403801` `5f94bff` `ddf93c5` `f83212a` `3aaaeee` `78cc289`

### 變更內容

#### 玩家管理改名
- `玩家管理` → `會員管理`（sidebar 群組 key 與 i18n 一致更新）

#### 新增頁面
- **PlayerWinLossRanking** (`/admin/player-win-loss-ranking`)：玩家輸贏排行榜，含期間篩選、排行表格

#### 導覽群組重排
最終導覽順序（從上到下）：

```
首頁
統計報表（DataCenter）
代理管理
會員管理
前台管理       ← 本次新增
優惠管理       ← 本次新增
任務管理       ← 本次新增
內容管理
遊戲管理
客服管理
通訊管理
風控管理
財務管理
金流管理
系統管理
```

#### 7 個快速登入身份
在登入頁新增一排 Chip，點擊即填入測試帳號，方便開發時快速切換角色驗證導覽可見性：

| 按鈕 | Role |
|---|---|
| 老闆 | `BOSS` |
| PM | `PM` |
| 開發者 | `DEVELOPER` |
| 營運管理 | `MANAGER` |
| 一般營運 | `OPERATOR` |
| 客服 | `CS` |
| 財務 | `FINANCE` |

---

## 3. 代理管理模組

**Commits:** `64cb917` `80ad148`

### 新增頁面

#### AgentDetail (`/admin/agent/:id`)
- 代理基本資訊卡（帳號、等級、推薦人、加入日期、狀態）
- 玩家總覽 KPI（直屬人數、當月活躍、累計存款、累計派彩）
- 直屬玩家列表（可排序、點擊連結至玩家詳情）
- 操作歷史時間軸（凍結、解凍、等級變更記錄）

#### AgentCommission (`/admin/agent-commission/:id`)
- 佣金方案設定：流水比例、輸贏比例、等級門檻
- 各遊戲類型個別費率覆寫
- 儲存並提交審核流程

#### AgentReport (`/admin/agent-report`)
- 多維度統計：代理數量、活躍玩家、存款總額、派彩總額、佣金支出
- 期間篩選（本月 / 上月 / 自訂）
- 代理層級下鑽

### 修復
- `AgentDetail.vue`：補上缺漏的 `h()` import
- `AgentReport.vue`：`NSelect` v-model 從 `string` 修正為 `string | null`

---

## 4. 財務管理補強

**Commits:** `cb4b16d` `78cc289`

### 新增頁面

#### RefundManagement (`/admin/refund-management`)
- 退款申請列表（含狀態：待處理 / 已退款 / 已拒絕）
- 退款原因分類、玩家資訊、金額明細
- 批准 / 拒絕操作，拒絕時需填寫原因

### 導覽重排
- 代理管理群組移至會員管理之前（業務邏輯優先順序）
- 財務管理群組移至底部（較少日常使用）

---

## 5. 客服管理模組

**Commits:** `8875d17` `1b7b8a7`

### 新增頁面

#### CSWorkbench (`/admin/cs-workbench`)
- 客服工作台：待處理工單列表、快速回覆、對話紀錄
- 玩家資料側欄（資產摘要、最近操作）

#### PlayerConversationSearch (`/admin/cs-player-search`)
- 依玩家 ID / 用戶名搜尋對話紀錄
- 時間軸式對話展示
- 匯出功能（CSV）

#### WorldChannelMonitor (`/admin/cs-world-monitor`)
- 即時世界頻道訊息監控
- 敏感字標示、一鍵禁言

### 修復
- `WorldChannelMonitor.vue`：`Partial<>` 造成 `string | undefined` 無法賦值給 `string` 的型別錯誤，改以 explicit 欄位初始化解決

---

## 6. 前台管理模組

**Commits:** `86753b4` `f170827`

### 新增 / 修改的檔案

| 檔案 | 狀態 | 說明 |
|---|---|---|
| `src/types/frontend.ts` | 新增 | `SlotType`、`ContentStatus`、`SlotContent` 介面；`SLOT_CONFIGS`、`STATUS_CONFIG` lookup 表 |
| `src/mocks/frontend.ts` | 新增 | 20 筆版位內容 mock（APP/WEB 各版位，含多種狀態） |
| `src/api/frontend.ts` | 新增 | CRUD + 審核流程 + 排序 API |
| `src/views/Master/FrontendManagement.vue` | 重寫 | 完整版位管理介面 |
| `src/views/Master/FrontendReview.vue` | 新增 | 前台內容審核中心 |

### FrontendManagement 功能
- **平台分頁**：APP / WEB 分開管理
- **版位卡片區塊**：Banner、公告、活動、熱門遊戲等各版位獨立呈現
- **HTML5 拖拉排序**：Banner 類版位支援拖拉重排，自動呼叫 `updateSortOrder`
- **新增/編輯 Drawer**：標題、圖片 URL、連結、排程時間、平台、版位選擇
- **草稿存檔 / 送審流程**：`DRAFT → PENDING → ACTIVE / REJECTED`

### FrontendReview 功能
- KPI 摘要卡：待審核數、今日已核准、今日已拒絕
- 篩選：平台、版位類型、關鍵字
- 預覽 Modal：展示內容縮圖 + 申請人資訊 + 核准 / 拒絕操作

### 移除
- **圖片管理**（原在「內容管理」群組）：功能由「前台管理」的版位管理取代，已從路由與導覽中移除

---

## 7. 優惠管理模組

**Commits:** `67d323d` `bfc0a3d`

### 新增檔案

| 檔案 | 說明 |
|---|---|
| `src/types/promotion.ts` | 優惠類型定義 |
| `src/mocks/promotion.ts` | 13 筆優惠 mock + 25 筆領取紀錄 |
| `src/api/promotion.ts` | 完整 CRUD + 審核 + 紀錄查詢 |
| `src/views/Master/PromotionManagement.vue` | 優惠活動管理主頁 |
| `src/views/Master/PromotionReview.vue` | 優惠活動審核中心 |
| `src/views/Master/PromotionRecords.vue` | 優惠領取紀錄查詢 |

### 優惠類型設計

```typescript
type PromotionType =
  | 'FIRST_DEPOSIT'   // 首儲優惠（階梯型）
  | 'DEPOSIT'         // 儲值優惠（階梯型）
  | 'WEB_DEPOSIT'     // WEB 儲值優惠（階梯型）
  | 'DAILY_CHECKIN'   // 每日簽到（已由任務模組取代）
  | 'PHONE_BINDING'   // 手機綁定（單一獎勵）
  | 'VIP_UPGRADE'     // VIP 升等（單一獎勵）
```

**階梯型優惠**（首儲 / 儲值 / WEB 儲值）：
```typescript
interface DepositTier {
  id: string
  min_deposit: number   // 最低儲值金幣
  reward_silver: number // 贈送銀幣
}
// e.g. 儲值 100 送 500、儲值 500 送 5000、儲值 1000 送 12000
```

**單一獎勵型**：直接設定 `reward_silver` 欄位

### PromotionManagement 功能
- 統計 KPI（上線中、待審核、今日領取次數、今日總派銀）
- 篩選列（類型、狀態、關鍵字）
- 新增/編輯 Drawer：依類型切換「階梯表格」或「單一輸入」
- `saveDraft`（存草稿）與 `saveAndSubmit`（存檔並送審）雙按鈕流程

### PromotionReview 功能
- KPI：待審核 / 已核准 / 已拒絕
- 篩選與全覽表格
- 審核 Modal：完整階梯預覽 + 核准 / 拒絕（拒絕需填寫原因）

### PromotionRecords 功能
- 篩選：玩家 ID / 優惠類型 / 日期範圍
- KPI：總領取次數、總發出銀幣、不重複玩家數
- 分頁表格，顯示玩家 ID、用戶名、優惠名稱、獎勵銀幣、領取時間

### 修復
- `PromotionManagement.vue`：`v-for` index 型別 `string | number` 無法直接傳入 `removeTier(idx: number)`，改為 `(idx as number)` 解決

---

## 8. 任務管理模組

**Commits:** `97356bd` `afe2d04` `dd7f83c`

### 新增檔案

| 檔案 | 說明 |
|---|---|
| `src/types/mission.ts` | 任務類型、獎勵介面、CheckinConfig singleton 介面 |
| `src/mocks/mission.ts` | 8 筆任務 mock + CheckinConfig singleton + 11 筆領取紀錄 |
| `src/api/mission.ts` | 任務 CRUD + 審核 + CheckinConfig 4 個專屬 API |
| `src/views/Master/MissionManagement.vue` | 任務管理主頁（雙分頁） |
| `src/views/Master/MissionReview.vue` | 任務審核中心 |
| `src/views/Master/MissionRecords.vue` | 任務領取紀錄查詢 |

### 任務類型設計

```typescript
type MissionType = 'DAILY' | 'EVENT' | 'CHECKIN'

type ConditionType =
  | 'LOGIN'          // 每日登入
  | 'GAME_PLAY'      // 遊玩場次
  | 'DEPOSIT_COUNT'  // 儲值次數
  | 'DEPOSIT_AMOUNT' // 儲值金額
  | 'INVITE_FRIEND'  // 邀請好友
  | 'CUSTOM'         // 自定義條件

type RewardType = 'SILVER' | 'AVATAR' | 'AVATAR_FRAME' | 'GIFT_CARD'
```

### 每日簽到 Singleton 設計

每日簽到（CHECKIN）不同於一般任務列表，以 **singleton** 模式管理：

```typescript
interface CheckinConfig {
  cycle_days: number           // 週期天數（預設 30）
  daily_silver: number         // 每日基礎銀幣
  milestones: CheckinMilestone[] // 特殊日額外獎勵
  status: MissionStatus
  submitted_by?: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
}

interface CheckinMilestone {
  id: string
  day: number                  // 第幾天（e.g. 5, 10, 15, 30）
  rewards: MissionReward[]     // 額外獎勵（銀幣 + 實體獎品）
}
```

### MissionManagement — 雙分頁架構

#### Tab 1：每日任務與簽到
- 每日任務列表（DAILY type）
  - 欄位：任務名稱、達成條件、獎勵、成本/次、狀態、操作
- 每日簽到設定（inline form）
  - 週期天數、每日銀幣輸入
  - 里程碑列表（新增 / 刪除里程碑，每筆可設定多種獎勵）
- **30 格日曆預覽**（7 欄 × 5 行）
  - 里程碑日以橘色高亮顯示
  - 每格顯示「第 N 天」與該日成本（NTD）
  - 里程碑格額外顯示獎勵摘要
- 成本摘要卡
  - 基礎成本（每人每週期）
  - 里程碑額外成本
  - 每人週期總成本

#### Tab 2：活動任務
- 活動任務列表（EVENT type）
- 狀態篩選（全部 / 上線中 / 排程中 / 草稿 / 待審核 / 已過期）
- 欄位：任務名稱、達成條件、獎勵、**成本估算**、活動期間、狀態、操作

#### 成本估算公式
```typescript
const SILVER_TO_NTD = 10000  // 10,000 銀幣 = 1 NTD
const calcRewardCost = (rewards: MissionReward[]) =>
  rewards.reduce((s, r) => s + (r.type === 'SILVER' ? (r.silver_amount ?? 0) : 0), 0) / SILVER_TO_NTD
```

#### 新增/編輯 Drawer（DAILY / EVENT 共用）
- 任務名稱、描述
- 達成條件（類型 + 目標數量 + 說明）
- 獎勵列表（多筆，支援銀幣 / 頭像 / 頭像框 / 禮物卡文字描述）
- 活動時間範圍（EVENT only，使用 `NDatePicker`）

### MissionReview 功能
- 待審核 / 已核准 / 已拒絕 KPI
- 類型篩選（每日 / 活動 / 每日簽到）
- 審核 Modal：完整條件與獎勵預覽 + 核准 / 拒絕操作

### MissionRecords 功能
- 篩選：任務 ID、類型、玩家 ID/用戶名、日期範圍
- 特殊欄位：CHECKIN 類型顯示「簽到第 N 天」
- KPI：總領取次數、總派銀、不重複玩家

### 修復
- `MissionManagement.vue`：`NDatePicker` v-model 需為 `number | null`（Unix timestamp），但表單欄位為 `string`（ISO）
  - 解法：新增 `startTs / endTs` ref（`number | null`），`watch` 轉換為 ISO 字串寫回表單

---

## 9. 設計規範與共用模式

### 審核工作流程（所有模組共用）
```
DRAFT → PENDING → ACTIVE / SCHEDULED / REJECTED
                └→ EXPIRED（活動結束後）
```

### 審核 Modal 標準配置
- 上方：完整資料預覽（readonly）
- 下方：核准 / 拒絕按鈕
- 拒絕時：textarea 填寫原因，確認才送出

### Drawer 表單標準配置
- 右側抽屜，寬度 480px
- 底部固定：「存草稿」+ 「送審」雙按鈕（或「儲存」單按鈕）

### API Mock 層規範
- 所有 API 加 `delay(400ms)` 模擬網路延遲
- in-memory 資料直接操作 mock 陣列（`mockXxx[]`）
- Singleton 資料以 exported `let` 物件管理（`mockCheckinConfig`）
- ID 序列：字首縮寫 + 3-4 位數字（e.g. `ms001`, `prom001`, `sc001`）

### i18n 多語系
- 所有導覽項目鍵名同步維護於 `src/locales/index.ts`（zh-TW / zh-CN / en）
- 頁面內容以繁體中文為主，i18n 主要用於 sidebar 標籤

---

## 10. 已修復的型別錯誤

| 檔案 | 問題 | 解法 |
|---|---|---|
| `PromotionManagement.vue` | `v-for` index `string \| number` 無法傳入 `number` 參數 | `(idx as number)` |
| `MissionManagement.vue` | `NDatePicker` v-model 需 `number \| null`，但表單欄位為 `string \| undefined` | 新增 `startTs/endTs` ref + `watch` 同步 |
| `AgentDetail.vue` | 缺少 `h()` import | 補上 import |
| `AgentReport.vue` | `NSelect` v-model 型別應為 `string \| null` | 修正型別 |
| `WorldChannelMonitor.vue` | `Partial<T>` 導致 `string \| undefined` 賦值錯誤 | explicit 欄位初始化 |

---

## 11. 尚未實作 / 待討論

| 功能 | 狀態 | 備註 |
|---|---|---|
| 禮物卡實體兌換流程 | 文字描述佔位 | 正式環境需串接實體卡系統 |
| 任務進度追蹤（玩家端） | 未實作 | 後台設定面完成；玩家端進度條待討論 |
| 推播通知（任務完成） | 未實作 | 可串接現有 MessageSettings 模組 |
| 優惠使用量上限設定 | 未實作 | 目前無 `max_claim` 欄位 |
| 任務 / 優惠複製功能 | 未實作 | 新增時從現有活動快速複製 |
| 前台管理圖片上傳 | 目前僅 URL 輸入 | 正式環境需串接 CDN / 物件儲存 |
| 角色 `RISK` 的導覽項目 | 部分實作 | 風控管理群組可見，其他群組未做差異化 |

---

*最後更新：2026-04-23 | 由 Claude Sonnet 輔助生成*
