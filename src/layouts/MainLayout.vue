<template>
  <el-container class="main-layout">
    <el-aside width="220px">
      <!-- 平台标题 -->
      <div class="platform-title">
        <el-icon class="platform-icon"><Monitor /></el-icon>
        <span>舆情监控平台</span>
      </div>

      <!-- 项目选择器 -->
      <div class="project-selector">
        <el-select
          v-model="selectedProject"
          placeholder="选择项目"
          size="small"
          style="width: 160px;"
          :loading="isProjectLoading"
          @change="handleProjectChange">
          <el-option
            v-for="item in projectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button
          type="primary"
          size="small"
          circle
          class="add-project-btn"
          @click="handleAddProject">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        router>
        <el-menu-item index="/dashboard">
          <el-icon><Document/></el-icon>
          <span>信息汇总</span>
        </el-menu-item>
        <el-menu-item index="/trend">
          <el-icon><TrendCharts /></el-icon>
          <span>趋势分析</span>
        </el-menu-item>
        <el-menu-item index="/sentiment">
          <el-icon><ChatLineRound /></el-icon>
          <span>情感分析</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>项目设置</span>
        </el-menu-item>
        <el-divider style="border-color: #909399; margin: 10px 0;" />
        <el-menu-item index="/compare">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据对比</span>
        </el-menu-item>
        <el-menu-item index="/ai-analysis">
          <el-icon><Operation /></el-icon>
          <span>AI分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <!-- 路由出口，用于显示当前路由对应的组件 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Monitor,
  Plus,
  Document,
  TrendCharts,
  ChatLineRound,
  Setting,
  DataAnalysis,
  Operation
} from '@element-plus/icons-vue';
import { getProjectList } from '@/api/project/project';
import type { ProjectSummary } from '@/api/project/project.type';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  // 对于项目设置相关的路由，都应该高亮项目设置菜单
  if (route.path === '/keywordProjectSetting' ||
      route.path === '/videoListSettingView' ||
      route.path === '/googleNewsSettingView' ||
      route.query.isEdit === 'true') {
    return '/settings';
  }
  return route.path;
});

// 项目选择
const selectedProject = ref('');
const projectOptions = ref<{ value: string; label: string; type: string }[]>([]);
const isProjectLoading = ref(false);

// 获取项目列表并填充下拉菜单
const fetchProjects = async () => {
  try {
    isProjectLoading.value = true;
    const projectList = await getProjectList();
    console.log('获取到的项目列表:', projectList);

    if (projectList.length > 0) {
      projectOptions.value = projectList.map((project) => {
        return {
          value: project.projectId,
          label: project.projectName,
          type: project.projectType,
        };
      });
    } else {
      projectOptions.value = [];
    }
  } catch (error) {
    ElMessage.error('加载项目列表失败');
    console.error('加载项目列表失败:', error);
    projectOptions.value = [];
  } finally {
    isProjectLoading.value = false;
  }
};

