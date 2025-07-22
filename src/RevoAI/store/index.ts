// index.ts
// 移除 createPinia 的导入和创建
// import { createPinia } from "pinia";

// 导入所有 store
import { useSessionsStore } from "./sessions";
import { useLlmStore } from "./llm";
import { useMcpStore } from "./mcp";
import { useMessageBlocksStore } from "./messageBlock";
import { useMessagesStore } from "./newMessage";

// 移除全局类型声明和 pinia 实例创建
// 移除 window.__pinia 的相关代码

// 导出所有 store（保持不变）
export {
  useSessionsStore,
  useLlmStore,
  useMcpStore,
  useMessageBlocksStore,
  useMessagesStore,
};

// 导出类型（保持不变）
export type AppDispatch = any;
export type RootState = any;
