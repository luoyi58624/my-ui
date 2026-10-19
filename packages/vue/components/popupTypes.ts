import type { StyleValue, VNodeChild } from 'vue'

/** 自定义内容获得的关闭方法，不限制插入的组件与布局。 */
export interface PopupContext<T = unknown> {
  /** 先关闭窗口，再把可选结果交给调用方。 */
  close: (value?: T) => void
}
/** 自定义弹层的控制句柄。 */
export interface PopupHandle<T = unknown> extends PopupContext<T> {
  /** 关闭后的结果；取消、遮罩或 Escape 关闭时返回 undefined。 */
  closed: Promise<T | undefined>
}
/** 使用 h() 构建任意 Vue 内容，保留 Popup 宿主的应用上下文。 */
export type PopupContent<T = unknown> = (context: PopupContext<T>) => VNodeChild
/** 所有 API 弹层共用的基础选项。 */
export interface PopupOptions {
  /** 窗口标题，同时用于可访问名称。 */
  title: string
  /** 组件样式与外观变量，支持对象、字符串和数组。 */
  style?: StyleValue
  /** 是否允许点击遮罩关闭，默认 true。 */
  closeOnBackdrop?: boolean
  /** 是否允许按 Escape 关闭，默认 true。 */
  closeOnEscape?: boolean
}
/** API 确认提示框选项。 */
export interface AlertOptions extends PopupOptions {
  /** 普通文本正文，不解析 HTML。 */
  message?: string
  /** 默认 false 在底部展示，true 居中展示；两种位置都保留外边距。 */
  center?: boolean
  /** 默认取消，false 时只显示确认按钮。 */
  cancelText?: string | false
  /** 确认文案，默认确定。 */
  confirmText?: string
  /** 危险操作的确认按钮使用危险色。 */
  danger?: boolean
}
/** API 底部面板选项。 */
export interface SheetOptions<T = unknown> extends PopupOptions {
  /** 是否允许下拉关闭，默认 true。 */
  swipeable?: boolean
  /** 自定义面板正文，选择框位置与选中样式由这里的组件决定。 */
  content: PopupContent<T>
  /** 默认取消，false 隐藏底部取消按钮。 */
  cancelText?: string | false
  /** 传入时显示第二个确认按钮。 */
  confirmText?: string
  /** 危险操作的确认按钮使用危险色。 */
  danger?: boolean
  /** 面板收起后执行确认回调，业务数据由调用方维护。 */
  onConfirm?: () => void
}
/** API 抽屉选项。 */
export interface DrawerOptions<T = unknown> extends PopupOptions {
  /** 是否允许沿展开方向滑动关闭，默认 true。 */
  swipeable?: boolean
  /** 自定义抽屉内容。 */
  content: PopupContent<T>
  /** 展开方向，默认 right。 */
  placement?: 'left' | 'right' | 'top' | 'bottom'
}
