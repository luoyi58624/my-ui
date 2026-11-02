import '../lib/my-ui.js'
import assert from 'node:assert/strict'
import test from 'node:test'

const { completesSwipe } = globalThis.MyUI.utils

test('滑动区分轻触、慢拖、短促甩动与反向回拉', () => {
  assert.equal(completesSwipe(5, 2, 360), false)
  assert.equal(completesSwipe(32, .1, 360), false)
  assert.equal(completesSwipe(100, .1, 360), true)
  assert.equal(completesSwipe(20, .8, 360), true)
  assert.equal(completesSwipe(100, -.7, 360), false)
})
test('小面板按比例吸附，大面板不要求拖动过长，失效尺寸不提交', () => {
  assert.equal(completesSwipe(30, 0, 100), true)
  assert.equal(completesSwipe(90, 0, 1200), true)
  assert.equal(completesSwipe(20, 0, 100), false)
  assert.equal(completesSwipe(200, 2, 0), false)
})
