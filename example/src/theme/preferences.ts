import { createTheme, defaultThemeOptions, type ThemeData, type ThemePreference } from './index.js'

/** 所有页面共用的主题偏好，实际明暗模式仍由各窗口解析系统外观。 */
export interface ThemeSettingsState {
  mode: ThemePreference
  backdropBlur: boolean
  fontWeight: number
  light: ThemeData
  dark: ThemeData
}

/** 创建独立的默认配置，避免不同 store 复用嵌套对象。 */
export function defaultThemeState(): ThemeSettingsState {
  return { ...defaultThemeOptions, light: { ...defaultThemeOptions.light }, dark: { ...defaultThemeOptions.dark } }
}

/** 兼容旧版本的本地主题快照，同时供新页面首帧使用。 */
export function readThemeSnapshot(): ThemeSettingsState {
  try {
    const saved = JSON.parse((localStorage.getItem('my-ui:theme') ?? localStorage.getItem('chenglan:theme')) ?? 'null')
    if (!saved) return defaultThemeState()
    const next = { ...defaultThemeState(), ...saved, light: { ...defaultThemeOptions.light, ...saved.light }, dark: { ...defaultThemeOptions.dark, ...saved.dark } }
    createTheme(next)
    return { mode: next.mode, backdropBlur: next.backdropBlur, fontWeight: next.fontWeight, light: next.light, dark: next.dark }
  } catch { return defaultThemeState() }
}

/** 保留首帧快照；跨窗口通知与持久化以共享状态存储为准。 */
export function saveThemeSnapshot(settings: ThemeSettingsState): void {
  try { localStorage.setItem('my-ui:theme', JSON.stringify(settings)) } catch { /* 存储不可用时仍应用当前外观。 */ }
}

/** 纯 HTML 与 Pinia 共用字段键，原生 HTML 无需加载 Vue。 */
export function themeStateKey(field: keyof ThemeSettingsState): string {
  return 'my-ui:state:theme:' + field
}
