import { createApp, defineComponent, h, onMounted, provide, ref } from 'vue'
import { AppBar, Tabbar, Page } from 'tauri-plugin-native-components/vue'
import { pageLayoutKey } from '../example/node_modules/tauri-plugin-native-components/vue/usePageLayout'
import { Button, Dialog, Drawer } from '../packages/vue/index'
import 'tauri-plugin-native-components/style.css'

const w = window as any
w.lateDocks = []
// 父组件 mounted 才确认页面根节点，覆盖插槽导航先于页面引用就绪的顺序。
const LatePage = defineComponent({ setup(_, { slots }) {
  const root = ref<HTMLElement>()
  provide(pageLayoutKey, { root, native: ref(false), update(side, payload, done) { w.lateDocks.push({ side, payload }); done(true) }, remove() {} })
  onMounted(() => { root.value = document.querySelector<HTMLElement>('.nc-page')! })
  return () => h('section', { class: 'nc-page', style: 'height:100dvh' }, [
    h('div', { class: 'nc-page-navbar' }, slots.navbar?.()), h('div', { class: 'nc-page-body' }, slots.default?.()), h('div', { class: 'nc-page-navigation' }, slots.navigation?.()),
  ])
} })
const title = ref('原生页面'), tab = ref('home'), dialog = ref(false), drawer = ref(false), active = ref(true)
const placement = ref<'left' | 'right' | 'top' | 'bottom'>('right'), note = ref('保留输入')
w.state = { title, tab, dialog, drawer, active, placement, note }
w.events = []
const items = [{ value: 'home', label: '首页', icon: 'home' as const }, { value: 'saved', label: '收藏', icon: 'grid' as const }]
w.app = createApp({ setup: () => () => h(new URL(location.href).searchParams.get('frame') === 'late' ? LatePage : Page, { active: active.value, style: 'height:100dvh', onError: (reason: unknown) => w.errors.push(String(reason)) }, {
  navbar: () => h(AppBar, { title: title.value, back: true, actions: [{ value: 'settings', label: '设置', icon: 'sliders' }], onBack: () => w.events.push('back'), onAction: value => w.events.push(value) }),
  navigation: () => h(Tabbar, { modelValue: tab.value, items, 'onUpdate:modelValue': value => { tab.value = value } }),
  default: () => [
    h('input', { id: 'note', value: note.value, onInput: event => { note.value = (event.target as HTMLInputElement).value } }),
    h(Button, { onClick: () => { dialog.value = true } }, () => '打开确认'),
    h(Dialog, { modelValue: dialog.value, title: '确认内容', 'onUpdate:modelValue': value => { dialog.value = value } }, () => h('p', note.value)),
    h(Drawer, { modelValue: drawer.value, title: '抽屉内容', placement: placement.value, 'onUpdate:modelValue': value => { drawer.value = value } }, () => h('p', note.value)),
  ],
}) })
w.app.mount('#app')
