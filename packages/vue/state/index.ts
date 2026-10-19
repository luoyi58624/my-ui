import { markRaw, onScopeDispose, shallowRef } from 'vue'
import type { PiniaPlugin, StateTree } from 'pinia'
import { createWebStateStorage } from './web'
import type { SharedStateControls, SharedStatePluginOptions, SharedStateStorage, SharedStoreOptions } from './types'

export { createWebStateStorage } from './web'
export type { SharedStateControls, SharedStatePluginOptions, SharedStateStorage, SharedStoreOptions } from './types'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    /** 开启本地持久化与跨页面同步，可按顶层字段缩小共享范围。 */
    shared?: boolean | (Omit<SharedStoreOptions, 'pick'> & { pick?: readonly Extract<keyof S, string>[] })
  }
  export interface PiniaCustomProperties {
    /** shared 为 true 时提供恢复、刷新、落盘与错误状态。 */
    readonly $shared?: SharedStateControls
  }
}

/** 构造某个顶层字段的存储键，供非 Pinia 代码通过同一适配器修改数据。 */
export function sharedStateKey(storeId: string, field: string, prefix = 'my-ui:state:'): string {
  return prefix + encodeURIComponent(storeId) + ':' + encodeURIComponent(field)
}

function encode(value: unknown): string {
  return JSON.stringify(value, function (key, item) {
    const original: unknown = this[key]
    if (original !== null && typeof original === 'object' && !Array.isArray(original)) {
      const prototype = Object.getPrototypeOf(original)
      if (prototype !== Object.prototype && prototype !== null) throw new TypeError('共享状态只支持 JSON 数据，请将日期等对象转换成普通值')
    }
    if (['undefined', 'function', 'symbol', 'bigint'].includes(typeof item) || (typeof item === 'number' && !Number.isFinite(item))) {
      throw new TypeError('共享状态不能包含 undefined、函数、Symbol、BigInt 或非有限数字')
    }
    return item
  })
}

