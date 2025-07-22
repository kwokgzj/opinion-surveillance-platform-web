<template>
  <div class="rightbar-container">
    <div class="rightbar-header">
      <div class="rightbar-title">MCP 工具</div>
    </div>
    <div class="search-container">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="搜索工具"
        size="small"
        @change="handleSearch"
        allow-clear
      />
    </div>
    <div class="rightbar-content">
      <div v-if="filteredServers.length === 0" class="empty-state">
        <inbox-outlined style="font-size: 48px; color: var(--color-text-3)" />
        <div class="empty-text">暂无MCP 工具</div>
      </div>
      <div v-else class="server-list">
        <div
          v-for="server in filteredServers"
          :key="server.id"
          class="server-item"
          :class="{ active: isServerActive(server.id) }"
        >
          <div class="server-header">
            <div class="server-status-title">
              <div
                class="server-status-indicator"
                :class="{ 'status-running': serverRunningStatus[server.id] }"
                :title="serverRunningStatus[server.id] ? '运行中' : '未运行'"
              ></div>
              <div class="server-name">
                {{ server.displayName || server.name }}
              </div>
            </div>
            <div class="server-actions">
              <a-switch
                size="small"
                :checked="isServerActive(server.id)"
                :loading="serverLoading[server.id]"
                @change="(checked) => toggleServer(server, checked)"
              />
            </div>
          </div>
          <div class="server-content">
            <div class="server-description" :title="server.description">
              {{ server.description }}
            </div>
            <div v-if="server.longDescription" class="server-detail-link">
              <a-tooltip title="查看详情" placement="left">
                <file-text-outlined
                  class="server-detail-button"
                  @click="showServerDetail(server)"
                />
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务器详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="currentDetailServer?.displayName || currentDetailServer?.name"
      :footer="null"
      width="700px"
    >
      <div class="server-detail-content">
        <Markdown
          v-if="currentDetailServer?.longDescription"
          :block="{ content: currentDetailServer.longDescription }"
        />
        <div v-else class="no-detail">暂无详细描述</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import { Session, MCPServer } from '@/RevoAI/types'
import mcpManagerServiceInstance from '@/RevoAI/services/MCPManagerServiceInstance'
import { useSessionsStore } from '@/RevoAI/store/sessions'
import { useMcpStore } from '@/RevoAI/store/mcp'
import Markdown from '../chat/Markdown/Markdown.vue'

const props = defineProps<{
  session: Session | null
  setActiveSession: (session: Session | null) => void
}>()

// 状态
const detailModalVisible = ref(false)
const currentDetailServer = ref<MCPServer | null>(null)
const serverRunningStatus = ref<Record<string, boolean>>({})
const serverLoading = ref<Record<string, boolean>>({})
const searchQuery = ref('')

// Store
const sessionStore = useSessionsStore()
const mcpStore = useMcpStore()

// 计算属性
const servers = computed(() => {
  return mcpStore.servers
})

const filteredServers = computed(() => {
  if (!searchQuery.value) return servers.value

  return servers.value.filter((server) => {
    const name = server.displayName || server.name
    const matchesName = name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesDescription =
      server.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) || false
    return matchesName || matchesDescription
  })
})

// 初始化服务器状态
onMounted(async () => {
  await checkAllServersStatus()
  // 页面刷新后，自动启用当前会话已开启的MCP服务
  if (props.session && props.session.mcpServers && props.session.mcpServers.length > 0) {
    await activateSessionMCPServers()
  }
})

// 检查所有服务器状态
const checkAllServersStatus = async () => {
  const allServers: MCPServer[] = await mcpManagerServiceInstance.fetchMCPServers()
  mcpStore.setMCPServers(allServers)
  // for (const server of allServers) {
  //   checkServerStatus(server.id);
  // }
}

// 检查单个服务器状态
const checkServerStatus = async (serverId: string) => {
  try {
    const isRunning = await mcpManagerServiceInstance.checkServerStatus(serverId)
    serverRunningStatus.value[serverId] = isRunning
  } catch (error) {
    console.error(`检查服务器 ${serverId} 状态失败:`, error)
    serverRunningStatus.value[serverId] = false
  }
}

