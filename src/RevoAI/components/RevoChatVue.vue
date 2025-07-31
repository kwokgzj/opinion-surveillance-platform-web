<template>
  <ThemeProvider :theme="theme" theme-color="#e64545">
    <div class="revo-chat-container">
      <!-- 多会话模式 -->
      <template v-if="isMulSession">
        <div class="revo-chat-sidebar" v-if="isMulSession">
          <SessionList
            :sessions="sessions"
            :activeSessionId="activeSession?.id"
            @select="handleSelectSession"
            @create="handleCreateSession"
            @delete="handleDeleteSession"
          />
        </div>
        <div class="revo-chat-main">
          <div class="revo-chat-content">
            <template v-if="activeSession && hasMessages(activeSession.id)">
              <Messages :sessionId="activeSession.id" />
            </template>
            <WelcomePage v-else />
          </div>
          <div class="revo-chat-inputbar">
            <Inputbar
              :session="activeSession"
              :setActiveSession="setActiveSession"
              :isMulSession="isMulSession"
              :models="models"
              :defaultConfig="defaultConfig"
              :getSelectedProjects="getSelectedProjects"
            />
          </div>
        </div>
        <div class="revo-chat-rightbar" v-if="showMcpServers">
          <RightBar :session="activeSession" :setActiveSession="setActiveSession" />
        </div>
      </template>

      <!-- 单会话模式 -->
      <template v-else>
        <div class="revo-chat-main">
          <div class="revo-chat-content">
            <template v-if="activeSession && hasMessages(activeSession.id)">
              <Messages :sessionId="activeSession.id" />
            </template>
            <WelcomePage v-else />
          </div>
          <div class="revo-chat-inputbar">
            <Inputbar
              :session="activeSession"
              :setActiveSession="setActiveSession"
              :isMulSession="false"
              :models="models"
              :defaultConfig="defaultConfig"
              :getSelectedProjects="getSelectedProjects"
            />
          </div>
        </div>
        <div class="revo-chat-rightbar" v-if="showMcpServers">
          <RightBar :session="activeSession" :setActiveSession="setActiveSession" />
        </div>
      </template>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useActiveSession } from '@/RevoAI/hooks/useSession'
import { useSessionsStore } from '@/RevoAI/store/sessions'
import { useMessagesStore } from '@/RevoAI/store/newMessage'
import { useSessions, useDefaultSession } from '@/RevoAI/hooks/useSession'
import { useModel } from '@/RevoAI/hooks/useModel'
import { useMcpStore } from '@/RevoAI/store/mcp'
import mcpManagerServiceInstance from '@/RevoAI/services/MCPManagerServiceInstance'
import WebSearchService, { type WebSearchFunction } from '@/RevoAI/services/WebSearchService'
import { uuid } from '@/RevoAI/utils'
import type { Session, Model, MCPServer, AssistantSettings } from '@/RevoAI/types'
import { db } from '@/RevoAI/databases'
import ThemeProvider from './ThemeProvider.vue'
import SessionList from './chat/SessionList.vue'
import WelcomePage from './chat/WelcomePage.vue'
import Messages from './chat/Messages.vue'
import Inputbar from './inputbar/Inputbar.vue'
import RightBar from './rightbar/RightBar.vue'
import { loadSessionMessages } from '@/RevoAI/store/thunk/messageThunk'
import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'

const props = defineProps<{
  baseUrl?: string
  apiKey?: string
  isMulSession?: boolean
  defaultConfig?: Partial<AssistantSettings>
  showMcpServers?: boolean
  theme?: 'light' | 'dark'
  mcpServers?: MCPServer[]
  models: Model[]
  webSearchFunction?: WebSearchFunction
  getSelectedProjects?: () => { projectId: string; projectName: string }[]
}>()

// 状态
const theme = computed(() => props.theme || 'light')
const models = computed(() => props.models || [])

console.log('RevoChatVue props', props)
// Store
const { addSession, removeSession } = useSessions()
const { defaultSession } = useDefaultSession()
const { defaultModel } = useModel()
const sessionStore = useSessionsStore()
const messageStore = useMessagesStore()
const { activeSession, setActiveSession } = useActiveSession()
const mcpStore = useMcpStore()

// 计算属性
const sessions = computed(() => {
  console.log('Computing sessions from sessionStore.sortedSessions:', sessionStore.sortedSessions)
  return sessionStore.sortedSessions
})

