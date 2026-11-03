<script setup lang="ts">
import { h, ref } from 'vue'
import { Button, Card, CellGroup, Icon, Input, ListRow, Menu, Stepper, popup } from '@my-ui/vue'
import DemoAppBar from '../../../components/DemoAppBar.vue'
import { closePage, isAndroidNative } from '../../../commons/navigation'
import { updateDemoCache, useSharedDemoStore } from '../../../commons/state/shared'
import { usePageReady } from '../../../commons/page-ready'

usePageReady()

const available = isAndroidNative()
const shared = useSharedDemoStore()
const error = ref('')
const openedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false })

async function back() {
  try {
    await shared.$shared?.flush()
    await closePage('/example/native-navigation')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
}

async function updateCache() {
  try {
    await updateDemoCache()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
}

function openOverlay(kind: 'sheet' | 'drawer') {
  const options = {
    title: '弹层优先返回',
    content: () =>
      h('div', { style: 'display: grid; gap: 16px' }, [
        h('p', '先展开菜单或确认弹窗，再试试系统返回。每次只返回一层。'),
        h(
          Menu,
          {
            label: '选择分类',
            anchor: 'element',
            options: [
              {
                value: 'move',
                label: '移动到',
                children: [
                  { value: 'notes', label: '日常笔记' },
                  { value: 'ideas', label: '灵感收藏' }
                ]
              }
            ]
          },
          () => h(Button, { variant: 'outline' }, () => '选择分类')
        ),
        h(
          Button,
          {
            onClick: () =>
              popup.showAlert({
                title: '再确认一次',
                message: '返回只关闭这层确认，下面的面板会保留。',
                confirmText: '知道了'
              })
          },
          () => '再打开一层确认'
        )
      ])
  }
  if (kind === 'drawer') popup.showDrawer(options)
  else popup.showSheet(options)
}
</script>

<template>
  <div class="native-page demo-view">
    <DemoAppBar title="跨页共享状态" back @back="back" /><div class="demo-scroll">
    <main class="native-page-content">
      <div class="native-page-intro">
        <span class="native-page-symbol"><Icon name="layer" /></span>
        <h1>来到另一页</h1>
        <p>
          {{ available ? '这是独立原生窗口中的 Web 页面，修改后通过系统返回回到上一页。' : '在这里修改备注和计数，返回后上一页也会更新。' }}
        </p>
      </div>
      <Card title="共享的内容" description="两页修改即时同步，重新打开也会恢复">
        <Input v-model="shared.note" label="共享备注" clearable />
        <div class="native-page-counter">
          <span>共享计数</span><Stepper v-model="shared.count" label="共享计数" />
        </div>
        <div class="native-page-meta">
          <span>本次打开</span><span>{{ openedAt }}</span>
        </div>
        <div class="native-page-actions">
          <Button @click="back">返回上一页</Button
          ><Button variant="text" @click="updateCache">从本地更新</Button>
        </div>
        <p v-if="error || shared.$shared?.error" class="native-page-error" role="alert">
          {{ error || shared.$shared?.error?.message }}
        </p>
      </Card>
      <Card title="弹层优先返回" description="先关闭最上层弹窗，再返回当前页面">
        <div class="native-page-actions">
          <Button variant="outline" @click="openOverlay('sheet')">展开底部面板</Button
          ><Button variant="outline" @click="openOverlay('drawer')">打开抽屉</Button>
        </div>
      </Card>
      <Card title="继续向下看看" description="这一页也可以独立滚动">
        <CellGroup
          ><ListRow
            v-for="(title, index) in [
              '随手记录的想法',
              '周末的小计划',
              '收藏的好风景',
              '想完成的一件事',
              '给未来的自己',
              '今天的好心情',
              '留一点空白',
              '慢慢来，也很好'
            ]"
            :key="title"
            :title="title"
            :description="'第 ' + (index + 1) + ' 条记录'"
            :icon="index % 2 ? 'heart' : 'spark'"
        /></CellGroup>
      </Card>
      <p class="native-page-footnote">备注和计数由两页共用，滚动位置与打开时间各自保留。</p>
    </main>
    </div>
  </div>
</template>

<style scoped>
.native-page {
  height: 100%;
  background: var(--background);
}
.native-page-content {
  display: grid;
  gap: 22px;
  max-width: 640px;
  margin: auto;
  padding: 26px 18px 32px;
}
.native-page-intro {
  padding: 8px 4px 12px;
}
.native-page-symbol {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  border-radius: 15px;
  background: var(--fill);
  color: var(--primary);
}
.native-page-symbol :deep(svg) {
  width: 25px;
  height: 25px;
}
.native-page-intro h1 {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.4;
  font-weight: var(--font-weight-title, 700);
}
.native-page-intro p,
.native-page-footnote {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}
.native-page-counter,
.native-page-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 22px 0;
  font-size: 14px;
}
.native-page-meta {
  color: var(--text-secondary);
  font-size: 13px;
}
.native-page-error {
  color: var(--danger);
  font-size: 13px;
  line-height: 1.7;
}
.native-page-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.native-page-footnote {
  padding: 0 4px;
  text-align: center;
  font-size: 12px;
}
</style>
