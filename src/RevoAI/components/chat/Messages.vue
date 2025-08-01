<template>
  <div class="messages-container" ref="messagesContainerRef">
    <div class="messages-list">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{
          'message-item-user': message.role === 'user',
          'message-item-assistant': message.role === 'assistant',
        }"
      >
        <MessageHeader :message="message" />
        <template v-if="editingMessageId === message.id">
          <MessageEditor :message="message" @save="saveEditedMessage" @cancel="cancelEditing" />
        </template>
        <template v-else>
          <MessageContent :message="message" />
        </template>
        <MessageFooter
          v-if="currentSession"
          :message="message"
          :session="currentSession"
          :isLastMessage="message.id === messages[messages.length - 1].id"
          :isAssistantMessage="message.role === 'assistant'"
          @edit-message="startEditing"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref, nextTick, onBeforeUnmount } from 'vue'
import { useMessagesStore } from '@/RevoAI/store/newMessage'
import {
  loadSessionMessages,
  sendMessage,
  // clearSessionMessages, // 暂时不需要，避免误清空
  resendEditedUserMessage,
} from '@/RevoAI/store/thunk/messageThunk'
import MessageHeader from '@/RevoAI/components/chat/MessageHeader.vue'
import MessageContent from '@/RevoAI/components/chat/MessageContent.vue'
import MessageFooter from '@/RevoAI/components/chat/MessageFooter.vue'
import MessageEditor from '@/RevoAI/components/chat/MessageEditor.vue'
import { useSessionsStore } from '@/RevoAI/store/sessions'
import { getUserMessage } from '@/RevoAI/services/MessagesService'
import { useMessageBlocksStore } from '@/RevoAI/store/messageBlock'
import { MessageBlockType, MessageBlockStatus } from '@/RevoAI/types/newMessage'
import db from '@/RevoAI/databases'
import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'
import { debounce } from 'lodash'

const props = defineProps<{
  sessionId: string
}>()

const messagesStore = useMessagesStore()
const sessionsStore = useSessionsStore()
const messageBlocksStore = useMessageBlocksStore()
const messagesContainerRef = ref<HTMLElement | null>(null)

// 存储每个会话的滚动位置
const sessionScrollPositions = ref<Record<string, number | 'bottom'>>({})

// 编辑消息相关
const editingMessageId = ref<string | null>(null)

// 开始编辑消息
const startEditing = (messageId: string) => {
  editingMessageId.value = messageId
}

// 保存编辑后的消息
const saveEditedMessage = async (messageId: string, content: string) => {
  if (!currentSession.value) return

  const message = messagesStore.getMessageById(messageId)
  if (!message) return

  // 如果是用户消息，使用resendEditedUserMessage函数
  if (message.role === 'user') {
    await resendEditedUserMessage(props.sessionId, message, content)
  } else {
    // 如果是助手消息，只更新消息内容
    const messageBlocksStore = useMessageBlocksStore()

    // 找到主文本块并更新内容
    if (message.blocks && message.blocks.length > 0) {
      // 找到主文本块
      const mainTextBlockId = message.blocks.find((blockId) => {
        const block = messageBlocksStore.selectById(blockId)
        return block?.type === MessageBlockType.MAIN_TEXT
      })

      if (mainTextBlockId) {
        const updatedBlock = {
          content,
          updatedAt: new Date().toISOString(),
        }

        // 更新Redux状态
        messageBlocksStore.updateOneBlock({
          id: mainTextBlockId,
          changes: updatedBlock,
        })

        // 更新数据库
        try {
          await db.message_blocks.update(mainTextBlockId, updatedBlock)

          // 更新消息的updatedAt字段
          const messageUpdate = {
            updatedAt: new Date().toISOString(),
          }

          messagesStore.updateMessage({
            sessionId: props.sessionId,
            messageId,
            updates: messageUpdate,
          })

          // 同步更新会话中的消息和会话的updatedAt字段
          const session = await db.sessions.get(props.sessionId)
          if (session) {
            const messageIndex = session.messages.findIndex((m) => m.id === messageId)
            if (messageIndex !== -1) {
              session.messages[messageIndex].updatedAt = new Date().toISOString()

              // 更新会话的updatedAt字段，确保会话排序正确
              const currentTime = new Date().toISOString()
              await db.sessions.update(props.sessionId, {
                messages: session.messages,
                updatedAt: currentTime,
              })
            }
          }
        } catch (error) {
          console.error('Failed to update message block in DB:', error)
        }
      }
    }
  }

  // 结束编辑状态
  editingMessageId.value = null
}

// 取消编辑
const cancelEditing = () => {
  editingMessageId.value = null
}

const loading = computed(() => messagesStore.loadingBySession[props.sessionId] || false)
const messages = computed(() => messagesStore.getMessagesForSession(props.sessionId))
const currentSession = computed(() => sessionsStore.getSessionById(props.sessionId))

// 滚动到底部的函数
const scrollToBottom = () => {
  if (messagesContainerRef.value) {
    nextTick(() => {
      messagesContainerRef.value!.scrollTop = messagesContainerRef.value!.scrollHeight
    })
  }
}

// 保存当前会话的滚动位置
const saveScrollPosition = () => {
  if (messagesContainerRef.value && props.sessionId) {
    const scrollTop = messagesContainerRef.value.scrollTop
    const scrollHeight = messagesContainerRef.value.scrollHeight
    const clientHeight = messagesContainerRef.value.clientHeight

    // 只有当用户实际滚动过（不在底部）时才保存位置
    // 如果在底部或接近底部，则不保存具体位置，这样切换回来时会自动滚到底部
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10

    sessionScrollPositions.value[props.sessionId] = isAtBottom ? 'bottom' : scrollTop

    console.log(`保存会话 ${props.sessionId} 的滚动位置:`, isAtBottom ? 'bottom' : scrollTop)
  }
}

