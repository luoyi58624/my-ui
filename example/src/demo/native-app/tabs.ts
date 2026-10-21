import type { AppTab, NavigationItem } from 'tauri-plugin-native-components/vue'
import TabPage from './TabPage.vue'

/** App 只接收页面组件，导航图标和角标留在底栏选项中。 */
export const tabs: AppTab[] = [
  { value: 'home', component: TabPage, props: { title: '日常', description: '把今天值得记住的小事留在这里。' } },
  { value: 'messages', component: TabPage, props: { title: '消息', description: '这里有自己的草稿和计数，切换后会继续保留。' } },
  { value: 'profile', component: TabPage, props: { title: '我的', description: '回到熟悉的位置，继续刚才的记录。' } },
]

/** 自定义 TabBar 的选项只描述导航，不携带页面组件或业务状态。 */
export const tabbarItems: NavigationItem[] = [
  { value: 'home', label: '日常', icon: 'home' },
  { value: 'messages', label: '消息', icon: 'message', badge: 2 },
  { value: 'profile', label: '我的', icon: 'user' },
]
