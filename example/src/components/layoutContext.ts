import type { InjectionKey } from 'vue'
import type { NavigationItem } from 'tauri-plugin-native-components/vue'

/** 主 Demo 的栏目配置，页面信息和底栏共用唯一标识。 */
export interface DemoTab extends NavigationItem {
  /** 页面顶部的标题。 */
  title: string
  /** 原生占位示例编号。 */
  demo?: number
}

/** 主 Demo 的栏目与文档页共用导航错误提示入口。 */
export const demoLayoutKey: InjectionKey<{
  /** 展示页面导航的失败原因。 */
  report(reason: unknown): void
}> = Symbol('demo-layout')
