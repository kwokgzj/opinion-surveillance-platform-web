<template>
  <div class="error-block">
    <a-alert :message="errorMessage" type="error" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MessageBlock } from '@/RevoAI/types/newMessage'

const props = defineProps<{
  block: MessageBlock
  message?: any
}>()

// 获取错误信息
const errorMessage = computed(() => {
  const block = props.block as any
  if (block?.content) return block.content
  if (block?.error?.message) {
    if (block.error.message.indexOf('pause') > -1) {
      return '请求已终止'
    }
  }
  return '发生错误'
})
</script>

<style scoped>
.error-block {
  width: 100%;
  max-width: 50vw;
}
</style>
