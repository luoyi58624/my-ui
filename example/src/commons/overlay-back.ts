import { installNativeBackHandler } from 'tauri-plugin-native-components/window'
import type {} from '../../../packages/core/my-ui'

/** 只提供示例组件库的弹层接口，系统返回实现由插件统一管理。 */
export function installNativeOverlayBack(): () => void {
  return installNativeBackHandler({
    dismiss: () => MyUI.layers.dismissTop(),
    subscribe: notify => MyUI.layers.subscribe(notify),
  })
}
