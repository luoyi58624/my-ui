let opening: Promise<void> | undefined

/** 原生页面示例仅在 Android Tauri 壳内启用。 */
export function canOpenNativePage(): boolean {
  return /android/i.test(navigator.userAgent) && typeof window.__TAURI__?.core?.invoke === 'function'
}

/** 打开一个独立 Activity；连续点击共用进行中的请求。 */
export function openNativePage(): Promise<void> {
  if (opening) return opening
  if (!canOpenNativePage()) return Promise.reject(new Error('请在 Android App 中体验原生页面跳转'))
  opening = Promise.resolve()
    .then(() => window.__TAURI__!.core!.invoke!<void>('open_native_page'))
    .finally(() => { opening = undefined })
  return opening
}

/** 关闭当前原生子页，原生侧会拒绝关闭首页。 */
export function closeNativePage(): Promise<void> {
  if (!canOpenNativePage()) return Promise.reject(new Error('当前页面不在 Android App 中'))
  return window.__TAURI__!.core!.invoke!<void>('close_native_page')
}
