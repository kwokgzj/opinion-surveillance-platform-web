import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'
import { useMessagesStore } from '@/RevoAI/store/newMessage'
import { useMessageBlocksStore } from '@/RevoAI/store/messageBlock'
import { computed } from 'vue'
import type { Session } from '@/RevoAI/types'
import type { Message, MessageBlock } from '@/RevoAI/types/newMessage'
import { MessageBlockStatus, MessageBlockType } from '@/RevoAI/types/newMessage'
import { abortCompletion } from '@/RevoAI/utils/abortController'
import {
  sendMessage,
  clearSessionMessages as clearSessionMessagesThunk,
} from '@/RevoAI/store/thunk/messageThunk'

/**
 * Hook 提供针对特定会话的消息操作方法。 / Hook providing various operations for messages within a specific session.
 * @param session 当前会话对象。 / The current session object.
 * @returns 包含消息操作函数的对象。 / An object containing message operation functions.
 */
export function useMessageOperations(session?: Session | null) {
  const messagesStore = useMessagesStore()

  /**
   * 删除单个消息。 / Deletes a single message.
   */
  const deleteMessage = async (id: string) => {
    if (!session?.id) return
    messagesStore.removeMessage({ sessionId: session.id, messageId: id })
    // 这里可能需要添加删除消息相关文件的逻辑
  }

  /**
   * 删除一组消息（基于 askId）。 / Deletes a group of messages (based on askId).
   */
  const deleteGroupMessages = async (askId: string) => {
    if (!session?.id) return
    messagesStore.removeMessagesByAskId({ sessionId: session.id, askId })
    // 这里可能需要添加删除消息相关文件的逻辑
  }

  /**
   * 编辑消息。 / Edits a message.
   */
  const editMessage = async (
    messageId: string,
    updates: Partial<Omit<Message, 'id' | 'sessionId' | 'blocks'>>,
  ) => {
    if (!session?.id) {
      console.error('[editMessage] Session prop is not valid.')
      return
    }
    const messageUpdates: Partial<Message> & Pick<Message, 'id'> = {
      id: messageId,
      updatedAt: new Date().toISOString(),
      ...updates,
    }
    messagesStore.updateMessage({
      sessionId: session.id,
      messageId,
      updates: messageUpdates,
    })
  }

  /**
   * 重新发送用户消息，触发其所有助手回复的重新生成。 / Resends a user message, triggering regeneration of all its assistant responses.
   */
  const resendMessage = async (message: Message, sessionArg: Session) => {
    if (!session?.id) return
    // 这里需要实现重新发送消息的逻辑
    // 可能需要调用 API 服务
  }

  /**
   * 清除当前或指定会话所有消息。 / Clears all messages for the current or specified session.
   */
  const clearSessionMessages = async (_sessionId?: string) => {
    if (!session?.id) return
    const sessionIdToClear = _sessionId || session.id
    // 调用thunk中的clearSessionMessages函数，确保同时清理messageBlocks
    await clearSessionMessagesThunk(sessionIdToClear)()
  }

  /**
   * 发出事件以表示创建新上下文（清空消息 UI）。 / Emits an event to signal creating a new context (clearing messages UI).
   */
  const createNewContext = async () => {
    EventEmitter.emit(EVENT_NAMES.NEW_CONTEXT)
  }

  const displayCount = computed(() => messagesStore.getDisplayCount)

  /**
   * 暂停当前会话正在进行的消息生成。 / Pauses ongoing message generation for the current session.
   */
  const pauseMessages = async () => {
    console.log('pauseMessages', session)
    if (!session?.id) return
    const sessionMessages = messagesStore.getMessagesForSession(session.id)
    if (!sessionMessages) return
    const streamingMessages = sessionMessages.filter(
      (m) => m.status === 'processing' || m.status === 'pending',
    )
    const askIds = [
      ...new Set(streamingMessages?.map((m) => m.askId).filter((id) => !!id) as string[]),
    ]
    console.log('askIds', askIds)
    for (const askId of askIds) {
      abortCompletion(askId)
    }
    messagesStore.setSessionLoading({
      sessionId: session.id,
      loading: false,
    })
  }

  /**
   * 恢复/重发用户消息（目前复用 resendMessage 逻辑）。 / Resumes/Resends a user message (currently reuses resendMessage logic).
   */
  const resumeMessage = async (message: Message, sessionArg: Session) => {
    if (!session?.id) return
    return resendMessage(message, sessionArg)
  }

  /**
   * 使用指定模型追加一个新的助手回复，回复与现有助手消息相同的用户查询。 / Appends a new assistant response using a specified model, replying to the same user query as an existing assistant message.
   */
  const appendAssistantResponse = async (
    existingAssistantMessage: Message,
    sessionArg: Session,
  ) => {
    if (!session?.id) return
    if (existingAssistantMessage.role !== 'assistant') {
      console.error(
        'appendAssistantResponse should only be called for an existing assistant message.',
      )
      return
    }
    // 这里需要实现追加助手回复的逻辑
    // 可能需要调用 API 服务
  }

  return {
    deleteMessage,
    deleteGroupMessages,
    editMessage,
    resendMessage,
    clearSessionMessages,
    createNewContext,
    displayCount,
    pauseMessages,
    resumeMessage,
    appendAssistantResponse,
  }
}
