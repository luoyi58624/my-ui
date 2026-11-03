import { nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted } from 'vue'
import { readyPage } from 'tauri-plugin-native-components/router'

/** 当前 Web 页面完成挂载与布局后通知原生窗口，可以等待异步内容主动完成。 */
export function usePageReady(initiallyReady = true): () => void {
  let active = true, ready = initiallyReady, frame = 0, disposed = false
  function schedule() {
    if (!active || !ready || disposed) return
    void nextTick(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (active && !disposed) void readyPage().catch(console.error)
      })
    })
  }
  onMounted(schedule)
  onActivated(() => { active = true; schedule() })
  onDeactivated(() => { active = false; cancelAnimationFrame(frame) })
  window.addEventListener('resize', schedule, { passive: true })
  onBeforeUnmount(() => {
    disposed = true
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
  })
  return () => { ready = true; schedule() }
}
