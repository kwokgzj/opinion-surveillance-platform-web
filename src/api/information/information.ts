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
 * 更新链接抓取状态
 * @param projectId 项目ID
 * @param linkId 链接ID
 * @param isActived 是否激活
 * @returns 更新结果
 */
export const updateLinkActiveStatus = async (projectId: string, linkId: string, isActived: boolean) => {
  try {
    const response = await post(`/informations/active?projectId=${projectId}&linkId=${linkId}&isActived=${isActived}`, {});
    return response;
  } catch (error) {
    console.error('更新链接抓取状态失败:', error);
    throw error;
  }
};

/**
 * 删除链接
 * @param projectId 项目ID
 * @param linkId 链接ID
 * @returns 删除结果
 */
export const deleteProjectLink = async (projectId: string, linkId: string) => {
  try {
    const response = await del(`/informations?projectId=${projectId}&linkId=${linkId}`, {});
    return response;
  } catch (error) {
    console.error('删除链接失败:', error);
    throw error;
  }
};
