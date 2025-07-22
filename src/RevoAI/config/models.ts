import type { Model, Session } from '@/RevoAI/types'
import OpenAI from 'openai'

import { WEB_SEARCH_PROMPT_FOR_OPENROUTER } from './prompts'

// Vision models
const visionAllowedModels = [
  'llava',
  'moondream',
  'minicpm',
  'gemini-1\\.5',
  'gemini-2\\.0',
  'gemini-2\\.5',
  'gemini-exp',
  'claude-3',
  'claude-sonnet-4',
  'claude-opus-4',
  'vision',
  'glm-4v',
  'qwen-vl',
  'qwen2-vl',
  'qwen2.5-vl',
  'qwen2.5-omni',
  'qvq',
  'internvl2',
  'grok-vision-beta',
  'pixtral',
  'gpt-4(?:-[\\w-]+)',
  'gpt-4.1(?:-[\\w-]+)?',
  'gpt-4o(?:-[\\w-]+)?',
  'gpt-4.5(?:-[\\w-]+)',
  'chatgpt-4o(?:-[\\w-]+)?',
  'o1(?:-[\\w-]+)?',
  'o3(?:-[\\w-]+)?',
  'o4(?:-[\\w-]+)?',
  'deepseek-vl(?:[\\w-]+)?',
  'kimi-latest',
  'gemma-3(?:-[\\w-]+)',
]

const visionExcludedModels = [
  'gpt-4-\\d+-preview',
  'gpt-4-turbo-preview',
  'gpt-4-32k',
  'gpt-4-\\d+',
  'o1-mini',
  'o3-mini',
  'o1-preview',
  'AIDC-AI/Marco-o1',
]
export const VISION_REGEX = new RegExp(
  `\\b(?!(?:${visionExcludedModels.join('|')})\\b)(${visionAllowedModels.join('|')})\\b`,
  'i',
)

// Text to image models
export const TEXT_TO_IMAGE_REGEX = /flux|diffusion|stabilityai|sd-|dall|cogview|janus/i

// Reasoning models
export const REASONING_REGEX =
  /^(o\d+(?:-[\w-]+)?|.*\b(?:reasoning|reasoner|thinking)\b.*|.*-[rR]\d+.*|.*\bqwq(?:-[\w-]+)?\b.*|.*\bhunyuan-t1(?:-[\w-]+)?\b.*|.*\bglm-zero-preview\b.*|.*\bgrok-3-mini(?:-[\w-]+)?\b.*)$/i

// Embedding models
export const EMBEDDING_REGEX =
  /(?:^text-|embed|bge-|e5-|LLM2Vec|retrieval|uae-|gte-|jina-clip|jina-embeddings|voyage-)/i

// Rerank models
export const RERANKING_REGEX = /(?:rerank|re-rank|re-ranker|re-ranking|retrieval|retriever)/i

export const NOT_SUPPORTED_REGEX = /(?:^tts|whisper|speech)/i

// Tool calling models
export const FUNCTION_CALLING_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4',
  'gpt-4.5',
  'o(1|3|4)(?:-[\\w-]+)?',
  'claude',
  'qwen',
  'qwen3',
  'hunyuan',
  'deepseek',
  'glm-4(?:-[\\w-]+)?',
  'learnlm(?:-[\\w-]+)?',
  'gemini(?:-[\\w-]+)?', // 提前排除了gemini的嵌入模型
  'grok-3(?:-[\\w-]+)?',
]

const FUNCTION_CALLING_EXCLUDED_MODELS = [
  'aqa(?:-[\\w-]+)?',
  'imagen(?:-[\\w-]+)?',
  'o1-mini',
  'o1-preview',
  'AIDC-AI/Marco-o1',
]

export const FUNCTION_CALLING_REGEX = new RegExp(
  `\\b(?!(?:${FUNCTION_CALLING_EXCLUDED_MODELS.join(
    '|',
  )})\\b)(?:${FUNCTION_CALLING_MODELS.join('|')})\\b`,
  'i',
)

export const CLAUDE_SUPPORTED_WEBSEARCH_REGEX = new RegExp(
  `\\b(?:claude-3(-|\\.)(7|5)-sonnet(?:-[\\w-]+)|claude-3(-|\\.)5-haiku(?:-[\\w-]+)|claude-sonnet-4(?:-[\\w-]+)?|claude-opus-4(?:-[\\w-]+)?)\\b`,
  'i',
)

