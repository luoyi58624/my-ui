import type { InjectionKey } from 'vue'
import type { Option } from '@my-ui/vue'

/** 主 Demo 的栏目配置，页面和底栏共用唯一标识。 */
export interface DemoTab extends Option {
  /** 页面顶部的标题。 */
  title: string
  /** 占位示例编号。 */
  demo?: number
}

/** 主 Demo 的栏目与文档页共用导航错误提示入口。 */
export const demoLayoutKey: InjectionKey<{
  /** 展示页面导航的失败原因。 */
  report(reason: unknown): void
}> = Symbol('demo-layout')
