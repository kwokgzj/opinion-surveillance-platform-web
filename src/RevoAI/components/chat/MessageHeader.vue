<template>
  <div class="message-header" :class="headerClass">
    <div class="message-role">{{ roleDisplay }}</div>
    <div class="message-time">{{ formattedTime }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/RevoAI/types/newMessage'

const props = defineProps<{
  message: Message
}>()

const roleDisplay = computed(() => {
  switch (props.message.role) {
    case 'user':
      return '用户'
    case 'assistant':
      return props.message.modelDisplayName
        ? `Revo AI(${props.message.modelDisplayName})`
        : 'Revo AI'
    default:
      return props.message.role
  }
})

const formattedTime = computed(() => {
  if (!props.message.createdAt) return ''

  try {
    const date = new Date(props.message.createdAt)
    return date.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (e) {
    return ''
  }
})

const headerClass = computed(() => {
  return {
    'header-user': props.message.role === 'user',
    'header-assistant': props.message.role === 'assistant',
  }
})
</script>

<style scoped>
.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 0.9rem;
  gap: 10px;
}

.header-user {
  flex-direction: row-reverse;
}

.header-assistant {
  flex-direction: row;
}

.message-role {
  font-weight: 500;
}

.message-time {
  color: #888;
  font-size: 0.8rem;
}
</style>
