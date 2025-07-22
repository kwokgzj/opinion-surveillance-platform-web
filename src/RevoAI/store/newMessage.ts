import { defineStore } from 'pinia'
import { type Message, AssistantMessageStatus, MessageBlockStatus } from '@/RevoAI/types/newMessage'

// 定义状态接口
export interface MessagesState {
  entities: Record<string, Message>
  ids: string[]
  messageIdsBySession: Record<string, string[]> // Map: sessionId -> ordered message IDs
  currentSessionId: string | null
  loadingBySession: Record<string, boolean>
  displayCount: number
}

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    entities: {} as Record<string, Message>,
    ids: [] as string[],
    messageIdsBySession: {} as Record<string, string[]>,
    currentSessionId: null as string | null,
    loadingBySession: {} as Record<string, boolean>,
    displayCount: 20,
  }),

  actions: {
    setCurrentSessionId(sessionId: string | null) {
      this.currentSessionId = sessionId
      if (sessionId && !(sessionId in this.messageIdsBySession)) {
        this.messageIdsBySession[sessionId] = []
        this.loadingBySession[sessionId] = false
      }
    },

    setSessionLoading(payload: { sessionId: string; loading: boolean }) {
      const { sessionId, loading } = payload
      this.loadingBySession[sessionId] = loading
    },

    setDisplayCount(count: number) {
      this.displayCount = count
    },

    messagesReceived(payload: { sessionId: string; messages: Message[] }) {
      const { sessionId, messages } = payload

      // 更新实体
      messages.forEach((message) => {
        this.entities[message.id] = message
        if (!this.ids.includes(message.id)) {
          this.ids.push(message.id)
        }
      })

      // 更新会话消息ID列表
      this.messageIdsBySession[sessionId] = messages.map((m) => m.id)
      this.currentSessionId = sessionId
    },

    addMessage(payload: { sessionId: string; message: Message }) {
      const { sessionId, message } = payload

      // 添加到实体
      this.entities[message.id] = message
      if (!this.ids.includes(message.id)) {
        this.ids.push(message.id)
      }

      // 更新会话消息ID列表
      if (!this.messageIdsBySession[sessionId]) {
        this.messageIdsBySession[sessionId] = []
      }
      this.messageIdsBySession[sessionId].push(message.id)

      if (!(sessionId in this.loadingBySession)) {
        this.loadingBySession[sessionId] = false
      }
    },

    insertMessageAtIndex(payload: { sessionId: string; message: Message; index: number }) {
      const { sessionId, message, index } = payload

      // 添加到实体
      this.entities[message.id] = message
      if (!this.ids.includes(message.id)) {
        this.ids.push(message.id)
      }

      // 在指定位置插入ID
      if (!this.messageIdsBySession[sessionId]) {
        this.messageIdsBySession[sessionId] = []
      }

      // 确保索引在范围内
      const safeIndex = Math.max(0, Math.min(index, this.messageIdsBySession[sessionId].length))
      this.messageIdsBySession[sessionId].splice(safeIndex, 0, message.id)

      if (!(sessionId in this.loadingBySession)) {
        this.loadingBySession[sessionId] = false
      }
    },

    updateMessage(payload: {
      sessionId: string
      messageId: string
      updates: Partial<Message> & {
        blockInstruction?: { id: string; position?: number }
      }
    }) {
      const { messageId, updates } = payload
      const { blockInstruction, ...otherUpdates } = updates

      if (blockInstruction) {
        const messageToUpdate = this.entities[messageId]
        if (messageToUpdate) {
          const { id: blockIdToAdd, position } = blockInstruction
          const currentBlocks = [...(messageToUpdate.blocks || [])]
          if (!currentBlocks.includes(blockIdToAdd)) {
            if (typeof position === 'number' && position >= 0 && position <= currentBlocks.length) {
              currentBlocks.splice(position, 0, blockIdToAdd)
            } else {
              currentBlocks.push(blockIdToAdd)
            }

            // 更新消息
            this.entities[messageId] = {
              ...this.entities[messageId],
              ...otherUpdates,
              blocks: currentBlocks,
            }
          } else {
            if (Object.keys(otherUpdates).length > 0) {
              this.entities[messageId] = {
                ...this.entities[messageId],
                ...otherUpdates,
              }
            }
          }
        } else {
          console.warn(`[updateMessage] Message ${messageId} not found in entities.`)
        }
      } else {
        this.entities[messageId] = {
          ...this.entities[messageId],
          ...otherUpdates,
        }
      }
    },

    clearSessionMessages(sessionId: string) {
      const idsToRemove = this.messageIdsBySession[sessionId] || []

      // 删除实体
      idsToRemove.forEach((id) => {
        delete this.entities[id]
      })

      // 从 ids 中移除
      this.ids = this.ids.filter((id) => !idsToRemove.includes(id))

      // 清理会话数据
      delete this.messageIdsBySession[sessionId]
      this.loadingBySession[sessionId] = false

      // 如果清理的是当前会话，则清理 currentSessionId
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null
      }
    },

    removeMessage(payload: { sessionId: string; messageId: string }) {
      const { sessionId, messageId } = payload

      // 从实体中删除
      delete this.entities[messageId]

      // 从 ids 中移除
      this.ids = this.ids.filter((id) => id !== messageId)

      // 从会话消息列表中移除
      if (this.messageIdsBySession[sessionId]) {
        this.messageIdsBySession[sessionId] = this.messageIdsBySession[sessionId].filter(
          (id) => id !== messageId,
        )
      }
    },

    removeMessagesByAskId(payload: { sessionId: string; askId: string }) {
      const { sessionId, askId } = payload

      // 找出要删除的消息ID
      const messagesToRemove = Object.values(this.entities)
        .filter((msg: Message) => msg.sessionId === sessionId && msg.askId === askId)
        .map((msg: Message) => msg.id)

      // 删除消息
      messagesToRemove.forEach((messageId) => {
        delete this.entities[messageId]
      })

      // 更新 ids
      this.ids = this.ids.filter((id) => !messagesToRemove.includes(id))

      // 更新会话消息列表
      if (this.messageIdsBySession[sessionId]) {
        this.messageIdsBySession[sessionId] = this.messageIdsBySession[sessionId].filter(
          (id) => !messagesToRemove.includes(id),
        )
      }
    },

    removeMessages(payload: { sessionId: string; messageIds: string[] }) {
      const { sessionId, messageIds } = payload

      // 删除消息
      messageIds.forEach((messageId) => {
        delete this.entities[messageId]
      })

      // 更新 ids
      this.ids = this.ids.filter((id) => !messageIds.includes(id))

      // 更新会话消息列表
      if (this.messageIdsBySession[sessionId]) {
        this.messageIdsBySession[sessionId] = this.messageIdsBySession[sessionId].filter(
          (id) => !messageIds.includes(id),
        )
      }
    },

    upsertBlockReference(payload: {
      messageId: string
      blockId: string
      status?: MessageBlockStatus
    }) {
      const { messageId, blockId, status } = payload
      const message = this.entities[messageId]

      if (!message) {
        console.warn(`[upsertBlockReference] Message ${messageId} not found.`)
        return
      }

      // 确保 message.blocks 是一个数组
      const blocks = message.blocks || []

      // 如果 blockId 不在 blocks 中，添加它
      if (!blocks.includes(blockId)) {
        blocks.push(blockId)
      }

      // 更新消息
      this.entities[messageId] = {
        ...message,
        blocks,
        updatedAt: new Date().toISOString(),
      }

      // 如果提供了状态，更新消息状态
      if (status) {
        // 只有在消息状态为 "processing" 时才更新状态
        if (message.status === 'processing') {
          this.entities[messageId] = {
            ...this.entities[messageId],
            status: AssistantMessageStatus.DONE,
          }
        }
      }
    },
  },

  getters: {
    // 获取特定会话的所有消息，按顺序排列
    getMessagesForSession: (state) => (sessionId: string) => {
      const messageIds = state.messageIdsBySession[sessionId] || []
      return messageIds.map((id) => state.entities[id]).filter(Boolean)
    },

    // 获取特定会话的加载状态
    getSessionLoading:
      (state) =>
      (sessionId: string): boolean => {
        return state.loadingBySession[sessionId] || false
      },

    // 获取显示数量
    getDisplayCount: (state) => state.displayCount,

    // 根据ID获取消息
    getMessageById:
      (state) =>
      (messageId: string): Message | undefined => {
        return state.entities[messageId]
      },
  },
})
