import MarkdownIt from "markdown-it";
import hljs from "./highlight";
import markdownItHighlight from "markdown-it-highlightjs";
import { preWrapperPlugin } from "./preWrapper";

import markdownItKatex from "@vscode/markdown-it-katex";
// 修复splitAtDelimiters引入问题
// import splitAtDelimiters from "katex/contrib/auto-render/splitAtDelimiters";

import "katex/dist/katex.min.css";
import "katex/dist/contrib/mhchem.min.js";
// 引入highlight.js的样式，这里使用github主题
import "highlight.js/styles/github.css";

import {
  markdownItMermaidPlugin,
  renderMermaidSSE,
  transformMermaid,
} from "@nzoth/toolkit";

import "@nzoth/toolkit/styles";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ""; // 使用外部默认转义
  },
});

md.use(markdownItHighlight, {
  hljs,
})
  .use(preWrapperPlugin, {
    hasSingleTheme: true,
    codeCopyButtonTitle: "复制代码",
  })
  .use(markdownItKatex)
  .use(markdownItMermaidPlugin);

// 简化的数学公式转换函数，不再依赖splitAtDelimiters
const transformMathMarkdown = (markdownText: string) => {
  // 简单替换 \[ \] 和 \( \) 为 $$ $ 格式
  let result = markdownText.replace(/\\\[(.*?)\\\]/gs, "$$$$1$$");
  result = result.replace(/\\\((.*?)\\\)/gs, "$$$1$");
  return result;
};

const transformThinkMarkdown = (source: string): string => {
  let result = "";
  let buffer = "";
  let inThinkBlock = false;

  const classNameWrapper = "think-wrapper";

  // 转义 <think/> 中的 <script/>
  const escapeScriptTags = (content: string): string => {
    // <script> 或 <script ...>
    let escaped = content.replace(/<script([^>]*)>/gi, "&lt;script$1&gt;");
    // </script>
    escaped = escaped.replace(/<\/script>/gi, "&lt;/script&gt;");
    // <script ... />
    escaped = escaped.replace(/<script([^>]*)\s*\/>/gi, "&lt;script$1 /&gt;");

    return escaped;
  };

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const nextChars = source.slice(i, i + 7);
    const endChars = source.slice(i, i + 8);

    if (!inThinkBlock && nextChars === "<think>") {
      inThinkBlock = true;
      result += `<div class="${classNameWrapper}">`;
      i += 6;
      continue;
    }

    if (inThinkBlock && endChars === "</think>") {
      inThinkBlock = false;
      result += "</div>";
      i += 7;
      continue;
    }

    if (inThinkBlock) {
      buffer += char;
    } else {
      result += char;
    }
  }

  if (buffer) {
    const escapedBuffer = escapeScriptTags(buffer);
    const thinkContent = md.render(escapedBuffer);

    result = result.replace(
      `<div class="${classNameWrapper}">`,
      `<div class="${classNameWrapper}">${thinkContent}`
    );
  }

  return result;
};

export const renderMarkdownText = (content: string) => {
  const thinkTransformed = transformThinkMarkdown(content);
  const mathTransformed = transformMathMarkdown(thinkTransformed);
  const mermaidTransformed = transformMermaid(mathTransformed);
  return md.render(mermaidTransformed);
};

export const renderMermaidProcess = renderMermaidSSE;
