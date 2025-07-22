import axios from "axios";

const DEFAULT_BASE_URL = "http://192.168.10.153:10021/ai-agent-bmsys-api";
export const CLIENT_ID = "e5cd7e4891bf95d1d19206ce24a7b32e";

// 用于跟踪是否已经显示了401错误提示
let hasShown401Error = false;

// 重置401错误提示状态
export const reset401ErrorFlag = () => {
  hasShown401Error = false;
};

export function createHttpInstance(baseUrl?: string) {
  const instance = axios.create({
    baseURL: baseUrl || DEFAULT_BASE_URL,
    timeout: 10000,
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("revoai_web_token");
      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }
      config.headers["Clientid"] = CLIENT_ID;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      if (response.data.code !== 200) {
        return Promise.reject(response.data.msg || "请求失败");
      }

      return response.data;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}

// 默认导出一个默认 baseUrl 的实例
const defaultHttp = createHttpInstance();
export default defaultHttp;

/**
 * 格式化 API 主机地址。
 *
 * 根据传入的 host 判断是否需要在其末尾加 `/v1/`。
 * - 不加：host 以 `/` 结尾，或以 `volces.com/api/v3` 结尾。
 * - 要加：其余情况。
 *
 * @param {string} host - 需要格式化的 API 主机地址。
 * @returns {string} 格式化后的 API 主机地址。
 */
export function formatApiHost(host: string): string {
  const forceUseOriginalHost = () => {
    if (host.endsWith("/")) {
      return true;
    }

    return host.endsWith("volces.com/api/v3");
  };

  return forceUseOriginalHost() ? host : `${host}/v1/`;
}

/**
 * API key 脱敏函数。仅保留部分前后字符，中间用星号代替。
 *
 * - 长度大于 24，保留前、后 8 位。
 * - 长度大于 16，保留前、后 4 位。
 * - 长度大于 8，保留前、后 2 位。
 * - 其余情况，返回原始密钥。
 *
 * @param {string} key - 需要脱敏的 API 密钥。
 * @returns {string} 脱敏后的密钥字符串。
 */
export function maskApiKey(key: string): string {
  if (!key) return "";

  if (key.length > 24) {
    return `${key.slice(0, 8)}****${key.slice(-8)}`;
  } else if (key.length > 16) {
    return `${key.slice(0, 4)}****${key.slice(-4)}`;
  } else if (key.length > 8) {
    return `${key.slice(0, 2)}****${key.slice(-2)}`;
  } else {
    return key;
  }
}

/**
 * 将 API key 字符串转换为 key 数组。
 *
 * @param {string} keyStr - 包含 API key 的逗号分隔字符串。
 * @returns {string[]} 转换后的数组，每个元素为 API key。
 */
export function splitApiKeyString(keyStr: string): string[] {
  return keyStr
    .split(/(?<!\\),/)
    .map((k) => k.trim())
    .map((k) => k.replace(/\\,/g, ","))
    .filter((k) => k);
}
