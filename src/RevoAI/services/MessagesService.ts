import { DEFAULT_CONTEXTCOUNT } from '@/RevoAI/config/constant'
import { useMessageBlocksStore } from '@/RevoAI/store/messageBlock'
import type { Session, FileType, Usage } from '@/RevoAI/types'
import { FileTypes } from '@/RevoAI/types'
import type { Message, MessageBlock } from '@/RevoAI/types/newMessage'
import { MessageBlockStatus, MessageBlockType } from '@/RevoAI/types/newMessage'
import { uuid } from '@/RevoAI/utils'
import {
  createFileBlock,
  createImageBlock,
  createMainTextBlock,
  createMessage,
} from '@/RevoAI/utils/messageUtils/create'
import { takeRight } from 'lodash'
// import FileManager from "./FileManager";

export {
  filterContextMessages,
  filterEmptyMessages,
  filterMessages,
  filterUsefulMessages,
  filterUserRoleStartMessages,
  getGroupedMessages,
} from '@/RevoAI/utils/messageUtils/filters'

export function getContextCount(session: Session, messages: Message[]) {
  const rawContextCount = session?.settings?.contextCount ?? DEFAULT_CONTEXTCOUNT
  const maxContextCount = rawContextCount === 100 ? 100000 : rawContextCount

  const _messages: any = takeRight(messages, maxContextCount)

  const clearIndex = _messages.findLastIndex((message: Message) => message.type === 'clear')

  let currentContextCount = 0
  if (clearIndex === -1) {
    currentContextCount = _messages.length
  } else {
    currentContextCount = _messages.length - (clearIndex + 1)
  }

  return {
    current: currentContextCount,
    max: rawContextCount,
  }
}

export function deleteMessageFiles(message: Message) {
  const messageBlocksStore = useMessageBlocksStore()
  message.blocks?.forEach((blockId: string) => {
    const block = messageBlocksStore.selectById(blockId)
    if (block && (block.type === MessageBlockType.IMAGE || block.type === MessageBlockType.FILE)) {
      const fileData = (block as any).file as FileType | undefined
      if (fileData) {
        // FileManager.deleteFiles([fileData]);
      }
    }
  })
}

/**
 * Creates a user message object and associated blocks based on input.
 * This is a pure function and does not dispatch to the store.
 *
 * @param params - The parameters for creating the message.
 * @returns An object containing the created message and its blocks.
 */
export function getUserMessage({
  session,
  content,
  files,
  usage,
}: {
  session: Session
  content?: string
  files?: FileType[]
  usage?: Usage
}): { message: Message; blocks: MessageBlock[] } {
  const messageId = uuid() // Generate ID here
  const blocks: MessageBlock[] = []
  const blockIds: string[] = []

  if (content?.trim()) {
    // Pass messageId when creating blocks
    const textBlock = createMainTextBlock(messageId, content, {
      status: MessageBlockStatus.SUCCESS,
    })
    blocks.push(textBlock)
    blockIds.push(textBlock.id)
  }
  if (files?.length) {
    files.forEach((file) => {
      if (file.type === FileTypes.IMAGE) {
        const imgBlock = createImageBlock(messageId, {
          file,
          status: MessageBlockStatus.SUCCESS,
        })
        blocks.push(imgBlock)
        blockIds.push(imgBlock.id)
      } else {
        const fileBlock = createFileBlock(messageId, file, {
          status: MessageBlockStatus.SUCCESS,
        })
        blocks.push(fileBlock)
        blockIds.push(fileBlock.id)
      }
    })
  }

  // 直接在createMessage中传入id
  const message = createMessage('user', session.id, {
    id: messageId, // 直接传入ID，避免冲突
    blocks: blockIds,
    usage,
  })

  // 不再需要手动合并ID
  return { message, blocks }
}
