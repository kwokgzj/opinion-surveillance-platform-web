import type OpenAI from "openai";
import type { Message } from "./newMessage";

export type Session = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  prompt: string;
  pinned?: boolean;
  model: Model;
  settings: Partial<AssistantSettings>;
  messages: Message[];
  enableWebSearch?: boolean;
  mcpServers?: MCPServer[];
  isNameManuallyEdited?: boolean;
};

export type AssistantSettings = {
  contextCount: number;
  temperature: number;
  topP: number;
  maxTokens: number | undefined;
  enableMaxTokens: boolean;
  streamOutput: boolean;
  toolUseMode?: "function" | "prompt";
  stopSequences?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
};

export type Usage = OpenAI.Completions.CompletionUsage & {
  thoughts_tokens?: number;
};

export type Metrics = {
  completion_tokens: number;
  time_completion_millsec: number;
  time_first_token_millsec?: number;
  time_thinking_millsec?: number;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export type Provider = {
  id: string;
  name: string;
  apiKey: string;
  apiHost: string;
};

export type ModelType = "chat" | "embedding" | "speech" | "reranker";

export type Model = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type?: ModelType;
  icon?: string;
  abilityList?: ModelAbilities[];
};

export type ModelAbilities = "vision" | "reasoning" | "functionCall";

export interface FileType {
  uid: string;
  id: string;
  name: string;
  size: number;
  type: FileTypes;
  created_at: string;
  internalFileUrl?: string;
  externalFileUrl?: string;
  status?: "uploading" | "done" | "error";
  content?: string;
  url?: string;
}

export enum FileTypes {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  TEXT = "text",
  DOCUMENT = "document",
  OTHER = "other",
}

export enum ThemeMode {
  light = "light",
  dark = "dark",
  auto = "auto",
}

export type LanguageVarious = "zh-CN" | "en-US";

export type CodeStyleVarious = "auto" | string;

export type AppInfo = {
  version: string;
  isPackaged: boolean;
  appPath: string;
  configPath: string;
  appDataPath: string;
  resourcesPath: string;
  filesPath: string;
  logsPath: string;
  arch: string;
  isPortable: boolean;
};

export interface Shortcut {
  key: string;
  shortcut: string[];
  editable: boolean;
  enabled: boolean;
  system: boolean;
}

export type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type SidebarIcon =
  | "assistants"
  | "agents"
  | "paintings"
  | "translate"
  | "minapp"
  | "knowledge"
  | "files";

export type ExternalToolResult = {
  mcpTools?: MCPTool[];
  toolUse?: MCPToolResponse[];
  webSearch?: WebSearchResponse;
};

export type WebSearchProviderResult = {
  number: number;
  title: string;
  content: string;
  url: string;
  sourceIcon: string;
};

export type WebSearchProviderResponse = {
  query?: string;
  results: WebSearchProviderResult[];
};

export type WebSearchResponse = {
  results: WebSearchProviderResponse;
};

export type MCPArgType = "string" | "list" | "number";
export type MCPEnvType = "string" | "number";
export type MCPArgParameter = { [key: string]: MCPArgType };
export type MCPEnvParameter = { [key: string]: MCPEnvType };

export interface MCPServerParameter {
  name: string;
  type: MCPArgType | MCPEnvType;
  description: string;
}

export interface MCPServer {
  id: string;
  name: string;
  displayName?: string;
  packageName?: string;
  type?: "stdio" | "sse" | "streamableHttp" | "dxt";
  description?: string;
  longDescription?: string;
  baseUrl?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  packageUrl?: string; // 包下载连接
  dxtPath?: string;
  headers?: Record<string, string>; // Custom headers to be sent with requests to this server
  icon?: string; // URL of the MCP server's logo
  timeout?: number; // Timeout in seconds for requests to this server, default is 60 seconds
  version?: string; // 服务器版本
  userConfigSchema?: UserConfigField[]; // 用户配置字段定义
  error?: string;
}

export interface MCPToolInputSchema {
  type: string;
  title: string;
  description?: string;
  required?: string[];
  properties: Record<string, object>;
}

export interface MCPTool {
  id: string;
  serverId: string;
  serverName: string;
  name: string;
  description?: string;
  inputSchema: MCPToolInputSchema;
}

export interface MCPPromptArguments {
  name: string;
  description?: string;
  required?: boolean;
}

export interface MCPPrompt {
  id: string;
  name: string;
  description?: string;
  arguments?: MCPPromptArguments[];
  serverId: string;
  serverName: string;
}

export interface GetMCPPromptResponse {
  description?: string;
  messages: {
    role: string;
    content: {
      type: "text" | "image" | "audio" | "resource";
      text?: string;
      data?: string;
      mimeType?: string;
    };
  }[];
}

// 扩展的MCP服务器状态接口
export interface MCPServerState extends Omit<MCPServer, "userConfig"> {
  // 全局安装状态
  installed: boolean;
  installedVersion?: string;

  // 运行状态
  running: boolean;
  error?: string;

  // 用户配置字段定义
  userConfigSchema?: UserConfigField[];

  // 用户配置值
  userConfig?: Record<string, any>;

  // 安装时间
  installedAt?: string;

  // 最后更新时间
  lastUpdated?: string;
}

// 用户配置字段定义
export interface UserConfigField {
  key: string;
  type: "string" | "number" | "boolean" | "directory" | "file";
  title: string;
  description?: string;
  required?: boolean;
  default?: any;
  multiple?: boolean;
  sensitive?: boolean;
  min?: number;
  max?: number;
}

export interface MCPConfig {
  servers: MCPServerState[];
  installed: string[];

  // 服务器列表版本，用于同步
  serverListVersion?: string;

  // 全局用户配置
  userConfigs: Record<string, Record<string, any>>;

  // 服务器运行状态
  runningServers: Record<string, boolean>;
}

interface BaseToolResponse {
  id: string; // unique id
  tool: MCPTool;
  arguments: Record<string, unknown> | undefined;
  status: string; // 'invoking' | 'done'
  response?: any;
}

export interface ToolUseResponse extends BaseToolResponse {
  toolUseId: string;
}

export interface ToolCallResponse extends BaseToolResponse {
  // gemini tool call id might be undefined
  toolCallId?: string;
}

export type MCPToolResponse = ToolUseResponse | ToolCallResponse;

export interface MCPToolResultContent {
  type: "text" | "image" | "audio" | "resource";
  text?: string;
  data?: string;
  mimeType?: string;
  resource?: {
    uri?: string;
    text?: string;
    mimeType?: string;
    blob?: string;
  };
}

export interface MCPCallToolResponse {
  content: MCPToolResultContent[];
  isError?: boolean;
}

export interface MCPResource {
  serverId: string;
  serverName: string;
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  size?: number;
  text?: string;
  blob?: string;
}

export interface GetResourceResponse {
  contents: MCPResource[];
}

export interface QuickPhrase {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  order?: number;
}

export interface Citation {
  number: number;
  url: string;
  hostname: string;
  title?: string;
  content?: string;
}

export type MathEngine = "KaTeX" | "MathJax" | "none";

export type OpenAISummaryText = "auto" | "concise" | "detailed" | "off";
export type OpenAIServiceTier = "auto" | "default" | "flex";

export type ReasoningEffortOptions = "low" | "medium" | "high" | "auto";
export type EffortRatio = Record<ReasoningEffortOptions, number>;

export const EFFORT_RATIO: EffortRatio = {
  low: 0.2,
  medium: 0.5,
  high: 0.8,
  auto: 2,
};
