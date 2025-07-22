<template>
  <div class="message-block-renderer">
    <component :is="blockComponent" v-if="blockId" :block="block" :role="role" />
    <div v-else class="block-not-found">块不存在 (ID: {{ blockId }})</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessageBlocksStore } from '@/RevoAI/store/messageBlock'
import { MessageBlockType, MessageBlockStatus } from '@/RevoAI/types/newMessage'
import MainTextBlock from '@/RevoAI/components/chat/blocks/MainTextBlock.vue'
import ThinkingBlock from '@/RevoAI/components/chat/blocks/ThinkingBlock.vue'
import ImageBlock from '@/RevoAI/components/chat/blocks/ImageBlock.vue'
import FileBlock from '@/RevoAI/components/chat/blocks/FileBlock.vue'
import ErrorBlock from '@/RevoAI/components/chat/blocks/ErrorBlock.vue'
import ToolBlock from '@/RevoAI/components/chat/blocks/ToolBlock.vue'
import CitationBlock from '@/RevoAI/components/chat/blocks/CitationBlock.vue'
import PlaceholderBlock from '@/RevoAI/components/chat/blocks/PlaceholderBlock.vue'

const props = defineProps<{
  blockId: string
  role: string
}>()

const messageBlocksStore = useMessageBlocksStore()
const block = computed(() => messageBlocksStore.selectById(props.blockId))

const blockComponent = computed(() => {
  if (!block.value) return PlaceholderBlock
  switch (block.value.type) {
    case MessageBlockType.MAIN_TEXT:
    case MessageBlockType.CODE:
      return MainTextBlock
    case MessageBlockType.THINKING:
      return ThinkingBlock
    case MessageBlockType.IMAGE:
      return ImageBlock
    case MessageBlockType.FILE:
      return FileBlock
    case MessageBlockType.ERROR:
      return ErrorBlock
    case MessageBlockType.TOOL:
      return ToolBlock
    case MessageBlockType.CITATION:
      return CitationBlock
    default:
      return PlaceholderBlock
  }
})
</script>

<style scoped>
.message-block-renderer {
  width: 100%;
}

.block-not-found {
  padding: 8px;
  color: #ff4d4f;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
