import type { InjectionKey } from 'vue'

/** 文档中的一个预览锚点。 */
export interface DocumentExample {
  /** 在当前文档内唯一的示例名称。 */
  name: string
  /** 本页目录显示的标题。 */
  title: string
  /** 对应的示例节点。 */
  element: HTMLElement
}

/** 组件文档向预览提供独立的目录注册范围。 */
export const documentKey: InjectionKey<{
  id: string
  /** 首次渲染时只展开第一例代码，后续开合仍由用户控制。 */
  defaultCodeOpen: (name: string) => boolean
  register: (example: DocumentExample) => () => void
}> = Symbol('demo-document')
