import { createRouter, createWebHashHistory } from 'vue-router'

/** 各平台共用路由，旧的 HTML 子页入口继续可用。 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: () => location.pathname.endsWith('/native-page.html') ? '/shared-state' : '/home' },
    { path: '/shared-state', name: 'shared-state', component: () => import('./NativePage.vue') },
    { path: '/html', name: 'html', component: () => import('./NativeHtmlPage.vue') },
    { path: '/:pathMatch(.*)*', name: 'demo', component: () => import('./App.vue') },
  ],
})
