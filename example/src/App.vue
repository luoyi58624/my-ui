<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import ThemeSettings from './demo/ThemeSettings.vue'
import EssentialsShowcase from './demo/EssentialsShowcase.vue'
import PopupShowcase from './demo/PopupShowcase.vue'
import MenuShowcase from './demo/MenuShowcase.vue'
import FeedbackPrimitives from './demo/FeedbackPrimitives.vue'
import SelectionCollapseShowcase from './demo/SelectionCollapseShowcase.vue'
import IdentityShowcase from './demo/IdentityShowcase.vue'
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
  ListRow, Menu, Navigation, Popover, Popup, Segmented, Select, popup,
  Slider, Stepper, Tag, Toast, type Option, type IconName,
} from '@my-ui/vue'

const toast = ref<InstanceType<typeof Toast>>()
function notify(message: string) { toast.value?.show(message) }
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

const sectionLinks = [
  { id: 'actions', label: '基础组件' }, { id: 'controls', label: '交互控制' },
  { id: 'surfaces', label: '内容容器' }, { id: 'feedback', label: '状态反馈' },
  { id: 'scenarios', label: '完整示例' },
]
const scrolled = ref(false)
const currentSection = ref('')
let frame = 0
function syncHeader() {
  scrolled.value = window.scrollY > 24
  let current = ''
  for (const item of sectionLinks) {
    if ((document.getElementById(item.id)?.getBoundingClientRect().top ?? Infinity) <= window.innerHeight * .35) current = item.id
  }
  currentSection.value = current
}
function scheduleHeader() {
  if (frame) return
  frame = requestAnimationFrame(() => { frame = 0; syncHeader() })
}
onMounted(() => {
  syncHeader()
  window.addEventListener('scroll', scheduleHeader, { passive: true })
  window.addEventListener('resize', scheduleHeader, { passive: true })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', scheduleHeader)
  window.removeEventListener('resize', scheduleHeader)
})
</script>

