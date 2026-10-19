<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button, Card, Divider, Progress, Slider } from '@my-ui/vue'

const position = ref(36), buffer = ref(72), playing = ref(false)
const elapsed = computed(() => formatTime(position.value * 3))
let timer: ReturnType<typeof setInterval> | undefined
function formatTime(seconds: number) { return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}` }
function stop() { clearInterval(timer); timer = undefined; playing.value = false }
function seek(value: number) { position.value = value; buffer.value = Math.max(buffer.value, value) }
function toggle() {
  if (playing.value) { stop(); return }
  if (position.value === 100) reset()
  playing.value = true
  timer = setInterval(() => {
    buffer.value = Math.min(100, buffer.value + 2)
    position.value = Math.min(100, position.value + 1)
    if (position.value === 100) stop()
  }, 500)
}
function reset() { stop(); position.value = 36; buffer.value = 72 }
onBeforeUnmount(stop)
</script>

<template>
  <Card id="playback-progress" class="playback-card" title="播放与缓冲" description="同一条轨道，清楚呈现三段进度" sample="SLIDER / PROGRESS">
    <div class="playback-layout">
      <div class="playback-controls">
        <div class="playback-heading"><div><strong>周末的好风景</strong><span>模拟播放 · 拖动调整播放位置</span></div><span class="playback-time">{{ elapsed }} / 5:00</span></div>
        <Slider :model-value="position" :buffer="buffer" label="播放进度" :start-label="elapsed" end-label="5:00" @update:model-value="seek" />
        <div class="playback-actions"><Button @click="toggle">{{ playing ? '暂停播放' : '播放' }}</Button><Button variant="outline" :disabled="buffer === 100" @click="buffer = Math.min(100, buffer + 12)">继续缓冲</Button><Button variant="text" @click="reset">重置</Button></div>
      </div>
      <Divider vertical class="playback-divider" />
      <div class="buffer-overview">
        <div class="buffer-heading"><span>相同样式的只读进度</span><span>已缓冲 {{ buffer }}%</span></div>
        <Progress :value="position" :buffer="buffer" :show-text="false" label="影片播放与缓冲进度" />
        <div class="progress-legend"><span><i class="played" />已播放</span><span><i class="buffered" />已缓冲</span><span><i class="remaining" />未加载</span></div>
        <p>仅需传入 <code>buffer</code> 开启缓冲层，颜色由进度色自动生成，也可单独覆盖。</p>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.playback-card { grid-column: 1 / -1; scroll-margin-top: 110px; }
.playback-layout { display: grid; grid-template-columns: minmax(0, 1.2fr) auto minmax(0, .8fr); align-items: center; gap: 32px; }
.playback-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.playback-heading strong { display: block; color: var(--text); font-size: 15px; font-weight: var(--font-weight-action, 500); }
.playback-heading div > span { display: block; margin-top: 5px; color: var(--text-secondary); font-size: 13px; }
.playback-time { flex-shrink: 0; color: var(--text-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }
.playback-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.playback-divider { --divider-height: 160px; --divider-spacing: 0px; }
.buffer-heading { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; color: var(--text-secondary); font-size: 13px; font-variant-numeric: tabular-nums; }
.progress-legend { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 18px; color: var(--text-secondary); font-size: 12px; }
.progress-legend > span { display: inline-flex; align-items: center; gap: 6px; }
.progress-legend i { width: 8px; height: 8px; border-radius: 50%; }
.played { background: var(--primary); }
.buffered { background: color-mix(in srgb, var(--primary) 28%, var(--fill)); }
.remaining { background: var(--fill); }
.buffer-overview p { margin: 18px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.buffer-overview code { color: var(--text); }
@media (max-width: 760px) {
  .playback-layout { grid-template-columns: 1fr; gap: 28px; }
  .playback-heading { align-items: start; }
  .playback-divider { display: none; }
  .buffer-overview { padding-top: 24px; border-top: 1px solid var(--border); }
}
</style>
