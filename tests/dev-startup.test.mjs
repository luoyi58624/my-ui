import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { ensureDevServer } from '../scripts/dev-server.mjs'
import { androidArguments, androidEnvironment } from '../scripts/dev-android.mjs'

const temporary = mkdtempSync(join(tmpdir(), 'my-ui-dev-startup-'))

test('开发服务和安卓启动', async context => {
  context.after(() => {
    if (dirname(resolve(temporary)) === resolve(tmpdir()) && basename(temporary).startsWith('my-ui-dev-startup-')) rmSync(temporary, { recursive: true, force: true })
  })
  await context.test('端口空闲时启动，重复进入复用同一服务且不关闭原服务', async () => {
    const { server, reused } = await ensureDevServer({
      url: 'http://127.0.0.1:0', log() {},
      viteOptions: { cacheDir: join(temporary, 'vite'), logLevel: 'silent', optimizeDeps: { noDiscovery: true, include: [] }, server: { hmr: false, watch: null } }
    })
    try {
      assert.equal(reused, false)
      const url = server.resolvedUrls.local[0]
      const second = await ensureDevServer({ url, log() {} })
      assert.deepEqual(second, { reused: true })
      assert.equal((await fetch(url)).status, 200)
      assert.equal((await (await fetch(new URL('/__my-ui/dev-server', url))).json()).app, 'my-ui')
    } finally { await server.close() }
  })
  await context.test('同名的其他项目占用端口时拒绝复用，不终止占用者', async () => {
    const other = createServer((request, response) => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ app: 'my-ui', root: join(temporary, 'other-project') })) })
    await new Promise(resolve => other.listen(0, '127.0.0.1', resolve))
    const url = 'http://127.0.0.1:' + other.address().port
    try {
      await assert.rejects(ensureDevServer({ url, log() {}, viteOptions: { cacheDir: join(temporary, 'other-vite'), logLevel: 'silent', optimizeDeps: { noDiscovery: true, include: [] }, server: { hmr: false, watch: null } } }), /现有进程未被关闭/)
      assert.equal((await fetch(url)).status, 200)
    } finally { await new Promise(resolve => other.close(resolve)) }
  })
  await context.test('默认 USB 地址，用户传入的设备、host 和额外参数保持有效', () => {
    assert.deepEqual(androidArguments([]), ['android', 'dev', '--host', '127.0.0.1'])
    assert.deepEqual(androidArguments(['PLJ110', '--no-watch']), ['android', 'dev', '--host', '127.0.0.1', 'PLJ110', '--no-watch'])
    assert.deepEqual(androidArguments(['--host', '192.168.1.3']), ['android', 'dev', '--host', '192.168.1.3'])
    assert.deepEqual(androidArguments(['--host=192.168.1.3']), ['android', 'dev', '--host=192.168.1.3'])
    assert.deepEqual(androidArguments(['--', '--host']), ['android', 'dev', '--host', '127.0.0.1', '--', '--host'])
  })
  await context.test('自动选择稳定 NDK，保留显式 NDK 且不修改父进程环境', () => {
    const sdk = join(temporary, 'sdk')
    for (const revision of ['25.1.8937393', '28.2.13676358', '30.0.15729638-beta2']) {
      const directory = join(sdk, 'ndk', revision.replace('-beta2', '')); mkdirSync(directory, { recursive: true })
      writeFileSync(join(directory, 'source.properties'), 'Pkg.Revision = ' + revision)
    }
    const source = { ANDROID_HOME: sdk }
    assert.equal(androidEnvironment(source).NDK_HOME, join(sdk, 'ndk', '28.2.13676358'))
    assert.equal(source.NDK_HOME, undefined)
    assert.equal(androidEnvironment({ ANDROID_HOME: sdk, NDK_HOME: 'custom-ndk' }).NDK_HOME, 'custom-ndk')
    assert.deepEqual(androidEnvironment({}), {})
  })
})