<template>
  <header class="masthead" :class="{ scrolled }">
    <div class="shell topbar">
      <a class="wordmark" href="#top" aria-label="回到顶部"><span class="brand-mark" aria-hidden="true"></span><span class="brand-copy"><span class="brand-name">my-ui</span><span class="brand-sub">CSS · JAVASCRIPT · VUE</span></span></a>
      <nav class="site-nav" aria-label="页面导航"><a v-for="item in sectionLinks" :key="item.id" :href="'#' + item.id" :class="{ current: currentSection === item.id }" :aria-current="currentSection === item.id ? 'location' : undefined">{{ item.label }}</a><a href="./native.html">原生 HTML ↗</a></nav>
      <ThemeSettings />
    </div>
  </header>
  <div class="shell">
    <main id="top">
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow"><i class="dash"></i> MOBILE COMPONENT SYSTEM</div>
          <h1>自然留白，<br /><span>轻盈交互。</span></h1>
          <p>用克制的色彩、舒适的留白与柔和卡片，<br />原生 HTML 与 Vue 共用一套组件体验。</p>
          <div class="hero-cta"><a href="#actions" class="cta-btn">探索组件 <Icon name="arrow-right" /></a><a class="hero-note" href="./native.html">原生 HTML 示例 ↗</a></div>
        </div>
        <div class="art" aria-hidden="true">
          <div class="art-halo"></div>
          <div class="sample-window"><div class="sample-top"><div class="sample-appicon"><Icon name="spark" /></div><div class="sample-dots"><i></i><i></i><i></i></div></div><div class="sample-title">自在，从容。</div><div class="sample-caption">清晰而自然的视觉秩序</div><div class="sample-progress"><i></i></div></div>
          <div class="float-chip first"><div class="round green"><Icon name="check" /></div><span><strong>已完成</strong><small>每一步都轻松</small></span></div>
          <div class="float-chip second"><div class="round"><Icon name="spark" /></div><span><strong>专注细节</strong><small>简洁，却不简单</small></span></div>
        </div>
      </section>

      <section id="actions">
        <div class="section-title"><div><div class="number">01 / 基础组件</div><h2>按钮与标签</h2></div><div class="subtitle">清晰的操作层级，自然的按压反馈。</div></div>
        <div class="pair">
          <Card title="操作按钮" description="柔和而明确的操作层级" sample="BUTTONS">
            <div class="button-showcase">
              <div class="button-example"><div class="button-group-title">基础按钮</div><div class="btn-row"><Button @click="notify('主要操作已执行')">主要按钮</Button><Button variant="outline" @click="notify('镂空按钮已点击')">镂空按钮</Button><Button variant="text" @click="notify('已打开详情')">文本按钮 <Icon name="chevron-right" /></Button></div></div>
              <div class="button-example"><div class="button-group-title">图标按钮</div><div class="icon-actions"><Button variant="icon" icon="heart" aria-label="收藏" :selected="liked" :style="liked ? { color: 'var(--danger)' } : undefined" @click="toggleLike" /><Button variant="icon" icon="share" aria-label="分享" @click="openSheet" /><Button variant="icon" icon="add" aria-label="添加" @click="notify('已添加新项目（原型示例）')" /><Menu :options="sheetActions" label="更多操作" @select="selectAction"><template #default="{ trigger }"><Button v-bind="trigger" variant="bare" icon="grid" aria-label="更多" /></template></Menu></div></div>
              <div class="button-example"><div class="button-group-title">其他状态</div><div class="btn-row"><Button icon="check" @click="notify('已保存')">带图标按钮</Button><Button disabled>禁用按钮</Button></div></div>
            </div>
          </Card>
          <Card title="轻量标签" description="轻量、舒展，也包含纯展示型标签" sample="TAG / TAG GROUP">
            <div class="tag-showcase">
              <div class="display-block"><div class="tiny-label"><span>DISPLAY TAGS / 展示型标签</span><span>只承担信息表达</span></div><div class="display-tags" aria-label="展示型标签示例"><Tag>推荐</Tag><Tag tone="green">已完成</Tag><Tag tone="orange">处理中</Tag><Tag tone="red">需留意</Tag><Tag tone="gray">草稿</Tag></div></div>
              <div class="soft-box"><div class="soft-box-title">今天想探索什么？</div><div class="soft-box-desc">选择一个你喜欢的方向</div><TagGroup v-model="direction" :options="directions" label="探索方向" /></div>
              <div class="tag-selection-demo"><div class="tiny-label">多选标签</div><TagGroup v-model="multiDirections" :options="[...directions, { value: '未开放', label: '未开放', disabled: true }]" label="多选方向" /><p>已选：{{ multiDirections.join('、') || '暂无' }}</p></div>
              <div class="tag-selection-demo"><div class="tiny-label">独立标签</div><div class="display-tags"><Tag v-model="selectedTag">稍后阅读</Tag><Tag :model-value="false" disabled>暂不可选</Tag></div><p>{{ selectedTag ? '已加入稍后阅读' : '未选择稍后阅读' }}</p></div>
            </div>
            <div class="chips-foot"><span>当前偏好：{{ direction }}</span><div class="color-dots" aria-label="蓝色色阶"><i></i><i></i><i></i></div></div>
          </Card>
        </div>
      </section>

      <section id="controls" class="section-gap">
        <div class="section-title"><div><div class="number">02 / 交互控制</div><h2>输入与选择</h2></div><div class="subtitle">为手指设计的控件尺寸，状态变化一目了然。</div></div>
        <div class="pair equal">
          <Card title="输入与搜索" description="用轻柔的底色承接每一次输入" sample="INPUT">
            <div class="field-group">
              <Input v-model="search" label="搜索" icon="search" clearable placeholder="寻找你感兴趣的内容…" />
              <Input v-model="nickname" label="昵称" :maxlength="24"><template #hint><span>为自己取个喜欢的名字</span><span :class="{ valid: nickname.trim() }"><Icon v-if="nickname.trim()" name="check" />{{ nickname.trim() ? '已填写' : '待填写' }}</span></template></Input>
              <Select v-model="category" label="内容分类" :options="categories"><template #hint><span>已选择：{{ category }}</span><span>下拉展开简洁柔和</span></template></Select>
            </div>
          </Card>
          <Card title="开关与偏好" description="简单设置，也值得被认真对待" sample="SWITCH">
            <div class="pref-list">
              <ListRow v-for="item in preferences" :key="item.title" v-model="item.on" toggle :title="item.title" :description="item.description">
                <template #leading><Icon :name="item.icon" /></template>
              </ListRow>
            </div>
            <div class="control-foot"><span>你的偏好已在本页实时更新</span><strong>{{ enabledCount }} 项开启</strong></div>
          </Card>
        </div>
        <div class="pair equal secondary-pair">
          <Card title="分段选择与滑块" description="更流畅的选择体验" sample="SEGMENT / SLIDER">
            <Segmented v-model="mode" :options="modes" label="浏览方式" />
            <div class="mode-card"><div class="mode-symbol"><Icon :name="activeMode.icon ?? 'spark'" /></div><div><strong>{{ activeMode.label }}模式</strong><p>{{ activeMode.description }}</p></div></div>
            <Slider v-model="strength" label="显示强度" />
            <Slider v-model="customStrength" class="custom-slider" label="自定义滑块" unit="%" />
          </Card>
          <Card title="选择与数量" description="干净利落的选中状态" sample="SELECTION">
            <div class="choice-groups"><Choices v-model="plan" label="单选" :options="plans" /><Choices v-model="features" type="checkbox" label="复选" :options="featureOptions" /></div>
            <div class="choice-bottom"><span>添加到我的收藏</span><Stepper v-model="quantity" /></div>
          </Card>
        </div>
        <SelectionCollapseShowcase />
        <div class="secondary-pair"><ComboboxShowcase /></div>
        <div class="secondary-pair"><PickerShowcase /></div>
        <div class="secondary-pair"><DateTimeShowcase /></div>
        <div class="secondary-pair"><UploadShowcase /></div>
      </section>

      <section id="surfaces" class="section-gap">
        <div class="section-title"><div><div class="number">03 / 内容容器</div><h2>卡片与导航</h2></div><div class="subtitle">柔和的层次和留白，突出内容本身。</div></div>
        <div class="content-grid">
          <Card class="feature-panel">
            <div><div class="feature-icon"><Icon name="cloud" /></div><h3>云端，让美好保持同步</h3><p class="feature-desc">让重要的内容始终触手可及，<br />自由而安心地连接每一刻。</p></div>
            <div class="feature-bottom"><div class="tiny-avatars" aria-hidden="true"><span class="tiny-avatar">蓝</span><span class="tiny-avatar">青</span><span class="tiny-avatar">云</span></div><small>3 位好友正在使用</small><Button variant="round" icon="arrow-right" aria-label="查看云端服务" @click="notify('已打开云端服务预览')" /></div>
          </Card>
          <div class="stacked">
            <Card class="mini-feature" title="查看收藏" interactive @activate="notify(liked ? '本页收藏：my-ui 组件示例' : '本页暂无收藏，点击心形按钮添加')"><div class="mini-icon"><Icon name="layer" /></div><div><strong>我的收藏</strong><p>把喜欢的，留在这里</p></div><span class="arrow-btn" aria-hidden="true"><Icon name="chevron-right" /></span></Card>
            <Card class="mini-feature" title="查看最近浏览" interactive @activate="notify(laterSaved ? '稍后查看：my-ui 组件示例' : '正在查看最近浏览（原型示例）')"><div class="mini-icon mint"><Icon name="clock" /></div><div><strong>最近浏览</strong><p>从上次停下的地方继续</p></div><span class="arrow-btn" aria-hidden="true"><Icon name="chevron-right" /></span></Card>
          </div>
        </div>
        <div class="secondary-pair"><ShadowShowcase @notify="notify" /></div>
        <div class="secondary-pair"><IdentityShowcase /></div>
        <div class="secondary-pair"><ImageShowcase /></div>
        <div class="secondary-pair"><AppBarShowcase @notify="notify" /></div>
        <Card class="navigation-panel"><div class="nav-descrip"><h3>底部导航</h3><p>轻量导航示例，仅演示图标与选中状态，不构成完整 App 页面。</p></div><Navigation v-model="navigation" :options="navOptions" /></Card>
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
      </section>

      <section id="feedback" class="section-gap">
        <div class="section-title"><div><div class="number">04 / 状态反馈</div><h2>提示与弹层</h2></div><div class="subtitle">提示、确认对话框和移动端操作面板。</div></div>
        <div class="feedback-grid">
          <Card class="feedback-panel" title="轻提示" description="恰如其分的成功反馈" sample="TOAST"><div class="toast-sample"><Icon name="check" /><div><strong>保存成功</strong><small>你的更改已经同步</small></div></div><Button variant="link" @click="notify('你的更改已经同步')">体验轻提示 <Icon name="arrow-right" /></Button></Card>
          <Card class="feedback-panel" title="确认弹窗" description="重要操作，清晰表达" sample="DIALOG"><div class="empty-illustration"><div class="empty-image"><Icon name="shield" /></div><span>每个决定，都值得确认</span></div><Button variant="link" @click="openDialog">打开确认弹窗 <Icon name="arrow-right" /></Button></Card>
          <Card class="feedback-panel" title="底部操作单" description="符合移动端习惯的选择方式" sample="BOTTOM SHEET"><div class="sheet-sample"><div class="handle"></div><div class="sheet-line"></div><div class="sheet-line"></div></div><Button variant="link" @click="openSheet">展开操作面板 <Icon name="arrow-right" /></Button></Card>
        </div>
        <FeedbackPrimitives @notify="notify" />
        <NoticeStepsShowcase @notify="notify" />
        <PopupShowcase @notify="notify" />
        <TouchShowcase @notify="notify" />
        <MenuShowcase @notify="notify" />
      </section>
      <EssentialsShowcase @notify="notify" />
    </main>
    <footer><span><strong>my-ui</strong> · 从简约出发，让体验更自在。</span><span>LOCAL SOURCE · YOUR COMPONENTS</span></footer>
  </div>
  <Toast ref="toast" />
  <Popup />
