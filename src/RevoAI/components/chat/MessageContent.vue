<template>
  <div class="message-content" :class="messageClass">
    <div class="message-blocks">
      <MessageBlockRenderer
        v-for="blockId in blocks"
        :key="blockId"
        :blockId="blockId"
        :role="message.role"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/RevoAI/types/newMessage'
import MessageBlockRenderer from '@/RevoAI/components/chat/blocks/MessageBlockRenderer.vue'

const props = defineProps<{
  message: Message
}>()

const blocks = computed(() => props.message.blocks || [])

const messageClass = computed(() => {
  return {
    'message-user': props.message.role === 'user',
    'message-assistant': props.message.role === 'assistant',
    'message-system': props.message.role === 'system',
  }
})
</script>

<style scoped>
.message-content {
  width: 100%;
}

.message-assistant {
  padding: 0;
  text-align: left;
}

.message-system {
  background-color: #f0f0f0;
  font-style: italic;
  text-align: center;
}

.message-blocks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-empty {
  color: #888;
  font-style: italic;
}
</style>