// 监听路由变化
watch(() => route.query, async (newQuery, oldQuery) => {
  const { refresh, projectId } = newQuery;

  console.log('路由查询参数变化:', newQuery);

  if(route.query.isCreate === 'true'){
    return;
  }

  // 第一步：如果有 refresh 标记，直接调用 API 更新项目列表
  if (refresh === 'true') {
    console.log('检测到 refresh 标记，刷新项目列表');
    await fetchProjects();

    // 清除 refresh 标记，保留其他参数
    const newQueryWithoutRefresh = { ...newQuery };
    delete newQueryWithoutRefresh.refresh;

    router.replace({
      path: route.path,
      query: newQueryWithoutRefresh
    });
    return;
  }

  // 第二步：判断是否有 projectId
  if (projectId) {
    // 有 projectId，查找对应的项目信息
    const targetProject = projectOptions.value.find(p => p.value === projectId);

    if (targetProject) {
      // 找到项目，设置选中状态并跳转到设置页面
      selectedProject.value = targetProject.value as string;

      router.push({
        name: 'settings',
        query: {
          projectId: targetProject.value,
          projectName: targetProject.label,
          projectType: targetProject.type
        }
      });
      return;
    } else{
      // 未找到项目，提示用户
      // ElMessage.error('未找到对应的项目');
    }
  }
  // 没有 projectId，获取项目列表第一个
  if (projectOptions.value.length === 0) {
    // 如果项目列表为空，先获取项目列表
    await fetchProjects();
  }

  if (projectOptions.value.length > 0) {
    // 有项目，选择第一个并跳转到设置页面
    const firstProject = projectOptions.value[0];
    selectedProject.value = firstProject.value;

    router.push({
      name: 'settings',
      query: {
        projectId: firstProject.value,
        projectName: firstProject.label,
        projectType: firstProject.type
      }
    });
  } else {
    // 项目列表为空，跳转到新建项目页面
    ElMessage.error('项目列表为空，跳转到新建项目页面');
    selectedProject.value = '';
    router.push({ name: 'newProject' });
  }
}, { immediate: true, deep: true });

// 处理切换项目的事件
const handleProjectChange = (value: string) => {
  console.log('切换到项目:', value);

  // 获取选中项目的详细信息
  const selectedProjectInfo = projectOptions.value.find(p => p.value === value);
  if (selectedProjectInfo) {
    // 如果当前在设置页面，需要更新URL参数
    if (route.path === '/settings' || route.path.includes('Setting')) {
      router.push({
        name: 'settings',
        query: {
          projectId: value,
          projectName: selectedProjectInfo.label,
          projectType: selectedProjectInfo.type,
        }
      });
    }
  }
};

// 处理添加新项目的点击事件
const handleAddProject = () => {
  router.push({
    name: 'newProject',
    query: {
          isCreate : 'true'
        }
  });
};

// 暴露刷新项目列表的方法，供其他组件调用
const refreshProjects = () => {
  fetchProjects();
};

// 暴露设置当前项目的方法
const setCurrentProject = (projectId: string, projectName?: string) => {
  const existingProject = projectOptions.value.find(p => p.value === projectId);
  if (existingProject) {
    selectedProject.value = projectId;
  } else {
    // 如果项目不存在于列表中，重新获取项目列表
    console.log('项目不在当前列表中，重新获取项目列表');
    fetchProjects().then(() => {
      const updatedProject = projectOptions.value.find(p => p.value === projectId);
      if (updatedProject) {
        selectedProject.value = projectId;
      } else {
        console.warn(`项目 ${projectId} 在数据库中未找到`);
      }
    });
  }
};

// 组件挂载时获取项目列表
onMounted(() => {
  fetchProjects();
});

// 为了让其他组件能够调用这些方法，可以通过provide或者事件总线的方式暴露
defineExpose({
  refreshProjects,
  setCurrentProject
});
</script>

<style lang="less" scoped>
/* 重置浏览器默认边距 */
:global(body), :global(html) {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

:global(#app) {
  height: 100%;
  width: 100%;
}

/* 主布局容器 */
.main-layout {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  display: flex;
  overflow: hidden;
}

/* 侧边栏样式 */
.el-aside {
  color: #fff;
  background-color: #545c64;
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 平台标题样式 */
.platform-title {
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #ffd04b;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .platform-icon {
    margin-right: 8px;
    font-size: 20px;
  }
}

/* 项目选择器样式 */
.project-selector {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .add-project-btn {
    margin-left: 8px;
  }
}

/* 垂直菜单样式 */
.el-menu-vertical {
  border-right: none;
  width: 100%;
  flex: 1;
}

/* 主内容区域样式 */
.el-main {
  background-color: #ffffff;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* Element Plus 组件样式重置 */
:deep(.el-container) {
  margin: 0;
  padding: 0;
  height: 100%;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 5px;
  width: 24px;
  text-align: center;
}

:deep(.el-divider--horizontal) {
  margin: 12px 0;
}
</style>