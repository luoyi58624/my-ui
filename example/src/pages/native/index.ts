import { defineAsyncComponent, type Component } from 'vue'

/** 应用能力文档按目录标识加载，独立文档与完整示例共用。 */
export const nativeDocs: Record<string, Component> = {
  'native-navigation': defineAsyncComponent(() => import('./navigation/index.vue'))
}
