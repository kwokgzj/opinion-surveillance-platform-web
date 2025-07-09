import {
  post,
  get,
  del,
} from '@/utils/request';

import type {
  InformationFilt,
  Information
} from './information.type';

/**
 * 获取信息列表
 * @param filter 过滤条件
 * @returns 信息列表
 */
export const getInformationList = async (filter: InformationFilt): Promise<Information[]> => {
  try {
    const response = await post<Information[]>('/informations', filter);
    return response;
  } catch (error) {
    console.error('获取信息列表失败:', error);
    throw error;
  }
};

/**
 * 获取筛选选项
 * @param projectId 项目ID
 * @returns 筛选选项
 */
export const getFilterOptions = async (projectId: string) => {
  try {
    console.log('=== 获取筛选选项 ===');
    console.log('项目ID:', projectId);
    console.log('请求路径:', `/informations/filts?projectId=${projectId}`);

    // 尝试不同的API路径
    let response;
    try {
      response = await get(`/informations/filts?projectId=${projectId}`);
    } catch {
      console.log('第一个路径失败，尝试第二个路径');
      try {
        response = await get(`/information/filts?projectId=${projectId}`);
      } catch {
        console.log('第二个路径也失败，尝试第三个路径');
        response = await get(`/filts?projectId=${projectId}`);
      }
    }
    console.log('筛选选项API响应:', response);

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
    console.error('获取筛选选项失败:', error);
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
