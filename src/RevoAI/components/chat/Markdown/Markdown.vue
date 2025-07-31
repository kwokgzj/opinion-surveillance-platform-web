<template>
  <div
    class="markdown"
    :style="{
      fontSize: `14px`,
      '--message-font-size': `14px`,
    }"
    v-html="renderedContent"
    ref="markdownRef"
  ></div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, nextTick } from 'vue'
import type { PropType } from 'vue'
import { isEmpty } from 'lodash'

import { renderMarkdownText, renderMermaidProcess } from './plugins/markdown'
import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'
import { escapeBrackets, escapeMermaidDots, removeSvgEmptyLines } from '@/RevoAI/utils/formats'
import { useMessageBlocksStore } from '@/RevoAI/store/messageBlock'

export default defineComponent({
  name: 'Markdown',
  props: {
    block: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  setup(props) {
    const markdownRef = ref<HTMLElement | null>(null)
    const messageBlocksStore = useMessageBlocksStore()

    const messageContent = computed(() => {
      const empty = isEmpty(props.block.content)
      const paused = props.block.status === 'paused'
      const content = empty && paused ? '已暂停' : props.block.content || ''
      return removeSvgEmptyLines(escapeBrackets(escapeMermaidDots(content)))
    })

    // 处理引用标记的正则表达式
    const CITATION_REGEX = /\[(\d+)\]/g

    // 将普通HTML内容渲染为Markdown
    const renderedContent = computed(() => {
      return renderMarkdownText(messageContent.value)
    })

    // 处理引用标记
    const processCitations = () => {
      if (!markdownRef.value || !props.block?.citationReferences?.length) return

      const citationBlockId = props.block.citationReferences[0].citationBlockId
      const textNodes = getAllTextNodes(markdownRef.value)

      // 遍历所有文本节点，查找并替换引用标记
      textNodes.forEach((node) => {
        if (!node.textContent) return

        const matches = [...node.textContent.matchAll(CITATION_REGEX)]
        if (matches.length === 0) return

        // 创建一个文档片段来存储替换后的内容
        const fragment = document.createDocumentFragment()
        let lastIndex = 0

        matches.forEach((match) => {
          const [fullMatch, number] = match
          const index = match.index!

          // 添加匹配前的文本
          if (index > lastIndex) {
            fragment.appendChild(
              document.createTextNode(node.textContent!.substring(lastIndex, index)),
            )
          }

          // 创建引用组件
          const citationContainer = document.createElement('span')
          citationContainer.className = 'citation-ref'
          citationContainer.dataset.number = number
          citationContainer.dataset.citationBlockId = citationBlockId
          citationContainer.textContent = number

          // 添加点击事件和悬停事件
          citationContainer.addEventListener('click', () => {
            // 获取引用数据
            const citations = messageBlocksStore.selectFormattedCitationsByBlockId(citationBlockId)
            if (!citations || citations.length === 0) return

            // 查找对应编号的引用
            const matchedCitation = citations.find((c) => c.number === parseInt(number, 10))
            if (!matchedCitation || !matchedCitation.url) return

            // 打开链接
            window.open(matchedCitation.url, '_blank', 'noopener,noreferrer')
          })

          // 添加悬停提示
          citationContainer.addEventListener('mouseenter', () => {
            // 获取引用数据
            const citations = messageBlocksStore.selectFormattedCitationsByBlockId(citationBlockId)
            if (!citations || citations.length === 0) return

            // 查找对应编号的引用
            const matchedCitation = citations.find((c) => c.number === parseInt(number, 10))
            if (!matchedCitation) return

            // 显示tooltip
            const tooltip = document.createElement('div')
            tooltip.className = 'citation-tooltip'

            // 创建tooltip内容
            const tooltipContent = document.createElement('div')
            tooltipContent.className = 'tooltip-content-wrapper'

            // 添加标题
            const header = document.createElement('div')
            header.className = 'tooltip-header'

            const icon = document.createElement('img')
            icon.src = matchedCitation.sourceIcon || ''
            icon.width = 16
            icon.height = 16
            icon.alt = ''

            const title = document.createElement('div')
            title.className = 'tooltip-title'
            title.textContent = matchedCitation.title || matchedCitation.hostname || ''

            header.appendChild(icon)
            header.appendChild(title)
            tooltipContent.appendChild(header)

            // 添加内容
            if (matchedCitation.content) {
              const body = document.createElement('div')
              body.className = 'tooltip-body'
              body.textContent = matchedCitation.content
              tooltipContent.appendChild(body)
            }

            // 添加底部
            const footer = document.createElement('div')
            footer.className = 'tooltip-footer'
            try {
              footer.textContent = new URL(matchedCitation.url).hostname
            } catch {
              footer.textContent = matchedCitation.url
            }
            tooltipContent.appendChild(footer)

            tooltip.appendChild(tooltipContent)

            // 计算位置
            const rect = citationContainer.getBoundingClientRect()
            tooltip.style.position = 'fixed'
            tooltip.style.top = `${rect.top - 10}px`
            tooltip.style.left = `${rect.left + rect.width / 2}px`
            tooltip.style.transform = 'translate(-50%, -100%)'
            tooltip.style.zIndex = '1000'

            // 添加到文档
            document.body.appendChild(tooltip)

            // 鼠标离开时移除tooltip
            citationContainer.addEventListener('mouseleave', () => {
              document.body.removeChild(tooltip)
            })
          })

          fragment.appendChild(citationContainer)
          lastIndex = index + fullMatch.length
        })

        // 添加最后一段文本
        if (lastIndex < node.textContent.length) {
          fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex)))
        }

        // 替换原始节点
        const parent = node.parentNode
        if (parent) {
          parent.replaceChild(fragment, node)
        }
      })
    }

    // 获取元素内的所有文本节点
    const getAllTextNodes = (element: HTMLElement): Text[] => {
      const textNodes: Text[] = []
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null)

      let node
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text)
      }

      return textNodes
    }

    // 渲染Mermaid图表的函数
    const renderMermaid = () => {
      if (markdownRef.value) {
        renderMermaidProcess()
      }
    }

    // 监听内容变化，实时渲染Mermaid和处理引用
    watch(
      () => props.block.content,
      () => {
        // 使用nextTick确保DOM已更新
        nextTick(() => {
          renderMermaid()
          processCitations()
        })
      },
    )

    onMounted(() => {
      // 初始渲染Mermaid图表和处理引用
      nextTick(() => {
        renderMermaid()
        processCitations()
      })

      // 添加代码块复制功能
      setTimeout(() => {
        const codeBlocks = document.querySelectorAll('.markdown-code-wrapper')
        codeBlocks.forEach((block) => {
          const copyButton = block.querySelector('.markdown-code-copy')
          const codeElement = block.querySelector('code')

          if (copyButton && codeElement) {
            copyButton.addEventListener('click', () => {
              const code = codeElement.textContent || ''
              navigator.clipboard
                .writeText(code)
                .then(() => {
                  EventEmitter.emit(EVENT_NAMES.COPY_CODE_SUCCESS)
                })
                .catch((err) => {
                  console.error('复制失败:', err)
                })
            })
          }
        })
      }, 100)
    })

    return {
      renderedContent,
      markdownRef,
    }
  },
})
</script>

