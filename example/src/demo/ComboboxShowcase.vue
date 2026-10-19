<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Avatar, Badge, Button, Card, Combobox, type Option } from '@my-ui/vue'

const city = ref('hangzhou'), member = ref('lan'), remote = ref('')
const cities: Option[] = [
  { value: 'hangzhou', label: '杭州', description: '西湖与山间，城市与自然' },
  { value: 'shanghai', label: '上海', description: '沿着街角，发现新的灵感' },
  { value: 'chengdu', label: '成都', description: '慢一点，享受日常的松弛' },
  { value: 'shenzhen', label: '深圳', description: '在海边，遇见新的可能' },
  { value: 'xiamen', label: '厦门', description: '海风里的一段悠闲时光' },
  { value: 'beijing', label: '北京', description: '暂不可选择', disabled: true },
]
const members: Option[] = [
  { value: 'lan', label: '小蓝同学', description: '产品设计 · 在线' },
  { value: 'qing', label: '小青', description: '前端开发 · 在线' },
  { value: 'yun', label: '云间', description: '内容编辑 · 暂离' },
]
const projects = ref<Option[]>([]), loading = ref(false)
const catalog: Option[] = [{ value: 'design', label: 'my-ui 设计系统', description: '组件、交互与视觉规范' }, { value: 'notes', label: '日常灵感笔记', description: '把值得留下的瞬间收好' }, { value: 'travel', label: '周末旅行计划', description: '安排下一次轻松的出发' }]
let timer: ReturnType<typeof setTimeout> | undefined
function search(query: string) {
  clearTimeout(timer); loading.value = true
  timer = setTimeout(() => { projects.value = catalog.filter(option => (option.label + option.description).includes(query.trim())); loading.value = false }, 550)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Card id="combobox" class="combobox-card" title="搜索选择" description="输入关键词，从候选项里快速找到答案" sample="COMBOBOX">
    <div class="combobox-examples">
      <Combobox v-model="city" label="目的地" :options="cities" clearable hint="可搜索中文名称或城市英文名" />
      <Combobox v-model="member" label="协作成员" :options="members" clearable>
        <template #option-leading="{ option }"><Badge class="member-status" dot :hidden="option.value === 'yun'" :label="option.label + '在线'" aria-hidden="true"><Avatar :text="option.label.slice(0, 1)" :alt="option.label" :size="30" /></Badge></template>
      </Combobox>
      <Combobox v-model="remote" label="查找项目" :options="projects" :filter="false" :loading="loading" clearable placeholder="输入项目关键词…" hint="模拟异步搜索，等待结束后展示匹配结果" @search="search" />
      <Combobox model-value="hangzhou" label="已停用的选择" :options="cities" disabled />
    </div>
    <div class="combobox-foot"><span>已选目的地：{{ cities.find(option => option.value === city)?.label ?? '未选择' }}</span><Button variant="text" @click="city = 'hangzhou'; member = 'lan'; remote = ''">重置选择</Button></div>
  </Card>
</template>

<style scoped>
.combobox-card { scroll-margin-top: 120px; }
.member-status { --badge-background: var(--success); }
.combobox-examples { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 22px; }
.combobox-foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 22px; color: var(--text-secondary); font-size: 13px; }
@media (max-width:600px) { .combobox-examples { grid-template-columns: 1fr; gap: 24px; } }
</style>
