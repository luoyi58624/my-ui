import type { CodeFile } from './types'
import { appBarCode, tabbarCode, pageCode, tabsCode } from './native'
import { appExampleFiles } from './app'

function vue(name: string, source: CodeFile['source']): CodeFile {
  return { name, language: 'vue', source }
}

// 独立示例直接读取原文件；内联在 App 中的示例提供可独立使用的最小组件。
const examples: Record<string, CodeFile[]> = {
  'native-app': [...appExampleFiles['app-basic']!],
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
    vue('SharePanel.vue', () => import('../../components/SharePanel.vue?raw').then((m) => m.default))
  ],
  card: [vue('CardShowcase.vue', () => import('../../demo/CardShowcase.vue?raw').then((m) => m.default))],
  shadows: [
    vue('ShadowShowcase.vue', () => import('../../demo/ShadowShowcase.vue?raw').then((m) => m.default))
  ],
  identity: [
    vue('IdentityShowcase.vue', () => import('../../demo/IdentityShowcase.vue?raw').then((m) => m.default)),
    {
      name: 'assets/avatar-lan.svg',
      language: 'html',
      source: () => import('../assets/avatar-lan.svg?raw').then((m) => m.default)
    }
  ],
  image: [
    vue('ImageShowcase.vue', () => import('../../demo/ImageShowcase.vue?raw').then((m) => m.default))
  ],
  'app-bar': [
    vue('AppBarShowcase.vue', () => import('../../demo/AppBarShowcase.vue?raw').then((m) => m.default))
  ],
  'selection-collapse': [
    vue('SelectionCollapseShowcase.vue', () =>
      import('../../demo/SelectionCollapseShowcase.vue?raw').then((m) => m.default)
    )
  ],
  combobox: [
    vue('ComboboxShowcase.vue', () => import('../../demo/ComboboxShowcase.vue?raw').then((m) => m.default))
  ],
  picker: [
    vue('PickerShowcase.vue', () => import('../../demo/PickerShowcase.vue?raw').then((m) => m.default))
  ],
  'date-time-picker': [
    vue('DateTimeShowcase.vue', () => import('../../demo/DateTimeShowcase.vue?raw').then((m) => m.default))
  ],
  upload: [
    vue('UploadShowcase.vue', () => import('../../demo/UploadShowcase.vue?raw').then((m) => m.default))
  ],
  primitives: [
    vue('FeedbackPrimitives.vue', () =>
      import('../../demo/FeedbackPrimitives.vue?raw').then((m) => m.default)
    ),
    vue('PlaybackProgress.vue', () => import('../../demo/PlaybackProgress.vue?raw').then((m) => m.default)),
    vue('SliderShowcase.vue', () => import('../../demo/SliderShowcase.vue?raw').then((m) => m.default))
  ],
  'notice-steps': [
    vue('NoticeStepsShowcase.vue', () =>
      import('../../demo/NoticeStepsShowcase.vue?raw').then((m) => m.default)
    )
  ],
  popup: [
    vue('PopupShowcase.vue', () => import('../../demo/PopupShowcase.vue?raw').then((m) => m.default)),
    vue('SelectionPanel.vue', () => import('../../components/SelectionPanel.vue?raw').then((m) => m.default)),
    vue('DrawerExample.vue', () => import('../../components/DrawerExample.vue?raw').then((m) => m.default))
  ],
  menu: [vue('MenuShowcase.vue', () => import('../../demo/MenuShowcase.vue?raw').then((m) => m.default))],
  'touch-gestures': [
    vue('TouchShowcase.vue', () => import('../../demo/TouchShowcase.vue?raw').then((m) => m.default))
  ],
  scenarios: [
    vue('EssentialsShowcase.vue', () =>
      import('../../demo/EssentialsShowcase.vue?raw').then((m) => m.default)
    ),
    vue('ProfileFormExample.vue', () =>
      import('../../demo/ProfileFormExample.vue?raw').then((m) => m.default)
    ),
    {
      name: 'profile.ts',
      language: 'typescript',
      source: () => import('../../demo/profile.ts?raw').then((m) => m.default)
    }
  ],
  showcase: [
    vue('ShowcaseLayout.vue', () => import('../../components/ShowcaseLayout.vue?raw').then((m) => m.default))
  ],
  'native-html': [
    {
      name: 'native.html',
      language: 'html',
      source: () => import('../../../native.html?raw').then((m) => m.default)
    }
  ],
  'native-app-bar': [vue('AppBarExample.vue', appBarCode)],
  'native-tabbar': [vue('TabbarExample.vue', tabbarCode)],
  'native-tabs': [vue('TabsExample.vue', tabsCode)],
  'page-refresh': [vue('PageExample.vue', pageCode)],
  'native-navigation': [
    vue('NativeNavigationShowcase.vue', () =>
      import('../../demo/NativeNavigationShowcase.vue?raw').then((m) => m.default)
    ),
    {
      name: '../navigation.ts',
      language: 'typescript',
      source: () => import('../navigation.ts?raw').then((m) => m.default)
    },
    {
      name: '../native-context.ts',
      language: 'typescript',
      source: () => import('../native-context.ts?raw').then((m) => m.default)
    },
    {
      name: '../stores/shared.ts',
      language: 'typescript',
      source: () => import('../state/shared.ts?raw').then((m) => m.default)
    },
    {
      name: '../stores/storage.ts',
      language: 'typescript',
      source: () => import('../state/storage.ts?raw').then((m) => m.default)
    }
  ]
}

/** 按目录标识取得示例代码，相关源文件只在展开时读取。 */
export function exampleCode(id: string): readonly CodeFile[] {
  return examples[id] ?? []
}
