import db from '@/RevoAI/databases'
import { autoRenameSession } from '@/RevoAI/hooks/useSession'
import { fetchChatCompletion } from '@/RevoAI/services/ApiService'
import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'
import {
  createStreamProcessor,
  type StreamProcessorCallbacks,
} from '@/RevoAI/services/StreamProcessingService'
import { useMessagesStore } from '@/RevoAI/store/newMessage'
import { useMessageBlocksStore } from '@/RevoAI/store/messageBlock'
import { useSessionsStore } from '@/RevoAI/store/sessions'
import type { Session, ExternalToolResult, MCPToolResponse } from '@/RevoAI/types'
import type {
  CitationMessageBlock,
  Message,
  MessageBlock,
  PlaceholderMessageBlock,
  ToolMessageBlock,
  ThinkingMessageBlock,
} from '@/RevoAI/types/newMessage'
import {
  AssistantMessageStatus,
  MessageBlockStatus,
  MessageBlockType,
} from '@/RevoAI/types/newMessage'
import type { Response } from '@/RevoAI/types/newMessage'
import { formatErrorMessage, isAbortError } from '@/RevoAI/utils/error'
import {
  createAssistantMessage,
  createBaseMessageBlock,
  createCitationBlock,
  createErrorBlock,
  createMainTextBlock,
  createThinkingBlock,
  createToolBlock,
  resetAssistantMessage,
} from '@/RevoAI/utils/messageUtils/create'
import { getSessionQueue, waitForSessionQueue } from '@/RevoAI/utils/queue'
import { throttle, cloneDeep } from 'lodash'

// 处理会话加载状态
const handleChangeLoadingOfSession = async (sessionId: string) => {
  console.log(`[handleChangeLoadingOfSession] 开始处理会话 ${sessionId} 的加载状态`)
  await waitForSessionQueue(sessionId)

  const messagesStore = useMessagesStore()
  messagesStore.setSessionLoading({ sessionId, loading: false })
  console.log(`[handleChangeLoadingOfSession] 会话 ${sessionId} 的加载状态已设置为 false`)
}

// 保存消息和块到数据库
export const saveMessageAndBlocksToDB = async (
  message: Message,
  blocks: MessageBlock[],
  messageIndex: number = -1,
) => {
  try {
    if (blocks.length > 0) {
      const clonedBlocks = cloneDeep(blocks)
      await db.message_blocks.bulkPut(clonedBlocks)
    }
    const session = await db.sessions.get(message.sessionId)
    if (session) {
      const _messageIndex = session.messages.findIndex((m) => m.id === message.id)
      const updatedMessages = [...session.messages]

      if (_messageIndex !== -1) {
        updatedMessages[_messageIndex] = message
      } else {
        if (messageIndex !== -1) {
          updatedMessages.splice(messageIndex, 0, message)
        } else {
          updatedMessages.push(message)
        }
      }
      try {
        // 使用深度克隆避免不可序列化的对象
        const clonedMessages = JSON.parse(JSON.stringify(updatedMessages))
        // 更新会话的updatedAt字段，确保会话排序正确
        const updatedAt = new Date().toISOString()
        await db.sessions.update(message.sessionId, {
          messages: clonedMessages,
          updatedAt: updatedAt,
        })
      } catch (error) {
        console.error('Failed to update session messages:', error)
      }
    } else {
      console.error(`[saveMessageAndBlocksToDB] Session ${message.sessionId} not found.`)
    }
  } catch (error) {
    console.error(`[saveMessageAndBlocksToDB] Failed to save message ${message.id}:`, error)
  }
}

// 更新现有消息和块到数据库
const updateExistingMessageAndBlocksInDB = async (
  updatedMessage: any,
  updatedBlocks: MessageBlock[],
) => {
  try {
    await db.transaction('rw', db.sessions, db.message_blocks, async () => {
      // 更新块（如果提供）
      if (updatedBlocks.length > 0) {
        try {
          // 使用深度克隆避免不可序列化的对象
          const clonedBlocks = JSON.parse(JSON.stringify(updatedBlocks))
          await db.message_blocks.bulkPut(clonedBlocks)
        } catch (error) {
          console.error('Failed to update message blocks:', error)
        }
      }

      // 检查是否有除了id和sessionId之外的消息属性需要更新
      const messageKeysToUpdate = Object.keys(updatedMessage).filter(
        (key) => key !== 'id' && key !== 'sessionId',
      )

      // 只有在有实际消息更改时才进行会话更新
      if (messageKeysToUpdate.length > 0) {
        // 使用 where().modify() 进行原子更新
        await db.sessions
          .where('id')
          .equals(updatedMessage.sessionId)
          .modify((session: any) => {
            if (!session) return

            const messageIndex = session.messages.findIndex((m: any) => m.id === updatedMessage.id)
            if (messageIndex !== -1) {
              // 直接在原对象上更新需要修改的属性
              messageKeysToUpdate.forEach((key) => {
                try {
                  // 使用深度克隆避免不可序列化的对象
                  if (typeof updatedMessage[key] === 'object' && updatedMessage[key] !== null) {
                    session.messages[messageIndex][key] = JSON.parse(
                      JSON.stringify(updatedMessage[key]),
                    )
                  } else {
                    session.messages[messageIndex][key] = updatedMessage[key]
                  }
                } catch (error) {
                  console.error(`Failed to clone property ${key}:`, error)
                  // 回退到直接赋值
                  session.messages[messageIndex][key] = updatedMessage[key]
                }
              })

              // 更新会话的updatedAt字段，确保会话排序正确
              session.updatedAt = new Date().toISOString()
            }
          })
      }
    })
  } catch (error) {
    console.error(`[updateExistingMsg] Failed to update message ${updatedMessage.id}:`, error)
  }
}

