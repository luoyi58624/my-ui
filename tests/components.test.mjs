import '../lib/my-ui.js'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

async function load(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } })
  return await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'))
}
const { resolveTab, navigateTab } = globalThis.MyUI.utils
const { validateProfile } = await load('../examples/vue/src/pages/home/scenarios/profile.ts')
const { updateSelection } = globalThis.MyUI.utils
const options = [{ value: 'recent', label: '最近' }, { value: 'favorites', label: '收藏' }, { value: 'archive', label: '归档', disabled: true }, { value: 'preferences', label: '偏好' }]

test('页签保持合法选择，失效值与禁用值回退到首个可用项', () => {
  assert.equal(resolveTab(options, 'favorites')?.value, 'favorites')
  assert.equal(resolveTab(options, 'archive')?.value, 'recent')
  assert.equal(resolveTab(options, 'missing')?.value, 'recent')
  assert.equal(resolveTab([], 'recent'), undefined)
  assert.equal(resolveTab(options.map(item => ({ ...item, disabled: true })), 'recent'), undefined)
})
test('键盘页签跳过禁用项，支持首尾循环及 Home、End', () => {
  assert.equal(navigateTab(options, 'favorites', 'ArrowRight')?.value, 'preferences')
  assert.equal(navigateTab(options, 'preferences', 'ArrowLeft')?.value, 'favorites')
  assert.equal(navigateTab(options, 'preferences', 'ArrowRight')?.value, 'recent')
  assert.equal(navigateTab(options, 'recent', 'ArrowLeft')?.value, 'preferences')
  assert.equal(navigateTab(options, 'favorites', 'Home')?.value, 'recent')
  assert.equal(navigateTab(options, 'favorites', 'End')?.value, 'preferences')
  assert.equal(navigateTab(options, 'recent', 'Tab'), undefined)
  assert.equal(navigateTab([], 'recent', 'ArrowRight'), undefined)
})
test('资料校验分别报告必填和格式错误，不影响其他字段', () => {
  assert.deepEqual(validateProfile({ name: ' ', email: '' }), { name: '请填写显示名称', email: '请填写联系邮箱' })
  assert.deepEqual(validateProfile({ name: '蓝', email: 'lan@example.com' }), { name: '显示名称至少需要 2 个字符' })
  for (const email of ['example.com', 'lan@@example.com', 'lan @example.com', 'lan@example']) assert.deepEqual(validateProfile({ name: '小蓝', email }), { email: '请输入有效的邮箱地址' })
  assert.deepEqual(validateProfile({ name: ' 小蓝 ', email: ' lan@example.com ' }), {})
  assert.deepEqual(validateProfile({ name: '😀蓝', email: 'lan+notes@example.com' }), {})
})

test('标签单选始终保留一个值，多选支持新增、取消与重复值处理', () => {
  assert.equal(updateSelection('cloud', 'music', true), 'music')
  assert.equal(updateSelection('music', 'music', false), 'music')
  const selected = ['cloud']
  assert.deepEqual(updateSelection(selected, 'music', true), ['cloud', 'music'])
  assert.deepEqual(selected, ['cloud'])
  assert.deepEqual(updateSelection(['cloud', 'music'], 'cloud', false), ['music'])
  assert.deepEqual(updateSelection(['cloud', 'cloud'], 'cloud', true), ['cloud'])
  assert.deepEqual(updateSelection(['cloud', 'cloud'], 'cloud', false), [])
  assert.deepEqual(updateSelection([], 'music', false), [])
})
