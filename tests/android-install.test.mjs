import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { installAndroid } from '../scripts/install-android.mjs'

test('覆盖安装流程', async context => {
  const temporary = mkdtempSync(join(tmpdir(), 'my-ui-android-install-')), apk = join(temporary, 'example.apk')
  writeFileSync(apk, '')
  context.after(() => {
    assert.equal(dirname(resolve(temporary)), resolve(tmpdir()))
    assert(basename(temporary).startsWith('my-ui-android-install-'))
    rmSync(temporary, { recursive: true, force: true })
  })
  const fixture = ({ devices = 'phone-a\tdevice\n', failure } = {}) => {
    const commands = []
    return { commands, adb(args) {
      commands.push(args)
      if (args[0] === 'devices') return devices
      if (args.includes(failure)) throw Error('设备操作失败')
      if (args.includes('resolve-activity')) return 'dev.myui.example/.LauncherActivity'
      return 'Success'
    } }
  }
  await context.test('先关闭旧实例，再覆盖安装，最后仅通过桌面入口启动一次', () => {
    const { commands, adb } = fixture()
    assert.deepEqual(installAndroid({ apk, adb, environment: {}, log() {} }), { serial: 'phone-a', apk: resolve(apk), launched: true })
    assert.deepEqual(commands.map(args => args[0] === 'devices' ? 'devices' : args[2] === 'install' ? 'install' : args[4]), ['devices', 'force-stop', 'install', 'package', 'start'])
    assert.deepEqual(commands[2], ['-s', 'phone-a', 'install', '-r', resolve(apk)])
    assert.equal(commands.filter(args => args.includes('start')).length, 1)
    assert.equal(commands.at(-1).at(-1), 'dev.myui.example/.LauncherActivity')
  })
  await context.test('找不到 APK 或无法唯一确定设备时不安装、不启动', () => {
    const { commands, adb } = fixture({ devices: 'phone-a\tdevice\nphone-b\tdevice\n' })
    assert.throws(() => installAndroid({ apk: join(temporary, 'missing.apk'), adb }), /ENOENT/)
    assert.equal(commands.length, 0)
    assert.throws(() => installAndroid({ apk, adb, environment: {}, log() {} }), /ANDROID_SERIAL/)
    assert.deepEqual(commands, [['devices']])
  })
  await context.test('关闭旧实例或安装失败后终止流程，不启动第二个实例', () => {
    for (const failure of ['force-stop', 'install']) {
      const { commands, adb } = fixture({ failure })
      assert.throws(() => installAndroid({ apk, adb, environment: {}, log() {} }), /设备操作失败/)
      assert(!commands.some(args => args.includes('start')))
      assert(!commands.some(args => args.includes('uninstall') || args.includes('clear')))
    }
  })
  await context.test('指定设备且仅安装时，保留数据并跳过启动', () => {
    const { commands, adb } = fixture({ devices: 'phone-a\tdevice\nphone-b\tdevice\n' })
    installAndroid({ apk, launch: false, adb, environment: { ANDROID_SERIAL: 'phone-b' }, log() {} })
    assert.equal(commands.length, 3)
    assert(commands.slice(1).every(args => args[1] === 'phone-b'))
  })
})
