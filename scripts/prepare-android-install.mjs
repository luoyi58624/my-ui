import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url), 'utf8')).identifier
const runAdb = args => execFileSync('adb', args, { encoding: 'utf8', windowsHide: true }).trim()

/** 安装前只结束明确目标设备上的旧示例进程，避免系统更新恢复与开发启动同时创建首页。 */
export function prepareAndroidInstall({ environment = process.env, adb = runAdb, log = console.log } = {}) {
  const devices = adb(['devices']).split(/\r?\n/).flatMap(line => {
    const match = /^(\S+)\s+device\s*$/.exec(line)
    return match ? [match[1]] : []
  })
  const serial = environment.ANDROID_SERIAL || (devices.length === 1 ? devices[0] : undefined)
  // 多设备且未明确指定时，不猜测目标，不影响另一台手机上的运行状态。
  if (!serial || !devices.includes(serial)) {
    log('未预先关闭旧示例：请用 ANDROID_SERIAL 明确目标设备，以避开安装后的系统自动恢复。')
    return { stopped: false }
  }
  adb(['-s', serial, 'shell', 'am', 'force-stop', application])
  log('已结束目标设备上的旧示例，准备安装：' + serial)
  return { stopped: true, serial }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { prepareAndroidInstall() }
  catch (error) { console.error('安装前清理旧示例失败：' + error.message); process.exitCode = 1 }
}
