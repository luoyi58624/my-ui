import React, { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import type { NativePopupHandle, NativePopupOptions } from '../../lib/my-ui'
import type { PopupProps } from './types'
import '../../lib/my-ui.js'

/** 内容可以结束当前弹层并返回业务结果。 */
export interface PopupContext<T = unknown> {
  /** 关闭窗口并返回选中的结果。 */
  close(value?: T): void
}
/** 使用 JSX 构建弹层内容，Context 由可选的 Popup 宿主保留。 */
export type PopupContent<T = unknown> = (context: PopupContext<T>) => ReactNode
/** 弹层的关闭方法和结果 Promise，沿用原生核心。 */
export type PopupHandle<T = unknown> = NativePopupHandle<T>
/** 确认提示框的文本和窗口选项。 */
export type AlertOptions = Pick<NativePopupOptions,
  'title' | 'message' | 'center' | 'cancelText' | 'confirmText' | 'danger' | 'style' | 'closeOnBackdrop' | 'closeOnEscape'>
/** 底部面板选项，动态内容通过 JSX 提供。 */
export type SheetOptions<T = unknown> = Pick<NativePopupOptions,
  'title' | 'cancelText' | 'confirmText' | 'danger' | 'swipeable' | 'onConfirm' | 'style' | 'closeOnBackdrop' | 'closeOnEscape'> & {
    /** 通过 close 返回业务选择。 */
    content: PopupContent<T>
  }
/** 四向抽屉选项，与面板共用 JSX 内容接口。 */
export type DrawerOptions<T = unknown> = Pick<NativePopupOptions,
  'title' | 'placement' | 'swipeable' | 'style' | 'closeOnBackdrop' | 'closeOnEscape'> & {
    /** 抽屉的 JSX 内容。 */
    content: PopupContent<T>
  }

type Entry = { id: number; container: Element; content: ReactNode }
type Host = {
  active: boolean
  handles: Set<NativePopupHandle<unknown>>
  add(entry: Entry): void
  remove(id: number): void
}
const hosts: Host[] = []
let nextId = 0

/** 放在 Context Provider 内，为命令式弹层保留 React 上下文；不生成额外可见容器。 */
export function Popup({ children }: PopupProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const owner = useRef<Host>({
    active: false,
    handles: new Set(),
    add(entry) { if (this.active) setEntries(previous => [...previous, entry]) },
    remove(id) { if (this.active) setEntries(previous => previous.filter(entry => entry.id !== id)) },
  })
  useLayoutEffect(() => {
    const host = owner.current
    host.active = true
    hosts.push(host)
    return () => {
      host.active = false
      const index = hosts.indexOf(host)
      if (index >= 0) hosts.splice(index, 1)
      for (const handle of host.handles) handle.close()
      host.handles.clear()
    }
  }, [])
  return <>{children}{entries.map(entry => createPortal(entry.content, entry.container, String(entry.id)))}</>
}

function show<T>(kind: 'showSheet' | 'showDrawer', options: SheetOptions<T> | DrawerOptions<T>): PopupHandle<T> {
  const owner = hosts.at(-1)
  const { content, ...rest } = options
  const handle = globalThis.MyUI.popup[kind]<T>({
    ...rest,
    renderContent(target, controls) {
      const container = document.createElement('span')
      container.className = 'my-slot'
      target.append(container)
      const Content = () => content(controls)
      if (owner?.active) {
        const id = ++nextId
        owner.add({ id, container, content: <Content /> })
        return () => owner.remove(id)
      }
      const root = createRoot(container)
      root.render(<Content />)
      // closeAll 也可能在其他组件的清理阶段调用，独立根在当前提交后卸载。
      return () => queueMicrotask(() => root.unmount())
    },
  })
  if (owner?.active) {
    owner.handles.add(handle as NativePopupHandle<unknown>)
    void handle.closed.then(() => owner.handles.delete(handle as NativePopupHandle<unknown>))
  }
  return handle
}

/** React 弹层只渲染 JSX；窗口、焦点、手势和动画由原生核心负责。 */
export const popup = {
  /** 显示文本确认框，返回是否确认。 */
  showAlert(options: AlertOptions): Promise<boolean> {
    return globalThis.MyUI.popup.showAlert(options)
  },
  /** 展示 JSX 底部面板，结果通过 closed 返回。 */
  showSheet<T = unknown>(options: SheetOptions<T>): PopupHandle<T> {
    return show('showSheet', options)
  },
  /** 展示 JSX 抽屉。 */
  showDrawer<T = unknown>(options: DrawerOptions<T>): PopupHandle<T> {
    return show('showDrawer', options)
  },
  /** 释放当前原生核心的所有 API 弹层。 */
  closeAll(): void {
    globalThis.MyUI.popup.closeAll()
  },
}
