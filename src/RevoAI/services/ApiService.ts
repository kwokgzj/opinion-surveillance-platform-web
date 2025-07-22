import http from '@/RevoAI/utils/http'

import { type Chunk, ChunkType } from '@/RevoAI/types/chunk'
import type { Message } from '@/RevoAI/types/newMessage'
import { isAbortError } from '@/RevoAI/utils/error'
import { extractInfoFromXML, type ExtractResults } from '@/RevoAI/utils/extract'
import { getMainTextContent } from '@/RevoAI/utils/messageUtils/find'
import { findLast } from 'lodash'
import mcpManagerServiceInstance from './MCPManagerServiceInstance'
import AiProvider from '@/RevoAI/aicore/index'
import { filterContextMessages, filterMessages, filterUsefulMessages } from './MessagesService'
import WebSearchService from './WebSearchService'
import type { ExternalToolResult, MCPTool, Model, Session, WebSearchResponse } from '@/RevoAI/types'

async function fetchExternalTool(
  lastUserMessage: Message,
  session: Session,
  onChunkReceived: (chunk: Chunk) => void,
  lastAnswer?: Message,
): Promise<ExternalToolResult> {
  const shouldWebSearch = session.enableWebSearch
  // 在工具链开始时发送进度通知
  const willUseTools = shouldWebSearch
  if (willUseTools) {
    onChunkReceived({ type: ChunkType.EXTERNEL_TOOL_IN_PROGRESS })
  }

  // --- Keyword/Question Extraction Function ---
  const extract = async (): Promise<ExtractResults | undefined> => {
    if (!lastUserMessage) return undefined

    // 根据配置决定是否需要提取
    const needWebExtract = shouldWebSearch

    if (!needWebExtract) return undefined

    try {
      const keywords = await fetchSearchSummary({
        messages: lastAnswer ? [lastAnswer, lastUserMessage] : [lastUserMessage],
        model: session.model,
      })

      if (!keywords) return getFallbackResult()

      const extracted = extractInfoFromXML(keywords)
      // 根据需求过滤结果
      return {
        websearch: needWebExtract ? extracted?.websearch : undefined,
      }
    } catch (e: any) {
      console.error('extract error', e)
      if (isAbortError(e)) throw e
      return getFallbackResult()
    }
  }

  const getFallbackResult = (): ExtractResults => {
    const fallbackContent = getMainTextContent(lastUserMessage)
    return {
      websearch: shouldWebSearch ? { question: [fallbackContent || 'search'] } : undefined,
    }
  }

  // --- Web Search Function ---
  const searchTheWeb = async (
    extractResults: ExtractResults | undefined,
  ): Promise<WebSearchResponse | undefined> => {
    if (!shouldWebSearch) return

    // Add check for extractResults existence early
    if (!extractResults?.websearch) {
      console.warn('searchTheWeb called without valid extractResults.websearch')
      return
    }

    if (extractResults.websearch.question[0] === 'not_needed') return

    // Add check for assistant.model before using it
    if (!session.model) {
      console.warn('searchTheWeb called without assistant.model')
      return undefined
    }

    try {
      // Use the consolidated processWebsearch function
      WebSearchService.createAbortSignal(lastUserMessage.id)
      return {
        results: await WebSearchService.processWebsearch(extractResults),
        // source: WebSearchSource.WEBSEARCH
      }
    } catch (error) {
      if (isAbortError(error)) throw error
      console.error('Web search failed:', error)
      return
    }
  }

  // --- Execute Extraction and Searches ---
  let extractResults: ExtractResults | undefined

  try {
    // 根据配置决定是否需要提取
    if (shouldWebSearch) {
      extractResults = await extract()
      console.log('[fetchExternalTool] Extraction results:', extractResults)
    }

    let webSearchResponseFromSearch: WebSearchResponse | undefined

    // 并行执行搜索
    if (shouldWebSearch) {
      webSearchResponseFromSearch = await searchTheWeb(extractResults)
    }

    // 存储搜索结果
    if (lastUserMessage && webSearchResponseFromSearch) {
      window.keyv.set(`web-search-${lastUserMessage.id}`, webSearchResponseFromSearch)
    }

    // 发送工具执行完成通知
    if (willUseTools) {
      onChunkReceived({
        type: ChunkType.EXTERNEL_TOOL_COMPLETE,
        external_tool: {
          webSearch: webSearchResponseFromSearch,
        },
      })
    }

    // Get MCP tools (Fix duplicate declaration)
    let mcpTools: MCPTool[] = await mcpManagerServiceInstance.getAllTools()
    // const enabledMCPs = session?.mcpServers;
    // if (enabledMCPs && enabledMCPs.length > 0) {
    //   try {
    //     const toolPromises = enabledMCPs.map(async (mcpServer) => {
    //       const tools = await mcpManagerServiceInstance.listTools(mcpServer);
    //       console.log("[fetchExternalTool] MCP tools:", tools);
    //       return tools; //.filter((tool: any) => !mcpServer.disabledTools?.includes(tool.name))
    //     });
    //     const results = await Promise.all(toolPromises);
    //     mcpTools = results.flat(); // Flatten the array of arrays
    //   } catch (toolError) {
    //     console.error("Error fetching MCP tools:", toolError);
    //   }
    // }

    return { mcpTools }
  } catch (error) {
    if (isAbortError(error)) throw error
    console.error('Tool execution failed:', error)

    // 发送错误状态
    if (willUseTools) {
      onChunkReceived({
        type: ChunkType.EXTERNEL_TOOL_COMPLETE,
        external_tool: {
          webSearch: undefined,
        },
      })
    }

    return { mcpTools: [] }
  }
}

export async function fetchChatCompletion({
  messages,
  session,
  onChunkReceived,
}: {
  messages: Message[]
  session: Session
  onChunkReceived: (chunk: Chunk) => void
  // TODO
  // onChunkStatus: (status: 'searching' | 'processing' | 'success' | 'error') => void
}) {
  console.log('fetchChatCompletion', messages, session)

  const AI = new AiProvider()

  // Make sure that 'Clear Context' works for all scenarios including external tool and normal chat.
  messages = filterContextMessages(messages)

  const lastUserMessage = findLast(messages, (m) => m.role === 'user')
  // const lastAnswer = findLast(messages, (m) => m.role === 'assistant')
  if (!lastUserMessage) {
    console.error('fetchChatCompletion returning early: Missing lastUserMessage or lastAnswer')
    return
  }
  // try {
  // NOTE: The search results are NOT added to the messages sent to the AI here.
  // They will be retrieved and used by the messageThunk later to create CitationBlocks.
  const { mcpTools } = await fetchExternalTool(lastUserMessage, session, onChunkReceived)

  const filteredMessages = filterUsefulMessages(messages)

  // --- Call AI Completions ---
  await AI.completions({
    messages: filteredMessages,
    session,
    onFilterMessages: () => {},
    onChunk: onChunkReceived,
    mcpTools,
  })
}

export async function fetchMessagesSummary(session: Session) {
  const AI = new AiProvider()
  try {
    const text = await AI.summaries(filterMessages(session.messages), session)
    return text?.replace(/["']/g, '') || null
  } catch (error: any) {
    return null
  }
}

export async function fetchSearchSummary({
  messages,
  model,
}: {
  messages: Message[]
  model: Model
}) {
  const AI = new AiProvider()
  return await AI.summaryForSearch(messages, model)
}

export async function fetchModels() {
  try {
    const res = await http.get('/api/models')
    return res.data.map((item: any) => ({
      ...item,
      id: item.name,
    }))
  } catch (error) {
    console.error('fetchModels error:', error)
    return []
  }
}
