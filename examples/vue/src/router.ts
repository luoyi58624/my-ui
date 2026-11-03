import { createRouter, createWebHashHistory, type Router } from 'vue-router'
import { demoPages } from './pages/routes'

/** 各窗口复用同一路由与 Web 壳，Android 独立页面由原生导航创建。 */
export const router: Router = import.meta.hot?.data.router ?? createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'demo', component: () => import('@shell/components/DemoLayout.vue'), children: [
      { path: '', redirect: () => location.pathname.endsWith('/native-page.html') ? '/shared-state' : '/home' },
      ...['home', 'native', 'messages', 'settings'].map(tab => ({
        path: tab, name: 'tab-' + tab, components: {},
        ...(tab === 'settings' ? { alias: '/profile' } : tab === 'native' ? { alias: '/discover' } : {}), meta: { tab }
      })),
      ...demoPages,
      { path: 'shared-state', name: 'shared-state', component: () => import('./pages/native/shared-state/index.vue') },
      { path: 'html', name: 'html', component: () => import('./pages/native/html/index.vue') },
      { path: 'showcase', name: 'showcase', component: () => import('./pages/showcase/index.vue') },
      { path: 'guide/quick-start', name: 'quick-start', component: () => import('@shell/pages/guide/GuidePage.vue'), props: { kind: 'quick-start' } },
      { path: 'guide/native', name: 'native-integration', component: () => import('@shell/pages/guide/GuidePage.vue'), props: { kind: 'native' } },
      { path: 'code/:id', name: 'example-code', component: () => import('@shell/pages/code/ExampleCodePage.vue'), props: true }
    ] },
    { path: '/native/app-bar', alias: '/example/native-app-bar', redirect: '/example/app-bar' },
    { path: '/native/tabbar', alias: ['/native/bottom-navigation', '/example/native-bottom-navigation', '/example/native-tabbar'], redirect: '/example/tabbar' },
    { path: '/native/tabs', alias: '/example/native-tabs', redirect: '/example/tabbar' },
    { path: '/page-refresh', alias: '/example/page-refresh', redirect: '/example/pull-refresh' },
    { path: '/native/app-demo/:pathMatch(.*)*', alias: '/example/native-app', redirect: '/native' },
    { path: '/:pathMatch(.*)*', redirect: '/home' }
  ]
})

// 热更新复用已安装的实例，避免地址与视图绑定不同路由。
if (import.meta.hot) import.meta.hot.data.router = router