// 更新单个块的逻辑，用于更新消息中的单个块
const throttledBlockUpdate = throttle(async (id, blockUpdate) => {
  const messageBlocksStore = useMessageBlocksStore()
  messageBlocksStore.updateOneBlock({ id, changes: blockUpdate })
  await db.message_blocks.update(id, blockUpdate)

  // 发出消息块更新事件
  EventEmitter.emit(EVENT_NAMES.MESSAGE_BLOCK_UPDATED, { blockId: id })
}, 150)

const cancelThrottledBlockUpdate = throttledBlockUpdate.cancel

// 通用的、非节流的函数，用于保存消息和块的更新到数据库
const saveUpdatesToDB = async (
  messageId: string,
  sessionId: string,
  messageUpdates: Partial<Message>, // 需要更新的消息字段
  blocksToUpdate: MessageBlock[], // 需要更新/创建的块
) => {
  try {
    const messageDataToSave: Partial<Message> & Pick<Message, 'id' | 'sessionId'> = {
      id: messageId,
      sessionId,
      ...messageUpdates,
    }
    await updateExistingMessageAndBlocksInDB(messageDataToSave, blocksToUpdate)
  } catch (error) {
    console.error(`[DB Save Updates] Failed for message ${messageId}:`, error)
  }
}

// 辅助函数，用于获取并保存单个更新后的 Block 到数据库
const saveUpdatedBlockToDB = async (
  blockId: string | null,
  messageId: string,
  sessionId: string,
) => {
  if (!blockId) {
    console.warn('[DB Save Single Block] Received null/undefined blockId. Skipping save.')
    return
  }
  const messageBlocksStore = useMessageBlocksStore()
  const blockToSave = messageBlocksStore.selectById(blockId)
  if (blockToSave) {
    await saveUpdatesToDB(messageId, sessionId, {}, [blockToSave])
  } else {
    console.warn(`[DB Save Single Block] Block ${blockId} not found in state. Cannot save.`)
  }
}

