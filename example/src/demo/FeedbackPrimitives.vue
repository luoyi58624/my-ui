<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button, Card, Divider, Icon, Progress, Tag, Tooltip } from '@my-ui/vue'
import PlaybackProgress from './PlaybackProgress.vue'
import SliderShowcase from './SliderShowcase.vue'

const emit = defineEmits<{
  /** 将快捷操作的结果交给页面统一提示。 */
  notify: [message: string]
}>()
const value = ref(64), running = ref(false)
const complete = computed(() => value.value === 100)
let timer: ReturnType<typeof setInterval> | undefined
function stop() { clearInterval(timer); timer = undefined; running.value = false }
function toggle() {
  if (running.value) { stop(); return }
  if (complete.value) value.value = 0
  running.value = true
  timer = setInterval(() => {
    value.value = Math.min(100, value.value + 4)
    if (complete.value) stop()
  }, 280)
}
function reset() { stop(); value.value = 0 }
onBeforeUnmount(stop)
</script>

<template>
  <div id="primitives" class="primitives-grid">
    <Card title="文字提示" description="说明留在操作旁边，需要时再出现" sample="TOOLTIP">
      <div class="tooltip-directions">
        <Tooltip content="优先在上方显示，靠近边缘时自动避让"><Button variant="outline">上方提示</Button></Tooltip>
        <Tooltip placement="bottom" content="提示会跟随触发元素，不占据页面空间"><Button variant="outline">下方提示</Button></Tooltip>
        <Tooltip placement="left" content="左侧空间不足时自动翻到另一侧"><Button variant="outline">左侧提示</Button></Tooltip>
        <Tooltip placement="right" copyable :delay="300" :hide-delay="200" content="参考编号：CL-2026-1017，可以选中文字并复制。"><Button variant="outline">右侧提示 · 可复制</Button></Tooltip>
      </div>
      <Divider />
      <div class="quick-tools"><span>快捷操作</span><div class="icon-tools">
        <Tooltip content="收藏这份灵感"><Button variant="bare" icon="heart" aria-label="收藏灵感" @click="emit('notify', '已收藏这份灵感')" /></Tooltip>
        <Tooltip content="分享给朋友"><Button variant="bare" icon="share" aria-label="分享灵感" @click="emit('notify', '分享操作已触发')" /></Tooltip>
        <Tooltip content="归档后才可删除"><Button variant="bare" icon="trash" aria-label="删除灵感" disabled /></Tooltip>
      </div></div>
      <p class="demo-note">鼠标悬停显示，触屏长按显示，均只淡入淡出。默认不接收鼠标交互；右侧示例开启文字复制，可移入选字，离开后收起。</p>
    </Card>

    <Card title="内容分隔" description="一条清楚的边界，也可以很轻盈" sample="DIVIDER">
      <div class="divider-heading"><Icon name="inbox" /><span>我的收件箱</span><Tag>3 条未读</Tag></div>
      <Divider align="start">今天</Divider>
      <div class="divider-message"><span>设计稿已更新</span><small>刚刚</small></div>
      <Divider />
      <div class="divider-message"><span>与团队同步下一步</span><small>10:24</small></div>
      <Divider dashed align="end">更早的消息</Divider>
      <div class="divider-links"><Button variant="text" @click="emit('notify', '全部消息已标为已读')">全部已读</Button><Divider vertical /><Button variant="text" @click="emit('notify', '消息通知设置')">通知设置</Button></div>
    </Card>

    <Card class="progress-card" title="任务进度" description="正在进行、已经完成，状态一眼看清" sample="PROGRESS">
      <div class="progress-layout">
        <div class="transfer-demo">
          <div class="transfer-heading"><div class="file-icon"><Icon name="image" /></div><div><strong>旅行相册.zip</strong><span>{{ complete ? '上传完成' : running ? '正在上传' : value ? '准备继续上传' : '等待开始' }} · {{ Math.round(value * 2.56) }} / 256 MB</span></div></div>
          <Progress :value="value" :status="complete ? 'success' : 'normal'" label="旅行相册上传进度" />
          <div class="transfer-actions"><Button @click="toggle">{{ running ? '暂停上传' : complete ? '再次上传' : value ? '继续上传' : '开始上传' }}</Button><Button variant="text" @click="reset">重置进度</Button></div>
          <p class="demo-note">模拟文件传输，可暂停、继续与重置。</p>
          <Divider />
          <div class="status-examples">
            <div><span>同步完成</span><Progress :value="100" status="success" label="同步完成" /></div>
            <div><span>等待重试</span><Progress :value="46" status="warning" label="等待重试" /></div>
            <div><span>上传失败</span><Progress :value="38" status="error" label="上传失败" /></div>
          </div>
        </div>
        <div class="ring-examples">
          <div class="ring-example"><Progress type="circle" :value="value" :status="complete ? 'success' : 'normal'" label="相册整体进度" /><span>环形进度</span></div>
          <div class="ring-example"><Progress type="circle" class="compact-ring" label="正在连接服务器" :show-text="false" /><span>等待响应</span></div>
          <div class="pending-example"><span>正在准备文件</span><Progress label="正在准备文件" :show-text="false" /></div>
          <div class="pending-example"><span>自定义文案</span><Progress :value="6" :max="12" label="已处理文件数" class="custom-progress"><template #default="{ value: count, max }">{{ count }} / {{ max }}</template></Progress></div>
        </div>
      </div>
    </Card>
    <PlaybackProgress />
    <SliderShowcase />
  </div>
