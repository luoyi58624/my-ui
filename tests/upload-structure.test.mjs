import '../lib/my-ui.js'
import test from 'node:test'
import assert from 'node:assert/strict'

const { uploadAccepts, validateUpload, fileSize, stepsState } = MyUI.utils
const file = (name = 'note.txt', size = 12, type = 'text/plain', lastModified = 1) => ({ name, size, type, lastModified })

test('文件规则支持扩展名、复合扩展名、精确 MIME、通配符和大小写', () => {
  assert(uploadAccepts(file('NOTE.TXT'), '.pdf, .TXT'))
  assert(uploadAccepts(file('archive.tar.gz'), '.tar.gz'))
  assert(uploadAccepts(file('photo.bin', 20, 'image/png'), 'image/*'))
  assert(uploadAccepts(file(), 'text/plain'))
  assert(uploadAccepts(file(), ''))
  assert(uploadAccepts(file(), '*/*'))
  assert.equal(uploadAccepts(file(), 'image/*'), false)
  assert.equal(uploadAccepts(file('not-a-pdf.txt'), '.pdf'), false)
})
test('批量校验接收合法文件，拒绝项保留精确原因', () => {
  const files = [file('a.txt', 10), file('b.png', 10, 'image/png'), file('c.txt', 11), file('d.txt', 0)]
  const result = validateUpload(files, [], { multiple: true, maxSize: 10, accept: '.txt', maxCount: 1 })
  assert.deepEqual(result.accepted, [files[0]])
  assert.deepEqual(result.rejected.map(item => item.reason), ['accept', 'size', 'count'])
  assert.equal(result.rejected[0].file, files[1])
})
test('默认单选，多选不限数量，maxCount 只进一步收紧且包含已有记录', () => {
  const files = [file('a.txt'), file('b.txt'), file('c.txt')]
  assert.equal(validateUpload(files).accepted.length, 1)
  assert.equal(validateUpload(files, [], { multiple: true }).accepted.length, 3)
  assert.equal(validateUpload(files, [{ id: 'existing', name: 'existing' }], { multiple: true, maxCount: 2 }).accepted.length, 1)
  assert.equal(validateUpload(files, [], { maxCount: 8 }).accepted.length, 1)
  assert.equal(validateUpload(files, [], { multiple: true, maxCount: 0 }).accepted.length, 0)
})
test('重复文件在批次内及已有列表中都被识别，移除后允许重新选择', () => {
  const a = file(), same = file(), changed = file('note.txt', 12, 'text/plain', 2)
  const before = [a, same, changed], result = validateUpload(before, [], { multiple: true })
  assert.deepEqual(result.accepted, [a, changed])
  assert.deepEqual(result.rejected.map(item => item.reason), ['duplicate'])
  assert.equal(validateUpload([same], [{ id: 'a', file: a }], { multiple: true }).rejected[0].reason, 'duplicate')
  assert.equal(validateUpload([same], []).accepted[0], same)
  assert.deepEqual(before, [a, same, changed])
})
test('零字节、精确大小边界与文件大小单位', () => {
  assert.equal(validateUpload([file('a.txt', 0)], [], { maxSize: 0 }).accepted.length, 1)
  assert.equal(validateUpload([file('a.txt', 1024)], [], { maxSize: 1024 }).accepted.length, 1)
  for (const [bytes, label] of [[0, '0 B'], [12, '12 B'], [1024, '1 KB'], [1536, '1.5 KB'], [1048576, '1 MB']]) assert.equal(fileSize(bytes), label)
  assert.equal(fileSize(undefined), '')
  assert.equal(fileSize(-1), '')
})
test('步骤索引、错误与全部完成的状态一致，非法值有稳定回退', () => {
  const items = [{ label: 'A' }, { label: 'B' }, { label: 'C' }]
  assert.deepEqual(stepsState(items, 1).states, ['finish', 'process', 'wait'])
  assert.deepEqual(stepsState(items, 1, 'error').states, ['finish', 'error', 'wait'])
  assert.deepEqual(stepsState(items, 3, 'error').states, ['finish', 'finish', 'finish'])
  assert.equal(stepsState(items, NaN).active, 0)
  assert.equal(stepsState(items, -4).active, 0)
  assert.equal(stepsState(items, 1.8).active, 1)
  assert.deepEqual(stepsState([], 8), { active: 0, states: [] })
})