// 内部函数，处理获取和处理助手响应
const fetchAndProcessAssistantResponseImpl = async (
  session: Session,
  assistantMessage: Message, // 传递准备好的助手消息（新的或重置的）
) => {
  const messageBlocksStore = useMessageBlocksStore()

  const assistantMsgId = assistantMessage.id
  let callbacks: StreamProcessorCallbacks = {}
  try {
    const messagesStore = useMessagesStore()
    messagesStore.setSessionLoading({
      sessionId: session.id,
      loading: true,
    })

    let accumulatedContent = ''
    let accumulatedThinking = ''
    let lastBlockId: string | null = null
    let lastBlockType: MessageBlockType | null = null
    let citationBlockId: string | null = null
    let mainTextBlockId: string | null = null
    const toolCallIdToBlockIdMap = new Map<string, string>()

    const handleBlockTransition = async (
      newBlock: MessageBlock,
      newBlockType: MessageBlockType,
    ) => {
      lastBlockId = newBlock.id
      lastBlockType = newBlockType
      if (newBlockType !== MessageBlockType.MAIN_TEXT) {
        accumulatedContent = ''
      }
      if (newBlockType !== MessageBlockType.THINKING) {
        accumulatedThinking = ''
      }
      messagesStore.updateMessage({
        sessionId: session.id,
        messageId: assistantMsgId,
        updates: { blockInstruction: { id: newBlock.id } },
      })
      messageBlocksStore.upsertOneBlock(newBlock)
      messagesStore.upsertBlockReference({
        messageId: assistantMsgId,
        blockId: newBlock.id,
        status: newBlock.status,
      })

      const updatedMessage = messagesStore.entities[assistantMsgId]
      if (updatedMessage) {
        await saveUpdatesToDB(assistantMsgId, session.id, { blocks: updatedMessage.blocks }, [
          newBlock,
        ])

        // 发出消息块更新事件
        EventEmitter.emit(EVENT_NAMES.MESSAGE_BLOCK_UPDATED, {
          blockId: newBlock.id,
        })
      } else {
        console.error(
          `[handleBlockTransition] Failed to get updated message ${assistantMsgId} from state for DB save.`,
        )
      }
    }

    const allMessagesForSession = messagesStore.getMessagesForSession(session.id)

    let messagesForContext: Message[] = []
    const userMessageId = assistantMessage.askId
    const userMessageIndex = allMessagesForSession.findIndex((m) => m?.id === userMessageId)

    if (userMessageIndex === -1) {
      console.error(
        `[fetchAndProcessAssistantResponseImpl] Triggering user message ${userMessageId} (askId of ${assistantMsgId}) not found. Falling back.`,
      )
      const assistantMessageIndexFallback = allMessagesForSession.findIndex(
        (m) => m?.id === assistantMsgId,
      )
      messagesForContext = (
        assistantMessageIndexFallback !== -1
          ? allMessagesForSession.slice(0, assistantMessageIndexFallback)
          : allMessagesForSession
      ).filter((m) => m && !m.status?.includes('ing'))
    } else {
      const contextSlice = allMessagesForSession.slice(0, userMessageIndex + 1)
      messagesForContext = contextSlice.filter((m) => m && !m.status?.includes('ing'))
    }

    callbacks = {
      onLLMResponseCreated: () => {
        const baseBlock = createBaseMessageBlock(assistantMsgId, MessageBlockType.UNKNOWN, {
          status: MessageBlockStatus.PROCESSING,
        })
        handleBlockTransition(baseBlock as PlaceholderMessageBlock, MessageBlockType.UNKNOWN)
      },
      onTextChunk: (text) => {
        accumulatedContent += text
        if (lastBlockId) {
          if (lastBlockType === MessageBlockType.UNKNOWN) {
            const initialChanges: Partial<MessageBlock> = {
              type: MessageBlockType.MAIN_TEXT,
              content: accumulatedContent,
              status: MessageBlockStatus.STREAMING,
              citationReferences: citationBlockId ? [{ citationBlockId }] : [],
            }
            mainTextBlockId = lastBlockId
            lastBlockType = MessageBlockType.MAIN_TEXT
            messageBlocksStore.updateOneBlock({
              id: lastBlockId,
              changes: initialChanges,
            })
            saveUpdatedBlockToDB(lastBlockId, assistantMsgId, session.id)
          } else if (lastBlockType === MessageBlockType.MAIN_TEXT) {
            const blockChanges: Partial<MessageBlock> = {
              content: accumulatedContent,
              status: MessageBlockStatus.STREAMING,
            }
            throttledBlockUpdate(lastBlockId, blockChanges)
          } else {
            const newBlock = createMainTextBlock(assistantMsgId, accumulatedContent, {
              status: MessageBlockStatus.STREAMING,
              citationReferences: citationBlockId ? [{ citationBlockId }] : [],
            })
            handleBlockTransition(newBlock, MessageBlockType.MAIN_TEXT)
            mainTextBlockId = newBlock.id
          }
        }
      },
      onTextComplete: async (finalText) => {
        cancelThrottledBlockUpdate()
        if (lastBlockType === MessageBlockType.MAIN_TEXT && lastBlockId) {
          const changes = {
            content: finalText,
            status: MessageBlockStatus.SUCCESS,
          }
          messageBlocksStore.updateOneBlock({ id: lastBlockId, changes })
          saveUpdatedBlockToDB(lastBlockId, assistantMsgId, session.id)

          // 发出消息块更新事件
          EventEmitter.emit(EVENT_NAMES.MESSAGE_BLOCK_UPDATED, {
            blockId: lastBlockId,
          })
        } else {
          console.warn(
            `[onTextComplete] Received text.complete but last block was not MAIN_TEXT (was ${lastBlockType}) or lastBlockId is null.`,
          )
        }
      },
      onThinkingChunk: (text, thinking_millsec) => {
        accumulatedThinking += text
        if (lastBlockId) {
          if (lastBlockType === MessageBlockType.UNKNOWN) {
            // First chunk for this block: Update type and status immediately
            lastBlockType = MessageBlockType.THINKING
            const initialChanges: Partial<MessageBlock> = {
              type: MessageBlockType.THINKING,
              content: accumulatedThinking,
              status: MessageBlockStatus.STREAMING,
            }
            messageBlocksStore.updateOneBlock({
              id: lastBlockId,
              changes: initialChanges,
            })
            saveUpdatedBlockToDB(lastBlockId, assistantMsgId, session.id)
          } else if (lastBlockType === MessageBlockType.THINKING) {
            const blockChanges: Partial<MessageBlock> = {
              content: accumulatedThinking,
              status: MessageBlockStatus.STREAMING,
              thinking_millsec: thinking_millsec,
            }
            throttledBlockUpdate(lastBlockId, blockChanges)
          } else {
            const newBlock = createThinkingBlock(assistantMsgId, accumulatedThinking, {
              status: MessageBlockStatus.STREAMING,
              thinking_millsec: 0,
            })
            handleBlockTransition(newBlock, MessageBlockType.THINKING)
          }
        }
      },
      onThinkingComplete: (finalText, final_thinking_millsec) => {
        cancelThrottledBlockUpdate()

        if (lastBlockType === MessageBlockType.THINKING && lastBlockId) {
          const changes = {
            type: MessageBlockType.THINKING as const,
            content: finalText,
            status: MessageBlockStatus.SUCCESS,
            thinking_millsec: final_thinking_millsec,
          }
          messageBlocksStore.updateOneBlock({ id: lastBlockId, changes })
          saveUpdatedBlockToDB(lastBlockId, assistantMsgId, session.id)

          // 发出消息块更新事件
          EventEmitter.emit(EVENT_NAMES.MESSAGE_BLOCK_UPDATED, {
            blockId: lastBlockId,
          })
        } else {
          console.warn(
            `[onThinkingComplete] Received thinking.complete but last block was not THINKING (was ${lastBlockType}) or lastBlockId is null.`,
          )
        }
      },
      onToolCallInProgress: (toolResponse: MCPToolResponse) => {
        if (lastBlockType === MessageBlockType.UNKNOWN && lastBlockId) {
          lastBlockType = MessageBlockType.TOOL
          const changes = {
            type: MessageBlockType.TOOL as const,
            status: MessageBlockStatus.PROCESSING,
            metadata: { rawMcpToolResponse: toolResponse },
          }
          messageBlocksStore.updateOneBlock({ id: lastBlockId, changes })
          saveUpdatedBlockToDB(lastBlockId, assistantMsgId, session.id)
          toolCallIdToBlockIdMap.set(toolResponse.id, lastBlockId)
        } else if (toolResponse.status === 'invoking') {
          const toolBlock = createToolBlock(assistantMsgId, toolResponse.id, {
            toolName: toolResponse.tool.name,
            status: MessageBlockStatus.PROCESSING,
            metadata: { rawMcpToolResponse: toolResponse },
          })
          handleBlockTransition(toolBlock, MessageBlockType.TOOL)
          toolCallIdToBlockIdMap.set(toolResponse.id, toolBlock.id)
        } else {
          console.warn(
            `[onToolCallInProgress] Received unhandled tool status: ${toolResponse.status} for ID: ${toolResponse.id}`,
          )
        }
      },
      onToolCallComplete: (toolResponse: MCPToolResponse) => {
        cancelThrottledBlockUpdate()
        const existingBlockId = toolCallIdToBlockIdMap.get(toolResponse.id)
        if (toolResponse.status === 'done' || toolResponse.status === 'error') {
          if (!existingBlockId) {
            console.error(
              `[onToolCallComplete] No existing block found for completed/error tool call ID: ${toolResponse.id}. Cannot update.`,
            )
            return
          }
          const finalStatus =
            toolResponse.status === 'done' ? MessageBlockStatus.SUCCESS : MessageBlockStatus.ERROR
          const changes: Partial<ToolMessageBlock> = {
            content: toolResponse.response,
            status: finalStatus,
            metadata: { rawMcpToolResponse: toolResponse },
          }
          if (finalStatus === MessageBlockStatus.ERROR) {
            changes.error = {
              message: `Tool execution failed/error`,
              details: toolResponse.response,
            }
          }
          messageBlocksStore.updateOneBlock({ id: existingBlockId, changes })
          saveUpdatedBlockToDB(existingBlockId, assistantMsgId, session.id)
        } else {
          console.warn(
            `[onToolCallComplete] Received unhandled tool status: ${toolResponse.status} for ID: ${toolResponse.id}`,
          )
        }
      },
      onExternalToolInProgress: () => {
        const citationBlock = createCitationBlock(
          assistantMsgId,
          {},
          { status: MessageBlockStatus.PROCESSING },
        )
        citationBlockId = citationBlock.id
        handleBlockTransition(citationBlock, MessageBlockType.CITATION)
      },
      onExternalToolComplete: (externalToolResult: ExternalToolResult) => {
        if (citationBlockId) {
          const changes: Partial<CitationMessageBlock> = {
            response: externalToolResult.webSearch,
            status: MessageBlockStatus.SUCCESS,
          }
          messageBlocksStore.updateOneBlock({ id: citationBlockId, changes })
          saveUpdatedBlockToDB(citationBlockId, assistantMsgId, session.id)
        } else {
          console.error('[onExternalToolComplete] citationBlockId is null. Cannot update.')
        }
      },
      onLLMWebSearchInProgress: () => {
        const citationBlock = createCitationBlock(
          assistantMsgId,
          {},
          { status: MessageBlockStatus.PROCESSING },
        )
        citationBlockId = citationBlock.id
        handleBlockTransition(citationBlock, MessageBlockType.CITATION)
      },
      onLLMWebSearchComplete: async (llmWebSearchResult) => {
        if (citationBlockId) {
          const changes: Partial<CitationMessageBlock> = {
            response: llmWebSearchResult,
            status: MessageBlockStatus.SUCCESS,
          }
          messageBlocksStore.updateOneBlock({ id: citationBlockId, changes })
          saveUpdatedBlockToDB(citationBlockId, assistantMsgId, session.id)
        } else {
          const citationBlock = createCitationBlock(
            assistantMsgId,
            { response: llmWebSearchResult },
            { status: MessageBlockStatus.SUCCESS },
          )
          citationBlockId = citationBlock.id
          handleBlockTransition(citationBlock, MessageBlockType.CITATION)
        }
        if (mainTextBlockId) {
          const existingMainTextBlock = messageBlocksStore.selectById(mainTextBlockId)
          if (existingMainTextBlock && existingMainTextBlock.type === MessageBlockType.MAIN_TEXT) {
            const currentRefs = existingMainTextBlock.citationReferences || []
            if (!currentRefs.some((ref) => ref.citationBlockId === citationBlockId)) {
              const mainTextChanges = {
                citationReferences: [
                  ...currentRefs,
                  { citationBlockId, citationBlockSource: 'websearch' },
                ],
              }
              messageBlocksStore.updateOneBlock({
                id: mainTextBlockId,
                changes: mainTextChanges,
              })
              saveUpdatedBlockToDB(mainTextBlockId, assistantMsgId, session.id)
            }
          }
        }
      },
      onError: async (error) => {
        cancelThrottledBlockUpdate()
        console.dir(error, { depth: null })
        const isErrorTypeAbort = isAbortError(error)
        let pauseErrorLanguagePlaceholder = ''
        if (isErrorTypeAbort) {
          pauseErrorLanguagePlaceholder = 'pause_placeholder'
        }

        const serializableError = {
          name: error.name,
          message: pauseErrorLanguagePlaceholder || error.message || formatErrorMessage(error),
          originalMessage: error.message,
          stack: error.stack,
          status: error.status || error.code,
          requestId: error.request_id,
        }

        if (lastBlockId) {
          // 更改上一个block的状态为ERROR
          const changes: Partial<MessageBlock> = {
            status: isErrorTypeAbort ? MessageBlockStatus.PAUSED : MessageBlockStatus.ERROR,
          }

          // 如果是思考块，确保设置最终的thinking_millsec值
          const lastBlock = messageBlocksStore.selectById(lastBlockId)
          if (lastBlock && lastBlock.type === MessageBlockType.THINKING) {
            // 使用类型断言确保类型安全
            ;(changes as Partial<ThinkingMessageBlock>).thinking_millsec =
              (lastBlock as ThinkingMessageBlock).thinking_millsec || 0
          }

          messageBlocksStore.updateOneBlock({ id: lastBlockId, changes })
          saveUpdatedBlockToDB(lastBlockId, assistantMsgId, session.id)
        }

        const errorBlock = createErrorBlock(assistantMsgId, serializableError, {
          status: MessageBlockStatus.SUCCESS,
        })
        await handleBlockTransition(errorBlock, MessageBlockType.ERROR)
        const messageErrorUpdate = {
          status: isErrorTypeAbort ? AssistantMessageStatus.SUCCESS : AssistantMessageStatus.ERROR,
        }
        messagesStore.updateMessage({
          sessionId: session.id,
          messageId: assistantMsgId,
          updates: messageErrorUpdate,
        })

        saveUpdatesToDB(assistantMsgId, session.id, messageErrorUpdate, [])

        EventEmitter.emit(EVENT_NAMES.MESSAGE_COMPLETE, {
          id: assistantMsgId,
          sessionId: session.id,
          status: isErrorTypeAbort ? 'pause' : 'error',
          error: error.message,
        })
      },
      onComplete: async (status: AssistantMessageStatus, response?: Response) => {
        cancelThrottledBlockUpdate()

        const finalAssistantMsg = messagesStore.entities[assistantMsgId]

        if (status === 'success' && finalAssistantMsg) {
          const userMsgId = finalAssistantMsg.askId
          const orderedMsgs = messagesStore.getMessagesForSession(session.id)
          const userMsgIndex = orderedMsgs.findIndex((m) => m.id === userMsgId)
          const contextForUsage = userMsgIndex !== -1 ? orderedMsgs.slice(0, userMsgIndex + 1) : []
          const finalContextWithAssistant = [...contextForUsage, finalAssistantMsg]

          if (lastBlockId) {
            const changes: Partial<MessageBlock> = {
              status: MessageBlockStatus.SUCCESS,
            }
            messageBlocksStore.updateOneBlock({ id: lastBlockId, changes })
            saveUpdatedBlockToDB(lastBlockId, assistantMsgId, session.id)
          }

          // 获取最新的会话数据进行自动重命名
          try {
            const latestSession = await db.sessions.get(session.id)
            if (latestSession) {
              autoRenameSession(latestSession)
            } else {
              console.error(`[onComplete] Session ${session.id} not found for autoRename.`)
            }
          } catch (error) {
            console.error(`[onComplete] Error getting latest session for autoRename:`, error)
          }
        }
        if (response && response.metrics) {
          if (response.metrics.completion_tokens === 0 && response.usage?.completion_tokens) {
            response = {
              ...response,
              metrics: {
                ...response.metrics,
                completion_tokens: response.usage.completion_tokens,
              },
            }
          }
        }

        const messageUpdates: Partial<Message> = {
          status,
          metrics: response?.metrics,
          usage: response?.usage,
        }
        messagesStore.updateMessage({
          sessionId: session.id,
          messageId: assistantMsgId,
          updates: messageUpdates,
        })
        saveUpdatesToDB(assistantMsgId, session.id, messageUpdates, [])

        EventEmitter.emit(EVENT_NAMES.MESSAGE_COMPLETE, {
          id: assistantMsgId,
          sessionId: session.id,
          status,
        })
      },
    }

    const streamProcessorCallbacks = createStreamProcessor(callbacks)

    await fetchChatCompletion({
      messages: messagesForContext,
      session,
      onChunkReceived: streamProcessorCallbacks,
    })
  } catch (error: any) {
    console.error('Error fetching chat completion:', error)
    if (assistantMessage) {
      callbacks.onError?.(error)
      throw error
    }
  }
}