</template>

<style scoped>
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

:global(html) {
  scroll-padding-top: 100px;
}

.sheet-sample .handle {
  height: 4px;
  width: 32px;
  border-radius: 20px;
  background: var(--gray);
  margin: 0 auto 14px;
}

.cta-btn {
  transform: scale(1);
  transform-origin: center;
  touch-action: manipulation;
  display: inline-flex;
  min-height: 44px;
  gap: 10px;
  align-items: center;
  background: var(--primary);
  border: 0;
  color: var(--primary-text);
  border-radius: 15px;
  box-shadow: 0 7px 17px color-mix(in srgb, var(--primary) 15%, transparent);
  padding: 0 20px;
  font-size: 15px;
  font-weight: var(--font-weight-action, 500);
  transition: transform .16s ease, filter .16s ease;
}

.cta-btn:active {
  transform: scale(.95);
  background-color: color-mix(in srgb, var(--primary) 86%, #000);
}

.site-nav a {
  opacity: 1;
  transform: none;
  touch-action: manipulation;
  transition: color .2s;
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  position: relative;
}

.wordmark {
  opacity: 1;
  transform: none;
  touch-action: manipulation;
  transition: opacity .2s ease,color .15s ease;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.site-nav a:active {
  background-color: var(--press);
  border-radius: 8px;
  transition-duration: 0s;
  transform: none;
}

.wordmark:active {
  background-color: var(--press);
  border-radius: 12px;
  transition-duration: 0s;
  transform: none;
}

@media (hover:hover) and (pointer:fine) {
  .cta-btn:hover:not(:active) {
    background-color: color-mix(in srgb, var(--primary) 94%, #000);
  }
}

@media (max-width:760px) {
  :global(html) {
    scroll-padding-top: 120px;
  }
}

.shell {
  width: min(1200px, calc(100% - 96px));
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
  height: 80px;
  min-height: 80px;
}

.topbar :deep(.theme-actions) { justify-self: end; }
@media (max-width:760px) { .topbar :deep(.theme-actions) { grid-column: 2; grid-row: 1; } }

.brand-mark {
  position: relative;
  height: 41px;
  width: 41px;
  border-radius: 12px;
  background: linear-gradient(145deg,var(--primary),var(--primary));
  display: grid;
  place-items: center;
  box-shadow: 0 6px 13px color-mix(in srgb, var(--primary) 16%, transparent);
  color: var(--primary-text);
  font-weight: var(--font-weight-title, 700);
  font-size: 17px;
}

.brand-mark::after {
  content: "";
  position: absolute;
  inset: 7px 12px 7px 12px;
  border: 2px solid var(--primary-text);
  border-radius: 10px 10px 10px 3px;
  transform: rotate(35deg);
  opacity: .92;
}

.brand-name {
  display: block;
  font-size: 24px;
  font-weight: var(--font-weight-title, 700);
  line-height: 1.16;
  letter-spacing: -.95px;
  color: var(--text);
}

.brand-sub {
  color: var(--text-secondary);
  display: block;
  margin-top: 5px;
  font-size: 10px;
  font-weight: var(--font-weight-subtitle, 600);
  letter-spacing: 1px;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 27px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: var(--font-weight-action, 500);
}

.site-nav a:hover {
  color: var(--primary);
}

.hero {
  position: relative;
  isolation: isolate;
  margin: 12px 0 64px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--card-background) 72%, transparent);
  border-radius: 38px;
  display: grid;
  grid-template-columns: 1fr .95fr;
  align-items: center;
  padding: 56px 68px;
  background: linear-gradient(110deg,color-mix(in srgb, var(--card-background) 92%, transparent) 15%, color-mix(in srgb, var(--card-background) 96%, transparent) 50%,color-mix(in srgb, var(--card-background) 82%, transparent));
  box-shadow: var(--shadow);
  margin-top: 24px;
  min-height: 325px;
  padding-top: 47px;
  padding-bottom: 47px;
}

.hero::after {
  content: "";
  position: absolute;
  width: 550px;
  height: 550px;
  border-radius: 50%;
  right: -120px;
  top: -104px;
  z-index: -1;
  background: radial-gradient(circle, var(--border), transparent 70%);
}

.eyebrow {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: var(--font-weight-subtitle, 600);
  font-size: 12px;
  color: var(--primary);
  letter-spacing: 2px;
}

.eyebrow .dash {
  width: 25px;
  height: 2px;
  background: var(--primary);
  border-radius: 2px;
}

.hero h1 {
  font-size: clamp(36px,3.6vw,48px);
  line-height: 1.32;
  margin: 20px 0 16px;
  font-weight: var(--font-weight-title, 700);
  letter-spacing: -1.8px;
}

.hero h1 span {
  color: var(--primary);
}

.hero p {
  max-width: 425px;
  font-size: 16px;
  line-height: 1.85;
  color: var(--text-secondary);
  margin: 0;
}

.hero-cta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 27px;
}

