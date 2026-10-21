<script setup lang="ts">
import { ref } from 'vue'
import { AppBar, Button, Input, Tabbar, type Option } from '@my-ui/vue'
import DemoExample from '../../../components/DemoExample.vue'

// #region tabbar
const active = ref('home')
const note = ref('周末去看看海')
const count = ref(0)
const options: Option[] = [
  { value: 'home', label: '首页', icon: 'home' },
  { value: 'saved', label: '收藏', icon: 'heart' },
  { value: 'profile', label: '我的', icon: 'user' }
]
// #endregion
</script>

<template>
  <DemoExample name="tabbar" source="pages/home/tabbar/index.vue" title="切换栏目，保留内容" description="AppBar、内容区和 Tabbar 使用普通纵向布局；用 v-show 保留每个栏目的输入与状态。">
    <div class="tabbar-preview">
      <AppBar :title="options.find(item => item.value === active)?.label" />
      <div class="tabbar-content">
        <section v-show="active === 'home'">
          <span class="tabbar-eyebrow">TODAY</span><h3>把好想法留下来</h3>
          <p>写下备注，切到其他栏目再回来，内容依然在这里。</p>
          <Input v-model="note" label="今日备注" clearable />
        </section>
        <section v-show="active === 'saved'">
          <span class="tabbar-eyebrow">COLLECTION</span><h3>喜欢，就收藏</h3>
          <p>栏目独立保存自己的状态。</p>
          <Button variant="outline" icon="heart" @click="count++">已收藏 {{ count }} 个灵感</Button>
        </section>
        <section v-show="active === 'profile'">
          <span class="tabbar-eyebrow">HELLO</span><h3>留一点时间给自己</h3>
          <p>Tabbar 只负责选择与显示，页面和路由由应用组合。</p>
          <Button variant="outline" @click="active = 'home'">返回首页</Button>
        </section>
      </div>
      <Tabbar v-model="active" :options="options" label="示例栏目" />
    </div>
  </DemoExample>
</template>

<style scoped>
.tabbar-preview { max-width: 420px; margin: auto; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--card-background); --tabbar-safe-bottom: 0px; }
.tabbar-content { height: 310px; overflow: auto; padding: 32px 24px; box-sizing: border-box; }
.tabbar-content h3 { margin: 12px 0; font-size: 23px; }
.tabbar-content p { color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px; }
.tabbar-eyebrow { font-size: 11px; letter-spacing: 2px; color: var(--primary); }
</style>