/**
 * 发送消息并处理助手回复
 * @param userMessage 已创建的用户消息
 * @param userMessageBlocks 用户消息关联的消息块
 * @param session 会话对象
 */
export const sendMessage = async (
  userMessage: Message,
  userMessageBlocks: MessageBlock[],
  session: Session,
) => {
  const messageBlocksStore = useMessageBlocksStore()
  const messagesStore = useMessagesStore()
  try {
    // 设置loading状态为true
    messagesStore.setSessionLoading({ sessionId: session.id, loading: true })

    if (userMessage.blocks.length === 0) {
      console.warn('sendMessage: No blocks in the provided message.')
      return
    }
    console.log('userMessageBlocks', userMessageBlocks)

    // 更新会话的updatedAt字段，确保会话排序正确
    const updatedAt = new Date().toISOString()
    await db.sessions.update(session.id, { updatedAt })

    // 获取最新的会话列表并更新store
    const latestSessions = await db.sessions.toArray()
    const sessionsStore = useSessionsStore()
    sessionsStore.updateSessions(latestSessions)

    // 触发会话更新事件，通知组件刷新
    EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, {
      sessionId: session.id,
      updates: { updatedAt },
    })

    await saveMessageAndBlocksToDB(userMessage, userMessageBlocks)
    messagesStore.addMessage({
      sessionId: session.id,
      message: userMessage,
    })
    if (userMessageBlocks.length > 0) {
      messageBlocksStore.upsertManyBlocks(userMessageBlocks)
    }

    const queue = getSessionQueue(session.id)

    const assistantMessage = createAssistantMessage(session.id, {
      askId: userMessage.id,
      modelDisplayName: session.model?.displayName || session.model?.name, // 只保存模型展示名称
    })
    await saveMessageAndBlocksToDB(assistantMessage, [])
    messagesStore.addMessage({
      sessionId: session.id,
      message: assistantMessage,
    })

    queue.add(async () => {
      await fetchAndProcessAssistantResponseImpl(session, assistantMessage)
    })
  } catch (error) {
    console.error('Error in sendMessage:', error)
  } finally {
    handleChangeLoadingOfSession(session.id)
  }
}

