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
  url: string;     // 视频链接URL
  brand: string;   // 相关品牌信息
  sku: string;     // 产品SKU编码
}

/**
 * 项目简要信息类型
 */
export interface ProjectSummary {
  projectId: string;
  projectName: string;
}

/**
 * 项目配置主接口
 * 定义了舆情监控项目的所有配置参数
 */
export interface Project {
  name: string;    // 项目名称
  type: string;    // 项目类型，如"品牌监控"、"产品监控"等
  monitorKeywords: MonitorKeyword[];  // 监控关键词列表，定义了项目要监控的关键词规则
  excludedVideoLinks: string[];       // 排除的视频链接列表，这些链接不会被监控
  fetchTime: number;                  // 数据获取时间，可表示为时间戳或特定时间格式
  crawlFrequency: number;             // 爬取频率，单位可能是小时或分钟
  monitoredVideoLinks: MonitoredVideoLink[]; // 被监控的视频链接列表
  postSearchCount: number;            // 社交媒体帖子搜索数量限制
  videoSearchCount: number;           // 视频搜索数量限制
  newsSearchCount: number;            // 新闻搜索数量限制
  searchLanguage: string[];           // 搜索语言设置，如["zh-CN", "en-US"]
  searchRegion: string[];             // 搜索地区设置，如["CN", "US"]
}