// export function isFunctionCallingModel(model: Model): boolean {
//   if (model.type?.includes('function_calling')) {
//     return true
//   }

//   if (isEmbeddingModel(model)) {
//     return false
//   }

//   if (model.provider === 'qiniu') {
//     return ['deepseek-v3-tool', 'deepseek-v3-0324', 'qwq-32b', 'qwen2.5-72b-instruct'].includes(
//       model.id
//     )
//   }

//   if (['deepseek', 'anthropic'].includes(model.provider)) {
//     return true
//   }

//   return FUNCTION_CALLING_REGEX.test(model.id)
// }

export const TEXT_TO_IMAGES_MODELS = [
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    provider: 'silicon',
    name: 'FLUX.1 Schnell',
    group: 'FLUX',
  },
  {
    id: 'black-forest-labs/FLUX.1-dev',
    provider: 'silicon',
    name: 'FLUX.1 Dev',
    group: 'FLUX',
  },
  {
    id: 'black-forest-labs/FLUX.1-pro',
    provider: 'silicon',
    name: 'FLUX.1 Pro',
    group: 'FLUX',
  },
  {
    id: 'Pro/black-forest-labs/FLUX.1-schnell',
    provider: 'silicon',
    name: 'FLUX.1 Schnell Pro',
    group: 'FLUX',
  },
  {
    id: 'LoRA/black-forest-labs/FLUX.1-dev',
    provider: 'silicon',
    name: 'FLUX.1 Dev LoRA',
    group: 'FLUX',
  },
  {
    id: 'deepseek-ai/Janus-Pro-7B',
    provider: 'silicon',
    name: 'Janus-Pro-7B',
    group: 'deepseek-ai',
  },
  {
    id: 'stabilityai/stable-diffusion-3-5-large',
    provider: 'silicon',
    name: 'Stable Diffusion 3.5 Large',
    group: 'Stable Diffusion',
  },
  {
    id: 'stabilityai/stable-diffusion-3-5-large-turbo',
    provider: 'silicon',
    name: 'Stable Diffusion 3.5 Large Turbo',
    group: 'Stable Diffusion',
  },
  {
    id: 'stabilityai/stable-diffusion-3-medium',
    provider: 'silicon',
    name: 'Stable Diffusion 3 Medium',
    group: 'Stable Diffusion',
  },
  {
    id: 'stabilityai/stable-diffusion-2-1',
    provider: 'silicon',
    name: 'Stable Diffusion 2.1',
    group: 'Stable Diffusion',
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    provider: 'silicon',
    name: 'Stable Diffusion XL Base 1.0',
    group: 'Stable Diffusion',
  },
]

export const TEXT_TO_IMAGES_MODELS_SUPPORT_IMAGE_ENHANCEMENT = [
  'stabilityai/stable-diffusion-2-1',
  'stabilityai/stable-diffusion-xl-base-1.0',
]

export const GENERATE_IMAGE_MODELS = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp',
  'grok-2-image-1212',
  'grok-2-image',
  'grok-2-image-latest',
  'gpt-image-1',
]

export const GEMINI_SEARCH_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-001',
  'gemini-2.0-pro-exp-02-05',
  'gemini-2.0-pro-exp',
  'gemini-2.5-pro-exp',
  'gemini-2.5-pro-exp-03-25',
  'gemini-2.5-pro-preview',
  'gemini-2.5-pro-preview-03-25',
  'gemini-2.5-pro-preview-05-06',
  'gemini-2.5-flash-preview',
  'gemini-2.5-flash-preview-04-17',
]

export const OPENAI_NO_SUPPORT_DEV_ROLE_MODELS = ['o1-preview', 'o1-mini']

export const PERPLEXITY_SEARCH_MODELS = [
  'sonar-pro',
  'sonar',
  'sonar-reasoning',
  'sonar-reasoning-pro',
]

export function isTextToImageModel(model: Model): boolean {
  return TEXT_TO_IMAGE_REGEX.test(model.id)
}

// export function isEmbeddingModel(model: Model): boolean {
//   if (!model) {
//     return false
//   }

//   if (['anthropic'].includes(model?.provider)) {
//     return false
//   }

