<script setup lang="ts">
import {
  computed,
  inject,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref
} from 'vue'
import { Icon } from '@my-ui/vue'
import { demoNavigationKey } from '../commons/navigation'
import { useThemeStore } from '../commons/state/theme'
import AppBarExamples from '../pages/home/app-bar/index.vue'
import ButtonExamples from '../pages/home/button/index.vue'
import CardExamples from '../pages/home/card/index.vue'
import ComboboxExamples from '../pages/home/combobox/index.vue'
import DateTimeExamples from '../pages/home/date-time-picker/index.vue'
import FeedbackExamples from '../pages/home/feedback/index.vue'
import IdentityExamples from '../pages/home/identity/index.vue'
import ImageExamples from '../pages/home/image/index.vue'
import InputExamples from '../pages/home/input/index.vue'
import ListExamples from '../pages/home/list/index.vue'
import MenuExamples from '../pages/home/menu/index.vue'
import NativeHtmlExample from '../pages/home/native-html/index.vue'
import NavigationExamples from '../pages/home/navigation/index.vue'
import NoticeExamples from '../pages/home/notice-steps/index.vue'
import PickerExamples from '../pages/home/picker/index.vue'
import PopupExamples from '../pages/home/popup/index.vue'
import PrimitiveExamples from '../pages/home/primitives/index.vue'
import ScenarioExamples from '../pages/home/scenarios/index.vue'
import SelectionExamples from '../pages/home/selection/index.vue'
import CollapseExamples from '../pages/home/selection-collapse/index.vue'
import ShadowExamples from '../pages/home/shadows/index.vue'
import SliderExamples from '../pages/home/slider/index.vue'
import SwitchExamples from '../pages/home/switch/index.vue'
import TagExamples from '../pages/home/tag/index.vue'
import TouchExamples from '../pages/home/touch-gestures/index.vue'
import UploadExamples from '../pages/home/upload/index.vue'
import SharedStateExample from '../pages/native/navigation/index.vue'

const props = defineProps<{
  /** 首次打开时定位的分类。 */
  section?: string
}>()
const navigation = inject(demoNavigationKey, null)
const sectionPrefix = navigation ? '#/showcase#' : '#showcase-'
const theme = useThemeStore()
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(systemTheme.matches)
const dark = computed(() => theme.mode === 'dark' || (theme.mode === 'system' && systemDark.value))
const followSystem = (event: MediaQueryListEvent) => { systemDark.value = event.matches }
const sections = [
  { id: 'actions', label: '基础组件' },
  { id: 'controls', label: '交互控制' },
  { id: 'surfaces', label: '内容容器' },
  { id: 'feedback', label: '状态反馈' },
  { id: 'scenarios', label: '完整示例' }
]
const controlLinks = [
  { id: 'control-fields', label: '输入与选项' },
  { id: 'control-pickers', label: '搜索与选择' },
  { id: 'control-dates', label: '日期与时间' },
  { id: 'control-upload', label: '文件上传' }
]
const feedbackLinks = [
  { id: 'feedback-state', label: '共享状态' },
  { id: 'feedback-prompts', label: '提示与确认' },
  { id: 'feedback-progress', label: '进度与通知' },
  { id: 'feedback-overlays', label: '抽屉与菜单' }
]
const root = ref<HTMLElement>()
const masthead = ref<HTMLElement>()
const chapterMenu = ref<HTMLDetailsElement>()
const chapterTrigger = ref<HTMLElement>()
const scrolled = ref(false),
  currentSection = ref('')
const chapterLabel = computed(() => sections.find(section => section.id === currentSection.value)?.label ?? '章节目录')
const activated = ref(true),
  visible = ref(!document.hidden)
const active = computed(() => activated.value && visible.value)
let frame = 0
let sectionObserver: ResizeObserver | undefined

