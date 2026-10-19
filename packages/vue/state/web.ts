import type { SharedStateStorage } from './types'

const CHANGE_EVENT = 'my-ui:shared-state-change'

/** 浏览器持久化适配器，同时通知本页实例和共享存储区的其他页面。 */
export function createWebStateStorage(): SharedStateStorage {
  function notify(key: string) {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }))
  }
  return {
    getItem: key => window.localStorage.getItem(key),
    setItem(key, value) {
      if (window.localStorage.getItem(key) === value) return
      window.localStorage.setItem(key, value)
      notify(key)
    },
    removeItem(key) {
      window.localStorage.removeItem(key)
      notify(key)
    },
    subscribe(listener) {
      const local = (event: Event) => listener((event as CustomEvent<string>).detail)
      const remote = (event: StorageEvent) => {
        if (event.storageArea === window.localStorage) listener(event.key)
      }
      window.addEventListener(CHANGE_EVENT, local)
      window.addEventListener('storage', remote)
      return () => {
        window.removeEventListener(CHANGE_EVENT, local)
        window.removeEventListener('storage', remote)
      }
    },
  }
}
