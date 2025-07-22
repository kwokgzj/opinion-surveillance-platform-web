import { useMcpStore } from '@/RevoAI/store'
import type {
  Session,
  MCPCallToolResponse,
  MCPServer,
  MCPTool,
  MCPToolResponse,
  Model,
  ToolUseResponse,
} from '@/RevoAI/types'
import type { MCPToolCompleteChunk, MCPToolInProgressChunk } from '@/RevoAI/types/chunk'
import { ChunkType } from '@/RevoAI/types/chunk'
import { isArray, isObject, pull, transform } from 'lodash'
import OpenAI from 'openai'
import {
  type ChatCompletionContentPart,
  type ChatCompletionMessageParam,
  type ChatCompletionMessageToolCall,
  type ChatCompletionTool,
} from 'openai/resources'

import type { CompletionsParams } from '@/RevoAI/aicore'
import mcpManagerServiceInstance from '@/RevoAI/services/MCPManagerServiceInstance'

const EXTRA_SCHEMA_KEYS = ['schema', 'headers']

export function filterProperties(
  properties:
    | Record<string, any>
    | string
    | number
    | boolean
    | Array<Record<string, any> | string | number | boolean>,
  supportedKeys: string[],
): any {
  // If it is an array, recursively process each element
  if (isArray(properties)) {
    return (properties as any[]).map((item) => filterProperties(item, supportedKeys))
  }

  // If it is an object, recursively process each property
  if (isObject(properties)) {
    return transform(
      properties,
      (result: any, value: any, key: any) => {
        if (key === 'properties') {
          result[key] = transform(value, (acc: any, v: any, k: any) => {
            acc[k] = filterProperties(v, supportedKeys)
          })

          result['additionalProperties'] = false
          result['required'] = pull(Object.keys(value), ...EXTRA_SCHEMA_KEYS)
        } else if (key === 'oneOf') {
          // openai only supports anyOf
          result['anyOf'] = filterProperties(value, supportedKeys)
        } else if (supportedKeys.includes(key)) {
          result[key] = filterProperties(value, supportedKeys)
          if (key === 'type' && value === 'object') {
            result['additionalProperties'] = false
          }
        }
      },
      {},
    )
  }

  // Return other types directly (e.g., string, number, etc.)
  return properties
}

export function mcpToolsToOpenAIResponseTools(mcpTools: MCPTool[]): OpenAI.Responses.Tool[] {
  const schemaKeys = ['type', 'description', 'items', 'enum', 'additionalProperties', 'anyof']
  return mcpTools.map(
    (tool) =>
      ({
        type: 'function',
        name: tool.id,
        parameters: {
          type: 'object',
          properties: filterProperties(tool.inputSchema, schemaKeys).properties,
          required: pull(Object.keys(tool.inputSchema.properties), ...EXTRA_SCHEMA_KEYS),
          additionalProperties: false,
        },
        strict: true,
      }) satisfies OpenAI.Responses.Tool,
  )
}

export function mcpToolsToOpenAIChatTools(mcpTools: MCPTool[]): Array<ChatCompletionTool> {
  return mcpTools.map(
    (tool) =>
      ({
        type: 'function',
        function: {
          name: tool.id,
          description: tool.description,
          parameters: {
            type: 'object',
            properties: tool.inputSchema.properties,
            required: tool.inputSchema.required,
          },
        },
      }) as ChatCompletionTool,
  )
}

export function openAIToolsToMcpTool(
  mcpTools: MCPTool[],
  toolCall: OpenAI.Responses.ResponseFunctionToolCall | ChatCompletionMessageToolCall,
): MCPTool | undefined {
  const tool = mcpTools.find((mcpTool) => {
    if ('name' in toolCall) {
      return mcpTool.id === toolCall.name || mcpTool.name === toolCall.name
    } else {
      return mcpTool.id === toolCall.function.name || mcpTool.name === toolCall.function.name
    }
  })

  if (!tool) {
    console.warn('No MCP Tool found for tool call:', toolCall)
    return undefined
  }

  return tool
}

