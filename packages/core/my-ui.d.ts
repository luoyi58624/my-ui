/** 文件从选择到请求完成的状态，取消后仍可重试。 */
export type UploadStatus = "ready" | "uploading" | "success" | "error" | "canceled";
/** 上传列表记录；已有文件可只提供 id、name、url 和状态。 */
export interface UploadFile {
  /** 当前列表内唯一的文件标识。 */
  id: string;
  /** 展示的文件名，始终按纯文本处理。 */
  name: string;
  /** 文件大小，单位字节。 */
  size?: number;
  /** MIME 类型，图片类型会展示缩略图。 */
  type?: string;
  /** 原生文件对象；缺少时不执行上传或重试。 */
  file?: File;
  /** 已有图片的预览地址。 */
  url?: string;
  /** 省略时，原始文件视为 ready，已有文件视为 success。 */
  status?: UploadStatus;
  /** 上传百分比，范围 0—100。 */
  percentage?: number;
  /** 失败说明。 */
  error?: string;
  /** 自定义 request 的返回结果。 */
  response?: unknown;
}
/** 自定义上传请求的取消信号与进度接口。 */
export interface UploadRequestContext {
  /** 移除、取消、外部替换或卸载时触发中止。 */
  signal: AbortSignal;
  /** 上报百分比，组件自动限制到 0—100。 */
  onProgress(percentage: number): void;
}
/** 由应用实现网络传输；兑现表示成功，拒绝表示失败。 */
export type UploadRequest = (file: File, context: UploadRequestContext) => Promise<unknown>;
/** 一次选择中被类型、大小、重复或数量规则拒绝的文件。 */
export interface UploadRejection {
  /** 被拒绝的原生文件。 */
  file: File;
  /** 拒绝原因，便于应用自行展示提示。 */
  reason: "accept" | "size" | "duplicate" | "count";
  /** 默认中文提示。 */
  message: string;
}

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
/** Button、交互型 Card 与 ListRow 共用的按压配置。 */
export interface NativePressOptions {
  /** 触摸按压激活前的等待毫秒数，默认 0；鼠标与键盘不延迟。 */
  delayTouchActive?: number;
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
    properties?: Record<string, any> & NativePressOptions,
    options?: NativeCreateOptions,
  ): NativeController;
  mount(
    target: string | Element,
    name: string,
    properties?: Record<string, any> & NativePressOptions,
    options?: NativeCreateOptions,
  ): NativeController;
  init(root?: ParentNode): NativeController[];
  /** 平台无关的弹层返回接口；系统手势由应用宿主接入。 */
  layers: {
    /** 优先关闭顶层或返回上级菜单；存在弹层时消费返回，包括退出动画期间。 */
    dismissTop(): boolean;
    /** 立即订阅是否存在弹层，返回取消订阅方法。 */
    subscribe(listener: (active: boolean) => void): () => void;
  };
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
