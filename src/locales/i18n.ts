import { createI18n } from 'vue-i18n'
import { zhTW, zhCN, en } from './index'

export type MessageSchema = typeof zhTW

const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    'zh-CN': zhCN as unknown as MessageSchema,
    en: en as unknown as MessageSchema
  }
})

export default i18n
