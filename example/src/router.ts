import { createRouter, createWebHashHistory, type Router } from 'vue-router'
import { appRoutes } from './pages/native/app/routes'
import { demoPages } from './pages/routes'

/** 各平台共用路由，旧的 HTML 子页入口继续可用。 */
export const router: Router =
  import.meta.hot?.data.router ??
  createRouter({
    history: createWebHashHistory(),
    routes: [
      ...appRoutes,
      {
        path: '/',
        redirect: () =>
          location.pathname.endsWith('/native-page.html') ? '/shared-state' : '/home'
      },
      {
        path: '/shared-state',
        name: 'shared-state',
        component: () => import('./pages/native/shared-state/index.vue')
      },
      { path: '/html', name: 'html', component: () => import('./pages/native/html/index.vue') },
      {
        path: '/showcase',
        name: 'showcase',
        component: () => import('./pages/showcase/index.vue')
      },
      {
        path: '/guide/quick-start',
        name: 'quick-start',
        component: () => import('./pages/guide/GuidePage.vue'),
        props: { kind: 'quick-start' }
      },
      {
        path: '/guide/native',
        name: 'native-integration',
        component: () => import('./pages/guide/GuidePage.vue'),
        props: { kind: 'native' }
      },
      {
        path: '/code/:id',
        name: 'example-code',
        component: () => import('./pages/code/ExampleCodePage.vue')
      },
      {
        path: '/native/app-bar',
        alias: '/example/native-app-bar',
        name: 'native-app-bar',
        component: () => import('./pages/native/NativeComponentsDemo.vue'),
        props: { kind: 'app-bar' }
      },
      {
        path: '/native/tabbar',
        alias: [
          '/native/bottom-navigation',
          '/example/native-bottom-navigation',
          '/example/native-tabbar'
        ],
        name: 'native-tabbar',
        component: () => import('./pages/native/NativeComponentsDemo.vue'),
        props: { kind: 'tabbar' }
      },
      {
        path: '/native/tabs',
        alias: '/example/native-tabs',
        name: 'native-tabs',
        component: () => import('./pages/native/NativeComponentsDemo.vue'),
        props: { kind: 'tabs' }
      },
      {
        path: '/page-refresh',
        alias: '/example/page-refresh',
        name: 'page-refresh',
        component: () => import('./pages/native/page-refresh/index.vue')
      },
      {
        path: '/',
        name: 'demo',
        component: () => import('./components/DemoLayout.vue'),
        children: [
          // Tab 由 App 渲染；这些记录只同步入口地址，不创建第二个页面视图。
          ...['home', 'native', 'messages', 'settings', 'discover'].map((tab) => ({
            path: tab,
            ...(tab === 'settings' ? { alias: '/profile' } : {}),
            name: 'tab-' + tab,
            components: {},
            meta: { tab: tab === 'discover' ? 'native' : tab }
          })),
          ...demoPages
        ]
      },
      { path: '/:pathMatch(.*)*', redirect: '/home' }
    ]
  })

// 依赖热更新时复用已安装的路由，避免导航改了地址而页面仍绑定旧实例。
if (import.meta.hot) import.meta.hot.data.router = router
