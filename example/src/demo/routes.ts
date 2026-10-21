import type { AppPage } from 'tauri-plugin-native-components/vue'
import { demoExamples } from './catalog'

/** 文档独立页同时交给 App 与 Vue Router，旧组件链接仍指向同一页面。 */
export const demoPages: AppPage[] = demoExamples.filter(item => !item.path).map(item => ({
  name: 'demo-' + item.id,
  path: '/example/' + item.id,
  alias: ['/' + item.id, ...(item.anchors ?? []).map(anchor => '/' + anchor)],
  component: () => import('./DemoDetailPage.vue'),
  props: { id: item.id },
  meta: { title: item.title },
}))
