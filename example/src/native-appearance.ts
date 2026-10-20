import { isNativeApp, readPageAppearance } from './navigation'

/** 将当前窗口的实际主题同步给原生系统栏或桌面窗口装饰。 */
export function installNativeAppearance(): () => void {
  if (!isNativeApp()) return () => {}
  const root = document.documentElement
  const read = () => ({ dark: root.dataset.theme === 'dark', ...readPageAppearance(), ...(root.dataset.themePreference === 'system' ? { followSystem: true } : {}) })
  let requested = read(), applied: string | undefined, syncing = false, disposed = false
  function sync() {
    requested = read()
    if (disposed || syncing || JSON.stringify(requested) === applied) return
    syncing = true
    void (async () => {
      try {
        do {
          const appearance = requested
          await window.__TAURI__!.core!.invoke!<void>('set_app_theme', appearance)
          applied = JSON.stringify(appearance)
        } while (!disposed && JSON.stringify(requested) !== applied)
      } catch (error) { console.error('同步原生外观失败', error) }
      finally { syncing = false }
    })()
  }
  const observer = new MutationObserver(sync)
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-theme-preference', 'style'] })
  window.addEventListener('focus', sync)
  sync()
  return () => { disposed = true; observer.disconnect(); window.removeEventListener('focus', sync) }
}
