<script setup lang="ts">
import { computed, defineAsyncComponent, h, reactive, ref } from 'vue'
import DemoLayout from './DemoLayout.vue'
import { openPage } from './navigation'
import NativeNavigationShowcase from './demo/NativeNavigationShowcase.vue'
import EssentialsShowcase from './demo/EssentialsShowcase.vue'
import PopupShowcase from './demo/PopupShowcase.vue'
import MenuShowcase from './demo/MenuShowcase.vue'
import FeedbackPrimitives from './demo/FeedbackPrimitives.vue'
import SelectionCollapseShowcase from './demo/SelectionCollapseShowcase.vue'
import IdentityShowcase from './demo/IdentityShowcase.vue'
import CardShowcase from './demo/CardShowcase.vue'
import ImageShowcase from './demo/ImageShowcase.vue'
import ShadowShowcase from './demo/ShadowShowcase.vue'
import TouchShowcase from './demo/TouchShowcase.vue'
import ComboboxShowcase from './demo/ComboboxShowcase.vue'
import PickerShowcase from './demo/PickerShowcase.vue'
import DateTimeShowcase from './demo/DateTimeShowcase.vue'
import UploadShowcase from './demo/UploadShowcase.vue'
import AppBarShowcase from './demo/AppBarShowcase.vue'
import NoticeStepsShowcase from './demo/NoticeStepsShowcase.vue'
import SharePanel from './demo/SharePanel.vue'
import {
  Button, Card, CellGroup, TagGroup, Choices, Icon, Input,
  ListRow, Menu, Navigation, Popover, Segmented, Select, popup,
  Slider, Stepper, Tag, Toast, type Option, type IconName,
} from '@my-ui/vue'

const props = defineProps<{
  /** 按需加载旧版整页示例，组件和交互与独立示例共用。 */
  showcase?: boolean
}>()
const ShowcaseLayout = defineAsyncComponent(() => import('./ShowcaseLayout.vue'))
const layout = computed(() => props.showcase ? ShowcaseLayout : DemoLayout)

