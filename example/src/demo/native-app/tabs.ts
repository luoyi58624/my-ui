import type { AppTab, NavigationItem } from 'tauri-plugin-native-components/vue'
import TabPage from './TabPage.vue'

/** 页面组件与 Tab 的唯一标识对应。 */
export const tabs: AppTab[] = [
  { value: 'home', component: TabPage, props: { title: '首页' } },
  { value: 'profile', component: TabPage, props: { title: '我的' } },
]

/** 底栏选项与页面共用 value。 */
export const tabbarItems: NavigationItem[] = [
  { value: 'home', label: '首页', icon: 'home' },
  { value: 'profile', label: '我的', icon: 'user' },
]
