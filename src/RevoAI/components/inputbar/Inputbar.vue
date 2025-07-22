<template>
  <div class="inputbar-container">
    <div class="inputbar-content">
      <!-- 文件列表区域 -->
      <div v-if="files.length > 0" class="attachment-container">
        <div class="attachment-list">
          <div class="attachment-item-wrapper" v-for="(file, index) in files" :key="file.id">
            <Attachments.FileCard class="attachment-item" :item="file" />
            <div class="attachment-delete-btn" @click="removeFile(index)">
              <CloseOutlined />
            </div>
          </div>
          <div class="add-attachment" @click="selectFile">
            <PlusOutlined />
          </div>
        </div>
      </div>

      <!-- Sender 组件 -->
      <Sender
        v-model:value="text"
        :auto-size="{ minRows: 2, maxRows: 6 }"
        placeholder="Press Enter to send message"
        @submit="sendMessage"
        @change="(v: string) => (text = v)"
        @cancel="onPause"
        @keydown="handleKeyDown"
        @paste-file="handlePasteFile"
        class="inputbar-sender"
        :actions="false"
      >
        <!-- 头部区域 -->
        <template #header>
          <Sender.Header
            :title="headerTitle"
            :open="isHeaderOpen"
            @open-change="handleHeaderOpenChange"
            :show-close="true"
          >
            <!-- 模型选择 -->
            <div v-if="activeHeader === 'model'" class="header-content">
              <!-- 添加搜索框 -->
              <div class="model-search">
                <a-input v-model:value="modelSearchText" placeholder="搜索模型" allow-clear>
                  <template #prefix>
                    <SearchOutlined />
                  </template>
                </a-input>
              </div>
              <div class="model-list">
                <div
                  v-for="model in filteredModels"
                  :key="model.id"
                  class="model-item"
                  :class="{ active: currentModel?.id === model.id }"
                  @click="selectModel(model)"
                >
                  <div class="model-info">
                    <div class="model-icon" v-if="model.icon">
                      <img
                        :src="model.icon"
                        alt="model icon"
                        width="24"
                        height="24"
                        class="model-icon-img"
                      />
                    </div>
                    <div class="model-name">
                      {{ model.displayName || model.name }}
                    </div>
                  </div>
                  <div class="model-abilities">
                    <a-tooltip title="视觉" v-if="hasAbility(model, 'vision')">
                      <eye style="color: #13c2c2" :size="16" />
                    </a-tooltip>
                    <a-tooltip title="思考" v-if="hasAbility(model, 'reasoning')">
                      <lightbulb style="color: #52c41a" :size="16" />
                    </a-tooltip>
                    <a-tooltip title="工具" v-if="hasAbility(model, 'functionCall')">
                      <wrench style="color: #eb2f96" :size="16" />
                    </a-tooltip>
                  </div>
                </div>
                <!-- 空结果提示 -->
                <div v-if="filteredModels.length === 0" class="model-empty">
                  <InboxOutlined />
                  <div class="model-empty-text">未找到匹配的模型</div>
                </div>
              </div>
            </div>
          </Sender.Header>
        </template>

        <!-- 底部区域 -->
        <template
          #footer="{
            info: {
              components: { SendButton, LoadingButton },
            },
          }"
        >
          <Flex justify="space-between" align="center">
            <Flex gap="0" align="center">
              <a-tooltip :title="uploadButtonTooltip" @click="selectFile">
                <Button :style="iconStyle" type="text">
                  <PaperclipIcon :size="16" />
                </Button>
              </a-tooltip>
              <Divider type="vertical" />
              <a-tooltip :title="'联网搜索'">
                <Button
                  :style="enableWebSearch ? activeIconStyle : iconStyle"
                  @click="toggleWebSearch"
                  type="text"
                >
                  <Globe :size="16" />
                </Button>
              </a-tooltip>
              <Divider type="vertical" />
              <a-tooltip title="模型设置">
                <Button :style="iconStyle" @click="showSettingsModal" type="text">
                  <SlidersHorizontal :size="16" />
                </Button>
              </a-tooltip>
              <Divider type="vertical" />
              <a-tooltip title="清空会话消息">
                <Popconfirm
                  title="确认清空会话"
                  description="确定要清空当前会话的所有消息吗？此操作不可恢复。"
                  @confirm="onClearConfirm"
                  okText="确认"
                  cancelText="取消"
                >
                  <Button :style="iconStyle" type="text">
                    <ClearOutlined />
                  </Button>
                </Popconfirm>
              </a-tooltip>
              <Divider type="vertical" />
              <a-tooltip title="选择模型">
                <Button :style="iconStyle" @click="openModelHeader" type="text">
                  <span class="model-button-content">
                    <img
                      v-if="currentModel?.icon"
                      :src="currentModel.icon"
                      alt="model icon"
                      width="16"
                      height="16"
                      class="model-button-icon"
                    />
                    {{ currentModel?.displayName || currentModel?.name }}
                  </span>
                </Button>
              </a-tooltip>
              <Divider type="vertical" />
            </Flex>
            <Flex align="center">
              <component :is="LoadingButton" v-if="loading" :disabled="false" type="default" />
              <component
                :is="SendButton"
                v-else
                type="primary"
                :disabled="text.trim() === '' && files.length === 0"
              />
            </Flex>
          </Flex>
        </template>
      </Sender>
    </div>
  </div>

  <!-- 设置弹窗 -->
  <ModelSettings
    v-model:visible="settingsModalVisible"
    :settings="settings"
    @save="handleSettingsSave"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Sender, Attachments } from 'ant-design-x-vue'
