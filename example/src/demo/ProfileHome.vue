<script setup lang="ts">
import { CellGroup, Icon, ListRow } from '@my-ui/vue'

const emit = defineEmits<{
  /** 浏览组件时交给主导航切回首页。 */
  home: []
}>()
</script>

<template>
  <div class="profile-home" data-profile-home>
    <div class="profile-avatar" aria-hidden="true">小</div>
    <h2>小蓝同学</h2>
    <p class="profile-signature">让每一天，都有一点新发现。</p>
    <CellGroup title="账号与偏好">
      <ListRow title="个人资料" description="昵称、个性签名与展示偏好" disabled>
        <template #leading><Icon name="user" /></template>
      </ListRow>
      <ListRow title="浏览组件" description="发现更多界面与交互" @click="emit('home')">
        <template #leading><Icon name="grid" /></template>
      </ListRow>
    </CellGroup>
    <p class="profile-platform-note">个人资料编辑请在 Android 应用内体验。</p>
  </div>
</template>

<style scoped>
.profile-home { max-width: 640px; margin-inline: auto; padding: 36px 24px 24px; }
.profile-avatar { display: grid; place-items: center; width: 80px; height: 80px; margin-bottom: 20px; border-radius: 24px; background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); font-size: 30px; font-weight: 600; }
.profile-home h2 { margin: 0 0 10px; color: var(--text); font-size: 26px; line-height: 1.4; }
.profile-signature { margin: 0 0 40px; color: var(--text-secondary); font-size: 14px; line-height: 1.7; }
.profile-platform-note { margin: 18px 0 0; color: var(--text-secondary); font-size: 12px; line-height: 1.7; }
</style>
