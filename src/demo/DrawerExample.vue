<script setup lang="ts">
import { reactive } from 'vue'
import { Button, Form, FormField, Input, Switch, Textarea, popup } from '../../vue'

const emit = defineEmits<{
  /** 示例确认后提交名称，取消时不返回结果。 */
  done: [value?: string]
}>()
const draft = reactive({ name: '小蓝同学', notes: '让每个界面都简单一点。', reminders: true })
async function save() {
  const confirmed = await popup.showAlert({ title: '保存这份资料？', message: '确认后关闭抽屉，并保留本次填写的显示名称。', center: true, confirmText: '保存' })
  if (confirmed) emit('done', draft.name)
}
</script>

<template>
  <div class="drawer-example">
    <p>在抽屉里编辑，返回时仍停留在当前页面。</p>
    <Form @submit.prevent="save">
      <Input v-model="draft.name" label="显示名称" clearable />
      <Textarea v-model="draft.notes" label="个人简介" :rows="4" :maxlength="120" />
      <FormField label="消息提醒"><Switch v-model="draft.reminders" label="接收消息提醒" /></FormField>
      <div class="drawer-form-actions"><Button type="submit">保存资料</Button><Button variant="text" @click="emit('done')">取消编辑</Button></div>
    </Form>
  </div>
</template>

<style scoped>
.drawer-example p { margin: 0 0 24px; font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
.drawer-form-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
</style>
