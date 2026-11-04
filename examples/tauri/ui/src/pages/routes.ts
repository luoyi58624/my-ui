import type { RouteRecordRaw } from 'vue-router'
import { demoExamples } from '@demo/pages/catalog'

/** 文档独立页统一交给 Vue Router，旧组件链接仍指向同一页面。 */
export const demoPages: RouteRecordRaw[] = demoExamples
  .filter((item) => !item.path)
  .map((item) => ({
    name: 'demo-' + item.id,
    path: '/example/' + item.id,
    alias: ['/' + item.id, ...(item.anchors ?? []).map((anchor) => '/' + anchor)],
    component: () => import('../components/DemoDetailPage.vue'),
    props: { id: item.id },
    meta: { title: item.title }
  }))
