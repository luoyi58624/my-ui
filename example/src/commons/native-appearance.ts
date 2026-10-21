import { installWindowAppearance } from 'tauri-plugin-native-components/window'
import { readPageAppearance } from './native-context'

/** 将示例主题状态交给插件，窗口桥接及异步合并由插件负责。 */
export function installNativeAppearance(): () => void {
  const root = document.documentElement
  return installWindowAppearance({
    read: () => {
      const surface = root.style.getPropertyValue('--card-background').trim()
      return {
        dark: root.dataset.theme === 'dark',
        ...readPageAppearance(),
        // 系统栏跟随 AppBar、Tabbar 的表面色，导航传递的正文底色仍保持原义。
        ...(/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(surface) ? { background: surface } : {}),
        ...(root.dataset.themePreference === 'system' ? { followSystem: true } : {}),
      }
    },
    subscribe: update => {
      const observer = new MutationObserver(update)
      observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-theme-preference', 'style'] })
      return () => observer.disconnect()
    },
  })
}