function syncHeader() {
  const page = root.value, header = masthead.value
  if (!page || !header) return
  scrolled.value = page.scrollTop > 24
  let current = ''
  for (const item of sections) {
    const section = page.querySelector<HTMLElement>('#showcase-' + item.id)
    if (
      section &&
      section.getBoundingClientRect().top <= header.getBoundingClientRect().bottom + 48
    )
      current = item.id
  }
  currentSection.value = current
}
function scheduleHeader() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    syncHeader()
  })
}
function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const page = root.value, header = masthead.value
  if (!page || !header) return
  const target = document.getElementById('showcase-' + id)
  if (id !== 'top' && !target) return
  page.scrollTo({
    top: id === 'top' ? 0
      : target!.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - header.offsetHeight - 20,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior
  })
}
function closeChapterMenu(restoreFocus = false) {
  if (!chapterMenu.value?.open) return
  chapterMenu.value.open = false
  if (restoreFocus) chapterTrigger.value?.focus({ preventScroll: true })
}
function selectChapter(id: string) {
  closeChapterMenu(true)
  scrollToSection(id)
}
function releaseInitialSection() {
  sectionObserver?.disconnect()
  sectionObserver = undefined
}
function updateVisibility() {
  visible.value = !document.hidden
}
onActivated(() => {
  activated.value = true
  scheduleHeader()
})
onDeactivated(() => {
  activated.value = false
  closeChapterMenu()
  releaseInitialSection()
})
onMounted(() => {
  systemTheme.addEventListener('change', followSystem)
  document.addEventListener('visibilitychange', updateVisibility)
  window.addEventListener('resize', scheduleHeader, { passive: true })
  const section = props.section
  const content = root.value?.querySelector('main')
  if (section && content?.contains(document.getElementById('showcase-' + section))) {
    // 图片或字体就位可能推移入口锚点，用户操作前保持对齐。
    sectionObserver = new ResizeObserver(() => scrollToSection(section, 'instant'))
    sectionObserver.observe(content)
  }
  syncHeader()
})
onBeforeUnmount(() => {
  releaseInitialSection()
  systemTheme.removeEventListener('change', followSystem)
  cancelAnimationFrame(frame)
  document.removeEventListener('visibilitychange', updateVisibility)
  window.removeEventListener('resize', scheduleHeader)
})
</script>

