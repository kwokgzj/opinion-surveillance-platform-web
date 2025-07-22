import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/information',
      children: [
        {
          path: 'newProject',
          name: 'newProject',
          component: () => import('@/views/project/NewProjectView.vue')
        },
        {
          path: 'keywordProjectSetting',
          name: 'keywordProjectSetting',
          component: () => import('@/views/project/KeywordProjectSettingView.vue')
        },
        {
          path: 'videoListSettingView',
          name: 'videoListSettingView',
          component: () => import('@/views/project/VideoListSettingView.vue')
        },
        {
          path: 'googleNewsSettingView',
          name: 'googleNewsSettingView',
          component: () => import('@/views/project/GoogleNewsSettingView.vue')
        },
        // // 添加侧边栏缺失的路由
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
        {
          path: 'settings',
          name: 'settings',
          redirect: (to) => {
            // 根据当前选中的项目类型重定向到对应的设置页面
            const projectType = to.query.projectType || 'SocialMediaKeywords';
            const projectId = to.query.projectId;
            const projectName = to.query.projectName;
            const refresh = to.query.refresh;
            const isCreate = to.query.isCreate;
            const page = "settings"

            let targetRoute = '';
            switch (projectType) {
              case 'GoogleNews':
                targetRoute = 'googleNewsSettingView';
                break;
              case 'VideoList':
                targetRoute = 'videoListSettingView';
                break;
              default:
                targetRoute = 'keywordProjectSetting';
            }

            return {
              name: targetRoute,
              query: {
                projectId,
                projectName,
                isEdit: to.query.newlyCreated !== 'true' ? 'true' : 'false',
                refresh,
                isCreate,
                page,
                newlyCreated: to.query.newlyCreated
              }
            };
          }
        },
        {
          path: 'information',
          name: 'information',
          component: () => import('@/views/information/InformationView.vue')
        },
        {
          path: 'sentimentTrend',
          name: 'sentimentTrend',
          component: () => import('@/views/SentimentTrendView.vue')
        },
        {
          path: 'trendAnalysis',
          name: 'trendAnalysis',
          component: () => import('@/views/TrendAnalysisView.vue')
        },
        {
          path: 'comparison',
          name: 'comparison',
          component: () => import('@/views/ComparisonView.vue')
        },
        // {
        //   path: 'compare',
        //   name: 'compare',
        //   component: () => import('@/views/CompareView.vue')
        // },
        {
          path: 'ai-analysis',
          name: 'ai-analysis',
          component: () => import('@/views/AIAnalysisView.vue')
        }
      ]
    }
  ]
})

export default router
