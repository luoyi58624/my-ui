import { load, type Store } from '@tauri-apps/plugin-store'
import type { SharedStateStorage } from './types'

/** Tauri 持久化适配器：多个 WebView 复用同一个原生 Store，文件保存在应用数据目录。 */
export function createTauriStateStorage(path = 'my-ui-state.json'): SharedStateStorage {
  let pending: Promise<Store> | undefined
  function open(): Promise<Store> {
    pending ??= load(path, { autoSave: 100 }).catch(error => { pending = undefined; throw error })
    return pending
  }
  return {
    async getItem(key) {
      const value = await (await open()).get(key)
      return value === undefined ? null : JSON.stringify(value)
    },
    async setItem(key, value) { await (await open()).set(key, JSON.parse(value)) },
    async removeItem(key) { await (await open()).delete(key) },
    async subscribe(listener) { return (await open()).onChange(key => listener(key)) },
    async flush() { await (await open()).save() },
  }
}
