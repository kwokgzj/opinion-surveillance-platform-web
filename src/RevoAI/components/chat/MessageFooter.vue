<template>
  <div class="footer-container" :class="[{ show: shouldShow }, footerClass]">
    <!-- 多候选切换UI -->
    <div v-if="isMultiCandidate" class="candidate-switcher">
      <div class="action-button" @click="switchCandidate(-1)">
        <left-outlined />
      </div>
      <span class="candidate-counter">{{ currentIndex + 1 }} / {{ total }}</span>
      <div class="action-button" @click="switchCandidate(1)">
        <right-outlined />
      </div>
    </div>

    <!-- 复制按钮 -->
    <a-tooltip :title="'复制'" :mouse-enter-delay="0.8">
      <div class="action-button" @click="onCopy">
        <template v-if="!copied">
          <copy-outlined />
        </template>
        <template v-else>
          <check-outlined style="color: var(--color-primary)" />
        </template>
      </div>
    </a-tooltip>

    <!-- 编辑按钮 -->
    <a-tooltip :title="'编辑'" :mouse-enter-delay="0.8">
      <div class="action-button" @click="onEdit">
        <edit-outlined />
      </div>
    </a-tooltip>

    <!-- 重新生成按钮 (仅AI消息) -->
    <a-tooltip v-if="isAssistantMessage" :title="'重新生成'" :mouse-enter-delay="0.8">
      <div class="action-button" @click="onRegenerate">
        <sync-outlined />
      </div>
    </a-tooltip>

    <!-- 删除按钮 (仅AI消息且有多候选) -->
    <a-popconfirm
      v-if="isAssistantMessage && isMultiCandidate"
      :title="'确定要删除此消息吗？'"
      :ok-button-props="{ danger: true }"
      @confirm="onDelete"
    >
      <template #icon>
        <question-circle-outlined style="color: red" />
      </template>
      <a-tooltip :title="'删除'" :mouse-enter-delay="0.8">
        <div class="action-button" @click.stop>
          <delete-outlined />
        </div>
      </a-tooltip>
    </a-popconfirm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import {
  CheckOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  CopyOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { Session } from '@/RevoAI/types'
import { Message } from '@/RevoAI/types/newMessage'
import { getMainTextContent } from '@/RevoAI/utils/messageUtils/find'
import { removeTrailingDoubleSpaces } from '@/RevoAI/utils/markdown'
import {
  regenerateAssistantMessage,
  switchAssistantCandidate,
  deleteSingleMessage,
} from '@/RevoAI/store/thunk/messageThunk'
import { useMessagesStore } from '@/RevoAI/store/newMessage'
import db from '@/RevoAI/databases'
import { cloneDeep } from 'lodash'

const props = defineProps<{
  message: Message
  session: Session
  isLastMessage: boolean
  isAssistantMessage: boolean
}>()

const emit = defineEmits(['edit-message', 'switch-candidate'])

const copied = ref(false)
const messagesStore = useMessagesStore()

// 显示条件：始终显示或者hover
const shouldShow = computed(() => props.isLastMessage)

// 根据消息类型设置不同的样式类
const footerClass = computed(() => {
  return {
    'footer-user': props.message.role === 'user',
    'footer-assistant': props.message.role === 'assistant',
  }
})

// 复制消息
const onCopy = (e: Event) => {
  e.stopPropagation()

  const contentToCopy = getMainTextContent(props.message)
  navigator.clipboard.writeText(removeTrailingDoubleSpaces(contentToCopy.trimStart()))

  message.success({ content: '已复制到剪贴板', key: 'copy-message' })
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

// 编辑消息
const onEdit = () => {
  // 触发父组件的编辑事件
  emit('edit-message', props.message.id)
}

// 重新生成AI消息
const onRegenerate = async (e: Event) => {
  e.stopPropagation()
  // 使用新的重新生成方法
  if (props.session && props.message.role === 'assistant') {
    await regenerateAssistantMessage(props.session.id, props.message)
  }
}

// 删除单个消息
const deleteMessage = async (messageId: string) => {
  if (!props.session?.id) return

  // 从内存中删除消息
  messagesStore.removeMessage({
    sessionId: props.session.id,
    messageId,
  })

  // 从数据库中删除消息
  try {
    const session = await db.sessions.get(props.session.id)
    if (session) {
      const updatedMessages = session.messages.filter((m) => m.id !== messageId)
      await db.sessions.update(props.session.id, {
        messages: cloneDeep(updatedMessages),
      })
    }
  } catch (error) {
    console.error('Failed to delete message from DB:', error)
  }
}

// 删除一组消息（基于askId）
const deleteGroupMessages = async (askId: string) => {
  if (!props.session?.id) return

  // 从内存中删除消息
  messagesStore.removeMessagesByAskId({
    sessionId: props.session.id,
    askId,
  })

  // 从数据库中删除消息
  try {
    const session = await db.sessions.get(props.session.id)
    if (session) {
      const updatedMessages = session.messages.filter((m) => m.askId !== askId)
      await db.sessions.update(props.session.id, {
        messages: cloneDeep(updatedMessages),
      })
    }
  } catch (error) {
    console.error('Failed to delete messages by askId from DB:', error)
  }
}

// 删除消息
const onDelete = async () => {
  if (!props.session) return

  if (props.message.role === 'user') {
    // 用户消息直接删除整个消息及其关联的回复
    await deleteMessage(props.message.id)
    await deleteGroupMessages(props.message.id)
  } else if (
    props.isAssistantMessage &&
    props.message.candidates &&
    props.message.candidates.length > 1
  ) {
    // 助手消息且有多个候选时，只删除当前候选
    const message = messagesStore.entities[props.message.id]
    if (!message) return

    const currentIndex = message.currentCandidateIndex ?? 0
    const candidates = [...message.candidates]

    // 移除当前候选
    candidates.splice(currentIndex, 1)

    // 计算新的索引
    let newIndex = currentIndex
    if (newIndex >= candidates.length) {
      newIndex = candidates.length - 1
    }
    if (newIndex < 0) {
      newIndex = 0
    }

    // 更新消息
    const newBlocks = candidates.length > 0 ? candidates[newIndex] : []

    messagesStore.updateMessage({
      sessionId: props.session.id,
      messageId: props.message.id,
      updates: {
        candidates: candidates.length > 0 ? candidates : undefined,
        currentCandidateIndex: candidates.length > 0 ? newIndex : undefined,
        blocks: newBlocks,
      },
    })

    // 如果没有候选了，删除整个消息
    if (candidates.length === 0) {
      await deleteMessage(props.message.id)
    } else {
      // 否则更新数据库
      try {
        const session = await db.sessions.get(props.session.id)
        if (session) {
          const messageIndex = session.messages.findIndex((m) => m.id === props.message.id)
          if (messageIndex !== -1) {
            session.messages[messageIndex].candidates = candidates
            session.messages[messageIndex].currentCandidateIndex = newIndex
            session.messages[messageIndex].blocks = newBlocks
            await db.sessions.update(props.session.id, {
              messages: cloneDeep(session.messages),
            })
          }
        }
      } catch (error) {
        console.error('Failed to update message candidates in DB:', error)
      }
    }
  } else {
    // 没有多个候选时，直接删除整个消息
    await deleteMessage(props.message.id)
  }
}

// 多候选切换相关
const isMultiCandidate = computed(
  () => props.isAssistantMessage && props.message.candidates && props.message.candidates.length > 1,
)
const currentIndex = computed(() => props.message.currentCandidateIndex ?? 0)
const total = computed(() => props.message.candidates?.length ?? 1)

// 切换候选
const switchCandidate = async (direction: number) => {
  if (props.session && props.message.id) {
    // 使用新的切换候选方法
    const switchFn = switchAssistantCandidate(props.session.id, props.message.id, direction)
    await switchFn()
  }
}
</script>

<style lang="scss" scoped>
.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start; /* 默认从左边开始 */
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  &.show {
    opacity: 1;
  }

  &:hover {
    opacity: 1;
  }
}

.footer-user {
  justify-content: flex-end; /* 用户消息的操作按钮靠右 */
}

.footer-assistant {
  justify-content: flex-start; /* 助手消息的操作按钮靠左 */
}

.action-button {
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-bg-2);
    color: var(--color-text-1);
  }

  :deep(.anticon) {
    font-size: 14px;
    color: var(--color-text-3);
  }

  &:hover :deep(.anticon) {
    color: var(--color-text-1);
  }
}

.candidate-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.candidate-counter {
  min-width: 40px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-2);
}
</style>
