import type { AppPage } from 'tauri-plugin-native-components/vue'

/** 独立页配置同时交给 App 和 Vue Router，路径、标题和组件只维护一次。 */
export const pages: AppPage[] = [
  {
    name: 'app-detail',
    path: '/native/app-demo/detail/:id',
    component: () => import('./DetailPage.vue'),
    props: true,
    meta: { title: '记录详情' },
  },
]
