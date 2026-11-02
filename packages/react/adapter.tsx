import React, { createElement, useLayoutEffect, useRef, useState, useReducer, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import type { NativeController } from '../../lib/my-ui'
import type { ComponentHandle, SlotContent, SlotScope } from './types'
import '../../lib/my-ui.js'

type Properties = Record<string, any>
type Definition = { name: string; properties: string[]; events: string[]; model?: boolean }
type Outlet = { key: string; name: string; container: HTMLElement; scope: SlotScope }
const tags: Record<string, string> = {
  Icon: 'svg', Button: 'button', Tag: 'span', Avatar: 'span', Badge: 'span',
  Loading: 'span', Tooltip: 'span', Switch: 'input', Radio: 'label', Checkbox: 'label',
  RadioGroup: 'fieldset', CheckboxGroup: 'fieldset', Choices: 'fieldset', Form: 'form',
  Card: 'article', AppBar: 'header', Steps: 'ol', ListRow: 'button',
  Navigation: 'nav', Tabbar: 'nav',
}
const aliases: Record<string, string> = {
  readOnly: 'readonly', maxLength: 'maxlength', autoComplete: 'autocomplete', inputMode: 'inputmode',
}
const callbackName = (event: string) => event === 'open' ? 'onOpenChange'
  : event === 'indeterminate' ? 'onIndeterminateChange'
  : 'on' + event.replace(/(^|-)([a-z])/g, (_, _prefix, letter: string) => letter.toUpperCase())
const attributeName = (key: string) => key === 'className' ? 'class' : key === 'htmlFor' ? 'for'
  : key.replace(/^onDoubleClick/, 'onDblClick').replace(/^on(Got|Lost)PointerCapture/, (_, kind: string) => `on${kind}pointercapture`)
const same = (a: Properties, b: Properties) => Object.keys(a).length === Object.keys(b).length
  && Object.keys(a).every(key => Object.is(a[key], b[key]))
let committing = 0
function duringCommit<T>(run: () => T): T {
  committing++
  try { return run() } finally { committing-- }
}

function slotsOf(props: Properties): Record<string, SlotContent> {
  return { ...props.slots, ...('children' in props && props.children !== undefined ? { default: props.children } : {}) }
}

/** React 只管理属性和 Portal 内容，结构、交互与清理由原生组件负责。 */
export function createComponent<P>(definition: Definition): (props: P) => React.ReactElement {
  const propertyNames = new Set(definition.properties)
  const eventNames = new Set(definition.events)
  function Component(input: P) {
    const props = input as Properties
    const tag = definition.name === 'Tag' && typeof (props.value ?? props.defaultValue) === 'boolean' ? 'button'
      : definition.name === 'ListRow' && props.toggle ? 'label' : tags[definition.name] ?? 'div'
    const host = useRef<Element | null>(null)
    const controller = useRef<NativeController | null>(null)
    const committed = useRef(props)
    const current = useRef({ properties: {} as Properties, attributes: {} as Properties, names: [] as string[] })
    const active = useRef(false)
    const containers = useRef(new WeakMap<Element, { container: HTMLElement; key: string }>())
    const sequence = useRef(0)
    const [outlets, setOutlets] = useState<Outlet[]>([])
    const dirty = useRef(new Set<string>())
    const [, syncControlled] = useReducer(version => version + 1, 0)

    const refresh = () => {
      if (!active.current || !controller.current) return
      const next = [...controller.current.outlets.values()].map(outlet => {
        let record = containers.current.get(outlet.target)
        if (!record) {
          const container = document.createElement('span')
          container.className = 'my-slot'
          record = { container, key: String(++sequence.current) }
          containers.current.set(outlet.target, record)
        }
        // 原生核心可以清空出口，独立容器让 React 仍能安全卸载自己的节点。
        if (record.container.parentElement !== outlet.target) outlet.target.append(record.container)
        return { ...record, name: outlet.name, scope: { ...outlet.scope } }
      })
      setOutlets(previous => previous.length === next.length && previous.every((outlet, index) =>
        outlet.key === next[index].key && outlet.name === next[index].name && same(outlet.scope, next[index].scope)) ? previous : next)
    }

    const separate = (initial: boolean) => {
      const properties: Properties = {}, attributes: Properties = {}
      for (const [key, value] of Object.entries(committed.current)) {
        if (['children', 'slots', 'ref', 'defaultValue'].includes(key) || eventNames.has(key)) continue
        const nativeKey = aliases[key] ?? key
        if (propertyNames.has(nativeKey)) {
          if (!(definition.model && nativeKey === 'value' && value === undefined)) properties[nativeKey] = value
        } else attributes[attributeName(key)] = value
      }
      if (initial && definition.model && committed.current.value === undefined && committed.current.defaultValue !== undefined)
        properties.value = committed.current.defaultValue
      return { properties, attributes, names: Object.keys(slotsOf(committed.current)).filter(name => slotsOf(committed.current)[name] !== undefined).sort() }
    }

    const emit = (event: string, ...args: any[]) => {
      const callback = committed.current[callbackName(event)]
      if (typeof callback === 'function') callback(...args)
      const key = event === 'change' && definition.model ? 'value' : event === 'open' ? 'open'
        : event === 'indeterminate' ? 'indeterminate' : null
      if (key && committed.current[key] !== undefined && active.current && !committing) {
        // 与父级状态回写一起进入 React 提交，避免提前回退旧值中止正在开始的上传。
        dirty.current.add(key)
        syncControlled()
      }
    }

    useLayoutEffect(() => {
      committed.current = props
      active.current = true
      // StrictMode 会重放挂载，旧出口容器已独立保存 React 子节点。
      host.current!.replaceChildren()
      containers.current = new WeakMap()
      const initial = separate(true)
      current.current = initial
      controller.current = duringCommit(() => globalThis.MyUI.create(definition.name, initial.properties, {
        element: host.current!, attributes: initial.attributes, externalSlots: true,
        slotNames: initial.names, emit, invalidate: refresh,
      }))
      refresh()
      return () => {
        active.current = false
        duringCommit(() => controller.current?.destroy())
        controller.current = null
      }
    }, [tag])

    useLayoutEffect(() => {
      committed.current = props
      const next = separate(false), previous = current.current
      if (!same(previous.properties, next.properties) || !same(previous.attributes, next.attributes)
        || previous.names.join('\0') !== next.names.join('\0') || dirty.current.size) {
        const patch = { ...next.properties }
        for (const key of Object.keys(previous.properties)) {
          if (!(key in patch) && !(definition.model && key === 'value')) patch[key] = undefined
        }
        current.current = next
        dirty.current.clear()
        duringCommit(() => controller.current?.update(patch, next.attributes, next.names))
      }
    })

    useImperativeHandle(props.ref, () => {
      const handle: ComponentHandle & Properties = { get element() { return controller.current?.element ?? null } }
      for (const name of ['show', 'close', 'toggle', 'focus', 'select', 'updatePosition', 'refresh', 'retry', 'choose', 'addFiles', 'submit', 'abort', 'remove']) {
        handle[name] = (...args: any[]) => {
          const instance = controller.current, method = instance?.exposed[name]
          if (method) return method(...args)
          if (name === 'refresh') return false
        }
      }
      return handle
    }, [tag])

    const slots = slotsOf(props)
    // React 会在 input 更新时重置 type/name，宿主需保留原生开关的结构属性。
    const hostProps = tag === 'input' ? { ref: host, type: 'checkbox', name: props.name } : { ref: host }
    return createElement(tag, hostProps, ...outlets.map(outlet => {
      const content = slots[outlet.name]
      return createPortal(typeof content === 'function' ? content(outlet.scope) : content, outlet.container, outlet.key)
    }))
  }
  Component.displayName = definition.name
  return Component
}
