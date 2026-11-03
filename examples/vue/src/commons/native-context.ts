/** 当前页面是否运行在 Tauri 壳内，供系统外观等示例桥接使用。 */
export function isNativeApp(): boolean {
  return typeof window.__TAURI__?.core?.invoke === 'function'
}

/** 读取当前已渲染的外观；保持无框架依赖，原生 HTML 主题脚本也会使用。 */
export function readPageAppearance(): { dark: boolean; background: string } | undefined {
  const root = document.documentElement
  const background = root.style.getPropertyValue('--background').trim()
  if (!['light', 'dark'].includes(root.dataset.theme ?? '') || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(background)) return
  return { dark: root.dataset.theme === 'dark', background }
}