import { PaperclipIcon, Globe, SlidersHorizontal, Lightbulb, Eye, Wrench } from 'lucide-vue-next'
import {
  ClearOutlined,
  InboxOutlined,
  SearchOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import { message, theme, Flex, Divider, Button, Popconfirm } from 'ant-design-vue'
import { useSessions, useDefaultSession } from '@/RevoAI/hooks/useSession'
import { Session, Model, FileType, AssistantSettings } from '@/RevoAI/types'
import { MessageInputBaseParams } from '@/RevoAI/types/newMessage'
import { uuid } from '@/RevoAI/utils'
import {
  sendMessage as _sendMessage,
  clearSessionMessages,
} from '@/RevoAI/store/thunk/messageThunk'
import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'
import { getUserMessage } from '@/RevoAI/services/MessagesService'
import { FileTypes } from '@/RevoAI/types'
import { useSessionsStore, useMessagesStore } from '@/RevoAI/store'
import ModelSettings from './ModelSettings.vue'
import { useModel } from '@/RevoAI/hooks/useModel'
import { imageExts, documentExts, textExts } from '@/RevoAI/config/constant'
// 导入文档解析库
import * as mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import * as pdfjs from 'pdfjs-dist'
import { abortCompletion } from '@/RevoAI/utils/abortController'

// 设置PDF.js worker路径
// 直接使用版本号创建worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const props = defineProps<{
  session: Session | null
  setActiveSession: (session: Session | null) => void
  isMulSession?: boolean
  models?: Model[]
  defaultConfig?: Partial<AssistantSettings>
}>()

// 状态
const text = ref('')
const files = ref<FileType[]>([])
const enableWebSearch = ref(false)
const activeHeader = ref<'model' | 'attachment' | 'settings' | null>(null)
const settingsModalVisible = ref(false)
const modelSearchText = ref('') // 添加模型搜索文本
const settings = ref<Partial<AssistantSettings>>({
  temperature: 0.7,
  streamOutput: true,
  maxTokens: -1,
  topP: 1,
  stopSequences: [],
  presencePenalty: 0,
  frequencyPenalty: 0,
})
const sessionsStore = useSessionsStore()
const { addSession } = useSessions()
const { defaultSession } = useDefaultSession()
const { defaultModel, setDefModel } = useModel()
const messagesStore = useMessagesStore()

// 添加一个调试日志
watch(
  () => props.session,
  (newSession: Session) => {
    console.log('[watch] session changed:', newSession?.id)
  },
)

// 计算loading状态
const loading = computed(() => {
  if (props.session) {
    return messagesStore.getSessionLoading(props.session.id)
  }
  return false
})

const { token } = theme.useToken()

const iconStyle = {
  padding: '0 6px',
  display: 'flex',
  alignItems: 'center',
  color: token.value.colorText,
}

const activeIconStyle = computed(() => ({
  padding: '0 6px',
  display: 'flex',
  alignItems: 'center',
  color: 'var(--color-primary)',
}))

// 计算属性
const inputEmpty = computed(() => {
  return text.value.trim() === '' && files.value.length === 0
})

const hasUploadingFiles = computed(() => {
  return files.value.some((file) => file.status === 'uploading')
})

const currentModel = computed(() => {
  return props.session?.model || defaultModel.value
})

const models = computed(() => {
  return props.models || []
})

// 添加过滤后的模型列表计算属性
const filteredModels = computed(() => {
  if (!modelSearchText.value) return models.value

  const searchText = modelSearchText.value.toLowerCase()
  return models.value.filter((model) => {
    const displayName = (model.displayName || model.name).toLowerCase()
    return displayName.includes(searchText)
  })
})

