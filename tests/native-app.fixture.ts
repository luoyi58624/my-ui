import { createApp, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import { createRouter, createWebHashHistory, onBeforeRouteLeave } from 'vue-router'
import { App, AppBar, BottomNavigation, useApp, type AppPage, type AppTab } from 'tauri-plugin-native-components/vue'
import Root from '../example/src/demo/native-app/Root.vue'
import 'tauri-plugin-native-components/style.css'

const w = window as any
w.mounts = {}; w.unmounts = {}; w.events = []
const active = ref('home'), barCount = ref(0)
const custom = new URLSearchParams(location.search).has('custom')
const Tab = defineComponent({
  props: ['name'],
  setup(props) {
    const app = useApp(), count = ref(0), draft = ref('')
    onMounted(() => { w.mounts[props.name] = (w.mounts[props.name] || 0) + 1 })
    onUnmounted(() => { w.unmounts[props.name] = (w.unmounts[props.name] || 0) + 1 })
    w.appNavigation = app
    return () => h('main', { 'data-test-tab': props.name, style: 'min-height:1300px;padding:20px;box-sizing:border-box' }, [
      h(AppBar, { title: props.name }),
      h('input', { value: draft.value, 'aria-label': props.name + '-draft', onInput: (event: Event) => { draft.value = (event.target as HTMLInputElement).value } }),
      h('button', { 'data-count': props.name, onClick: () => count.value++ }, props.name + ' · ' + count.value),
      h('button', { 'data-open': props.name, onClick: () => app.push({ name: 'app-test-detail', params: { id: '7' } }) }, '打开详情'),
    ])
  },
})
const Detail = defineComponent({
  props: ['id'],
  setup(props) {
    const app = useApp(), note = ref('')
    onBeforeRouteLeave(() => { w.events.push('detail-leave') })
    return () => h('main', { 'data-test-detail': props.id, style: 'min-height:1300px;padding:20px' }, [
      h(AppBar, { title: '详情', back: true, onBack: () => app.back() }),
      h('input', { value: note.value, 'aria-label': 'detail-note', onInput: (event: Event) => { note.value = (event.target as HTMLInputElement).value } }),
      h('button', { 'data-back': '', onClick: () => app.back() }, '返回'),
      h('button', { 'data-next': '', onClick: () => app.push({ name: 'app-test-detail', params: { id: '8' } }) }, '下一页'),
    ])
  },
})
const tabs: AppTab[] = ['home', 'messages', 'profile'].map(name => ({ value: name, component: Tab, props: { name } }))
const pages: AppPage[] = [{ name: 'app-test-detail', path: '/fixture/detail/:id', component: Detail, props: true }]
const items = [{ value: 'home', label: '首页', icon: 'home' as const }, { value: 'messages', label: '消息', icon: 'message' as const }, { value: 'profile', label: '我的', icon: 'user' as const }]
const Example = defineComponent({
  setup: () => () => h(App, { tabs, pages, modelValue: active.value, 'onUpdate:modelValue': value => { active.value = value }, onError: error => w.events.push(String(error)) }, {
    tabbar: ({ value, select }: any) => [
      h('button', { 'data-bar-count': '', onClick: () => barCount.value++ }, '自定义底栏 · ' + barCount.value),
      custom
        ? h('nav', { 'aria-label': '自定义导航', style: 'display:flex;gap:12px;padding:12px' }, items.map(item => h('button', { 'data-custom-tab': item.value, onClick: () => select(item.value) }, item.label)))
        : h(BottomNavigation, { modelValue: value, items, 'onUpdate:modelValue': select }),
    ],
  }),
})
const router = createRouter({ history: createWebHashHistory(), routes: [{ path: '/fixture', name: 'app-test-root', component: Example, children: pages }, { path: '/', redirect: '/fixture' }] })
w.fixture = { active, barCount, router }
const app = createApp(Root).use(router)
await router.isReady()
app.mount('#app')
