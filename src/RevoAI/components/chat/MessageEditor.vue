<template>
  <div class="message-editor">
    <a-textarea
      v-model:value="editedContent"
      :rows="4"
      :auto-size="{ minRows: 2, maxRows: 10 }"
      placeholder="编辑消息内容..."
      class="editor-textarea"
    />
    <div class="editor-actions">
      <a-button type="primary" @click="saveEdit">保存</a-button>
      <a-button @click="cancelEdit">取消</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button, Input } from 'ant-design-vue'
import type { Message } from '@/RevoAI/types/newMessage'
import { getMainTextContent } from '@/RevoAI/utils/messageUtils/find'

const AButton = Button
const ATextarea = Input.TextArea

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  (e: 'save', messageId: string, content: string): void
  (e: 'cancel'): void
}>()

// 编辑的内容
const editedContent = ref('')

// 初始化编辑内容
onMounted(() => {
  // 获取消息的主要文本内容
  const content = getMainTextContent(props.message)
  editedContent.value = content
})

// 保存编辑
const saveEdit = () => {
  emit('save', props.message.id, editedContent.value)
}

// 取消编辑
const cancelEdit = () => {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.message-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-textarea {
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-width: 50vw;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
