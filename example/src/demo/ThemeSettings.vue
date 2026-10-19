<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Button, Dialog, Icon, Input, Segmented, Slider, Switch } from '@my-ui/vue'
import { applyTheme, createTheme, contrastRatio, defaultThemeOptions, themeColors, themeStyles, type ThemeColorId, type ThemeData, type ThemeMode, type ThemePreference, type ThemeStyleId } from '../theme/index.js'

type Settings = { mode: ThemePreference; backdropBlur: boolean; fontWeight: number; light: ThemeData; dark: ThemeData }
function defaults(): Settings {
  return { mode: defaultThemeOptions.mode, backdropBlur: defaultThemeOptions.backdropBlur, fontWeight: defaultThemeOptions.fontWeight, light: { ...defaultThemeOptions.light }, dark: { ...defaultThemeOptions.dark } }
}
function savedSettings(): Settings {
  try {
    const saved = JSON.parse((localStorage.getItem('my-ui:theme') ?? localStorage.getItem('chenglan:theme')) ?? 'null')
    if (!saved) return defaults()
    const next = { ...defaults(), ...saved, light: { ...defaults().light, ...saved.light }, dark: { ...defaults().dark, ...saved.dark } } as Settings
    createTheme(next)
    return next
  } catch { return defaults() }
}
const settings = reactive<Settings>(savedSettings())
const open = ref(false)
const systemMedia = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(systemMedia.matches)
const followSystem = (event: MediaQueryListEvent) => { systemDark.value = event.matches }
systemMedia.addEventListener('change', followSystem)
const current = computed(() => createTheme(settings, systemDark.value))
const currentMode = computed<ThemeMode>(() => current.value.mode)
const currentData = computed(() => settings[currentMode.value])
const modeLabel = computed(() => currentMode.value === 'dark' ? '暗色' : '浅色')
const availableColors = computed(() => themeColors.filter(item => !!item[currentMode.value]))
const appearances = [{ value: 'light', label: '浅色' }, { value: 'dark', label: '暗黑' }, { value: 'system', label: '跟随系统' }]
const drafts = reactive({ light: createTheme({ ...settings, mode: 'light' }).primary, dark: createTheme({ ...settings, mode: 'dark' }).primary })
const draft = computed(() => drafts[currentMode.value])
const valid = computed(() => /^#([\da-f]{3}|[\da-f]{6})$/i.test(draft.value.trim()))
const previewName = ref('清晰，也轻盈')
const previewTab = ref('daily')
const previewTabs = [{ value: 'daily', label: '日常' }, { value: 'saved', label: '收藏' }, { value: 'recent', label: '最近' }]
const notifications = ref(true)
const notice = ref('')
const textContrast = computed(() => {
  const colors = current.value.colors
  return Math.min(...[colors.cardBackground, colors.fill, colors.selectedBackground, colors.hover, colors.press].map(background => contrastRatio(colors.primary, background)))
})
let stopTheme: (() => void) | undefined
watch(settings, value => {
  const snapshot = { mode: value.mode, backdropBlur: value.backdropBlur, fontWeight: value.fontWeight, light: { ...value.light }, dark: { ...value.dark } }
  stopTheme = applyTheme(snapshot)
  try { localStorage.setItem('my-ui:theme', JSON.stringify(snapshot)) } catch { /* 存储失败时仍可在本页使用主题。 */ }
}, { deep: true, immediate: true })
onBeforeUnmount(() => { stopTheme?.(); systemMedia.removeEventListener('change', followSystem) })

function setMode(value: string) {
  if (value !== 'light' && value !== 'dark' && value !== 'system') return
  settings.mode = value
  notice.value = ''
}
function toggleMode() { settings.mode = currentMode.value === 'dark' ? 'light' : 'dark' }
function chooseColor(color: ThemeColorId) {
  currentData.value.color = color
  delete currentData.value.primary
  drafts[currentMode.value] = current.value.primary
  notice.value = ''
}
function chooseStyle(style: ThemeStyleId) { currentData.value.style = style; notice.value = '' }
function edit(value: string) {
  drafts[currentMode.value] = value
  notice.value = ''
  if (!valid.value) return
  const next = { ...settings, [currentMode.value]: { ...currentData.value, primary: value } }
  currentData.value.primary = createTheme(next, systemDark.value).primary
}
function reset() {
  Object.assign(settings, defaults())
  drafts.light = createTheme(settings).primary
  drafts.dark = createTheme({ ...settings, mode: 'dark' }).primary
  notice.value = '已恢复默认主题'
}
function colorInk(hex: string) { return contrastRatio(hex, '#ffffff') >= contrastRatio(hex, '#000000') ? '#ffffff' : '#000000' }
async function copy() {
  if (!valid.value) return
  try {
    await navigator.clipboard.writeText(JSON.stringify({ mode: settings.mode, backdropBlur: settings.backdropBlur, fontWeight: settings.fontWeight, light: settings.light, dark: settings.dark }, null, 2))
    notice.value = '主题配置已复制'
  } catch { notice.value = '复制未完成，请稍后再试' }
}
</script>

<template>
  <div class="theme-actions">
    <Button v-if="settings.mode !== 'system'" class="header-action" variant="bare" :icon="currentMode === 'dark' ? 'sun' : 'moon'" :aria-label="currentMode === 'dark' ? '切换到浅色模式' : '切换到暗黑模式'" @click="toggleMode" />
    <Button class="header-action" variant="bare" icon="sliders" aria-label="主题定制" :aria-expanded="open" @click="open = true" />
    <Dialog v-model="open" title="主题定制" description="浅色与暗色分别保存，修改会即时应用。" style="--dialog-width: 100%; --dialog-margin: 16px; --dialog-padding: clamp(20px, 3vw, 28px); --dialog-radius: 24px; height: 100%; text-align: left">
      <template #header="{ titleId }">
        <div class="theme-dialog-heading"><h2 :id="titleId">主题定制</h2><Button variant="bare" icon="x" aria-label="关闭主题定制" @click="open = false" /></div>
      </template>
      <div class="theme-editor">
        <div class="theme-options">
          <section class="theme-section">
            <h3>外观模式</h3>
            <Segmented class="mode-segment" :model-value="settings.mode" :options="appearances" label="外观模式" @update:model-value="setMode" />
            <p class="mode-note">正在定制{{ modeLabel }}主题<span v-if="settings.mode === 'system'"> · 随系统自动切换</span></p>
          </section>
          <section class="theme-section">
            <div class="section-label"><h3>主题色</h3><span>{{ modeLabel }}主色</span></div>
            <div class="color-grid" role="group" :aria-label="modeLabel + '主题主色'">
              <button v-for="item in availableColors" :key="item.id" class="color-choice" type="button" :aria-label="'选择' + item.label + '主色'" :aria-pressed="current.primary === item[currentMode]" @click="chooseColor(item.id)">
                <span class="color-dot" :style="{ background: item[currentMode], color: colorInk(item[currentMode]!) }"><Icon v-if="current.primary === item[currentMode]" name="check" /></span><span>{{ item.label }}</span>
              </button>
            </div>
            <Input class="hex-field" :model-value="draft" label="自定义主色" :error="!valid ? '请输入 #RGB 或 #RRGGBB' : undefined" hint="仅改变正在定制的主题，另一份配置会保留。" :maxlength="7" spellcheck="false" @update:model-value="edit">
              <template #prefix><input class="color-picker" type="color" :value="current.primary" aria-label="拾取主题色" @input="edit(($event.target as HTMLInputElement).value)" /></template>
            </Input>
            <p class="color-notice" :class="{ warning: valid && textContrast < 4.5 }" role="status">{{ notice || (valid && textContrast < 4.5 ? '主色文字对比偏低，建议选择' + (currentMode === 'dark' ? '更亮' : '更深') + '的颜色。' : currentMode === 'dark' ? '暗色主色更明亮，暖黄、杏橙等亮色在这里可选。' : '浅色主色更沉稳，适合按钮、文字与选中状态。') }}</p>
          </section>
          <section class="theme-section">
            <h3>界面风格</h3>
            <div class="style-grid" role="group" aria-label="界面风格">
              <button v-for="item in themeStyles" :key="item.id" type="button" class="style-choice" :aria-label="'选择' + item.label + '风格'" :aria-pressed="current.style === item.id" @click="chooseStyle(item.id)">
                <span class="style-preview" :style="{ background: item[currentMode].background }"><span class="style-card" :style="{ background: item[currentMode].cardBackground, borderColor: item[currentMode].border, boxShadow: item[currentMode].shadow }"><i :style="{ background: item[currentMode].text }" /><i :style="{ background: item[currentMode].fill }" /><i :style="{ background: current.primary }" /></span></span>
                <strong>{{ item.label }}</strong><small>{{ item.description }}</small>
              </button>
            </div>
          </section>
        </div>
        <div class="theme-preview-column">
          <section class="theme-section">
            <div class="section-label"><h3>文字字重</h3><Button class="weight-reset" variant="text" @click="settings.fontWeight = 400">恢复字重</Button></div>
            <Slider v-model="settings.fontWeight" label="全局字重" :min="100" :max="1000" :step="1" unit="" start-label="100 · 更细" end-label="1000 · 更粗" />
            <p class="weight-sample">清晰且自然 Aa 0123456789</p>
            <p class="weight-note">默认 400，保留文字层级。字体支持可变字重时，粗细会连续变化。</p>
          </section>
          <section class="theme-section">
            <h3>弹窗效果</h3>
            <label class="backdrop-setting"><span><strong>背景模糊</strong><small>柔化弹窗背后的内容</small></span><Switch v-model="settings.backdropBlur" label="弹窗背景模糊" /></label>
          </section>
          <section class="theme-section">
            <h3>实时预览</h3>
            <div class="theme-preview">
              <Segmented v-model="previewTab" :options="previewTabs" label="主题预览分段选择" />
              <Input v-model="previewName" label="输入框预览" clearable />
              <div class="preview-bottom"><label><span>消息提醒</span><Switch v-model="notifications" label="主题预览消息提醒" /></label><Button @click="notice = '当前主题已应用'">主要按钮</Button></div>
            </div>
          </section>
        </div>
      </div>
      <template #actions><div class="theme-footer"><Button variant="text" @click="reset">恢复默认</Button><span class="footer-space" /><Button variant="outline" icon="copy" :disabled="!valid" @click="copy">复制</Button><Button @click="open = false">完成</Button></div></template>
    </Dialog>
  </div>
</template>

<style scoped>
.theme-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.header-action { width: 44px; height: 44px; min-height: 44px; border-radius: 12px; }
.header-action :deep(svg) { width: 21px; height: 21px; color: var(--text); }
.theme-dialog-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.theme-dialog-heading h2 { margin: 0; color: var(--text); font-size: 22px; font-weight: var(--font-weight-title, 700); line-height: 32px; }
.theme-dialog-heading :deep(button) { width: 44px; height: 44px; min-height: 44px; }
.theme-editor { display: grid; gap: 24px; color: var(--text); text-align: left; line-height: 1.5; }
.theme-options, .theme-preview-column { display: grid; gap: 24px; min-width: 0; }
.weight-reset { min-height: 24px; padding: 0; font-size: 12px; }
.weight-sample { margin: 12px 0 8px; padding: 14px 16px; border-radius: 12px; background: var(--fill); font-size: 19px; line-height: 1.6; overflow-wrap: anywhere; }
.weight-note { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 18px; }
.backdrop-setting { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 14px; background: var(--fill); }
.backdrop-setting strong { display: block; font-size: 14px; font-weight: var(--font-weight-action, 500); }
.backdrop-setting small { display: block; margin-top: 4px; color: var(--text-secondary); font-size: 12px; font-weight: var(--font-weight, 400); }
.theme-section { min-width: 0; }
.theme-section h3 { margin: 0 0 12px; font-size: 14px; font-weight: var(--font-weight-subtitle, 600); line-height: 20px; }
.section-label { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.section-label > span { color: var(--text-secondary); font-size: 12px; padding-bottom: 12px; }
.mode-note { margin: 9px 0 0; color: var(--text-secondary); font-size: 12px; }
.color-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; margin-bottom: 16px; }
.color-choice { display: flex; align-items: center; flex-direction: column; gap: 6px; min-height: 62px; padding: 8px 4px; border: 1.5px solid transparent; border-radius: 12px; background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: var(--font-weight-action, 500); }
.color-choice[aria-pressed="true"] { border-color: var(--primary); color: var(--primary); background: var(--fill); }
.color-dot { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 50%; }
.color-dot :deep(svg) { width: 17px; height: 17px; }
.hex-field { margin-top: 8px; }
.color-picker { width: 25px; height: 25px; padding: 0; border: 0; border-radius: 6px; overflow: hidden; background: none; cursor: pointer; }
.color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.color-picker::-webkit-color-swatch { border: 0; border-radius: 6px; }
.color-picker::-moz-color-swatch { border: 0; border-radius: 6px; }
.color-notice { margin: 10px 0 0; min-height: 36px; color: var(--text-secondary); font-size: 12px; line-height: 18px; }
.color-notice.warning { color: var(--warning); }
.style-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.style-choice { min-width: 0; padding: 8px; border: 1.5px solid var(--border); border-radius: 14px; color: var(--text); background: transparent; text-align: left; }
.style-choice[aria-pressed="true"] { border-color: var(--primary); }
.style-choice strong { display: block; margin: 9px 2px 3px; font-size: 13px; font-weight: var(--font-weight-action, 500); }
.style-choice small { display: block; margin-inline: 2px; color: var(--text-secondary); font-size: 11px; font-weight: var(--font-weight, 400); line-height: 16px; }
.style-preview { display: flex; align-items: center; justify-content: center; height: 67px; border-radius: 8px; overflow: hidden; }
.style-card { display: grid; gap: 5px; width: 70%; padding: 10px; border: 1px solid; border-radius: 7px; }
.style-card i { display: block; height: 4px; border-radius: 2px; }
.style-card i:first-child { width: 46%; }
.style-card i:nth-child(2) { height: 9px; }
.style-card i:last-child { width: 28%; }
.theme-preview { display: grid; gap: 16px; padding: 16px; border: 1px solid var(--border); border-radius: 16px; background: var(--background); }
.preview-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.preview-bottom label { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.theme-footer { display: flex; align-items: center; gap: 8px; text-align: left; }
.theme-footer :deep(.my-button) { padding-inline: 12px; }
.footer-space { flex: 1; }
.color-choice:active, .style-choice:active { background-color: var(--press); }
@media (hover:hover) and (pointer:fine) { .color-choice:hover:not(:active), .style-choice:hover:not(:active) { background-color: var(--hover); } }
@media (min-width:900px) {
  .theme-editor { grid-template-columns: minmax(0, 1.2fr) minmax(300px, .8fr); gap: 32px; align-items: start; }
  /* 设置独立滚动时保持预览可见，方便立即辨认颜色与模糊效果。 */
  .theme-preview-column { position: sticky; top: 0; }
}
@media (max-width:480px) {
  .mode-segment :deep(button) { padding-inline: 4px; font-size: 13px; white-space: nowrap; }
  .color-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .style-grid { gap: 8px; }
  .style-choice { padding: 6px; }
  .style-choice small { display: none; }
  .style-preview { height: 54px; }
  .style-card { width: 80%; padding: 7px; }
  .theme-preview { padding: 12px; }
  .preview-bottom { gap: 8px; }
  .preview-bottom label { gap: 8px; font-size: 12px; }
  .preview-bottom :deep(.my-button) { padding-inline: 12px; font-size: 13px; }
  .theme-footer { gap: 6px; }
  .theme-footer :deep(.my-button) { font-size: 13px; padding-inline: 10px; }
}
</style>