/**
 * 从数据库加载特定会话的消息及其块，并更新 Pinia store
 */
export const loadSessionMessages = async (sessionId: string, forceReload: boolean = false) => {
  const messageBlocksStore = useMessageBlocksStore()
  const messagesStore = useMessagesStore()
  const sessionMessagesExist = !!messagesStore.messageIdsBySession[sessionId]

  if (sessionMessagesExist && !forceReload) {
    messagesStore.setCurrentSessionId(sessionId)
    return
  }

  try {
    const session = await db.sessions.get(sessionId)
    if (!session) {
      // 会话不存在时，不设置 currentSessionId
      console.warn(`[loadSessionMessages] Session ${sessionId} not found`)
      return
    }

    messagesStore.setCurrentSessionId(sessionId)

    const messagesFromDB = session?.messages || []

    if (messagesFromDB.length > 0) {
      const messageIds = messagesFromDB.map((m) => m.id)
      const blocks = await db.message_blocks.where('messageId').anyOf(messageIds).toArray()

      if (blocks && blocks.length > 0) {
        messageBlocksStore.upsertManyBlocks(blocks)
      }
      const messagesWithBlockIds = messagesFromDB.map((m) => ({
        ...m,
        blocks: m.blocks?.map(String) || [],
      }))
      messagesStore.messagesReceived({
        sessionId,
        messages: messagesWithBlockIds,
      })
    } else {
      messagesStore.messagesReceived({ sessionId, messages: [] })
    }
  } catch (error: any) {
    console.error(`[loadSessionMessages] Failed to load messages for session ${sessionId}:`, error)
  }
}