const isHeaderOpen = computed(() => {
  return activeHeader.value !== null
})

const headerTitle = computed(() => {
  switch (activeHeader.value) {
    case 'model':
      return '选择模型'
    case 'attachment':
      return '上传文件'
    case 'settings':
      return '模型设置'
    default:
      return ''
  }
})

// 监听会话变化，更新设置
watch(
  () => props.session,
  (newSession: Session) => {
    if (newSession) {
      settings.value = { ...settings.value, ...newSession.settings }
      enableWebSearch.value = !!newSession.enableWebSearch
    }
  },
  { immediate: true },
)

// 监听默认配置
watch(
  () => props.defaultConfig,
  (newConfig: Partial<AssistantSettings>) => {
    if (newConfig) {
      settings.value = { ...settings.value, ...newConfig }
    }
  },
  { immediate: true },
)

// 方法
const handleKeyDown = (e: KeyboardEvent) => {
  // if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
  //   e.preventDefault();
  //   sendMessage();
  // }
}

const handlePasteFile = async (_file: File, files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    await processFile(file)
  }
}

// 添加文件解析函数
const parseDocxFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const result = await mammoth.extractRawText({ arrayBuffer })
        resolve(result.value)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const parseExcelFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const data = new Uint8Array(arrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        let result = ''
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet)
          result += `Sheet: ${sheetName}\n`
          result += JSON.stringify(json, null, 2)
          result += '\n\n'
        })

        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const parsePdfFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
        let text = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map((item: any) => item.str).join(' ')
          text += `Page ${i}:\n${pageText}\n\n`
        }

        resolve(text)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const processFile = async (file: File) => {
  // 检查文件大小，限制为30MB
  if (file.size > 30 * 1024 * 1024) {
    message.error('文件大小不能超过30MB')
    return
  }

  // 检查当前模型是否支持视觉能力
  const hasVisionAbility = currentModel.value?.abilityList?.includes('vision')

  // 检查文件扩展名
  const fileName = file.name.toLowerCase()
  const fileExt = fileName.substring(fileName.lastIndexOf('.'))

  // 如果是图片文件但模型不支持视觉能力，则拒绝上传
  if (imageExts.includes(fileExt) && !hasVisionAbility) {
    message.error('当前模型不支持处理图片，请选择支持视觉能力的模型')
    return
  }

  // 创建文件对象
  const newFile: FileType = {
    uid: uuid(),
    id: uuid(),
    name: file.name,
    size: file.size,
    type: file.type as FileTypes,
    status: 'uploading',
    created_at: new Date().toISOString(),
    content: undefined, // 初始化content字段
  }

  // 添加到文件列表
  files.value.push(newFile)

  // 读取文件内容
  try {
    const fileIndex = files.value.length - 1

    // 根据文件类型选择合适的解析方法
    if (imageExts.includes(fileExt)) {
      // 图片文件使用base64编码
      const base64 = await readFileAsBase64(file)
      files.value[fileIndex].content = base64
      files.value[fileIndex].type = 'image' as FileTypes
      files.value[fileIndex].url = base64
      files.value[fileIndex].status = 'done'
    } else {
      // 对于所有非图片文件，先尝试作为文本读取
      try {
        let content = ''

        if (fileExt === '.pdf') {
          content = await parsePdfFile(file)
        } else if (fileExt === '.docx') {
          content = await parseDocxFile(file)
        } else if (fileExt === '.xlsx') {
          content = await parseExcelFile(file)
        } else {
          // 对于其他文件类型，尝试作为文本读取
          // message.loading(`正在读取文件: ${file.name}`);
          try {
            content = await readFileAsText(file)
            // 检查内容是否为有效的文本
            if (!isValidText(content)) {
              // 如果不是有效文本，则使用base64编码
              content = await readFileAsBase64(file)
            }
          } catch (textError) {
            // console.warn("无法作为文本读取，尝试使用base64编码", textError);
            content = await readFileAsBase64(file)
          }
        }

        files.value[fileIndex].content = content
        files.value[fileIndex].status = 'done'
        // message.success(`文件 ${file.name} 解析完成`);
      } catch (parseError) {
        // console.warn("解析失败，尝试使用base64编码", parseError);
        // 如果解析失败，则使用base64编码
        const base64 = await readFileAsBase64(file)
        files.value[fileIndex].content = base64
        files.value[fileIndex].status = 'done'
      }
    }
  } catch (error) {
    const fileIndex = files.value.findIndex((f) => f.id === newFile.id)
    if (fileIndex !== -1) {
      files.value[fileIndex].status = 'error'
    }
    console.error('文件处理错误:', error)
    message.error(`文件 ${file.name} 读取失败`)
  }
}

