import { createApp, h, ref } from 'vue'
import { NativeAppBar, NativeTabs } from 'tauri-plugin-native-components/vue'
import 'tauri-plugin-native-components/style.css'

const w = window as any
const title = ref('组件示例'), selected = ref('home'), suspended = ref(false), visible = ref(true)
w.state = { title, selected, suspended, visible }
const items = [
  { value: 'home', label: '首页', icon: 'home' as const },
  { value: 'discover', label: '发现', icon: 'grid' as const, nativeView: 'demo', nativeProps: { count: 1 } },
  { value: 'messages', label: '消息', icon: 'message' as const, disabled: true },
  { value: 'profile', label: '我的', icon: 'user' as const, badge: 3, nativeView: 'demo', nativeProps: { count: 3 } },
]
w.app = createApp({ setup: () => () => h('div', { style: '--nc-surface:#fff;--nc-text:#17191e;--nc-muted:#626776;--nc-primary:#2456ca;--nc-selected:#e8efff;--nc-border:#ddd' }, [
  visible.value ? h(NativeAppBar, { title: title.value, back: true, suspended: suspended.value, actions: [{ value: 'settings', label: '设置', icon: 'sliders' }], onBack: () => w.events.push('back'), onAction: value => w.events.push(value), onError: () => w.events.push('error') }) : null,
  h(NativeTabs, { style: 'height:400px', modelValue: selected.value, items, suspended: suspended.value, 'onUpdate:modelValue': value => { selected.value = value }, onSelect: value => w.events.push(value), onAction: event => w.events.push(event.tab + ':' + event.value), onError: () => w.events.push('error') }, () => h('p', '页面内容')),
]) })
w.app.mount('#app')
