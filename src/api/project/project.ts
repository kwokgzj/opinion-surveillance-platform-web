import {
  get,
  post,
  del,
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
 * @returns 创建结果
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

/**
 * 通过项目ID获取项目详细信息
 * @param {string | number} projectId 项目ID
 * @returns {Promise<Project>} 项目详细信息
 */
export async function getProjectById(projectId: string | number) {
  try {
    const response = await get<ApiResponse<Project>>(`/project?projectId=${projectId}`);
    return response;
  } catch (error) {
    console.error('获取项目详情出错:', error);
    throw error;
  }
}

/**
 * 修改项目信息
 * @param {Project} project 项目配置信息
 * @returns {Promise<ApiResponse<string>>} API响应
 */
export async function updateProject(project: Project) {
  try {
    const response = await post<ApiResponse<string>>('/project/update', project);
    return response;
  } catch (error) {
    console.error('修改项目出错:', error);
    throw error;
  }
}

/**
 * 删除项目
 * @param {string} projectId 项目ID
 * @returns {Promise<ApiResponse<string>>} API响应
 */
export async function deleteProject(projectId: string) {
  try {
    const response = await del<ApiResponse<string>>(`/project?projectId=${projectId}`);
    return response;
  } catch (error) {
    console.error('删除项目出错:', error);
    throw error;
  }
}

/**
 * 执行数据抓取任务
 * @param {string} projectId 项目ID
 * @returns {Promise<ApiResponse<null>>} API响应
 */
export async function executeDataCrawlTask(projectId: string) {
  try {
    const response = await post<ApiResponse<null>>('/dataCrawl/executeTask', {}, {
      params: { projectId }
    });
    return response;
  } catch (error) {
    console.error('执行数据抓取任务出错:', error);
    throw error;
  }
}