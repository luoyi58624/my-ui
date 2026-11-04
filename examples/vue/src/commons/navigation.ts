import type { InjectionKey } from 'vue'
import type { Router } from 'vue-router'
import { createNativeRouter } from 'tauri-plugin-native-components/router'
import type { PageOptions } from 'tauri-plugin-native-components/router'
import { readPageAppearance } from './native-context'

export { isAndroidNative, isNativePage as isChildPage } from 'tauri-plugin-native-components/router'

/** 绑定应用自己的路由，Android 优先使用原生窗口。 */
export function createDemoNavigation(router: Router) {
  const navigation = createNativeRouter(router, { appearance: readPageAppearance })
  return {
    navigation,
    openPage: (path: string, options: PageOptions = {}) => navigation.push(path, options).then(() => {}),
    closePage: (fallback = '/home') => navigation.back(fallback).then(() => {}),
  }
}

/** 应用入口注入导航，独立展示页中的示例可使用普通浏览器链接。 */
export const demoNavigationKey: InjectionKey<ReturnType<typeof createDemoNavigation>> = Symbol('demoNavigation')
