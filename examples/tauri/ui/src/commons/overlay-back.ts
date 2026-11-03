import { installNativeBackHandler } from 'tauri-plugin-native-components/window'
import type { Router } from 'vue-router'
import type {} from '../../../../../lib/my-ui'

/** 提供示例弹层与路由，插件依次处理弹层、同窗口页面和系统返回。 */
export function installNativeOverlayBack(router?: Router): () => void {
  return installNativeBackHandler({
    router,
    dismiss: () => MyUI.layers.dismissTop(),
    subscribe: notify => MyUI.layers.subscribe(notify),
  })
}
