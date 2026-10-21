<script setup lang="ts">
import DemoExample from '../components/DemoExample.vue'
import { ref } from 'vue'
import { Button, Card, Notice, Steps, type StepOption } from '@my-ui/vue'

const emit = defineEmits<{ notify: [message: string] }>()
const visible = ref(true),
  step = ref(1),
  error = ref(false)
const flow: StepOption[] = [
  { label: '填写资料' },
  { label: '确认内容' },
  { label: '提交申请' },
  { label: '完成' }
]
const detail: StepOption[] = [
  { label: '资料已收到', description: '我们已经为你保存本次填写的内容。' },
  { label: '正在审核', description: '处理完成后，会第一时间通知你。' },
  { label: '开始使用', description: '一切准备就绪，继续探索。' }
]
function change(delta: number) {
  step.value = Math.max(0, Math.min(flow.length, step.value + delta))
  error.value = false
}
</script>

<template>
  <div class="notice-steps-showcase">
    <DemoExample
      name="notice"
      source="NoticeStepsShowcase.vue"
      id="notice"
      title="通知条"
      description="通过 type 区分状态，支持关闭与自定义操作区。"
    >
      <div class="notice-examples">
        <Notice
          v-model="visible"
          title="新的灵感已经到达"
          message="你关注的内容有了更新，随时可以继续浏览。"
          closable
        />
        <Notice type="success" message="修改已保存，所有内容已同步。" />
        <Notice
          type="warning"
          title="可用空间不足"
          message="清理一些暂时不需要的文件，让新的内容有地方安放。"
        >
          <template #actions>
            <Button variant="text" @click="emit('notify', '已打开空间管理')">管理</Button>
          </template>
        </Notice>
        <Notice type="error" title="暂时无法连接" message="请检查网络，稍后再试。" />
      </div>
      <Button v-if="!visible" class="restore-notice" variant="text" @click="visible = true">
        重新显示通知
      </Button>
    </DemoExample>
    <DemoExample
      name="steps"
      source="NoticeStepsShowcase.vue"
      id="steps"
      title="步骤进度"
      description="通过当前步骤值控制进度，支持水平与垂直排列。"
    >
      <Steps
        v-model="step"
        :options="flow"
        :status="error ? 'error' : 'process'"
        interactive
        label="申请进度"
      />
      <div class="steps-controls">
        <span>
          {{ step === flow.length ? '全部步骤已完成' : `第 ${step + 1} 步 · ${flow[step]?.label}` }}
        </span>
        <div>
          <Button variant="outline" :disabled="step === 0" @click="change(-1)">上一步</Button>
          <Button :disabled="step === flow.length" @click="change(1)">
            {{ step === flow.length - 1 ? '完成' : '下一步' }}
          </Button>
        </div>
      </div>
      <div class="steps-detail">
        <Steps :model-value="1" :options="detail" vertical label="办理过程" />
        <div class="steps-explanation">
          <h4>横向或纵向，都保持清楚</h4>
          <p>点击上方步骤，或使用左右方向键切换。默认的步骤条只展示进度，开启交互后才可以操作。</p>
          <Button variant="text" :disabled="step === flow.length" @click="error = !error">
            {{ error ? '恢复进行状态' : '查看错误状态' }}
          </Button>
        </div>
      </div>
    </DemoExample>
  </div>
</template>

<style scoped>
.notice-steps-showcase {
  display: grid;
  gap: 28px;
  margin-top: 28px;
  min-width: 0;
}
#notice,
#steps {
  scroll-margin-top: 110px;
}
.notice-examples {
  display: grid;
  gap: 12px;
}
.notice-examples :deep(.my-notice-actions .my-button) {
  min-height: 24px;
  padding: 0 6px;
  font-size: 12px;
}
.restore-notice {
  margin-top: 12px;
}
.steps-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
  color: var(--text-secondary);
  font-size: 12px;
}
.steps-controls > div {
  display: flex;
  gap: 10px;
}
.steps-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 36px;
  padding-top: 28px;
  margin-top: 28px;
  border-top: 1px solid var(--border);
}
.steps-explanation h4 {
  margin: 4px 0 12px;
  font-size: 14px;
}
.steps-explanation p {
  margin: 0 0 10px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
}
@media (max-width: 620px) {
  .steps-detail {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
