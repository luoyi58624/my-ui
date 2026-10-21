<script setup lang="ts">
import DemoExample from '../components/DemoExample.vue'
import { ref } from 'vue'
import { AppBar, Button, Card, Icon, Menu } from '@my-ui/vue'

const emit = defineEmits<{ notify: [message: string] }>()
const centered = ref(true)
const options = [
  { value: 'sort', label: '整理收藏', icon: 'layer' as const },
  { value: 'share', label: '分享空间', icon: 'share' as const }
]
</script>

<template>
  <DemoExample
    name="app-bar"
    source="AppBarShowcase.vue"
    id="app-bar"
    title="标题与操作区"
    description="组合标题、返回与右侧操作，切换居中设置观察标题的位置。"
  >
    <div class="app-bar-window">
      <AppBar
        title="我的收藏"
        subtitle="把喜欢的，留在这里"
        back
        sticky
        :center="centered"
        @back="emit('notify', '已点击返回')"
      >
        <template #actions>
          <Button
            variant="bare"
            icon="search"
            aria-label="搜索收藏"
            @click="emit('notify', '搜索收藏')"
          />
          <Menu :options="options" @select="(item) => emit('notify', item.label)">
            <template #default="{ trigger }">
              <Button v-bind="trigger" variant="bare" icon="grid" aria-label="收藏操作" />
            </template>
          </Menu>
        </template>
      </AppBar>
      <div class="app-bar-content">
        <Icon name="heart" />
        <strong>一点日常的好风景</strong>
        <p>顶栏与页面内容各有自己的位置。滚动这块区域，顶栏会留在顶部。</p>
        <div v-for="item in 4" :key="item" class="app-bar-placeholder">
          <Icon :name="item % 2 ? 'image' : 'inbox'" />
          <span>
            {{ ['周末的散步', '随手记下的灵感', '旅途中的照片', '等待完成的计划'][item - 1] }}
          </span>
        </div>
      </div>
    </div>
    <div class="app-bar-note">
      <span>左右操作区宽度不同，居中标题也保持对齐。</span>
      <Button variant="text" @click="centered = !centered">
        {{ centered ? '标题靠左' : '标题居中' }}
      </Button>
    </div>
  </DemoExample>
</template>

<style scoped>
#app-bar {
  scroll-margin-top: 110px;
}
.app-bar-window {
  max-width: 520px;
  height: 300px;
  margin: auto;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--fill);
}
.app-bar-content {
  padding: 24px;
}
.app-bar-content > :deep(svg) {
  display: block;
  width: 28px;
  height: 28px;
  margin-bottom: 14px;
  color: var(--primary);
}
.app-bar-content > strong {
  font-size: 16px;
}
.app-bar-content > p {
  margin: 12px 0 20px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
}
.app-bar-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 13px;
}
.app-bar-placeholder :deep(svg) {
  width: 19px;
  height: 19px;
}
.app-bar-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.7;
}
</style>
