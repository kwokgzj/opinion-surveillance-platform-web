/**
 * API返回的标准响应格式
 */
export interface ApiResponse<T> {
  code: number;   // 响应码, 0-正常
  msg: string;    // 响应信息
  data: T;        // 响应数据
}

/**
 * 监控关键词配置接口
 * 定义了针对特定监控项的关键词筛选规则
 */
export interface MonitorKeyword {
  index: number;      // 关键词索引，用于排序或唯一标识
  keywords: string;   // 主要监控关键词，多个关键词可用逗号分隔
  includeWords: string; // 必须包含的词，用于进一步筛选结果
  excludeWords: string; // 排除词，包含这些词的结果将被过滤
}

/**
 * 被监控的视频链接接口
 * 定义了需要监控的特定视频及其相关信息
 */
export interface MonitoredVideoLink {
  index: number;      // 关键词索引，用于排序或唯一标识
  url: string;     // 视频链接URL
  brand: string;   // 相关品牌信息
  sku: string;     // 产品SKU编码
  platform: string;            // 平台
  platformID: string;           // 平台id
}

/**
 * 排除的视频链接接口
 * 定义了需要排除监控的视频链接及其平台信息
 */
export interface ExcludedVideoLink {
  url: string;        // 视频链接
  platform: string;  // 平台名称
  platformID: string; // 平台ID
}

/**
 * 项目简要信息类型
 */
export interface ProjectSummary {
  projectId: string;
  projectName: string;
  projectType: string;
}

/**
 * 项目配置主接口
 * 定义了舆情监控项目的所有配置参数
 */
export interface Project {
  projectId: string;  // 项目ID
  name: string;    // 项目名称
  type: string;    // 项目类型，如"品牌监控"、"产品监控"等
  monitorKeywords: MonitorKeyword[];  // 监控关键词列表，定义了项目要监控的关键词规则
  excludedVideoLinks: ExcludedVideoLink[];  // 排除的视频链接列表，这些链接不会被监控
  fetchTime: number;                  // 数据获取时间，可表示为时间戳或特定时间格式
  crawlFrequency: number;             // 爬取频率，单位可能是小时或分钟
  monitoredVideoLinks: MonitoredVideoLink[]; // 被监控的视频链接列表
  postSearchCount: number;            // 社交媒体帖子搜索数量限制
  videoSearchCount: number;           // 视频搜索数量限制
  newsSearchCount: number;            // 新闻搜索数量限制
  searchPlatforms: string[];           // 搜索平台设置
  searchLanguages: string[];           // 搜索语言设置，如["zh-CN", "en-US"]
  searchRegions: string[];             // 搜索地区设置，如["CN", "US"]
}

/**
 * 数据抓取进度接口
 */
export interface CrawlProgress {
  currentStage: string;               // 当前阶段，如"平台链接搜索"
  currentStageProgress: number;       // 当前阶段进度百分比 (0-100)
  totalProgress: number;              // 总体进度百分比 (0-100)
  estimatedTimeRemaining: number;     // 预计剩余时间（秒）
  startTime: string;                  // 开始时间
  estimatedEndTime: string | null;    // 预计结束时间
}