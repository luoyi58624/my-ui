import type { RouteRecordRaw } from 'vue-router'
import { pages } from './pages'

/** App 示例及其独立页复用宿主路由，页面切换不替换外层 App。 */
export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/native/app-demo',
    name: 'app-example',
    component: () => import('./Example.vue'),
    children: pages
  }
]
