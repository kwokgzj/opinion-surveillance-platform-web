// 情感趋势筛选条件 - 根据后端接口SentimentTrendFilt调整
export interface SentimentTrendFilter {
  projectId: string;
  brands?: string[];
  skus?: string[];
  dateRange?: string[]; // 前端日期范围选择
  publishedAtStart?: string;
  publishedAtEnd?: string;
  page?: number;
  size?: number;
}

// 后端返回的情感数据项
export interface SentimentDataItem {
  projectId: string | null;
  label: string;
  stage: string | null;
  value: number;
}

// 后端返回的情感趋势数据结构
export interface SentimentTrend {
  sentimentOverTime: SentimentDataItem[];
  sentimentByType: SentimentDataItem[];
  sentimentByMediaType: SentimentDataItem[];
  sentimentByLanguage: SentimentDataItem[];
  sentimentByRegion: SentimentDataItem[];
}

// API响应结构 - 匹配后端ApiResponse格式
export interface SentimentTrendResponse {
  code: string | number;
  msg: string;
  data: SentimentTrend;
}

// 前端使用的情感趋势数据点（兼容现有代码）
export interface SentimentTrendDataPoint {
  date: string;
  brand?: string;
  sku?: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  averageSentiment: number;
}

// 前端使用的情感统计数据（兼容现有代码）
export interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

// 前端使用的情感趋势图表数据（兼容现有代码）
export interface SentimentTrendChartData {
  dates: string[];
  positiveData: number[];
  neutralData: number[];
  negativeData: number[];
}

// 前端处理后的情感趋势数据（兼容现有代码）
export interface SentimentTrendData {
  stats: SentimentStats;
  chartData: SentimentTrendChartData;
  tableData: SentimentTrendDataPoint[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
