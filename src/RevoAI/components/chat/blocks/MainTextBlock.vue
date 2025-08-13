<template>
  <div>
    <!-- <p
      v-if="role === 'user'"
      class="markdown"
      :style="{
        whiteSpace: 'pre-line',
        fontSize: `16px`,
      }"
    >
      {{ block.content }}
    </p> -->
    <Bubble
      v-if="role === 'user'"
      class="markdown"
      placement="end"
      :content="block.content"
      :styles="{
        avatar: {
          display: 'none',
        },
        content: {
          color: 'var(--color-text-1)',
        },
      }"
      :avatar="{}"
      :arrow="false"
    />

    <Markdown v-else :block="{ ...block, content: ignoreToolUse }" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import { useMessageBlocksStore } from '@/RevoAI/store'
import Markdown from '../Markdown/Markdown.vue'
import { cleanMarkdownContent } from '@/RevoAI/utils/formats'
import { Bubble } from 'ant-design-x-vue'

// HTML实体编码辅助函数
const encodeHTML = (str: string): string => {
  const entities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }
  return str.replace(/[&<>"']/g, (match) => entities[match])
}

const toolUseRegex = /<tool_use>([\s\S]*?)<\/tool_use>/g

export default defineComponent({
  name: 'MainTextBlock',
  components: {
    Markdown,
    Bubble,
  },
  props: {
    block: {
      type: Object as PropType<any>,
      required: true,
    },
    citationBlockId: {
      type: String,
      default: undefined,
    },
    role: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props) {
    const store = useMessageBlocksStore()

    // 使用传递的citationBlockId直接在选择器中
    const rawCitations = computed(() =>
      store.selectFormattedCitationsByBlockId(props.citationBlockId),
    )

    const formattedCitations = computed(() => {
      return rawCitations.value.map((citation: any) => ({
        ...citation,
        content: citation.content ? cleanMarkdownContent(citation.content) : citation.content,
      }))
    })

    const processedContent = computed(() => {
      let content = props.block.content
      // 更新条件以使用citationBlockId
      if (
        !props.block.citationReferences?.length ||
        !props.citationBlockId ||
        formattedCitations.value.length === 0
      ) {
        return content
      }

      formattedCitations.value.forEach((citation: any) => {
        const citationNum = citation.number
        const supData = {
          id: citationNum,
          url: citation.url,
          title: citation.title || citation.hostname || '',
          content: citation.content?.substring(0, 200),
          sourceIcon: citation.sourceIcon,
        }
        const isLink = citation.url.startsWith('http')
        const citationJson = encodeHTML(JSON.stringify(supData))

        // 处理普通引用 [N] 和预格式化链接 [<sup>N</sup>](url)
        const plainRefRegex = new RegExp(`\\[${citationNum}\\]`, 'g')

        const supTag = `<sup data-citation='${citationJson}'>${citationNum}</sup>`
        const citationTag = isLink ? `[${supTag}](${citation.url})` : supTag

        content = content.replace(plainRefRegex, citationTag)
      })

      return content
    })

    const ignoreToolUse = computed(() => {
      return processedContent.value.replace(toolUseRegex, '')
    })

    return {
      formattedCitations,
      processedContent,
      ignoreToolUse,
    }
  },
})
</script>

<style scoped>
.user-msg {
  color: var(--color-text-1) !important;
}
</style>
