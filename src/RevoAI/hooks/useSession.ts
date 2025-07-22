import db from '@/RevoAI/databases'
import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'
import { deleteMessageFiles } from '@/RevoAI/services/MessagesService'
import type { Session, AssistantSettings, Model } from '@/RevoAI/types'
import { findMainTextBlocks } from '@/RevoAI/utils/messageUtils/find'
import { find, isEmpty } from 'lodash'
import { ref, reactive, watch, computed } from 'vue'
import { useSessionsStore } from '@/RevoAI/store/sessions'
import { useLlmStore } from '@/RevoAI/store/llm'
import { useMessagesStore } from '@/RevoAI/store/newMessage'
import { loadSessionMessages, clearSessionMessages } from '@/RevoAI/store/thunk/messageThunk'

const renamingSessions = new Set<string>()

// 全局状态
const activeSession = ref<Session | null>(null)

export function useActiveSession(session?: Session) {
  const messagesStore = useMessagesStore()

  // 如果提供了会话，则使用它
  if (session && (!activeSession.value || activeSession.value.id !== session.id)) {
    activeSession.value = session
  }

  watch(activeSession, (newSession) => {
    if (newSession) {
      // 加载会话消息
      loadSessionMessages(newSession.id)
      EventEmitter.emit(EVENT_NAMES.CHANGE_SESSION, newSession)
    } else {
      // 清理当前会话ID
      messagesStore.setCurrentSessionId(null)
    }
  })

  return {
    activeSession,
    setActiveSession: (session: Session) => {
      activeSession.value = session
    },
  }
}

export function getSession(sessionId: string) {
  const sessionsStore = useSessionsStore()
  return sessionsStore.getSessionById(sessionId)
}

export const autoRenameSession = async (session: Session) => {
  if (renamingSessions.has(session.id)) {
    return
  }

  try {
    renamingSessions.add(session.id)
    const sessionsStore = useSessionsStore()

    if (isEmpty(session.messages)) {
      return
    }

    if (session.isNameManuallyEdited) {
      return
    }
    if (session && session.title === '新会话' && session.messages.length >= 2) {
      console.log('autoRenameSession', session)
      const { fetchMessagesSummary } = await import('@/RevoAI/services/ApiService')
      const summaryText = await fetchMessagesSummary(session)
      if (summaryText) {
        const data: Session = { ...session, title: summaryText }
        activeSession.value = data
        sessionsStore.updateSession(data)
      }
    }
  } finally {
    renamingSessions.delete(session.id)
  }
}

export function useSessions() {
  const sessionsStore = useSessionsStore()
  const sessions = computed(() => sessionsStore.sessions)

  return {
    sessions,
    updateSessions: (sessions: Session[]) => {
      sessionsStore.updateSessions(sessions)
      SessionManager.updateSessions(sessions)
    },
    addSession: (session: Session) => {
      sessionsStore.addSession(session)
      SessionManager.addSession(session)
    },
    removeSession: async (id: string) => {
      // 先清理消息
      await clearSessionMessages(id)
      // 再删除会话
      sessionsStore.removeSession(id)
      await SessionManager.removeSession(id)
    },
  }
}