const toast = ref<InstanceType<typeof Toast>>()
function notify(message: string) { toast.value?.show(message) }
function openHtmlExample() {
  void openPage('/html', { title: '原生 HTML 示例' })
    .catch(error => notify(error instanceof Error ? error.message : String(error)))
}
function readSaved(key: string) {
  try { return (localStorage.getItem('my-ui:' + key) ?? localStorage.getItem('chenglan:' + key)) === 'true' } catch { return false }
}
function saveFlag(key: string, value: boolean) {
  try { localStorage.setItem('my-ui:' + key, String(value)) } catch { /* 存储不可用时仍保留本页交互。 */ }
}
const liked = ref(readSaved('liked'))
function toggleLike() {
  liked.value = !liked.value
  saveFlag('liked', liked.value)
  notify(liked.value ? '已加入收藏' : '已取消收藏')
}
const direction = ref('灵感')
const selectedTag = ref(false)
const multiDirections = ref<string[]>(['灵感'])
const directions: Option[] = [
  { value: '灵感', label: '✨ 灵感' }, { value: '云端', label: '☁️ 云端' },
  { value: '发现', label: '✦ 发现' }, { value: '音乐', label: '♫ 音乐' },
]
const search = ref('')
const nickname = ref('小蓝同学')
const category = ref('视觉灵感')
const categories: Option[] = ['视觉灵感', '效率优先', '轻度探索'].map(value => ({ value, label: value }))
const preferences = reactive([
  { title: '消息提醒', description: '重要通知，及时送达', icon: 'bell' as IconName, on: true },
  { title: '静音模式', description: '享受一段安静时光', icon: 'moon' as IconName, on: false },
  { title: '隐私保护', description: '为每一份安心加分', icon: 'shield' as IconName, on: true },
])
const enabledCount = computed(() => preferences.filter(item => item.on).length)
const mode = ref('comfort')
const modes: Option[] = [
  { value: 'comfort', label: '舒适', description: '让每一次浏览都更轻松', icon: 'spark' },
  { value: 'balance', label: '均衡', description: '美感与效率，刚刚好', icon: 'sliders' },
  { value: 'focus', label: '专注', description: '聚焦眼前的重要内容', icon: 'briefcase' },
]
const activeMode = computed(() => modes.find(item => item.value === mode.value) ?? modes[0]!)
const strength = ref(68)
const customStrength = ref(36)
const plan = ref<string | string[]>('standard')
const plans: Option[] = [{ value: 'standard', label: '标准体验' }, { value: 'advanced', label: '进阶体验' }, { value: 'professional', label: '专业体验' }]
const features = ref<string | string[]>(['cloud'])
const featureOptions: Option[] = [{ value: 'cloud', label: '云端同步' }, { value: 'updates', label: '自动更新' }, { value: 'notifications', label: '消息提醒' }]
const quantity = ref(1)
const navigation = ref('home')
const navOptions: Option[] = [
  { value: 'home', label: '首页', icon: 'home' }, { value: 'discover', label: '发现', icon: 'grid' },
  { value: 'messages', label: '消息', icon: 'message' }, { value: 'profile', label: '我的', icon: 'user' },
]
const readerTheme = ref<string | string[]>('system')
const readerOptions: Option[] = [
  { value: 'system', label: '跟随系统', description: '自动匹配系统设置' },
  { value: 'light', label: '浅色模式', description: '明亮柔和的显示效果' },
  { value: 'dark', label: '深色模式', description: '适合夜间使用' },
]
const syncContent = ref<string | string[]>(['documents', 'images'])
const syncOptions: Option[] = [
  { value: 'documents', label: '同步文档', description: '多设备持续更新' },
  { value: 'images', label: '同步图片', description: '保留珍贵的视觉记录' },
  { value: 'favorites', label: '同步收藏', description: '随时找回喜欢的内容' },
]
const autoUpdate = ref(true)
const sort = ref('最近更新')
const sortOptions: Option[] = ['最近更新', '最近创建', '名称排序'].map(value => ({ value, label: value }))
async function openDialog() {
  if (await popup.showAlert({ title: '确认保存更改？', message: '保存后将同步更新你的设置。你也可以稍后再进行调整。', confirmText: '确认保存' })) notify('设置已保存')
}
async function openSheet() {
  const panel = popup.showSheet<Option>({
    title: '分享这份灵感',
    content: context => h(SharePanel, { options: sheetActions, onSelect: context.close }),
  })
  const action = await panel.closed
  if (action) void selectAction(action)
}
const sheetActions: Option[] = [
  { value: 'copy', label: '复制链接', icon: 'copy' },
  { value: 'favorite', label: '收藏到本地', icon: 'heart' },
  { value: 'later', label: '稍后查看', icon: 'clock' },
]
const laterSaved = ref(readSaved('later'))
async function selectAction(action: Option) {
  if (action.value === 'copy') {
    try { await navigator.clipboard.writeText(window.location.href); notify('链接已复制') }
    catch { notify('浏览器未允许复制，请从地址栏复制链接') }
  } else if (action.value === 'favorite') {
    liked.value = true
    saveFlag('liked', true)
    notify('已收藏到本地')
  } else {
    laterSaved.value = true
    saveFlag('later', true)
    notify('已加入稍后查看')
  }
}
</script>

