import { getOpenAIWebSearchParams, isSupportedFlexServiceTier } from '@/RevoAI/config/models'
import { extractReasoningMiddleware } from '@/RevoAI/middlewares/extractReasoningMiddleware'
import { EVENT_NAMES } from '@/RevoAI/services/EventService'
import {
  filterContextMessages,
  filterEmptyMessages,
  filterUserRoleStartMessages,
} from '@/RevoAI/services/MessagesService'
import { processReqMessages } from '@/RevoAI/services/ModelMessageService'
import type {
  Session,
  FileTypes,
  MCPCallToolResponse,
  MCPTool,
  MCPToolResponse,
  Metrics,
  Model,
  Provider,
  ToolCallResponse,
  Usage,
} from '@/RevoAI/types'
import { ChunkType, type LLMWebSearchCompleteChunk } from '@/RevoAI/types/chunk'
import type { Message } from '@/RevoAI/types/newMessage'
import { removeSpecialCharactersForSessionName } from '@/RevoAI/utils'
import { addImageFileToContents } from '@/RevoAI/utils/formats'
import { convertLinks } from '@/RevoAI/utils/linkConverter'
import {
  isEnabledToolUse,
  mcpToolCallResponseToOpenAICompatibleMessage,
  mcpToolsToOpenAIChatTools,
  openAIToolsToMcpTool,
  parseAndCallTools,
} from '@/RevoAI/utils/mcp-tools'
import {
  findFileBlocks,
  findImageBlocks,
  getMainTextContent,
} from '@/RevoAI/utils/messageUtils/find'
import { asyncGeneratorToReadableStream, readableStreamAsyncIterable } from '@/RevoAI/utils/stream'
import { isEmpty, takeRight } from 'lodash'
import OpenAI from 'openai'
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from 'openai/resources'

import type { CompletionsParams } from '.'
import BaseProvider from './BaseProvider'
import { SEARCH_SUMMARY_PROMPT_WEB_ONLY } from '@/RevoAI/config/prompts'
import { buildSystemPrompt } from '@/RevoAI/utils/prompt'

// 1. 定义联合类型
export type OpenAIStreamChunk =
  | { type: 'reasoning' | 'text-delta'; textDelta: string }
  | { type: 'tool-calls'; delta: any }
  | { type: 'finish'; finishReason: any; usage: any; delta: any; chunk: any }
  | { type: 'unknown'; chunk: any }

export default class OpenAIProvider extends BaseProvider {
  protected sdk: OpenAI

