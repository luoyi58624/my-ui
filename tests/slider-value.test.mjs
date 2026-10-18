import '../lib/my-ui.js'
import assert from 'node:assert/strict'
import test from 'node:test'

const { sliderScale } = globalThis.MyUI.utils

test('步长从 min 起算，小数、负值与不能整除的上界保持合法', () => {
  const decimal = sliderScale(-.3, .9, .2, true)
  assert.equal(decimal.normalize(.3), .3)
  assert.equal(decimal.normalize(-10), -.3)
  assert.equal(decimal.normalize(10), .9)
  assert.deepEqual(decimal.marks.map(point => point.value), [-.3, -.1, .1, .3, .5, .7, .9])
  const uneven = sliderScale(3, 55, 7, true)
  assert.equal(uneven.normalize(55), 52)
  assert.equal(uneven.normalize(17), 17)
  assert.ok(uneven.marks.every(point => point.value <= 55))
})
test('step=null 只选择显式刻度，排序去重并排除非法位置，不修改输入数组', () => {
  const marks = [{ value: 100 }, { value: 20, label: '旧' }, { value: 37 }, { value: -1 }, { value: NaN }, { value: 20, label: '20°C' }, { value: 0 }]
  const before = structuredClone(marks), scale = sliderScale(0, 100, null, marks)
  assert.deepEqual(scale.marks.map(point => point.value), [0, 20, 37, 100])
  assert.equal(scale.marks[1].label, '20°C')
  for (const [raw, expected] of [[-1, 0], [21, 20], [35, 37], [99, 100], [NaN, 0]]) assert.equal(scale.normalize(raw), expected)
  assert.deepEqual(marks, before)
})
test('自定义刻度仅负责展示，数值步长仍生效；空限制集与无效区间不可操作', () => {
  assert.equal(sliderScale(0, 100, 10, [{ value: 37 }]).normalize(37), 40)
  assert.equal(sliderScale(0, 100, null, []).disabled, true)
  assert.equal(sliderScale(20, 20, 1, true).disabled, true)
  assert.equal(sliderScale(20, -10, 1, true).disabled, true)
  assert.equal(sliderScale(0, 100, -1, false).normalize(37.4), 37)
})
test('极小步长限制自动绘制密度，仍按真实步长选值', () => {
  const scale = sliderScale(-.00000005, .0000001, .00000001, true)
  assert.equal(scale.normalize(.000000043), .00000004)
  const dense = sliderScale(0, 100, .00000001, true)
  assert.ok(dense.marks.length <= 1002)
  assert.equal(dense.normalize(12.34567891), 12.34567891)
  assert.equal(sliderScale(0, 100, 1e-320, true).normalize(36), 36)
  assert.equal(sliderScale(-1e308, 1e308, 1, true).disabled, true)
})
