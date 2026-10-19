<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Icon, Image, Segmented } from '@my-ui/vue'

const fit = ref<'cover' | 'contain' | 'fill'>('cover')
const options = [{ value: 'cover', label: '裁剪填满' }, { value: 'contain', label: '完整显示' }, { value: 'fill', label: '拉伸填满' }]
const lake = '/images/lake.svg'
const failed = 'data:image/png;base64,AA=='
const ready = ref(false), restored = ref(false)
</script>

<template>
  <Card id="image" class="image-card" title="图片" description="呈现内容，也照顾等待与失败" sample="IMAGE">
    <div class="image-showcase">
      <figure class="image-main">
        <Image :src="lake" alt="山间湖泊，远山与一叶小舟" :ratio="16 / 9" :fit="fit" />
        <figcaption><strong>山间的一点安静</strong><span>相同比例，三种呈现方式</span></figcaption>
        <Segmented v-model="fit" :options="options" label="图片裁剪方式" />
      </figure>
      <div class="image-states">
        <div>
          <Image :src="ready ? lake : ''" alt="准备展示的山间湖泊" :ratio="3 / 2" class="image-custom">
            <template #placeholder><div class="custom-placeholder"><Icon name="image" /><span>给内容留好位置</span><small>占位内容可以自由组合</small></div></template>
          </Image>
          <div class="image-state-caption"><span>自定义占位</span><Button variant="text" @click="ready = !ready">{{ ready ? '清空图片' : '载入图片' }}</Button></div>
        </div>
        <div>
          <Image :src="restored ? lake : failed" alt="示例图片" :ratio="3 / 2" />
          <div class="image-state-caption"><span>{{ restored ? '已恢复显示' : '失败后可以重试' }}</span><Button variant="text" @click="restored = !restored">{{ restored ? '模拟失败' : '恢复图片' }}</Button></div>
        </div>
      </div>
    </div>
    <p class="image-note">默认使用原生懒加载。设置宽高或比例可预留空间，圆角、背景与裁剪位置可以通过 CSS 覆写。</p>
  </Card>
</template>

<style scoped>
.image-card { scroll-margin-top: 120px; }
.image-showcase { display: grid; grid-template-columns: minmax(0, 2.4fr) minmax(0, 1fr); align-items: start; gap: 28px; }
.image-main { margin: 0; min-width: 0; }
.image-main figcaption { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin: 18px 0; }
.image-main strong { font-size: 16px; font-weight: var(--font-weight-subtitle, 600); }
.image-main figcaption span, .image-state-caption > span, .image-note { color: var(--text-secondary); font-size: 13px; line-height: 1.6; }
.image-states { display: grid; gap: 20px; min-width: 0; }
.image-state-caption { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; }
.custom-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.custom-placeholder :deep(svg) { width: 30px; height: 30px; }
.custom-placeholder small { opacity: .75; }
.image-custom { --image-background: color-mix(in srgb, var(--fill) 55%, var(--card-background)); }
.image-note { margin: 22px 0 0; }
@media (max-width: 760px) { .image-showcase { grid-template-columns: 1fr; gap: 24px; } .image-states { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } .image-state-caption { flex-wrap: wrap; gap: 0; } }
@media (max-width: 420px) { .image-states { grid-template-columns: 1fr; } }
</style>