//   if (model.provider === 'doubao') {
//     return EMBEDDING_REGEX.test(model.name)
//   }

//   if (isRerankModel(model)) {
//     return false
//   }

//   return EMBEDDING_REGEX.test(model.id) || model.type?.includes('embedding') || false
// }

export function isRerankModel(model: Model): boolean {
  return model ? RERANKING_REGEX.test(model.id) || false : false
}

// export function isVisionModel(model: Model): boolean {
//   if (!model) {
//     return false
//   }
//   // 新添字段 copilot-vision-request 后可使用 vision
//   // if (model.provider === 'copilot') {
//   //   return false
//   // }

//   if (model.provider === 'doubao') {
//     return VISION_REGEX.test(model.name) || model.type?.includes('vision') || false
//   }

//   return VISION_REGEX.test(model.id) || model.type?.includes('vision') || false
// }

export function isOpenAIReasoningModel(model: Model): boolean {
  return model.id.includes('o1') || model.id.includes('o3') || model.id.includes('o4')
}

export function isOpenAILLMModel(model: Model): boolean {
  if (!model) {
    return false
  }
  if (model.id.includes('gpt-4o-image')) {
    return false
  }
  if (isOpenAIReasoningModel(model)) {
    return true
  }
  if (model.id.includes('gpt')) {
    return true
  }
  return false
}

export function isOpenAIModel(model: Model): boolean {
  if (!model) {
    return false
  }
  return model.id.includes('gpt') || isOpenAIReasoningModel(model)
}

export function isSupportedFlexServiceTier(model: Model): boolean {
  if (!model) {
    return false
  }
  return (model.id.includes('o3') && !model.id.includes('o3-mini')) || model.id.includes('o4-mini')
}

export function isSupportedReasoningEffortOpenAIModel(model: Model): boolean {
  return (
    (model.id.includes('o1') &&
      !(model.id.includes('o1-preview') || model.id.includes('o1-mini'))) ||
    model.id.includes('o3') ||
    model.id.includes('o4')
  )
}

export function isOpenAIWebSearch(model: Model): boolean {
  return (
    model.id.includes('gpt-4o-search-preview') || model.id.includes('gpt-4o-mini-search-preview')
  )
}

export function isSupportedThinkingTokenModel(model?: Model): boolean {
  if (!model) {
    return false
  }

  return (
    isSupportedThinkingTokenGeminiModel(model) ||
    isSupportedThinkingTokenQwenModel(model) ||
    isSupportedThinkingTokenClaudeModel(model)
  )
}

export function isSupportedReasoningEffortModel(model?: Model): boolean {
  if (!model) {
    return false
  }

  return isSupportedReasoningEffortOpenAIModel(model) || isSupportedReasoningEffortGrokModel(model)
}

export function isGrokModel(model?: Model): boolean {
  if (!model) {
    return false
  }
  return model.id.includes('grok')
}

export function isGrokReasoningModel(model?: Model): boolean {
  if (!model) {
    return false
  }

  if (model.id.includes('grok-3-mini')) {
    return true
  }

  return false
}

export const isSupportedReasoningEffortGrokModel = isGrokReasoningModel

export function isGeminiReasoningModel(model?: Model): boolean {
  if (!model) {
    return false
  }

  if (model.id.includes('gemini-2.5')) {
    return true
  }

  return false
}

export const isSupportedThinkingTokenGeminiModel = isGeminiReasoningModel

export function isQwenReasoningModel(model?: Model): boolean {
  if (!model) {
    return false
  }

  if (isSupportedThinkingTokenQwenModel(model)) {
    return true
  }

  if (model.id.includes('qwq') || model.id.includes('qvq')) {
    return true
  }

  return false
}

export function isSupportedThinkingTokenQwenModel(model?: Model): boolean {
  if (!model) {
    return false
  }

  return (
    model.id.toLowerCase().includes('qwen3') ||
    [
      'qwen-plus-latest',
      'qwen-plus-0428',
      'qwen-plus-2025-04-28',
      'qwen-turbo-latest',
      'qwen-turbo-0428',
      'qwen-turbo-2025-04-28',
    ].includes(model.id.toLowerCase())
  )
}

