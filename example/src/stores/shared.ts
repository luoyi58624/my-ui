import { createPinia, defineStore } from 'pinia'
import { createSharedStatePlugin, createWebStateStorage, sharedStateKey } from '@my-ui/vue/state'
import { createTauriStateStorage } from '@my-ui/vue/state/tauri'

/** 示例在原生壳内共用文件存储，网页使用同源 localStorage。 */
export const sharedStorage = typeof window.__TAURI__?.core?.invoke === 'function'
  ? createTauriStateStorage('my-ui-state.json')
  : createWebStateStorage()

/** 两个页面安装相同插件，业务状态仍由普通 Pinia store 定义。 */
export const sharedPinia = createPinia().use(createSharedStatePlugin({ storage: sharedStorage }))

/** 备注与计数是共享数据，页面滚动和本次打开时间仍属于各自页面。 */
export const useSharedDemoStore = defineStore('navigation', {
  state: () => ({ note: '两页共用这条备注，重新打开也会恢复', count: 0 }),
  shared: true,
})

/** 演示从 Pinia 之外修改本地数据，已打开的页面会同步更新。 */
export async function updateDemoCache(): Promise<void> {
  const note = '本地更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour12: false })
  await sharedStorage.setItem(sharedStateKey('navigation', 'note'), JSON.stringify(note))
  await sharedStorage.flush?.()
}
