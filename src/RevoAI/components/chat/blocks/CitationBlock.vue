<template>
  <div class="citation-block">
    <div class="loading-message" v-if="block.status === MessageBlockStatus.PROCESSING">
      <SearchOutlined />
      <span>联网搜索中...</span>
    </div>
    <div v-else-if="block.status === MessageBlockStatus.ERROR" class="error-message">
      <a-alert
        type="error"
        message="搜索失败"
        :description="block.error?.message || '无法获取网络搜索结果'"
      />
    </div>
    <citations-list
      v-else-if="block.status === MessageBlockStatus.SUCCESS && hasCitations"
      :citations="formattedCitations"
    />
    <div
      v-else-if="block.status === MessageBlockStatus.SUCCESS && !hasCitations"
      class="empty-message"
    >
      <a-empty description="没有找到相关信息" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { Empty } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { useMessageBlocksStore } from '@/RevoAI/store/messageBlock'
import CitationsList from './CitationsList.vue'
import { MessageBlockStatus, type CitationMessageBlock } from '@/RevoAI/types/newMessage'

const props = defineProps<{
  block: CitationMessageBlock
}>()

const messageBlocksStore = useMessageBlocksStore()

// 加载指示器
const loadingIndicator = h(SearchOutlined, {
  style: {
    fontSize: '16px',
  },
  spin: true,
})

// 获取格式化后的引用列表
const formattedCitations = computed(() => {
  return messageBlocksStore.selectFormattedCitationsByBlockId(props.block.id)
})

// 判断是否有引用
const hasCitations = computed(() => {
  return formattedCitations.value && formattedCitations.value.length > 0
})
</script>

<style scoped>
.loading-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-2);
  animation: shine 1.2s ease-in-out infinite;
}

@keyframes shine {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.citation-block {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.error-message {
  width: 100%;
  max-width: 600px;
  margin: 8px 0;
}

.empty-message {
  width: 100%;
  padding: 16px;
  display: flex;
  justify-content: center;
  color: var(--color-text-2);
}

:deep(.ant-spin-text) {
  margin-top: 8px;
  color: var(--color-text-2);
}
</style>
