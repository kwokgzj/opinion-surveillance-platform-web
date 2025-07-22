import { defineStore } from 'pinia'
import {
  type CitationMessageBlock,
  type MessageBlock,
  MessageBlockType,
} from '@/RevoAI/types/newMessage'

// 定义状态接口
export interface MessageBlocksState {
  entities: Record<string, MessageBlock>
  ids: string[]
  loadingState: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

export const useMessageBlocksStore = defineStore('messageBlocks', {
  state: () => ({
    entities: {} as Record<string, MessageBlock>,
    ids: [] as string[],
    loadingState: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  }),

  actions: {
    // 添加或更新单个块 (Upsert)
    upsertOneBlock(block: MessageBlock) {
      this.entities[block.id] = block
      if (!this.ids.includes(block.id)) {
        this.ids.push(block.id)
      }
    },

    // 添加或更新多个块
    upsertManyBlocks(blocks: MessageBlock[]) {
      blocks.forEach((block) => {
        this.entities[block.id] = block
        if (!this.ids.includes(block.id)) {
          this.ids.push(block.id)
        }
      })
    },

    // 根据 ID 移除单个块
    removeOneBlock(id: string) {
      delete this.entities[id]
      this.ids = this.ids.filter((blockId) => blockId !== id)
    },

    // 根据 ID 列表移除多个块
    removeManyBlocks(ids: string[]) {
      ids.forEach((id) => {
        delete this.entities[id]
      })
      this.ids = this.ids.filter((blockId) => !ids.includes(blockId))
    },

    // 移除所有块
    removeAllBlocks() {
      this.entities = {}
      this.ids = []
    },

    // 设置加载状态
    setMessageBlocksLoading(loadingState: 'idle' | 'loading') {
      this.loadingState = loadingState
      this.error = null
    },

    // 设置错误状态
    setMessageBlocksError(error: string) {
      this.loadingState = 'failed'
      this.error = error
    },

    // 更新现有块
    updateOneBlock(update: { id: string; changes: Partial<MessageBlock> }) {
      const { id, changes } = update
      if (this.entities[id]) {
        this.entities[id] = { ...this.entities[id], ...changes } as MessageBlock
      }
    },
  },

  getters: {
    // 获取所有块
    selectAll(): MessageBlock[] {
      return this.ids.map((id) => this.entities[id])
    },

    // 根据 ID 获取块
    selectById:
      (state) =>
      (id: string): MessageBlock | undefined => {
        return state.entities[id]
      },

    // 根据块 ID 获取格式化的引用
    selectFormattedCitationsByBlockId:
      (state) =>
      (blockId: string | undefined): any[] => {
        if (!blockId) return []

        const blockEntity = state.entities[blockId]
        if (blockEntity?.type === 'citation') {
          return formatCitationsFromBlock(blockEntity as CitationMessageBlock)
        }
        return []
      },
  },
})

// --- 集中式引用格式化逻辑 ---
export const formatCitationsFromBlock = (block: CitationMessageBlock | undefined): any[] => {
  if (!block) return []

  let formattedCitations: any[] = []
  // 1. 处理网络搜索响应
  if (block.response) {
    formattedCitations =
      (block.response.results as any)?.results?.map((result: any, index: number) => ({
        number: index + 1,
        url: result.url,
        title: result.title,
        content: result.content,
        sourceIcon: result.sourceIcon,
      })) || []
  }

  // 4. 按 URL 去重非知识引用并按顺序重新编号
  const urlSet = new Set<string>()
  return formattedCitations
    .filter((citation) => {
      if (citation.type === 'knowledge') return true
      if (!citation.url || urlSet.has(citation.url)) return false
      urlSet.add(citation.url)
      return true
    })
    .map((citation, index) => ({
      ...citation,
      number: index + 1,
    }))
}
