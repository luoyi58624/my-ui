import type { InjectionKey, Slots } from 'vue'
import type { NavigationItem } from 'tauri-plugin-native-components/vue'

/** 主 Demo 的栏目配置，页面信息和底栏共用唯一标识。 */
export interface DemoTab extends NavigationItem {
  /** 页面顶部的标题。 */
  title: string
  /** 原生占位示例编号。 */
  demo?: number
}

/** 独立文档页复用主 Demo 已定义的组件示例和提示入口。 */
export const demoLayoutKey: InjectionKey<{
  content: Slots
  report(reason: unknown): void
}> = Symbol('demo-layout')
