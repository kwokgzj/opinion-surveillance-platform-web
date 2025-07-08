/**
 * API返回的标准响应格式
 */
export interface ApiResponse<T> {
  code: number;   // 响应码, 0-正常
  msg: string;    // 响应信息
  data: T;        // 响应数据
}

/**
 * 筛选选项项
 */
export interface FilterOption {
  label: string;
  value: string;
}

/**
 * 筛选选项数据
 */
export interface FilterOptions {
  brands: FilterOption[];
  skus: FilterOption[];
  sentiments: FilterOption[];
  platforms: FilterOption[];
  languages: FilterOption[];
  regions: FilterOption[];
  sortBy: FilterOption[];
  channels: FilterOption[];
  durations: FilterOption[];
  labels: FilterOption[];
}

/**
 * 内容中提到的品牌信息
 */
export interface ContentMentionedBrand {
  brand: string;      // 品牌名称
  sentiment: number;  // 情感倾向
  evidence: string;   // 证据文本
}

/**
 * 内容中提到的SKU信息
 */
export interface ContentMentionedSku {
  sku: string;        // SKU名称
  sentiment: number;  // 情感倾向
  evidence: string;   // 证据文本
}

/**
 * 信息过滤条件
 */
export interface InformationFilt {
  projectId: string;           // 项目ID
  brands: string[];            // 品牌列表
  skus: string[];              // SKU列表
  platforms: string[];         // 平台列表
  sentiments: string[];        // 情感过滤
  languages: string[];         // 语言列表
  regions: string[];           // 地区列表
  sortBy: string;              // 排序方式，默认 "publishedAt:desc"
  minDuration: number;         // 视频时长范围-最小值（秒）
  maxDuration: number;         // 视频时长范围-最大值（秒）
  channels: string[];          // 发布频道过滤
  publishedAtStart: string;    // 发布时间范围-开始时间
  publishedAtEnd: string;      // 发布时间范围-结束时间
  labels: string[];            // 标签过滤
  page: number;                // 分页参数，默认 1
  size: number;                // 分页大小，默认 20
}

/**
 * 信息数据
 */
export interface Information {
  id: string;                              // 信息ID
  type: string;                            // 链接的类型，post、video、new
  title: string;                           // 标题
  platform: string;                        // 平台
  url: string;                             // url
  description: string;                     // 描述
  thumbnailUrl: string;                    // 缩略图URL
  publishedAt: string;                     // 发布时间
  channelName: string;                     // 频道名称
  channelThumbnailUrl: string;             // 频道缩略图URL
  subscriberCount: string;                 // 订阅者数量
  viewCount: number;                       // 观看次数
  commentCount: number;                    // 评论次数
  likeCount: number;                       // 点赞次数
  shareCount: number;                      // 分享次数
  engagementRate: number;                  // 参与率
  language: string;                        // 语言
  region: string;                          // 地区
  duration: number;                        // 时长
  SU: number;                              // SU值
  newsPlatform: string;                    // 新闻平台
  newsPlatformRegion: string[];            // 新闻平台地区
  monthlyActiveUsers: string;              // 月活跃用户数
  keyInformation: string;                  // 新闻关键信息
  titleCN: string;                         // 新闻标题的中文翻译
  contentMentionedBrands: ContentMentionedBrand[];  // 内容中提到的品牌
  contentMentionedSkus: ContentMentionedSku[];      // 内容中提到的SKU
  captureAt: string;                       // 抓取日期
  isActive: boolean;                       // 是否活跃
  isCollected: boolean;                    // 是否已收集
  labels: string[];                         // 标签列表
}
