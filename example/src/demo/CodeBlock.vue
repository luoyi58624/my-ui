<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import 'highlight.js/styles/atom-one-dark.css'
import type { CodeLanguage } from './code/types'

const props = withDefaults(defineProps<{
  /** 需要展示和复制的原始代码。 */
  code: string
  /** 代码的高亮语言。 */
  language?: CodeLanguage
  /** 当前代码的文件名。 */
  filename?: string
}>(), { language: 'vue', filename: '' })

// 展开代码时才加载展示库；主题随应用打包，离线也能高亮。
const VCodeBlock = defineAsyncComponent(() => import('@wdns/vue-code-block'))
const clipboardAvailable = !!navigator.clipboard?.writeText
const lang = computed(() => {
  if (props.language === 'vue') return 'html'
  if (props.language === 'text') return 'plaintext'
  if (props.language === 'shellscript') return 'bash'
  return props.language
})
</script>

<template>
  <div class="demo-code" data-code-theme="atom-one-dark">
    <VCodeBlock :code="code" :lang="lang" :label="filename" highlightjs :prismjs="false" :theme="false"
      max-height="540px" :copy-button="false" copy-text="复制代码" copy-success-text="已复制"
      copy-failed-text="复制失败，请选择代码复制">
      <template #label="{ copyCode, copyStatus }">
        <div class="demo-code-toolbar">
          <span>{{ filename || language }}</span>
          <button type="button" class="demo-code-copy" :disabled="!clipboardAvailable" :aria-label="`复制 ${filename || language} 代码`" aria-live="polite" @click="copyCode">
            {{ !clipboardAvailable ? '选择代码复制' : copyStatus === 'success' ? '已复制' : copyStatus === 'failed' ? '复制失败' : '复制代码' }}
          </button>
        </div>
      </template>
    </VCodeBlock>
  </div>
</template>

<style scoped>
.demo-code { min-width: 0; overflow: hidden; padding: 12px; border-radius: 12px; color-scheme: dark; background: #282c34; color: #abb2bf; }
.demo-code :deep(pre) { margin: 0; tab-size: 2; }
.demo-code :deep(pre), .demo-code :deep(code) { -webkit-user-select: text; user-select: text; -webkit-touch-callout: default; }
.demo-code :deep(code) { font: 13px/1.8 Consolas, 'SFMono-Regular', 'Liberation Mono', monospace; }
.demo-code :deep(.v-code-block--header) { padding: 2px 4px 12px; }
.demo-code :deep(.v-code-block--label) { width: 100%; font: 12px/1.7 Consolas, 'SFMono-Regular', monospace; overflow-wrap: anywhere; }
.demo-code-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.demo-code-toolbar > span { min-width: 0; }
.demo-code-copy { flex: none; appearance: none; padding: 8px 12px; border: 1px solid #515968; border-radius: 6px; background: #343b47; color: #e0e5ed; font: 12px/1.4 system-ui, sans-serif; cursor: pointer; }
.demo-code-copy:hover { background: #414958; }
.demo-code-copy:disabled { cursor: default; opacity: .7; }
.demo-code-copy:focus-visible { outline: 2px solid #61afef; outline-offset: 2px; }
@media (max-width: 600px) { .demo-code { padding: 8px; } .demo-code :deep(code) { font-size: 12px; } .demo-code-copy { min-height: 44px; } }
</style>
