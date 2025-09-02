import type { MCPServer, MCPTool, MCPToolResponse, MCPCallToolResponse } from '@/RevoAI/types'
import { useMcpStore } from '@/RevoAI/store/mcp'
import http from '@/RevoAI/utils/http'
import { v4 as uuidv4 } from 'uuid'
import { createProxyUrl, addCorsHeaders } from '@/RevoAI/utils/proxyUtils'

// 导入MCP SDK
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

class MCPManagerService {
  private mcpServers: MCPServer[] = []
  private clients: Map<string, Client> = new Map()
  private pendingClients: Map<string, Promise<Client>> = new Map()
  // 是否使用代理
  private useProxy: boolean = true
  private activeToolCalls: Map<string, any> = new Map()
  constructor() {}

  // 单例模式
  private static instance: MCPManagerService
  public static getInstance(): MCPManagerService {
    if (!MCPManagerService.instance) {
      MCPManagerService.instance = new MCPManagerService()
    }
    return MCPManagerService.instance
  }

  /**
   * 设置是否使用代理
   */
  setUseProxy(useProxy: boolean) {
    this.useProxy = useProxy
  }

  /**
   * 获取代理后的URL
   */
  private getProxiedUrl(baseUrl: string): URL {
    if (!this.useProxy) {
      return new URL(baseUrl)
    }

    try {
      // 使用代理工具类创建代理URL
      return createProxyUrl(baseUrl)
    } catch (error) {
      console.error('解析URL失败:', error)
      return new URL(baseUrl)
    }
  }

  /**
   * 从API获取MCP服务器列表
   */
  public async fetchMCPServers(): Promise<MCPServer[]> {
    try {
      const res = await http.get('/api/mcp/servers')
      // 只保留type为streamableHttp和sse的MCP服务器
      const servers = res.data.servers
        .filter((server: any) => server.type === 'streamableHttp' || server.type === 'sse')
        .map((server: any) => ({
          ...server,
          id: server.name,
          headers: {
            ...(server.headers || {}),
            'x-revopoint-mcp-auth': res.data.mcpToken,
          },
        }))
      return servers
    } catch (error) {
      console.error('获取MCP服务器列表失败:', error)
      return []
    }
  }

  /**
   * 获取服务器唯一标识
   */
  private getServerKey(server: MCPServer): string {
    return JSON.stringify({
      baseUrl: server.baseUrl,
      id: server.id,
    })
  }

  /**
   * 初始化MCP客户端
   */
  async initClient(server: MCPServer): Promise<Client> {
    const serverKey = this.getServerKey(server)

    // 如果有正在初始化的客户端，等待它
    const pendingClient = this.pendingClients.get(serverKey)
    if (pendingClient) {
      return pendingClient
    }

    // 检查是否已有客户端
    const existingClient = this.clients.get(serverKey)
    if (existingClient) {
      try {
        // 检查现有客户端是否仍然连接
        const pingResult = await existingClient.ping()
        console.log(`[MCP] Ping result for ${server.name}:`, pingResult)
        // 如果ping失败，从缓存中删除客户端并创建新的
        if (!pingResult) {
          this.clients.delete(serverKey)
        } else {
          return existingClient
        }
      } catch (error: any) {
        console.error(`[MCP] Error pinging server ${server.name}:`, error?.message)
        this.clients.delete(serverKey)
      }
    }

    // 创建初始化过程的Promise
    const initPromise = (async () => {
      try {
        // 为每个连接创建新的客户端实例
        const client = new Client({ name: 'Revo AI', version: '1.0.0' }, { capabilities: {} })

        const initTransport = async () => {
          // 根据配置创建适当的传输
          if (server.baseUrl) {
            // 获取代理后的URL
            // const proxyUrl = this.getProxiedUrl(server.baseUrl);
            // console.log(
            //   `[MCP] Using ${
            //     this.useProxy ? "proxied" : "direct"
            //   } URL: ${proxyUrl.toString()}`
            // );

            if (server.type === 'streamableHttp') {
              // 使用工具类添加CORS头部
              const options = addCorsHeaders({
                requestInit: {
                  headers: server.headers || {},
                },
              })

              return new StreamableHTTPClientTransport(new URL(server.baseUrl), options)
            } else if (server.type === 'sse') {
              const options = {
                eventSourceInit: {
                  fetch: async (url: string, init: any) => {
                    // 使用工具类添加CORS头部
                    const corsOptions = addCorsHeaders({
                      ...init,
                      headers: {
                        ...(server.headers || {}),
                        ...(init?.headers || {}),
                      },
                    })

                    return fetch(url, corsOptions)
                  },
                },
                requestInit: addCorsHeaders({
                  headers: server.headers || {},
                }),
              }

              return new SSEClientTransport(new URL(server.baseUrl), options as any)
            } else {
              throw new Error('无效的服务器类型')
            }
          } else {
            throw new Error('必须提供baseUrl')
          }
        }

        try {
          const transport = await initTransport()
          await client.connect(transport)

          // 将新客户端存储在缓存中
          this.clients.set(serverKey, client)

          console.log(`[MCP] Activated server: ${server.name}`)
          return client
        } catch (error: any) {
          console.error(`[MCP] Error activating server ${server.name}:`, error?.message)
          throw new Error(`[MCP] Error activating server ${server.name}: ${error.message}`)
        }
      } finally {
        // 完成后清理挂起的Promise
        this.pendingClients.delete(serverKey)
      }
    })()

    // 存储挂起的Promise
    this.pendingClients.set(serverKey, initPromise)

    return initPromise
  }

