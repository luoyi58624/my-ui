<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Slider, Tooltip, type SliderMark } from '../../vue'

const stepped = ref(50), temperature = ref(20), interval = ref([20, 70]), volume = ref(36)
const marks: SliderMark[] = [{ value: 0, label: '0°C' }, { value: 20, label: '20°C' }, { value: 37, label: '37°C' }, { value: 100, label: '100°C' }]
function reset() { stepped.value = 50; temperature.value = 20; interval.value = [20, 70]; volume.value = 36 }
</script>

<template>
  <Card id="slider-options" class="slider-showcase" title="刻度与范围" description="选择一个数值，或圈定一段合适的范围" sample="SLIDER">
    <div class="slider-examples">
      <section><h4>按步长生成刻度</h4><Slider v-model="stepped" label="显示强度" :step="10" marks /><p>每 10 调整一档，悬停或拖动时显示当前值。</p></section>
      <section><h4>只选择指定刻度</h4><Slider v-model="temperature" label="适宜温度" :step="null" :marks="marks" unit="°C" :get-aria-value-text="value => `${value} 摄氏度`" /><p>拖动连续跟手，数值按相邻刻度的中点切换，松开后吸附；方向键按刻度移动。</p></section>
      <section><h4>双滑块范围选择</h4><Slider v-model="interval" label="筛选范围" :step="5" marks start-label="0%" end-label="100%" /><p>拖动最近的端点，交叉后自动切换上下限；Tab 可切换两个滑块，范围值始终有序。</p></section>
      <section><h4>常显数值提示</h4><Slider v-model="volume" label="预设音量" value-label-display="on" /><p>数值提示与普通 Tooltip 共用外观，保持清楚、轻巧。</p></section>
    </div>
    <div class="showcase-actions"><Button variant="text" @click="reset">重置示例</Button><Tooltip content="4px 圆角、反色文字，不显示箭头" :arrow="false"><Button variant="outline">无箭头提示</Button></Tooltip><Tooltip content="箭头会随展示方向自动调整"><Button variant="outline">带箭头提示</Button></Tooltip></div>
  </Card>
</template>

<style scoped>
.slider-showcase { grid-column: 1 / -1; scroll-margin-top: 110px; }
.slider-examples { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 48px; }
.slider-examples section { min-width: 0; }
.slider-examples h4 { margin: 0 0 24px; color: var(--text); font-size: 14px; font-weight: var(--font-weight-subtitle, 600); }
.slider-examples p { margin: 16px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.showcase-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border); }
@media (max-width: 760px) { .slider-examples { grid-template-columns: 1fr; gap: 32px; } }
</style>
