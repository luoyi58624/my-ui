import { createApp, h, KeepAlive, ref } from 'vue'
import { AppBar, Page } from 'tauri-plugin-native-components/vue'
import 'tauri-plugin-native-components/style.css'

const w = window as any
const refreshing = ref(false), refreshable = ref(true), disabled = ref(false), active = ref(true), suspended = ref(false), shown = ref(true)
w.state = { refreshing, refreshable, disabled, active, suspended, shown }
w.refreshes = 0; w.errors = []; w.updates = []; w.immediate = false
w.app = createApp({ setup: () => () => h(KeepAlive, null, { default: () => shown.value ? h(Page, {
  ref: value => { if (value) w.page = value }, key: 'page', style: 'height:560px;width:360px;--nc-primary:#2456ca;--nc-surface:#fff;--nc-text:#17191e;--nc-muted:#626776;--nc-border:#ddd',
  refreshing: refreshing.value, refreshable: refreshable.value, disabled: disabled.value, active: active.value, suspended: suspended.value, safeArea: false,
  'onUpdate:refreshing': value => { w.updates.push(value); refreshing.value = value },
  onRefresh: () => { w.refreshes++; if (w.immediate) refreshing.value = false },
  onError: error => w.errors.push(String(error)),
}, {
  navbar: () => h(AppBar, { title: '动态列表', back: true }),
  default: () => h('div', { id: 'content', style: 'min-height:1600px;padding:20px;box-sizing:border-box' }, [
    h('p', { id: 'pull-start', style: 'height:50px;margin:0' }, '从这里下拉刷新'),
    h('input', { id: 'input', value: '输入保持正常', style: 'display:block;height:40px' }),
    h('div', { id: 'nested', style: 'height:90px;overflow:auto;margin-top:10px' }, h('div', { style: 'height:400px' }, '独立滚动区域')),
    h('div', { id: 'horizontal', style: 'touch-action:pan-x;height:40px;margin-top:10px' }, '横向手势区域'),
    h('div', { id: 'excluded', 'data-page-no-refresh': '', style: 'height:40px' }, '自定义手势区域'),
  ]),
}) : h('p', { key: 'other' }, '其他页面') }) })
w.app.mount('#app')
