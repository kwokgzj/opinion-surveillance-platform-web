import { defineStore } from 'pinia'
import { type Session, type AssistantSettings, type Model } from '@/RevoAI/types'
import { SessionManager } from '@/RevoAI/hooks/useSession'
import { getDefaultSession, getDefaultSessionSettings } from '@/RevoAI/services/SessionService'

export interface SessionsState {
  defaultSession: Session
  sessions: Session[]
}

/**
 * 会话存储
 */

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    defaultSession: getDefaultSession(),
    sessions: [] as Session[],
  }),

  actions: {
    updateDefaultSession(session: Session) {
      this.defaultSession = session
    },

    updateSessions(sessions: Session[]) {
      this.sessions = sessions
    },

    addSession(session: Session) {
      this.sessions.push(session)
    },

    removeSession(id: string) {
      this.sessions = this.sessions.filter((c) => c.id !== id)
    },

    updateSession(session: Session) {
      this.sessions = this.sessions.map((c) => (c.id === session.id ? session : c))
      // 同步到数据库
      SessionManager.updateSession(session)
    },

    updateSessionSettings(payload: { sessionId: string; settings: Partial<AssistantSettings> }) {
      for (const session of this.sessions) {
        const settings = payload.settings
        if (session.id === payload.sessionId) {
          if (!session.settings) {
            session.settings = getDefaultSessionSettings()
          }
          for (const key in settings) {
            session.settings[key as keyof AssistantSettings] = settings[
              key as keyof AssistantSettings
            ] as any
          }
          SessionManager.updateSessionPartial(session.id, {
            settings: session.settings,
          })
        }
      }
    },

    setModel(payload: { sessionId: string; model: Model }) {
      this.sessions = this.sessions.map((session) => {
        if (session.id === payload.sessionId) {
          session.model = payload.model
          SessionManager.updateSessionPartial(session.id, {
            model: session.model,
          })
        }
        return session
      })
    },
  },

  getters: {
    getSessionById: (state) => (id: string) => {
      return state.sessions.find((session) => session.id === id)
    },
    // 按更新时间排序的会话列表，新的在前面
    sortedSessions: (state) => {
      return [...state.sessions].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
    },
  },
})
