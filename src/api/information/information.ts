import {
  post,
  get,
  del,
} from '@/utils/request';

import type {
  InformationFilt,
  InformationsResult,
  ApiResponseWrapper
} from './information.type';

/**
 * 获取信息列表
 * @param filter 过滤条件
 * @returns 信息列表
 */
export const getInformationList = async (filter: InformationFilt): Promise<ApiResponseWrapper<InformationsResult>> => {
  const startTime = performance.now();
  console.log('测试耗时-📊 [信息API] 开始请求信息列表');

  try {
    const response = await post<ApiResponseWrapper<InformationsResult>>('/informations', filter);

    const endTime = performance.now();
    const recordCount = response?.data?.records?.length || 0;
    console.log(`测试耗时-✅ [信息API] 获取成功，记录数: ${recordCount}, 耗时: ${(endTime - startTime).toFixed(2)}ms`);

    return response;
  } catch (error) {
    const endTime = performance.now();
    console.error(`测试耗时-❌ [信息API] 请求失败 (耗时: ${(endTime - startTime).toFixed(2)}ms):`, error);
    throw error;
  }
};

/**
 * 获取筛选选项
 * @param projectId 项目ID
 * @returns 筛选选项
 */
export const getFilterOptions = async (projectId: string) => {
  const startTime = performance.now();
  console.log('测试耗时-🔍 [筛选API] 开始请求，项目ID:', projectId);

  try {
    // 尝试不同的API路径
    let response;
    let apiPath = '';
    try {
      apiPath = `/informations/filts?projectId=${projectId}`;
      response = await get(apiPath);
    } catch {
      try {
        apiPath = `/information/filts?projectId=${projectId}`;
        response = await get(apiPath);
      } catch {
        apiPath = `/filts?projectId=${projectId}`;
        response = await get(apiPath);
      }
    }

    const endTime = performance.now();
    console.log(`测试耗时-✅ [筛选API] 请求成功 (路径: ${apiPath}, 耗时: ${(endTime - startTime).toFixed(2)}ms)`);

    // 处理不同的响应格式
    if (response && typeof response === 'object') {
      if ('data' in response) {
        return response.data;
      } else if ('code' in response && response.code === 0) {
        return response.data;
      } else {
        return response;
      }
    }

    return response;
  } catch (error) {
    const endTime = performance.now();
    console.error(`测试耗时-❌ [筛选API] 请求失败 (耗时: ${(endTime - startTime).toFixed(2)}ms):`, error);
    throw error;
  }
};

/**
 * 批量改变抓取状态
 * @param projectId 项目ID
 * @param linkIds 链接ID数组
 * @param isActived 是否激活
 * @returns 更新结果
 */
export const updateLinkActiveStatus = async (projectId: string, linkIds: string[], isActived: boolean) => {
  return await post(`/informations/active`, {
    projectId,
    linkIds,
    isActived
  });
};

/**
 * 批量删除链接
 * @param projectId 项目ID
 * @param linkIds 链接ID数组
 * @returns 删除结果
 */
export const deleteProjectLink = async (projectId: string, linkIds: string[]) => {
  return await del(`/informations`, {
    projectId,
    linkIds
  });
};

/**
 * 批量更新链接标签
 * @param projectId 项目ID
 * @param linkIds 链接ID数组
 * @param labelsList 标签列表数组（每个元素对应一个链接的标签数组）
 * @returns 更新结果
 */
export const updateLinksLabelsBatch = async (projectId: string, linkIds: string[], labelsList: string[][]) => {
  return await post(`/informations/labels`, {
    projectId,
    linkIds,
    labelsList
  });
};
