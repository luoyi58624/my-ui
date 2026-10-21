import { createApp, h, ref } from 'vue'
import { AppBar, BottomNavigation, Page } from 'tauri-plugin-native-components/vue'
import { Button, Dialog, Drawer } from '../packages/vue/index'
import 'tauri-plugin-native-components/style.css'

const w = window as any
const title = ref('原生页面'), tab = ref('home'), dialog = ref(false), drawer = ref(false), active = ref(true)
const placement = ref<'left' | 'right' | 'top' | 'bottom'>('right'), note = ref('保留输入')
w.state = { title, tab, dialog, drawer, active, placement, note }
w.events = []
const items = [{ value: 'home', label: '首页', icon: 'home' as const }, { value: 'saved', label: '收藏', icon: 'grid' as const }]
w.app = createApp({ setup: () => () => h(Page, { active: active.value, style: 'height:100dvh', onError: reason => w.errors.push(String(reason)) }, {
  navbar: () => h(AppBar, { title: title.value, back: true, actions: [{ value: 'settings', label: '设置', icon: 'sliders' }], onBack: () => w.events.push('back'), onAction: value => w.events.push(value) }),
  navigation: () => h(BottomNavigation, { modelValue: tab.value, items, 'onUpdate:modelValue': value => { tab.value = value } }),
  default: () => [
    h('input', { id: 'note', value: note.value, onInput: event => { note.value = (event.target as HTMLInputElement).value } }),
    h(Button, { onClick: () => { dialog.value = true } }, () => '打开确认'),
    h(Dialog, { modelValue: dialog.value, title: '确认内容', 'onUpdate:modelValue': value => { dialog.value = value } }, () => h('p', note.value)),
    h(Drawer, { modelValue: drawer.value, title: '抽屉内容', placement: placement.value, 'onUpdate:modelValue': value => { drawer.value = value } }, () => h('p', note.value)),
  ],
}) })
w.app.mount('#app')
