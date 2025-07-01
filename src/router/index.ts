import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/keywordProject',
      children: [
        // {
        //   path: 'dashboard',
        //   name: 'dashboard',
        //   component: () => import('@/views/DashboardView.vue')
        // },
        // {
        //   path: 'trend',
        //   name: 'trend',
        //   component: () => import('@/views/TrendView.vue')
        // },
        // {
        //   path: 'sentiment',
        //   name: 'sentiment',
        //   component: () => import('@/views/SentimentView.vue')
        // },
        // {
        //   path: 'settings',
        //   name: 'settings',
        //   component: () => import('@/views/SettingsView.vue')
        // },
        // {
        //   path: 'compare',
        //   name: 'compare',
        //   component: () => import('@/views/CompareView.vue')
        // },
        // {
        //   path: 'ai-analysis',
        //   name: 'ai-analysis',
        //   component: () => import('@/views/AIAnalysisView.vue')
        // },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/AboutView.vue')
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/HomeView.vue')
        },
        {
          path: 'newProject',
          name: 'newProject',
          component: () => import('@/views/NewProjectView.vue')
        },
        {
          path: 'keywordProjectSetting',
          name: 'keywordProjectSetting',
          component: () => import('@/views/KeywordProjectSettingView.vue')
        },
        {
          path: 'videoListSettingView',
          name: 'videoListSettingView',
          component: () => import('@/views/VideoListSettingView.vue')
        },
        {
          path: 'googleNewsSettingView',
          name: 'googleNewsSettingView',
          component: () => import('@/views/GoogleNewsSettingView.vue')
        },
        // 其他子路由...
      ]
    }
  ]
})

export default router