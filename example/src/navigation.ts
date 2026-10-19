/** 页面打开时的可选设置。 */
export interface PageOptions {
  /** 新窗口标题，省略时沿用当前页面标题。 */
  title?: string
}

const opening = new Map<string, Promise<void>>()

/** 是否运行在提供页面跳转命令的 Tauri App 内。 */
export function isNativeApp(): boolean {
  return typeof window.__TAURI__?.core?.invoke === 'function'
}

/** 当前 App 地址是否带有原生创建时添加的子窗口标记。 */
export function isChildPage(): boolean {
  return isNativeApp() && new URL(window.location.href).searchParams.get('pageWindow') === '1'
}

function resolvePage(path: string): URL {
  const current = new URL(window.location.href)
  const target = new URL(path, current)
  if (target.origin !== current.origin || target.protocol !== current.protocol || target.username || target.password)
    throw new Error('页面跳转只接受应用内地址')
  return target
}

function sameDocument(target: URL): boolean {
  const current = new URL(window.location.href)
  return target.pathname === current.pathname && target.search === current.search
}

/** 打开应用内页面：Android 创建 Activity，桌面 App 新建窗口，网页同页链接使用历史导航。 */
export function openPage(path: string, options: PageOptions = {}): Promise<void> {
  let target: URL
  try { target = resolvePage(path) } catch (error) { return Promise.reject(error) }
  if (isNativeApp()) {
    // 只将相对地址交给原生壳，开发地址与打包后的协议由 Tauri 自己解析。
    const localPath = (target.pathname.replace(/^\/+/, '') || 'index.html') + target.search + target.hash
    const pending = opening.get(localPath)
    if (pending) return pending
    const request = Promise.resolve()
      .then(() => window.__TAURI__!.core!.invoke!<void>('open_page', { path: localPath, title: options.title ?? document.title }))
      .finally(() => { opening.delete(localPath) })
    opening.set(localPath, request)
    return request
  }
  if (target.href === window.location.href) return Promise.resolve()
  if (sameDocument(target)) {
    window.history.pushState({ ...window.history.state, myUiPageParent: window.location.href }, '', target.href)
    window.dispatchEvent(new Event('popstate'))
  } else {
    // 独立 HTML 示例仍可在普通浏览器中对照两页状态。
    window.open(target.href, '_blank', 'noopener')
  }
  return Promise.resolve()
}

/** 关闭当前原生子页；网页返回历史上一页，直接访问时使用指定的回退地址。 */
export function closePage(fallback = '#home'): Promise<void> {
  if (isNativeApp()) return window.__TAURI__!.core!.invoke!<void>('close_page')
  if (window.history.state?.myUiPageParent) {
    window.history.back()
    return Promise.resolve()
  }
  let target: URL
  try { target = resolvePage(fallback) } catch (error) { return Promise.reject(error) }
  if (sameDocument(target)) {
    window.history.replaceState({ ...window.history.state, myUiPageParent: undefined }, '', target.href)
    window.dispatchEvent(new Event('popstate'))
  } else window.location.assign(target.href)
  return Promise.resolve()
}
