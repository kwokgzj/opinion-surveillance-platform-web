import {
  get,
  post,
} from '@/utils/request';
import type {
  Project,
  ProjectSummary,
  ApiResponse,
} from './project.type';

/**
 * 获取项目列表
 * @returns {Promise<ProjectSummary[]>} 项目列表
 */
export async function getProjectList() {
  try {
    const response = await get<ApiResponse<ProjectSummary[]>>('/project/list');
    return response.data;
  } catch (error) {
    console.error('获取项目列表出错:', error);
    throw error;
  }
}

/**
 * 创建新项目
 * @param {Project} project 项目配置信息
 * @returns {Promise<Project>} 创建成功的项目信息
 */
export async function createProject(project: Project) {
  try {
    const response = await post<ApiResponse<Project>>('/project/add', project);
    return response;
  } catch (error) {
    console.error('创建项目出错:', error);
    throw error;
  }
}