  /**
   * 关闭客户端连接
   */
  async closeClient(serverKey: string) {
    const client = this.clients.get(serverKey)
    if (client) {
      // 从缓存中删除客户端
      await client.close()
      console.log(`[MCP] Closed server: ${serverKey}`)
      this.clients.delete(serverKey)
    } else {
      console.warn(`[MCP] No client found for server: ${serverKey}`)
    }
  }

  /**
   * 获取MCP服务器列表
   */
  getMCPServers() {
    return this.mcpServers
  }

  /**
   * 获取所有可用工具
   */
  async listTools(server: MCPServer): Promise<MCPTool[]> {
    try {
      console.log(`[MCP] Listing tools for server: ${server.name}`)
      const client = await this.initClient(server)
      const { tools } = await client.listTools()

      // 处理工具列表，添加服务器信息
      return (tools || []).map((tool: any) => ({
        ...tool,
        id: tool.name,
        serverId: server.id,
        serverName: server.name,
      }))
    } catch (error) {
      console.error(`获取服务器 ${server.name} 的工具列表失败:`, error)
      return []
    }
  }

  /**
   * 调用工具
   */
  async callTool({
    server,
    name,
    args,
    callId,
  }: {
    server: MCPServer
    name: string
    args: any
    callId: string
  }): Promise<MCPCallToolResponse> {
    const toolCallId = callId || uuidv4()
    const abortController = new AbortController()
    this.activeToolCalls.set(toolCallId, abortController)

    try {
      console.log('[MCP] Calling:', server.name, name, args)
      if (typeof args === 'string') {
        try {
          args = JSON.parse(args)
        } catch (e) {
          console.error('[MCP] args parse error', args)
        }
      }
      const client = await this.initClient(server)
      const result = await client.callTool({ name, arguments: args }, undefined, {
        timeout: 60000 * 30, // Default timeout of 1 minute
        signal: this.activeToolCalls.get(toolCallId)?.signal,
      })
      return result as MCPCallToolResponse
    } catch (error) {
      console.error(`[MCP] Error calling tool ${name} on ${server.name}:`, error)
      throw error
    } finally {
      this.activeToolCalls.delete(toolCallId)
    }
  }

  public async abortTool(callId: string) {
    const activeToolCall = this.activeToolCalls.get(callId)
    if (activeToolCall) {
      activeToolCall.abort()
      this.activeToolCalls.delete(callId)
      console.log(`[MCP] Aborted tool call: ${callId}`)
      return true
    } else {
      console.warn(`[MCP] No active tool call found for callId: ${callId}`)
      return false
    }
  }

  /**
   * 检查服务器连接状态
   */
  async checkServerStatus(serverId: string): Promise<boolean> {
    try {
      // 获取服务器
      const server = this.mcpServers.find((s) => s.id === serverId)
      if (!server) {
        throw new Error(`找不到ID为 ${serverId} 的服务器`)
      }

      console.log(`[MCP] Checking connectivity for server: ${server.name}`)

      // 尝试初始化客户端并列出工具作为连接检查
      const client = await this.initClient(server)
      await client.listTools()

      // // 更新store中的服务器状态
      // this.mcpStore.setServerRunning({
      //   serverId,
      //   running: true,
      // });

      return true
    } catch (error) {
      console.error(`检查服务器 ${serverId} 状态失败:`, error)

      // // 更新store中的服务器状态为未连接
      // this.mcpStore.setServerRunning({
      //   serverId,
      //   running: false,
      //   error: "连接失败",
      // });

      return false
    }
  }

  runMCPServers(mcpServers: MCPServer[]) {
    try {
      this.mcpServers = mcpServers
      mcpServers.forEach(async (server) => {
        const client = await this.initClient(server)
        await client.listTools()
      })
    } catch (error) {
      console.error('运行MCP服务器失败:', error)
    }
  }

  async getAllTools() {
    const tools = await Promise.all(this.mcpServers.map((server) => this.listTools(server)))
    return tools.flat()
  }
}

// 默认导出单例实例
export default MCPManagerService
