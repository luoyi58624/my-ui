<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@my-ui/vue'
import 'highlight.js/styles/atom-one-dark.css'
import type { CodeLanguage } from './code/types'

const props = withDefaults(
  defineProps<{
    /** 需要展示和复制的原始代码。 */
    code: string
    /** 代码的高亮语言。 */
    language?: CodeLanguage
    /** 当前代码的文件名。 */
    filename?: string
  }>(),
  { language: 'vue', filename: '' }
)

const highlighted = ref(''),
  status = ref<'idle' | 'success' | 'failed'>('idle')
let version = 0,
  reset: ReturnType<typeof setTimeout> | undefined
const lang = computed(() => {
  if (props.language === 'vue') return 'html'
  if (props.language === 'text') return 'plaintext'
  if (props.language === 'shellscript') return 'bash'
  return props.language
})
const lines = computed(() => props.code.split('\n').length)
const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
watch(
  [() => props.code, lang],
  async () => {
    const request = ++version
    status.value = 'idle'
    highlighted.value = escape(props.code)
    try {
      const { default: highlighter } = await import('highlight.js')
      if (request === version && highlighter.getLanguage(lang.value))
        highlighted.value = highlighter.highlight(props.code, { language: lang.value }).value
    } catch {
      /* 高亮加载失败时仍可阅读和复制原始代码。 */
    }
  },
  { immediate: true }
)
async function copy() {
  clearTimeout(reset)
  try {
    try {
      await navigator.clipboard.writeText(props.code)
    } catch {
      const previous = document.activeElement as HTMLElement | null
      const input = document.createElement('textarea')
      input.value = props.code
      input.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
      document.body.append(input)
      input.select()
      try {
        if (!document.execCommand('copy')) throw new Error('复制不可用')
      } finally {
        input.remove()
        previous?.focus({ preventScroll: true })
      }
    }
    status.value = 'success'
  } catch {
    status.value = 'failed'
  }
  reset = setTimeout(() => {
    status.value = 'idle'
  }, 2200)
}
onBeforeUnmount(() => {
  version++
  clearTimeout(reset)
})
</script>

<template>
  <div class="demo-code" data-code-theme="atom-one-dark">
    <div class="demo-code-toolbar">
      <span class="demo-code-filename">
        {{ filename || language }}
        <small>{{ lines }} 行</small>
      </span>
      <button
        type="button"
        class="demo-code-copy"
        :aria-label="`复制 ${filename || language} 代码`"
        aria-live="polite"
        @click="copy"
      >
        <Icon :name="status === 'success' ? 'check' : 'copy'" />
        {{
          status === 'success'
            ? '已复制'
            : status === 'failed'
              ? '复制失败，请手动选择'
              : '复制代码'
        }}
      </button>
    </div>
    <pre
      tabindex="0"
      :aria-label="(filename || language) + '代码，可横向滚动'"
    ><span class="demo-code-lines" aria-hidden="true">{{ Array.from({ length: lines }, (_, index) => index + 1).join('\n') }}</span><code class="hljs" v-html="highlighted" /></pre>
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
.demo-code {
  --demo-code-font: 'MyUI Demo Consolas', Consolas, 'SFMono-Regular', 'Liberation Mono', monospace;
  min-width: 0;
  overflow: hidden;
  color-scheme: dark;
  background: #282c34;
  color: #abb2bf;
  /* 代码区独立使用常规字重，正文、行号和工具栏不受全局字重影响。 */
  font-weight: 400;
}
.demo-code pre {
  display: flex;
  /* 长代码随页面展开，只在横向溢出时滚动，避免截断整页滚动。 */
  overflow-x: auto;
  overflow-y: hidden;
  margin: 0;
  padding: 20px 0;
  tab-size: 2;
  scrollbar-width: thin;
  scrollbar-color: #59616e #282c34;
}
.demo-code pre:focus-visible {
  outline: 2px solid #61afef;
  outline-offset: -2px;
}
/* 正文与行号沿用代码区字重，仅单独设置等宽字体和排版。 */
.demo-code code,
.demo-code-lines {
  font-family: var(--demo-code-font);
  font-size: 13px;
  line-height: 1.85;
}
.demo-code code {
  display: block;
  flex: 1;
  min-width: max-content;
  padding: 0 24px 0 16px;
  background: #282c34;
  -webkit-user-select: text;
  user-select: text;
  -webkit-touch-callout: default;
}
.demo-code-lines {
  position: sticky;
  left: 0;
  z-index: 1;
  flex: none;
  min-width: 42px;
  padding: 0 12px;
  border-right: 1px solid #ffffff0d;
  background: #282c34;
  color: #68707e;
  text-align: right;
  user-select: none;
}
.demo-code-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid #ffffff12;
  color: #c2c8d2;
  font-size: 12px;
  line-height: 20px;
}
.demo-code-filename {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  min-width: 0;
  overflow-wrap: anywhere;
}
.demo-code-filename small {
  color: #8992a1;
  font-size: 11px;
  white-space: nowrap;
}
.demo-code-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  gap: 6px;
  appearance: none;
  min-height: 32px;
  padding: 6px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #c8ced8;
  font-size: 12px;
  font-weight: inherit;
  line-height: 20px;
  cursor: pointer;
}
.demo-code-copy :deep(svg) {
  width: 14px;
  height: 14px;
}
.demo-code-copy:hover {
  background: #ffffff0d;
  color: #fff;
}
.demo-code-copy:disabled {
  cursor: default;
  opacity: 0.7;
}
.demo-code-copy:focus-visible {
  outline: 2px solid #61afef;
  outline-offset: 2px;
}
@media (max-width: 600px) {
  .demo-code code {
    padding-right: 16px;
    padding-left: 12px;
  }
  .demo-code-toolbar {
    padding: 8px 12px;
  }
  .demo-code-lines {
    min-width: 34px;
    padding-inline: 8px;
  }
}
@media (pointer: coarse) {
  .demo-code-copy {
    min-height: 44px;
  }
}
</style>