<template>
  <component :is="layout" @navigation-error="notify">
    <template #button>
      <section id="buttons">
        <Card title="操作按钮" description="柔和而明确的操作层级" sample="BUTTONS">
          <div class="button-showcase">
            <div class="button-example"><div class="button-group-title">基础按钮</div><div class="btn-row"><Button @click="notify('主要操作已执行')">主要按钮</Button><Button variant="outline" @click="notify('镂空按钮已点击')">镂空按钮</Button><Button variant="text" @click="notify('已打开详情')">文本按钮 <Icon name="chevron-right" /></Button></div></div>
            <div class="button-example"><div class="button-group-title">图标按钮</div><div class="icon-actions"><Button variant="icon" icon="heart" aria-label="收藏" :selected="liked" :style="liked ? { color: 'var(--danger)' } : undefined" @click="toggleLike" /><Button variant="icon" icon="share" aria-label="分享" @click="openSheet" /><Button variant="icon" icon="add" aria-label="添加" @click="notify('已添加新项目（原型示例）')" /><Menu :options="sheetActions" label="更多操作" @select="selectAction"><template #default="{ trigger }"><Button v-bind="trigger" variant="bare" icon="grid" aria-label="更多" /></template></Menu></div></div>
            <div class="button-example"><div class="button-group-title">其他状态</div><div class="btn-row"><Button icon="check" @click="notify('已保存')">带图标按钮</Button><Button disabled>禁用按钮</Button></div></div>
          </div>
        </Card>
      </section>
    </template>
    <template #tag>
      <Card title="轻量标签" description="轻量、舒展，也包含纯展示型标签" sample="TAG / TAG GROUP">
        <div class="tag-showcase">
          <div class="display-block"><div class="tiny-label"><span>DISPLAY TAGS / 展示型标签</span><span>只承担信息表达</span></div><div class="display-tags" aria-label="展示型标签示例"><Tag>推荐</Tag><Tag tone="green">已完成</Tag><Tag tone="orange">处理中</Tag><Tag tone="red">需留意</Tag><Tag tone="gray">草稿</Tag></div></div>
          <div class="soft-box"><div class="soft-box-title">今天想探索什么？</div><div class="soft-box-desc">选择一个你喜欢的方向</div><TagGroup v-model="direction" :options="directions" label="探索方向" /></div>
          <div class="tag-selection-demo"><div class="tiny-label">多选标签</div><TagGroup v-model="multiDirections" :options="[...directions, { value: '未开放', label: '未开放', disabled: true }]" label="多选方向" /><p>已选：{{ multiDirections.join('、') || '暂无' }}</p></div>
          <div class="tag-selection-demo"><div class="tiny-label">独立标签</div><div class="display-tags"><Tag v-model="selectedTag">稍后阅读</Tag><Tag :model-value="false" disabled>暂不可选</Tag></div><p>{{ selectedTag ? '已加入稍后阅读' : '未选择稍后阅读' }}</p></div>
        </div>
        <div class="chips-foot"><span>当前偏好：{{ direction }}</span><div class="color-dots" aria-label="蓝色色阶"><i></i><i></i><i></i></div></div>
      </Card>
    </template>
    <template #card>
      <CardShowcase @notify="notify" />
    </template>
    <template #shadows>
      <ShadowShowcase @notify="notify" />
    </template>
    <template #identity>
      <IdentityShowcase />
    </template>
    <template #image>
      <ImageShowcase />
    </template>
    <template #app-bar>
      <AppBarShowcase @notify="notify" />
    </template>
    <template #navigation>
      <Card class="navigation-panel"><div class="nav-descrip"><h3>底部导航</h3><p>图标与文字配合选中状态，支持点击与键盘切换。</p></div><Navigation v-model="navigation" :options="navOptions" /></Card>
    </template>
    <template #list>
      <div class="list-grid" aria-label="列表示例">
        <Card class="list-panel" title="选择列表" description="传统单选与复选，左侧选择框，右侧标题" sample="SELECTABLE LIST">
          <div class="list-group"><div class="list-section-name">单选列表</div><Choices v-model="readerTheme" list label="阅读偏好" :options="readerOptions" /></div>
          <div class="list-group"><div class="list-section-name">复选列表</div><Choices v-model="syncContent" type="checkbox" list label="同步内容" :options="syncOptions" /></div>
        </Card>
        <Card class="list-panel" title="导航列表" description="跳转页面、切换设置与锚点弹出菜单" sample="NAVIGATION LIST">
          <CellGroup title="设置与操作">
            <ListRow title="个人资料" description="查看与编辑账号信息" @click="notify('个人资料页面（原型示例）')" />
            <ListRow title="隐私与安全" description="权限、账号保护" @click="notify('隐私设置页面（原型示例）')" />
            <ListRow title="内存" description="查看内存的使用情况、当前运行的应用与最近的资源占用统计。" @click="notify('内存页面（原型示例）')" />
            <ListRow title="WebView 实现" value="Android System WebView" @click="notify('WebView 设置（原型示例）')" />
            <ListRow v-model="autoUpdate" toggle title="自动更新" description="在后台保持内容最新" />
            <Popover v-model="sort" label="排序方式" :options="sortOptions"><template #default="{ toggle, open, controls }"><ListRow title="排序方式" description="选择内容的排列顺序" :value="sort" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="controls" @click="toggle" /></template></Popover>
          </CellGroup>
        </Card>
      </div>
    </template>
    <template #input>
      <section id="controls">
        <Card title="输入与搜索" description="用轻柔的底色承接每一次输入" sample="INPUT">
          <div class="field-group">
            <Input v-model="search" label="搜索" icon="search" clearable placeholder="寻找你感兴趣的内容…" />
            <Input v-model="nickname" label="昵称" :maxlength="24"><template #hint><span>为自己取个喜欢的名字</span><span :class="{ valid: nickname.trim() }"><Icon v-if="nickname.trim()" name="check" />{{ nickname.trim() ? '已填写' : '待填写' }}</span></template></Input>
            <Select v-model="category" label="内容分类" :options="categories"><template #hint><span>已选择：{{ category }}</span><span>下拉展开简洁柔和</span></template></Select>
          </div>
        </Card>
      </section>
    </template>
    <template #switch>
      <Card title="开关与偏好" description="简单设置，也值得被认真对待" sample="SWITCH">
        <div class="pref-list">
          <ListRow v-for="item in preferences" :key="item.title" v-model="item.on" toggle :title="item.title" :description="item.description">
            <template #leading><Icon :name="item.icon" /></template>
          </ListRow>
        </div>
        <div class="control-foot"><span>你的偏好已在本页实时更新</span><strong>{{ enabledCount }} 项开启</strong></div>
      </Card>
    </template>
    <template #slider>
      <Card title="分段选择与滑块" description="更流畅的选择体验" sample="SEGMENT / SLIDER">
        <Segmented v-model="mode" :options="modes" label="浏览方式" />
        <div class="mode-card"><div class="mode-symbol"><Icon :name="activeMode.icon ?? 'spark'" /></div><div><strong>{{ activeMode.label }}模式</strong><p>{{ activeMode.description }}</p></div></div>
        <Slider v-model="strength" label="显示强度" />
        <Slider v-model="customStrength" class="custom-slider" label="自定义滑块" unit="%" />
      </Card>
    </template>
    <template #selection>
      <Card title="选择与数量" description="干净利落的选中状态" sample="SELECTION">
        <div class="choice-groups"><Choices v-model="plan" label="单选" :options="plans" /><Choices v-model="features" type="checkbox" label="复选" :options="featureOptions" /></div>
        <div class="choice-bottom"><span>添加到我的收藏</span><Stepper v-model="quantity" /></div>
      </Card>
    </template>
    <template #selection-collapse>
      <SelectionCollapseShowcase />
    </template>
    <template #combobox>
      <ComboboxShowcase />
    </template>
    <template #picker>
      <PickerShowcase />
    </template>
    <template #date-time-picker>
      <DateTimeShowcase />
    </template>
    <template #upload>
      <UploadShowcase />
    </template>
    <template #feedback>
      <section id="feedback">
        <div class="feedback-grid">
          <Card class="feedback-panel" title="轻提示" description="恰如其分的成功反馈" sample="TOAST"><div class="toast-sample"><Icon name="check" /><div><strong>保存成功</strong><small>你的更改已经同步</small></div></div><Button variant="link" @click="notify('你的更改已经同步')">体验轻提示 <Icon name="arrow-right" /></Button></Card>
          <Card class="feedback-panel" title="确认弹窗" description="重要操作，清晰表达" sample="DIALOG"><div class="empty-illustration"><div class="empty-image"><Icon name="shield" /></div><span>每个决定，都值得确认</span></div><Button variant="link" @click="openDialog">打开确认弹窗 <Icon name="arrow-right" /></Button></Card>
          <Card class="feedback-panel" title="底部操作单" description="符合移动端习惯的选择方式" sample="BOTTOM SHEET"><div class="sheet-sample"><div class="handle"></div><div class="sheet-line"></div><div class="sheet-line"></div></div><Button variant="link" @click="openSheet">展开操作面板 <Icon name="arrow-right" /></Button></Card>
        </div>
      </section>
    </template>
    <template #primitives="{ active }">
      <FeedbackPrimitives :active="active" @notify="notify" />
    </template>
    <template #notice-steps>
      <NoticeStepsShowcase @notify="notify" />
    </template>
    <template #popup>
      <PopupShowcase @notify="notify" />
    </template>
    <template #touch-gestures>
      <TouchShowcase @notify="notify" />
    </template>
    <template #menu>
      <MenuShowcase @notify="notify" />
    </template>
    <template #native-navigation>
      <NativeNavigationShowcase @notify="notify" />
    </template>
    <template #scenarios>
      <EssentialsShowcase @notify="notify" />
    </template>
    <template #native-html>
      <Card class="native-example" title="原生 HTML 示例" description="同样的组件，也可以直接在 HTML 中使用">
        <a class="native-example-link" href="./native.html" @click.prevent="openHtmlExample">打开原生 HTML 示例 <Icon name="arrow-right" /></a>
      </Card>
    </template>
  </component>
  <Toast ref="toast" />
