/**
 * 代理工具类
 * 用于处理动态代理URL的创建和解析
 */

/**
 * 安全的Base64编码函数
 * 兼容浏览器和Node环境
 */
export function safeBase64Encode(str: string): string {
  try {
    // 浏览器环境
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (e) {
    // Node环境或btoa不可用
    try {
      return Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    } catch (e2) {
      console.error("Base64编码失败:", e2);
      return str;
    }
  }
}

/**
 * 安全的Base64解码函数
 * 兼容浏览器和Node环境
 */
export function safeBase64Decode(str: string): string {
  // 还原URL安全的Base64字符
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");

  try {
    // 浏览器环境
    return atob(base64);
  } catch (e) {
    // Node环境或atob不可用
    try {
      return Buffer.from(base64, "base64").toString();
    } catch (e2) {
      console.error("Base64解码失败:", e2);
      return str;
    }
  }
}

/**
 * 创建代理URL
 * @param originalUrl 原始URL
 * @returns 代理后的URL
 */
export function createProxyUrl(originalUrl: string): URL {
  try {
    // 创建一个基于原始URL的新URL对象
    const url = new URL(originalUrl);

    // 编码目标URL的域名和协议部分
    const targetOrigin = `${url.protocol}//${url.host}`;
    const encodedTarget = safeBase64Encode(targetOrigin);

    // 构建代理URL
    // 格式：/mcp-proxy/[base64编码的目标域名]/[原始路径]
    const proxyPath = `/mcp-proxy/${encodedTarget}${url.pathname}${url.search}`;

    // 创建最终的代理URL
    return new URL(proxyPath, window.location.origin);
  } catch (error) {
    console.error("创建代理URL失败:", error);
    return new URL(originalUrl);
  }
}

/**
 * 解析代理URL
 * @param proxyUrl 代理URL
 * @returns 原始URL
 */
export function parseProxyUrl(proxyUrl: string): URL {
  try {
    const url = new URL(proxyUrl);
    const parts = url.pathname.split("/");

    if (parts.length >= 3 && parts[1] === "mcp-proxy") {
      // 解码目标URL
      const encodedUrl = parts[2];
      const targetOrigin = safeBase64Decode(encodedUrl);

      // 重建路径
      const pathParts = parts.slice(3);
      const newPath = "/" + pathParts.join("/");

      // 返回完整URL
      return new URL(`${targetOrigin}${newPath}${url.search}`);
    }

    return new URL(proxyUrl);
  } catch (error) {
    console.error("解析代理URL失败:", error);
    return new URL(proxyUrl);
  }
}

/**
 * 检查URL是否是代理URL
 * @param url URL字符串
 * @returns 是否是代理URL
 */
export function isProxyUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.startsWith("/mcp-proxy/");
  } catch (error) {
    return false;
  }
}

/**
 * 添加CORS头部到请求选项
 * @param options 请求选项
 * @returns 添加了CORS头部的请求选项
 */
export function addCorsHeaders(
  options: Record<string, any>
): Record<string, any> {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    mode: "cors" as RequestMode,
    credentials: "include" as RequestCredentials,
  };
}
