import BaseProvider from './BaseProvider'
import ProviderFactory from './ProviderFactory'
import type { MCPTool, Model, Session } from '@/RevoAI/types'
import type { Chunk } from '@/RevoAI/types/chunk'
import type { Message } from '@/RevoAI/types/newMessage'

export interface CompletionsParams {
  messages: Message[]
  session: Session
  onChunk: (chunk: Chunk) => void
  onFilterMessages: (messages: Message[]) => void
  mcpTools?: MCPTool[]
}

export default class AiProvider {
  private sdk: BaseProvider

  constructor() {
    this.sdk = ProviderFactory.create()
  }

  public async fakeCompletions(params: CompletionsParams): Promise<void> {
    return this.sdk.fakeCompletions(params)
  }

  public async completions({
    messages,
    session,
    mcpTools,
    onChunk,
    onFilterMessages,
  }: CompletionsParams): Promise<void> {
    return this.sdk.completions({
      messages,
      session,
      mcpTools,
      onChunk,
      onFilterMessages,
    })
  }

  public async summaries(messages: Message[], session: Session): Promise<string> {
    return this.sdk.summaries(messages, session)
  }

  public async summaryForSearch(messages: Message[], model: Model): Promise<string | null> {
    return this.sdk.summaryForSearch(messages, model)
  }

  public getApiKey(): string {
    return this.sdk.getApiKey()
  }

  public getBaseURL(): string {
    return this.sdk.getBaseURL()
  }
}