// 检查文本是否有效（不是乱码）
const isValidText = (text: string): boolean => {
  // 检查文本是否包含太多不可打印字符
  const nonPrintableChars = text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g)
  if (nonPrintableChars && nonPrintableChars.length > text.length * 0.1) {
    return false
  }

  // 检查文本是否为空或只有空白字符
  if (!text.trim()) {
    return false
  }

  return true
}

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const selectFile = async () => {
  // 创建文件选择对话框
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true

  // 检查当前模型是否支持视觉能力
  const hasVisionAbility = currentModel.value?.abilityList?.includes('vision')

  // 根据模型能力设置支持的文件类型
  if (!hasVisionAbility) {
    // 如果不支持视觉能力，排除图片格式
    const supportedExts = [...documentExts, ...textExts]
    input.accept = supportedExts.join(',')
  } else {
    // 支持所有格式
    const allExts = [...imageExts, ...documentExts, ...textExts]
    input.accept = allExts.join(',')
  }

  input.onchange = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i])
      }
    }
  }
  input.click()
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const toggleWebSearch = () => {
  enableWebSearch.value = !enableWebSearch.value

  // 更新会话
  if (props.session) {
    const updatedSession = {
      ...props.session,
      enableWebSearch: enableWebSearch.value,
    }
    sessionsStore.updateSession(updatedSession)

    // 强制刷新视图
    props.setActiveSession({ ...updatedSession })
  }
}

const openModelHeader = () => {
  activeHeader.value = 'model'
}

const showSettingsModal = () => {
  settingsModalVisible.value = true
}

const closeHeader = () => {
  activeHeader.value = null
  // 清除搜索文本
  if (modelSearchText.value) {
    modelSearchText.value = ''
  }
}

const handleHeaderOpenChange = (open: boolean) => {
  if (!open) {
    closeHeader()
  }
}

const handleSettingsSave = (newSettings: Partial<AssistantSettings>) => {
  if (props.session) {
    const updatedSession = {
      ...props.session,
      settings: newSettings,
    }
    sessionsStore.updateSession(updatedSession)

    // 强制刷新视图
    props.setActiveSession({ ...updatedSession })
  }
  settingsModalVisible.value = false
}

const selectModel = async (model: Model) => {
  if (props.session) {
    try {
      const newSession = {
        ...props.session,
        model,
      }
      sessionsStore.updateSession(newSession)

      // 强制刷新视图
      props.setActiveSession({ ...newSession })
      closeHeader()
    } catch (error) {
      console.error('切换模型失败:', error)
      message.error('切换模型失败')
    }
  } else {
    setDefModel(model)
  }
}

// 检查模型是否具有特定能力
const hasAbility = (model: Model, ability: string) => {
  return model.abilityList?.includes(ability as any)
}

// 添加确认清空的函数
const onClearConfirm = async () => {
  if (props.session) {
    console.log('onClearConfirm', props.session)
    const updatedSession = {
      ...props.session,
      messages: [],
    }
    sessionsStore.updateSession(updatedSession)

    // 使用thunk中的clearSessionMessages函数，确保同时清理messageBlocks
    await clearSessionMessages(props.session.id)()

    // 强制刷新视图
    props.setActiveSession({ ...updatedSession })
  }
}
const onPause = async () => {
  if (props.session) {
    console.log('onPause', props.session)
    // 获取当前会话的消息
    const sessionMessages = messagesStore.getMessagesForSession(props.session.id)
    if (!sessionMessages) return

    // 找出正在处理中的消息
    const streamingMessages = sessionMessages.filter(
      (m) => m.status === 'processing' || m.status === 'pending',
    )

    // 获取所有唯一的askId
    const askIds = [
      ...new Set(streamingMessages?.map((m) => m.askId).filter((id) => !!id) as string[]),
    ]

    // 取消所有正在进行的请求
    for (const askId of askIds) {
      abortCompletion(askId)
    }

    // 设置会话加载状态为false
    messagesStore.setSessionLoading({
      sessionId: props.session.id,
      loading: false,
    })
  }
}

