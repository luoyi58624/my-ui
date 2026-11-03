import { nextTick, onActivated, ref } from 'vue'

/** KeepAlive 移走 DOM 时保存当前滚动，Tab 普通切换不执行滚动操作。 */
export function useDemoScroll(restored?: () => void) {
  const scroller = ref<HTMLElement>()
  let top = 0
  function remember() {
    const node = scroller.value
    if (node?.isConnected && node.getBoundingClientRect().height) top = node.scrollTop
  }
  onActivated(() => {
    void nextTick(() => {
      scroller.value?.scrollTo({ top, behavior: 'instant' })
      restored?.()
    })
  })
  return { scroller, remember }
}
