<template>
  <div class="chat-container">
    <RevoChatVue
      :base-url="baseUrl"
      :api-key="apiKey"
      :is-mul-session="false"
      :show-mcp-servers="false"
      :models="models"
      :mcp-servers="mcpServers"
      :default-config="defaultConfig"
      :web-search-function="webSearchFunction"
      theme="light"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import RevoChatVue from '@/RevoAI/components/RevoChatVue.vue'
import type { AssistantSettings, MCPServer, Model } from '@/RevoAI/types'

const apiKey = ref('sk-mhmQr61vyBQO7CZw7cBeF4CdD693472bA12aA5A375D845B4')
const baseUrl = ref('http://192.168.2.21:9300')
// 默认配置
const defaultConfig = ref<Partial<AssistantSettings>>({
  temperature: 0.7,
  streamOutput: true,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: 2000,
})

const mcpServers = ref<MCPServer[]>([])
const models = ref<Model[]>([
  {
    id: 'deepseek-r1',
    name: 'deepseek-r1',
    displayName: 'Deepseek-R1',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/deepseek.png',
    description:
      '专注于高级推理任务，强化在数学、代码生成和逻辑推理领域的性能。通过大规模强化学习（RL）和冷启动技术，R1在无需大量监督微调（SFT）的情况下，实现了与OpenAI o1系列相当的推理能力',
    type: 'chat',
    abilityList: ['reasoning'],
  },
  {
    id: 'deepseek-v3',
    name: 'deepseek-v3',
    displayName: 'Deepseek-V3',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/deepseek.png',
    description:
      '通用的自然语言处理模型，采用混合专家（MoE）架构，主要面向自然语言处理（NLP）任务，旨在提供高效、可扩展的解决方案。其优势在于高效的多模态处理能力（文本、图像、音频、视频）和较低的训练成本',
    type: 'chat',
    abilityList: ['functionCall'],
  },
  {
    id: 'claude-3-7-sonnet-latest',
    name: 'claude-3-7-sonnet-latest',
    displayName: 'Claude-3.7-Sonnet',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description:
      'Claude 3.7 Sonnet 是业界首个支持双重输出模式的大模型，既支持标准输出模式，也支持深度推理模式。其中，深度推理模式被称为 Claude 3.7 Sonnet with 64K extended thinking，最多支持 128K 长度的输出。这一特性使得模型在处理复杂问题时，能够提供更加详细的推理过程，帮助用户更好地理解模型的思考逻辑。',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'claude-3-7-sonnet-thinking',
    name: 'claude-3-7-sonnet-thinking',
    displayName: 'claude-3-7-sonnet-thinking',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description: 'Claude 3.7 Sonnet深度推理模式，适合高级推理与多模态场景。',
    type: 'chat',
    abilityList: ['reasoning', 'vision'],
  },
  {
    id: 'claude-sonnet-4-20250514-thinking',
    name: 'claude-sonnet-4-20250514-thinking',
    displayName: 'Claude-Sonnet-4-Thinking',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description: 'Claude Sonnet 4 Thinking模式，提升推理与多模态能力，适合复杂AI任务。',
    type: 'chat',
    abilityList: ['reasoning', 'vision'],
  },
  {
    id: 'claude-opus-4-20250514-thinking',
    name: 'claude-opus-4-20250514-thinking',
    displayName: 'Claude-Opus-4-Thinking',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description: 'Claude Opus 4 Thinking模式，进一步增强推理与多模态处理能力，适合复杂场景。',
    type: 'chat',
    abilityList: ['reasoning', 'vision'],
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'claude-sonnet-4-20250514',
    displayName: 'Claude Sonnet 4',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description: 'Claude Sonnet 4为高效推理与多模态模型，兼具强大的NLP和视觉能力。',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'claude-opus-4-20250514',
    displayName: 'Claude Opus 4',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description:
      'Claude Opus 4是Anthropic最新旗舰大模型，专注于高级推理和多模态任务，适用于复杂AI应用。',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'gpt-4.1',
    name: 'gpt-4.1',
    displayName: 'gpt-4.1',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/chatgpt.jpeg',
    description: 'gpt-4.1',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'gpt-4.1-mini',
    name: 'gpt-4.1-mini',
    displayName: 'GPT-4.1 mini',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/gpt_4.png',
    description: 'GPT-4.1 mini为轻量级多模态模型，兼具高效推理和视觉能力，适合资源受限场景。',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/gpt_4.png',
    description:
      'GPT-4o是OpenAI最新多模态旗舰模型，支持文本、图像等多种输入，具备极强的推理和理解能力。',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'doubao-seed-1.6-thinking',
    name: 'doubao-seed-1.6-thinking',
    displayName: 'Doubao Seed 1.6 Thinking',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/doubao.png',
    description: 'Doubao Seed 1.6 Thinking模式，进一步提升推理和多模态能力，适合复杂AI任务。',
    type: 'chat',
    abilityList: ['reasoning', 'vision'],
  },
  {
    id: 'doubao-seed-1.6',
    name: 'doubao-seed-1.6',
    displayName: 'Doubao Seed 1.6',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/doubao.png',
    description:
      'Doubao Seed 1.6是字节跳动推出的多模态大模型，兼具推理和视觉能力，适合多场景AI应用。',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'qwen3-235b-a22b',
    name: 'qwen3-235b-a22b',
    displayName: 'Qwen3 235B A22B',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/qwen.png',
    description: 'Qwen3 235B A22B是阿里云推出的旗舰大模型，专注于推理与方法调用，适合企业级场景。',
    type: 'chat',
    abilityList: ['reasoning'],
  },
  {
    id: 'gemini-2.5-pro-preview-06-05',
    name: 'gemini-2.5-pro-preview-06-05',
    displayName: 'Gemini 2.5 Pro(Preview)',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/gemini.png',
    description: '谷歌提供的最新大模型',
    type: 'chat',
    abilityList: ['functionCall', 'vision'],
  },
  {
    id: 'qwen2.5-vl-72b-instruct',
    name: 'qwen2.5-vl-72b-instruct',
    displayName: 'Qwen2.5 VL 72B Instruct',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/qwen.png',
    description:
      'Qwen2.5 VL 72B Instruct为多模态模型，支持文本、视觉等多种输入，适合多场景AI应用。',
    type: 'chat',
    abilityList: ['vision'],
  },
])

// 自定义搜索函数
const webSearchFunction = async (
  queryList: string[],
  options?: {
    maxResults?: number
    maxContentLength?: number
    includeRawContent?: 'text' | 'none'
  },
): Promise<any> => {
  console.log('自定义搜索函数被调用', queryList, options)
  // 调用服务端搜索接口，直接返回接口的data数组数据
  return []
}
</script>

<style lang="less" scoped>
.chat-container {
  width: 100%;
  height: 100%;
}
</style>
