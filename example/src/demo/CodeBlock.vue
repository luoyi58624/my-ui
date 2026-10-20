<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { Icon } from '@my-ui/vue'
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
      max-height="540px" code-block-radius="0" :copy-button="false" copy-text="复制代码" copy-success-text="已复制"
      copy-failed-text="复制失败，请选择代码复制">
      <template #label="{ copyCode, copyStatus }">
        <div class="demo-code-toolbar">
          <span>{{ filename || language }}</span>
          <button type="button" class="demo-code-copy" :disabled="!clipboardAvailable" :aria-label="`复制 ${filename || language} 代码`" aria-live="polite" @click="copyCode">
            <Icon :name="copyStatus === 'success' ? 'check' : 'copy'" />
            {{ !clipboardAvailable ? '选择代码复制' : copyStatus === 'success' ? '已复制' : copyStatus === 'failed' ? '复制失败' : '复制代码' }}
          </button>
        </div>
      </template>
    </VCodeBlock>
  </div>
</template>

<style scoped>
/* 随示例打包同一份代码字体，保证各平台使用指定的字体文件。 */
@font-face {
  font-family: 'MyUI Demo Consolas';
  src: url('./assets/fonts/Consolas-Regular.ttf') format('truetype');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
.demo-code { --demo-code-font: 'MyUI Demo Consolas', Consolas, 'SFMono-Regular', 'Liberation Mono', monospace; min-width: 0; overflow: hidden; color-scheme: dark; background: #282c34; color: #abb2bf; }
.demo-code :deep(pre) { margin: 0; tab-size: 2; }
.demo-code :deep(pre), .demo-code :deep(code) { -webkit-user-select: text; user-select: text; -webkit-touch-callout: default; }
.demo-code :deep(code) { padding: 18px; font: 13px/1.75 var(--demo-code-font); }
.demo-code :deep(.v-code-block--header) { padding: 8px 16px; border-bottom: 1px solid #ffffff12; }
.demo-code :deep(.v-code-block--label) { width: 100%; color: #b6bdc9; font: 400 12px/20px var(--font); overflow-wrap: anywhere; }
.demo-code-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.demo-code-toolbar > span { min-width: 0; }
.demo-code-copy { display: inline-flex; align-items: center; justify-content: center; flex: none; gap: 6px; appearance: none; min-height: 32px; padding: 6px 8px; border: 0; border-radius: 6px; background: transparent; color: #c8ced8; font: 400 12px/20px var(--font); cursor: pointer; }
.demo-code-copy :deep(svg) { width: 14px; height: 14px; }
.demo-code-copy:hover { background: #ffffff0d; color: #fff; }
.demo-code-copy:disabled { cursor: default; opacity: .7; }
.demo-code-copy:focus-visible { outline: 2px solid #61afef; outline-offset: 2px; }
@media (max-width: 600px) { .demo-code :deep(code) { padding: 16px; } .demo-code :deep(.v-code-block--header) { padding: 8px 12px; } }
@media (pointer: coarse) { .demo-code-copy { min-height: 44px; } }
</style>
