import { defineAsyncComponent, type Component } from 'vue'

/** 原生能力文档按目录标识加载，独立文档与完整示例共用。 */
export const nativeDocs: Record<string, Component> = {
  'native-app': defineAsyncComponent(() => import('./app/index.vue')),
  'native-navigation': defineAsyncComponent(() => import('./navigation/index.vue'))
}
