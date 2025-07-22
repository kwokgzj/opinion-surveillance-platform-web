import { defineStore } from 'pinia'
import type { Model } from '@/RevoAI/types'

export interface LlmState {
  models: Model[]
  defaultModel: Model
}

export const useLlmStore = defineStore('llm', {
  state: () => ({
    models: [] as Model[],
    defaultModel: {
      id: 'deepseek-v3',
      name: 'deepseek-v3',
      displayName: 'Deepseek-v3',
      icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/deepseek.png',
      abilityList: ['functionCall'],
    } as Model,
  }),

  actions: {
    setDefaultModel(payload: { model: Model }) {
      this.defaultModel = payload.model
    },

    updateModels(payload: { models: Model[] }) {
      this.models = payload.models
    },
  },

  getters: {
    getModelById: (state) => (id: string) => {
      return state.models.find((model) => model.id === id)
    },
  },
})
