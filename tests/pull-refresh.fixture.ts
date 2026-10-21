import { createApp, h, nextTick, ref } from 'vue'
import { PullRefresh } from '../packages/vue/index'

const refreshing = ref(false)
const disabled = ref(false)
const mounted = ref(true)
const revision = ref(0)
let instance: { refresh(): void } | null
let requests = 0
let clicks = 0
let renders = 0
let events: string[] = []
let completion = 'manual'

createApp({
  setup() {
    return () => mounted.value ? h(PullRefresh, {
      id: 'subject',
      key: revision.value,
      ref: (value: any) => { instance = value },
      modelValue: refreshing.value,
      disabled: disabled.value,
      label: '测试动态列表',
      'onUpdate:modelValue': (value: boolean) => {
        events.push('value:' + value)
        refreshing.value = value
      },
      onRefresh: () => {
        requests++
        events.push('refresh')
        if (completion === 'sync') refreshing.value = false
        else if (completion === 'rejected') {
          void Promise.reject(new Error('模拟请求失败')).catch(() => {}).finally(() => { refreshing.value = false })
        }
      },
    }, () => {
      renders++
      return [
        h('div', { id: 'drag-zone' }, '在顶部向下拖动'),
        h('div', { id: 'controls' }, [
          h('button', { id: 'content-button', onClick: () => { clicks++ } }, '收藏'),
          h('input', { id: 'content-input', 'aria-label': '备注', value: '保留输入' }),
        ]),
        h('div', { id: 'nested' }, [h('div', '内部滚动内容')]),
        ...Array.from({ length: 22 }, (_, index) => h('div', { class: 'test-row' }, '记录 ' + index)),
      ]
    }) : null
  },
}).mount('#app')

// 测试只通过公开属性和实例方法驱动组件，手势由浏览器事件输入。
;(window as any).__pullRefreshTest = {
  async reset() {
    mounted.value = false
    await nextTick()
    refreshing.value = disabled.value = false
    requests = clicks = renders = 0
    events = []
    completion = 'manual'
    revision.value++
    mounted.value = true
    await nextTick()
  },
  async set(value: { refreshing?: boolean; disabled?: boolean; mounted?: boolean; completion?: string }) {
    if (value.refreshing !== undefined) refreshing.value = value.refreshing
    if (value.disabled !== undefined) disabled.value = value.disabled
    if (value.mounted !== undefined) mounted.value = value.mounted
    if (value.completion !== undefined) completion = value.completion
    await nextTick()
  },
  async refresh() { instance?.refresh(); await nextTick() },
  snapshot: () => ({ refreshing: refreshing.value, requests, clicks, renders, events: [...events] }),
}
