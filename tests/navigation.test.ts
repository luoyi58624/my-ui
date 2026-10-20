import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const nativeRoot = new URL('../example/src-tauri/', import.meta.url)

test('首页与所有子页都拥有共享状态权限，Android 同时授权导航和系统字重', () => {
  for (const file of ['default.json', 'mobile.json']) {
    const config = JSON.parse(readFileSync(new URL('capabilities/' + file, nativeRoot), 'utf8'))
    assert.ok(config.windows.includes('main') && config.windows.includes('native-page-*'))
    if (file === 'default.json') assert.ok(config.permissions.includes('store:default'))
    else {
      assert.deepEqual(config.platforms, ['android'])
      assert.ok(config.permissions.includes('android-system-font-weight:default'))
      assert.ok(config.permissions.includes('native-router:default'))
      assert.ok(config.permissions.includes('native-components:default'))
    }
  }
})

test('三个插件的源码目录、前端包名和 Cargo 安装路径保持一致', () => {
  const root = new URL('../', import.meta.url)
  const pkg = JSON.parse(readFileSync(new URL('example/package.json', root), 'utf8'))
  const cargo = readFileSync(new URL('Cargo.toml', nativeRoot), 'utf8')
  for (const suffix of ['android-system-font-weight', 'native-router', 'native-components']) {
    const name = 'tauri-plugin-' + suffix
    assert.ok(pkg.dependencies[name].endsWith('/' + name))
    assert.ok(cargo.includes(`${name} = { path = "../node_modules/${name}" }`))
    const installed = JSON.parse(readFileSync(new URL(`../node_modules/${name}/package.json`, nativeRoot), 'utf8'))
    assert.equal(installed.name, name)
  }
})

test('重新从启动器进入时保留子页栈，首页 singleTop、子页 standard 且不导出', () => {
  const manifest = readFileSync(new URL('gen/android/app/src/main/AndroidManifest.xml', nativeRoot), 'utf8')
  const activities = [...manifest.matchAll(/<activity\s+([^>]+)>/g)].map(match => match[1])
  const main = activities.find(attributes => attributes.includes('android:name=".MainActivity"'))!
  const child = activities.find(attributes => attributes.includes('android:name=".NativePageActivity"'))!
  assert.match(main, /android:launchMode="singleTop"/)
  assert.doesNotMatch(child, /android:launchMode="(?:singleTask|singleInstance|singleInstancePerTask)"/)
  assert.match(child, /android:exported="false"/)
  assert.doesNotMatch(manifest, /android:(?:clearTaskOnLaunch|finishOnTaskLaunch)="true"/)
})
