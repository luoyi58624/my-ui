<script setup lang="ts">
import { h, ref, inject } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import SharePanel from '../../../components/SharePanel.vue'
import { Button, Icon, Menu, popup, type Option } from '@my-ui/vue'
import { notifyKey } from '../../../commons/notify'

// #region toast
const notify = inject(notifyKey)!
// #endregion
// #region storage
function readSaved(key: string) {
  try {
    return (
      (localStorage.getItem('my-ui:' + key) ?? localStorage.getItem('chenglan:' + key)) === 'true'
    )
  } catch {
    return false
  }
}
function saveFlag(key: string, value: boolean) {
  try {
    localStorage.setItem('my-ui:' + key, String(value))
  } catch {
    /* 存储不可用时仍保留本页交互。 */
  }
}
// #endregion
// #region like
const liked = ref(readSaved('liked'))
function toggleLike() {
  liked.value = !liked.value
  saveFlag('liked', liked.value)
  notify(liked.value ? '已加入收藏' : '已取消收藏')
}
// #endregion
// #region share
async function openSheet() {
  const panel = popup.showSheet<Option>({
    title: '分享这份灵感',
    content: (context) => h(SharePanel, { options: sheetActions, onSelect: context.close })
  })
  const action = await panel.closed
  if (action) void selectAction(action)
}
const sheetActions: Option[] = [
  { value: 'copy', label: '复制链接', icon: 'copy' },
  { value: 'favorite', label: '收藏到本地', icon: 'heart' },
  { value: 'later', label: '稍后查看', icon: 'clock' }
]
const laterSaved = ref(readSaved('later'))
async function selectAction(action: Option) {
  if (action.value === 'copy') {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('链接已复制')
    } catch {
      notify('浏览器未允许复制，请从地址栏复制链接')
    }
  } else if (action.value === 'favorite') {
    liked.value = true
    saveFlag('liked', true)
    notify('已收藏到本地')
  } else {
    laterSaved.value = true
    saveFlag('later', true)
    notify('已加入稍后查看')
  }
}
// #endregion
</script>

<template>
  <section id="buttons">
    <div class="button-showcase">
      <DemoExample
        name="button-basic"
        source="pages/home/button/index.vue"
        setup="toast"
        title="基础用法"
        description="通过 variant 区分主要、描边和文本操作，按操作优先级选择。"
      >
        <div class="btn-row">
          <Button @click="notify('主要操作已执行')">主要按钮</Button>
          <Button variant="outline" @click="notify('镂空按钮已点击')">镂空按钮</Button>
          <Button variant="text" @click="notify('已打开详情')">
            文本按钮
            <Icon name="chevron-right" />
          </Button>
        </div>
      </DemoExample>
      <DemoExample
        name="button-icons"
        source="pages/home/button/index.vue"
        setup="toast storage like share"
        title="图标按钮"
        description="独立图标使用 aria-label 描述操作，selected 表示收藏等切换状态。"
      >
        <div class="icon-actions">
          <Button
            variant="icon"
            icon="heart"
            aria-label="收藏"
            :selected="liked"
            :style="liked ? { color: 'var(--danger)' } : undefined"
            @click="toggleLike"
          />
          <Button variant="icon" icon="share" aria-label="分享" @click="openSheet" />
          <Button
            variant="icon"
            icon="add"
            aria-label="添加"
            @click="notify('已添加新项目（原型示例）')"
          />
          <Menu :options="sheetActions" label="更多操作" @select="selectAction">
            <template #default="{ trigger }">
              <Button v-bind="trigger" variant="bare" icon="grid" aria-label="更多" />
            </template>
          </Menu>
        </div>
      </DemoExample>
      <DemoExample
        name="button-states"
        source="pages/home/button/index.vue"
        setup="toast"
        title="图标与禁用状态"
        description="icon 为按钮添加前置图标，disabled 阻止点击与键盘激活。"
      >
        <div class="btn-row">
          <Button icon="check" @click="notify('已保存')">带图标按钮</Button>
          <Button disabled>禁用按钮</Button>
        </div>
      </DemoExample>
    </div>
  </section>
</template>

<style scoped>
.button-showcase {
  display: grid;
  grid-template-columns: var(--showcase-sample-columns, minmax(0, 1fr));
  gap: 24px;
}

.btn-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

.icon-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 400px) {
  .btn-row {
    gap: 8px;
  }
}

@media (max-width: 760px) {
  .btn-row {
    display: flex;
    gap: 10px;
  }

  .button-showcase {
    gap: 20px;
  }
}

@media (max-width: 400px) {
  .btn-row {
    gap: 9px;
  }
}
</style>
