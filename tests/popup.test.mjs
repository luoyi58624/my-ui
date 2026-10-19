import '../packages/core/my-ui.js'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

async function load(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } })
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'))
}
const { createPopupStore } = globalThis.MyUI.utils
const { isListSelected, selectListValue } = globalThis.MyUI.utils
const alert = { kind: 'alert', options: { title: '确认' } }

test('窗口先进入关闭状态，提交渲染后才返回结果，重复关闭不覆盖确认值', async () => {
  let finishFlush
  const store = createPopupStore(() => new Promise(resolve => { finishFlush = resolve }), 5)
  let entries = []
  const detach = store.attach(value => { entries = value })
  const handle = store.show(alert)
  let resolved = false
  handle.closed.then(() => { resolved = true })
  handle.close(true)
  handle.close(false)
  assert.equal(entries[0].open, false)
  await Promise.resolve()
  assert.equal(resolved, false)
  finishFlush()
  assert.equal(await handle.closed, true)
  detach()
})

test('嵌套弹层各自返回结果，关闭顶层保留下层，退出后移除内容', async () => {
  const store = createPopupStore(() => Promise.resolve(), 5)
  let entries = []
  const detach = store.attach(value => { entries = value })
  const sheet = store.show({ kind: 'sheet', options: { title: '自定义', content: () => null } })
  const confirm = store.show(alert)
  confirm.close(false)
  assert.equal(await confirm.closed, false)
  assert.equal(entries[0].open, true)
  assert.equal(entries[1].open, false)
  await new Promise(resolve => setTimeout(resolve, 15))
  assert.equal(entries.length, 1)
  sheet.close(['a', 'b'])
  assert.deepEqual(await sheet.closed, ['a', 'b'])
  await new Promise(resolve => setTimeout(resolve, 15))
  assert.deepEqual(entries, [])
  detach()
})

test('CSS 动画接管清理时保留退出内容，只在对应动画完成后移除', async () => {
  const store = createPopupStore(() => Promise.resolve(), null)
  let entries = []
  const detach = store.attach(value => { entries = value })
  const lower = store.show(alert)
  const upper = store.show(alert)
  const [lowerId, upperId] = entries.map(entry => entry.id)
  upper.close(true)
  assert.equal(await upper.closed, true)
  await new Promise(resolve => setTimeout(resolve, 15))
  assert.equal(entries.length, 2)
  assert.equal(entries[1].open, false)
  store.finish(lowerId)
  assert.equal(entries.length, 2)
  store.finish(upperId)
  assert.deepEqual(entries.map(entry => entry.id), [lowerId])
  lower.close(false)
  assert.equal(await lower.closed, false)
  store.finish(lowerId)
  assert.deepEqual(entries, [])
  detach()
})

test('宿主卸载结束所有等待、清除退出任务，旧句柄不影响重新挂载', async () => {
  const store = createPopupStore(() => Promise.resolve(), 5)
  assert.throws(() => store.show(alert), /Popup/)
  const detach = store.attach(() => {})
  assert.throws(() => store.attach(() => {}), /一个/)
  const old = store.show(alert)
  const leaving = store.show(alert)
  leaving.close()
  detach()
  assert.equal(await old.closed, undefined)
  assert.equal(await leaving.closed, undefined)
  let entries = []
  const detachAgain = store.attach(value => { entries = value })
  const current = store.show(alert)
  old.close(true)
  await new Promise(resolve => setTimeout(resolve, 15))
  assert.equal(entries.length, 1)
  assert.equal(entries[0].open, true)
  current.close()
  await current.closed
  detachAgain()
})

test('列表普通模式不改值，单选不可取消，多选可以清空且不修改输入数组', () => {
  const selected = ['a', 'b']
  assert.equal(isListSelected('normal', selected, 'a'), false)
  assert.equal(selectListValue('normal', selected, 'c'), selected)
  assert.equal(selectListValue('single', 'a', 'a'), 'a')
  assert.equal(selectListValue('single', selected, 'c'), 'c')
  assert.equal(isListSelected('single', selected, 'a'), false)
  assert.equal(isListSelected('multiple', 'a', 'a'), false)
  assert.deepEqual(selectListValue('multiple', selected, 'a'), ['b'])
  assert.deepEqual(selected, ['a', 'b'])
  assert.deepEqual(selectListValue('multiple', ['a'], 'a'), [])
  assert.deepEqual(selectListValue('multiple', undefined, 'a'), ['a'])
})
