import { DEFAULT_CONTEXTCOUNT, DEFAULT_MAX_TOKENS } from '@/RevoAI/config/constant'
import { useSessionsStore } from '@/RevoAI/store/sessions'
import { uuid } from '@/RevoAI/utils'
import type { Session, AssistantSettings } from '@/RevoAI/types'

export function getDefaultSession(): Session {
  return {
    id: uuid(),
    title: '新会话',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    prompt: '',
    messages: [],
    settings: {
      temperature: 0.7,
      contextCount: DEFAULT_CONTEXTCOUNT,
      maxTokens: -1,
      streamOutput: true,
      topP: 0.9,
      toolUseMode: 'function',
      stopSequences: [],
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
    model: {
      id: 'deepseek-v3',
      name: 'deepseek-v3',
      displayName: 'Deepseek-v3',
      icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/deepseek.png',
      abilityList: ['functionCall'],
    },
  }
}

export function getDefaultSessionSettings() {
  const sessionsStore = useSessionsStore()
  return sessionsStore.defaultSession.settings
}

export function getTopNamingModel() {
  return {
    id: 'deepseek-v3',
    name: 'deepseek-v3',
    displayName: 'Deepseek-v3',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/deepseek.png',
    abilityList: ['functionCall'],
  }
}

export const getSessionSettings = (session: Session): AssistantSettings => {
  const contextCount = session?.settings?.contextCount ?? DEFAULT_CONTEXTCOUNT
  const getSessionMaxTokens = () => {
    if (session.settings?.enableMaxTokens) {
      const maxTokens = session.settings.maxTokens
      if (typeof maxTokens === 'number') {
        return maxTokens > 0 ? maxTokens : DEFAULT_MAX_TOKENS
      }
      return DEFAULT_MAX_TOKENS
    }
    return undefined
  }

  return {
    contextCount: contextCount === 100 ? 100000 : contextCount,
    temperature: session?.settings?.temperature ?? 0.7,
    topP: session?.settings?.topP ?? 1,
    enableMaxTokens: session?.settings?.enableMaxTokens ?? false,
    maxTokens: getSessionMaxTokens(),
    streamOutput: session?.settings?.streamOutput ?? true,
    toolUseMode: session?.settings?.toolUseMode ?? 'prompt',
  }
}
export function getSessionById(id: string) {
  const sessionsStore = useSessionsStore()
  return sessionsStore.sessions.find((a) => a.id === id)
}
