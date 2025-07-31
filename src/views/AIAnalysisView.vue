<template>
    <div class="ai-analysis-page">
    <!-- 项目选择区域 - 悬浮透明 -->
    <div class="project-selector-area">
      <div class="project-selectors">
        <div
          v-for="(selector, index) in projectSelectors"
          :key="selector.id"
          class="project-selector-wrapper"
        >
          <div class="form-item">
            <label>项目：</label>
            <el-select
              v-model="selector.selectedProjectIds"
              placeholder="请选择项目"
              class="project-select"
              @change="(value: string[]) => handleProjectChange(index, value)"
              :loading="projectsLoading"
              filterable
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              style="flex: 1; min-width: 200px;"
            >
              <template #header>
                <el-checkbox
                  v-model="selectorCheckAll[index]"
                  :indeterminate="selectorIndeterminate[index]"
                  @change="(val: boolean) => handleSelectorCheckAll(index, val)"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="project in projects"
                :key="project.projectId"
                :label="project.projectName"
                :value="project.projectId"
              />
            </el-select>
          </div>


        </div>
      </div>
    </div>

    <!-- 聊天容器 -->
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import RevoChatVue from '@/RevoAI/components/RevoChatVue.vue'
import type { AssistantSettings, MCPServer, Model } from '@/RevoAI/types'
import { getProjectList } from '@/api/project/project'
import type { ProjectSummary } from '@/api/project/project.type'
import { useProjectStore } from '@/stores/project'

// 项目选择器项目类型
interface ProjectSelector {
  id: string
  selectedProjectIds: string[]
}

const apiKey = ref('sk-mhmQr61vyBQO7CZw7cBeF4CdD693472bA12aA5A375D845B4')
const baseUrl = ref('http://192.168.2.21:9300')

// 项目相关状态
const projects = ref<ProjectSummary[]>([])
const projectsLoading = ref(false)
const projectSelectors = ref<ProjectSelector[]>([
  {
    id: generateId(),
    selectedProjectIds: []
  }
])

// 全选状态管理
const selectorCheckAll = ref<boolean[]>([false])
const selectorIndeterminate = ref<boolean[]>([false])

const projectStore = useProjectStore()

// 生成唯一ID
function generateId(): string {
  return 'selector_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 加载项目列表
const loadProjects = async () => {
  projectsLoading.value = true
  try {
    const response = await getProjectList()
    projects.value = response || []

    // 如果store中有当前项目，设置到第一个选择器
    if (projectStore.currentProjectId && projectSelectors.value.length > 0) {
      projectSelectors.value[0].selectedProjectIds = [projectStore.currentProjectId]
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败')
  } finally {
    projectsLoading.value = false
  }
}

// 处理项目选择变化
const handleProjectChange = (index: number, projectIds: string[]) => {
  // 更新全选状态
  updateCheckAllState(index)

  // 如果是第一个选择器且有选择项目，更新store
  if (index === 0 && projectIds.length > 0) {
    const firstProject = projects.value.find(p => p.projectId === projectIds[0])
    if (firstProject) {
      projectStore.setCurrentProject({
        projectId: firstProject.projectId,
        projectName: firstProject.projectName,
        projectType: firstProject.projectType
      })
    }
  }

  console.log(`项目选择器 ${index + 1} 选择了项目:`, projectIds)
}

// 更新全选状态
const updateCheckAllState = (index: number) => {
  const selector = projectSelectors.value[index]
  const selectedCount = selector.selectedProjectIds.length
  const totalCount = projects.value.length

  if (selectedCount === 0) {
    selectorCheckAll.value[index] = false
    selectorIndeterminate.value[index] = false
  } else if (selectedCount === totalCount) {
    selectorCheckAll.value[index] = true
    selectorIndeterminate.value[index] = false
  } else {
    selectorCheckAll.value[index] = false
    selectorIndeterminate.value[index] = true
  }
}

// 处理全选
const handleSelectorCheckAll = (index: number, val: boolean) => {
  selectorIndeterminate.value[index] = false
  if (val) {
    projectSelectors.value[index].selectedProjectIds = projects.value.map(p => p.projectId)
  } else {
    projectSelectors.value[index].selectedProjectIds = []
  }
}





// 获取当前选择的所有项目ID
const getSelectedProjectIds = () => {
  return projectSelectors.value
    .flatMap(selector => selector.selectedProjectIds)
    .filter((id, index, arr) => arr.indexOf(id) === index) // 去重
}

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
    displayName: 'Claude-3.7-Sonnet(Thinking)',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description:
      'Claude 3.7 Sonnet(Thinking)模式，专注于深度推理和复杂问题解决，提供详细的思考过程。',
    type: 'chat',
    abilityList: ['reasoning', 'functionCall', 'vision'],
  },
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'claude-3-5-sonnet-latest',
    displayName: 'Claude-3.5-Sonnet',
    icon: 'http://192.168.2.21:11180/revo-ai-files/model-logo/claude.png',
    description:
      'Claude 3.5 Sonnet为Anthropic Claude系列的核心模型，具备强大的推理和创作能力，适合复杂任务处理。',
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

// 组件挂载时加载项目列表
onMounted(() => {
  loadProjects()
})

// 暴露方法供外部调用
defineExpose({
  getSelectedProjectIds
})
</script>

<style lang="less" scoped>
.ai-analysis-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.project-selector-area {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 12px 16px;
  border: 1px solid rgba(220, 223, 230, 0.3);
  max-width: calc(100vw - 40px);
  min-width: 260px;
  width: auto;
}

.project-selectors {
  display: flex;
  justify-content: center;
  align-items: center;
}

.project-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
}

.form-item label {
  min-width: 50px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
  font-weight: 500;
}

.project-select {
  flex: 1;
}



.chat-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-selector-area {
    top: 0;
    left: 0;
    right: 10px;
    min-width: auto;
    width: calc(100% - 20px);
    padding: 12px 16px;
  }

  .form-item label {
    min-width: 40px;
    font-size: 13px;
  }

  .project-select {
    min-width: 150px;
  }
}

@media (max-width: 480px) {
  .project-selector-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .form-item {
    justify-content: space-between;
  }
}
</style>