export function useSession(id: string) {
  const sessionsStore = useSessionsStore()
  const llmStore = useLlmStore()

  const session = computed(() => sessionsStore.getSessionById(id))
  const defaultModel = computed(() => llmStore.defaultModel)

  // 检查会话是否存在，如果不存在则返回默认模型
  if (!session.value) {
    console.warn(`Session with id ${id} not found, using default model`)
    return {
      session: null,
      model: defaultModel.value,
      setModel: () => {},
      updateSession: () => {
        console.log('[updateSession] session:', session)
      },
      updateSessionSettings: () => {},
    }
  }

  const model = computed(() => session.value?.model || defaultModel.value)
  if (!model.value) {
    throw new Error(
      `Session model is not set for session with name: ${session.value?.title ?? 'unknown'}`,
    )
  }

  const sessionWithModel = computed(() => ({
    ...session.value,
    model: model.value,
  }))

  return {
    session: sessionWithModel,
    model,
    setModel: (model: Model) => {
      if (session.value) {
        sessionsStore.setModel({ sessionId: session.value.id, model })
      }
    },
    updateSession: (session: Session) => {
      console.log('[updateSession] session:', session)
      sessionsStore.updateSession(session)
      SessionManager.updateSessionPartial(session.id, session)
    },
    updateSessionSettings: (settings: Partial<AssistantSettings>) => {
      sessionsStore.updateSessionSettings({ sessionId: id, settings })
      SessionManager.updateSession(session.value!)
    },
  }
}

export function useDefaultSession() {
  const sessionsStore = useSessionsStore()
  const defaultSession = computed(() => sessionsStore.defaultSession)

  return {
    defaultSession,
    updateDefaultSession: (session: Session) => sessionsStore.updateDefaultSession(session),
  }
}
// Convert class to object with functions since class only has static methods
// 只有静态方法,没必要用class，可以export {}
export const SessionManager = {
  async getSession(id: string) {
    return await db.sessions.get(id)
  },

  async getAllSessions() {
    return await db.sessions.toArray()
  },

  async getSessionMessages(id: string) {
    const session = await SessionManager.getSession(id)
    return session ? session.messages : []
  },

  async addSession(session: Session) {
    console.log('addSession', session)
    try {
      // 深度克隆对象，确保只有可序列化的数据
      const clonedSession = JSON.parse(JSON.stringify(session))
      await db.sessions.add(clonedSession)
    } catch (error) {
      console.error('Failed to add session:', error)
      throw error
    }
  },

  async updateSession(session: Session) {
    try {
      // 深度克隆对象，确保只有可序列化的数据
      const clonedSession = JSON.parse(JSON.stringify(session))
      await db.sessions.put(clonedSession)

      // 获取最新的会话列表
      const latestSessions = await db.sessions.toArray()
      const sessionsStore = useSessionsStore()
      sessionsStore.updateSessions(latestSessions)

      // 触发会话更新事件，通知组件刷新
      EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, {
        sessionId: session.id,
        session,
      })
    } catch (error) {
      console.error('Failed to update session:', error)
      throw error
    }
  },

  async updateSessionPartial(sessionId: string, updates: Partial<Session>) {
    try {
      // 如果没有显式设置updatedAt，则自动更新
      if (!updates.updatedAt) {
        updates.updatedAt = new Date().toISOString()
      }

      // 深度克隆对象，确保只有可序列化的数据
      const clonedUpdates = JSON.parse(JSON.stringify(updates))
      await db.sessions.update(sessionId, clonedUpdates)

      // 获取最新的会话列表
      const latestSessions = await db.sessions.toArray()
      const sessionsStore = useSessionsStore()
      sessionsStore.updateSessions(latestSessions)

      // 触发会话更新事件，通知组件刷新
      EventEmitter.emit(EVENT_NAMES.SESSION_UPDATED, { sessionId, updates })
    } catch (error) {
      console.error('Failed to update session partially:', error, {
        sessionId,
        updates,
      })
      throw error
    }
  },

  async updateSessions(sessions: Session[]) {
    try {
      // 深度克隆对象，确保只有可序列化的数据
      const clonedSessions = JSON.parse(JSON.stringify(sessions))
      await db.sessions.bulkPut(clonedSessions)
    } catch (error) {
      console.error('Failed to update sessions:', error)
      throw error
    }
  },

  async removeSession(id: string) {
    const messages = await SessionManager.getSessionMessages(id)

    for (const message of messages) {
      await deleteMessageFiles(message)
    }

    db.sessions.delete(id)
  },

  async clearSessionMessages(id: string) {
    await clearSessionMessages(id)
  },
}
