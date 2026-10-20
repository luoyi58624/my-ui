<script setup lang="ts">
import DemoExample from './DemoExample.vue'
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import {
  Button,
  Card,
  CheckboxGroup,
  Form,
  FormField,
  Input,
  RadioGroup,
  Segmented,
  Switch,
  Textarea,
  type FormLayout,
  type Option
} from '@my-ui/vue'
import { validateProfile, type ProfileErrors } from './profile'

const emit = defineEmits<{
  /** 将保存结果交给展示页的统一反馈。 */
  notify: [message: string]
}>()
const form = ref<InstanceType<typeof Form>>()
const layout = ref('vertical')
const currentLayout = computed<FormLayout>(() =>
  layout.value === 'horizontal' ? 'horizontal' : layout.value === 'inline' ? 'inline' : 'vertical'
)
const layouts: Option[] = [
  { value: 'vertical', label: '垂直布局' },
  { value: 'horizontal', label: '水平布局' },
  { value: 'inline', label: '行内布局' }
]
const layoutDescription = computed(() =>
  currentLayout.value === 'vertical'
    ? '标签在上，逐项填写'
    : currentLayout.value === 'horizontal'
      ? '标签在左，控件整齐对齐'
      : '多个表单项同行排列，空间不足时换行'
)
const plans: Option[] = [
  { value: 'standard', label: '标准体验' },
  { value: 'advanced', label: '进阶体验' },
  { value: 'professional', label: '专业体验' }
]
const features: Option[] = [
  { value: 'cloud', label: '云端同步' },
  { value: 'notes', label: '灵感笔记' },
  { value: 'gallery', label: '图片收藏' }
]
function initialValues() {
  return {
    name: '小蓝同学',
    email: '',
    bio: '',
    notifications: true,
    plan: 'standard',
    features: ['cloud']
  }
}
const profile = reactive(initialValues())
const attempted = ref(false)
const saving = ref(false)
const savedCount = ref(0)
const message = ref('')
const errors = computed<ProfileErrors & { features?: string }>(() => {
  if (!attempted.value) return {}
  const result: ProfileErrors & { features?: string } = validateProfile(profile)
  if (!profile.features.length) result.features = '请至少选择一项内容偏好'
  return result
})
let saveTimer: ReturnType<typeof setTimeout> | undefined
async function submitProfile() {
  if (saving.value) return
  attempted.value = true
  message.value = ''
  if (Object.keys(errors.value).length) {
    await nextTick()
    const element = form.value?.$el as HTMLFormElement | undefined
    const field = element?.querySelector<HTMLElement>('[aria-invalid="true"]')
    field?.scrollIntoView({ block: 'center' })
    field?.focus({ preventScroll: true })
    return
  }
  const name = profile.name.trim()
  saving.value = true
  // 演示异步提交；重置和卸载都会取消等待，避免旧结果覆盖新状态。
  saveTimer = setTimeout(() => {
    saving.value = false
    savedCount.value++
    message.value = `${name}，资料与偏好已在本页保存 · 第 ${savedCount.value} 次`
    emit('notify', '资料与偏好已在本页保存')
  }, 900)
}
function resetProfile() {
  clearTimeout(saveTimer)
  saveTimer = undefined
  Object.assign(profile, initialValues())
  attempted.value = false
  saving.value = false
  savedCount.value = 0
  message.value = '已恢复初始值'
}
onBeforeUnmount(() => clearTimeout(saveTimer))
</script>

<template>
  <DemoExample
    name="profile-form"
    source="ProfileFormExample.vue"
    class="form-example"
    title="资料编辑与校验"
    description="切换表单布局，体验校验、错误定位、异步提交与重置。"
  >
    <div class="layout-toolbar">
      <Segmented v-model="layout" :options="layouts" label="表单布局" />
      <span>{{ layoutDescription }}</span>
    </div>
    <Form
      ref="form"
      class="profile-form"
      :layout="currentLayout"
      novalidate
      aria-label="资料编辑示例"
      @submit.prevent="submitProfile"
      @reset.prevent="resetProfile"
    >
      <Input
        v-model="profile.name"
        label="显示名称"
        name="displayName"
        required
        clearable
        :maxlength="24"
        :readonly="saving"
        :error="errors.name"
        autocomplete="nickname"
        placeholder="至少 2 个字符"
      />
      <Input
        v-model="profile.email"
        label="联系邮箱"
        name="email"
        type="email"
        required
        clearable
        :readonly="saving"
        :error="errors.email"
        autocomplete="email"
        placeholder="name@example.com"
      />
      <FormField label="接收更新" hint="有新内容时通知你">
        <template #default="{ control }">
          <div class="switch-setting">
            <Switch
              v-model="profile.notifications"
              v-bind="control"
              label="接收更新"
              :disabled="saving"
            />
            <span>{{ profile.notifications ? '已开启' : '已关闭' }}</span>
          </div>
        </template>
      </FormField>
      <FormField label="体验方案" group>
        <template #default="{ control }">
          <RadioGroup
            v-model="profile.plan"
            v-bind="control"
            class="form-options"
            label="体验方案"
            :options="plans"
            :disabled="saving"
            inline
            tabindex="-1"
          />
        </template>
      </FormField>
      <FormField
        label="内容偏好"
        group
        required
        :error="errors.features"
        hint="可以同时选择多项内容"
      >
        <template #default="{ control }">
          <CheckboxGroup
            v-model="profile.features"
            v-bind="control"
            class="form-options"
            label="内容偏好"
            :options="features"
            :disabled="saving"
            inline
            tabindex="-1"
          />
        </template>
      </FormField>
      <Textarea
        v-model="profile.bio"
        label="个人简介"
        name="bio"
        :maxlength="120"
        :readonly="saving"
        placeholder="介绍一下你的兴趣与日常…"
        hint="让别人更容易认识你"
      />
      <div class="form-actions">
        <Button type="submit" :loading="saving">保存资料</Button>
        <Button type="reset" variant="outline">重置表单</Button>
        <span>仅在本页保存</span>
      </div>
      <p class="form-message" role="status">{{ message }}</p>
    </Form>
  </DemoExample>
</template>

<style scoped>
.form-example {
  grid-column: 1 / -1;
}
.layout-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 22px;
  margin-bottom: 28px;
}
.layout-toolbar > div {
  width: 350px;
  max-width: 100%;
}
.layout-toolbar > span {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.form-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  width: 100%;
}
.switch-setting {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}
.switch-setting span {
  color: var(--text-secondary);
  font-size: 13px;
}
.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex-basis: 100%;
  width: 100%;
}
.form-actions span {
  color: var(--text-secondary);
  font-size: 12px;
}
.form-message {
  min-height: 20px;
  margin: -10px 0 0;
  color: var(--success);
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: anywhere;
  flex-basis: 100%;
  width: 100%;
}
.profile-form :deep(.my-form-field.my-inline.my-is-group) {
  flex-basis: 440px;
}
.profile-form :deep(.my-form-field.my-inline:has(textarea)) {
  flex-basis: 100%;
}
</style>
