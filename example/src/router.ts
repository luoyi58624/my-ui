import { createRouter, createWebHashHistory, type Router } from 'vue-router'
import { appRoutes } from './demo/native-app/routes'

/** 各平台共用路由，旧的 HTML 子页入口继续可用。 */
export const router: Router = import.meta.hot?.data.router ?? createRouter({
  history: createWebHashHistory(),
  routes: [
    ...appRoutes,
    { path: '/', redirect: () => location.pathname.endsWith('/native-page.html') ? '/shared-state' : '/home' },
    { path: '/shared-state', name: 'shared-state', component: () => import('./NativePage.vue') },
    { path: '/html', name: 'html', component: () => import('./NativeHtmlPage.vue') },
    { path: '/showcase', name: 'showcase', component: () => import('./App.vue'), props: { showcase: true } },
    { path: '/guide/quick-start', name: 'quick-start', component: () => import('./GuidePage.vue'), props: { kind: 'quick-start' } },
    { path: '/guide/native', name: 'native-integration', component: () => import('./GuidePage.vue'), props: { kind: 'native' } },
    { path: '/code/:id', name: 'example-code', component: () => import('./ExampleCodePage.vue') },
    { path: '/native/app-bar', alias: '/example/native-app-bar', name: 'native-app-bar', component: () => import('./NativeComponentsDemo.vue'), props: { kind: 'app-bar' } },
    { path: '/native/bottom-navigation', alias: '/example/native-bottom-navigation', name: 'native-bottom-navigation', component: () => import('./NativeComponentsDemo.vue'), props: { kind: 'bottom-navigation' } },
    { path: '/native/tabs', alias: '/example/native-tabs', name: 'native-tabs', component: () => import('./NativeComponentsDemo.vue'), props: { kind: 'tabs' } },
    { path: '/page-refresh', alias: '/example/page-refresh', name: 'page-refresh', component: () => import('./PageRefreshDemo.vue') },
    { path: '/:pathMatch(.*)*', name: 'demo', component: () => import('./App.vue') },
  ],
})

// 依赖热更新时复用已安装的路由，避免导航改了地址而页面仍绑定旧实例。
if (import.meta.hot) import.meta.hot.data.router = router
