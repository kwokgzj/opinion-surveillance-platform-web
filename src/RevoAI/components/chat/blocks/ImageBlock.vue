<template>
  <div class="image-block">
    <a-image :src="imageUrl" :alt="imageAlt" />
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { MessageBlock } from '@/RevoAI/types/newMessage'
import { Modal } from 'ant-design-vue'

const props = defineProps<{
  block: MessageBlock
  message?: any
}>()

// 获取图片URL
const imageUrl = computed(() => {
  const block = props.block as any
  return block?.file.url || ''
})

// 获取图片替代文本
const imageAlt = computed(() => {
  const block = props.block as any
  return block?.file?.name || '图片'
})
</script>

<style scoped>
.image-block {
  width: 100%;
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