// 自动启用当前会话已开启的MCP服务
const activateSessionMCPServers = async () => {
  if (!props.session || !props.session.mcpServers || props.session.mcpServers.length === 0) {
    return
  }

  console.log('正在自动启用会话MCP服务...', props.session.mcpServers)

  for (const server of props.session.mcpServers) {
    if (!isServerActive(server.id)) {
      continue // 如果服务器不在当前会话的激活列表中则跳过
    }

    serverLoading.value[server.id] = true

    try {
      // 尝试列出工具，确认服务器可用
      const tools = await mcpManagerServiceInstance.listTools(server)
      if (tools.length === 0) {
        console.warn(`服务器 ${server.name} 不可用，无法自动启用`)
        continue
      }

      // 更新状态
      serverRunningStatus.value[server.id] = true
      // 更新MCP Store中的运行状态
      mcpStore.setServerRunning({
        serverId: server.id,
        running: true,
      })
      console.log(`已自动启用MCP服务: ${server.name}`)
    } catch (error) {
      console.error(`自动启用服务器 ${server.name} 失败:`, error)
      serverRunningStatus.value[server.id] = false
      // 更新MCP Store中的运行状态
      mcpStore.setServerRunning({
        serverId: server.id,
        running: false,
        error: String(error),
      })
    } finally {
      serverLoading.value[server.id] = false
    }
  }
}

// 监听store中的服务器运行状态变化
watch(
  () => mcpStore.getRunningServers,
  (runningServers) => {
    runningServers.forEach((server) => {
      serverRunningStatus.value[server.id] = server.running
    })
  },
  { immediate: true, deep: true },
)

// 监听会话变更
watch(
  () => props.session,
  async (newSession, oldSession) => {
    if (newSession && newSession.id !== oldSession?.id) {
      // 会话已切换，自动启用新会话的MCP服务
      if (newSession.mcpServers && newSession.mcpServers.length > 0) {
        await activateSessionMCPServers()
      }
    }
  },
  { deep: true },
)

// 检查服务器是否激活
const isServerActive = (serverId: string) => {
  if (!props.session || !props.session.mcpServers) return false
  return props.session.mcpServers.some((server) => server.id === serverId)
}

// 切换服务器激活状态
const toggleServer = async (server: MCPServer, checked: boolean) => {
  if (!props.session) return

  serverLoading.value[server.id] = true

  try {
    if (checked) {
      // 尝试列出工具，确认服务器可用
      const tools = await mcpManagerServiceInstance.listTools(server)
      if (tools.length === 0) {
        message.error(`服务器 ${server.name} 不可用`)
        serverRunningStatus.value[server.id] = false
        return
      }
      console.log(tools)
    }

    let mcpServers = [...(props.session.mcpServers || [])]
    console.log('mcpServers', mcpServers.length)
    if (checked) {
      // 添加服务器
      if (!mcpServers.some((s) => s.id === server.id)) {
        mcpServers.push(server)
      }
    } else {
      // 移除服务器
      mcpServers = mcpServers.filter((s) => s.id !== server.id)
    }

    console.log('mcpServers', mcpServers.length)

    // 更新会话
    const updatedSession = {
      ...props.session,
      mcpServers,
    }

    console.log('updatedSession', updatedSession)

    sessionStore.updateSession(updatedSession)
    props.setActiveSession(updatedSession)

    // 更新状态
    serverRunningStatus.value[server.id] = checked

    // 更新MCP Store中的运行状态
    mcpStore.setServerRunning({
      serverId: server.id,
      running: checked,
    })
  } catch (error) {
    console.error(`切换服务器 ${server.name} 失败:`, error)
    message.error(`无法连接到服务器: ${server.name}`)
    serverRunningStatus.value[server.id] = false

    // 更新MCP Store中的运行状态
    mcpStore.setServerRunning({
      serverId: server.id,
      running: false,
      error: String(error),
    })
  } finally {
    serverLoading.value[server.id] = false
  }
}

// 显示服务器详情
const showServerDetail = (server: MCPServer) => {
  currentDetailServer.value = server
  detailModalVisible.value = true
}

// 处理搜索输入
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
  console.log('Searching for:', searchQuery.value)
}
</script>

<style lang="scss" scoped>
.rightbar-container {
  height: 100%;
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-1);
}

.rightbar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rightbar-title {
  font-weight: 500;
  color: var(--color-text-1);
}

.search-container {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.rightbar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-3);
}

.empty-text {
  margin-bottom: 12px;
}

.server-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.server-item {
  padding: 12px;
  border-radius: var(--border-radius-base);
  background-color: var(--color-bg-2);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.server-status-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.server-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-text-3);

  &.status-running {
    background-color: #52c41a;
  }
}

.server-name {
  font-weight: 500;
  color: var(--color-text-1);
  font-size: 14px;
}

.server-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.server-description {
  font-size: 12px;
  color: var(--color-text-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.server-detail-button {
  position: absolute;
  right: 0;
  bottom: 4px;
  color: var(--color-text-3);
}

.server-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.server-detail-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

.no-detail {
  color: var(--color-text-3);
  text-align: center;
  padding: 24px;
}
</style>
