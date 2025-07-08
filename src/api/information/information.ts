import {
  post,
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