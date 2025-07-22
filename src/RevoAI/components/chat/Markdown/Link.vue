<template>
  <!-- 处理内部链接 -->
  <span v-if="isInternalLink" class="link">
    <slot></slot>
  </span>

  <!-- 如果是引用链接并且有引用数据，则使用CitationTooltip -->
  <CitationTooltip
    v-else-if="isCitation && citationData"
    :citation="citationData"
  >
    <a v-bind="$attrs" target="_blank" rel="noreferrer" @click.stop>
      <slot></slot>
    </a>
  </CitationTooltip>

  <!-- 普通链接 -->
  <a v-else v-bind="$attrs" target="_blank" rel="noreferrer" @click.stop>
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import CitationTooltip from "./CitationTooltip.vue";

export default defineComponent({
  name: "MarkdownLink",
  components: {
    CitationTooltip,
  },
  inheritAttrs: false,
  props: {
    href: {
      type: String,
      default: "",
    },
    citationData: {
      type: Object as PropType<{
        url: string;
        title?: string;
        content?: string;
      }>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    // 检查是否为内部链接
    const isInternalLink = computed(() => props.href?.startsWith("#"));

    // 检查是否为引用链接（包含<sup>标签）
    const isCitation = computed(() => {
      const defaultSlot = slots.default?.();
      if (!defaultSlot) return false;

      return defaultSlot.some((child) => {
        if (typeof child === "object" && child.type === "sup") {
          return true;
        }
        return false;
      });
    });

    return {
      isInternalLink,
      isCitation,
    };
  },
});
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