.cta-btn:hover {
  box-shadow: 0 7px 17px color-mix(in srgb, var(--primary) 15%, transparent);
}

.cta-btn svg {
  height: 16px;
  width: 16px;
}

.hero-note {
  color: var(--text-secondary);
  font-size: 13px;
}

.art {
  width: 100%;
  max-width: 440px;
  height: 304px;
  position: relative;
  justify-self: end;
}

.art-halo {
  position: absolute;
  width: 300px;
  height: 300px;
  border: 1px solid color-mix(in srgb, var(--primary) 23%, transparent);
  border-radius: 50%;
  left: 64px;
  top: 4px;
}

.art-halo::before {
  content: "";
  position: absolute;
  inset: 24px;
  border: 1px dashed color-mix(in srgb, var(--primary) 22%, transparent);
  border-radius: 50%;
}

.sample-window {
  position: absolute;
  top: 43px;
  left: 47px;
  width: 320px;
  height: 240px;
  border: 1px solid color-mix(in srgb, var(--card-background) 90%, transparent);
  border-radius: 30px;
  padding: 26px;
  background: color-mix(in srgb, var(--card-background) 75%, transparent);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  transform: rotate(-5deg);
}

.sample-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sample-appicon {
  width: 47px;
  height: 47px;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg,var(--primary),var(--primary));
  border-radius: 15px;
  color: var(--primary-text);
  box-shadow: 0 5px 12px color-mix(in srgb, var(--primary) 15%, transparent);
}

