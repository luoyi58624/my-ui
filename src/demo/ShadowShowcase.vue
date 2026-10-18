<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Dialog, Icon, Menu, type IconName, type MenuOption } from '../../vue'

const emit = defineEmits<{
  /** 将示例操作交给页面的统一提示。 */
  notify: [message: string]
}>()
const dialogOpen = ref(false)
const levels: { name: string; usage: string; value: string; icon: IconName }[] = [
  { name: '无阴影', usage: '嵌入内容、平铺列表', value: 'none', icon: 'grid' },
  { name: '轻浮起', usage: '小型工具栏、浮起控件', value: 'var(--small-shadow)', icon: 'sliders' },
  { name: '卡片', usage: '内容卡片、页面分组', value: 'var(--shadow)', icon: 'layer' },
  { name: '浮层', usage: '菜单、搜索选项、轻提示', value: 'var(--popup-shadow)', icon: 'message' },
  { name: '模态', usage: '对话框、抽屉、底部面板', value: 'var(--modal-shadow)', icon: 'copy' },
]
const actions: MenuOption[] = [
  { value: 'copy', label: '复制链接', icon: 'copy' },
  { value: 'save', label: '加入收藏', icon: 'heart' },
  { value: 'share', label: '分享内容', icon: 'share' },
]
</script>

<template>
  <Card id="shadows" class="shadow-showcase" title="阴影层级" description="从贴近页面到悬浮其上，按实际场景选择。" sample="SHADOWS">
    <div class="shadow-levels" aria-label="五种阴影层级对比">
      <figure v-for="(level, index) in levels" :key="level.name" class="shadow-level">
        <div class="shadow-stage">
          <div class="shadow-sample" :style="{ boxShadow: level.value }" aria-hidden="true"><Icon :name="level.icon" /><span>0{{ index }}</span></div>
        </div>
        <figcaption><strong>{{ level.name }}</strong><span>{{ level.usage }}</span><code>{{ level.value }}</code></figcaption>
      </figure>
    </div>
    <div class="shadow-context">
      <div class="context-heading"><h4>放进真实组件</h4><p>打开菜单或弹窗，比较它们与内容卡片的距离感。</p></div>
      <div class="context-stage">
        <Card class="context-card">
          <div class="context-content"><span class="context-icon"><Icon name="inbox" /></span><div><strong>我的工作空间</strong><p>整理内容，让层次保持清晰</p></div></div>
          <div class="context-actions">
            <Menu :options="actions" label="阴影示例菜单" anchor="element" placement="bottom-end" @select="emit('notify', $event.label + '（阴影示例）')"><template #default="{ trigger }"><Button v-bind="trigger" variant="text">浮层菜单 <Icon name="chevrons-up-down" /></Button></template></Menu>
            <Button variant="outline" @click="dialogOpen = true">模态弹窗</Button>
          </div>
        </Card>
      </div>
    </div>
    <p class="shadow-note">浅色与暗色使用独立阴影。切换顶部主题，即可比较不同背景下的层次。</p>
    <details class="shadow-code"><summary>查看使用方式</summary><pre><code>/* 按场景选择一个值即可 */
.toolbar { box-shadow: var(--small-shadow); }
.card    { box-shadow: var(--shadow); }
.menu    { box-shadow: var(--popup-shadow); }
.dialog  { box-shadow: var(--modal-shadow); }</code></pre></details>
    <Dialog v-model="dialogOpen" title="保留这份灵感？" description="模态窗口使用更宽的投影，菜单使用中等投影，内容卡片保持轻盈。" :icon="false" confirm-text="保留" @confirm="emit('notify', '已保留这份灵感（阴影示例）')" />
  </Card>
</template>

<style scoped>
.shadow-showcase { scroll-margin-top: 120px; }
.shadow-levels { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; }
.shadow-level { min-width: 0; margin: 0; }
.shadow-stage { display: grid; place-items: center; min-height: 160px; padding: 28px 14px; border: 1px solid color-mix(in srgb, var(--border) 50%, transparent); border-radius: 18px; background: var(--background); }
.shadow-sample { width: 94px; height: 76px; display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 16px; background: var(--card-background); color: var(--text); }
.shadow-sample svg { width: 22px; height: 22px; }
.shadow-sample span { align-self: flex-end; font-size: 11px; color: var(--text-secondary); }
figcaption { display: flex; flex-direction: column; gap: 7px; padding: 17px 2px 0; }
figcaption strong { font-size: 15px; font-weight: var(--font-weight-action, 500); }
figcaption > span { color: var(--text-secondary); font-size: 12px; line-height: 1.7; }
figcaption code { color: var(--text-secondary); font: 11px/1.6 Consolas, monospace; overflow-wrap: anywhere; }
.shadow-context { margin-top: 30px; padding-top: 26px; border-top: 1px solid var(--border); }
.context-heading h4 { margin: 0 0 7px; font-size: 15px; font-weight: var(--font-weight-subtitle, 600); }
.context-heading p, .shadow-note { color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.context-heading p { margin: 0; }
.context-stage { margin-top: 18px; padding: 30px; background: var(--background); border-radius: 18px; }
.context-card { --card-padding: 22px 24px; --card-radius: 18px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.context-content { display: flex; align-items: center; gap: 13px; min-width: 0; }
.context-icon { display: grid; place-items: center; flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; color: var(--primary); background: var(--fill); }
.context-icon svg { width: 21px; height: 21px; }
.context-content strong { font-size: 15px; font-weight: var(--font-weight-action, 500); }
.context-content p { margin: 6px 0 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.context-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.context-actions svg { width: 16px; height: 16px; }
.shadow-note { margin: 18px 0 0; }
.shadow-code { margin-top: 14px; color: var(--text-secondary); font-size: 12px; }
.shadow-code summary { width: fit-content; padding: 6px 0; cursor: pointer; color: var(--primary); }
.shadow-code summary:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; border-radius: 3px; }
.shadow-code pre { margin: 10px 0 0; padding: 16px; border-radius: 12px; background: var(--fill); white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.9 Consolas, monospace; }
@media (max-width: 1000px) { .shadow-levels { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .shadow-levels { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 14px; } .shadow-stage { min-height: 146px; } .context-stage { padding: 20px 14px; } .context-card { flex-direction: column; align-items: stretch; --card-padding: 20px 18px; } .context-actions { flex-wrap: wrap; justify-content: flex-end; } }
@media (max-width: 380px) { .shadow-levels { grid-template-columns: 1fr; } }
</style>
