<script setup lang="ts">
import { ref } from 'vue'
import { Button, Icon, Image, ImagePreview, type ImagePreviewItem } from '@my-ui/vue'
import DemoExample from '../../../components/DemoExample.vue'

// #region image-preview-gallery
const photos: ImagePreviewItem[] = [
  { src: '/images/lake.svg', alt: '山间湖泊，远山与一叶小舟' },
  { src: '/images/coast.svg', alt: '午后的海岸，灯塔与浅蓝色海湾' },
  { src: '/images/dunes.svg', alt: '日落前的沙丘，弯曲的小径与月亮' }
]
const captions = [
  { title: '山间的一点安静', note: '湖泊 · 清晨' },
  { title: '沿着海风走', note: '海岸 · 午后' },
  { title: '等一场日落', note: '沙丘 · 傍晚' }
]
const galleryOpen = ref(false)
const startIndex = ref(0)
function openPhoto(index: number) {
  startIndex.value = index
  galleryOpen.value = true
}
// #endregion

// #region image-preview-states
const stateOpen = ref(false)
const stateImages = ref<(string | ImagePreviewItem)[]>([])
const stateTitle = ref('一张风景')
function showState(mode: 'single' | 'error' | 'empty') {
  stateTitle.value = mode === 'single' ? '一张风景' : mode === 'error' ? '加载失败' : '空图片列表'
  stateImages.value = mode === 'single'
    ? [{ src: '/images/coast.svg', alt: '午后的海岸，灯塔与浅蓝色海湾' }]
    : mode === 'error'
      ? [{ src: 'data:image/png;base64,AA==', alt: '暂时无法显示的图片' }]
      : []
  stateOpen.value = true
}
// #endregion
</script>

<template>
  <section id="image-preview" class="preview-examples">
    <DemoExample
      name="image-preview-gallery"
      source="pages/home/image-preview/index.vue"
      title="把风景放大一点"
      description="点击任意图片开始浏览，左右滑动切换，双击或双指放大查看细节。"
    >
      <div class="preview-gallery">
        <button
          v-for="(photo, index) in photos"
          :key="photo.src"
          type="button"
          class="preview-photo"
          :aria-label="'预览：' + photo.alt"
          @click="openPhoto(index)"
        >
          <span class="preview-photo-image">
            <Image :src="photo.src" alt="" :ratio="4 / 3">
              <template #error><Icon name="image" /></template>
            </Image>
            <span class="preview-photo-action" aria-hidden="true"><Icon name="search" /></span>
          </span>
          <span class="preview-photo-caption">
            <strong>{{ captions[index]?.title }}</strong>
            <span>{{ captions[index]?.note }}</span>
          </span>
        </button>
      </div>
      <div class="preview-gallery-footer">
        <span><Icon name="image" /> 三张风景，慢慢看</span>
        <span>放大后可以拖动图片</span>
      </div>
      <ImagePreview
        v-model="galleryOpen"
        :images="photos"
        :start-index="startIndex"
        title="收集一些好风景"
      />
    </DemoExample>

    <DemoExample
      name="image-preview-states"
      source="pages/home/image-preview/index.vue"
      title="一张图片，也能仔细看"
      description="单张图片保留缩放和拖动；加载失败可以重试，没有图片时也能正常退出。"
    >
      <div class="preview-state-card">
        <button
          type="button"
          class="preview-state-image"
          aria-label="预览午后的海岸"
          @click="showState('single')"
        >
          <Image src="/images/coast.svg" alt="" :ratio="3 / 2">
            <template #error><Icon name="image" /></template>
          </Image>
        </button>
        <div class="preview-state-content">
          <span class="preview-eyebrow">留一点时间给风景</span>
          <h3>从全景，到细节</h3>
          <p>放大看看海边的小灯塔，也可以试试图片没有准备好时的样子。</p>
          <div class="preview-state-actions">
            <Button icon="image" @click="showState('single')">打开单图</Button>
            <Button variant="outline" @click="showState('error')">体验加载失败</Button>
            <Button variant="text" @click="showState('empty')">空图片列表</Button>
          </div>
        </div>
      </div>
      <ImagePreview v-model="stateOpen" :images="stateImages" :title="stateTitle" :max-zoom="3" />
    </DemoExample>
  </section>
</template>

<style scoped>
.preview-examples {
  display: grid;
  gap: 40px;
  min-width: 0;
  scroll-margin-top: 110px;
}
.preview-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.preview-photo,
.preview-state-image {
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.preview-photo:focus-visible,
.preview-state-image:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 5px;
}
.preview-photo-image {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 14px;
}
.preview-photo :deep(.my-image),
.preview-state-image :deep(.my-image) {
  --image-radius: 14px;
}
.preview-photo :deep(img) {
  transition: transform 240ms ease-out;
}
.preview-photo-action {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 50%;
  background: rgb(20 40 38 / 32%);
  color: white;
  pointer-events: none;
}
.preview-photo-action :deep(svg) {
  width: 17px;
  height: 17px;
}
.preview-photo-caption {
  display: grid;
  gap: 6px;
  padding: 15px 2px 2px;
}
.preview-photo-caption strong {
  font-size: 15px;
  font-weight: var(--font-weight-subtitle, 600);
  line-height: 1.5;
}
.preview-photo-caption > span {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
}
.preview-gallery-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
.preview-gallery-footer > span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.preview-gallery-footer :deep(svg) {
  width: 16px;
  height: 16px;
}
.preview-state-card {
  display: grid;
  grid-template-columns: minmax(180px, 0.85fr) minmax(0, 1.3fr);
  align-items: center;
  gap: 30px;
}
.preview-state-image {
  display: block;
  overflow: hidden;
}
.preview-eyebrow {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
.preview-state-content h3 {
  margin: 10px 0;
  font-size: 23px;
  font-weight: var(--font-weight-subtitle, 600);
  line-height: 1.4;
  letter-spacing: -0.4px;
}
.preview-state-content p {
  max-width: 360px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.85;
}
.preview-state-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
}
@media (hover: hover) {
  .preview-photo:hover :deep(img) {
    transform: scale(1.035);
  }
}
@media (max-width: 700px) {
  .preview-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 14px;
  }
  .preview-photo:first-child {
    grid-column: 1 / -1;
  }
  .preview-state-card {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .preview-state-content h3 {
    font-size: 21px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .preview-photo :deep(img) {
    transition: none;
  }
}
</style>
