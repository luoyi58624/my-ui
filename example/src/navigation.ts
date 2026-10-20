import { createNativeRouter } from 'native-router'
import type { PageOptions } from 'native-router'
import { router } from './router'
import { readPageAppearance } from './native-context'

export { isAndroidNative, isNativePage as isChildPage } from 'native-router'

/** 示例导航实例，各平台使用同一份 Vue Router 路由。 */
export const navigation = createNativeRouter(router, { appearance: readPageAppearance })

/** 进入示例页面：Android 创建 Activity，Web 与桌面端在当前窗口切换。 */
export function openPage(path: string, options: PageOptions = {}): Promise<void> {
  return navigation.push(path, options).then(() => {})
}

/** 返回上一页；直接打开详情时回到组件目录，不关闭首页 Activity。 */
export function closePage(fallback = '/home'): Promise<void> {
  return navigation.back(fallback).then(() => {})
}
