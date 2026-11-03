import type { CodeFile } from './types'

function vue(name: string, source: CodeFile['source']): CodeFile {
  return { name, language: 'vue', source }
}

// 文档优先读取实际页面，独立代码入口保留可复制的最小用法。
const examples: Record<string, CodeFile[]> = {
  tabbar: [vue('pages/home/tabbar/index.vue', () => import('../../pages/home/tabbar/index.vue?raw').then(m => m.default))],
  button: [
    vue(
      'ButtonExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { Button, Icon, Toast } from '@my-ui/vue'

const liked = ref(false)
const toast = ref<InstanceType<typeof Toast>>()
function save() {
  toast.value?.show('已保存')
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <Button @click="save">主要按钮</Button>
    <Button variant="outline" @click="save">镂空按钮</Button>
    <Button variant="text" @click="save">查看详情 <Icon name="chevron-right" /></Button>
    <Button
      variant="icon"
      icon="heart"
      aria-label="收藏"
      :selected="liked"
      @click="liked = !liked"
    />
    <Button icon="check" @click="save">保存</Button>
    <Button disabled>禁用按钮</Button>
  </div>
  <Toast ref="toast" />
</template>`
    )
  ],
  tag: [
    vue(
      'TagExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { Tag, TagGroup, type Option } from '@my-ui/vue'

const direction = ref('灵感')
const directions = ref<string[]>(['灵感'])
const saved = ref(false)
const options: Option[] = [
  { value: '灵感', label: '灵感' },
  { value: '音乐', label: '音乐' },
  { value: '未开放', label: '未开放', disabled: true }
]
</script>

<template>
  <Tag>推荐</Tag>
  <Tag tone="green">已完成</Tag>
  <Tag v-model="saved">稍后阅读</Tag>
  <TagGroup v-model="direction" :options="options" label="单选方向" />
  <!-- 数组值自动使用多选模式。 -->
  <TagGroup v-model="directions" :options="options" label="多选方向" />
</template>`
    )
  ],
  input: [
    vue(
      'InputExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { Input, Select, type Option } from '@my-ui/vue'

const search = ref('')
const nickname = ref('小蓝同学')
const category = ref('design')
const categories: Option[] = [
  { value: 'design', label: '视觉灵感' },
  { value: 'work', label: '效率优先' }
]
</script>

<template>
  <Input v-model="search" label="搜索" icon="search" clearable placeholder="寻找内容…" />
  <Input v-model="nickname" label="昵称" :maxlength="24">
    <template #hint
      ><span>已输入 {{ nickname.length }} / 24 个字符</span></template
    >
  </Input>
  <Select v-model="category" label="内容分类" :options="categories" />
</template>`
    )
  ],
  switch: [
    vue(
      'SwitchExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { CellGroup, ListRow, Switch } from '@my-ui/vue'

const notifications = ref(true)
const silent = ref(false)
</script>

<template>
  <Switch v-model="notifications" label="消息提醒" />
  <CellGroup title="偏好设置">
    <ListRow v-model="silent" toggle title="静音模式" description="享受一段安静时光" />
  </CellGroup>
</template>`
    )
  ],
  slider: [
    vue(
      'SliderExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { Segmented, Slider, type Option } from '@my-ui/vue'

const mode = ref('comfort')
const strength = ref(68)
const options: Option[] = [
  { value: 'comfort', label: '舒适' },
  { value: 'balance', label: '均衡' },
  { value: 'focus', label: '专注' }
]
</script>

<template>
  <Segmented v-model="mode" :options="options" label="浏览方式" />
  <Slider v-model="strength" label="显示强度" :min="0" :max="100" :step="1" unit="%" />
</template>`
    )
  ],
  selection: [
    vue(
      'SelectionExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { Choices, Stepper, type Option } from '@my-ui/vue'

const plan = ref<string | string[]>('standard')
const features = ref<string | string[]>(['cloud'])
const quantity = ref(1)
const plans: Option[] = [
  { value: 'standard', label: '标准体验' },
  { value: 'advanced', label: '进阶体验' }
]
const options: Option[] = [
  { value: 'cloud', label: '云端同步' },
  { value: 'updates', label: '自动更新' }
]
</script>

<template>
  <Choices v-model="plan" label="单选" :options="plans" />
  <Choices v-model="features" type="checkbox" label="复选" :options="options" />
  <Stepper v-model="quantity" :min="1" :max="10" label="数量" />
</template>`
    )
  ],
  navigation: [
    vue(
      'NavigationExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { Navigation, type Option } from '@my-ui/vue'

const current = ref('home')
const options: Option[] = [
  { value: 'home', label: '首页', icon: 'home' },
  { value: 'discover', label: '发现', icon: 'grid' },
  { value: 'messages', label: '消息', icon: 'message' },
  { value: 'profile', label: '我的', icon: 'user' }
]
</script>

<template>
  <p>当前页面：{{ current }}</p>
  <Navigation v-model="current" :options="options" />
</template>`
    )
  ],
  list: [
    vue(
      'ListExample.vue',
      `<script setup lang="ts">
import { ref } from 'vue'
import { CellGroup, Choices, ListRow, Popover, type Option } from '@my-ui/vue'

const theme = ref<string | string[]>('system')
const autoUpdate = ref(true)
const sort = ref('updated')
const themes: Option[] = [
  { value: 'system', label: '跟随系统', description: '自动匹配系统设置' },
  { value: 'dark', label: '深色模式', description: '适合夜间使用' }
]
const sorts: Option[] = [
  { value: 'updated', label: '最近更新' },
  { value: 'created', label: '最近创建' }
]
</script>

<template>
  <Choices v-model="theme" list label="阅读偏好" :options="themes" />
  <CellGroup title="设置与操作">
    <ListRow v-model="autoUpdate" toggle title="自动更新" description="在后台保持内容最新" />
    <Popover v-model="sort" label="排序方式" :options="sorts">
      <template #default="{ toggle, open, controls }">
        <ListRow
          title="排序方式"
          :value="sorts.find((item) => item.value === sort)?.label"
          aria-haspopup="listbox"
          :aria-expanded="open"
          :aria-controls="controls"
          @click="toggle"
        />
      </template>
    </Popover>
  </CellGroup>
</template>`
    )
  ],
  feedback: [
    vue(
      'FeedbackExample.vue',
      `<script setup lang="ts">
import { h, ref } from 'vue'
import { Button, Popup, Toast, popup, type Option } from '@my-ui/vue'
import SharePanel from './SharePanel.vue'

const toast = ref<InstanceType<typeof Toast>>()
const options: Option[] = [
  { value: 'favorite', label: '收藏', icon: 'heart' },
  { value: 'later', label: '稍后阅读', icon: 'clock' }
]
async function confirm() {
  const accepted = await popup.showAlert({
    title: '保存更改？',
    message: '保存后更新设置。',
    confirmText: '保存'
  })
  if (accepted) toast.value?.show('已保存')
}
async function share() {
  const panel = popup.showSheet<Option>({
    title: '分享灵感',
    content: (context) => h(SharePanel, { options, onSelect: context.close })
  })
  const selected = await panel.closed
  if (selected) toast.value?.show(selected.label)
}
</script>

<template>
  <Button @click="toast?.show('已完成')">轻提示</Button>
  <Button @click="confirm">确认弹窗</Button>
  <Button @click="share">底部面板</Button>
  <Toast ref="toast" />
  <!-- 实际应用只需在根组件挂载一次 Popup。 -->
  <Popup />
</template>`
    ),
    vue('SharePanel.vue', () =>
      import('../../components/SharePanel.vue?raw').then((m) => m.default)
    )
  ],
  card: [
    vue('pages/home/card/index.vue', () =>
      import('../../pages/home/card/index.vue?raw').then((m) => m.default)
    )
  ],
  shadows: [
    vue('pages/home/shadows/index.vue', () =>
      import('../../pages/home/shadows/index.vue?raw').then((m) => m.default)
    )
  ],
  identity: [
    vue('pages/home/identity/index.vue', () =>
      import('../../pages/home/identity/index.vue?raw').then((m) => m.default)
    ),
    {
      name: 'commons/assets/avatar-lan.svg',
      language: 'html',
      source: () => import('../assets/avatar-lan.svg?raw').then((m) => m.default)
    }
  ],
  image: [
    vue('pages/home/image/index.vue', () =>
      import('../../pages/home/image/index.vue?raw').then((m) => m.default)
    )
  ],
  'image-preview': [
    vue('pages/home/image-preview/index.vue', () =>
      import('../../pages/home/image-preview/index.vue?raw').then((m) => m.default)
    )
  ],
  'app-bar': [
    vue('pages/home/app-bar/index.vue', () =>
      import('../../pages/home/app-bar/index.vue?raw').then((m) => m.default)
    )
  ],
  'selection-collapse': [
    vue('pages/home/selection-collapse/index.vue', () =>
      import('../../pages/home/selection-collapse/index.vue?raw').then((m) => m.default)
    )
  ],
  combobox: [
    vue('pages/home/combobox/index.vue', () =>
      import('../../pages/home/combobox/index.vue?raw').then((m) => m.default)
    )
  ],
  picker: [
    vue('pages/home/picker/index.vue', () =>
      import('../../pages/home/picker/index.vue?raw').then((m) => m.default)
    )
  ],
  'date-time-picker': [
    vue('pages/home/date-time-picker/index.vue', () =>
      import('../../pages/home/date-time-picker/index.vue?raw').then((m) => m.default)
    )
  ],
  upload: [
    vue('pages/home/upload/index.vue', () =>
      import('../../pages/home/upload/index.vue?raw').then((m) => m.default)
    )
  ],
  primitives: [
    vue('pages/home/primitives/index.vue', () =>
      import('../../pages/home/primitives/index.vue?raw').then((m) => m.default)
    ),
    vue('pages/home/primitives/PlaybackProgress.vue', () =>
      import('../../pages/home/primitives/PlaybackProgress.vue?raw').then((m) => m.default)
    ),
    vue('pages/home/primitives/SliderExample.vue', () =>
      import('../../pages/home/primitives/SliderExample.vue?raw').then((m) => m.default)
    )
  ],
  'notice-steps': [
    vue('pages/home/notice-steps/index.vue', () =>
      import('../../pages/home/notice-steps/index.vue?raw').then((m) => m.default)
    )
  ],
  popup: [
    vue('pages/home/popup/index.vue', () =>
      import('../../pages/home/popup/index.vue?raw').then((m) => m.default)
    ),
    vue('SelectionPanel.vue', () =>
      import('../../components/SelectionPanel.vue?raw').then((m) => m.default)
    ),
    vue('DrawerExample.vue', () =>
      import('../../components/DrawerExample.vue?raw').then((m) => m.default)
    )
  ],
  menu: [
    vue('pages/home/menu/index.vue', () =>
      import('../../pages/home/menu/index.vue?raw').then((m) => m.default)
    )
  ],
  'touch-gestures': [
    vue('pages/home/touch-gestures/index.vue', () =>
      import('../../pages/home/touch-gestures/index.vue?raw').then((m) => m.default)
    )
  ],
  'pull-refresh': [
    vue('pages/home/pull-refresh/index.vue', () =>
      import('../../pages/home/pull-refresh/index.vue?raw').then((m) => m.default)
    )
  ],
  scenarios: [
    vue('pages/home/scenarios/index.vue', () =>
      import('../../pages/home/scenarios/index.vue?raw').then((m) => m.default)
    ),
    vue('pages/home/scenarios/ProfileFormExample.vue', () =>
      import('../../pages/home/scenarios/ProfileFormExample.vue?raw').then((m) => m.default)
    ),
    {
      name: 'profile.ts',
      language: 'typescript',
      source: () => import('../../pages/home/scenarios/profile.ts?raw').then((m) => m.default)
    }
  ],
  showcase: [
    vue('ShowcaseLayout.vue', () =>
      import('../../components/ShowcaseLayout.vue?raw').then((m) => m.default)
    )
  ],
  'native-html': [
    {
      name: 'native.html',
      language: 'html',
      source: () => import('../../../../others/native.html?raw').then((m) => m.default)
    }
  ],
  'native-navigation': [
    vue('pages/native/navigation/index.vue', () =>
      import('../../pages/native/navigation/index.vue?raw').then((m) => m.default)
    ),
    {
      name: 'commons/navigation.ts',
      language: 'typescript',
      source: () => import('../navigation.ts?raw').then((m) => m.default)
    },
    {
      name: 'commons/native-context.ts',
      language: 'typescript',
      source: () => import('../native-context.ts?raw').then((m) => m.default)
    },
    {
      name: 'commons/state/shared.ts',
      language: 'typescript',
      source: () => import('../state/shared.ts?raw').then((m) => m.default)
    },
    {
      name: 'commons/state/storage.ts',
      language: 'typescript',
      source: () => import('../state/storage.ts?raw').then((m) => m.default)
    }
  ]
}

/** 按目录标识取得示例代码，相关源文件只在展开时读取。 */
export function exampleCode(id: string): readonly CodeFile[] {
  return examples[id] ?? []
}
