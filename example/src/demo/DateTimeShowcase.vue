<script setup lang="ts">
import DemoExample from './DemoExample.vue'
import { ref } from 'vue'
import { Button, Calendar, Card, DatePicker, Sheet, TimePicker } from '@my-ui/vue'

const now = new Date(),
  year = now.getFullYear()
const key = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const today = key(now),
  min = `${year - 1}-01-01`,
  max = `${year + 2}-12-31`
// #region date-picker
const date = ref(today)
const open = ref(false),
  draft = ref(today)
function choose() {
  draft.value = date.value
  open.value = true
}
// #endregion
// #region time-picker
const time = ref('09:30')
// #endregion
// #region time-seconds
const precise = ref('01:20:30')
// #endregion
// #region calendar-single
const day = ref(today)
// #endregion
// #region calendar-range
const range = ref<string[]>([])
const reserved = (value: string) => value.endsWith('-13') || value.endsWith('-23')
// #endregion
</script>

<template>
  <div class="date-time-showcase">
    <DemoExample
      name="date-picker"
      source="DateTimeShowcase.vue"
      id="date-time-picker"
      title="日期选择"
      description="min 与 max 限制范围，年月变化后自动保留有效日期，也可放入底部面板确认。"
    >
      <div class="date-time-heading">
        <h4>选择日期</h4>
        <strong>{{ date }}</strong>
      </div>
      <DatePicker v-model="date" :min="min" :max="max" label="出发日期" />
      <p>大小月与闰年自动联动，年月变化后保留有效日期。</p>
      <div class="date-time-footer">
        <span>也可以在底部面板中选择，确认后保存。</span>
        <Button variant="outline" @click="choose">修改出发日期</Button>
      </div>
      <Sheet v-model="open" title="选择出发日期" confirm-text="确定" @confirm="date = draft">
        <div class="date-picker-sheet">
          <DatePicker v-model="draft" :min="min" :max="max" label="出发日期草稿" />
        </div>
      </Sheet>
    </DemoExample>
    <DemoExample
      name="time-picker"
      source="DateTimeShowcase.vue"
      title="时间选择"
      description="通过 min、max 与 minute-step 定义可选时段和分钟间隔。"
    >
      <div class="date-time-heading">
        <span>预约时间</span>
        <strong>{{ time }}</strong>
      </div>
      <TimePicker v-model="time" min="09:00" max="18:30" :minute-step="15" label="预约时间" />
      <p>营业时段 09:00—18:30，每 15 分钟一个时刻。</p>
    </DemoExample>
    <DemoExample
      name="time-seconds"
      source="DateTimeShowcase.vue"
      title="精确到秒"
      description="show-seconds 开启秒列，second-step 控制秒间隔。"
    >
      <TimePicker v-model="precise" show-seconds :second-step="5" label="精确时间" />
      <p>
        当前时间
        <strong>{{ precise }}</strong>
        · 秒间隔为 5
      </p>
    </DemoExample>
    <DemoExample
      name="calendar-single"
      source="DateTimeShowcase.vue"
      id="calendar"
      title="单日选择"
      description="Calendar 在月视图中选择日期，支持键盘移动与切换月份。"
    >
      <Calendar v-model="day" :min="min" :max="max" label="行程日历" />
      <p class="date-time-note">
        方向键移动日期，Home / End 跳至周首尾，Page Up / Down 切换月份；加 Shift 切换年份。Enter
        或空格选择。
      </p>
    </DemoExample>
    <DemoExample
      name="calendar-range"
      source="DateTimeShowcase.vue"
      title="日期范围与禁选"
      description="range 开启范围选择，disabled-date 控制不可选择的日期。"
    >
      <Calendar
        v-model="range"
        range
        :min="min"
        :max="max"
        :disabled-date="reserved"
        label="日期范围"
      />
      <p>每月 13 日、23 日已被预约，范围不能跨过这些日期。</p>
    </DemoExample>
  </div>
</template>

<style scoped>
.date-time-showcase {
  display: grid;
  gap: 28px;
  min-width: 0;
}
.date-time-showcase :deep(.my-card) {
  scroll-margin-top: 110px;
}
.date-time-examples,
.calendar-examples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px 48px;
}
.date-time-examples section,
.calendar-examples section {
  min-width: 0;
}
.date-time-heading {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 18px;
}
.date-time-showcase h4 {
  margin: 0;
  font-size: 14px;
  font-weight: var(--font-weight-subtitle, 600);
}
.date-time-heading strong {
  color: var(--primary);
  font-size: 14px;
}
.date-time-showcase p,
.date-time-footer {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.75;
}
.date-time-examples p,
.calendar-examples p {
  margin: 14px 0 0;
}
.date-time-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 22px;
  margin-top: 24px;
  border-top: 1px solid var(--border);
}
.precise-time {
  margin-top: 20px;
  color: var(--text-secondary);
  font-size: 13px;
}
.precise-time summary {
  cursor: pointer;
  padding: 8px 0;
}
.precise-time :deep(.my-time-picker) {
  max-width: 440px;
  margin: 12px auto 0;
}
.precise-time > p {
  text-align: center;
}
.calendar-examples h4 {
  margin-bottom: 24px;
}
.calendar-examples :deep(.my-calendar) {
  margin-inline: auto;
}
.date-time-note {
  margin: 24px 0 0;
}
.date-picker-sheet {
  padding: 8px 20px 20px;
}
@media (max-width: 760px) {
  .date-time-examples,
  .calendar-examples {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>
