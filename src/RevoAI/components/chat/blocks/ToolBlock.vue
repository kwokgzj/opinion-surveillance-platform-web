<template>
  <div class="tool-block">
    <a-collapse v-model:activeKey="activeKeys" size="small" class="collapse-container">
      <a-collapse-panel :key="block.id" class="tool-panel">
        <template #header>
          <div class="tool-header">
            <div class="tool-title">
              <div class="tool-name">{{ toolName }}</div>
              <div
                class="tool-status"
                :class="{
                  'status-invoking': isInvoking,
                  'status-success': isDone && !hasError,
                  'status-error': hasError,
                }"
              >
                {{ statusText }}
                <loading-outlined v-if="isInvoking" spin class="status-icon" />
                <check-outlined v-if="isDone && !hasError" class="status-icon" />
                <warning-outlined v-if="hasError" class="status-icon" />
              </div>
            </div>
            <div class="tool-actions">
              <a-tooltip title="复制">
                <button class="action-button" @click.stop="copyToolContent" aria-label="复制">
                  <copy-outlined v-if="!copied" />
                  <check-outlined v-else style="color: var(--color-primary)" />
                </button>
              </a-tooltip>
              <a-tooltip title="停止调用">
                <button
                  v-if="isInvoking"
                  class="action-button"
                  @click.stop="abortTool"
                  aria-label="停止调用"
                >
                  <stop-outlined />
                </button>
              </a-tooltip>
            </div>
          </div>
        </template>
        <div class="tool-content" :style="contentStyle">
          <div class="tool-response">
            <pre class="json-content"><code v-html="highlightedJson"></code></pre>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  LoadingOutlined,
  CheckOutlined,
  WarningOutlined,
  CopyOutlined,
} from '@ant-design/icons-vue'
import { MessageBlockStatus, MessageBlockType } from '@/RevoAI/types/newMessage'
import type { ToolMessageBlock, MessageBlock } from '@/RevoAI/types/newMessage'
import { getMcpServerByTool } from '@/RevoAI/utils/mcp-tools'
import mcpManagerServiceInstance from '@/RevoAI/services/MCPManagerServiceInstance'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // 导入一个高亮主题

const props = defineProps<{
  block: MessageBlock
}>()

// 状态
const activeKeys = ref<string[]>([])
const copied = ref(false)
const highlightedJson = ref('')

// 计算属性
const isToolBlock = computed(() => props.block.type === MessageBlockType.TOOL)

const toolBlock = computed(() => {
  if (isToolBlock.value) {
    return props.block as ToolMessageBlock
  }
  return null
})

const toolResponse = computed(() => {
  return toolBlock.value?.metadata?.rawMcpToolResponse
})

const isDone = computed(() => toolResponse.value?.status === 'done')

const isAborted = computed(
  () =>
    toolResponse.value?.status === 'done' &&
    toolResponse.value?.response?.content[0]?.text?.includes('AbortError'),
)

const isInvoking = computed(() => toolResponse.value?.status === 'invoking')

const hasError = computed(() => isDone.value && toolResponse.value?.response?.isError)

const toolName = computed(() => {
  if (toolResponse.value) {
    const server = getMcpServerByTool(toolResponse.value.tool)
    return `${server?.displayName} - ${toolResponse.value.tool?.name}` || '未知工具'
  }
  return toolBlock.value?.toolName || '未知工具'
})

const statusText = computed(() => {
  if (isInvoking.value) return '执行中'
  if (isAborted.value) return '已终止'
  if (hasError.value) return '执行失败'
  return '执行成功'
})

const errorMessage = computed((): string => {
  if (!toolBlock.value || !toolBlock.value.error) return '工具执行失败'

  if (typeof toolBlock.value.error === 'string') {
    return toolBlock.value.error
  }

  if (toolBlock.value.error.message && typeof toolBlock.value.error.message === 'string') {
    return toolBlock.value.error.message
  }

  try {
    return JSON.stringify(toolBlock.value.error, null, 2)
  } catch (e) {
    return '工具执行失败'
  }
})

const resultString = computed((): string => {
  try {
    if (!toolResponse.value) return '{}'

    return JSON.stringify(
      {
        params: toolResponse.value.arguments,
        response: toolResponse.value.response,
      },
      null,
      2,
    )
  } catch (e) {
    return '无效结果'
  }
})

const contentStyle = computed(() => ({
  fontFamily: 'var(--font-family-mono)',
  fontSize: '12px',
}))

// 方法
const copyToolContent = (event: Event) => {
  event.stopPropagation()

  const contentToCopy = hasError.value ? errorMessage.value : resultString.value

  if (typeof contentToCopy === 'string') {
    navigator.clipboard.writeText(contentToCopy)
    message.success('已复制到剪贴板')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// 高亮JSON
const highlightJson = () => {
  try {
    if (resultString.value) {
      highlightedJson.value = hljs.highlight(resultString.value, {
        language: 'json',
      }).value
    }
  } catch (e) {
    console.error('JSON高亮失败:', e)
    highlightedJson.value = `<span class="hljs-string">${resultString.value}</span>`
  }
}

const abortTool = async () => {
  try {
    await mcpManagerServiceInstance.abortTool(toolResponse.value?.id)
  } catch (e) {
    console.error('停止调用失败:', e)
  }
}

// 监听block变化，自动展开错误内容
watch(
  () => props.block.status,
  (newStatus) => {
    if (newStatus === MessageBlockStatus.ERROR) {
      activeKeys.value = [props.block.id]
    }
  },
  { immediate: true },
)

// 监听结果变化，更新高亮
watch(
  () => resultString.value,
  () => {
    highlightJson()
  },
  { immediate: true },
)

onMounted(() => {
  highlightJson()
})
</script>

<style lang="scss" scoped>
.tool-block {
  margin: 8px 0;
  width: 100%;
}

.collapse-container {
  border-radius: 8px;
  overflow: hidden;
  width: 50vw;

  :deep(.ant-collapse-header) {
    background-color: var(--color-bg-2);
    transition: background-color 0.2s;
    align-items: center !important;
    padding: 8px 12px !important;
    border-radius: 8px 8px 0 0 !important;
    &:hover {
      background-color: var(--color-bg-3);
    }
  }

  :deep(.ant-collapse-content-box) {
    padding: 0 !important;
  }
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.tool-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-name {
  color: var(--color-text-2);
  font-weight: 500;
  font-size: 13px;
}

.tool-status {
  font-size: 11px;
  display: flex;
  align-items: center;
  opacity: 0.85;
  border-left: 1px solid var(--color-border);
  padding-left: 8px;
  margin-left: 8px;
}

.status-invoking {
  color: var(--color-text);
}

.status-error {
  color: var(--color-error, #ff4d4f);
}

.status-success {
  color: var(--color-success, #52c41a);
}

.status-icon {
  margin-left: 6px;
}

.tool-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.action-button {
  background: none;
  border: none;
  color: var(--color-text-2);
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    opacity: 1;
    color: var(--color-text);
    background-color: var(--color-bg-1);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    opacity: 1;
  }
}

.tool-content {
  border-radius: 0 0 4px 4px;
  overflow: auto;
  max-height: 300px;
  border-top: none;
  position: relative;
  background-color: var(--color-bg-1);
  padding: 12px;
}

.error-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-error, #ff4d4f);
  font-family: var(--font-family-mono);
}

.json-content {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-break: break-word;
  background: transparent !important;
  font-family: var(--font-family-mono);
}

:deep(.hljs) {
  background: transparent !important;
  padding: 0;
}
</style>
