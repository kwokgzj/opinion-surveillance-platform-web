import request from '@/utils/request';
import type { SentimentTrendFilter, SentimentTrendResponse, SentimentTrend } from './sentiment.type';

// 获取情感趋势数据 - 匹配后端POST /sentiment-trend接口
export const getSentimentTrendData = (params: SentimentTrendFilter): Promise<SentimentTrend> => {
  // 转换前端参数为后端需要的格式
  const requestData = {
    projectId: params.projectId,
    brands: params.brands,
    skus: params.skus,
    publishedAtStart: params.publishedAtStart,
    publishedAtEnd: params.publishedAtEnd,
    page: params.page,
    size: params.size
  };

  return request({
    url: '/sentiment-trend',
    method: 'POST',
    data: requestData
  }).then((response: SentimentTrendResponse) => {
    // 检查响应状态
    if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
      return response.data;
    } else {
      throw new Error(response.msg || '获取情感趋势数据失败');
    }
  });
};

// 获取情感统计数据（保留原有接口作为备用）
export const getSentimentStats = (params: SentimentTrendFilter): Promise<any> => {
  return request({
    url: '/api/sentiment/stats',
    method: 'GET',
    params
  });
};

// 导出情感趋势数据
export const exportSentimentTrend = (params: SentimentTrendFilter): Promise<any> => {
  return request({
    url: '/api/sentiment/export',
    method: 'POST',
    data: params,
    responseType: 'blob'
  });
};
