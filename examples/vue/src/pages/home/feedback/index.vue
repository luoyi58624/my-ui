<script setup lang="ts">
import { h, ref, inject } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import SharePanel from '../../../components/SharePanel.vue'
import { Button, Icon, popup, Toast, type Option } from '@my-ui/vue'
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
// #region dialog
async function openDialog() {
  if (
    await popup.showAlert({
      title: '确认保存更改？',
      message: '保存后将同步更新你的设置。你也可以稍后再进行调整。',
      confirmText: '确认保存'
    })
  )
    notify('设置已保存')
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
  <section id="feedback">
    <div class="feedback-grid">
      <DemoExample
        name="toast"
        source="pages/home/feedback/index.vue"
        class="feedback-panel"
        title="轻提示"
        description="通过 Toast 实例展示简短反馈，不中断当前操作。"
      >
        <div class="toast-sample">
          <Icon name="check" />
          <div>
            <strong>保存成功</strong>
            <small>你的更改已经同步</small>
          </div>
        </div>
        <Button variant="link" @click="notify('你的更改已经同步')">
          体验轻提示
          <Icon name="arrow-right" />
        </Button>
      </DemoExample>
      <DemoExample
        name="dialog"
        source="pages/home/feedback/index.vue"
        setup="toast dialog"
        class="feedback-panel"
        title="确认弹窗"
        description="等待 showAlert 的返回值，确认后再执行后续操作。"
      >
        <div class="empty-illustration">
          <div class="empty-image"><Icon name="shield" /></div>
          <span>每个决定，都值得确认</span>
        </div>
        <Button variant="link" @click="openDialog">
          打开确认弹窗
          <Icon name="arrow-right" />
        </Button>
      </DemoExample>
      <DemoExample
        name="sheet"
        source="pages/home/feedback/index.vue"
        setup="toast storage like share"
        class="feedback-panel"
        title="底部操作面板"
        description="showSheet 接收自定义内容，通过 closed 取得用户选择。"
      >
        <div class="sheet-sample">
          <div class="handle"></div>
          <div class="sheet-line"></div>
          <div class="sheet-line"></div>
        </div>
        <Button variant="link" @click="openSheet">
          展开操作面板
          <Icon name="arrow-right" />
        </Button>
      </DemoExample>
    </div>
  </section>
</template>

<style scoped>
.toast-sample {
  margin: auto 0;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 13px;
  border-radius: 17px;
  border: 1px solid var(--border);
  background: var(--fill);
  color: var(--success);
}

.toast-sample svg {
  height: 19px;
  width: 19px;
}

.toast-sample strong {
  font-size: 14px;
  display: block;
  font-weight: var(--font-weight-subtitle, 600);
}

.toast-sample small {
  font-size: 13px;
  display: block;
  color: var(--text-secondary);
  margin-top: 5px;
}

.sheet-sample .handle {
  height: 4px;
  width: 32px;
  border-radius: 20px;
  background: var(--gray);
  margin: 0 auto 14px;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.feedback-panel {
  min-height: 254px;
  display: flex;
  flex-direction: column;
  --card-header-gap: 25px;
}

.empty-illustration {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.empty-illustration .empty-image {
  width: 65px;
  height: 65px;
  border-radius: 21px;
  background: var(--fill);
  display: grid;
  place-items: center;
  color: var(--text-secondary);
}

.empty-illustration svg {
  width: 28px;
  height: 28px;
}

.empty-illustration span {
  font-size: 13px;
}

.sheet-sample {
  border-radius: 19px 19px 13px 13px;
  background: var(--fill);
  border: 1px solid var(--border);
  padding: 14px 18px 19px;
  margin: auto 0 0;
}

.sheet-sample .sheet-line {
  height: 11px;
  border-radius: 10px;
  background: var(--border);
  margin-bottom: 10px;
}

.sheet-sample .sheet-line:nth-child(3) {
  width: 66%;
  margin-bottom: 0;
}

@media (max-width: 760px) {
  .feedback-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feedback-panel {
    min-height: 220px;
  }
}

@media (max-width: 760px) {
  .feedback-panel {
    min-height: 220px;
  }
}
</style>
