<script setup lang="ts">
import { inject, onBeforeUnmount, ref } from 'vue'
import { Button, Icon, PullRefresh, type IconName } from '@my-ui/vue'
import DemoExample from '../../../components/DemoExample.vue'
import { notifyKey } from '../../../commons/notify'

const notify = inject(notifyKey)!
const pullRefresh = ref<InstanceType<typeof PullRefresh>>()
const refreshing = ref(false)
const updatedAt = ref('刚刚更新')
const updateCount = ref(0)
const messages = ref(
  [
    ['设计灵感', '把喜欢的日常，收进这一页', '用一点留白，让重要的内容更容易被看见。', 'spark'],
    ['小蓝的分享', '周末，去看看新的风景', '收藏一条散步路线，留给下一个晴天。', 'sun'],
    ['团队动态', '本周的灵感清单已整理', '那些值得回看的想法，现在都在这里。', 'grid'],
    ['阅读时间', '给自己一小段安静的时间', '合上待办列表，打开一篇喜欢的文章。', 'file'],
    ['工作空间', '让桌面多一点呼吸感', '整理文件，也整理今天的思绪。', 'briefcase'],
    ['生活记录', '今天也有值得记住的小事', '一杯热咖啡，一段音乐，一次意外的相遇。', 'heart'],
    ['设计灵感', '颜色里的温柔时刻', '从身边的光影里，找到新的配色灵感。', 'image'],
    ['小蓝的分享', '一份可以慢慢完成的计划', '不着急，每天向前走一点点。', 'clock'],
    ['团队动态', '让好的想法继续生长', '打开讨论，记录每一个不同的视角。', 'message'],
    ['阅读时间', '把好内容留给未来的自己', '点一下爱心，下次就能记得它。', 'inbox'],
    ['工作空间', '收尾，也是新的开始', '清空今天的收件箱，给明天留一个好心情。', 'check'],
    ['生活记录', '日常的美好，持续更新', '回到列表顶部，下拉看看有没有新消息。', 'cloud']
  ].map(([category, title, summary, icon], index) => ({
    id: index + 1,
    category,
    title,
    summary,
    icon: icon as IconName,
    saved: false,
    fresh: false
  }))
)
let delay: ReturnType<typeof setTimeout> | undefined
let finishDelay: (() => void) | undefined
let disposed = false

async function refreshInbox() {
  try {
    // 模拟请求耗时；实际应用在这里等待接口返回。
    await new Promise<void>((resolve) => {
      finishDelay = resolve
      delay = setTimeout(resolve, 1100)
    })
    if (disposed) return
    updateCount.value += 1
    messages.value = [
      {
        id: 1000 + updateCount.value,
        category: '最新动态',
        title: `新的灵感已送达 · ${updateCount.value}`,
        summary: '这是一条刚刚更新的消息。把喜欢的内容收藏起来吧。',
        icon: 'cloud' as const,
        saved: false,
        fresh: true
      },
      ...messages.value.map((message) => ({ ...message, fresh: false }))
    ].slice(0, 16)
    updatedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false }) + ' 更新'
  } catch {
    if (!disposed) notify('暂时未能更新，请再试一次')
  } finally {
    delay = undefined
    finishDelay = undefined
    if (!disposed) refreshing.value = false
  }
}

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(delay)
  // 结束等待，避免离开示例后仍保留未完成的异步任务。
  finishDelay?.()
})
</script>