// 恢复会话的滚动位置
const restoreScrollPosition = () => {
  if (!messagesContainerRef.value || !props.sessionId) return

  const savedPosition = sessionScrollPositions.value[props.sessionId]

  nextTick(() => {
    if (!messagesContainerRef.value) return

    if (savedPosition === 'bottom' || savedPosition === undefined) {
      // 如果保存的是"底部"标记或没有保存的位置，滚动到底部
      scrollToBottom()
      console.log(`恢复会话 ${props.sessionId} 的滚动位置: 底部`)
    } else {
      // 恢复到保存的具体位置
      messagesContainerRef.value.scrollTop = savedPosition
      console.log(`恢复会话 ${props.sessionId} 的滚动位置:`, savedPosition)
    }
  })
}

// 监听会话 ID 变化，加载对应会话的消息
watch(
  () => props.sessionId,
  async (newSessionId, oldSessionId) => {
    // 保存旧会话的滚动位置
    if (oldSessionId) {
      saveScrollPosition()
    }

    if (newSessionId) {
      // 先设置加载状态
      messagesStore.setSessionLoading({
        sessionId: newSessionId,
        loading: true,
      })

      // 加载新会话的消息
      await loadSessionMessages(newSessionId)

      // 设置加载完成
      messagesStore.setSessionLoading({
        sessionId: newSessionId,
        loading: false,
      })

      // 恢复新会话的滚动位置
      restoreScrollPosition()
    }
  },
  { immediate: true },
)

// 监听当前会话的变化，确保消息同步
// 注释掉自动清空逻辑，避免在切换模型/设置时意外清空消息
// watch(
//   () => currentSession.value,
//   async (newSession) => {
//     if (newSession && Array.isArray(newSession.messages) && newSession.messages.length === 0) {
//       // 如果会话存在但消息数组为空，清理消息存储
//       await clearSessionMessages(props.sessionId)()
//     }
//   },
//   { deep: true },
// )

// 监听消息变化，如果是当前会话的最新消息，滚动到底部
watch(
  () => messages.value,
  (newMessages, oldMessages) => {
    // 如果是新增消息，滚动到底部
    if (newMessages.length > (oldMessages?.length || 0)) {
      scrollToBottom()
    }
  },
  { deep: true },
)

// 监听消息块状态变化，当有流式内容更新时滚动到底部
watch(
  () => messageBlocksStore.entities,
  () => {
    // 检查当前会话的最后一条消息是否是助手消息且正在生成中
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      const isGenerating = lastMessage.blocks?.some((blockId) => {
        const block = messageBlocksStore.selectById(blockId)
        return (
          block?.status === MessageBlockStatus.STREAMING ||
          block?.status === MessageBlockStatus.PROCESSING
        )
      })

      if (isGenerating) {
        scrollToBottom()
      }
    }
  },
  { deep: true },
)

// 监听loading状态，当loading变为false时滚动到底部
watch(
  () => loading.value,
  (newLoading) => {
    if (!newLoading) {
      scrollToBottom()
    }
  },
)

// 监听消息块更新事件
const onMessageBlockUpdated = () => {
  // 检查当前会话的最后一条消息是否是助手消息
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage && lastMessage.role === 'assistant') {
    scrollToBottom()
  }
}

// 组件挂载时加载消息
onMounted(async () => {
  if (props.sessionId) {
    // 先设置加载状态
    messagesStore.setSessionLoading({
      sessionId: props.sessionId,
      loading: true,
    })

    // 加载会话消息
    await loadSessionMessages(props.sessionId)

    // 设置加载完成
    messagesStore.setSessionLoading({
      sessionId: props.sessionId,
      loading: false,
    })

    // 恢复滚动位置或滚动到底部
    nextTick(() => {
      if (sessionScrollPositions.value[props.sessionId]) {
        restoreScrollPosition()
      } else {
        scrollToBottom()
      }
    })
  }

  // 添加滚动事件监听器，记录滚动位置
  if (messagesContainerRef.value) {
    // 使用防抖函数来减少保存滚动位置的频率
    const debouncedSavePosition = debounce(saveScrollPosition, 200)
    messagesContainerRef.value.addEventListener('scroll', debouncedSavePosition)
  }

  // 监听消息块更新事件
  EventEmitter.on(EVENT_NAMES.MESSAGE_BLOCK_UPDATED, onMessageBlockUpdated)
})

// 组件卸载前保存滚动位置
onBeforeUnmount(() => {
  // 保存当前会话的滚动位置
  if (props.sessionId) {
    saveScrollPosition()
  }

  // 移除滚动事件监听器
  if (messagesContainerRef.value) {
    const debouncedSavePosition = debounce(saveScrollPosition, 200)
    messagesContainerRef.value.removeEventListener('scroll', debouncedSavePosition)
  }

  // 移除消息块更新事件监听
  EventEmitter.off(EVENT_NAMES.MESSAGE_BLOCK_UPDATED, onMessageBlockUpdated)
})

// 发送消息的方法
const handleSendMessage = async (content: string) => {
  if (!currentSession.value || !content.trim()) return

  const { message, blocks } = getUserMessage({
    session: currentSession.value,
    content,
  })

  await sendMessage(message, blocks, currentSession.value)
  scrollToBottom()
}

defineExpose({
  handleSendMessage,
})
</script>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  padding: 20px 0;
}

.loading,
.empty-messages {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.message-item {
  padding: 0.5rem;
  border-radius: 0.5rem;
  max-width: 52vw;
}

.message-item-user {
  align-self: flex-end;
}

.message-item-assistant {
  align-self: flex-start;
}
</style>
