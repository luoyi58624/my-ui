import '../packages/core/my-ui.js'
import test from 'node:test'
import assert from 'node:assert/strict'

const { daysInMonth, dateParts, datePickerState: date, timePickerState: time, calendarDays: days, calendarSelection: select } = MyUI.utils

test('严格日期包含公历世纪闰年，不接受隐式日期或时间戳', () => {
  assert.equal(daysInMonth(2000, 2), 29)
  assert.equal(daysInMonth(1900, 2), 28)
  assert.deepEqual(dateParts('0001-01-01'), [1, 1, 1])
  for (const input of ['2026-02-29', '2026-04-31', '2026-00-01', '0000-01-01', '2026-1-01', '2026-10-19T00:00:00Z', new Date()]) assert.equal(dateParts(input), undefined)
})
test('年月变化保留日号，闰年和大小月修正到月底', () => {
  assert.equal(date([2025, 2, 29]).value, '2025-02-28')
  assert.equal(date([2024, 2, 31]).value, '2024-02-29')
  assert.equal(date([2026, 4, 31]).value, '2026-04-30')
  assert.equal(date([2026, 5, 28]).value, '2026-05-28')
})
test('日期上下限包含边界，外部越界值显示最近边界', () => {
  const result = date('2026-02-20', '2026-02-10', '2026-03-05')
  assert.deepEqual(result.columns[0].map(item => item.value), [2026])
  assert.deepEqual(result.columns[1].map(item => item.value), [2, 3])
  assert.equal(result.columns[2][0].value, 10)
  assert.equal(date([2026, 3, 20], '2026-02-10', '2026-03-05').value, '2026-03-05')
  assert.equal(date('1900-12-31', '2026-02-10', '2026-03-05').value, '2026-02-10')
  assert.equal(date('2100-01-01', '2026-02-10', '2026-03-05').value, '2026-03-05')
})
test('空日期按指定回退显示，反向边界没有可选项，计算不修改入参', () => {
  assert.equal(date(null, undefined, undefined, '2024-02-29').value, '2024-02-29')
  assert.deepEqual(date(null, '2027-01-01', '2026-01-01').columns, [[], [], []])
  const value = [2024, 2, 31]; date(value); assert.deepEqual(value, [2024, 2, 31])
})
test('时分格式与分钟步长，小时边界只保留合法分钟', () => {
  const props = { min: '09:10', max: '18:35', minuteStep: 15 }
  assert.equal(time('08:00', props).value, '09:15')
  assert.equal(time('19:00', props).value, '18:30')
  assert.deepEqual(time('09:15', props).columns[1].map(item => item.value), [15, 30, 45])
  assert.deepEqual(time('18:30', props).columns[1].map(item => item.value), [0, 15, 30])
  assert.equal(time('09:07:00').value, '09:07')
})
test('时分秒有独立步长，首尾秒数符合精确边界', () => {
  const props = { min: '09:10:07', max: '09:10:42', minuteStep: 5, secondStep: 5, showSeconds: true }
  const result = time('09:10:08', props)
  assert.equal(result.value, '09:10:10')
  assert.deepEqual(result.columns[2].map(item => item.value), [10, 15, 20, 25, 30, 35, 40])
  assert.equal(time([9, 10, 59], props).value, '09:10:40')
  assert.equal(time('00:00:00', { showSeconds: true }).value, '00:00:00')
})
test('时段没有步长交集或边界反向时为空，非法步长回退 1', () => {
  for (const props of [{ min: '18:00', max: '09:00' }, { min: '09:01', max: '09:14', minuteStep: 15 }, { min: '09:00:01', max: '09:00:59' }]) assert.equal(time('09:00', props).value, null)
  assert.equal(time('09:17', { minuteStep: 0 }).value, '09:17')
  assert.equal(time('09:17', { minuteStep: 60 }).value, '09:00')
})
test('六周日历按周一起始，闰日与跨年连续且无时区偏移', () => {
  assert.equal(days('2024-02').length, 42)
  assert.equal(days('2024-02')[0], '2024-01-29')
  assert.equal(days('2024-02').filter(value => value === '2024-02-29').length, 1)
  assert.equal(days('2026-11', 0)[0], '2026-11-01')
  assert.equal(days('2026-01')[0], '2025-12-29')
  assert.equal(days('0001-01')[0], '0001-01-01')
  assert.equal(days('9999-12').at(-1), undefined)
  assert.deepEqual(days('2026-13'), [])
})
test('范围从一个端点到完整排序，支持同日和完整范围后重选', () => {
  assert.deepEqual(select([], '2026-10-20', true), ['2026-10-20'])
  assert.deepEqual(select(['2026-10-20'], '2026-10-15', true), ['2026-10-15', '2026-10-20'])
  assert.deepEqual(select(['2026-10-20'], '2026-10-20', true), ['2026-10-20', '2026-10-20'])
  assert.deepEqual(select(['2026-10-15', '2026-10-20'], '2026-10-28', true), ['2026-10-28'])
  assert.equal(select(null, '2026-10-19', false), '2026-10-19')
})
test('禁用日期不触发选择，范围不能跨过禁用日且不修改原数组', () => {
  const value = ['2026-10-10'], disabled = date => date === '2026-10-13'
  assert.equal(select(value, '2026-10-13', true, disabled), value)
  assert.deepEqual(select(value, '2026-10-15', true, disabled), ['2026-10-15'])
  assert.deepEqual(value, ['2026-10-10'])
  assert.deepEqual(select(value, '2026-10-12', true, disabled), ['2026-10-10', '2026-10-12'])
})
