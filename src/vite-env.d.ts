/// <reference types="vite/client" />

import type KeyvStorage from '@kangfenmao/keyv-storage'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'markdown-it' {
  const markdownIt: any
  export default markdownIt
}

declare module 'lucide-vue-next'
declare module 'pako'
declare module 'rehype-katex'
declare module 'rehype-raw'
declare module 'remark-math'
declare module 'remark-cjk-friendly'
declare module 'remark-gfm'

declare global {
  interface Window {
    root: HTMLElement
    keyv: KeyvStorage
  }
}