.sample-appicon svg {
  width: 24px;
  height: 24px;
}

.sample-dots {
  display: flex;
  gap: 5px;
}

.sample-dots i {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gray);
}

.sample-title {
  font-size: 16px;
  font-weight: var(--font-weight-title, 700);
  margin-top: 22px;
  letter-spacing: -.3px;
}

.sample-caption {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 7px;
}

.sample-progress {
  margin-top: 21px;
  height: 7px;
  background: var(--border);
  border-radius: 7px;
  overflow: hidden;
}

.sample-progress i {
  display: block;
  height: 100%;
  width: 68%;
  background: linear-gradient(90deg,var(--primary),var(--primary));
  border-radius: 7px;
}

.float-chip {
  position: absolute;
  z-index: 2;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 13px 16px;
  background: color-mix(in srgb, var(--card-background) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--card-background) 94%, transparent);
  border-radius: 17px;
  box-shadow: var(--popup-shadow);
  backdrop-filter: blur(12px);
}

.float-chip.first {
  top: 10px;
  right: 0;
  transform: rotate(7deg);
}

.float-chip.second {
  bottom: 10px;
  left: -17px;
  transform: rotate(4deg);
}

.float-chip .round {
  width: 31px;
  height: 31px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: var(--fill);
  color: var(--primary);
}

