<script setup lang="ts">
import { computed, reactive } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import { Icon, ListRow, type IconName } from '@my-ui/vue'

// #region switches
const preferences = reactive([
  { title: '消息提醒', description: '重要通知，及时送达', icon: 'bell' as IconName, on: true },
  { title: '静音模式', description: '享受一段安静时光', icon: 'moon' as IconName, on: false },
  { title: '隐私保护', description: '为每一份安心加分', icon: 'shield' as IconName, on: true }
])
const enabledCount = computed(() => preferences.filter((item) => item.on).length)
// #endregion
</script>

<template>
  <DemoExample
    name="switches"
    source="pages/home/switch/index.vue"
    title="列表开关"
    description="为 ListRow 设置 toggle，以整行设置项呈现开关，v-model 同步布尔值。"
  >
    <div class="pref-list">
      <ListRow
        v-for="item in preferences"
        :key="item.title"
        v-model="item.on"
        toggle
        :title="item.title"
        :description="item.description"
      >
        <template #leading><Icon :name="item.icon" /></template>
      </ListRow>
    </div>
    <div class="control-foot">
      <span>你的偏好已在本页实时更新</span>
      <strong>{{ enabledCount }} 项开启</strong>
    </div>
  </DemoExample>
</template>

<style scoped>
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
</style>