// 监听会话列表的变化
watch(
  () => sessionStore.sessions,
  (newSessions) => {
    console.log('SessionStore sessions changed:', newSessions)
  },
  { deep: true },
)

watch(
  () => sessions.value,
  (newSessions) => {
    console.log('Computed sessions changed:', newSessions)
  },
  { deep: true },
)

// 初始化数据
const initData = async () => {
  try {
    // 使用MCPManagerService获取MCP服务器列表
    mcpStore.setMCPServers(props.mcpServers || [])
    mcpManagerServiceInstance.runMCPServers(props.mcpServers || [])
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

onMounted(async () => {
  // 加载会话数据
  db.sessions.toArray().then((sessions) => {
    sessionStore.updateSessions(sessions)
  })

  // 初始化模型和MCP服务器数据
  await initData()

  // 如果传入了自定义搜索函数，则设置到WebSearchService中
  if (props.webSearchFunction) {
    WebSearchService.setSearchFunction(props.webSearchFunction)
  }

  // 监听会话更新事件，刷新会话列表
  EventEmitter.on(EVENT_NAMES.SESSION_UPDATED, async (data) => {
    console.log('SESSION_UPDATED event received:', data)
    // 会话列表已经在各个更新函数中更新了，这里不需要重复更新
  })
})

onUnmounted(() => {
  // 移除所有SESSION_UPDATED事件监听器
  EventEmitter.clearListeners(EVENT_NAMES.SESSION_UPDATED)
})

// 设置API密钥
if (props.apiKey) {
  window.localStorage.setItem('apiKey', props.apiKey)
}

if (props.baseUrl) {
  window.localStorage.setItem('baseUrl', props.baseUrl)
}

// 检查会话是否有消息
const hasMessages = (sessionId: string) => {
  const sessionMessages = messageStore.getMessagesForSession(sessionId)
  return sessionMessages.length > 0
}

// 修改handleSelectSession函数
const handleSelectSession = async (sessionId: string) => {
  const session = sessionStore.getSessionById(sessionId)
  if (session) {
    // 先清空当前消息显示
    if (activeSession.value && activeSession.value.id !== sessionId) {
      messageStore.setCurrentSessionId(null)
    }

    // 设置新会话
    setActiveSession(session)

    // 确保加载新会话的消息，使用forceReload=true强制重新加载
    await loadSessionMessages(sessionId, true)
  }
}

const handleCreateSession = async () => {
  // 如果当前已经是最新会话且没有消息，则不创建新会话
  if (
    activeSession.value &&
    sessions.value.length > 0 &&
    sessions.value[0].id === activeSession.value.id
  ) {
    // 检查是否有消息
    if (!hasMessages(activeSession.value.id)) {
      return // 不创建新会话
    }
  }

  // 使用第一个可用模型作为默认模型
  const defaultModelValue = models.value.length > 0 ? models.value[0] : defaultModel.value

  const session: Session = {
    ...defaultSession.value,
    id: uuid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: defaultModelValue as Model,
  }
  addSession(session)
  setActiveSession(session)
}

const handleDeleteSession = (sessionId: string) => {
  removeSession(sessionId)

  // 如果删除的是当前会话，设置为null
  if (activeSession.value?.id === sessionId) {
    setActiveSession(null)
  }
}

// 监听会话变化
watch(
  () => sessions.value,
  (newSessions) => {
    // 如果没有会话，设置为null
    if (newSessions.length === 0) {
      setActiveSession(null)
      return
    }

    // 如果当前会话不存在，设置为第一个会话
    if (activeSession.value === null) {
      setActiveSession(newSessions[0])
    }
  },
)
</script>

<style lang="scss" scoped>
.revo-chat-container {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-bg-1);
  color: var(--color-text-1);
  position: relative;
}

.revo-chat-sidebar {
  width: 240px;
  border-right: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
}

.revo-chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.revo-chat-content {
  width: calc(100% - 40px);
  max-width: 1200px;
  margin: 0 auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 120px; /* 为底部输入栏留出空间 */
  padding-bottom: 20px;
}

.revo-chat-inputbar {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  flex-shrink: 0;
}

.welcome-message {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow-y: auto;
}

.welcome-content {
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-1);
}

.welcome-description {
  font-size: 16px;
  color: var(--color-text-2);
  margin-bottom: 32px;
  max-width: 80%;
}

.revo-chat-rightbar {
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
}
</style>
