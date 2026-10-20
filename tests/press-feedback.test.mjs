import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

// 使用真实核心函数和可控时钟，定向验证取消与延迟边界，不向组件库暴露测试接口。
const source = ts.createSourceFile('my-ui.js', readFileSync(new URL('../packages/core/my-ui.js', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true)
let implementation
function find(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'bindPressFeedback') implementation = node.getText(source)
  ts.forEachChild(node, find)
}
find(source)
assert.ok(implementation)

class Target extends EventTarget {
  listeners = new Map()
  attributes = new Map()
  isConnected = true
  disabled = false
  addEventListener(type, callback, options) {
    super.addEventListener(type, callback, options)
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type).add(callback)
  }
  removeEventListener(type, callback, options) {
    super.removeEventListener(type, callback, options)
    this.listeners.get(type)?.delete(callback)
  }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0) }
  setAttribute(name, value) { this.attributes.set(name, value) }
  getAttribute(name) { return this.attributes.get(name) ?? null }
  removeAttribute(name) { this.attributes.delete(name) }
  hasAttribute(name) { return this.attributes.has(name) }
  toggleAttribute(name, active) { active ? this.setAttribute(name, '') : this.removeAttribute(name) }
  getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100 } }
}

function harness(options = {}) {
  const document = new Target(), window = new Target(), element = new Target(), tasks = new Map()
  let clock = 0, nextId = 0
  const bind = runInNewContext(`(() => { const pressBindings = new WeakMap(); ${implementation}; return bindPressFeedback })()`, {
    document, window,
    setTimeout: (callback, delay) => { tasks.set(++nextId, { callback, time: clock + delay }); return nextId },
    clearTimeout: id => tasks.delete(id),
  })
  const binding = bind(element, options)
  const event = (target, type, values = {}) => {
    const event = new Event(type, { cancelable: true })
    Object.assign(event, { pointerType: 'touch', pointerId: 7, isPrimary: true, button: 0, clientX: 50, clientY: 50 }, values)
    target.dispatchEvent(event)
    return event
  }
  const advance = ms => {
    clock += ms
    for (const [id, task] of [...tasks]) if (task.time <= clock) { tasks.delete(id); task.callback() }
  }
  return { document, window, element, binding, bind, event, advance, tasks,
    down: values => { event(document, 'pointerdown', values); return event(element, 'pointerdown', values) },
    pressed: () => element.hasAttribute('data-my-pressed'),
    globalListeners: () => document.listenerCount + window.listenerCount,
  }
}

test('默认即时反馈，不阻止默认行为或代发点击，抬起撤销反馈', () => {
  const h = harness(); let clicks = 0
  h.element.addEventListener('click', () => clicks++)
  assert.equal(h.down().defaultPrevented, false)
  assert.equal(h.pressed(), true)
  h.event(h.document, 'pointerup')
  assert.equal(h.pressed(), false)
  assert.equal(h.element.hasAttribute('data-my-press-input'), true)
  assert.equal(h.globalListeners(), 0)
  assert.equal(clicks, 0)
  h.event(h.element, 'click'); assert.equal(clicks, 1)
})

test('50ms 只延迟触摸，鼠标、手写笔与键盘不等待', () => {
  const h = harness({ delayTouchActive: () => 50 })
  h.down(); h.advance(49); assert.equal(h.pressed(), false)
  h.advance(1); assert.equal(h.pressed(), true)
  h.event(h.document, 'pointerup')
  h.down({ pointerType: 'pen' }); assert.equal(h.pressed(), true)
  h.event(h.document, 'pointerup')
  h.down({ pointerType: 'mouse' })
  assert.equal(h.element.hasAttribute('data-my-press-input'), false)
  assert.equal(h.tasks.size, 0)
  h.down(); h.event(h.element, 'keydown', { key: ' ' }); h.advance(100)
  assert.equal(h.pressed(), false)
  assert.equal(h.element.hasAttribute('data-my-press-input'), false)
})

