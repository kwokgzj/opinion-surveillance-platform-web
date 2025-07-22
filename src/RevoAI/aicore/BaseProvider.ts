import { isNotSupportTemperatureAndTopP } from '@/RevoAI/config/models'
import { REFERENCE_PROMPT } from '@/RevoAI/config/prompts'
import type {
  Session,
  MCPCallToolResponse,
  MCPTool,
  MCPToolResponse,
  Model,
  Provider,
  WebSearchResponse,
} from '@/RevoAI/types'
import { ChunkType } from '@/RevoAI/types/chunk'
import type { Message } from '@/RevoAI/types/newMessage'
import { delay } from '@/RevoAI/utils'
import { addAbortController, removeAbortController } from '@/RevoAI/utils/abortController'
import { formatApiHost } from '@/RevoAI/utils/api'
import { getMainTextContent } from '@/RevoAI/utils/messageUtils/find'
import { isEmpty } from 'lodash'

import type { CompletionsParams } from '.'

export default abstract class BaseProvider {
  // Threshold for determining whether to use system prompt for tools
  private static readonly SYSTEM_PROMPT_THRESHOLD: number = 128

  protected provider: Provider
  protected host: string
  protected apiKey: string

  protected useSystemPromptForTools: boolean = true

  constructor(provider: Provider) {
    this.provider = provider
    this.host = this.getBaseURL()
    this.apiKey = this.getApiKey()
  }

  abstract completions({
    messages,
    session,
    onChunk,
    onFilterMessages,
  }: CompletionsParams): Promise<void>
  abstract summaries(messages: Message[], session: Session): Promise<string>
  abstract summaryForSearch(messages: Message[], model: Model): Promise<string | null>
  public abstract convertMcpTools<T>(mcpTools: MCPTool[]): T[]
  public abstract mcpToolCallResponseToMessage(
    mcpToolResponse: MCPToolResponse,
    resp: MCPCallToolResponse,
    model: Model,
  ): any

  public getBaseURL(): string {
    const host = this.provider.apiHost
    return formatApiHost(host)
  }

  public getApiKey() {
    const keys = this.provider.apiKey.split(',').map((key) => key.trim())
    const keyName = `provider:${this.provider.id}:last_used_key`

    if (keys.length === 1) {
      return keys[0]
    }

    const lastUsedKey = window.keyv.get(keyName)
    if (!lastUsedKey) {
      window.keyv.set(keyName, keys[0])
      return keys[0]
    }

    const currentIndex = keys.indexOf(lastUsedKey)
    const nextIndex = (currentIndex + 1) % keys.length
    const nextKey = keys[nextIndex]
    window.keyv.set(keyName, nextKey)

    return nextKey
  }

  public defaultHeaders() {
    return {
      'HTTP-Referer': 'http://192.168.2.21:9300',
      'X-Title': 'Revo AI',
      'X-Api-Key': this.apiKey,
    }
  }

  public getTemperature(session: Session, model: Model): number | undefined {
    return isNotSupportTemperatureAndTopP(model) ? undefined : session.settings?.temperature
  }

  public getTopP(session: Session, model: Model): number | undefined {
    return isNotSupportTemperatureAndTopP(model) ? undefined : session.settings?.topP
  }

  public async fakeCompletions({ onChunk }: CompletionsParams) {
    for (let i = 0; i < 100; i++) {
      await delay(0.01)
      onChunk({
        response: {
          text: i + '\n',
          usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
        },
        type: ChunkType.BLOCK_COMPLETE,
      })
    }
  }

  public async getMessageContent(message: Message): Promise<string> {
    const content = getMainTextContent(message)
    if (isEmpty(content)) {
      return ''
    }

    const webSearchReferences = await this.getWebSearchReferencesFromCache(message)

    const allReferences = [...webSearchReferences]

    // console.log(
    //   `Found ${allReferences.length} references for ID: ${message.id}`,
    //   allReferences
    // );

    if (!isEmpty(allReferences)) {
      const referenceContent = `\`\`\`json\n${JSON.stringify(allReferences, null, 2)}\n\`\`\``
      return REFERENCE_PROMPT.replace('{question}', content).replace(
        '{references}',
        referenceContent,
      )
    }

    return content
  }

  private async getWebSearchReferencesFromCache(message: Message) {
    const content = getMainTextContent(message)
    if (isEmpty(content)) {
      return []
    }
    const webSearch: WebSearchResponse = window.keyv.get(`web-search-${message.id}`)

    if (webSearch) {
      return (webSearch.results as any).results.map((result: any, index: any) => ({
        id: index + 1,
        content: result.content,
        sourceUrl: result.url,
        type: 'url',
      }))
    }

    return []
  }

  protected createAbortController(messageId?: string, isAddEventListener?: boolean) {
    const abortController = new AbortController()
    const abortFn = () => abortController.abort()

    if (messageId) {
      addAbortController(messageId, abortFn)
    }

    const cleanup = () => {
      if (messageId) {
        signalPromise.resolve?.(undefined)
        removeAbortController(messageId, abortFn)
      }
    }
    const signalPromise: {
      resolve: (value: unknown) => void
      promise: Promise<unknown>
    } = {
      resolve: () => {},
      promise: Promise.resolve(),
    }

    if (isAddEventListener) {
      signalPromise.promise = new Promise((resolve, reject) => {
        signalPromise.resolve = resolve
        if (abortController.signal.aborted) {
          reject(new Error('Request was aborted.'))
        }
        // 捕获abort事件,有些abort事件必须
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('Request was aborted.'))
        })
      })
      return {
        abortController,
        cleanup,
        signalPromise,
      }
    }
    return {
      abortController,
      cleanup,
    }
  }

  // Setup tools configuration based on provided parameters
  protected setupToolsConfig<T>(params: { mcpTools?: MCPTool[]; enableToolUse?: boolean }): {
    tools: T[]
  } {
    const { mcpTools, enableToolUse } = params
    let tools: T[] = []

    // If there are no tools, return an empty array
    if (!mcpTools?.length) {
      return { tools }
    }

    // If the number of tools exceeds the threshold, use the system prompt
    if (mcpTools.length > BaseProvider.SYSTEM_PROMPT_THRESHOLD) {
      this.useSystemPromptForTools = true
      return { tools }
    }

    // If the model supports function calling and tool usage is enabled
    if (enableToolUse) {
      tools = this.convertMcpTools<T>(mcpTools)
      this.useSystemPromptForTools = false
    }

    return { tools }
  }
}
