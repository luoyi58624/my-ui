import '../../lib/my-ui.js'
/** 兼容旧测试与内部导入，关闭队列只在原生核心中维护。 */
export const { createPopupStore } = globalThis.MyUI.utils