export function isClaudeReasoningModel(model?: Model): boolean {
  if (!model) {
    return false
  }
  return (
    model.id.includes('claude-3-7-sonnet') ||
    model.id.includes('claude-3.7-sonnet') ||
    model.id.includes('claude-sonnet-4') ||
    model.id.includes('claude-opus-4')
  )
}

export const isSupportedThinkingTokenClaudeModel = isClaudeReasoningModel

// export function isReasoningModel(model?: Model): boolean {
//   if (!model) {
//     return false
//   }

//   if (model.provider === 'doubao') {
//     return REASONING_REGEX.test(model.name) || model.type?.includes('reasoning') || false
//   }

//   if (
//     isClaudeReasoningModel(model) ||
//     isOpenAIReasoningModel(model) ||
//     isGeminiReasoningModel(model) ||
//     isQwenReasoningModel(model) ||
//     isGrokReasoningModel(model) ||
//     model.id.includes('glm-z1')
//   ) {
//     return true
//   }

//   return REASONING_REGEX.test(model.id) || model.type?.includes('reasoning') || false
// }

export function isSupportedModel(model: OpenAI.Models.Model): boolean {
  if (!model) {
    return false
  }

  return !NOT_SUPPORTED_REGEX.test(model.id)
}

export function isNotSupportTemperatureAndTopP(model: Model): boolean {
  if (!model) {
    return true
  }

  if (isOpenAIReasoningModel(model) || isOpenAIWebSearch(model)) {
    return true
  }

  return false
}

export function isWebSearchModel(model: Model): boolean {
  if (!model) {
    return false
  }

  if (model.type) {
    if (model.type.includes('web_search')) {
      return true
    }
  }

  if (GEMINI_SEARCH_MODELS.includes(model?.id) || isOpenAIWebSearch(model)) {
    return true
  }

  return false
}

export function getOpenAIWebSearchParams(session: Session, model: Model): Record<string, any> {
  if (isWebSearchModel(model)) {
    if (session.enableWebSearch) {
      return {
        plugins: [{ id: 'web', search_prompts: WEB_SEARCH_PROMPT_FOR_OPENROUTER }],
      }
    }
  }

  return {}
}

export function isGemmaModel(model?: Model): boolean {
  if (!model) {
    return false
  }

  return model.id.includes('gemma-')
}

// export function isZhipuModel(model?: Model): boolean {
//   if (!model) {
//     return false
//   }

//   return model.provider === 'zhipu'
// }

// export function isHunyuanSearchModel(model?: Model): boolean {
//   if (!model) {
//     return false
//   }

//   if (model.provider === 'hunyuan') {
//     return model.id !== 'hunyuan-lite'
//   }

//   return false
// }

/**
 * 按 Qwen 系列模型分组
 * @param models 模型列表
 * @returns 分组后的模型
 */
export function groupQwenModels(models: Model[]): Record<string, Model[]> {
  return models.reduce(
    (groups, model) => {
      // 匹配 Qwen 系列模型的前缀
      const prefixMatch = model.id.match(/^(qwen(?:\d+\.\d+|2(?:\.\d+)?|-\d+b|-(?:max|coder|vl)))/i)
      // 匹配 qwen2.5、qwen2、qwen-7b、qwen-max、qwen-coder 等
      const groupKey = prefixMatch ? prefixMatch[1] : '其他'

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(model)

      return groups
    },
    {} as Record<string, Model[]>,
  )
}

export const THINKING_TOKEN_MAP: Record<string, { min: number; max: number }> = {
  // Gemini models
  'gemini-.*$': { min: 0, max: 24576 },

  // Qwen models
  'qwen-plus-.*$': { min: 0, max: 38912 },
  'qwen-turbo-.*$': { min: 0, max: 38912 },
  'qwen3-0\\.6b$': { min: 0, max: 30720 },
  'qwen3-1\\.7b$': { min: 0, max: 30720 },
  'qwen3-.*$': { min: 1024, max: 38912 },

  // Claude models
  'claude-3[.-]7.*sonnet.*$': { min: 1024, max: 64000 },
  'claude-(:?sonnet|opus)-4.*$': { min: 1024, max: 32000 },
}

export const findTokenLimit = (modelId: string): { min: number; max: number } | undefined => {
  for (const [pattern, limits] of Object.entries(THINKING_TOKEN_MAP)) {
    if (new RegExp(pattern, 'i').test(modelId)) {
      return limits
    }
  }
  return undefined
}
