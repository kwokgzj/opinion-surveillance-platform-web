import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

// 引用格式正则表达式: [数字]
const CITATION_REGEX = /\[(\d+)\]/g;

/**
 * 更彻底的查找方法，递归搜索所有子元素
 * @param {any} children 子元素
 * @returns {string} 找到的 citation 或 ''
 */
export const findCitationInChildren = (children: any): string => {
  if (!children) return "";

  // 直接搜索子元素
  for (const child of Array.isArray(children) ? children : [children]) {
    if (typeof child === "object" && child?.props?.["data-citation"]) {
      return child.props["data-citation"];
    }

    // 递归查找更深层次
    if (typeof child === "object" && child?.props?.children) {
      const found = findCitationInChildren(child.props.children);
      if (found) return found;
    }
  }

  return "";
};

/**
 * 转换数学公式格式：
 * - 将 LaTeX 格式的 '\\[' 和 '\\]' 转换为 '$$$$'。
 * - 将 LaTeX 格式的 '\\(' 和 '\\)' 转换为 '$$'。
 * @param {string} input 输入字符串
 * @returns {string} 转换后的字符串
 */
export function convertMathFormula(input: string): string {
  if (!input) return input;

  let result = input;
  result = result.replaceAll("\\[", "$$$$").replaceAll("\\]", "$$$$");
  result = result.replaceAll("\\(", "$$").replaceAll("\\)", "$$");
  return result;
}

/**
 * 移除 Markdown 文本中每行末尾的两个空格。
 * @param {string} markdown 输入的 Markdown 文本
 * @returns {string} 处理后的文本
 */
export function removeTrailingDoubleSpaces(markdown: string): string {
  // 使用正则表达式匹配末尾的两个空格，并替换为空字符串
  return markdown.replace(/ {2}$/gm, "");
}

/**
 * 根据代码块节点的起始位置生成 ID
 * @param start 代码块节点的起始位置
 * @returns 代码块在 Markdown 字符串中的 ID
 */
export function getCodeBlockId(start: any): string | null {
  return start ? `${start.line}:${start.column}:${start.offset}` : null;
}

/**
 * HTML实体编码辅助函数
 * @param str 输入字符串
 * @returns string 编码后的字符串
 */
export const encodeHTML = (str: string) => {
  return str.replace(/[&<>"']/g, (match) => {
    const entities: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[match];
  });
};

/**
 * 更新Markdown字符串中的代码块内容。
 *
 * 由于使用了remark-stringify，所以会有一些默认格式化操作，例如：
 * - 代码块前后会补充换行符。
 * - 有些空格会被trimmed。
 * - 文档末尾会补充一个换行符。
 *
 * @param raw 原始Markdown字符串
 * @param id 代码块ID，按位置生成
 * @param newContent 修改后的代码内容
 * @returns 替换后的Markdown字符串
 */
export function updateCodeBlock(
  raw: string,
  id: string,
  newContent: string
): string {
  const tree = unified().use(remarkParse).parse(raw);
  visit(tree, "code", (node) => {
    const startIndex = getCodeBlockId(node.position?.start);
    if (startIndex && id && startIndex === id) {
      node.value = newContent;
    }
  });

  return unified().use(remarkStringify).stringify(tree);
}

/**
 * 检查是否为有效的 PlantUML 图表
 * @param code 输入的 PlantUML 图表字符串
 * @returns 有效 true，无效 false
 */
export function isValidPlantUML(code: string | null): boolean {
  if (!code || !code.trim().startsWith("@start")) {
    return false;
  }
  const diagramType = code.match(/@start(\w+)/)?.[1];

  return diagramType !== undefined && code.search(`@end${diagramType}`) !== -1;
}

/**
 * 创建一个markdown-it实例
 */
export function createMarkdownIt(options = {}) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return ""; // 使用外部默认转义
    },
    ...options,
  });

  // 添加引用处理规则
  md.inline.ruler.push("citation_references", (state, silent) => {
    // 快速失败条件
    if (state.src.charCodeAt(state.pos) !== 0x5b /* [ */) {
      return false;
    }

    const match = CITATION_REGEX.exec(state.src.slice(state.pos));
    if (!match || match.index !== 0) {
      return false;
    }

    const citationNumber = parseInt(match[1], 10);
    if (isNaN(citationNumber)) {
      return false;
    }

    // 如果只是检查模式，返回true
    if (silent) {
      return true;
    }

    // 推进状态
    state.pos += match[0].length;

    // 创建token
    const token = state.push("citation_reference", "", 0);
    token.meta = { citationNumber };
    token.content = match[0];

    return true;
  });

  // 渲染引用
  md.renderer.rules.citation_reference = (tokens, idx) => {
    const token = tokens[idx];
    const citationNumber = token.meta.citationNumber;

    // 这里返回的是一个HTML字符串，在Vue中会被解析
    // 我们使用一个特殊的data属性来标记引用编号，以便后续处理
    return `<span class="citation-ref" data-citation-number="${citationNumber}">${citationNumber}</span>`;
  };

  return md;
}

/**
 * 处理markdown中的引用标记，替换为CitationNumber组件
 * @param html 已经渲染好的HTML
 * @param citationBlockId 引用块ID
 */
export function processCitationReferences(
  html: string,
  citationBlockId?: string
) {
  if (!citationBlockId) return html;

  // 替换引用标记为组件调用
  return html.replace(
    /<span class="citation-ref" data-citation-number="(\d+)">(\d+)<\/span>/g,
    (_, number) => {
      return `<citation-number :number="${number}" :citation-block-id="'${citationBlockId}'"></citation-number>`;
    }
  );
}
