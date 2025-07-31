<template>
  <div>
    <a-button class="file-block" @click="showFileContent" type="text">
      <template #icon>
        <PaperclipIcon class="file-icon" :size="14" />
      </template>
      <div class="file-name">
        <span class="file-name-text">{{ fileNameWithoutExt }}</span>
        <span class="file-extension">{{ fileExtension }}</span>
      </div>
    </a-button>

    <!-- 文件内容弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="fileName"
      :width="800"
      :footer="null"
      @cancel="modalVisible = false"
    >
      <div class="file-content-container">
        <pre class="file-content">{{ fileContent }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { PaperclipIcon } from 'lucide-vue-next'
import type { MessageBlock } from '@/RevoAI/types/newMessage'

const props = defineProps<{
  block: MessageBlock
  message?: any
}>()

// 弹窗状态
const modalVisible = ref(false)

// 获取文件名和扩展名
const fileName = computed(() => {
  const block = props.block as any
  return block?.file?.name || '文件'
})

const fileNameParts = computed(() => {
  const name = fileName.value
  const lastDotIndex = name.lastIndexOf('.')

  if (lastDotIndex !== -1) {
    return {
      nameWithoutExt: name.substring(0, lastDotIndex),
      extension: name.substring(lastDotIndex),
    }
  } else {
    return {
      nameWithoutExt: name,
      extension: '',
    }
  }
})

const fileNameWithoutExt = computed(() => fileNameParts.value.nameWithoutExt)
const fileExtension = computed(() => fileNameParts.value.extension)

// 获取文件内容
const fileContent = computed(() => {
  const block = props.block as any
  return block?.file?.content || ''
})

// 显示文件内容
const showFileContent = () => {
  modalVisible.value = true
}

// 下载文件
const downloadFile = () => {
  const block = props.block as any
  if (!block?.file) return

  // 如果有URL，直接打开
  if (block.file.url) {
    window.open(block.file.url, '_blank')
    return
  }

  // 如果有base64，创建下载链接
  if (block.file.base64) {
    const link = document.createElement('a')
    link.href = block.file.base64
    link.download = block.file.name
    link.click()
  }
}
</script>

<style scoped>
.file-block {
  max-width: 100%;
  color: var(--color-text-2);
  display: flex;
}

.file-icon {
  margin-right: 4px;
  margin-top: 0;
}

.file-name {
  display: flex;
  max-width: 160px;
  overflow: hidden;
}

.file-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.file-extension {
  white-space: nowrap;
  flex-shrink: 0;
}

.file-content-container {
  max-height: 600px;
  overflow: auto;
}

.file-content {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  padding: 12px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  overflow: auto;
}

.image-container {
  text-align: center;
}

.image-container img {
  max-width: 100%;
  max-height: 500px;
}

.unsupported-file {
  text-align: center;
  padding: 40px 0;
}
</style>