const sendMessage = async () => {
  if (inputEmpty.value || loading.value) {
    return
  }
  EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE)
  // 关闭所有header
  closeHeader()
  let currentSession = props.session
  if (!currentSession) {
    // 创建新会话时，使用用户选择的模型而不是默认会话的硬编码模型
    currentSession = {
      ...defaultSession.value,
      id: uuid(), // 生成新的唯一 ID
      model: defaultModel.value as Model,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addSession(currentSession)
    props.setActiveSession(currentSession)
  }
  const currentModel = currentSession.model || defaultModel.value
  const isModelAvailable = models.value.some((m) => m.id === currentModel.id)

  if (!isModelAvailable) {
    message.error('请选择模型')
    return
  }
  // 检查是否有文件仍在上传中
  const hasUploadingFiles = files.value.some((file) => file.status === 'uploading')
  if (hasUploadingFiles) {
    message.error('文件正在上传中，请稍候再发送')
    return
  }

  // 过滤掉上传状态为 error 的文件
  const validFiles = files.value.filter((file) => file.status !== 'error')

  const baseUserMessage: MessageInputBaseParams = {
    session: currentSession,
    content: text.value,
  }

  if (validFiles.length > 0) {
    baseUserMessage.files = validFiles
  }

  const { message: userMessage, blocks } = getUserMessage(baseUserMessage)

  try {
    // 发送消息并确保文件块被保存
    await _sendMessage(userMessage, blocks, currentSession)

    // 清空输入
    text.value = ''
    files.value = []
  } catch (error) {
    console.error('发送消息失败:', error)
    message.error('发送消息失败，请重试')
  }
}

// 添加点击外部区域关闭模型选择的功能
const handleClickOutside = (e: MouseEvent) => {
  if (activeHeader.value !== null) {
    // 检查点击的元素是否在header区域内
    const headerContent = document.querySelector('.header-content')
    const modelButton = document.querySelector('[title="选择模型"]')
    const settingsButton = document.querySelector('[title="模型设置"]')

    if (headerContent) {
      // 如果点击的不是header内容区域，也不是打开header的按钮，则关闭header
      if (
        !headerContent.contains(e.target as Node) &&
        !(modelButton && modelButton.contains(e.target as Node)) &&
        !(settingsButton && settingsButton.contains(e.target as Node))
      ) {
        closeHeader()
      }
    }
  }
}

// 监听点击事件
watch(
  () => activeHeader.value,
  (newValue: string | null) => {
    if (newValue !== null) {
      // 添加点击事件监听
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
    } else {
      // 移除点击事件监听
      document.removeEventListener('click', handleClickOutside)
    }
  },
)

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 文件上传按钮提示文本
const uploadButtonTooltip = computed(() => {
  const hasVisionAbility = currentModel.value?.abilityList?.includes('vision')
  return hasVisionAbility ? '上传文件' : '上传文档（模型不支持图片）'
})
</script>

<style lang="scss" scoped>
.inputbar-container {
  background-color: var(--color-bg-1);
  width: 100%;
}

.inputbar-content {
  width: calc(100% - 40px);
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background-color: var(--color-bg-1);
  overflow: hidden;
}

.inputbar-sender {
  width: 100%;
  border: none;
  box-shadow: none;

  :deep(.ant-sender-container) {
    border: none;
  }
}

.attachment-header {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.attachment-list {
  display: flex;
  overflow-x: auto;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--color-bg-2);
  border-radius: var(--border-radius-base);
  width: 180px;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.attachment-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-list {
  max-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.model-search {
  margin-bottom: 12px;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--color-bg-1);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: var(--border-radius-base);
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: var(--color-bg-2);
  }

  &.active {
    background-color: var(--color-bg-3);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background-color: var(--color-primary);
      border-radius: 0 2px 2px 0;
    }
  }
}

.model-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.model-icon-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.model-icon-default {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-bg-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-name {
  font-weight: 500;
  color: var(--color-text-1);
}

.model-abilities {
  display: flex;
  gap: 8px;
  font-size: 16px;
}

.settings-form {
  padding: 0 16px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.sender-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 8px;
}

.model-button-content {
  display: flex;
  align-items: center;
}

.model-button-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 4px;
}

.model-button-icon-default {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-bg-3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.attachment-container {
  border-bottom: 1px solid var(--color-border);
  padding: 8px 12px;
}

.attachment-list {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-bg-4);
    border-radius: 2px;
  }
}

.add-attachment {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  color: var(--color-text-3);
  flex-shrink: 0;
}

.model-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  color: var(--color-text-2);
  font-size: 14px;

  .anticon {
    font-size: 24px;
    margin-bottom: 8px;
  }
}

.attachment-item-wrapper {
  position: relative;

  &:hover {
    .attachment-delete-btn {
      display: flex;
    }
  }
  :deep(.ant-attachment-list-card-type-preview) {
    width: 62px;
    height: 62px;
    padding: 0;
  }
}

.attachment-delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  display: none;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  cursor: pointer;
  z-index: 10;
  font-size: 9px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
