/** 本地图标名称，图形只在 lib/my-ui.js 中维护。 */
export type IconName = 'sun' | 'eye' | 'eye-off' | 'arrow-right' | 'chevron-right' | 'chevrons-up-down' | 'check' | 'bell' | 'cloud' | 'spark' | 'search' | 'x' | 'heart' | 'share' | 'add' | 'moon' | 'shield' | 'wifi' | 'sliders' | 'clock' | 'briefcase' | 'grid' | 'home' | 'user' | 'message' | 'layer' | 'inbox' | 'image' | 'trash' | 'copy' | 'file' | 'info' | 'alert-circle' | 'alert-triangle'

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

/** 空列以 null 占位，其余值保持原来的字符串或数值类型。 */
export type PickerValue = string | number | null

/** 一项滚轮选项；children 表示下一列的级联内容。 */
export interface PickerOption {
  /** 当前项的唯一值，同列内不重复。 */
  value: string | number
  /** 显示的纯文字。 */
  label: string
  /** 禁止选中，滚动与键盘会自动跳过。 */
  disabled?: boolean
  /** 当前项对应的下一列选项。 */
  children?: readonly PickerOption[]
}

/** 自定义刻度的位置和可选文字；位置使用 min / max 相同单位。 */
export interface SliderMark {
  /** 刻度对应的数值。 */
  value: number
  /** 刻度下方的文字，省略时仅显示圆点。 */
  label?: string | number
}

/** 表单标签与控件的三种排列方式。 */
export type FormLayout = 'vertical' | 'horizontal' | 'inline'


/** 表单项提供的原生控件属性，通过属性展开关联标签与说明。 */
export interface FieldControl {
  /** 与可见标签关联的控件标识。 */
  id: string
  /** 控件是否必填。 */
  required: boolean
  /** 原生控件或分组使用的可见标签标识。 */
  'aria-labelledby': string
  /** 当前是否存在校验错误。 */
  'aria-invalid': true | undefined
  /** 错误或说明元素的标识。 */
  'aria-describedby': string | undefined
}

/** 选择、分段与导航组件共用的选项。 */
export interface Option {
  /** 选项的唯一值。 */
  value: string
  /** 面向用户的选项名称。 */
  label: string
  /** 选项的补充说明。 */
  description?: string
  /** 可选的内置图标。 */
  icon?: IconName
  /** 禁止选择此项。 */
  disabled?: boolean
}

/** 步骤选项，以数组索引标识当前位置，不需要额外的 value。 */
export type StepOption = Omit<Option, 'value'>

/** 菜单选项；添加 children 即为子菜单，只有叶子项触发选择。 */
export interface MenuOption extends Option {
  /** 子菜单选项；同一菜单树中的 value 应保持唯一。 */
  children?: MenuOption[]
}

/** 列表与菜单的选择模式。 */
export type ListMode = 'normal' | 'single' | 'multiple'

/** 图片预览项；字符串图片地址也可直接用于 images。 */
export interface ImagePreviewItem {
  /** 图片地址，交给浏览器加载。 */
  src: string;
  /** 图片替代文字，同时作为预览说明。 */
  alt?: string;
}

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
  delayTouchDown?: number;
  /** 从触摸按下起算的最短反馈毫秒数，抬起时只补剩余时间；核心默认 0。 */
  delayTouchUp?: number;
}
/** 原生创建选项，框架适配层复用同一个元素与插槽出口。 */
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