export const clearSessionMessages = (sessionId: string) => async () => {
  const messageBlocksStore = useMessageBlocksStore()
  const messagesStore = useMessagesStore()
  try {
    const messageIdsToClear = messagesStore.messageIdsBySession[sessionId] || []
    const blockIdsToDeleteSet = new Set<string>()

    messageIdsToClear.forEach((messageId) => {
      const message = messagesStore.entities[messageId]
      message?.blocks?.forEach((blockId) => blockIdsToDeleteSet.add(blockId))
    })

    const blockIdsToDelete = Array.from(blockIdsToDeleteSet)

    messagesStore.clearSessionMessages(sessionId)
    if (blockIdsToDelete.length > 0) {
      messageBlocksStore.removeManyBlocks(blockIdsToDelete)
    }

    // 确保数据可以被序列化
    await db.sessions.update(sessionId, { messages: [] })
    if (blockIdsToDelete.length > 0) {
      await db.message_blocks.bulkDelete(blockIdsToDelete)
    }
  } catch (error) {
    console.error(
      `[clearSessionMessagesThunk] Failed to clear messages for session ${sessionId}:`,
      error,
    )
  }
}

/**
 * 删除单个消息及其关联的块
 */
export const deleteSingleMessage = async (sessionId: string, messageId: string) => {
  const messageBlocksStore = useMessageBlocksStore()
  const messagesStore = useMessagesStore()
  const messageToDelete = messagesStore.entities[messageId]
  if (!messageToDelete || messageToDelete.sessionId !== sessionId) {
    console.error(`[deleteSingleMessage] Message ${messageId} not found in session ${sessionId}.`)
    return
  }

  // 只删除当前候选blocks（即message.blocks），不删除candidates中的其它blocks
  const currentBlocks = messageToDelete.blocks || []
  let candidates = messageToDelete.candidates ? [...messageToDelete.candidates] : [currentBlocks]
  // 找到当前候选在candidates中的下标
  const idx = candidates.findIndex(
    (arr) => arr.length === currentBlocks.length && arr.every((id, i) => id === currentBlocks[i]),
  )
  if (idx !== -1) {
    candidates.splice(idx, 1)
  }
  let newIndex = 0
  if (candidates.length > 1) {
    newIndex = idx < candidates.length ? idx : candidates.length - 1
  } else {
    newIndex = 0
  }
  const newBlocks = candidates[newIndex] || []
  const blockIdsToDelete = currentBlocks

  try {
    // 如果没有候选了，直接删除消息
    if (!candidates.length || (candidates.length === 1 && newBlocks.length === 0)) {
      messagesStore.removeMessage({ sessionId, messageId })
      messageBlocksStore.removeManyBlocks(blockIdsToDelete)
      await db.message_blocks.bulkDelete(blockIdsToDelete)
      const session = await db.sessions.get(sessionId)
      if (session) {
        const finalMessagesToSave = messagesStore.getMessagesForSession(sessionId)
        try {
          // 使用深度克隆避免不可序列化的对象
          const clonedMessages = JSON.parse(JSON.stringify(finalMessagesToSave))
          // 更新会话的updatedAt字段，确保会话排序正确
          const updatedAt = new Date().toISOString()
          await db.sessions.update(sessionId, {
            messages: clonedMessages,
            updatedAt: updatedAt,
          })
          // 触发会话更新事件，通知组件刷新
          EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, {
            sessionId,
            updates: { updatedAt },
          })
        } catch (error) {
          console.error('Failed to update session messages:', error)
        }
      }
    } else {
      // 还有其它候选，只更新message
      messagesStore.updateMessage({
        sessionId,
        messageId,
        updates: {
          candidates: candidates.length > 0 ? candidates : undefined,
          currentCandidateIndex: candidates.length > 0 ? newIndex : undefined,
          blocks: newBlocks,
        },
      })
      messageBlocksStore.removeManyBlocks(blockIdsToDelete)
      await db.message_blocks.bulkDelete(blockIdsToDelete)
      const session = await db.sessions.get(sessionId)
      if (session) {
        const finalMessagesToSave = messagesStore.getMessagesForSession(sessionId)
        try {
          // 使用深度克隆避免不可序列化的对象
          const clonedMessages = JSON.parse(JSON.stringify(finalMessagesToSave))
          // 更新会话的updatedAt字段，确保会话排序正确
          const updatedAt = new Date().toISOString()
          await db.sessions.update(sessionId, {
            messages: clonedMessages,
            updatedAt: updatedAt,
          })
          // 触发会话更新事件，通知组件刷新
          EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, {
            sessionId,
            updates: { updatedAt },
          })
        } catch (error) {
          console.error('Failed to update session messages:', error)
        }
      }
    }
  } catch (error) {
    console.error(`[deleteSingleMessage] Failed to delete message ${messageId}:`, error)
  }
}