<template>
  <div class="showcase-page demo-view">
    <slot name="header" />
    <div
      ref="root"
      class="showcase-layout"
      aria-label="完整交互示例"
      @click="!chapterMenu?.contains($event.target as Node) && closeChapterMenu()"
      @keydown="releaseInitialSection"
      @pointerdown="releaseInitialSection"
      @scroll.passive="scheduleHeader"
      @wheel.passive="releaseInitialSection"
    >
      <header ref="masthead" class="masthead" :class="{ scrolled, 'masthead--app': navigation }">
        <div class="shell masthead-shell">
          <a v-if="!navigation" class="showcase-brand" href="#showcase-top" aria-label="my-ui，回到顶部" @click.prevent="scrollToSection('top')">
            <img src="/favicon.svg" width="28" height="28" alt="" />
            <strong>my-ui</strong><span>交互示例</span>
          </a>
          <nav class="site-nav" aria-label="章节目录">
            <a
              v-for="item in sections"
              :key="item.id"
              :href="sectionPrefix + item.id"
              :class="{ current: currentSection === item.id }"
              :aria-current="currentSection === item.id ? 'location' : undefined"
              @click.prevent="scrollToSection(item.id)"
              >{{ item.label }}</a
            >
          </nav>
          <details ref="chapterMenu" class="chapter-menu" @keydown.esc.stop.prevent="closeChapterMenu(true)">
            <summary ref="chapterTrigger" aria-label="章节目录">{{ chapterLabel }}</summary>
            <nav aria-label="章节目录">
              <a
                v-for="item in sections"
                :key="item.id"
                :href="sectionPrefix + item.id"
                :class="{ current: currentSection === item.id }"
                :aria-current="currentSection === item.id ? 'location' : undefined"
                @click.prevent="selectChapter(item.id)"
              >{{ item.label }}</a>
            </nav>
          </details>
          <div v-if="!navigation" class="nav-theme">
            <button
              type="button"
              :aria-label="dark ? '切换到浅色模式' : '切换到暗黑模式'"
              @click="theme.mode = dark ? 'light' : 'dark'"
            ><Icon :name="dark ? 'sun' : 'moon'" /></button>
          </div>
        </div>
      </header>
      <div class="shell">
        <main id="showcase-top">
          <section class="hero">
            <div class="hero-copy">
                <div class="eyebrow"><i class="dash"></i> MY-UI · 组件展示</div>
              <h1>自然留白，<br /><span>轻盈交互。</span></h1>
                <p>体验按钮、表单、弹层与完整交互场景。</p>
              <div class="hero-cta">
                <a
                  :href="sectionPrefix + 'actions'"
                  class="cta-btn"
                  @click.prevent="scrollToSection('actions')"
                  >探索组件 <Icon name="arrow-right" /></a
                >
              </div>
            </div>
            <div class="art" aria-hidden="true">
              <div class="art-halo"></div>
              <div class="sample-window">
                <div class="sample-top">
                  <div class="sample-appicon"><Icon name="spark" /></div>
                  <div class="sample-dots"><i></i><i></i><i></i></div>
                </div>
                <div class="sample-title">自在，从容。</div>
                <div class="sample-caption">清晰而自然的视觉秩序</div>
                <div class="sample-progress"><i></i></div>
              </div>
              <div class="float-chip first">
                <div class="round green"><Icon name="check" /></div>
                <span><strong>已完成</strong><small>每一步都轻松</small></span>
              </div>
              <div class="float-chip second">
                <div class="round"><Icon name="spark" /></div>
                <span><strong>专注细节</strong><small>简洁，却不简单</small></span>
              </div>
            </div>
          </section>

          <section id="showcase-actions">
            <div class="section-title">
              <div>
                <div class="number">01 / 基础组件</div>
                <h2>按钮与标签</h2>
              </div>
              <div class="subtitle">清晰的操作层级，自然的按压反馈。</div>
            </div>
            <div class="pair">
              <div class="showcase-example"><ButtonExamples /></div>
              <div class="showcase-example"><TagExamples /></div>
            </div>
          </section>
          <section id="showcase-controls" class="section-gap">
            <div class="section-title">
              <div>
                <div class="number">02 / 交互控制</div>
                <h2>输入与选择</h2>
              </div>
              <div class="subtitle">为手指设计的控件尺寸，状态变化一目了然。</div>
            </div>
            <nav class="section-links" aria-label="交互控制小节">
              <a
                v-for="item in controlLinks" :key="item.id"
                :href="sectionPrefix + item.id"
                @click.prevent="scrollToSection(item.id)"
              >{{ item.label }}</a>
            </nav>
            <div id="showcase-control-fields" class="pair equal">
              <div class="showcase-example"><InputExamples /></div>
              <div class="showcase-example"><SwitchExamples /></div>
            </div>
            <div class="pair equal secondary-pair">
              <div class="showcase-example"><SliderExamples /></div>
              <div class="showcase-example"><SelectionExamples /></div>
            </div>
            <div class="secondary-pair"><CollapseExamples /></div>
            <div id="showcase-control-pickers" class="secondary-pair"><ComboboxExamples /></div>
            <div class="secondary-pair"><PickerExamples /></div>
            <div id="showcase-control-dates" class="secondary-pair"><DateTimeExamples /></div>
            <div id="showcase-control-upload" class="secondary-pair"><UploadExamples /></div>
          </section>
          <section id="showcase-surfaces" class="section-gap">
            <div class="section-title">
              <div>
                <div class="number">03 / 内容容器</div>
                <h2>卡片与导航</h2>
              </div>
              <div class="subtitle">柔和的层次和留白，突出内容本身。</div>
            </div>
            <CardExamples />
            <div
              v-for="(example, index) in [ShadowExamples, IdentityExamples, ImageExamples, AppBarExamples, NavigationExamples, ListExamples]"
              :key="index"
              class="secondary-pair"
            >
              <component :is="example" />
            </div>
          </section>
          <section id="showcase-feedback" class="section-gap">
            <div class="section-title">
              <div>
                <div class="number">04 / 状态反馈</div>
                <h2>提示与弹层</h2>
              </div>
              <div class="subtitle">提示、确认对话框和移动端操作面板。</div>
            </div>
            <nav class="section-links" aria-label="状态反馈小节">
              <a
                v-for="item in feedbackLinks" :key="item.id"
                :href="sectionPrefix + item.id"
                @click.prevent="scrollToSection(item.id)"
              >{{ item.label }}</a>
            </nav>
            <div id="showcase-feedback-state"><SharedStateExample /></div>
            <div id="showcase-feedback-prompts" class="secondary-pair"><FeedbackExamples /></div>
            <div id="showcase-feedback-progress" class="secondary-pair"><PrimitiveExamples :active="active" /></div>
            <div class="secondary-pair"><NoticeExamples /></div>
            <div id="showcase-feedback-overlays" class="secondary-pair"><PopupExamples /></div>
            <div class="secondary-pair"><TouchExamples /></div>
            <div class="secondary-pair"><MenuExamples /></div>
          </section>
          <section id="showcase-scenarios" class="section-gap">
            <div class="section-title">
              <div>
                <div class="number">05 / 完整示例</div>
                <h2>组件如何配合</h2>
              </div>
              <div class="subtitle">从资料编辑到内容加载，体验多个组件一起工作。</div>
            </div>
            <ScenarioExamples />
            <NativeHtmlExample />
          </section>
        </main>
        <footer class="showcase-footer">
          <span><strong>my-ui</strong> · 完整交互示例</span>
          <button class="to-top" type="button" @click="scrollToSection('top')">回到顶部 ↑</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped src="../../../html/assets/css/showcase-shell.css"></style>

<style scoped>
.showcase-page {
  height: 100%;
}
.showcase-layout {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior-y: contain;
  background: var(--background);
  scrollbar-gutter: stable;
}

.showcase-example {
  display: grid;
  min-width: 0;
}
.showcase-example > :deep(section) {
  display: grid;
  min-width: 0;
}
.showcase-layout :deep(.my-card) {
  min-width: 0;
}
</style>
