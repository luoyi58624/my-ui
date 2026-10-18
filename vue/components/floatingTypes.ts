/** 浮动窗口的首选方向，空间不足时自动翻转。 */
export type FloatingPlacement = 'top' | 'bottom' | 'left' | 'right' | `${'top' | 'bottom' | 'left' | 'right'}-${'start' | 'end'}`

/** 按压位置使用视口坐标，可携带触发元素以保留主题和弹窗上下文。 */
export interface PointerAnchor {
  /** 按压点的 clientX。 */
  x: number
  /** 按压点的 clientY。 */
  y: number
  /** 提供焦点、局部主题与模态容器的触发元素。 */
  contextElement?: HTMLElement
}

/** 窗口可以跟随一个元素，也可以从实际按压点展开。 */
export type FloatingAnchor = HTMLElement | PointerAnchor
