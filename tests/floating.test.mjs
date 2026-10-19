import '../packages/core/my-ui.js'
import assert from 'node:assert/strict'
import test from 'node:test'

const { resolveFloatingPosition, floatingRectVisible } = globalThis.MyUI.utils
const viewport = { left: 0, top: 0, right: 390, bottom: 720 }
const point = (x, y) => ({ left: x, right: x, top: y, bottom: y })
const input = (anchor, extra = {}) => ({ anchor, viewport, width: 236, height: 166, placement: 'bottom-start', gap: 4, margin: 8, ...extra })

test('纵向级联先整体移至视口顶部，整组放不下才形成滚动', () => {
  const pin = { left: 60, top: 160, bottom: 212, side: 'bottom', parent: { top: 100, bottom: 310 } }
  const result = resolveFloatingPosition(input(point(60, 160), { height: 1200, pin }))
  assert.equal(result.top, 44)
  assert.equal(result.maxHeight, 668)
  assert.equal(result.height, 668)
  assert.equal(pin.parent.top + result.stack.shift, 8)
  assert.equal(result.left, 60)
  assert.equal(result.side, 'bottom')
})

test('底部空间不足时上移完整子菜单，并同步移动父层保留返回区域', () => {
  const pin = { left: 60, top: 640, bottom: 690, side: 'bottom', parent: { top: 540, bottom: 700 } }
  const result = resolveFloatingPosition(input(point(60, 640), { height: 400, pin }))
  assert.equal(result.side, 'bottom')
  assert.equal(result.height, 400)
  assert.equal(result.top, 312)
  assert.equal(result.top + result.height, 712)
  assert.equal(pin.parent.top + result.stack.shift + 36, result.top)
  assert.equal(result.maxHeight, 668)
})

test('空间足够优先对齐，略超下边缘时仅上移溢出量而不压缩内容', () => {
  const pin = { left: 60, top: 540, bottom: 590, side: 'bottom', parent: { top: 486, bottom: 690 } }
  const aligned = resolveFloatingPosition(input(point(60, 540), { height: 180, pin }))
  assert.equal(aligned.top, 522)
  assert.equal(aligned.stack.shift, 0)
  const shifted = resolveFloatingPosition(input(point(60, 540), { height: 302, pin }))
  assert.equal(shifted.top, 410)
  assert.equal(shifted.height, 302)
  assert.equal(shifted.stack.shift, -112)
})

test('三级叠放累计祖先留白，完整内容优先且根层不会越过顶部', () => {
  const pin = { left: 60, top: 600, bottom: 650, side: 'bottom', parent: { top: 432, bottom: 712, reserve: 36 } }
  const result = resolveFloatingPosition(input(point(60, 600), { height: 600, pin }))
  assert.equal(result.height, 600)
  assert.equal(result.top, 112)
  assert.equal(result.stack.reserve, 72)
  assert.equal(pin.parent.top + result.stack.shift - 36, 40)
})

test('各种父菜单位置与内容高度下均露出父层并限制子窗口边界', () => {
  for (const bottom of [240, 480, 720, 1000]) for (const parentTop of [8, 70, bottom / 2, bottom - 70]) for (const height of [50, 280, 1200]) {
    const area = { ...viewport, bottom }
    const parent = { top: parentTop, bottom: Math.min(parentTop + 204, bottom - 8) }
    const pin = { left: 60, top: parent.top + 50, bottom: parent.top + 100, side: 'bottom', parent }
    const result = resolveFloatingPosition(input(point(60, pin.top), { viewport: area, height, pin }))
    assert.ok(result.top >= 8 && result.top + result.height <= bottom - 8)
    assert.ok(result.top > parent.top + result.stack.shift + 15)
    assert.ok(parent.top + result.stack.shift >= 8 - 1e-8)
    assert.equal(result.height, Math.min(height, bottom - 16 - result.stack.reserve))
    assert.ok(result.height <= result.maxHeight)
  }
})

