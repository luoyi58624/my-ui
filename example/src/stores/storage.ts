import { createTauriStateStorage } from '@my-ui/vue/state/tauri'
import { createWebStateStorage } from '../../../packages/vue/state/web'

/** App 共用原生 Store，网页共用 localStorage；此模块不加载 Vue。 */
export const sharedStorage = typeof window.__TAURI__?.core?.invoke === 'function'
  ? createTauriStateStorage('my-ui-state.json')
  : createWebStateStorage()
