import { defineStore, type Pinia } from 'pinia'
import { watch } from 'vue'
import { applyTheme } from '../theme/index.js'
import { readThemeSnapshot, saveThemeSnapshot } from '../theme/preferences'

/** 所有窗口共享并持久化同一份主题设置。 */
export const useThemeStore = defineStore('theme', { state: readThemeSnapshot, shared: true })

/** 每个窗口只安装一份主题渲染监听，组件卸载不再改变全局主题生命周期。 */
export function installThemeState(pinia: Pinia): () => void {
  const store = useThemeStore(pinia)
  let stopTheme: (() => void) | undefined
  const stop = watch(() => ({
    mode: store.mode, backdropBlur: store.backdropBlur, fontWeight: store.fontWeight,
    light: { ...store.light }, dark: { ...store.dark },
  }), settings => {
    stopTheme = applyTheme(settings)
    saveThemeSnapshot(settings)
  }, { deep: true, immediate: true })
  return () => { stop(); stopTheme?.() }
}
