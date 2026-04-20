import { Article } from '@/types/article'

export const mockArticles: Article[] = [
    {
        id: 'ART001',
        category: 'PROMOTION',
        title: '春節限時儲值加碼 10% 贈送',
        language: 'zh-TW',
        cover_url: 'https://placehold.co/400x300?text=Promotion+Cover',
        content: '<h1>春節加碼</h1><p>活動時間：2026/02/01 - 2026/02/15</p>',
        last_modified_at: '2026-02-01T10:00:00Z',
        last_modified_by: 'admin_sys',
        publish_start: '2026-02-01T00:00:00Z',
        publish_end: '2026-02-15T23:59:59Z',
        status_test: true,
        status_live: true,
        seo: {
            meta_title: '2026 春節儲值優惠 - 打火機娛樂',
meta_description: '春節限時儲值加碼 10%，最高贈送 88,888 點！'
        }
    },
    {
        id: 'ART002',
        category: 'ENCYCLOPEDIA',
        title: '老虎機新手入門：贏錢技巧大公開',
        language: 'zh-TW',
        cover_url: 'https://placehold.co/400x300?text=Slot+Guide',
        content: '<h2>什麼是 RTP？</h2><p>RTP 代表玩家返還率...</p>',
        last_modified_at: '2026-01-15T14:30:00Z',
        last_modified_by: 'content_editor',
        publish_start: '2026-01-20T00:00:00Z',
        status_test: true,
        status_live: false,
        seo: {}
    }
]
