/** 存储适配器允许同步或异步操作，值统一采用 JSON 字符串。 */
export interface SharedStateStorage {
  /** 读取字段，缺失时返回 null。 */
  getItem(key: string): string | null | Promise<string | null>
  /** 保存字段，成功后应通知同一存储区的订阅者。 */
  setItem(key: string, value: string): void | Promise<void>
  /** 删除字段，订阅者会恢复该字段的初始值。 */
  removeItem(key: string): void | Promise<void>
  /** 订阅变更；key 为 null 表示整个存储区被清空。 */
  subscribe(listener: (key: string | null) => void): (() => void) | Promise<() => void>
  /** 等待实际落盘，浏览器同步存储可省略。 */
  flush?(): void | Promise<void>
}

/** 每个 store 的共享范围；嵌套对象与数组作为所属顶层字段整体同步。 */
export interface SharedStoreOptions {
  /** 存储名称，默认使用 store.$id。 */
  key?: string
  /** 只持久化这些顶层字段，默认使用全部初始状态字段。 */
  pick?: readonly string[]
}

/** 全局共享插件配置，普通网页默认使用 localStorage。 */
export interface SharedStatePluginOptions {
  /** Tauri 或自定义后端的存储适配器。 */
  storage?: SharedStateStorage
  /** 存储键前缀，默认 my-ui:state:。 */
  prefix?: string
  /** 读取、序列化或保存失败时通知宿主，内存中的编辑会保留。 */
  onError?: (error: Error, storeId: string) => void
}

/** 只有启用了 shared 的 store 才拥有此控制入口。 */
export interface SharedStateControls {
  /** 首次恢复完成；失败详情读取 error，不产生未处理的拒绝。 */
  readonly ready: Promise<void>
  /** 最近一次同步错误，成功刷新或保存后清除。 */
  readonly error: Error | null
  /** 等待待保存字段落盘，失败时拒绝，可再次调用重试。 */
  flush(): Promise<void>
  /** 重新读取缓存，不覆盖当前尚未成功保存的本地编辑。 */
  refresh(): Promise<void>
}
