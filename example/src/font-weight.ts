// 系统字重只在示例层适配，组件库仍只消费宿主提供的 CSS 字重变量。

declare global {
  interface Window {
    __TAURI__?: {
      core?: { invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T> }
      invoke?: <T>(cmd: string) => Promise<T>
    }
  }
}

const PLUGIN_PREFIX = 'plugin:android-system-font-weight|'
const CUSTOM_KEY = 'my-ui:font-weight-customized'

/** 当前页面是否运行在带有系统字重插件的 Android 壳内。 */
export function supportsSystemFontWeight(): boolean {
  return /android/i.test(navigator.userAgent) && typeof window.__TAURI__?.core?.invoke === 'function'
}

function validWeight(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value >= 100 && value <= 1000 ? value : null
}

let cached: number | undefined
let pending: { promise: Promise<number | null>; refresh: boolean } | undefined
let generation = 0

/** 读取系统字重；无法确定时返回 null，强制刷新会替换缓存，失败结果不缓存。 */
export function readSystemFontWeight(force = false): Promise<number | null> {
  if (!supportsSystemFontWeight()) return Promise.resolve(null)
  if (pending && (!force || pending.refresh)) return pending.promise
  if (!force && cached !== undefined) return Promise.resolve(cached)
  if (force) cached = undefined

  const current = ++generation
  const promise = Promise.resolve()
    // getWght 已包含采集和解析，启动时不再额外调用诊断接口 getRawData。
    .then(() => window.__TAURI__!.core!.invoke!<unknown>(PLUGIN_PREFIX + 'getWght'))
    .then(value => {
      const weight = validWeight(value)
      if (current === generation && weight !== null) cached = weight
      return weight
    })
    .catch((error: unknown) => {
      console.warn('[font-weight] 读取系统字重失败：', error)
      return null
    })
    .finally(() => { if (pending?.promise === promise) pending = undefined })
  pending = { promise, refresh: force }
  return promise
}

/** 管理示例的系统跟随、手动值和恢复操作，异步读取不能覆盖较新的用户操作。 */
export function createSystemFontWeightSync(apply: (weight: number) => void, fallback = 400) {
  let customized = false
  try { customized = localStorage.getItem(CUSTOM_KEY) === '1' } catch { /* 无存储时仍可跟随系统。 */ }
  let revision = 0
  let disposed = false

  function saveCustom(value: boolean) {
    customized = value
    revision++
    try {
      if (value) localStorage.setItem(CUSTOM_KEY, '1')
      else localStorage.removeItem(CUSTOM_KEY)
    } catch { /* 存储失败不影响当前页面的字重。 */ }
  }

  /** 自动同步只作用于系统跟随模式；force 用于返回前台后的重新采集。 */
  async function sync(force = false): Promise<number | null> {
    if (disposed || customized) return null
    const current = ++revision
    const weight = await readSystemFontWeight(force)
    if (disposed || customized || current !== revision) return null
    if (weight !== null) apply(weight)
    return weight
  }

  return {
    sync,
    /** 只有实际修改滑块数值才停止系统跟随。 */
    customize(weight: number) {
      if (disposed || validWeight(weight) === null) return
      saveCustom(true)
      apply(weight)
    },
    /** 恢复系统跟随；原生读取失败时保留当前字重，普通网页恢复示例默认值。 */
    async restore(): Promise<number | null> {
      if (disposed) return null
      saveCustom(false)
      if (!supportsSystemFontWeight()) {
        apply(fallback)
        return fallback
      }
      return sync(true)
    },
    /** 卸载后忽略所有尚未完成的读取。 */
    dispose() { disposed = true; revision++ },
  }
}
