import '../lib/my-ui.js'
import assert from 'node:assert/strict'
import test from 'node:test'

const { pickerState, pickerIndex } = MyUI.utils
const options = [{ value: 0, label: '零' }, { value: 1, label: '一', disabled: true }, { value: 2, label: '二' }, { value: '3', label: '三' }]

test('单列保持数值零与字符串类型，失效值回退到首个可用项', () => {
  assert.equal(pickerState(options, undefined, 0).value, 0)
  assert.equal(pickerState(options, undefined, '3').value, '3')
  assert.equal(pickerState(options, undefined, 1).value, 0)
  assert.equal(pickerState([], undefined, 9).value, null)
  assert.equal(pickerState(options.map(item => ({ ...item, disabled: true }))).value, null)
})
test('独立多列可复用同一个选项数组，空列保留位置且不修改传入值', () => {
  const value = [2, 0, 8], before = structuredClone(value)
  const resolved = pickerState([], [options, options, []], value)
  assert.equal(resolved.multiple, true)
  assert.deepEqual(resolved.value, [2, 0, null])
  assert.deepEqual(value, before)
  assert.deepEqual(pickerState(options, [], value).value, [])
})
test('级联保留有效的后续值，父项改变时修正无效子项并裁掉旧路径', () => {
  const tree = [
    { value: 'a', label: 'A', children: [{ value: 'same', label: '相同', children: [{ value: 0, label: '零' }] }] },
    { value: 'b', label: 'B', children: [{ value: 'disabled', disabled: true }, { value: 'same', label: '相同', children: [{ value: 9, label: '九' }] }] },
    { value: 'leaf', label: '叶子' },
  ]
  const before = structuredClone(tree)
  assert.deepEqual(pickerState(tree, undefined, ['b', 'same', 0]).value, ['b', 'same', 9])
  assert.deepEqual(pickerState(tree, undefined, ['leaf', 'same', 9]).value, ['leaf'])
  assert.deepEqual(pickerState(tree, undefined, ['a', 'same', 0]).value, ['a', 'same', 0])
  assert.deepEqual(tree, before)
})
test('空级联分支保留空列，全禁用父列不尝试访问子项', () => {
  assert.deepEqual(pickerState([{ value: 0, children: [] }], undefined, [0]).value, [0, null])
  assert.deepEqual(pickerState([{ value: 0, disabled: true, children: options }]).value, [null])
})
test('居中吸附跳过禁用项，中点选择后一项，越界仍找到合法边界', () => {
  for (const [position, index] of [[-10, 0], [.9, 0], [1, 2], [1.1, 2], [2.5, 3], [100, 3]]) assert.equal(pickerIndex(options, position), index)
  assert.equal(pickerIndex([], 0), -1)
  assert.equal(pickerIndex([{ disabled: true }], 0), -1)
})