export async function callMCPTool(toolResponse: MCPToolResponse): Promise<MCPCallToolResponse> {
  console.log(
    `[MCP] Calling Tool: ${toolResponse.tool.serverName} ${toolResponse.tool.name}`,
    toolResponse.tool,
  )
  try {
    const server = getMcpServerByTool(toolResponse.tool)

    if (!server) {
      throw new Error(`Server not found: ${toolResponse.tool.serverName}`)
    }

    const resp = await mcpManagerServiceInstance.callTool({
      server,
      name: toolResponse.tool.name,
      args: toolResponse.arguments,
      callId: toolResponse.id,
    })

    console.log(
      `[MCP] Tool called: ${toolResponse.tool.serverName} ${toolResponse.tool.name}`,
      resp,
    )
    return resp
  } catch (e) {
    console.error(
      `[MCP] Error calling Tool: ${toolResponse.tool.serverName} ${toolResponse.tool.name}`,
      e,
    )
    return Promise.resolve({
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error calling tool ${toolResponse.tool.name}: ${
            e instanceof Error
              ? e.stack || e.message || 'No error details available'
              : JSON.stringify(e)
          }`,
        },
      ],
    })
  }
}

export function upsertMCPToolResponse(
  results: MCPToolResponse[],
  resp: MCPToolResponse,
  onChunk: (chunk: MCPToolInProgressChunk | MCPToolCompleteChunk) => void,
) {
  const index = results.findIndex((ret) => ret.id === resp.id)
  let result = resp
  if (index !== -1) {
    const cur = {
      ...results[index],
      response: resp.response,
      arguments: resp.arguments,
      status: resp.status,
    }
    results[index] = cur
    result = cur
  } else {
    results.push(resp)
  }
  switch (resp.status) {
    case 'invoking':
      onChunk({
        type: ChunkType.MCP_TOOL_IN_PROGRESS,
        responses: [result],
      })
      break
    case 'cancelled':
    case 'done':
      onChunk({
        type: ChunkType.MCP_TOOL_COMPLETE,
        responses: [result],
      })
      break
    default:
      break
  }
}

export function filterMCPTools(
  mcpTools: MCPTool[] | undefined,
  enabledServers: MCPServer[] | undefined,
): MCPTool[] | undefined {
  if (mcpTools) {
    if (enabledServers) {
      mcpTools = mcpTools.filter((t) => enabledServers.some((m) => m.name === t.serverName))
    } else {
      mcpTools = []
    }
  }
  return mcpTools
}

export function getMcpServerByTool(tool: MCPTool) {
  const mcpStore = useMcpStore()
  const servers = mcpStore.servers
  return servers.find((s) => s.id === tool.serverId)
}

export function parseToolUse(content: string, mcpTools: MCPTool[]): ToolUseResponse[] {
  if (!content || !mcpTools || mcpTools.length === 0) {
    return []
  }
  const toolUsePattern =
    /<tool_use>([\s\S]*?)<name>([\s\S]*?)<\/name>([\s\S]*?)<arguments>([\s\S]*?)<\/arguments>([\s\S]*?)<\/tool_use>/g
  const tools: ToolUseResponse[] = []
  let match
  let idx = 0
  // Find all tool use blocks
  while ((match = toolUsePattern.exec(content)) !== null) {
    // const fullMatch = match[0]
    const toolName = match[2].trim()
    const toolArgs = match[4].trim()

    // Try to parse the arguments as JSON
    let parsedArgs
    try {
      parsedArgs = JSON.parse(toolArgs)
    } catch (error) {
      // If parsing fails, use the string as is
      parsedArgs = toolArgs
    }
    // console.log(`Parsed arguments for tool "${toolName}":`, parsedArgs)
    const mcpTool = mcpTools.find((tool) => tool.id === toolName)
    if (!mcpTool) {
      console.error(`Tool "${toolName}" not found in MCP tools`)
      continue
    }

    // Add to tools array
    tools.push({
      id: `${toolName}-${idx++}`, // Unique ID for each tool use
      toolUseId: mcpTool.id,
      tool: mcpTool,
      arguments: parsedArgs,
      status: 'pending',
    })

    // Remove the tool use block from the content
    // content = content.replace(fullMatch, '')
  }
  return tools
}

export async function parseAndCallTools<R>(
  tools: MCPToolResponse[],
  allToolResponses: MCPToolResponse[],
  onChunk: CompletionsParams['onChunk'],
  convertToMessage: (
    mcpToolResponse: MCPToolResponse,
    resp: MCPCallToolResponse,
    model: Model,
  ) => R | undefined,
  model: Model,
  mcpTools?: MCPTool[],
): Promise<(ChatCompletionMessageParam | OpenAI.Responses.ResponseInputItem)[]>

export async function parseAndCallTools<R>(
  content: string,
  allToolResponses: MCPToolResponse[],
  onChunk: CompletionsParams['onChunk'],
  convertToMessage: (
    mcpToolResponse: MCPToolResponse,
    resp: MCPCallToolResponse,
    model: Model,
  ) => R | undefined,
  model: Model,
  mcpTools?: MCPTool[],
): Promise<(ChatCompletionMessageParam | OpenAI.Responses.ResponseInputItem)[]>

export async function parseAndCallTools<R>(
  content: string | MCPToolResponse[],
  allToolResponses: MCPToolResponse[],
  onChunk: CompletionsParams['onChunk'],
  convertToMessage: (
    mcpToolResponse: MCPToolResponse,
    resp: MCPCallToolResponse,
    model: Model,
  ) => R | undefined,
  model: Model,
  mcpTools?: MCPTool[],
): Promise<R[]> {
  const toolResults: R[] = []
  let curToolResponses: MCPToolResponse[] = []
  if (Array.isArray(content)) {
    curToolResponses = content
  } else {
    // process tool use
    curToolResponses = parseToolUse(content, mcpTools || [])
  }
  if (!curToolResponses || curToolResponses.length === 0) {
    return toolResults
  }
  for (let i = 0; i < curToolResponses.length; i++) {
    const toolResponse = curToolResponses[i]
    upsertMCPToolResponse(
      allToolResponses,
      {
        ...toolResponse,
        status: 'invoking',
      },
      onChunk,
    )
  }

  const toolPromises = curToolResponses.map(async (toolResponse) => {
    try {
      const images: string[] = []
      const toolCallResponse = await callMCPTool(toolResponse)
      upsertMCPToolResponse(
        allToolResponses,
        {
          ...toolResponse,
          status: 'done',
          response: toolCallResponse,
        },
        onChunk,
      )

      for (const content of toolCallResponse.content) {
        if (content.type === 'image' && content.data) {
          images.push(`data:${content.mimeType};base64,${content.data}`)
        }
      }

      if (images.length) {
        onChunk({
          type: ChunkType.IMAGE_CREATED,
        })
        onChunk({
          type: ChunkType.IMAGE_COMPLETE,
          image: {
            type: 'base64',
            images: images,
          },
        })
      }

      return convertToMessage(toolResponse, toolCallResponse, model)
    } catch (error) {
      upsertMCPToolResponse(
        allToolResponses,
        {
          ...toolResponse,
          status: 'done',
          response: {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Error executing tool: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
              },
            ],
          },
        },
        onChunk!,
      )
      // 显式返回 undefined，保证所有分支都有返回值
      return undefined
    }
  })

  toolResults.push(...(await Promise.all(toolPromises)).filter((t) => typeof t !== 'undefined'))
  return toolResults
}

export function mcpToolCallResponseToOpenAICompatibleMessage(
  mcpToolResponse: MCPToolResponse,
  resp: MCPCallToolResponse,
  isVisionModel: boolean = false,
): ChatCompletionMessageParam {
  const message = {
    role: 'user',
  } as ChatCompletionMessageParam

  if (resp.isError) {
    message.content = JSON.stringify(resp.content)
  } else {
    const content: ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: `Here is the result of mcp tool use \`${mcpToolResponse.tool.name}\`:`,
      },
    ]

    if (isVisionModel) {
      for (const item of resp.content) {
        switch (item.type) {
          case 'text':
            content.push({
              type: 'text',
              text: item.text || 'no content',
            })
            break
          case 'image':
            content.push({
              type: 'image_url',
              image_url: {
                url: `data:${item.mimeType};base64,${item.data}`,
                detail: 'auto',
              },
            })
            break
          case 'audio':
            content.push({
              type: 'input_audio',
              input_audio: {
                data: `data:${item.mimeType};base64,${item.data}`,
                format: 'mp3',
              },
            })
            break
          default:
            content.push({
              type: 'text',
              text: `Unsupported type: ${item.type}`,
            })
            break
        }
      }
    } else {
      content.push({
        type: 'text',
        text: JSON.stringify(resp.content),
      })
    }

    message.content = content
  }

  return message
}

