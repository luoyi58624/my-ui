<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Icon } from '@my-ui/vue'
import ThemeSettings from './demo/ThemeSettings.vue'
import { closePage, openPage } from './navigation'

const emit = defineEmits<{
  /** 将导航失败交给示例页的统一提示。 */
  navigationError: [message: string]
}>()
const sections = [
  { id: 'actions', label: '基础组件' }, { id: 'controls', label: '交互控制' },
  { id: 'surfaces', label: '内容容器' }, { id: 'feedback', label: '状态反馈' },
  { id: 'scenarios', label: '完整示例' },
]
const root = ref<HTMLElement>()
const route = useRoute()
const scrolled = ref(false), currentSection = ref('')
const activated = ref(true), visible = ref(!document.hidden)
const active = computed(() => activated.value && visible.value)
let frame = 0

function syncHeader() {
  const page = root.value
  if (!page) return
  scrolled.value = page.scrollTop > 24
  let current = ''
  for (const item of sections) {
    const section = page.querySelector<HTMLElement>('#showcase-' + item.id)
    if (section && section.getBoundingClientRect().top <= page.clientHeight * .35) current = item.id
  }
  currentSection.value = current
}
function scheduleHeader() {
  if (frame) return
  frame = requestAnimationFrame(() => { frame = 0; syncHeader() })
}
function scrollToSection(id: string) {
  const page = root.value
  const target = page?.querySelector<HTMLElement>('#showcase-' + id)
  if (!page || !target) return
  const header = page.querySelector<HTMLElement>('.masthead')!
  page.scrollTo({
    top: id === 'top' ? 0 : target.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - header.offsetHeight - 20,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
function reportError(error: unknown) {
  emit('navigationError', error instanceof Error ? error.message : String(error))
}
function back() { void closePage('/home').catch(reportError) }
function openHtml() { void openPage('/html', { title: '原生 HTML 示例' }).catch(reportError) }
function updateVisibility() { visible.value = !document.hidden }
onActivated(() => { activated.value = true; scheduleHeader() })
onDeactivated(() => { activated.value = false })
onMounted(async () => {
  document.addEventListener('visibilitychange', updateVisibility)
  window.addEventListener('resize', scheduleHeader, { passive: true })
  await nextTick()
  const anchor = route.hash.slice(1)
  if (sections.some(section => section.id === anchor)) scrollToSection(anchor)
  syncHeader()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  document.removeEventListener('visibilitychange', updateVisibility)
  window.removeEventListener('resize', scheduleHeader)
})
</script>

<template>
  <div ref="root" class="showcase-layout" aria-label="完整交互示例" @scroll.passive="scheduleHeader">
    <header class="masthead" :class="{ scrolled }">
      <div class="shell topbar">
        <div class="showcase-brand">
          <Button variant="bare" icon="chevron-right" class="showcase-back" aria-label="返回组件目录" @click="back" />
          <a class="wordmark" href="#/showcase" aria-label="回到顶部" @click.prevent="scrollToSection('top')"><span class="brand-mark" aria-hidden="true"></span><span class="brand-copy"><span class="brand-name">my-ui</span><span class="brand-sub">CSS · JAVASCRIPT · VUE</span></span></a>
        </div>
        <nav class="site-nav" aria-label="页面导航"><a v-for="item in sections" :key="item.id" :href="'#/showcase#' + item.id" :class="{ current: currentSection === item.id }" :aria-current="currentSection === item.id ? 'location' : undefined" @click.prevent="scrollToSection(item.id)">{{ item.label }}</a><a href="./native.html" @click.prevent="openHtml">原生 HTML ↗</a></nav>
        <ThemeSettings />
      </div>
    </header>
    <div class="shell">
      <main id="showcase-top">
        <section class="hero">
          <div class="hero-copy">
            <div class="eyebrow"><i class="dash"></i> MOBILE COMPONENT SYSTEM</div>
            <h1>自然留白，<br /><span>轻盈交互。</span></h1>
            <p>用克制的色彩、舒适的留白与柔和卡片，<br />原生 HTML 与 Vue 共用一套组件体验。</p>
            <div class="hero-cta"><a href="#/showcase#actions" class="cta-btn" @click.prevent="scrollToSection('actions')">探索组件 <Icon name="arrow-right" /></a><a class="hero-note" href="./native.html" @click.prevent="openHtml">原生 HTML 示例 ↗</a></div>
          </div>
          <div class="art" aria-hidden="true">
            <div class="art-halo"></div>
            <div class="sample-window"><div class="sample-top"><div class="sample-appicon"><Icon name="spark" /></div><div class="sample-dots"><i></i><i></i><i></i></div></div><div class="sample-title">自在，从容。</div><div class="sample-caption">清晰而自然的视觉秩序</div><div class="sample-progress"><i></i></div></div>
            <div class="float-chip first"><div class="round green"><Icon name="check" /></div><span><strong>已完成</strong><small>每一步都轻松</small></span></div>
            <div class="float-chip second"><div class="round"><Icon name="spark" /></div><span><strong>专注细节</strong><small>简洁，却不简单</small></span></div>
          </div>
        </section>

        <section id="showcase-actions">
          <div class="section-title"><div><div class="number">01 / 基础组件</div><h2>按钮与标签</h2></div><div class="subtitle">清晰的操作层级，自然的按压反馈。</div></div>
          <div class="pair"><div class="showcase-example"><slot name="button" /></div><div class="showcase-example"><slot name="tag" /></div></div>
        </section>
        <section id="showcase-controls" class="section-gap">
          <div class="section-title"><div><div class="number">02 / 交互控制</div><h2>输入与选择</h2></div><div class="subtitle">为手指设计的控件尺寸，状态变化一目了然。</div></div>
          <div class="pair equal"><div class="showcase-example"><slot name="input" /></div><div class="showcase-example"><slot name="switch" /></div></div>
          <div class="pair equal secondary-pair"><div class="showcase-example"><slot name="slider" /></div><div class="showcase-example"><slot name="selection" /></div></div>
          <div v-for="id in ['selection-collapse', 'combobox', 'picker', 'date-time-picker', 'upload']" :key="id" class="secondary-pair"><slot :name="id" /></div>
        </section>
        <section id="showcase-surfaces" class="section-gap">
          <div class="section-title"><div><div class="number">03 / 内容容器</div><h2>卡片与导航</h2></div><div class="subtitle">柔和的层次和留白，突出内容本身。</div></div>
          <slot name="card" />
          <div v-for="id in ['shadows', 'identity', 'image', 'app-bar', 'navigation', 'list']" :key="id" class="secondary-pair"><slot :name="id" /></div>
        </section>
        <section id="showcase-feedback" class="section-gap">
          <div class="section-title"><div><div class="number">04 / 状态反馈</div><h2>提示与弹层</h2></div><div class="subtitle">提示、确认对话框和移动端操作面板。</div></div>
          <slot name="native-navigation" />
          <div v-for="id in ['feedback', 'primitives', 'notice-steps', 'popup', 'touch-gestures', 'menu']" :key="id" class="secondary-pair"><slot :name="id" :active="active" /></div>
        </section>
        <section id="showcase-scenarios" class="section-gap"><slot name="scenarios" /><slot name="native-html" /></section>
      </main>
      <footer><span><strong>my-ui</strong> · 从简约出发，让体验更自在。</span><span>LOCAL SOURCE · YOUR COMPONENTS</span></footer>
    </div>
  </div>
</template>

<style scoped>
/* 旧版整页示例的布局与头图样式，组件内容继续共用 App 的插槽。 */
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

  .section-gap {
    margin-top: 49px;
  }

  footer {
    margin-top: 50px;
  }
}

@media (max-width: 400px) {

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
}

@media (max-width: 760px) {
  .brand-name {
    font-size: 22px;
  }

  .cta-btn {
    min-height: 44px;
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
}

@media (max-width:760px) {

  .masthead {
    height: 100px;
  }

  .topbar {
    height: 100px;
    min-height: 100px;
    grid-template-rows: 57px 43px;
  }
}

.secondary-pair {
  margin-top: 22px;
}

.showcase-layout { height: 100dvh; overflow: auto; overscroll-behavior-y: contain; background: var(--background); scrollbar-gutter: stable; }
/* 原页面滚动由当前路由容器承接，避免改变 App 其他页面的滚动方式。 */
.masthead { position: sticky; top: 0; height: auto; padding-top: env(safe-area-inset-top); }
.showcase-brand { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.showcase-brand > .my-button { width: 36px; height: 44px; min-height: 44px; padding: 0; }
.showcase-back :deep(svg) { transform: rotate(180deg); }
.showcase-example { display: grid; min-width: 0; }
.showcase-example > :deep(section) { display: grid; min-width: 0; }
.showcase-layout :deep(.my-card) { min-width: 0; }
.cta-btn svg { width: 18px; height: 18px; }
.site-nav a:focus-visible, .wordmark:focus-visible, .cta-btn:focus-visible, .hero-note:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; border-radius: 6px; }
@media (max-width: 1000px) and (min-width: 761px) {
  .topbar { flex-wrap: wrap; height: auto; gap: 0 20px; padding-block: 12px 0; }
  .topbar :deep(.theme-actions) { margin-left: auto; }
  .site-nav { order: 1; justify-content: center; width: 100%; }
}
@media (max-width: 760px) {
  .showcase-brand { grid-column: 1; grid-row: 1; gap: 4px; min-width: 0; }
  .brand-mark { width: 34px; height: 34px; border-radius: 10px; }
  .brand-mark::after { inset: 6px 10px; }
  .brand-sub { font-size: 8px; letter-spacing: .4px; }
  .wordmark { gap: 8px; }
  .topbar :deep(.theme-actions) { gap: 0; }
  footer { flex-wrap: wrap; }
}
@media (max-width: 400px) {
  .brand-name { font-size: 20px; }
  .brand-sub { display: none; }
  .eyebrow { font-size: 10px; letter-spacing: 1px; }
}
@media (prefers-reduced-motion: reduce) { .masthead, .cta-btn { transition: none; } }
</style>
