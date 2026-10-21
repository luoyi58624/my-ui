<script setup lang="ts">
import { computed, ref } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import { Icon, Segmented, Slider, type Option } from '@my-ui/vue'

// #region segmented
const mode = ref('comfort')
const modes: Option[] = [
  { value: 'comfort', label: '舒适', description: '让每一次浏览都更轻松', icon: 'spark' },
  { value: 'balance', label: '均衡', description: '美感与效率，刚刚好', icon: 'sliders' },
  { value: 'focus', label: '专注', description: '聚焦眼前的重要内容', icon: 'briefcase' }
]
const activeMode = computed(() => modes.find((item) => item.value === mode.value) ?? modes[0]!)
// #endregion
// #region slider
const strength = ref(68)
// #endregion
// #region custom-slider
const customStrength = ref(36)
// #endregion
</script>

<template>
  <div class="field-group">
    <DemoExample
      name="segmented"
      source="pages/home/slider/index.vue"
      title="分段选择"
      description="在少量互斥选项之间切换，支持图标与选中状态联动。"
    >
      <Segmented v-model="mode" :options="modes" label="浏览方式" />
      <div class="mode-card">
        <div class="mode-symbol"><Icon :name="activeMode.icon ?? 'spark'" /></div>
        <div>
          <strong>{{ activeMode.label }}模式</strong>
          <p>{{ activeMode.description }}</p>
        </div>
      </div>
    </DemoExample>
    <DemoExample
      name="slider"
      source="pages/home/slider/index.vue"
      title="基础滑块"
      description="拖动调整数值，也可聚焦后使用方向键精确调节。"
    >
      <Slider v-model="strength" label="显示强度" />
    </DemoExample>
    <DemoExample
      name="custom-slider"
      source="pages/home/slider/index.vue"
      title="自定义滑块"
      description="通过 CSS 变量调整轨道、填充色和手柄，unit 设置数值单位。"
    >
      <Slider v-model="customStrength" class="custom-slider" label="自定义滑块" unit="%" />
    </DemoExample>
  </div>
</template>

<style scoped>
.custom-slider {
  margin-top: 20px;
  --slider-track-height: 8px;
  --slider-thumb-size: 24px;
}

.field-group {
  display: grid;
  gap: 16px;
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
</style>