test('等待和激活期间的所有取消路径都清除计时器与临时监听', () => {
  const cancellations = [
    h => h.event(h.document, 'pointerup'),
    h => h.event(h.document, 'pointercancel'),
    h => h.event(h.element, 'lostpointercapture'),
    h => h.event(h.document, 'pointermove', { clientX: 61 }),
    h => h.event(h.document, 'scroll'),
    h => h.event(h.window, 'blur'),
    h => { h.document.hidden = true; h.event(h.document, 'visibilitychange') },
    h => h.event(h.document, 'pointerdown', { pointerId: 8 }),
  ]
  for (const active of [false, true]) for (const cancel of cancellations) {
    const h = harness({ delayTouchActive: () => 50 })
    h.down(); if (active) h.advance(50)
    cancel(h); h.advance(100)
    assert.equal(h.pressed(), false)
    assert.equal(h.tasks.size, 0)
    assert.equal(h.globalListeners(), 0)
  }
})

test('轻微移动与无关指针抬起保留当前按压，越界后取消', () => {
  const h = harness({ delayTouchActive: () => 50 })
  h.down({ clientX: 98 }); h.event(h.document, 'pointermove', { clientX: 99 })
  h.event(h.document, 'pointerup', { pointerId: 9 }); h.advance(50)
  assert.equal(h.pressed(), true)
  h.event(h.document, 'pointermove', { clientX: 101 })
  assert.equal(h.pressed(), false)
})

test('短按和快速连续按压不补播；重复增强后读取最新配置', () => {
  const h = harness({ delayTouchActive: () => 50 })
  h.down(); h.advance(20); h.event(h.document, 'pointerup'); h.advance(100)
  assert.equal(h.pressed(), false)
  assert.equal(h.bind(h.element, { delayTouchActive: () => 0 }), h.binding)
  h.down(); assert.equal(h.pressed(), true)
  h.event(h.document, 'pointercancel'); h.advance(100)
  assert.equal(h.pressed(), false)
  assert.equal(h.element.listenerCount, 3)
})

test('禁用、不可交互、脱离文档和销毁都不会在等待结束后激活', () => {
  for (const cancel of [
    h => { h.element.disabled = true },
    h => h.element.setAttribute('aria-disabled', 'true'),
    h => h.binding.configure({ accepts: () => false }),
    h => { h.element.isConnected = false },
    h => h.binding.destroy(),
  ]) {
    const h = harness({ delayTouchActive: () => 50 }); h.down(); cancel(h); h.advance(100)
    assert.equal(h.pressed(), false)
    assert.equal(h.globalListeners(), 0)
  }
  const h = harness({ accepts: () => false }); h.down()
  assert.equal(h.pressed(), false); assert.equal(h.globalListeners(), 0)
})

test('非法延迟回退即时反馈，非主指针与右键不激活', () => {
  for (const delay of [-1, NaN, Infinity]) {
    const h = harness({ delayTouchActive: () => delay }); h.down(); assert.equal(h.pressed(), true)
  }
  for (const values of [{ isPrimary: false }, { button: 2 }]) {
    const h = harness(); h.down(values); assert.equal(h.pressed(), false); assert.equal(h.globalListeners(), 0)
  }
})

test('重复按压和卸载后不积累监听，销毁后旧节点不再响应', () => {
  const h = harness({ delayTouchActive: () => 50 })
  for (let index = 0; index < 100; index++) {
    h.down(); h.advance(50); h.event(h.document, 'pointerup')
    assert.equal(h.globalListeners(), 0); assert.equal(h.element.listenerCount, 3)
  }
  h.binding.destroy(); h.down(); h.advance(100)
  assert.equal(h.pressed(), false); assert.equal(h.element.listenerCount, 0)
  assert.equal(h.element.attributes.size, 0)
})
