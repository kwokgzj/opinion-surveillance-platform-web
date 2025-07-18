// 趋势分析筛选条件
export interface TrendAnalysisFilter {
  projectId: string;
  brands?: string[];
  skus?: string[];
  sentiments?: string[];
  platforms?: string[];
  languages?: string[];
  regions?: string[];
  publishedAtStart?: string;
  publishedAtEnd?: string;
  page?: number;
  size?: number;
}

// 后端返回的趋势数据项
export interface TrendDataItem {
  projectId: string | null;
  label: string;
  stage: string | null;
  value: number;
}

// 后端返回的趋势分析数据结构
export interface TrendAnalysisData {
  // 视频趋势分析
  videoTrendAnalysis: TrendDataItem[];

  // 视频增量趋势分析
  videoIncrementTrendAnalysis: TrendDataItem[];

  // 帖子趋势分析
  postTrendAnalysis: TrendDataItem[];

  // 帖子增量趋势分析
  postIncrementTrendAnalysis: TrendDataItem[];

  // 提及趋势分析
  mentimentTrendAnalysis: TrendDataItem[];

  // 提及数量按媒体类型分布
  mentionByMediaType: TrendDataItem[];

  // 提及数量按语言分布
  mentionByLanguage: TrendDataItem[];

  // 提及数量按地区分布
  mentionByRegion: TrendDataItem[];
}

// API响应结构
export interface TrendAnalysisResponse {
  code: string | number;
  msg: string;
  data: TrendAnalysisData;
}

// 前端使用的统计数据
export interface TrendStats {
  totalVideos: number;
  totalPosts: number;
  totalMentions: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
}
