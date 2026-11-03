<script setup lang="ts">
import DemoExample from '../../../components/DemoExample.vue'
import { ref } from 'vue'
import { Avatar, Badge, Button, Card, Divider } from '@my-ui/vue'
import portrait from '../../../commons/assets/avatar-lan.svg'

const unread = ref(12),
  quiet = ref(false)
</script>

<template>
  <div id="avatar-badge" class="identity-card">
    <DemoExample
      name="identity-profile"
      source="pages/home/identity/index.vue"
      title="头像与状态组合"
      description="在头像外层使用 Badge，通过圆点展示在线状态。"
    >
      <div class="profile-preview">
        <Badge class="online-badge" dot :hidden="quiet" label="小蓝在线">
          <Avatar :src="portrait" alt="小蓝同学" :size="56" />
        </Badge>
        <div>
          <strong>小蓝同学</strong>
          <p>{{ quiet ? '安静一会儿，稍后再看' : '今天也有值得收藏的新发现' }}</p>
        </div>
        <Badge value="创作者" class="creator-badge" />
      </div>
    </DemoExample>
    <DemoExample
      name="avatar"
      source="pages/home/identity/index.vue"
      title="头像"
      description="支持图片、文字、方形与自定义插槽，通过 size 指定尺寸。"
    >
      <div class="avatar-examples">
        <div>
          <Avatar :src="portrait" alt="小蓝同学" />
          <span>图片</span>
        </div>
        <div>
          <Avatar text="青" alt="小青" class="green-avatar" />
          <span>文字</span>
        </div>
        <div>
          <Avatar alt="Alex Morgan" shape="square" />
          <span>方形</span>
        </div>
        <div>
          <Avatar :size="32" alt="访客">
            <template #default><span>访</span></template>
          </Avatar>
          <span>小尺寸</span>
        </div>
        <div>
          <Avatar />
          <span>默认</span>
        </div>
      </div>
    </DemoExample>
    <DemoExample
      name="badge"
      source="pages/home/identity/index.vue"
      title="徽标"
      description="数字默认合并超出上限的值，dot 使用圆点，show-zero 保留零值。"
    >
      <div class="badge-examples">
        <div>
          <Badge :value="unread" :hidden="quiet">
            <Button variant="bare" icon="bell" aria-label="查看通知" @click="unread = 0" />
          </Badge>
          <span>未读数字</span>
        </div>
        <div>
          <Badge :value="128" :hidden="quiet">
            <Button variant="bare" icon="message" aria-label="查看消息" />
          </Badge>
          <span>超出上限</span>
        </div>
        <div>
          <Badge dot :hidden="quiet">
            <Button variant="bare" icon="heart" aria-label="查看关注" />
          </Badge>
          <span>圆点提醒</span>
        </div>
        <div>
          <Badge :value="0" show-zero>
            <Button variant="bare" icon="inbox" aria-label="查看收件箱" />
          </Badge>
          <span>保留零值</span>
        </div>
      </div>
      <div class="identity-actions">
        <Button variant="text" @click="unread = unread ? 0 : 12">
          {{ unread ? '清空未读' : '恢复未读' }}
        </Button>
        <Button variant="text" @click="quiet = !quiet">
          {{ quiet ? '显示提醒' : '暂时隐藏' }}
        </Button>
      </div>
    </DemoExample>
  </div>
</template>

<style scoped>
.identity-card {
  scroll-margin-top: 120px;
}
.profile-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 8px 0 28px;
}
.profile-preview > div {
  flex: 1;
  min-width: 0;
}
.profile-preview strong {
  font-size: 16px;
  font-weight: var(--font-weight-subtitle, 600);
}
.profile-preview p {
  margin: 7px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.creator-badge {
  --badge-background: var(--fill);
  --badge-color: var(--text-secondary);
}
.online-badge {
  --badge-background: var(--success);
}
.avatar-examples,
.badge-examples {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px 18px;
}
.avatar-examples > div,
.badge-examples > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-height: 72px;
}
.avatar-examples > div > span:last-child,
.badge-examples > div > span:last-child {
  color: var(--text-secondary);
  font-size: 12px;
}
.green-avatar {
  --avatar-background: color-mix(in srgb, var(--success) 12%, var(--card-background));
  --avatar-color: var(--success);
}
.badge-examples {
  padding-top: 6px;
}
.badge-examples > div {
  min-height: 65px;
}
.identity-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}
@media (max-width: 600px) {
  .profile-preview {
    gap: 12px;
  }
  .creator-badge {
    display: none;
  }
  .avatar-examples,
  .badge-examples {
    gap: 20px 14px;
  }
}
</style>
