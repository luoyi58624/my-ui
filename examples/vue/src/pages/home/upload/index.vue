<script setup lang="ts">
import DemoExample from '../../../components/DemoExample.vue'
import { ref } from 'vue'
import { Button, Card, Upload, type UploadFile, type UploadRequest } from '@my-ui/vue'

// #region upload-auto
const files = ref<UploadFile[]>([
  {
    id: 'cover',
    name: '旅行封面.svg',
    type: 'image/svg+xml',
    size: 896,
    url: '/images/lake.svg',
    status: 'success'
  }
])
const uploader = ref<InstanceType<typeof Upload>>()
// #endregion
// #region upload-manual
const manualFiles = ref<UploadFile[]>([])
const manual = ref<InstanceType<typeof Upload>>()
// #endregion
const failOnce = new WeakSet<File>()
let next = 0
const simulate: UploadRequest = (file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    let percentage = 0
    const cleanup = () => {
      clearInterval(timer)
      signal.removeEventListener('abort', abort)
    }
    const abort = () => {
      cleanup()
      reject(new DOMException('已取消', 'AbortError'))
    }
    const timer = setInterval(() => {
      percentage += 10
      onProgress(percentage)
      if (percentage >= 100) {
        cleanup()
        if (failOnce.delete(file)) reject(new Error('连接中断，点击重试继续上传'))
        else resolve({ name: file.name })
      }
    }, 160)
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
  })
// #region upload-auto
function example(failed = false) {
  const file = new File(
    ['把日常的灵感记下来。'],
    `${failed ? '等待重试的笔记' : '周末的灵感'}-${++next}.txt`,
    { type: 'text/plain' }
  )
  if (failed) failOnce.add(file)
  uploader.value?.addFiles([file])
}
// #endregion
// #region upload-manual
function addManual() {
  manual.value?.addFiles([
    new File(['稍后再上传。'], `待上传的笔记-${++next}.txt`, { type: 'text/plain' })
  ])
}
// #endregion
</script>

<template>
  <section id="upload">
    <div class="upload-examples">
      <DemoExample
        name="upload-auto"
        source="pages/home/upload/index.vue"
        title="拖放与自动上传"
        description="drag 开启拖放，request 处理上传过程，支持进度、失败重试与文件限制。"
      >
        <Upload
          ref="uploader"
          v-model="files"
          multiple
          drag
          :max-count="3"
          :max-size="5 * 1024 * 1024"
          accept="image/*,.pdf,.txt"
          :request="simulate"
          hint="图片、PDF 或文本 · 每个最多 5 MB · 最多 3 个"
          label="上传附件"
        />
        <div class="upload-example-actions">
          <Button variant="text" @click="example()">添加示例文件</Button>
          <Button variant="text" @click="example(true)">体验失败重试</Button>
          <Button variant="text" :disabled="!files.length" @click="files = []">清空</Button>
        </div>
      </DemoExample>
      <DemoExample
        name="upload-manual"
        source="pages/home/upload/index.vue"
        title="手动上传"
        description="关闭 auto-upload 后先选择文件，再通过实例的 submit 与 abort 控制上传。"
      >
        <Upload
          ref="manual"
          v-model="manualFiles"
          multiple
          :max-count="3"
          :auto-upload="false"
          :request="simulate"
          accept=".txt"
          hint="支持文本文件，选择后可手动开始"
          label="待上传文本"
        />
        <div class="upload-example-actions">
          <Button variant="outline" @click="addManual">添加文本示例</Button>
          <Button
            :disabled="
              !manualFiles.some((file) =>
                ['ready', 'error', 'canceled'].includes(file.status ?? 'ready')
              )
            "
            @click="manual?.submit()"
          >
            开始上传
          </Button>
          <Button
            v-if="manualFiles.some((file) => file.status === 'uploading')"
            variant="text"
            @click="manual?.abort()"
          >
            取消上传
          </Button>
        </div>
        <p>上传中可以取消并保留文件，也可以移除。失败后点击重试，文件会重新开始上传。</p>
      </DemoExample>
    </div>
    <p class="upload-demo-note">这里演示上传过程，文件留在本页，不会发送到服务器。</p>
  </section>
</template>

<style scoped>
#upload {
  scroll-margin-top: 110px;
}
.upload-examples {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  align-items: start;
  gap: 28px 40px;
}
.upload-examples section {
  min-width: 0;
}
.upload-examples h4 {
  margin: 0 0 20px;
  font-size: 14px;
}
.upload-example-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}
.upload-examples p,
.upload-demo-note {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.8;
}
.upload-examples p {
  margin: 20px 0 0;
}
.upload-demo-note {
  margin: 24px 0 0;
}
@media (max-width: 760px) {
  .upload-examples {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
