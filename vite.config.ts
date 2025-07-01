import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 配置开发服务器和代理
  server: {
    port: 5173, // 可以根据需要修改端口
    open: true, // 自动打开浏览器
    proxy: {
      // 配置代理，将请求转发到目标服务器
      '/opinion-surveillance-platform-api': {
        target: 'http://localhost:31002',
        changeOrigin: true, // 改变请求源，避免跨域问题
        // 不需要重写路径，因为我们的目标路径也是 /track-api
        // rewrite: (path) => path.replace(/^\/track-api/, '')
      }
    }
  }
})