/**
 * 切换助手消息的候选回复
 */
export const switchAssistantCandidate =
  (sessionId: string, messageId: string, delta: number) => async () => {
    const messagesStore = useMessagesStore()
    const message = messagesStore.entities[messageId]
    if (!message?.candidates || message.candidates.length === 0) return

    let idx = (message.currentCandidateIndex ?? 0) + delta
    if (idx < 0) idx = message.candidates.length - 1
    if (idx >= message.candidates.length) idx = 0

    const newBlocks = message.candidates[idx]
    messagesStore.updateMessage({
      sessionId,
      messageId,
      updates: {
        currentCandidateIndex: idx,
        blocks: newBlocks,
      },
    })

    // 同步数据库
    try {
      const session = await db.sessions.get(sessionId)
      if (session) {
        const messageIndex = session.messages.findIndex((m) => m.id === messageId)
        if (messageIndex !== -1) {
          // 使用JSON序列化和反序列化进行深度克隆
          const updatedMessage = JSON.parse(
            JSON.stringify({
              ...session.messages[messageIndex],
              currentCandidateIndex: idx,
              blocks: newBlocks,
            }),
          )

          session.messages[messageIndex] = updatedMessage

          // 更新会话的updatedAt字段，确保会话排序正确
          const updatedAt = new Date().toISOString()
          await db.sessions.update(sessionId, {
            messages: JSON.parse(JSON.stringify(session.messages)),
            updatedAt: updatedAt,
          })
          // 触发会话更新事件，通知组件刷新
          EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, {
            sessionId,
            updates: { updatedAt },
          })
        }
      }
    } catch (error) {
      console.error(`[switchAssistantCandidate] Failed to update session in DB:`, error)
    }
  }

/**
 * 重新生成指定的助手消息回复
 */
export const regenerateAssistantMessage = async (
  sessionId: string,
  assistantMessageToRegenerate: Message,
) => {
  const messageBlocksStore = useMessageBlocksStore()
  const messagesStore = useMessagesStore()
  try {
    // 设置loading状态为true
    console.log(`[regenerateAssistantMessage] 设置会话 ${sessionId} 的加载状态为 true`)
    messagesStore.setSessionLoading({ sessionId, loading: true })

    // 更新会话的updatedAt字段，确保会话排序正确
    const updatedAt = new Date().toISOString()
    await db.sessions.update(sessionId, { updatedAt })
    // 触发会话更新事件，通知组件刷新
    EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, {
      sessionId,
      updates: { updatedAt },
    })

    // 1. 查找原始用户查询
    const allMessagesForSession = messagesStore.getMessagesForSession(sessionId)
    const originalUserQuery = allMessagesForSession.find(
      (m) => m.id === assistantMessageToRegenerate.askId,
    )

    if (!originalUserQuery) {
      console.error(
        `[regenerateAssistantMessage] Original user query (askId: ${assistantMessageToRegenerate.askId}) not found for assistant message ${assistantMessageToRegenerate.id}. Cannot regenerate.`,
      )
      return
    }

    // 2. 验证助手消息本身存在
    const messageToResetEntity = messagesStore.entities[assistantMessageToRegenerate.id]
    if (!messageToResetEntity) {
      console.error(
        `[regenerateAssistantMessage] Assistant message ${assistantMessageToRegenerate.id} not found in entities despite being in the session list. State might be inconsistent.`,
      )
      return
    }

    // 3. 重置助手消息，但保留历史blocks
    const resetAssistantMsg = resetAssistantMessage(messageToResetEntity, {
      status: AssistantMessageStatus.PENDING,
      updatedAt: new Date().toISOString(),
    })

    // 4. 处理candidates
    const oldCandidates = messageToResetEntity.candidates || [messageToResetEntity.blocks]

    messagesStore.updateMessage({
      sessionId,
      messageId: resetAssistantMsg.id,
      updates: {
        ...resetAssistantMsg,
        candidates: oldCandidates,
        currentCandidateIndex: oldCandidates.length - 1,
      },
    })

    // 5. 更新数据库中的消息状态
    const session = await db.sessions.get(sessionId)
    if (session) {
      const messageIndex = session.messages.findIndex((m) => m.id === resetAssistantMsg.id)
      if (messageIndex !== -1) {
        // 使用JSON序列化和反序列化进行深度克隆
        const updatedMessage = {
          ...session.messages[messageIndex],
          ...resetAssistantMsg,
          candidates: oldCandidates,
          currentCandidateIndex: oldCandidates.length - 1,
        }

        session.messages[messageIndex] = updatedMessage
        await db.sessions.update(sessionId, {
          messages: cloneDeep(session.messages),
        })
      }
    }

    // 6. 获取会话对象
    const sessionObj = await db.sessions.get(sessionId)
    if (!sessionObj) {
      console.error(`[regenerateAssistantMessage] Session ${sessionId} not found.`)
      return
    }

    // 7. 生成新回复
    const queue = getSessionQueue(sessionId)
    queue.add(async () => {
      await fetchAndProcessAssistantResponseImpl(sessionObj, resetAssistantMsg)

      // 8. 新blocks生成后，追加到candidates
      const msgAfter = messagesStore.entities[resetAssistantMsg.id]
      if (msgAfter) {
        const prevCandidates = msgAfter.candidates || oldCandidates
        const newCandidates = [...prevCandidates, msgAfter.blocks]

        messagesStore.updateMessage({
          sessionId,
          messageId: msgAfter.id,
          updates: {
            candidates: newCandidates,
            currentCandidateIndex: newCandidates.length - 1,
            blocks: msgAfter.blocks,
          },
        })

        // 同步数据库
        const updatedSession = await db.sessions.get(sessionId)
        if (updatedSession) {
          const updatedMessageIndex = updatedSession.messages.findIndex((m) => m.id === msgAfter.id)
          if (updatedMessageIndex !== -1) {
            // 使用JSON序列化和反序列化进行深度克隆
            updatedSession.messages[updatedMessageIndex] = {
              ...updatedSession.messages[updatedMessageIndex],
              candidates: newCandidates,
              currentCandidateIndex: newCandidates.length - 1,
              blocks: msgAfter.blocks,
            }

            await db.sessions.update(sessionId, {
              messages: cloneDeep(updatedSession.messages),
            })
          }
        }
      }
    })
  } catch (error) {
    console.error(
      `[regenerateAssistantMessage] Error regenerating response for assistant message ${assistantMessageToRegenerate.id}:`,
      error,
    )
  } finally {
    // 确保无论成功或失败都会重置loading状态
    handleChangeLoadingOfSession(sessionId)
  }
}

