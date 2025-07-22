import { defineStore } from 'pinia'
import type { MCPConfig, MCPServer, MCPServerState } from '@/RevoAI/types'

// 会话MCP使用状态
export interface SessionMCPState {
  serverId: string
  enabled: boolean
  lastUsed?: string
}

export const useMcpStore = defineStore('mcp', {
  state: (): MCPConfig => ({
    servers: [],
    installed: [],
    userConfigs: {},
    runningServers: {},
  }),

  actions: {
    // 设置服务器列表（来自后端）
    setMCPServers(backendServers: MCPServer[]) {
      // 合并后端数据和本地状态
      const mergedServers = backendServers.map((backendServer) => {
        const existingServer = this.servers.find((s) => s.id === backendServer.id)

        if (existingServer) {
          // 更新现有服务器，保持本地状态
          return {
            ...existingServer,
            ...backendServer,
            // 保持本地状态
            installed: existingServer.installed,
            running: existingServer.running,
            userConfig: existingServer.userConfig,
            installedAt: existingServer.installedAt,
            installedVersion: existingServer.installedVersion, // 保持本地安装版本
            lastUpdated: new Date().toISOString(),
          }
        } else {
          // 新服务器
          return {
            ...backendServer,
            installed: false,
            running: false,
            lastUpdated: new Date().toISOString(),
          }
        }
      })
      this.servers = mergedServers
    },

    // 更新服务器版本
    updateServerListVersion(version: string) {
      this.serverListVersion = version
    },

    // 设置服务器安装状态
    setServerInstalled(payload: {
      serverId: string
      installed: boolean
      version?: string
      path?: string
    }) {
      const { serverId, installed, version, path } = payload
      const server = this.servers.find((s) => s.id === serverId)

      if (server) {
        server.installed = installed
        server.installedVersion = version
        if (path) {
          server.dxtPath = path
        }
        server.installedAt = installed ? new Date().toISOString() : undefined

        // 更新已安装列表
        if (installed && !this.installed.includes(serverId)) {
          this.installed.push(serverId)
        } else if (!installed) {
          this.installed = this.installed.filter((id) => id !== serverId)
        }
      }
    },

    // 设置服务器运行状态
    setServerRunning(payload: { serverId: string; running: boolean; error?: string }) {
      const { serverId, running, error } = payload
      const server = this.servers.find((s) => s.id === serverId)
      if (server) {
        server.running = running
        server.error = error
        this.runningServers
          ? (this.runningServers[serverId] = running)
          : (this.runningServers = { [serverId]: running })
      }
    },

    // 设置用户配置
    setUserConfig(payload: { serverId: string; config: Record<string, any> }) {
      const { serverId, config } = payload
      this.userConfigs
        ? (this.userConfigs[serverId] = config)
        : (this.userConfigs = { [serverId]: config })

      // 同时更新服务器状态中的用户配置
      const server = this.servers.find((s) => s.id === serverId)
      if (server) {
        server.userConfig = config
      }
    },

    // 添加新服务器
    addMCPServer(server: MCPServer) {
      const newServer: MCPServerState = {
        ...server,
        installed: false,
        running: false,
        lastUpdated: new Date().toISOString(),
      }
      this.servers.unshift(newServer)
    },

    // 更新服务器信息
    updateMCPServer(payload: Partial<MCPServerState> & { id: string }) {
      const index = this.servers.findIndex((server) => server.id === payload.id)
      if (index !== -1) {
        this.servers[index] = {
          ...this.servers[index],
          ...payload,
          lastUpdated: new Date().toISOString(),
        }
      }
    },

    // 删除服务器
    deleteMCPServer(serverId: string) {
      this.servers = this.servers.filter((server) => server.id !== serverId)
      this.installed = this.installed.filter((id) => id !== serverId)
      this.userConfigs && delete this.userConfigs[serverId]
      this.runningServers && delete this.runningServers[serverId]
    },

    // 设置已安装列表
    setInstalled(installedList: string[]) {
      this.installed = installedList
    },

    // 批量更新运行状态
    batchUpdateRunningStatus(statusMap: Record<string, boolean>) {
      Object.entries(statusMap).forEach(([serverId, running]) => {
        const server = this.servers.find((s) => s.id === serverId)
        if (server) {
          server.running = running
        }
      })
      this.runningServers = { ...this.runningServers, ...statusMap }
    },
  },

  getters: {
    // 获取所有服务器
    getAllServers(): MCPServerState[] {
      return this.servers
    },

    // 获取已安装的服务器
    getInstalledServers(): MCPServerState[] {
      return this.servers.filter((s) => s.installed)
    },

    // 获取正在运行的服务器
    getRunningServers(): MCPServerState[] {
      return this.servers.filter((s) => s.running)
    },

    // 根据ID获取服务器
    getServerById:
      (state) =>
      (id: string): MCPServerState | undefined => {
        return state.servers.find((server) => server.id === id)
      },
  },
})
