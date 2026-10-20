import { createRouter, createWebHashHistory } from 'vue-router'

/** 各平台共用路由，旧的 HTML 子页入口继续可用。 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: () => location.pathname.endsWith('/native-page.html') ? '/shared-state' : '/home' },
    { path: '/shared-state', name: 'shared-state', component: () => import('./NativePage.vue') },
    { path: '/html', name: 'html', component: () => import('./NativeHtmlPage.vue') },
    { path: '/native/app-bar', alias: '/example/native-app-bar', name: 'native-app-bar', component: () => import('./NativeComponentsDemo.vue'), props: { kind: 'app-bar' } },
    { path: '/native/bottom-navigation', alias: '/example/native-bottom-navigation', name: 'native-bottom-navigation', component: () => import('./NativeComponentsDemo.vue'), props: { kind: 'bottom-navigation' } },
    { path: '/native/tabs', alias: '/example/native-tabs', name: 'native-tabs', component: () => import('./NativeComponentsDemo.vue'), props: { kind: 'tabs' } },
    { path: '/page-refresh', alias: '/example/page-refresh', name: 'page-refresh', component: () => import('./PageRefreshDemo.vue') },
    { path: '/:pathMatch(.*)*', name: 'demo', component: () => import('./App.vue') },
  ],
})