</template>

<style scoped>
.primitives-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; margin-top: 22px; scroll-margin-top: 120px; }
.tooltip-directions { display: flex; flex-wrap: wrap; gap: 12px; }
.quick-tools, .icon-tools, .divider-heading, .divider-message, .divider-links { display: flex; align-items: center; }
.quick-tools { justify-content: space-between; gap: 12px; font-size: 14px; }
.icon-tools { gap: 6px; }
.demo-note { margin: 16px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.divider-heading { gap: 10px; font-size: 15px; font-weight: var(--font-weight-action, 500); }
.divider-heading > svg { width: 20px; height: 20px; color: var(--primary); }
.divider-heading > :last-child { margin-left: auto; }
.divider-message { justify-content: space-between; gap: 16px; font-size: 14px; }
.divider-message small { color: var(--text-secondary); font-size: 12px; }
.divider-links { justify-content: center; --divider-height: 20px; }
.progress-card { grid-column: 1 / -1; }
.progress-layout { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(220px, .8fr); gap: 48px; }
.transfer-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.file-icon { display: grid; place-items: center; width: 44px; height: 48px; flex-shrink: 0; border-radius: 12px; background: var(--fill); color: var(--primary); }
.file-icon svg { width: 22px; height: 22px; }
.transfer-heading strong { display: block; font-size: 15px; font-weight: var(--font-weight-action, 500); }
.transfer-heading span { display: block; margin-top: 4px; color: var(--text-secondary); font-size: 13px; }
.transfer-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.status-examples { display: grid; gap: 15px; }
.status-examples > div { display: grid; grid-template-columns: 68px minmax(0, 1fr); align-items: center; gap: 12px; }
.status-examples > div > span { color: var(--text-secondary); font-size: 13px; }
.ring-examples { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; gap: 24px 20px; padding-top: 4px; }
.ring-example { display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 12px; }
.ring-example > span, .pending-example > span { color: var(--text-secondary); font-size: 13px; }
.compact-ring { --progress-size: 72px; margin-block: 12px; }
.pending-example { display: grid; grid-column: 1 / -1; gap: 12px; }
.custom-progress { --progress-color: var(--success); --progress-thickness: 8px; }
@media (max-width: 760px) { .primitives-grid { grid-template-columns: 1fr; gap: 16px; margin-top: 16px; } .progress-layout { grid-template-columns: 1fr; gap: 32px; } .ring-examples { padding-top: 24px; border-top: 1px solid var(--border); } }
</style>