  constructor(provider: Provider) {
    super(provider)

    this.sdk = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: this.apiKey,
      baseURL: this.getBaseURL(),
      defaultHeaders: {
        ...this.defaultHeaders(),
      },
    })
  }

  // protected getTimeout(model: Model) {
  //   if (isSupportedFlexServiceTier(model)) {
  //     return 15 * 1000 * 60;
  //   }
  //   return 5 * 1000 * 60;
  // }

  /**
   * Get the message parameter
   * @param message - The message
   * @param model - The model
   * @returns The message parameter
   */
  protected async getMessageParam(
    message: Message,
    model: Model,
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam> {
    const isVision = model.abilityList?.includes('vision')
    const content = await this.getMessageContent(message)
    const fileBlocks = findFileBlocks(message)
    const imageBlocks = findImageBlocks(message)

    if (fileBlocks.length === 0 && imageBlocks.length === 0) {
      return {
        role: message.role === 'system' ? 'user' : message.role,
        content,
      }
    }

    // If the model supports files, add the file content to the message
    const parts: ChatCompletionContentPart[] = []

    if (content) {
      parts.push({ type: 'text', text: content })
    }

    for (const imageBlock of imageBlocks) {
      if (isVision) {
        if (imageBlock.file) {
          // let fileExists = false;
          // try {
          //   if (await window.api.fs.existSync(imageBlock.file.path))
          //     fileExists = true;
          // } catch {}
          // if (fileExists) {
          //   const image = await window.api.file.base64Image(
          //     imageBlock.file.id + imageBlock.file.ext
          //   );
          parts.push({
            type: 'image_url',
            image_url: { url: imageBlock.file.content || '' },
          })
          // } else if (imageBlock.file.internalFileUrl) {
          //   parts.push({
          //     type: "image_url",
          //     image_url: { url: imageBlock.file.internalFileUrl },
          //   });
          // } else if (imageBlock.file.externalFileUrl) {
          //   parts.push({
          //     type: "image_url",
          //     image_url: { url: imageBlock.file.externalFileUrl },
          //   });
          // }
        } else if (imageBlock.url && imageBlock.url.startsWith('data:')) {
          parts.push({ type: 'image_url', image_url: { url: imageBlock.url } })
        }
      }
    }

    for (const fileBlock of fileBlocks) {
      const file = fileBlock.file
      if (!file) {
        continue
      }
      parts.push({
        type: 'text',
        text: file.name + '\n' + file.content,
      })
      // 如果本地不存在，尝试用internalFileUrl下载
      // if (!fileExists && file.internalFileUrl) {
      //   try {
      //     const downloaded = await window.api.file.download(
      //       file.internalFileUrl
      //     );
      //     if (downloaded && downloaded.path) {
      //       filePath = downloaded.path;
      //       file.path = downloaded.path;
      //       fileExists = true;
      //     }
      //   } catch {}
      // }
      // if (!fileExists && file.externalFileUrl) {
      //   try {
      //     const downloaded = await window.api.file.download(
      //       file.externalFileUrl
      //     );
      //     if (downloaded && downloaded.path) {
      //       filePath = downloaded.path;
      //       file.path = downloaded.path;
      //       fileExists = true;
      //     }
      //   } catch {}
      // }
      // if (
      //   [FileTypes.TEXT, FileTypes.DOCUMENT].includes(file.type) &&
      //   fileExists
      // ) {
      //   const fileContent = (
      //     await window.api.file.read(file.id + file.ext)
      //   ).trim();
      //   parts.push({
      //     type: "text",
      //     text: file.origin_name + "\n" + fileContent,
      //   });
      // }
    }

    return {
      role: message.role === 'system' ? 'user' : message.role,
      content: parts,
    } as ChatCompletionMessageParam
  }

  override getTemperature(session: Session, model: Model): number | undefined {
    if (model.abilityList?.includes('reasoning')) {
      return undefined
    }
    return session.settings?.temperature
  }

  override getTopP(session: Session, model: Model): number | undefined {
    if (model.abilityList?.includes('reasoning')) {
      return undefined
    }
    return session.settings?.topP
  }

  /**
   * Get the provider specific parameters for the session
   * @param session - The session
   * @param model - The model
   * @returns The provider specific parameters
   */
  private getProviderSpecificParameters(session: Session, model: Model) {
    const { maxTokens } = session.settings

    if (model.abilityList?.includes('reasoning')) {
      return {
        max_tokens: undefined,
        max_completion_tokens: maxTokens && maxTokens < 0 ? undefined : maxTokens,
      }
    }

    return {}
  }

  public convertMcpTools<T>(mcpTools: MCPTool[]): T[] {
    return mcpToolsToOpenAIChatTools(mcpTools) as T[]
  }

  public mcpToolCallResponseToMessage = (
    mcpToolResponse: MCPToolResponse,
    resp: MCPCallToolResponse,
    model: Model,
  ) => {
    if ('toolUseId' in mcpToolResponse && mcpToolResponse.toolUseId) {
      return mcpToolCallResponseToOpenAICompatibleMessage(
        mcpToolResponse,
        resp,
        model.abilityList?.includes('vision'),
      )
    } else if ('toolCallId' in mcpToolResponse && mcpToolResponse.toolCallId) {
      const toolCallOut: ChatCompletionToolMessageParam = {
        role: 'tool',
        tool_call_id: mcpToolResponse.toolCallId,
        content: JSON.stringify(resp.content),
      }
      return toolCallOut
    }
    return
  }

  /**
   * Generate completions for the session
   * @param messages - The messages
   * @param session - The session
   * @param mcpTools - The MCP tools
   * @param onChunk - The onChunk callback
   * @param onFilterMessages - The onFilterMessages callback
   * @returns The completions
   */
  async completions({
    messages,
    session,
    mcpTools,
    onChunk,
    onFilterMessages,
  }: CompletionsParams): Promise<void> {
    const model = session.model

    const {
      contextCount,
      maxTokens,
      streamOutput,
      stopSequences,
      presencePenalty,
      frequencyPenalty,
    } = session.settings
    // const isEnabledBultinWebSearch = session.enableWebSearch && isWebSearchModel(model)
    messages = addImageFileToContents(messages)
    const enableReasoning = model.abilityList?.includes('reasoning')

    // 根据用户语言设置获取合适的提示
    let systemMessage = { role: 'system', content: session.prompt || '' }
    const { tools } = this.setupToolsConfig<ChatCompletionTool>({
      mcpTools,
      enableToolUse: isEnabledToolUse(session),
    })

    if (this.useSystemPromptForTools) {
      systemMessage.content = await buildSystemPrompt(systemMessage.content || '', mcpTools)
    }

    const userMessages: ChatCompletionMessageParam[] = []
    const _messages = filterUserRoleStartMessages(
      filterEmptyMessages(filterContextMessages(takeRight(messages, contextCount || 5 + 1))),
    )

    onFilterMessages(_messages)

    for (const message of _messages) {
      userMessages.push(await this.getMessageParam(message, model))
    }

    const isSupportStreamOutput = () => {
      return streamOutput
    }

    const lastUserMessage = _messages.find((m: any) => m.role === 'user')
    const { abortController, cleanup, signalPromise } = this.createAbortController(
      lastUserMessage?.id,
      true,
    )
    const { signal } = abortController

    //当 systemMessage 内容为空时不发送 systemMessage
    let reqMessages: ChatCompletionMessageParam[]
    if (!systemMessage.content) {
      reqMessages = [...userMessages]
    } else {
      reqMessages = [systemMessage, ...userMessages].filter(Boolean) as ChatCompletionMessageParam[]
    }

    let finalUsage: Usage = {
      completion_tokens: 0,
      prompt_tokens: 0,
      total_tokens: 0,
    }

    const finalMetrics: Metrics = {
      completion_tokens: 0,
      time_completion_millsec: 0,
      time_first_token_millsec: 0,
    }

    const toolResponses: MCPToolResponse[] = []

    const processToolResults = async (
      toolResults: Awaited<ReturnType<typeof parseAndCallTools>>,
      idx: number,
    ) => {
      if (toolResults.length === 0) return

      toolResults.forEach((ts) => reqMessages.push(ts as ChatCompletionMessageParam))

      console.debug('[tool] reqMessages before processing', model.id, reqMessages)
      reqMessages = processReqMessages(model, reqMessages)
      console.debug('[tool] reqMessages', model.id, reqMessages)

      onChunk({ type: ChunkType.LLM_RESPONSE_CREATED })
      const newStream = await this.sdk.chat.completions
        // @ts-ignore key is not typed
        .create(
          {
            model: model.id,
            messages: reqMessages,
            temperature: this.getTemperature(session, model),
            top_p: this.getTopP(session, model),
            max_tokens: maxTokens && maxTokens > 0 ? maxTokens : undefined,
            // keep_alive: this.keepAliveTime,
            stream: isSupportStreamOutput(),
            tools: !isEmpty(tools) ? tools : undefined,
            ...getOpenAIWebSearchParams(session, model),
          },
          {
            signal,
          },
        )
      await processStream(newStream, idx + 1)
    }

    const processToolCalls = async (mcpTools: any, toolCalls: ChatCompletionMessageToolCall[]) => {
      const mcpToolResponses = toolCalls
        .map((toolCall) => {
          const mcpTool = openAIToolsToMcpTool(mcpTools, toolCall as ChatCompletionMessageToolCall)
          if (!mcpTool) return undefined

          const parsedArgs = (() => {
            try {
              return JSON.parse(toolCall.function.arguments)
            } catch {
              return toolCall.function.arguments
            }
          })()

          return {
            id: toolCall.id,
            toolCallId: toolCall.id,
            tool: mcpTool,
            arguments: parsedArgs,
            status: 'pending',
          } as ToolCallResponse
        })
        .filter((t): t is ToolCallResponse => typeof t !== 'undefined')
      return await parseAndCallTools(
        mcpToolResponses,
        toolResponses,
        onChunk,
        this.mcpToolCallResponseToMessage,
        model,
        mcpTools,
      )
    }

    const processToolUses = async (content: string) => {
      return await parseAndCallTools(
        content,
        toolResponses,
        onChunk,
        this.mcpToolCallResponseToMessage,
        model,
        mcpTools,
      )
    }

    const processStream = async (stream: any, idx: number) => {
      const toolCalls: ChatCompletionMessageToolCall[] = []
      let time_first_token_millsec = 0

      // Handle non-streaming case (already returns early, no change needed here)
      if (!isSupportStreamOutput()) {
        // Calculate final metrics once
        finalMetrics.completion_tokens = stream.usage?.completion_tokens
        finalMetrics.time_completion_millsec = new Date().getTime() - start_time_millsec

        // Create a synthetic usage object if stream.usage is undefined
        finalUsage = { ...stream.usage }
        // Separate onChunk calls for text and usage/metrics
        let content = ''
        stream.choices.forEach((choice: any) => {
          const reasoning = choice.message.reasoning || choice.message.reasoning_content
          // reasoning
          if (reasoning) {
            onChunk({
              type: ChunkType.THINKING_DELTA,
              text: reasoning,
            })
            onChunk({
              type: ChunkType.THINKING_COMPLETE,
              text: reasoning,
              thinking_millsec: new Date().getTime() - start_time_millsec,
            })
          }
          // text
          if (choice.message.content) {
            content += choice.message.content
            onChunk({
              type: ChunkType.TEXT_DELTA,
              text: choice.message.content,
            })
          }
          // tool call
          if (choice.message.tool_calls && choice.message.tool_calls.length) {
            choice.message.tool_calls.forEach((t: any) => toolCalls.push(t))
          }

          reqMessages.push({
            role: choice.message.role,
            content: choice.message.content,
            tool_calls: toolCalls.length
              ? toolCalls.map((toolCall) => ({
                  id: toolCall.id,
                  function: {
                    ...toolCall.function,
                    arguments:
                      typeof toolCall.function.arguments === 'string'
                        ? toolCall.function.arguments
                        : JSON.stringify(toolCall.function.arguments),
                  },
                  type: 'function',
                }))
              : undefined,
          })
        })

        if (content.length) {
          onChunk({ type: ChunkType.TEXT_COMPLETE, text: content })
        }

        const toolResults: Awaited<ReturnType<typeof parseAndCallTools>> = []
        if (toolCalls.length) {
          toolResults.push(...(await processToolCalls(mcpTools, toolCalls)))
        }
        if (stream.choices[0].message?.content) {
          toolResults.push(...(await processToolUses(stream.choices[0].message?.content)))
        }
        await processToolResults(toolResults, idx)

        // Always send usage and metrics data
        onChunk({
          type: ChunkType.BLOCK_COMPLETE,
          response: { usage: finalUsage, metrics: finalMetrics },
        })
        return
      }

      let content = ''
      let thinkingContent = ''
      let isFirstChunk = true

      // 1. 初始化中间件
      const reasoningTags = [
        { openingTag: '<think>', closingTag: '</think>', separator: '\n' },
        {
          openingTag: '###Thinking',
          closingTag: '###Response',
          separator: '\n',
        },
      ]
      const getAppropriateTag = (model: Model) => {
        if (model.id.includes('qwen3')) return reasoningTags[0]
        return reasoningTags[0]
      }
      const reasoningTag = getAppropriateTag(model)
      async function* openAIChunkToTextDelta(stream: any): AsyncGenerator<OpenAIStreamChunk> {
        for await (const chunk of stream) {
          if (window.keyv.get(EVENT_NAMES.CHAT_COMPLETION_PAUSED)) {
            break
          }

          if (chunk.choices && chunk.choices.length > 0) {
            const delta = chunk.choices[0]?.delta
            if (
              (delta?.reasoning_content && delta?.reasoning_content !== '\n') ||
              (delta?.reasoning && delta?.reasoning !== '\n')
            ) {
              yield {
                type: 'reasoning',
                textDelta: delta.reasoning_content || delta.reasoning,
              }
            }
            if (delta?.content) {
              yield { type: 'text-delta', textDelta: delta.content }
            }
            if (delta?.tool_calls) {
              yield { type: 'tool-calls', delta: delta }
            }

            const finishReason = chunk?.choices[0]?.finish_reason
            if (!isEmpty(finishReason)) {
              yield {
                type: 'finish',
                finishReason,
                usage: chunk.usage,
                delta,
                chunk,
              }
              break
            }
          } else {
            yield { type: 'unknown', chunk }
          }
        }
      }

      // 2. 使用中间件
      const { stream: processedStream } = await extractReasoningMiddleware<OpenAIStreamChunk>({
        openingTag: reasoningTag?.openingTag,
        closingTag: reasoningTag?.closingTag,
        separator: reasoningTag?.separator,
        enableReasoning,
      }).wrapStream({
        doStream: async () => ({
          stream: asyncGeneratorToReadableStream(openAIChunkToTextDelta(stream)),
        }),
      })

      // 3. 消费 processedStream，分发 onChunk
      for await (const chunk of readableStreamAsyncIterable(processedStream)) {
        const delta = chunk.type === 'finish' ? chunk.delta : chunk
        const rawChunk = chunk.type === 'finish' ? chunk.chunk : chunk

        switch (chunk.type) {
          case 'reasoning': {
            if (time_first_token_millsec === 0) {
              time_first_token_millsec = new Date().getTime()
            }
            thinkingContent += chunk.textDelta
            onChunk({
              type: ChunkType.THINKING_DELTA,
              text: chunk.textDelta,
              thinking_millsec: new Date().getTime() - time_first_token_millsec,
            })
            break
          }
          case 'text-delta': {
            let textDelta = chunk.textDelta
            if (session.enableWebSearch && delta) {
              const originalDelta = rawChunk?.choices?.[0]?.delta

              if (originalDelta?.annotations) {
                textDelta = convertLinks(textDelta, isFirstChunk)
              }
            }
            if (isFirstChunk) {
              isFirstChunk = false
              if (time_first_token_millsec === 0) {
                time_first_token_millsec = new Date().getTime()
              } else {
                onChunk({
                  type: ChunkType.THINKING_COMPLETE,
                  text: thinkingContent,
                  thinking_millsec: new Date().getTime() - time_first_token_millsec,
                })
              }
            }
            content += textDelta
            onChunk({ type: ChunkType.TEXT_DELTA, text: textDelta })
            break
          }
          case 'tool-calls': {
            if (isFirstChunk) {
              isFirstChunk = false
              if (time_first_token_millsec === 0) {
                time_first_token_millsec = new Date().getTime()
              } else {
                onChunk({
                  type: ChunkType.THINKING_COMPLETE,
                  text: thinkingContent,
                  thinking_millsec: new Date().getTime() - time_first_token_millsec,
                })
              }
            }
            chunk.delta.tool_calls.forEach((toolCall: any) => {
              const { id, index, type, function: fun } = toolCall
              if (id && type === 'function' && fun) {
                const { name, arguments: args } = fun
                toolCalls.push({
                  id,
                  function: {
                    name: name || '',
                    arguments: args || '',
                  },
                  type: 'function',
                })
              } else if (fun?.arguments) {
                toolCalls[index].function.arguments += fun.arguments
              }
            })
            break
          }
          case 'finish': {
            const finishReason = chunk.finishReason
            const usage = chunk.usage
            const originalFinishDelta = chunk.delta
            // const originalFinishRawChunk = chunk.chunk
            if (!isEmpty(finishReason)) {
              if (content) {
                onChunk({ type: ChunkType.TEXT_COMPLETE, text: content })
              }
              if (thinkingContent) {
                onChunk({
                  type: ChunkType.THINKING_COMPLETE,
                  text: thinkingContent,
                  thinking_millsec: new Date().getTime() - time_first_token_millsec,
                })
              }
              if (usage) {
                finalUsage.completion_tokens += usage.completion_tokens || 0
                finalUsage.prompt_tokens += usage.prompt_tokens || 0
                finalUsage.total_tokens += usage.total_tokens || 0
                finalMetrics.completion_tokens += usage.completion_tokens || 0
              }
              finalMetrics.time_completion_millsec += new Date().getTime() - start_time_millsec
              finalMetrics.time_first_token_millsec = time_first_token_millsec - start_time_millsec
              if (originalFinishDelta?.annotations) {
                onChunk({
                  type: ChunkType.LLM_WEB_SEARCH_COMPLETE,
                  llm_web_search: {
                    results: originalFinishDelta.annotations,
                  },
                } as LLMWebSearchCompleteChunk)
              }
            }
            break
          }
          case 'unknown': {
            onChunk({
              type: ChunkType.ERROR,
              error: chunk.chunk,
            })
          }
        }
      }

      reqMessages.push({
        role: 'assistant',
        content: content,
        tool_calls: toolCalls.length
          ? toolCalls.map((toolCall) => ({
              id: toolCall.id,
              function: {
                ...toolCall.function,
                arguments:
                  typeof toolCall.function.arguments === 'string'
                    ? toolCall.function.arguments
                    : JSON.stringify(toolCall.function.arguments),
              },
              type: 'function',
            }))
          : undefined,
      })
      let toolResults: Awaited<ReturnType<typeof parseAndCallTools>> = []
      if (toolCalls.length) {
        toolResults = await processToolCalls(mcpTools, toolCalls)
      }
      if (content.length) {
        toolResults = toolResults.concat(await processToolUses(content))
      }
      if (toolResults.length) {
        await processToolResults(toolResults, idx)
      }
      onChunk({
        type: ChunkType.BLOCK_COMPLETE,
        response: {
          usage: finalUsage,
          metrics: finalMetrics,
        },
      })
    }

    reqMessages = processReqMessages(model, reqMessages)
    // 等待接口返回流
    onChunk({ type: ChunkType.LLM_RESPONSE_CREATED })
    const start_time_millsec = new Date().getTime()
    const stream = await this.sdk.chat.completions
      // @ts-ignore key is not typed
      .create(
        {
          model: model.id,
          messages: reqMessages,
          temperature: this.getTemperature(session, model),
          top_p: this.getTopP(session, model),
          max_tokens: maxTokens && maxTokens > 0 ? maxTokens : undefined,
          // keep_alive: this.keepAliveTime,
          stream: isSupportStreamOutput(),
          tools: !isEmpty(tools) ? tools : undefined,
          // service_tier: this.getServiceTier(model),
          // ...getOpenAIWebSearchParams(session, model),
          // ...this.getReasoningEffort(session, model), // 暂时关闭推理思维链长度
          ...this.getProviderSpecificParameters(session, model),
          stop:
            Array.isArray(stopSequences) && stopSequences.length > 0 ? stopSequences : undefined,
          presence_penalty: typeof presencePenalty === 'number' ? presencePenalty : undefined,
          frequency_penalty: typeof frequencyPenalty === 'number' ? frequencyPenalty : undefined,
        },
        {
          signal,
        },
      )

    await processStream(stream, 0).finally(cleanup)

    // 捕获signal的错误
    await signalPromise?.promise?.catch((error) => {
      throw error
    })
  }

  /**
   * Summarize a message
   * @param messages - The messages
   * @param session - The session
   * @returns The summary
   */
  public async summaries(messages: Message[], session: Session): Promise<string> {
    const model = {
      id: 'deepseek-v3-250324',
    }
    const userMessages = takeRight(messages, 5)
      .filter((message) => !message.isPreset)
      .map((message) => ({
        role: message.role,
        content: getMainTextContent(message),
      }))

    const userMessageContent = userMessages.reduce((prev, curr) => {
      const content = curr.role === 'user' ? `User: ${curr.content}` : `Session: ${curr.content}`
      return prev + (prev ? '\n' : '') + content
    }, '')

    const systemMessage = {
      role: 'system',
      content:
        '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题，标题语言与用户的首要语言一致，不要使用标点符号和其他特殊符号',
    }

    const userMessage = {
      role: 'user',
      content: userMessageContent,
    }

    // @ts-ignore key is not typed
    const response = await this.sdk.chat.completions.create({
      model: model.id,
      messages: [systemMessage, userMessage] as ChatCompletionMessageParam[],
      stream: false,
      // keep_alive: this.keepAliveTime,
      max_tokens: 1000,
    })

    // 针对思考类模型的返回，总结仅截取</think>之后的内容
    let content = response.choices[0].message?.content || ''
    content = content.replace(/^<think>(.*?)<\/think>/s, '')

    return removeSpecialCharactersForSessionName(content.substring(0, 50))
  }

  /**
   * Summarize a message for search
   * @param messages - The messages
   * @param model - The model
   * @returns The summary
   */
  public async summaryForSearch(messages: Message[], model: Model): Promise<string | null> {
    const systemMessage = {
      role: 'system',
      content: SEARCH_SUMMARY_PROMPT_WEB_ONLY,
    }

    const messageContents = messages.map((m) => getMainTextContent(m))
    const userMessageContent = messageContents.join('\n')

    const userMessage = {
      role: 'user',
      content: userMessageContent,
    }

    const lastUserMessage = messages[messages.length - 1]

    const { abortController, cleanup } = this.createAbortController(lastUserMessage?.id)
    const { signal } = abortController

    const response = await this.sdk.chat.completions
      // @ts-ignore key is not typed
      .create(
        {
          model: model.id,
          messages: [systemMessage, userMessage] as ChatCompletionMessageParam[],
          stream: false,
          max_tokens: 1000,
        },
        {
          timeout: 20 * 1000,
          signal: signal,
        },
      )
      .finally(cleanup)

    // 针对思考类模型的返回，总结仅截取</think>之后的内容
    let content = response.choices[0].message?.content || ''
    content = content.replace(/^<think>(.*?)<\/think>/s, '')

    return content
  }
}
