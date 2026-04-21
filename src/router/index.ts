import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import Login from '@/views/Login.vue'

const masterRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('@/views/Master/Layout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] },
    children: [

      {
        path: 'financial-overview',
        name: 'FinancialOverview',
        component: () => import('@/views/Master/FinancialOverview.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '財務概覽' }
      },

      {
        path: 'account',
        name: 'PersonalAccount',
        component: () => import('@/views/Master/PersonalAccount.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'] }
      },
      {
        path: 'groups',
        name: 'GroupManagement',
        component: () => import('@/views/Master/GroupManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'accounts',
        name: 'AccountManagement',
        component: () => import('@/views/Master/AccountManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'players',
        name: 'PlayerList',
        component: () => import('@/views/Master/PlayerList.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'] }
      },
      {
        path: 'players/:id',
        name: 'PlayerDetail',
        component: () => import('@/views/Master/PlayerDetail.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'], breadcrumb: '詳情' }
      },
      {
        path: 'logs',
        name: 'OperationLog',
        component: () => import('@/views/Master/OperationLog.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'] }
      },
      {
        path: '',
        name: 'AdminDashboardRedirect',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'TodoCenter',
        component: () => import('@/views/Dashboard/TodoCenter.vue'),
        meta: { title: '待辦審核中心' }
      },
      {
        path: 'operation-report',
        name: 'OperationReport',
        component: () => import('@/views/DataCenter/OperationReport.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '營運報表' }
      },
      {
        path: 'game-stats',
        name: 'GameStats',
        component: () => import('@/views/DataCenter/GameStats.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '遊戲統計' }
      },
      {
        path: 'report-management',
        name: 'ReportManagement',
        component: () => import('@/views/DataCenter/ReportManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '報表管理' }
      },
      {
        path: 'vip-stats',
        name: 'VIPStats',
        component: () => import('@/views/DataCenter/VIPStats.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: 'VIP 統計分析' }
      },
      {
        path: 'risk/alerts',
        name: 'RiskAlerts',
        component: () => import('@/views/Risk/AlertList.vue'), // Risk Alert List
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'RISK'], breadcrumb: '異常預警列表' }
      },
      {
        path: 'chat-management',
        name: 'ChatManagement',
        component: () => import('@/views/ChatManagement/index.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'RISK'], breadcrumb: '聊天室管理' }
      },
      {
        path: 'chat/templates',
        name: 'PlayerMessageTemplates',
        component: () => import('@/views/ChatManagement/PlayerMessageTemplates.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'RISK'], breadcrumb: '玩家訊息模板' }
      },
      {
        path: 'chat/keywords',
        name: 'ChatKeywordSettings',
        component: () => import('@/views/Risk/ChatKeywordSettings.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'RISK'], breadcrumb: '敏感字庫設定' }
      },
      {
        path: 'chat/audit',
        name: 'ChatTriggerAudit',
        component: () => import('@/views/Risk/ChatTriggerAudit.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'RISK'], breadcrumb: '觸發紀錄審核' }
      },
      {
        path: 'system-status',
        name: 'SystemStatus',
        component: () => import('@/views/Master/SystemStatus.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '系統健康監測' }
      },
      {
        path: 'message-settings',
        name: 'MessageSettings',
        component: () => import('@/views/Master/MessageSettings.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '訊息設置' }
      },
      {
        path: 'message-management',
        name: 'MessageManagement',
        component: () => import('@/views/DataCenter/MessageManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '站內信管理' }
      },
      {
        path: 'asset-logs',
        name: 'AssetLogs',
        component: () => import('@/views/Master/AssetLogs.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'] }
      },
      {
        path: 'game-logs',
        name: 'GameLogs',
        component: () => import('@/views/Master/GameLogs.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'] }
      },
      {
        path: 'bonus-history',
        name: 'BonusHistory',
        component: () => import('@/views/Master/BonusHistory.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'] }
      },
      {
        path: 'deposit-orders',
        name: 'DepositOrders',
        component: () => import('@/views/Master/DepositOrders.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER', 'USER'], breadcrumb: '儲值訂單管理' }
      },
      {
        path: 'payment-channels',
        name: 'PaymentChannels',
        component: () => import('@/views/Master/PaymentChannels.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '金流通道管理' }
      },
      {
        path: 'game-providers',
        name: 'GameProviders',
        component: () => import('@/views/Master/GameProviders.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'game-list',
        name: 'GameList',
        component: () => import('@/views/Master/GameList.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'game-type-config',
        name: 'GameTypeConfig',
        component: () => import('@/views/Master/GameTypeConfig.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'marketing-tag-config',
        name: 'MarketingTagConfig',
        component: () => import('@/views/Master/MarketingTagConfig.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'provider-report',
        name: 'ProviderReport',
        component: () => import('@/views/Master/ProviderReport.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '遊戲商報表' }
      }
      ,
      {
        path: 'thirdparty-keys',
        name: 'ThirdPartyKeys',
        component: () => import('@/views/Master/ThirdPartyKeys.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      }
      ,
      {
        path: 'app-versions',
        name: 'AppVersionManager',
        component: () => import('@/views/Master/AppVersionManager.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      }
      ,
      {
        path: 'admin-whitelist',
        name: 'AdminWhitelist',
        component: () => import('@/views/Master/AdminWhitelist.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      }
      ,
      {
        path: 'operation-config',
        name: 'OperationConfig',
        component: () => import('@/views/Master/OperationConfig.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'announcements',
        name: 'AnnouncementManager',
        component: () => import('@/views/Master/Announcement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'image-config',
        name: 'ImageConfig',
        component: () => import('@/views/Master/ImageConfig.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'guilds',
        name: 'GuildManagement',
        component: () => import('@/views/Master/GuildManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'articles',
        name: 'ArticleManager',
        component: () => import('@/views/Master/ArticleManager.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'] }
      },
      {
        path: 'manual-adjustment',
        name: 'ManualAdjustment',
        component: () => import('@/views/Master/ManualAdjustment.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '人工存提' }
      },
      {
        path: 'commodity-config',
        name: 'CommodityConfig',
        component: () => import('@/views/Master/CommodityConfig.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '商品配置' }
      },
      {
        path: 'agent-list',
        name: 'AgentList',
        component: () => import('@/views/AgentManagement/AgentList.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '代理列表' }
      },
      {
        path: 'agent/:id',
        name: 'AgentDetail',
        component: () => import('@/views/AgentManagement/AgentDetail.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '代理詳情' }
      },
      {
        path: 'agent-commission/:id',
        name: 'AgentCommission',
        component: () => import('@/views/AgentManagement/AgentCommission.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '佣金設置' }
      },
      {
        path: 'agent-report',
        name: 'AgentReport',
        component: () => import('@/views/AgentManagement/AgentReport.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '代理統計報表' }
      },
      {
        path: 'vip-settings',
        name: 'VIPSettings',
        component: () => import('@/views/VIPManagement/VIPSettings.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: 'VIP等級設定' }
      },
      {
        path: 'player-win-loss-ranking',
        name: 'PlayerWinLossRanking',
        component: () => import('@/views/Master/PlayerWinLossRanking.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '玩家輸贏排名' }
      },
      {
        path: 'cs-channels',
        name: 'CustomerServiceChannels',
        component: () => import('@/views/Master/CustomerServiceChannels.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '客服通道管理' }
      },
      {
        path: 'sms-providers',
        name: 'SmsProviderManagement',
        component: () => import('@/views/Master/SmsProviderManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '簡訊商管理' }
      },
      {
        path: 'frontend-management',
        name: 'FrontendManagement',
        component: () => import('@/views/Master/FrontendManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '前台管理' }
      },
      {
        path: 'promotions',
        name: 'PromotionManagement',
        component: () => import('@/views/Master/PromotionManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '優惠管理' }
      },
      {
        path: 'missions',
        name: 'MissionManagement',
        component: () => import('@/views/Master/MissionManagement.vue'),
        meta: { requiresAuth: true, roles: ['DEVELOPER', 'MANAGER'], breadcrumb: '任務管理' }
      }
    ]
  }
]

const merchantRoutes: RouteRecordRaw[] = [
  {
    path: '/merchant',
    name: 'MerchantLayout',
    component: () => import('@/views/Merchant/Layout.vue'),
    meta: { requiresAuth: true, role: 'MERCHANT' },
    children: [
      {
        path: 'dashboard',
        name: 'MerchantDashboard',
        component: () => import('@/views/Merchant/Dashboard.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
      }
    ]
  }
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  ...masterRoutes,
  ...merchantRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// All roles that can access the admin backend (nav filtering is done in Layout.vue)
const ADMIN_ROLES = ['DEVELOPER', 'MANAGER', 'USER', 'BOSS', 'PM', 'OPERATOR', 'DEVOPS', 'FINANCE', 'CS', 'TECH']

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Load user from storage if not already loaded
  if (!authStore.user && authStore.token) {
    authStore.loadUserFromStorage()
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    const userRole = authStore.user?.role || ''

    // Admin roles: pass through — nav visibility is handled by Layout.vue
    if (ADMIN_ROLES.includes(userRole) && to.path.startsWith('/admin')) {
      next()
      return
    }

    // MERCHANT role check
    if (to.meta.role && userRole !== to.meta.role) {
      next('/')
      return
    }
  }

  next()
})

// 清理 Teleport 元素
router.afterEach(() => {
  // 使用 setTimeout 延迟清理，给 Vue 充足的时间更新 DOM
  setTimeout(() => {
    try {
      // 安全地移除所有 Naive UI 生成的遮罩层
      const masks = document.querySelectorAll('.n-modal-mask, .n-drawer-mask')
      masks.forEach((mask) => {
        if (mask && mask.parentNode) {
          mask.parentNode.removeChild(mask)
        }
      })
    } catch (error) {
      // 静默处理任何 DOM 操作错误
      console.debug('Cleanup error:', error)
    }
  }, 0)
})

export default router
