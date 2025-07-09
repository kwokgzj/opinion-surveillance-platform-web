import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';


// 创建一个自定义的 axios 实例，设置基础 URL
const instance: AxiosInstance = axios.create({
  baseURL: '/opinion-surveillance-platform-api', // 全局 API 前缀，所有请求都会以此为基础路径
  timeout: 60000, // 请求超时时间设置为60秒
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  }
});

// 定义常量配置
const URL_QUERY_PARAM_NAME = 'revopoint-client-token'; // URL查询参数中的字段名
const REQUEST_HEADER_NAME = 'revopoint-client-token'; // 请求头中的字段名
const SESSION_TOKEN_KEY = 'base_agent_revopoint_client_token'; // 保存token的sessionStorage键名

/**
 * 从URL查询参数中获取指定的令牌
 * @returns {string|null} 返回查询参数的值，如果不存在则返回null
 */
const getTokenFromUrlQuery = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(URL_QUERY_PARAM_NAME);
};

// 自定义响应数据的类型
export interface ResponseData<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 自定义配置选项
export interface RequestConfig extends AxiosRequestConfig {
  mock?: any; // mock数据选项
}

// 请求拦截器：自动添加token到请求头
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {  // 修改这里的类型
    // 从URL获取token
    let token = getTokenFromUrlQuery();
    // 如果URL中有token，保存到sessionStorage
    if (token) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    }
    // 如果URL中没有token，尝试从sessionStorage获取
    else {
      token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    }

    // 设置token到请求头
    config.headers.set(REQUEST_HEADER_NAME, token);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理响应数据
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    // 处理错误情况
    if (error.config?.mock && error.response?.status === 404) {
      return error.config.mock;
    } else {
      // 确保即使在错误情况下也能返回合适的数据
      return error.response?.data || error;
    }
  }
);

/**
 * 封装 GET 请求
 * @param {string} url - 请求URL
 * @param {object} params - 请求参数
 * @param {RequestConfig} config - 其他配置
 * @returns {Promise<T>} - 返回Promise
 */
export const get = <T = any>(url: string, params: object = {}, config: RequestConfig = {}): Promise<T> => {
  return instance({
    url,
    method: 'get',
    params,
    ...config
  });
};

/**
 * 封装 POST 请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求体数据
 * @param {RequestConfig} config - 其他配置
 * @returns {Promise<T>} - 返回Promise
 */
export const post = <T = any>(url: string, data: object = {}, config: RequestConfig = {}): Promise<T> => {
  return instance({
    url,
    method: 'post',
    data,
    ...config
  });
};

/**
 * 封装 PUT 请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求体数据
 * @param {RequestConfig} config - 其他配置
 * @returns {Promise<T>} - 返回Promise
 */
export const put = <T = any>(url: string, data: object = {}, config: RequestConfig = {}): Promise<T> => {
  return instance({
    url,
    method: 'put',
    data,
    ...config
  });
};

/**
 * 封装 DELETE 请求
 * @param {string} url - 请求URL
 * @param {object} params - 请求参数或请求体数据
 * @param {RequestConfig} config - 其他配置
 * @returns {Promise<T>} - 返回Promise
 */
export const del = <T = any>(url: string, params: object = {}, config: RequestConfig = {}): Promise<T> => {
  // 检查是否包含数组或复杂对象，如果有则作为请求体发送
  const hasComplexData = Object.values(params).some(value => 
    Array.isArray(value) || (typeof value === 'object' && value !== null)
  );
  
  if (hasComplexData) {
    // 如果有复杂数据，作为请求体发送
    return instance({
      url,
      method: 'delete',
      data: params,
      ...config
    });
  } else {
    // 否则作为查询参数发送
    return instance({
      url,
      method: 'delete',
      params,
      ...config
    });
  }
};

// 导出自定义的axios实例以及封装的方法
export default instance;