</template>

<style scoped>
.native-example { margin-top: 24px; }
.native-example-link { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: var(--primary); font-weight: var(--font-weight-action, 500); }
.native-example-link svg { width: 18px; height: 18px; }
.native-example-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; border-radius: 6px; }

.toast-sample {
  margin: auto 0;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 13px;
  border-radius: 17px;
  border: 1px solid var(--border);
  background: var(--fill);
  color: var(--success);
}

.toast-sample svg {
  height: 19px;
  width: 19px;
}

.toast-sample strong {
  font-size: 14px;
  display: block;
  font-weight: var(--font-weight-subtitle, 600);
}

.toast-sample small {
  font-size: 13px;
  display: block;
  color: var(--text-secondary);
  margin-top: 5px;
}

.sheet-sample .handle {
  height: 4px;
  width: 32px;
  border-radius: 20px;
  background: var(--gray);
  margin: 0 auto 14px;
}

.button-showcase {
  display: grid;
  gap: 24px;
}

.button-example + .button-example {
  border-top: 1px solid var(--border);
  padding-top: 21px;
}

.button-group-title {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-subtitle, 600);
  margin-bottom: 13px;
}

.btn-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

.icon-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.tiny-label {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: var(--font-weight-subtitle, 600);
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.tag-showcase {
  display: grid;
  gap: 18px;
}
.tag-selection-demo p { margin: 10px 0 0; color: var(--text-secondary); font-size: 13px; }
.custom-slider { margin-top: 20px; --slider-track-height: 8px; --slider-thumb-size: 24px; }

.soft-box {
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg,var(--fill),var(--fill));
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 21px;
}

