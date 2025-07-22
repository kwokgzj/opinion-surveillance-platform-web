import request from '@/utils/request';
import type { ComparisonFilter, ComparisonData } from './comparison.type';

/**
 * 获取数据对比分析数据
 * @param params 对比筛选条件
 * @returns 对比数据
 */
export const getComparisonData = (params: ComparisonFilter): Promise<ComparisonData> => {
  // 转换前端参数为后端需要的格式
  const requestData = {
    projectIds: params.projectIds,
    platforms: params.platforms,
    publishedAtStart: params.publishedAtStart,
    publishedAtEnd: params.publishedAtEnd,
    page: params.page,
    size: params.size
  };

  return request({
    url: '/comparison',
    method: 'POST',
    data: requestData
  }).then((response: any) => {
    // 检查响应状态
    if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
      return response.data;
    } else {
      throw new Error(response.msg || '获取数据对比分析数据失败');
    }
  });
};