export function mcpToolCallResponseToOpenAIMessage(
  mcpToolResponse: MCPToolResponse,
  resp: MCPCallToolResponse,
  isVisionModel: boolean = false,
): OpenAI.Responses.EasyInputMessage {
  const message = {
    role: 'user',
  } as OpenAI.Responses.EasyInputMessage

  if (resp.isError) {
    message.content = JSON.stringify(resp.content)
  } else {
    const content: OpenAI.Responses.ResponseInputContent[] = [
      {
        type: 'input_text',
        text: `Here is the result of mcp tool use \`${mcpToolResponse.tool.name}\`:`,
      },
    ]

    if (isVisionModel) {
      for (const item of resp.content) {
        switch (item.type) {
          case 'text':
            content.push({
              type: 'input_text',
              text: item.text || 'no content',
            })
            break
          case 'image':
            content.push({
              type: 'input_image',
              image_url: `data:${item.mimeType};base64,${item.data}`,
              detail: 'auto',
            })
            break
          default:
            content.push({
              type: 'input_text',
              text: `Unsupported type: ${item.type}`,
            })
            break
        }
      }
    } else {
      content.push({
        type: 'input_text',
        text: JSON.stringify(resp.content),
      })
    }

    message.content = content
  }

  return message
}

export function isEnabledToolUse(session: Session) {
  if (session.model) {
    return session.model?.abilityList?.includes('functionCall')
  }

  return false
}
