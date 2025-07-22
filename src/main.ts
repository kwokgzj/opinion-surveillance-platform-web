import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

import * as antDesignVue from 'ant-design-vue'
import * as AntdX from 'ant-design-x-vue'
import 'ant-design-vue/dist/reset.css'
import './RevoAI/assets/styles/index.scss'

const app = createApp(App)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)
app.use(antDesignVue)
app.use(AntdX)

app.mount('#app')