.soft-box::after {
  position: absolute;
  content: "";
  width: 165px;
  height: 165px;
  border-radius: 50%;
  top: -94px;
  right: -68px;
  background: var(--border);
  pointer-events: none;
}

.soft-box-title {
  font-size: 16px;
  font-weight: var(--font-weight-title, 700);
  margin-bottom: 8px;
}

.soft-box-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 19px;
  line-height: 1.65;
}

.display-block {
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--card-background);
}

.display-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chips-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 17px;
}

.color-dots {
  display: flex;
  gap: 6px;
}

.color-dots i {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: block;
  border: 2px solid var(--card-background);
  box-shadow: 0 0 0 1px rgb(0 0 0 / .07);
}

.color-dots i:nth-child(1) {
  background: var(--primary);
}

.color-dots i:nth-child(2) {
  background: var(--primary);
}

.color-dots i:nth-child(3) {
  background: var(--fill);
}

.field-group {
  display: grid;
  gap: 16px;
}

.control-foot {
  background: var(--fill);
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 16px;
  padding: 13px;
}

.control-foot strong {
  font-weight: var(--font-weight-subtitle, 600);
  color: var(--primary);
}

.mode-card {
  display: flex;
  align-items: center;
  padding: 20px 2px 20px;
  gap: 13px;
}

