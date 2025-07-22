<template>
  <Collapse
    v-model:activeKey="activeKey"
    size="small"
    class="message-thought-container"
    expandIconPosition="end"
  >
    <CollapsePanel key="thought">
      <template #header>
        <div class="message-title-label">
          <div style="height: 18px">
            <Lightbulb :size="18" />
          </div>
          <span class="thinking-text">
            {{ isThinking ? '思考中' : '已思考' }}
            <ThinkingTimeSeconds
              :blockThinkingTime="block.thinking_millsec"
              :isThinking="isThinking"
            />
          </span>
          <Tooltip v-if="!isThinking" title="复制" :mouseEnterDelay="0.8">
            <button
              class="action-button message-action-button"
              @click.stop="copyThought"
              aria-label="复制"
            >
              <Copy v-if="!copied" :size="18" />
              <CheckOutlined v-else style="color: var(--color-primary)" />
            </button>
          </Tooltip>
        </div>
      </template>
      <div
        class="message-thought-content"
        :style="{
          fontFamily: 'var(--font-family)',
          fontSize: '14px',
        }"
      >
        <Markdown :block="block" />
      </div>
    </CollapsePanel>
  </Collapse>
</template>

<script setup lang="ts">
import { CheckOutlined } from '@ant-design/icons-vue'
import { computed, defineComponent, PropType, ref, watch, onMounted, onUnmounted, h } from 'vue'
import { Collapse, CollapsePanel, message as antdMessage, Tooltip } from 'ant-design-vue'
import { Copy, Lightbulb } from 'lucide-vue-next'
import Markdown from '../Markdown/Markdown.vue'
import { lightbulbVariants } from '@/RevoAI/utils/motionVariants'
import { MessageBlockStatus } from '@/RevoAI/types/newMessage'

// 定义props
const props = defineProps({
  block: {
    type: Object as PropType<any>,
    required: true,
  },
})

// 内部状态
const copied = ref(false)
const activeKey = ref<string[]>([])

// 组件挂载时，如果正在思考则展开
onMounted(() => {
  if (isThinking.value) {
    activeKey.value = ['thought']
  }
})

// 计算属性
const isThinking = computed(() => props.block.status === MessageBlockStatus.STREAMING)

// 监听思考状态变化
watch(isThinking, (newVal) => {
  if (!newVal) {
    // 思考结束后，延迟一小段时间再收起，让用户有机会看到最终内容
    setTimeout(() => {
      activeKey.value = []
    }, 500)
  } else {
    activeKey.value = ['thought']
  }
})

// 复制思考内容
const copyThought = () => {
  if (props.block.content) {
    navigator.clipboard
      .writeText(props.block.content)
      .then(() => {
        antdMessage.success({
          content: '复制成功',
          key: 'copy-message',
        })
        copied.value = true
        setTimeout(() => (copied.value = false), 2000)
      })
      .catch((error) => {
        console.error('Failed to copy text:', error)
        antdMessage.error({
          content: '复制失败',
          key: 'copy-message-error',
        })
      })
  }
}

// ThinkingTimeSeconds组件
const ThinkingTimeSeconds = defineComponent({
  props: {
    blockThinkingTime: {
      type: Number,
      default: 0,
    },
    isThinking: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const thinkingTime = ref(props.blockThinkingTime || 0)
    let timer: NodeJS.Timeout | null = null

    // 监听blockThinkingTime变化，确保在外部更新时同步
    watch(
      () => props.blockThinkingTime,
      (newTime) => {
        if (newTime !== undefined && !props.isThinking) {
          thinkingTime.value = newTime
          if (timer) {
            clearInterval(timer)
            timer = null
          }
        }
      },
    )

    watch(
      () => props.isThinking,
      (isThinking) => {
        if (isThinking) {
          timer = setInterval(() => {
            thinkingTime.value += 100
          }, 100)
        } else if (timer) {
          clearInterval(timer)
          timer = null
        }
      },
      { immediate: true },
    )

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    })

    const thinkingTimeSeconds = computed(() => (thinkingTime.value / 1000).toFixed(1))

    return () => {
      return h('span', `${thinkingTimeSeconds.value}s`)
    }
  },
})
</script>

<style scoped>
.message-thought-container {
  width: 50vw;
  /* max-width: 85%; */
  margin-bottom: 15px;
}

.message-title-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 22px;
  gap: 4px;
}

.thinking-text {
  color: var(--color-text-2);
}

.action-button {
  background: none;
  border: none;
  color: var(--color-text-2);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  opacity: 0.6;
  transition: all 0.3s;
}

.action-button:hover {
  opacity: 1;
  color: var(--color-text);
}

.action-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.action-button .iconfont {
  font-size: 14px;
}
</style>
