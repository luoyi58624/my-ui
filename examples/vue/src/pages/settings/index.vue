<script setup lang="ts">
import { ref } from 'vue'
import { Icon, Switch } from '@my-ui/vue'
import { settingsAccount, settingsGroups } from './data'

const airplane = ref(false)
</script>

<template>
  <div class="settings-home" data-settings-home>
    <h2 class="settings-heading">设置</h2>
    <div class="settings-search">
      <div class="settings-search-field"><Icon name="search" /><span>搜索设置项</span></div>
    </div>
    <div class="settings-content">
      <section class="settings-account">
        <span class="settings-avatar"><Icon name="user" /></span>
        <div><h3>{{ settingsAccount.title }}</h3><p>{{ settingsAccount.summary }}</p></div>
        <Icon name="chevron-right" />
      </section>
      <section v-for="(group, index) in settingsGroups" :key="index" class="settings-group" :aria-label="'设置分组 ' + (index + 1)">
        <div v-for="item in group" :key="item.id" class="settings-row">
          <svg viewBox="0 0 24 24" :style="{ color: item.color }" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="path in item.paths" :key="path" :d="path" /></svg>
          <span class="settings-row-title">{{ item.title }}</span>
          <Switch v-if="item.toggle" v-model="airplane" :label="item.title" />
          <template v-else><span v-if="item.summary" class="settings-summary">{{ item.summary }}</span><Icon name="chevron-right" /></template>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-home { color: var(--text); background: var(--background); min-height: 100%; }
.settings-heading { box-sizing: border-box; display: flex; align-items: end; height: 116px; margin: 0; padding: 0 24px 20px; font-size: 40px; line-height: 1.2; font-weight: var(--font-weight-title, 700); }
.settings-search { position: sticky; top: 0; z-index: 1; box-sizing: border-box; height: 52px; padding: 6px 16px; background: color-mix(in srgb, var(--background) 88%, transparent); backdrop-filter: blur(16px); }
.settings-search-field { display: flex; align-items: center; gap: 10px; box-sizing: border-box; height: 40px; padding: 0 14px; border: 1px solid var(--card-background); border-radius: 24px; background: color-mix(in srgb, var(--card-background) 64%, transparent); color: var(--text-secondary); font-size: 16px; }
.settings-search-field :deep(svg) { width: 20px; height: 20px; }
.settings-content { padding: 16px 16px 28px; max-width: 640px; margin: auto; }
.settings-account, .settings-group { border-radius: 24px; background: var(--card-background); overflow: hidden; margin: 0 0 16px; }
.settings-account { display: flex; align-items: center; min-height: 88px; padding: 16px; gap: 16px; box-sizing: border-box; }
.settings-account > div { flex: 1; min-width: 0; }
.settings-avatar { display: grid; place-items: center; flex: none; width: 56px; height: 56px; border-radius: 50%; color: var(--text-secondary); background: var(--fill); }
.settings-avatar :deep(svg) { width: 32px; height: 32px; }
.settings-account h3 { margin: 0 0 4px; font-size: 20px; font-weight: var(--font-weight-subtitle, 600); }
.settings-account p { margin: 0; color: var(--text-secondary); font-size: 12px; }
.settings-account > :deep(svg), .settings-row > :deep(svg:last-child) { width: 16px; height: 16px; flex: none; color: var(--text-secondary); opacity: .5; }
.settings-row { position: relative; display: flex; align-items: center; gap: 16px; min-height: 52px; padding: 0 16px; }
.settings-row + .settings-row::before { content: ''; position: absolute; top: 0; left: 56px; right: 16px; height: 1px; background: var(--border); opacity: .6; }
.settings-row > svg:first-child { width: 24px; height: 24px; flex: none; }
.settings-row-title { flex: 1; min-width: 0; font-size: 16px; }
.settings-summary { color: var(--text-secondary); font-size: 14px; white-space: nowrap; }
</style>