.mode-symbol {
  display: grid;
  place-items: center;
  background: var(--fill);
  color: var(--primary);
  width: 46px;
  height: 46px;
  border-radius: 15px;
}

.mode-symbol svg {
  width: 24px;
  height: 24px;
}

.mode-card strong {
  display: block;
  font-weight: var(--font-weight-title, 700);
  font-size: 15px;
}

.mode-card p {
  font-size: 13px;
  margin: 6px 0 0;
  color: var(--text-secondary);
}

.choice-groups {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 20px;
}

.choice-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid var(--border);
  padding-top: 19px;
  margin-top: 18px;
}

.choice-bottom span {
  font-size: 14px;
  color: var(--text-secondary);
}

.navigation-panel {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 22px;
  align-items: center;
}

.nav-descrip h3 {
  margin: 0 0 9px;
  font-size: 21px;
  font-weight: var(--font-weight-subtitle, 600);
}

.nav-descrip p {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
  margin: 0;
  max-width: 280px;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 22px;
}

.feedback-panel {
  min-height: 254px;
  display: flex;
  flex-direction: column;
  --card-header-gap: 25px;
}

.empty-illustration {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.empty-illustration .empty-image {
  width: 65px;
  height: 65px;
  border-radius: 21px;
  background: var(--fill);
  display: grid;
  place-items: center;
  color: var(--text-secondary);
}

.empty-illustration svg {
  width: 28px;
  height: 28px;
}

.empty-illustration span {
  font-size: 13px;
}

.sheet-sample {
  border-radius: 19px 19px 13px 13px;
  background: var(--fill);
  border: 1px solid var(--border);
  padding: 14px 18px 19px;
  margin: auto 0 0;
}

.sheet-sample .sheet-line {
  height: 11px;
  border-radius: 10px;
  background: var(--border);
  margin-bottom: 10px;
}

.sheet-sample .sheet-line:nth-child(3) {
  width: 66%;
  margin-bottom: 0;
}

@media (max-width: 760px) {

  .feedback-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .navigation-panel {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feedback-panel {
    min-height: 220px;
  }
}

@media (max-width: 400px) {

  .btn-row {
    gap: 8px;
  }

  .choice-bottom {
    flex-wrap: wrap;
  }
}

@media (max-width: 760px) {

  .navigation-panel {
    --card-padding: 24px 22px;
  }

  .feedback-panel {
    min-height: 220px;
  }

  .btn-row {
    display: flex;
    gap: 10px;
  }

  .button-showcase {
    gap: 20px;
  }

  .button-example + .button-example {
    padding-top: 18px;
  }
}

@media (max-width: 400px) {

  .btn-row {
    gap: 9px;
  }

  .soft-box {
    padding: 19px;
  }

  .display-block .tiny-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

.list-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-top: 22px;
}

.list-panel {
  --card-padding: 28px 29px 24px;
  --card-header-gap: 14px;
}

.list-section-name {
  font-size: 13px;
  font-weight: var(--font-weight-subtitle, 600);
  color: var(--text-secondary);
  padding: 6px 1px 8px;
}

.list-group + .list-group {
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid var(--border);
}

@media (max-width:760px) {

  .list-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
  }
}

@media (max-width:760px) {
  .navigation-panel {
    --card-padding: 24px 22px;
  }
}
@media (max-width: 1100px) {
  .list-panel {
    --card-padding: 29px 28px 24px;
  }
}

@media (max-width: 760px) {
  .list-panel {
    --card-padding: 24px 22px 24px;
  }
}
</style>