.float-chip .round.green {
  background: color-mix(in oklab, var(--success) 10%, var(--card-background));
  color: var(--success);
}

.float-chip svg {
  width: 17px;
  height: 17px;
}

.float-chip strong {
  display: block;
  font-size: 12px;
  font-weight: var(--font-weight-subtitle, 600);
}

.float-chip small {
  display: block;
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 3px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 4px 24px;
}

.section-title .number {
  font-size: 12px;
  color: var(--primary);
  letter-spacing: .65px;
  font-weight: var(--font-weight-title, 700);
  margin-bottom: 10px;
}

.section-title h2 {
  font-size: 29px;
  line-height: 1.32;
  letter-spacing: -.8px;
  margin: 0;
  font-weight: var(--font-weight-title, 700);
}

.section-title .subtitle {
  color: var(--text-secondary);
  line-height: 1.65;
  max-width: 400px;
  text-align: right;
  font-size: 13px;
}

.section-gap {
  margin-top: 61px;
}

.pair {
  display: grid;
  grid-template-columns: 1.07fr .93fr;
  gap: 22px;
}

.pair.equal {
  grid-template-columns: 1fr 1fr;
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

.content-grid {
  display: grid;
  grid-template-columns: 1.14fr .86fr;
  gap: 22px;
}

.feature-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  min-height: 295px;
}

.feature-panel::after {
  content: "";
  position: absolute;
  right: -65px;
  top: 70px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 1px solid var(--border);
  box-shadow: 0 0 0 38px var(--fill), 0 0 0 77px var(--background);
  pointer-events: none;
}

.feature-icon {
  width: 57px;
  height: 57px;
  border-radius: 18px;
  background: linear-gradient(150deg,var(--primary),var(--primary));
  color: var(--primary-text);
  display: grid;
  place-items: center;
  box-shadow: 0 10px 23px color-mix(in srgb, var(--primary) 16%, transparent);
}

.feature-icon svg {
  width: 26px;
  height: 26px;
}

.feature-panel h3 {
  font-size: 24px;
  font-weight: var(--font-weight-subtitle, 600);
  margin: 23px 0 10px;
}

.feature-panel .feature-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.9;
  max-width: 260px;
  margin: 0;
}

.feature-panel .feature-bottom {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
}

.tiny-avatars {
  display: flex;
  padding-left: 9px;
}

.tiny-avatar {
  height: 28px;
  width: 28px;
  border: 2px solid var(--card-background);
  margin-left: -9px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--primary-text);
  font-size: 11px;
  font-weight: var(--font-weight-subtitle, 600);
}

.tiny-avatar:nth-child(1) {
  background: var(--primary);
}

.tiny-avatar:nth-child(2) {
  background: var(--success);
}

.tiny-avatar:nth-child(3) {
  background: var(--primary);
}

.feature-bottom small {
  font-size: 13px;
  color: var(--text-secondary);
  flex: 1;
}

.stacked {
  display: grid;
  gap: 18px;
}

.mini-feature {
  display: flex;
  align-items: center;
  gap: 16px;
  --card-radius: 26px;
  min-height: 137px;
  --card-padding: 22px 24px;
}

.mini-feature .mini-icon {
  width: 52px;
  height: 52px;
  border-radius: 17px;
  background: var(--fill);
  color: var(--primary);
  display: grid;
  place-items: center;
}

.mini-feature .mini-icon svg {
  width: 24px;
  height: 24px;
}

.mini-feature .mini-icon.mint {
  background: var(--fill);
  color: var(--success);
}

.mini-feature strong {
  display: block;
  font-weight: var(--font-weight-subtitle, 600);
  margin-bottom: 7px;
  font-size: 15px;
}

.mini-feature p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.mini-feature .arrow-btn {
  margin-left: auto;
  border: 0;
  background: var(--fill);
  height: 44px;
  width: 44px;
  border-radius: 12px;
  color: var(--text-secondary);
  display: grid;
  place-items: center;
}

