<template>
  <div v-if="count > 0">
    <a-popover
      :arrow="false"
      :content="popoverContent"
      :title="popoverTitle"
      placement="right"
      trigger="click"
      :styles="{
        body: {
          padding: '0 0 8px 0',
        },
      }"
      overlayClassName="citation-popover"
    >
      <a-button class="open-button" type="text" @click="setOpen(true)">
        <div class="preview-icons">
          <div
            v-for="(c, i) in previewItems"
            :key="i"
            class="preview-icon"
            :style="{ zIndex: previewItems.length - i }"
          >
            <img :src="c.sourceIcon" width="16" height="16" alt="" />
          </div>
        </div>
        {{ $t("message.citation", { count }) }}
      </a-button>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from "vue";
import { Button, message, Popover } from "ant-design-vue";
import { Check, Copy } from "lucide-vue-next";

export interface Citation {
  number: number;
  url: string;
  title?: string;
  hostname?: string;
  content?: string;
  showFavicon?: boolean;
  type?: string;
  metadata?: Record<string, any>;
  sourceIcon?: string;
}

interface CitationsListProps {
  citations: Citation[];
}

const props = defineProps<CitationsListProps>();
const open = ref(false);

const setOpen = (value: boolean) => {
  open.value = value;
};

const previewItems = computed(() => props.citations.slice(0, 5));
const count = computed(() => props.citations.length);

/**
 * 限制文本长度
 * @param text
 * @param maxLength
 */
const truncateText = (text: string, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const handleLinkClick = (url: string, event: MouseEvent) => {
  event.preventDefault();
  if (url.startsWith("http")) window.open(url, "_blank", "noopener,noreferrer");
  else {
    // 处理非http链接，这里需要根据实际情况修改
    // 在React版本中使用了window.api.file.openPath
    console.warn("非http链接处理未实现:", url);
  }
};

// 复制按钮组件
const CopyButton = (props: { content: string }) => {
  const copied = ref(false);

  const handleCopy = () => {
    if (!props.content) return;
    navigator.clipboard
      .writeText(props.content)
      .then(() => {
        copied.value = true;
        message.success("已复制");
        setTimeout(() => (copied.value = false), 2000);
      })
      .catch(() => {
        message.error("复制失败");
      });
  };

  return h(
    "div",
    {
      class: "copy-icon-wrapper",
      onClick: handleCopy,
    },
    copied.value ? h(Check, { size: 14 }) : h(Copy, { size: 14 })
  );
};

// Web搜索引用组件
const WebSearchCitation = (props: { citation: Citation }) => {
  const { citation } = props;

  return h("div", { class: "web-search-card" }, [
    h("div", { class: "web-search-card-header" }, [
      h("img", { src: citation.sourceIcon, width: 16, height: 16, alt: "" }),
      h(
        "a",
        {
          class: "citation-link text-nowrap",
          href: citation.url,
          onClick: (e: MouseEvent) => handleLinkClick(citation.url, e),
        },
        citation.title || h("span", { class: "hostname" }, citation.hostname)
      ),
    ]),
    h(
      "div",
      { class: "web-search-card-content selectable-text" },
      citation.content
    ),
  ]);
};

// 弹出内容
const popoverContent = h(
  "div",
  {},
  props.citations.map((citation) =>
    h(
      "div",
      { class: "popover-content-item", key: citation.url || citation.number },
      [
        h("div", { class: "popover-content" }, [
          h(WebSearchCitation, { citation }),
        ]),
      ]
    )
  )
);

// 弹出标题
const popoverTitle = h(
  "div",
  {
    style: {
      padding: "8px 12px 8px",
      marginBottom: -8,
      fontWeight: "bold",
      borderBottom: "0.5px solid var(--color-border)",
    },
  },
  "引用"
);

// 定义$t方法作为临时解决方案，实际项目中应该使用正确的国际化方法
const $t = (key: string, options?: any) => {
  if (key === "message.citation") {
    return `引用 (${options?.count || 0})`;
  }
  return key;
};
</script>

<style scoped>
.open-button {
  display: flex;
  align-items: center;
  padding: 3px 8px;
  margin-bottom: 8px;
  align-self: flex-start;
  font-size: 12px;
  background: var(--color-background-soft);
  border-radius: 30px;
  gap: 8px;
}

.preview-icons {
  display: flex;
  align-items: center;
}

.preview-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f1f1;
  margin-left: -8px;
  border: none;
}

.preview-icon:first-child {
  margin-left: 0;
}

.citation-link {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-1);
  text-decoration: none;
}

.citation-link .hostname {
  color: var(--color-link);
}

.copy-icon-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
  opacity: 0.6;
  margin-left: auto;
  padding: 4px;
  border-radius: 4px;
}

.copy-icon-wrapper:hover {
  opacity: 1;
  background-color: var(--color-background-soft);
}
</style>
