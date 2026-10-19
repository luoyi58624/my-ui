import type {} from '../../packages/core/my-ui'

/** 将当前 WebView 的弹层状态同步给其 Activity，有弹层时优先消费系统返回。 */
export function installNativeOverlayBack(): () => void {
  const invoke = window.__TAURI__?.core?.invoke
  if (!/android/i.test(navigator.userAgent) || !invoke) return () => {}

  let active = false, requested = false, applied: boolean | undefined, syncing = false
  const sync = (enabled: boolean) => {
    requested = enabled
    if (syncing || requested === applied) return
    syncing = true
    void (async () => {
      try {
        do {
          const enabled = requested
          await invoke<void>('set_overlay_back_enabled', { enabled })
          applied = enabled
        } while (requested !== applied)
      } catch (error) {
        console.error('同步弹层返回状态失败', error)
      } finally { syncing = false }
    })()
  }
  const unsubscribe = MyUI.layers.subscribe(value => { active = value; sync(value) })
  const hide = () => sync(false)
  const show = () => sync(active)
  window.addEventListener('pagehide', hide)
  window.addEventListener('pageshow', show)
  return () => {
    unsubscribe()
    window.removeEventListener('pagehide', hide)
    window.removeEventListener('pageshow', show)
    sync(false)
  }
}
