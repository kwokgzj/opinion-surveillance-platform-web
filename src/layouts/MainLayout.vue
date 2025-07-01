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
      <!-- 移除了标题栏 el-header -->
      <el-main>
        <!-- 路由出口，用于显示当前路由对应的组件 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // 添加 useRouter
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
const activeMenu = computed(() => route.path);

// 项目选择
const selectedProject = ref('');
const projectOptions = ref<{ value: string; label: string }[]>([]);
const isProjectLoading = ref(false);

// 获取项目列表并填充下拉菜单
const fetchProjects = async () => {
  try {
    isProjectLoading.value = true;
    const projectList = await getProjectList();

    if (projectList.length > 0) {
      projectOptions.value = projectList.map((project) => {
        return {
          value: project.projectId,
          label: project.projectName
        };
      });
      // 如果有项目，默认选中第一个
      if (projectOptions.value.length > 0) {
        selectedProject.value = projectOptions.value[0].value;
      }
    } else {
      ElMessage.error('获取项目列表格式不正确');
    }
  } catch (error) {
    ElMessage.error('加载项目列表失败');
    console.error('加载项目列表失败:', error);
  } finally {
    isProjectLoading.value = false;
  }
};

// 处理切换项目的事件
const handleProjectChange = (value: string) => {
  console.log('切换到项目:', value);
  // 这里可以添加切换项目时的其他逻辑，比如更新UI状态、重新获取数据等
};

// 处理添加新项目的点击事件
const handleAddProject = () => {
  router.push({ name: 'newProject' });
};

// 组件挂载时获取项目列表
onMounted(() => {
  fetchProjects();
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