.mini-feature .arrow-btn svg {
  width: 16px;
  height: 16px;
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

footer {
  border-top: 1px solid var(--border);
  margin: 77px 0 0;
  padding: 29px 2px 38px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  color: var(--text-secondary);
  font-size: 11px;
}

footer strong {
  color: var(--text-secondary);
  font-weight: var(--font-weight-subtitle, 600);
}

.masthead {
  position: fixed;
  inset: 0 0 auto;
  width: 100%;
  height: 80px;
  z-index: 90;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color .22s ease, box-shadow .22s ease, border-color .22s ease;
}

.masthead.scrolled {
  background: color-mix(in srgb, var(--card-background) 98%, transparent);
  border-bottom-color: var(--border);
  box-shadow: var(--shadow);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand-en {
  font-weight: var(--font-weight-title, 700);
  color: var(--text);
}

.site-nav a.current {
  color: var(--primary);
}

.site-nav a.current::after {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 4px;
  content: "";
  background: var(--primary);
  opacity: .8;
}

@media (hover:hover) and (pointer:fine) {
  .site-nav a:hover {
    color: var(--primary);
  }
}

@media (max-width: 1100px) {
  .shell {
    width: min(100% - 60px,1000px);
  }

  .hero {
    padding: 54px 50px;
  }

  .art {
    transform: scale(.88);
    transform-origin: center right;
  }
}

@media (max-width: 760px) {
  .shell {
    width: calc(100% - 34px);
  }

  .topbar {
    min-height: 100px;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: 57px 39px;
    column-gap: 10px;
    row-gap: 0;
  }

  .wordmark {
    grid-column: 1;
    grid-row: 1;
  }

  .site-nav {
    grid-column: 1/-1;
    grid-row: 2;
    width: 100%;
    display: flex;
    gap: 24px;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none;
    font-size: 12px;
    font-weight: var(--font-weight-subtitle, 600);
  }

  .site-nav::-webkit-scrollbar {
    display: none;
  }

  .site-nav a {
    min-height: 38px;
    flex-shrink: 0;
  }

  .site-nav a.current::after {
    bottom: 2px;
  }

  .brand-name {
    font-size: 22px;
  }

  .hero {
    min-height: auto;
    margin: 16px 0 43px;
    border-radius: 28px;
    grid-template-columns: 1fr;
    padding: 34px 28px 32px;
  }

  .hero h1 {
    font-size: 34px;
    letter-spacing: -1.25px;
    margin: 20px 0 14px;
  }

  .hero p {
    font-size: 14px;
    line-height: 1.8;
    max-width: 330px;
  }

  .hero-cta {
    margin-top: 24px;
  }

  .art {
    display: none;
  }

  .section-title {
    display: block;
    margin-bottom: 20px;
  }

  .section-title h2 {
    font-size: 26px;
  }

  .section-title .subtitle {
    margin-top: 8px;
    text-align: left;
    font-size: 13px;
  }

  .pair {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .pair.equal {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feedback-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .section-gap {
    margin-top: 49px;
  }

  .navigation-panel {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feature-panel {
    min-height: 288px;
  }

  .stacked {
    gap: 16px;
  }

  .mini-feature {
    min-height: 125px;
  }

  .feedback-panel {
    min-height: 220px;
  }

  footer {
    margin-top: 50px;
  }
}

@media (max-width: 400px) {

  .top-state .state-dot {
    margin: 4px;
  }

  .hero {
    padding-left: 25px;
    padding-right: 25px;
  }

  .hero h1 {
    font-size: 32px;
  }

  .hero p {
    font-size: 14px;
  }

  .art {
    display: none;
  }

  .btn-row {
    gap: 8px;
  }

  .choice-bottom {
    flex-wrap: wrap;
  }
}

@media (max-width: 760px) {
  .brand-name {
    font-size: 22px;
  }

  .navigation-panel {
    --card-padding: 24px 22px;
  }

  .mini-feature {
    --card-padding: 22px;
  }

  .feedback-panel {
    min-height: 220px;
  }

  .cta-btn {
    min-height: 44px;
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

  footer {
    font-size: 13px;
    line-height: 1.6;
  }
}

@media (max-width: 400px) {
  .hero-cta {
    gap: 11px;
    flex-wrap: wrap;
  }

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

:global(body) {
  padding-top: 80px;
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
  :global(body) {
    padding-top: 100px;
  }

  .masthead {
    height: 100px;
  }

  .topbar {
    height: 100px;
    min-height: 100px;
    grid-template-rows: 57px 43px;
  }

  .list-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
  }
}

.secondary-pair {
  margin-top: 22px;
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
