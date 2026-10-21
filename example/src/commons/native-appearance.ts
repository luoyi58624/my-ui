import { installWindowAppearance } from 'tauri-plugin-native-components/window'
import { readPageAppearance } from './native-context'

/** 将示例主题状态交给插件，窗口桥接及异步合并由插件负责。 */
export function installNativeAppearance(): () => void {
  const root = document.documentElement
  return installWindowAppearance({
    read: () => ({ dark: root.dataset.theme === 'dark', ...readPageAppearance(), ...(root.dataset.themePreference === 'system' ? { followSystem: true } : {}) }),
    subscribe: update => {
      const observer = new MutationObserver(update)
      observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-theme-preference', 'style'] })
      return () => observer.disconnect()
    },
  })
}
