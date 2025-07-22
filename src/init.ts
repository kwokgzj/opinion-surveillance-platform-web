import KeyvStorage from '@kangfenmao/keyv-storage'
// 初始化 Keyv
function initKeyv() {
  window.keyv = new KeyvStorage()
  window.keyv.init()
}

// 初始化所有必要的服务
export function initServices() {
  initKeyv()
}

// 默认初始化
initServices()
