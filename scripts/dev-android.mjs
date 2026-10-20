import { spawn } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 保留显式环境配置，未指定 NDK 时选用 Android SDK 中最新的稳定版本。 */
export function androidEnvironment(environment = process.env) {
  const env = { ...environment }
  const sdk = env.ANDROID_HOME || env.ANDROID_SDK_ROOT
  if (env.NDK_HOME || !sdk || !existsSync(join(sdk, 'ndk'))) return env
  const versions = readdirSync(join(sdk, 'ndk'), { withFileTypes: true }).flatMap(entry => {
    const directory = join(sdk, 'ndk', entry.name), properties = join(directory, 'source.properties')
    if (!entry.isDirectory() || !existsSync(properties)) return []
    const revision = readFileSync(properties, 'utf8').match(/^Pkg\.Revision\s*=\s*([^\r\n]+)/m)?.[1]?.trim()
    return revision && /^\d+(?:\.\d+)+$/.test(revision) ? [{ directory, revision }] : []
  }).sort((a, b) => b.revision.localeCompare(a.revision, 'en', { numeric: true }))
  if (versions[0]) env.NDK_HOME = versions[0].directory
  return env
}

/** 真机调试默认通过 USB 连接本机服务，显式 host 与其余 Tauri 参数原样保留。 */
export function androidArguments(args) {
  const separator = args.indexOf('--')
  const options = separator < 0 ? args : args.slice(0, separator)
  const hasHost = options.some(argument => argument === '--host' || argument.startsWith('--host='))
  return ['android', 'dev', ...(hasHost ? [] : ['--host', '127.0.0.1']), ...args]
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cwd = fileURLToPath(new URL('../example', import.meta.url))
  const env = androidEnvironment()
  if (!process.env.NDK_HOME && env.NDK_HOME) console.log('使用 Android NDK：' + env.NDK_HOME)
  const child = spawn(process.execPath, [join(cwd, 'node_modules/@tauri-apps/cli/tauri.js'), ...androidArguments(process.argv.slice(2))], { cwd, env, stdio: 'inherit', windowsHide: true })
  child.once('error', error => { console.error('安卓启动失败：' + error.message); process.exitCode = 1 })
  child.once('exit', (code, signal) => { process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1) })
}