test('移动层级略超下边缘时最小上移，保持原方向而非翻到触发点上方', () => {
  const result = resolveFloatingPosition(input(point(60, 426), { height: 290, pin: { left: 60, top: 430, bottom: 634, side: 'bottom' } }))
  assert.equal(result.side, 'bottom')
  assert.equal(result.top, 422)
  assert.equal(result.left, 60)
  assert.equal(result.height, 290)
})

test('向上展开的层级切换保留父窗口下边缘', () => {
  const pin = { left: 60, top: 300, bottom: 504, side: 'top' }
  for (const height of [70, 310]) {
    const result = resolveFloatingPosition(input(point(60, 508), { height, pin }))
    assert.equal(result.top + result.height, pin.bottom)
    assert.equal(result.side, 'top')
  }
})

test('固定层级原点仍限制在可视视口内，并允许长内容在整窗内滚动', () => {
  const result = resolveFloatingPosition(input(point(350, 600), { height: 1200, pin: { left: 350, top: 600, bottom: 700, side: 'bottom' } }))
  assert.equal(result.top, 8)
  assert.equal(result.maxHeight, 704)
  assert.equal(result.left + result.width, viewport.right - 8)
  assert.equal(result.height, 704)
})

test('同一行不同按压点决定菜单位置和动画起点', () => {
  const first = resolveFloatingPosition(input(point(30, 200), { pointer: { x: 30, y: 200 } }))
  const second = resolveFloatingPosition(input(point(120, 200), { pointer: { x: 120, y: 200 } }))
  assert.equal(first.left, 30)
  assert.equal(second.left, 120)
  assert.equal(first.top, 204)
  assert.equal(first.originX, 0)
  assert.equal(first.originY, 0)
})

test('右下角同时向上和向左展开，动画原点位于右下角', () => {
  const result = resolveFloatingPosition(input(point(378, 708), { pointer: { x: 378, y: 708 } }))
  assert.equal(result.side, 'top')
  assert.equal(result.alignment, 'end')
  assert.equal(result.left, 142)
  assert.equal(result.top, 538)
  assert.equal(result.originX, 236)
  assert.equal(result.originY, 166)
})

test('上方不够空间时翻转到下方', () => {
  const result = resolveFloatingPosition(input(point(10, 10), { placement: 'top-start' }))
  assert.equal(result.side, 'bottom')
  assert.equal(result.left, 10)
  assert.equal(result.top, 14)
})

test('右侧不足时切到左侧，并调整垂直对齐', () => {
  const result = resolveFloatingPosition(input({ left: 330, right: 370, top: 600, bottom: 640 }, { placement: 'right-start' }))
  assert.equal(result.side, 'left')
  assert.equal(result.left, 90)
  assert.equal(result.top, 474)
  assert.equal(result.originX, 236)
})

test('超长菜单使用整个视口的高度，避免过早限制在按压点单侧', () => {
  const result = resolveFloatingPosition(input(point(195, 300), { viewport: { ...viewport, bottom: 390 }, height: 1200 }))
  assert.equal(result.side, 'top')
  assert.equal(result.height, 374)
  assert.equal(result.maxHeight, 374)
  assert.equal(result.top, 8)
})

test('上下单侧都不足但整个视口放得下时，移动窗口且保留完整高度', () => {
  const result = resolveFloatingPosition(input(point(195, 200), { viewport: { ...viewport, bottom: 390 }, height: 340, pointer: { x: 195, y: 200 } }))
  assert.equal(result.height, 340)
  assert.equal(result.maxHeight, 374)
  assert.equal(result.top, 8)
  assert.equal(result.originY, 192)
})

test('两侧都不能完整容纳时优先移动，尺寸只限制到整个视口', () => {
  const result = resolveFloatingPosition(input(point(90, 160), { viewport: { ...viewport, right: 180, bottom: 320 }, width: 500, height: 1000, placement: 'right-start' }))
  assert.equal(result.width, 164)
  assert.equal(result.height, 304)
  assert.equal(result.left + result.width, 172)
  assert.equal(result.top, 8)
})

test('可视视口偏移后仍以真实可见边缘定位', () => {
  const result = resolveFloatingPosition(input(point(290, 590), { viewport: { left: 100, top: 200, right: 300, bottom: 600 }, pointer: { x: 290, y: 590 } }))
  assert.equal(result.width, 184)
  assert.equal(result.left, 108)
  assert.equal(result.top, 420)
  assert.equal(result.side, 'top')
  assert.equal(result.originX, 182)
})