<template>
  <DemoExample
    name="pull-refresh"
    source="pages/home/pull-refresh/index.vue"
    title="下拉，收取新消息"
    description="滚到顶部后继续下拉即可刷新，也可以点击刷新按钮。收藏你想稍后阅读的内容。"
  >
    <div class="inbox-example" data-pull-refresh-example>
      <div class="inbox-toolbar">
        <span class="inbox-hint">一点新鲜，随手刷新</span>
        <Button
          variant="outline"
          icon="cloud"
          :loading="refreshing"
          data-refresh-button
          @click="pullRefresh?.refresh()"
        >
          刷新
        </Button>
      </div>
      <div class="inbox-frame">
        <header class="inbox-heading">
          <div class="inbox-emblem"><Icon name="inbox" /></div>
          <div>
            <p class="inbox-eyebrow">属于你的日常</p>
            <h3>今日收件</h3>
          </div>
          <span class="inbox-count">{{ messages.length }} 封</span>
        </header>
        <div class="inbox-status" aria-live="polite" aria-atomic="true">
          <span data-refresh-updated>{{ updatedAt }}</span>
          <span data-refresh-count>
            {{ updateCount ? `已刷新 ${updateCount} 次` : '下拉遇见新内容' }}
          </span>
        </div>
        <PullRefresh
          ref="pullRefresh"
          v-model="refreshing"
          class="inbox-scroll"
          label="今日收件列表"
          @refresh="refreshInbox"
        >
          <div class="inbox-messages">
            <article
              v-for="message in messages"
              :key="message.id"
              class="inbox-message"
              :class="{ 'is-new': message.fresh }"
              :data-message-id="message.id"
            >
              <div class="inbox-message-top">
                <span class="inbox-category">
                  <Icon :name="message.icon" />
                  {{ message.category }}
                  <span v-if="message.fresh" class="inbox-new">新</span>
                </span>
                <Button
                  variant="icon"
                  icon="heart"
                  :selected="message.saved"
                  :aria-label="(message.saved ? '取消收藏：' : '收藏：') + message.title"
                  :data-save-message="message.id"
                  @click="message.saved = !message.saved"
                />
              </div>
              <h4>{{ message.title }}</h4>
              <p>{{ message.summary }}</p>
            </article>
            <p class="inbox-end">暂时就这些，喜欢的内容可以慢慢看。</p>
          </div>
        </PullRefresh>
      </div>
      <p class="inbox-caption">向上滑动浏览；滚到顶部后继续下拉即可刷新。</p>
    </div>
  </DemoExample>
</template>

<style scoped>
.inbox-example {
  width: min(100%, 420px);
  margin-inline: auto;
}
.inbox-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.inbox-hint {
  color: var(--text-secondary);
  font-size: 12px;
}
.inbox-frame {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--card-background);
}
.inbox-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 22px 18px;
}
.inbox-emblem {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 15px;
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, var(--card-background));
}
.inbox-emblem svg {
  width: 24px;
  height: 24px;
}
.inbox-eyebrow {
  margin: 0 0 5px;
  color: var(--text-secondary);
  font-size: 11px;
  letter-spacing: 1px;
}
.inbox-heading h3 {
  margin: 0;
  font-size: 22px;
  font-weight: var(--font-weight-subtitle, 600);
  letter-spacing: -0.5px;
}
.inbox-count {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
}
.inbox-status {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0 22px 18px;
  color: var(--text-secondary);
  font-size: 11px;
}
.inbox-status > :last-child {
  color: var(--primary);
}
.inbox-scroll {
  height: 432px;
  background: var(--background);
  border-top: 1px solid var(--border);
}
.inbox-messages {
  display: grid;
  gap: 10px;
  padding: 14px;
}
.inbox-message {
  padding: 12px 16px 17px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card-background);
}
.inbox-message.is-new {
  border-color: color-mix(in srgb, var(--primary) 32%, var(--border));
}
.inbox-message-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}
.inbox-category {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 11px;
}
.inbox-category svg {
  width: 14px;
  height: 14px;
  color: var(--primary);
}
.inbox-new {
  padding: 1px 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--primary) 10%, var(--card-background));
  color: var(--primary);
  font-size: 10px;
}
.inbox-message h4 {
  margin: 0 0 7px;
  font-size: 14px;
  font-weight: var(--font-weight-subtitle, 600);
  line-height: 1.6;
}
.inbox-message p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.85;
}
.inbox-end,
.inbox-caption {
  margin: 4px 0;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.8;
  text-align: center;
}
.inbox-caption {
  margin-top: 14px;
}
@media (max-width: 600px) {
  .inbox-heading {
    padding: 20px 16px 16px;
  }
  .inbox-status {
    padding-inline: 16px;
  }
  .inbox-messages {
    padding: 10px;
  }
  .inbox-scroll {
    height: min(432px, 58svh);
    min-height: 280px;
  }
}
</style>