/** Pinia 共享插件；在 defineStore 中设置 shared: true 后自动恢复、持久化和同步。 */
export function createSharedStatePlugin(config: SharedStatePluginOptions = {}): PiniaPlugin {
  let storage = config.storage
  return ({ store, options }) => {
    if (!options.shared || (!storage && typeof window === 'undefined')) return
    storage ??= createWebStateStorage()
    const backend: SharedStateStorage = storage
    const settings = typeof options.shared === 'object' ? options.shared : {}
    const fields = [...new Set(settings.pick ?? Object.keys(store.$state))]
    const defaults = new Map<string, string>()
    const keys = new Map<string, string>()
    for (const field of fields) {
      if (!Object.hasOwn(store.$state, field) || ['__proto__', 'prototype', 'constructor'].includes(field)) {
        throw new Error(`共享字段不存在或不可用：${store.$id}.${field}`)
      }
      defaults.set(field, encode(store.$state[field]))
      keys.set(sharedStateKey(settings.key ?? store.$id, field, config.prefix), field)
    }
    const seen = new Map(defaults)
    const dirty = new Map<string, string>()
    const revisions = new Map<string, number>()
    const reads = new Map<string, number>()
    const invalid = new Map<string, Error>()
    const lastError = shallowRef<Error | null>(null)
    let disposed = false, applying = false, initializing = true
    let unlisten: (() => void) | undefined
    let connecting: Promise<void> | undefined
    let writing: Promise<void> | undefined

    function report(reason: unknown): Error {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      lastError.value = error
      try { config.onError?.(error, store.$id) } catch { /* 宿主的错误回调不打断状态更新。 */ }
      return error
    }

    function disconnect(stop: () => void) {
      try { void Promise.resolve(stop()).catch(report) }
      catch (error) { report(error) }
    }

    async function pull(field: string): Promise<void> {
      if (disposed || dirty.has(field) || invalid.has(field)) return
      const generation = (reads.get(field) ?? 0) + 1
      reads.set(field, generation)
      const revision = revisions.get(field)
      const raw = await backend.getItem(sharedStateKey(settings.key ?? store.$id, field, config.prefix))
      // 本地编辑与较新的读取优先，初始缓存或后台旧通知不能覆盖它们。
      if (disposed || dirty.has(field) || invalid.has(field) || revisions.get(field) !== revision || reads.get(field) !== generation) return
      const value = raw === null ? defaults.get(field)! : encode(JSON.parse(raw))
      if (seen.get(field) === value) return
      seen.set(field, value)
      invalid.delete(field)
      applying = true
      try { store.$patch(state => { state[field] = JSON.parse(value) }) }
      finally { applying = false }
    }

    function changed(key: string | null) {
      if (disposed) return
      const targets = key === null ? fields : keys.has(key) ? [keys.get(key)!] : []
      // 重新读当前缓存，不使用可能已过期的事件载荷。
      for (const field of targets) void pull(field).catch(report)
    }

    async function connect(): Promise<void> {
      if (disposed || unlisten) return
      if (!connecting) {
        connecting = Promise.resolve().then(() => backend.subscribe(changed)).then(stop => {
          if (disposed) disconnect(stop)
          else unlisten = stop
        }).finally(() => { connecting = undefined })
      }
      await connecting
    }

    async function readAll(): Promise<void> {
      await connect()
      const results = await Promise.allSettled(fields.map(pull))
      const failure = results.find(result => result.status === 'rejected')
      if (failure?.status === 'rejected') throw failure.reason
    }

    async function save(): Promise<void> {
      // 每个顶层字段独立排队，既合并连续编辑，也避免整份 store 相互覆盖。
      while (!disposed && dirty.size) {
        for (const [field, value] of [...dirty]) {
          if (disposed) return
          await backend.setItem(sharedStateKey(settings.key ?? store.$id, field, config.prefix), value)
          if (dirty.get(field) === value) dirty.delete(field)
        }
      }
      // 自己的写入和并发写入也以存储中的最终值为准。
      if (!disposed) await readAll()
    }

    function enqueue(): Promise<void> {
      if (writing) return writing
      const task = Promise.resolve().then(save)
      writing = task
      void task.then(() => {
        writing = undefined
        if (!dirty.size && !invalid.size) lastError.value = null
        if (!disposed && dirty.size) void enqueue()
      }, error => { writing = undefined; report(error) })
      return task
    }

    const stopChanges = store.$subscribe(() => {
      if (applying || disposed) return
      for (const field of fields) {
        try {
          const value = encode(store.$state[field])
          invalid.delete(field)
          if (seen.get(field) === value) continue
          seen.set(field, value)
          revisions.set(field, (revisions.get(field) ?? 0) + 1)
          dirty.set(field, value)
        } catch (error) { invalid.set(field, report(error)) }
      }
      if (!initializing && dirty.size) void enqueue()
    }, { detached: true, flush: 'sync' })

    const ready = readAll().catch(report).then(() => {
      initializing = false
      if (!disposed && dirty.size) void enqueue()
    })

    async function refresh() {
      if (disposed) return
      await ready
      try {
        await readAll()
        if (!invalid.size && !dirty.size) lastError.value = null
      } catch (error) { throw report(error) }
    }

    async function flush() {
      if (disposed) return
      await ready
      try {
        if (invalid.size) throw invalid.values().next().value
        while (!disposed && (writing || dirty.size)) await (writing ?? enqueue())
        if (!disposed) await backend.flush?.()
        lastError.value = null
      } catch (error) { throw report(error) }
    }

    const resume = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') void refresh().catch(() => {})
    }
    const leave = () => { void flush().catch(() => {}) }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', resume)
      window.addEventListener('pageshow', resume)
      window.addEventListener('pagehide', leave)
      document.addEventListener('visibilitychange', resume)
    }
    onScopeDispose(() => {
      disposed = true
      stopChanges()
      if (unlisten) disconnect(unlisten)
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', resume)
        window.removeEventListener('pageshow', resume)
        window.removeEventListener('pagehide', leave)
        document.removeEventListener('visibilitychange', resume)
      }
    })

    const controls: SharedStateControls = markRaw({ ready, get error() { return lastError.value }, flush, refresh })
    return { $shared: controls }
  }
}
