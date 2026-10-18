/** 原生插槽上下文；列表、菜单、页签分别提供条目与当前状态。 */
export interface NativeOutlet {
  name: string;
  target: Element;
  scope: Record<string, any>;
}
/** 原生组件实例，直接更新源码或使用 update 均不依赖框架。 */
export interface NativeController {
  element: Element;
  outlets: Map<Element, NativeOutlet>;
  exposed: Record<string, (...args: any[]) => any>;
  /** 更新属性、宿主属性和插槽名称，保留原生控件实例。 */
  update(
    properties?: Record<string, any>,
    attributes?: Record<string, any>,
    slots?: string[],
  ): void;
  /** 清理本实例的监听、动画、子组件与弹层。 */
  destroy(): void;
}
/** 原生 DOM 插槽内容，字符串始终按文本处理。 */
export type NativeContent =
  | Node
  | NativeController
  | string
  | number
  | null
  | undefined
  | NativeContent[];
/** API 弹层的关闭方法与结果。 */
export interface NativePopupHandle<T = unknown> {
  close(value?: T): void;
  closed: Promise<T | undefined>;
}
/** 原生弹层配置，content 可自由构建任意 DOM。 */
export interface NativePopupOptions<T = unknown> {
  title: string;
  content?: (context: { close(value?: T): void }) => NativeContent;
  message?: string;
  center?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
  cancelText?: string | false;
  confirmText?: string;
  danger?: boolean;
  swipeable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  style?: string | Record<string, string | number> | unknown[];
  /** 框架适配扩展点，返回内容卸载方法。 */
  renderContent?: (
    target: Element,
    context: { close(value?: T): void },
  ) => void | (() => void);
  onConfirm?: () => void;
}
/** 原生创建选项，Vue 适配层复用同一个元素与插槽出口。 */
export interface NativeCreateOptions {
  /** 宿主或原生输入元素的属性与事件。 */
  attributes?: Record<string, any>;
  element?: Element;
  slots?: Record<string, NativeContent | ((context: any) => NativeContent)>;
  externalSlots?: boolean;
  slotNames?: string[];
  emit?: (event: string, ...args: any[]) => void;
  invalidate?: () => void;
}
/** 可直接在普通 HTML 中使用的唯一运行时。 */
export interface MyUIApi {
  create(
    name: string,
    properties?: Record<string, any>,
    options?: NativeCreateOptions,
  ): NativeController;
  mount(
    target: string | Element,
    name: string,
    properties?: Record<string, any>,
    options?: NativeCreateOptions,
  ): NativeController;
  init(root?: ParentNode): NativeController[];
  popup: {
    showAlert(options: NativePopupOptions): Promise<boolean>;
    showSheet<T = unknown>(
      options: NativePopupOptions<T>,
    ): NativePopupHandle<T>;
    showDrawer<T = unknown>(
      options: NativePopupOptions<T>,
    ): NativePopupHandle<T>;
    /** 立即释放当前应用的所有 API 弹层与等待结果。 */
    closeAll(): void;
  };
  utils: Record<string, (...args: any[]) => any>;
}
declare global {
  var MyUI: MyUIApi;
}
