import { fetchModels } from '@/RevoAI/services/ApiService'
import { useLlmStore } from '@/RevoAI/store/llm'
import { computed } from 'vue'
import type { Model } from '@/RevoAI/types'

export function useModel() {
  const llmStore = useLlmStore()

  const models = computed(() => llmStore.models)
  const defaultModel = computed(() => llmStore.defaultModel)

  const getModels = async () => {
    const modelsData = await fetchModels()
    llmStore.updateModels({ models: modelsData })
  }

  const setDefModel = (model: Model) => {
    llmStore.setDefaultModel({ model })
  }

  return {
    models,
    defaultModel,
    getModels,
    setDefModel,
  }
}

export default useModel
