<script setup lang="ts">
import { Button, Icon } from '@my-ui/vue'
import { isAndroidNative } from 'tauri-plugin-native-components/router'
import { ref } from 'vue'
import DemoExample from './DemoExample.vue'
import { openPage } from '../navigation'

const emit = defineEmits<{ notify: [message: string] }>()
const native = isAndroidNative()
const opening = ref(false)
const preview = new URL(location.href)
preview.hash = '/native/app-demo'
async function open(path: string) {
  if (opening.value) return
  opening.value = true
  try { await openPage(path) }
  catch (reason) { emit('notify', String(reason)) }
  finally { opening.value = false }
}
</script>

<template>
  <div class="app-documentation">
    <DemoExample name="app-container" source="NativeAppShowcase.vue" title="App 容器与底部 TabBar" description="tabs 配置页面，tabbar 插槽提供底栏，通过 value 对应并切换。">
      <div v-if="native" class="app-native-preview">
        <span class="app-preview-icon"><Icon name="layer" /></span>
        <h3>App 与底部导航</h3>
        <p>两个 Tab 和一个独立页面。</p>
        <Button :loading="opening" @click="open('/native/app-demo')">打开 App 示例 <Icon name="arrow-right" /></Button>
      </div>
      <iframe v-else :src="preview.href" title="App 容器交互预览" class="app-live-preview" loading="lazy" />
    </DemoExample>
    <DemoExample name="app-pages" source="NativeAppShowcase.vue" title="独立页面与返回" description="pages 沿用 Vue Router 的路由配置，在启动时注册一次。页面内部通过 useApp().push() 打开详情，通过 back() 返回。">
      <div class="app-route-preview">
        <span class="app-route-mark"><Icon name="file" /></span>
        <div><h3>/native/app-demo/detail</h3><p>打开独立页时隐藏底栏，返回后恢复当前 Tab。</p></div>
        <Button variant="outline" :loading="opening" @click="open('/native/app-demo/detail')">打开独立页面</Button>
      </div>
      <p class="app-preview-note">同一份 pages 同时传给 App 和 Vue Router。</p>
    </DemoExample>
    <section class="app-api" aria-label="App API">
      <h2>配置与插槽</h2>
      <div class="app-api-table"><table><thead><tr><th>接口</th><th>用途</th></tr></thead><tbody>
        <tr><td>v-model</td><td>当前 Tab 的 value；打开独立页面时保留原值。</td></tr>
        <tr><td>tabs</td><td>页面的 value、component 和可选的 props。</td></tr>
        <tr><td>pages</td><td>独立页面的 name、path、component；支持路由参数、props 和 meta。</td></tr>
        <tr><td>#tabbar</td><td>接收 value、select，可使用内置 BottomNavigation 或自定义底栏。</td></tr>
        <tr><td>useApp()</td><td>获取 value、select、push 和 back，作用于当前 App。</td></tr>
      </tbody></table></div>
      <p>App 管理页面切换、底栏与安全区，顶部导航由每个页面自行编写。Tab 切换不增加返回记录，重复选择不重置内容；一级页面不拦截系统返回。</p>
    </section>
  </div>
</template>

<style scoped>
.app-documentation { display: grid; gap: 36px; }
.app-documentation :deep(.doc-example + .doc-example) { margin-top: 0; }
.app-live-preview { box-sizing: border-box; display: block; width: min(100%, 390px); height: 320px; margin: 0 auto; border: 1px solid var(--border); border-radius: 18px; background: var(--background); }
.app-preview-note, .app-api > p { margin: 20px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.9; }
.app-native-preview { padding: 14px 0; text-align: center; }
.app-preview-icon { display: inline-grid; place-items: center; width: 56px; height: 56px; border-radius: 18px; background: var(--fill); color: var(--primary); }
.app-preview-icon svg { width: 28px; height: 28px; }
.app-native-preview h3 { margin: 20px 0 10px; font-size: 20px; font-weight: var(--font-weight-subtitle, 600); }
.app-native-preview > p { margin: 0 0 22px; color: var(--text-secondary); font-size: 13px; line-height: 1.8; }
.app-native-preview :deep(.my-button svg) { width: 16px; height: 16px; }
.app-route-preview { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.app-route-mark { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; flex: none; color: var(--primary); background: var(--fill); }
.app-route-mark svg { width: 22px; height: 22px; }
.app-route-preview > div { flex: 1; min-width: 160px; }
.app-route-preview h3 { margin: 0 0 6px; overflow-wrap: anywhere; font-size: 14px; font-weight: var(--font-weight-action, 600); }
.app-route-preview p { margin: 0; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
.app-api h2 { margin: 0 0 18px; font-size: 20px; font-weight: var(--font-weight-subtitle, 600); }
.app-api-table { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
.app-api table { width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.8; }
.app-api th, .app-api td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); }
.app-api th { background: var(--fill); font-weight: var(--font-weight-action, 600); }
.app-api td:first-child { white-space: nowrap; color: var(--primary); }
.app-api tr:last-child td { border-bottom: 0; }
@media (max-width: 600px) { .app-live-preview { border-radius: 12px; } .app-api th, .app-api td { padding: 10px 12px; } }
</style>
