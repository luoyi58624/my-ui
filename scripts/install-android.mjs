import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareAndroidInstall } from './prepare-android-install.mjs'

const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url), 'utf8')).identifier
const runAdb = args => execFileSync('adb', args, { encoding: 'utf8', windowsHide: true }).trim()

/** 保留应用数据，先结束目标设备的旧实例，再覆盖安装 APK 并通过桌面入口启动一次。 */
export function installAndroid({ apk, launch = true, environment = process.env, adb = runAdb, log = console.log } = {}) {
  if (!apk || !apk.toLowerCase().endsWith('.apk')) throw Error('请指定已构建的 APK 文件路径')
  const path = resolve(apk)
  if (!statSync(path).isFile()) throw Error('APK 路径必须指向文件：' + path)
  const target = prepareAndroidInstall({ environment, adb, log })
  if (!target.stopped) throw Error('无法确定安装设备，请设置 ANDROID_SERIAL 后重试')
  const onDevice = args => adb(['-s', target.serial, ...args])
  log(onDevice(['install', '-r', path]))
  if (launch) {
    const launcher = onDevice(['shell', 'cmd', 'package', 'resolve-activity', '--brief', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', application]).split(/\r?\n/).at(-1).trim()
    if (!launcher.startsWith(application + '/')) throw Error('安装完成，但没有找到应用桌面入口')
    log(onDevice(['shell', 'am', 'start', '-W', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', '-n', launcher]))
  }
  return { serial: target.serial, apk: path, launched: launch }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter(value => value !== '--')
  try {
    if (args.length < 1 || args.length > 2 || args.slice(1).some(value => value !== '--no-launch')) throw Error('用法：bun run install:android <apk> [--no-launch]')
    installAndroid({ apk: args[0], launch: !args.includes('--no-launch') })
  } catch (error) { console.error('安卓安装失败：' + error.message); process.exitCode = 1 }
}