/**
 * 编辑用户消息后清除后续消息并重新生成回复
 * @param sessionId 会话ID
 * @param editedMessage 已编辑的用户消息
 * @param editedContent 编辑后的内容
 */
export const resendEditedUserMessage = async (
  sessionId: string,
  editedMessage: Message,
  editedContent: string,
) => {
  const messageBlocksStore = useMessageBlocksStore()
  const messagesStore = useMessagesStore()
  try {
    // 设置loading状态为true
    console.log(`[resendEditedUserMessage] 设置会话 ${sessionId} 的加载状态为 true`)
    messagesStore.setSessionLoading({ sessionId, loading: true })

    // 更新会话的updatedAt字段，确保会话排序正确
    const updatedAt = new Date().toISOString()
    await db.sessions.update(sessionId, { updatedAt })
    // 触发会话更新事件，通知组件刷新
    EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, {
      sessionId,
      updates: { updatedAt },
    })

    // 1. 获取当前会话中的所有消息
    const allMessages = messagesStore.getMessagesForSession(sessionId)

    // 2. 找到当前消息在消息列表中的位置
    const messageIndex = allMessages.findIndex((msg) => msg.id === editedMessage.id)
    if (messageIndex === -1) {
      console.error(
        `[resendEditedUserMessage] Message ${editedMessage.id} not found in session ${sessionId}.`,
      )
      return
    }

    // 3. 获取当前消息之后的所有消息（需要删除的消息）
    const messagesToDelete = allMessages.filter((msg, idx) => idx > messageIndex)
    console.log(
      `[resendEditedUserMessage] Will delete ${messagesToDelete.length} messages after the edited message.`,
    )

    // 4. 更新当前消息的内容
    // 找到主文本块并更新内容
    const mainTextBlockId = editedMessage.blocks.find((blockId) => {
      const block = messageBlocksStore.selectById(blockId)
      return block?.type === MessageBlockType.MAIN_TEXT
    })

    if (mainTextBlockId) {
      const updatedBlock = {
        content: editedContent,
        updatedAt: new Date().toISOString(),
      }

      messageBlocksStore.updateOneBlock({
        id: mainTextBlockId,
        changes: updatedBlock,
      })

      // 保存到数据库
      await db.message_blocks.update(mainTextBlockId, updatedBlock)
    }

    // 5. 删除后续消息及其所有候选和消息块
    // 收集所有需要删除的块ID
    const allBlockIdsToDelete = new Set<string>()

    for (const msg of messagesToDelete) {
      // 收集当前消息的所有块ID
      if (msg.blocks) {
        msg.blocks.forEach((blockId) => allBlockIdsToDelete.add(blockId))
      }

      // 收集所有候选的块ID
      if (msg.candidates && Array.isArray(msg.candidates)) {
        msg.candidates.forEach((candidateBlocks) => {
          if (Array.isArray(candidateBlocks)) {
            candidateBlocks.forEach((blockId) => allBlockIdsToDelete.add(blockId))
          }
        })
      }

      // 从Redux状态中删除消息
      messagesStore.removeMessage({ sessionId, messageId: msg.id })
    }

    // 从Redux状态中删除所有块
    const blockIdsArray = Array.from(allBlockIdsToDelete)
    if (blockIdsArray.length > 0) {
      messageBlocksStore.removeManyBlocks(blockIdsArray)

      // 从数据库中删除所有块
      await db.message_blocks.bulkDelete(blockIdsArray)
    }

    // 更新会话中的消息列表
    const session = await db.sessions.get(sessionId)
    if (session) {
      // 过滤掉已删除的消息
      const remainingMessages = session.messages.filter(
        (msg) => !messagesToDelete.some((delMsg) => delMsg.id === msg.id),
      )

      // 更新会话
      await db.sessions.update(sessionId, {
        messages: remainingMessages,
      })
    }

    // 6. 获取会话对象
    const updatedSession = await db.sessions.get(sessionId)
    if (!updatedSession) {
      console.error(`[resendEditedUserMessage] Session ${sessionId} not found.`)
      return
    }

    // 7. 生成新的助手回复
    const assistantMessage = createAssistantMessage(sessionId, {
      askId: editedMessage.id,
      modelDisplayName: updatedSession.model?.displayName || updatedSession.model?.name,
    })

    await saveMessageAndBlocksToDB(assistantMessage, [])
    messagesStore.addMessage({
      sessionId,
      message: assistantMessage,
    })

    // 8. 生成新回复
    const queue = getSessionQueue(sessionId)
    queue.add(async () => {
      await fetchAndProcessAssistantResponseImpl(updatedSession, assistantMessage)
    })

    return true
  } catch (error) {
    console.error(`[resendEditedUserMessage] Error:`, error)
    return false
  } finally {
    handleChangeLoadingOfSession(sessionId)
  }
}
