// 数据对比筛选条件
export interface ComparisonFilter {
  projectIds: string[];  // 项目ID数组，支持多个项目对比
  platforms?: string[];  // 平台筛选
  publishedAtStart?: string;  // 开始时间
  publishedAtEnd?: string;    // 结束时间
  page?: number;
  size?: number;
}

// 后端返回的数据项格式
export interface ComparisonDataItem {
  projectId: string;
  label: string;
  stage: string;
  value: number;
}

// 分组数据格式（用于饼图等）
export interface ComparisonGroupData {
  [projectId: string]: ComparisonDataItem[];
}

// 完整的对比数据响应
export interface ComparisonData {
  videoViewTrendAnalysis: ComparisonDataItem[];           // 视频播放量对比折线图
  videoCommentTrendAnalysis: ComparisonDataItem[];        // 视频评论数对比折线图
  videoLikeTrendAnalysis: ComparisonDataItem[];           // 视频点赞数对比折线图
  videoViewIncrementTrendAnalysis: ComparisonDataItem[];  // 视频播放量增量对比折线图
  videoCommentIncrementTrendAnalysis: ComparisonDataItem[]; // 视频评论数增量对比折线图
  videoLikeIncrementTrendAnalysis: ComparisonDataItem[];  // 视频点赞数增量对比折线图
  postViewTrendAnalysis: ComparisonDataItem[];            // 帖子浏览量对比折线图
  postCommentTrendAnalysis: ComparisonDataItem[];         // 帖子评论数对比折线图
  postLikeTrendAnalysis: ComparisonDataItem[];            // 帖子点赞数对比折线图
  postViewIncrementTrendAnalysis: ComparisonDataItem[];   // 帖子浏览量增量对比折线图
  postCommentIncrementTrendAnalysis: ComparisonDataItem[]; // 帖子评论数增量对比折线图
  postLikeIncrementTrendAnalysis: ComparisonDataItem[];   // 帖子点赞数增量对比折线图
  mentimentTrendAnalysis: ComparisonGroupData;            // 提及内容数量对比折线图
  mentionByMediaType: ComparisonGroupData;                // 媒体提及数量对比（两个饼图）
  mentionByLanguage: ComparisonGroupData;                 // 语言提及数量对比（两个饼图）
  mentionByRegion: ComparisonGroupData;                   // 地区提及数量对比（两个饼图）
  positiveOverTime: ComparisonDataItem[];                 // 正面情感对比折线图
  neutralOverTime: ComparisonDataItem[];                  // 中立情感对比折线图
  negativeOverTime: ComparisonDataItem[];                 // 负面情感对比折线图
  sentimentByType: ComparisonGroupData;                   // 情感分布对比（两个饼图）
  sentimentByMediaType: ComparisonGroupData;              // 社媒情感分布对比（两个堆叠柱状图）
  sentimentByLanguage: ComparisonGroupData;               // 语言情感分布对比（两个堆叠柱状图）
  sentimentByRegion: ComparisonGroupData;                 // 地区情感分布对比（两个堆叠柱状图）
}

// API响应格式
export interface ComparisonResponse {
  code: string | number;
  msg: string;
  data: ComparisonData;
}
