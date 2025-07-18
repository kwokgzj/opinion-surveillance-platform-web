import request from '@/utils/request';
import type { TrendAnalysisFilter, TrendAnalysisData } from './trend.type';

// 获取趋势分析数据
export const getTrendAnalysisData = (params: TrendAnalysisFilter): Promise<TrendAnalysisData> => {
  // 转换前端参数为后端需要的格式
  const requestData = {
    projectId: params.projectId,
    brands: params.brands,
    skus: params.skus,
    sentiments: params.sentiments,
    platforms: params.platforms,
    languages: params.languages,
    regions: params.regions,
    publishedAtStart: params.publishedAtStart,
    publishedAtEnd: params.publishedAtEnd,
    page: params.page,
    size: params.size
  };

  return request({
    url: '/trend-analysis',
    method: 'POST',
    data: requestData
  }).then((response: any) => {
    // 检查响应状态
    if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
      return response.data;
    } else {
      throw new Error(response.msg || '获取趋势分析数据失败');
    }
  });
};
