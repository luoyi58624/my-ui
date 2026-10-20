<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@my-ui/vue'
import CodeBlock from './CodeBlock.vue'
import type { CodeFile } from './code/types'

const props = defineProps<{
  /** 当前示例的用法代码与相关源文件。 */
  files: readonly CodeFile[]
  /** 折叠栏标题。 */
  title?: string
  /** 是否默认展开代码。 */
  open?: boolean
}>()
const selected = ref(''),
  code = ref(''),
  error = ref(''),
  loading = ref(false)
const expanded = ref(props.open ?? false)
const rendered = ref(expanded.value)
const body = ref<HTMLElement>(),
  content = ref<HTMLElement>()
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
let motion: Animation | undefined
const resize = new ResizeObserver(() => {
  if (expanded.value && rendered.value) animate(true)
})

function animate(open: boolean) {
  const element = body.value,
    inner = content.value
  if (!element || !inner) return
  // 从正在显示的高度接续，连续切换和异步加载都不会跳回动画起点。
  const height = element.getBoundingClientRect().height
  const opacity = getComputedStyle(element).opacity
  motion?.cancel()
  const target = open ? inner.getBoundingClientRect().height : 0
  const finish = () => {
    motion = undefined
    element.style.height = open ? 'auto' : '0px'
    element.style.opacity = open ? '1' : '0'
    if (!open && !expanded.value) rendered.value = false
  }
  element.style.height = target + 'px'
  element.style.opacity = open ? '1' : '0'
  if (reducedMotion.matches || Math.abs(height - target) < 0.5) {
    finish()
    return
  }
  const animation = element.animate(
    [
      { height: height + 'px', opacity },
      { height: target + 'px', opacity: open ? '1' : '0' }
    ],
    { duration: open ? 260 : 200, easing: 'cubic-bezier(.22, 1, .36, 1)' }
  )
  motion = animation
  animation.onfinish = () => {
    if (motion === animation) finish()
  }
}
async function toggle() {
  expanded.value = !expanded.value
  if (expanded.value) {
    rendered.value = true
    await nextTick()
  }
  animate(expanded.value)
}
function reduce() {
  if (motion) animate(expanded.value)
}
watch(
  content,
  (element) => {
    resize.disconnect()
    if (element) resize.observe(element)
  },
  { flush: 'post' }
)
onMounted(() => {
  if (expanded.value && body.value) {
    body.value.style.height = 'auto'
    body.value.style.opacity = '1'
  }
  reducedMotion.addEventListener('change', reduce)
})
const current = computed(
  () => props.files.find((file) => file.name === selected.value) ?? props.files[0]
)
let version = 0
watch(
  () => props.files,
  () => {
    selected.value = props.files[0]?.name ?? ''
  }
)

async function load() {
  const file = current.value,
    request = ++version
  error.value = ''
  code.value = ''
  loading.value = expanded.value && !!file
  if (!expanded.value || !file) return
  try {
    const result = typeof file.source === 'string' ? file.source : await file.source()
    if (request === version) code.value = result.trim()
  } catch {
    if (request === version) error.value = '代码读取失败，请重试。'
  } finally {
    if (request === version) loading.value = false
  }
}
watch(
  [current, expanded],
  () => {
    if (expanded.value) void load()
    else version++
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  version++
  motion?.cancel()
  resize.disconnect()
  reducedMotion.removeEventListener('change', reduce)
})
</script>

<template>
  <details class="demo-code-files" :open="rendered" :data-expanded="expanded">
    <summary :aria-expanded="expanded" @click.prevent="toggle">
      <span class="demo-code-heading">
        <Icon name="file" />
        <span>{{ title || '用法代码' }}</span>
        <span v-if="files.length > 1" class="demo-code-count">{{ files.length }} 个文件</span>
      </span>
      <span class="demo-code-toggle">
        {{ expanded ? '收起代码' : '展开代码' }}
        <Icon name="chevron-right" />
      </span>
    </summary>
    <div
      v-if="rendered"
      ref="body"
      class="demo-code-motion"
      :inert="!expanded"
      :aria-hidden="!expanded"
      style="height: 0; opacity: 0"
    >
      <div ref="content" class="demo-code-body">
        <div
          v-if="files.length > 1"
          class="demo-code-file-list"
          role="group"
          aria-label="选择代码文件"
        >
          <button
            v-for="file in files"
            :key="file.name"
            type="button"
            :aria-pressed="current?.name === file.name"
            @click="selected = file.name"
          >
            {{ file.name }}
          </button>
        </div>
        <p v-if="loading" class="demo-code-loading" role="status">正在读取代码…</p>
        <p v-else-if="error" class="demo-code-error" role="alert">
          {{ error }}
          <button type="button" @click="load">重试</button>
        </p>
        <CodeBlock
          v-else-if="current"
          :code="code"
          :language="current.language"
          :filename="current.name"
        />
      </div>
    </div>
  </details>
</template>

<style scoped>
.demo-code-files {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card-background);
}
.demo-code-files summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 10px 16px;
  list-style: none;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  font-weight: var(--font-weight-action, 500);
  line-height: 22px;
}
.demo-code-files summary::-webkit-details-marker {
  display: none;
}
.demo-code-files summary:hover {
  background: var(--fill);
}
.demo-code-files summary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -3px;
  border-radius: 12px;
}
.demo-code-heading,
.demo-code-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.demo-code-heading {
  min-width: 0;
}
.demo-code-heading :deep(svg) {
  flex: none;
  width: 17px;
  height: 17px;
  color: var(--text-secondary);
}
.demo-code-count {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: var(--font-weight, 400);
  white-space: nowrap;
}
.demo-code-toggle {
  flex: none;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--font-weight, 400);
  white-space: nowrap;
}
.demo-code-toggle :deep(svg) {
  width: 15px;
  height: 15px;
  transition: transform 0.15s;
}
.demo-code-files[data-expanded='true'] .demo-code-toggle :deep(svg) {
  transform: rotate(90deg);
}
.demo-code-body {
  border-top: 1px solid var(--border);
}
.demo-code-motion {
  overflow: hidden;
}
.demo-code-file-list {
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
  scrollbar-width: thin;
}
.demo-code-file-list button {
  appearance: none;
  flex: none;
  max-width: 100%;
  min-height: 32px;
  overflow-wrap: anywhere;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 5px 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: inherit;
  line-height: 20px;
  cursor: pointer;
}
.demo-code-file-list button:hover {
  background: var(--fill);
}
.demo-code-file-list button[aria-pressed='true'] {
  color: var(--text);
  border-color: var(--border);
  background: var(--fill);
}
.demo-code-file-list button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.demo-code-loading,
.demo-code-error {
  margin: 0;
  padding: 24px 16px;
  background: var(--fill);
  color: var(--text-secondary);
  font-size: 13px;
}
.demo-code-error button {
  color: var(--primary);
  background: none;
  border: 0;
  cursor: pointer;
}
@media (pointer: coarse) {
  .demo-code-file-list button {
    min-height: 44px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .demo-code-toggle :deep(svg) {
    transition: none;
  }
}
</style>