<style>
.markdown-code-wrapper {
  position: relative;
  white-space: initial;
  background-color: #f6f6f7;
  line-height: 24px;
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;

  .markdown-code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(60, 60, 67, 0.1);
  }

  .markdown-code-copy {
    padding-left: 14px;
    padding-right: 14px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: transparent;
    color: #808080;
    cursor: pointer;
    transition: all 300ms;
    opacity: 1;
    z-index: 1;

    .markdown-copy-icon {
      font-size: 16px;
      pointer-events: none;
      margin-right: 4px;
      /* i-ci:copy 图标样式需要替换为实际图标 */
    }

    .markdown-copy-text {
      pointer-events: none;

      &.default {
        display: initial;
      }

      &.done {
        display: none;
      }
    }

    &.copied {
      .markdown-copy-icon {
        /* i-ic:baseline-check 图标样式需要替换为实际图标 */
      }

      .markdown-copy-text {
        &.default {
          display: none;
        }

        &.done {
          display: initial;
        }
      }
    }
  }

  .markdown-code-lang {
    padding-left: 14px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(60, 60, 67, 0.56);
    transition: all 300ms;
    opacity: 1;
    z-index: 0;
  }

  pre,
  li {
    code {
      background-color: #f6f6f7;
      white-space: pre;
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }
}

/* 引用数字样式 */
.citation-ref {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  border-radius: 50%;
  background: #f1f1f1;
  color: var(--color-link);
  cursor: pointer;
  margin: 0 2px;
  vertical-align: super;
  text-decoration: none;
  transition: all 0.2s ease;
}

/* 引用提示卡片样式 */
.citation-tooltip {
  position: absolute;
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-border);
  z-index: 1000;
  pointer-events: none;
}

.tooltip-content-wrapper {
  background-color: #ffff;
  padding: 12px;
  border-radius: 8px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.tooltip-title {
  color: var(--color-text-1);
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tooltip-body {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: var(--color-text-2);
}

.tooltip-footer {
  font-size: 12px;
  color: var(--color-link);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
