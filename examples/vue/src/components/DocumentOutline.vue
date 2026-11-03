<script setup lang="ts">
defineProps<{
  /** 按阅读顺序提供目录标识、标题和锚点地址。 */
  items: readonly { id: string; title: string; href: string }[]
  /** 当前阅读章节的标识。 */
  value: string
}>()
const emit = defineEmits<{
  /** 交给所在页面定位章节，并保留当前路由。 */
  select: [id: string]
}>()
</script>

<template>
  <aside class="doc-outline" aria-label="本页目录">
    <nav>
      <h2>本页目录</h2>
      <a
        v-for="item in items"
        :key="item.id"
        :href="item.href"
        :aria-current="value === item.id ? 'location' : undefined"
        @click.prevent="emit('select', item.id)"
      >
        {{ item.title }}
      </a>
    </nav>
  </aside>
</template>

<style scoped>
.doc-outline {
  position: fixed;
  top: calc(96px + env(safe-area-inset-top));
  right: max(32px, env(safe-area-inset-right));
  z-index: 10;
  width: var(--doc-outline-width, 192px);
  min-width: 0;
  max-height: calc(100dvh - 128px - env(safe-area-inset-top));
  overflow-y: auto;
  scrollbar-width: thin;
}
.doc-outline nav {
  padding-left: 16px;
  border-left: 1px solid var(--border);
}
.doc-outline h2 {
  margin: 0 0 12px;
  color: var(--text);
  font-size: 12px;
  font-weight: var(--font-weight-subtitle, 600);
}
.doc-outline a {
  display: block;
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.65;
  text-decoration: none;
}
.doc-outline a:hover,
.doc-outline a[aria-current] {
  color: var(--primary);
}
.doc-outline a[aria-current] {
  position: relative;
  font-weight: var(--font-weight-action, 500);
}
.doc-outline a[aria-current]::before {
  position: absolute;
  inset: 8px auto 8px -17px;
  width: 2px;
  background: var(--primary);
  content: '';
}
.doc-outline a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
:global(html.my-mobile-native .doc-outline) {
  display: none;
}
@media (max-width: 1024px) {
  .doc-outline {
    display: none;
  }
}
</style>
