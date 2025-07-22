<template>
  <StyledTooltip
    :title="tooltipContent"
    placement="top"
    :arrow="false"
    :styles="{
      body: {
        backgroundColor: 'var(--color-background-mute)',
        border: '1px solid var(--color-border)',
        padding: 0,
        borderRadius: '8px',
      },
    }"
  >
    <slot></slot>
  </StyledTooltip>
</template>

<script lang="ts">
import { defineComponent, h, PropType, computed } from "vue";
import { Tooltip } from "ant-design-vue";

export default defineComponent({
  name: "CitationTooltip",
  components: {
    StyledTooltip: Tooltip,
  },
  props: {
    citation: {
      type: Object as PropType<{
        url: string;
        title?: string;
        content?: string;
        sourceIcon?: string;
      }>,
      required: true,
    },
  },
  setup(props) {
    const hostname = computed(() => {
      try {
        return new URL(props.citation.url).hostname;
      } catch {
        return props.citation.url;
      }
    });

    // 自定义悬浮卡片内容
    const tooltipContent = () =>
      h("div", { class: "tooltip-content-wrapper" }, [
        h(
          "div",
          {
            class: "tooltip-header",
            onClick: () => window.open(props.citation.url, "_blank"),
          },
          [
            // h(Favicon, { hostname: hostname.value, alt: props.citation.title || hostname.value }),
            h("img", {
              src: props.citation.sourceIcon,
              width: 16,
              height: 16,
              alt: "",
            }),
            h(
              "div",
              {
                class: "tooltip-title",
                title: props.citation.title || hostname.value,
              },
              props.citation.title || hostname.value
            ),
          ]
        ),
        props.citation.content &&
          h("div", { class: "tooltip-body" }, props.citation.content),
        h(
          "div",
          {
            class: "tooltip-footer",
            onClick: () => window.open(props.citation.url, "_blank"),
          },
          hostname.value
        ),
      ]);

    return {
      tooltipContent,
    };
  },
});
</script>

<!-- <style scoped>
.tooltip-content-wrapper {
  padding: 12px;
  /* background-color: var(--color-background-soft); */
  border-radius: 8px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.tooltip-header:hover {
  opacity: 0.8;
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
  cursor: pointer;
}

.tooltip-footer:hover {
  text-decoration: underline;
}

/* :deep(.ant-tooltip-arrow .ant-tooltip-arrow-content) {
  background-color: var(--color-background-1);
} */
</style> -->
