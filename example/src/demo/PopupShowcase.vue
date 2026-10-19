<script setup lang="ts">
import { h, ref } from 'vue'
import { Button, Card, Icon, Segmented, popup, type Option } from '@my-ui/vue'
import SelectionPanel from './SelectionPanel.vue'
import DrawerExample from './DrawerExample.vue'

const emit = defineEmits<{
  /** 把示例的操作结果交给页面轻提示。 */
  notify: [message: string]
}>()
const placement = ref<'left' | 'right' | 'top' | 'bottom'>('right')
const placements: Option[] = [{ value: 'left', label: '左侧' }, { value: 'right', label: '右侧' }, { value: 'top', label: '顶部' }, { value: 'bottom', label: '底部' }]
const position = ref('trailing')
const positions: Option[] = [{ value: 'leading', label: '前置' }, { value: 'trailing', label: '后置' }]
const selected = ref<string | string[]>('both')
const selectedMany = ref<string | string[]>(['documents', 'images'])
const clockOptions: Option[] = [{ value: 'lock', label: '锁屏' }, { value: 'widget', label: '时钟桌面插件' }, { value: 'both', label: '锁屏与时钟桌面插件' }]
const syncOptions: Option[] = [{ value: 'documents', label: '同步文档', description: '多设备持续更新' }, { value: 'images', label: '同步图片', description: '保留珍贵的视觉记录' }, { value: 'favorites', label: '同步收藏', description: '随时找回喜欢的内容' }]
const selectedName = () => clockOptions.find(item => item.value === selected.value)?.label ?? '请选择'
async function openSingle() {
  const panel = popup.showSheet<Option>({
    title: '在以下位置显示双时钟',
    content: context => h(SelectionPanel, { modelValue: selected.value, mode: 'single', position: position.value as 'leading' | 'trailing', options: clockOptions, label: '双时钟显示位置', 'onUpdate:modelValue': value => { selected.value = value }, onSelect: item => context.close(item) }),
  })
  const result = await panel.closed
  if (result) emit('notify', '已选择：' + result.label)
}
function openMultiple() {
  popup.showSheet({
    title: '选择需要同步的内容', confirmText: '完成',
    content: () => h(SelectionPanel, { modelValue: selectedMany.value, mode: 'multiple', position: position.value as 'leading' | 'trailing', options: syncOptions, label: '同步内容', 'onUpdate:modelValue': value => { selectedMany.value = value } }),
    onConfirm: () => emit('notify', `已选择 ${Array.isArray(selectedMany.value) ? selectedMany.value.length : 0} 项同步内容`),
  })
}
async function openDrawer() {
  const panel = popup.showDrawer<string>({ title: '编辑个人资料', placement: placement.value, content: context => h(DrawerExample, { onDone: context.close }) })
  const result = await panel.closed
  if (result !== undefined) emit('notify', '资料已保存：' + result)
}
function showNotice() { void popup.showAlert({ title: '同步已完成', message: '你的文档和图片都已同步，可以安心继续浏览。', cancelText: false, confirmText: '知道了' }) }
async function showDanger() {
  const confirmed = await popup.showAlert({ title: '移除本地缓存？', message: '这是一项交互示例。确认后只展示操作结果，你的个人数据不会受影响。', danger: true, confirmText: '移除' })
  if (confirmed) emit('notify', '已确认移除（示例）')
}
</script>

<template>
  <div class="popup-showcase">
    <Card title="侧边抽屉" description="四个方向，自定义内容与嵌套确认" sample="DRAWER">
      <Segmented v-model="placement" :options="placements" label="抽屉方向" />
      <p class="example-note">编辑资料时保留当前页面。单指沿展开方向向外滑动，可以收起抽屉。</p>
      <Button variant="outline" @click="openDrawer">打开抽屉 <Icon name="arrow-right" /></Button>
    </Card>
    <Card title="自由组合的选择面板" description="选中态由列表组管理，选择框位置由内容决定" sample="CUSTOM SHEET">
      <Segmented v-model="position" :options="positions" label="选择框位置" />
      <div class="selection-actions"><Button variant="outline" @click="openSingle">单选面板</Button><Button variant="outline" @click="openMultiple">多选面板</Button></div>
      <p class="example-note">双时钟：{{ selectedName() }}<br />同步内容：已选 {{ Array.isArray(selectedMany) ? selectedMany.length : 0 }} 项</p>
    </Card>
    <Card title="清晰的底部操作" description="整行操作区，底部留白也能点击" sample="POPUP API">
      <div class="alert-actions"><Button variant="outline" @click="showNotice">单按钮提示</Button><Button variant="outline" @click="showDanger">双按钮确认</Button></div>
      <p class="example-note">默认底部展示并留出 16px 外边距；需要居中时设置 center: true。</p>
    </Card>
  </div>
</template>

<style scoped>
.popup-showcase { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 20px; }
.selection-actions, .alert-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.alert-actions { margin-top: 0; }
.example-note { color: var(--text-secondary); font-size: 14px; line-height: 1.8; margin: 18px 0; }
.example-note:last-child { margin-bottom: 0; }
@media (max-width:1000px) { .popup-showcase { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width:680px) { .popup-showcase { grid-template-columns: minmax(0, 1fr); } }
</style>