test('触发元素部分可见可保留，完全裁剪时不可见', () => {
  assert.equal(floatingRectVisible({ left: -20, top: -20, right: 20, bottom: 20 }, viewport), true)
  assert.equal(floatingRectVisible({ left: 390, top: 0, right: 420, bottom: 30 }, viewport), false)
  assert.equal(floatingRectVisible({ left: 0, top: 720, right: 50, bottom: 740 }, viewport), false)
  assert.equal(floatingRectVisible({ left: 10, top: 10, right: 10, bottom: 10 }, { left: 10, top: 10, right: 30, bottom: 30 }), false)
})

test('首选方向能放下时保留方向和对齐方式', () => {
  const result = resolveFloatingPosition(input({ left: 50, top: 100, right: 350, bottom: 140 }, { placement: 'bottom-end', gap: 8 }))
  assert.equal(result.side, 'bottom')
  assert.equal(result.left, 114)
  assert.equal(result.top, 148)
})

test('负间距让左右子菜单都重叠父层 4px', () => {
  const anchor = { left: 400, top: 200, right: 636, bottom: 250 }
  const area = { left: 0, top: 0, right: 1280, bottom: 720 }
  const right = resolveFloatingPosition(input(anchor, { viewport: area, placement: 'right-start', gap: -4 }))
  const left = resolveFloatingPosition(input(anchor, { viewport: area, placement: 'left-start', gap: -4 }))
  assert.equal(right.left, 632); assert.equal(right.top, 200); assert.equal(right.originX, 0)
  assert.equal(left.left + left.width, 404); assert.equal(left.top, 200); assert.equal(left.originX, left.width)
})

test('负间距在屏幕边缘翻转后仍保留 4px 重叠', () => {
  const area = { left: 0, top: 0, right: 1280, bottom: 720 }
  const left = resolveFloatingPosition(input({ left: 1100, top: 200, right: 1260, bottom: 250 }, { viewport: area, placement: 'right-start', gap: -4 }))
  assert.equal(left.side, 'left'); assert.equal(left.left + left.width, 1104)
  const right = resolveFloatingPosition(input({ left: 16, top: 200, right: 252, bottom: 250 }, { viewport: area, placement: 'left-start', gap: -4 }))
  assert.equal(right.side, 'right'); assert.equal(right.left, 248)
})

test('极小可见区域仍返回有效尺寸而不越界', () => {
  const result = resolveFloatingPosition(input(point(0, 0), { viewport: { left: 0, top: 0, right: 8, bottom: 8 }, margin: 50 }))
  assert.equal(result.width, 0)
  assert.equal(result.height, 0)
  assert.equal(result.left, 4)
  assert.equal(result.top, 4)
})

test('大量不同坐标、尺寸和十二种首选方向都满足边界不变量', () => {
  let seed = 73819
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32 }
  const placements = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end']
  for (const placement of placements) for (let index = 0; index < 150; index++) {
    const left = random() * 100, top = random() * 200, width = 64 + random() * 1200, height = 64 + random() * 900
    const area = { left, top, right: left + width, bottom: top + height }
    const x = left - 100 + random() * (width + 200), y = top - 100 + random() * (height + 200), margin = random() * 24
    const safeMargin = Math.min(margin, width / 2, height / 2)
    const result = resolveFloatingPosition(input(point(x, y), { viewport: area, width: random() * 1800, height: random() * 2500, placement, gap: random() * 32 - 16, margin, pointer: { x, y } }))
    assert.ok(result.left >= left + safeMargin - 1e-8)
    assert.ok(result.top >= top + safeMargin - 1e-8)
    assert.ok(result.left + result.width <= area.right - safeMargin + 1e-8)
    assert.ok(result.top + result.height <= area.bottom - safeMargin + 1e-8)
    assert.ok(result.height <= result.maxHeight)
    assert.ok(result.originX >= 0 && result.originX <= result.width)
    assert.ok(result.originY >= 0 && result.originY <= result.height)
  }
})
