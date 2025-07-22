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
const models = ref<Model[]>([])

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
