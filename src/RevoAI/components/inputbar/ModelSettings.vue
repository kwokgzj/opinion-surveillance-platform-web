<template>
  <a-modal
    :open="visible"
    @update:open="(val) => emit('update:visible', val)"
    title="模型设置"
    @ok="saveSettings"
    :width="500"
  >
    <div class="settings-form">
      <a-form :model="localSettings" layout="horizontal" :label-col="{ span: 5 }">
        <!-- 温度 -->
        <a-form-item label="温度" name="temperature">
          <a-slider
            v-model:value="localSettings.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            :tooltip="{ formatter: (value: number) => value }"
          />
        </a-form-item>

        <!-- 流式输出 -->
        <a-form-item label="流式输出" name="streamOutput">
          <a-switch v-model:checked="localSettings.streamOutput" />
        </a-form-item>

        <!-- 最大Token -->
        <a-form-item label="最大令牌数" name="maxTokens">
          <a-input-number
            v-model:value="localSettings.maxTokens"
            :min="-1"
            :max="8000"
            placeholder="-1表示不限制"
            style="width: 100%"
          />
        </a-form-item>

        <!-- Top P -->
        <a-form-item label="Top P" name="topP">
          <a-slider
            v-model:value="localSettings.topP"
            :min="0"
            :max="1"
            :step="0.05"
            :tooltip="{ formatter: (value: number) => value }"
          />
        </a-form-item>

        <!-- 停止标记 -->
        <a-form-item label="停止标记" name="stopSequences">
          <a-input v-model:value="stopSequencesInput" placeholder="使用英文逗号分隔多个停止标记" />
        </a-form-item>

        <!-- 重复惩罚 -->
        <a-form-item label="重复惩罚" name="presencePenalty">
          <a-slider
            v-model:value="localSettings.presencePenalty"
            :min="-2"
            :max="2"
            :step="0.1"
            :tooltip="{ formatter: (value: number) => value }"
          />
        </a-form-item>

        <!-- 频率惩罚 -->
        <a-form-item label="频率惩罚" name="frequencyPenalty">
          <a-slider
            v-model:value="localSettings.frequencyPenalty"
            :min="-2"
            :max="2"
            :step="0.1"
            :tooltip="{ formatter: (value: number) => value }"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Form, Modal, Slider, Switch, InputNumber, Input } from 'ant-design-vue'
import type { AssistantSettings } from '@/RevoAI/types'

interface Props {
  visible: boolean
  settings: Partial<AssistantSettings>
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'save', settings: Partial<AssistantSettings>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地设置状态
const localSettings = ref<Partial<AssistantSettings>>({
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: -1,
  streamOutput: true,
  stopSequences: [],
})

// 停止标记输入框
const stopSequencesInput = ref('')

// 监听外部设置变化
watch(
  () => props.settings,
  (newSettings) => {
    if (newSettings) {
      localSettings.value = { ...localSettings.value, ...newSettings }

      // 更新停止标记输入框
      if (newSettings.stopSequences && Array.isArray(newSettings.stopSequences)) {
        stopSequencesInput.value = newSettings.stopSequences.join(',')
      }
    }
  },
  { immediate: true, deep: true },
)

// 监听visible变化
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      // 打开弹窗时，重置本地设置
      localSettings.value = { ...localSettings.value, ...props.settings }

      // 更新停止标记输入框
      if (props.settings.stopSequences && Array.isArray(props.settings.stopSequences)) {
        stopSequencesInput.value = props.settings.stopSequences.join(',')
      } else {
        stopSequencesInput.value = ''
      }
    }
  },
)

// 保存设置
const saveSettings = () => {
  // 处理停止标记
  if (stopSequencesInput.value) {
    const sequences = stopSequencesInput.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s)
    localSettings.value.stopSequences = sequences
  } else {
    localSettings.value.stopSequences = []
  }

  emit('save', localSettings.value)
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.settings-form {
  padding: 0 16px;
}
</style>
