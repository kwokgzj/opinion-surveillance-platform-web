<template>
  <div class="comparison-page">
    <!-- 筛选区域 -->
    <div class="filter-panel">
      <el-row :gutter="24">
        <!-- 第一行：项目选择 -->
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>项目1：</label>
            <el-select
              v-model="filter.project1"
              clearable
              filterable
              placeholder="请选择项目1"
              style="width: 100%"
            >
              <el-option
                v-for="project in projectOptions"
                :key="project.projectId"
                :label="project.projectName"
                :value="project.projectId"
              />
            </el-select>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>项目2：</label>
            <el-select
              v-model="filter.project2"
              clearable
              filterable
              placeholder="请选择项目2"
              style="width: 100%"
            >
              <el-option
                v-for="project in projectOptions"
                :key="project.projectId"
                :label="project.projectName"
                :value="project.projectId"
              />
            </el-select>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>平台：</label>
            <el-select
              v-model="filter.platforms"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择平台"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <el-option
                v-for="platform in platformOptions"
                :key="platform"
                :label="platform"
                :value="platform"
              />
            </el-select>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>时间范围：</label>
            <el-date-picker
              v-model="filter.dateRange"
              type="daterange"
              range-separator="—"
              start-placeholder="起始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
              class="date-picker"
              style="width: 100%"
            />
          </div>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button class="btn-reset" @click="resetFilter">重置</button>
        <button class="btn-search" @click="searchData">对比分析</button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-show="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载对比分析数据...</p>
    </div>

    <div v-show="error && !loading" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="btn-retry" @click="fetchComparisonData">重试</button>
    </div>

    <div v-show="!loading && !error && hasData" class="content-container">
      <!-- 提及内容数量对比折线图 -->
      <div v-show="showMentionChart" class="chart-section">
        <div class="section-header">
          <h3>提及内容数量对比</h3>
          <p class="section-desc">两个项目的提及数量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="mentionChart" class="chart"></div>
        </div>
      </div>

      <!-- 视频播放量对比折线图 -->
      <div v-show="showVideoViewChart" class="chart-section">
        <div class="section-header">
          <h3>视频播放量对比</h3>
          <p class="section-desc">两个项目的视频播放量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="videoViewChart" class="chart"></div>
        </div>
      </div>

      <!-- 视频播放量增量对比折线图 -->
      <div v-show="showVideoViewIncrementChart" class="chart-section">
        <div class="section-header">
          <h3>视频播放量增量对比</h3>
          <p class="section-desc">两个项目的视频播放量增量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="videoViewIncrementChart" class="chart"></div>
        </div>
      </div>

      <!-- 视频评论数对比折线图 -->
      <div v-show="showVideoCommentChart" class="chart-section">
        <div class="section-header">
          <h3>视频评论数对比</h3>
          <p class="section-desc">两个项目的视频评论数变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="videoCommentChart" class="chart"></div>
        </div>
      </div>

      <!-- 视频评论数增量对比折线图 -->
      <div v-show="showVideoCommentIncrementChart" class="chart-section">
        <div class="section-header">
          <h3>视频评论数增量对比</h3>
          <p class="section-desc">两个项目的视频评论数增量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="videoCommentIncrementChart" class="chart"></div>
        </div>
      </div>

      <!-- 视频点赞数对比折线图 -->
      <div v-show="showVideoLikeChart" class="chart-section">
        <div class="section-header">
          <h3>视频点赞数对比</h3>
          <p class="section-desc">两个项目的视频点赞数变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="videoLikeChart" class="chart"></div>
        </div>
      </div>

      <!-- 视频点赞数增量对比折线图 -->
      <div v-show="showVideoLikeIncrementChart" class="chart-section">
        <div class="section-header">
          <h3>视频点赞数增量对比</h3>
          <p class="section-desc">两个项目的视频点赞数增量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="videoLikeIncrementChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子浏览量对比折线图 -->
      <div v-show="showPostViewChart" class="chart-section">
        <div class="section-header">
          <h3>帖子浏览量对比</h3>
          <p class="section-desc">两个项目的帖子浏览量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="postViewChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子浏览量增量对比折线图 -->
      <div v-show="showPostViewIncrementChart" class="chart-section">
        <div class="section-header">
          <h3>帖子浏览量增量对比</h3>
          <p class="section-desc">两个项目的帖子浏览量增量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="postViewIncrementChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子评论数对比折线图 -->
      <div v-show="showPostCommentChart" class="chart-section">
        <div class="section-header">
          <h3>帖子评论数对比</h3>
          <p class="section-desc">两个项目的帖子评论数变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="postCommentChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子评论数增量对比折线图 -->
      <div v-show="showPostCommentIncrementChart" class="chart-section">
        <div class="section-header">
          <h3>帖子评论数增量对比</h3>
          <p class="section-desc">两个项目的帖子评论数增量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="postCommentIncrementChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子点赞数对比折线图 -->
      <div v-show="showPostLikeChart" class="chart-section">
        <div class="section-header">
          <h3>帖子点赞数对比</h3>
          <p class="section-desc">两个项目的帖子点赞数变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="postLikeChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子点赞数增量对比折线图 -->
      <div v-show="showPostLikeIncrementChart" class="chart-section">
        <div class="section-header">
          <h3>帖子点赞数增量对比</h3>
          <p class="section-desc">两个项目的帖子点赞数增量变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="postLikeIncrementChart" class="chart"></div>
        </div>
      </div>

      <!-- 正面情感对比折线图 -->
      <div v-show="showPositiveChart" class="chart-section">
        <div class="section-header">
          <h3>正面情感对比</h3>
          <p class="section-desc">两个项目的正面情感变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="positiveChart" class="chart"></div>
        </div>
      </div>

      <!-- 中立情感对比折线图 -->
      <div v-show="showNeutralChart" class="chart-section">
        <div class="section-header">
          <h3>中立情感对比</h3>
          <p class="section-desc">两个项目的中立情感变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="neutralChart" class="chart"></div>
        </div>
      </div>

      <!-- 负面情感对比折线图 -->
      <div v-show="showNegativeChart" class="chart-section">
        <div class="section-header">
          <h3>负面情感对比</h3>
          <p class="section-desc">两个项目的负面情感变化趋势对比</p>
        </div>
        <div class="chart-container">
          <div id="negativeChart" class="chart"></div>
        </div>
      </div>

      <!-- 媒体提及数量对比（两个饼图） -->
      <div v-show="showMentionMediaChart" class="chart-section">
        <div class="section-header">
          <h3>媒体提及数量对比</h3>
          <p class="section-desc">两个项目在不同媒体平台的提及数量分布对比</p>
        </div>
        <div class="dual-pie-chart-container">
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project1) || '项目1' }}</h4>
            <div id="mentionMediaChart1" class="pie-chart"></div>
          </div>
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project2) || '项目2' }}</h4>
            <div id="mentionMediaChart2" class="pie-chart"></div>
          </div>
        </div>
      </div>

      <!-- 语言提及数量对比（两个饼图） -->
      <div v-show="showMentionLanguageChart" class="chart-section">
        <div class="section-header">
          <h3>语言提及数量对比</h3>
          <p class="section-desc">两个项目在不同语言的提及数量分布对比</p>
        </div>
        <div class="dual-pie-chart-container">
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project1) || '项目1' }}</h4>
            <div id="mentionLanguageChart1" class="pie-chart"></div>
          </div>
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project2) || '项目2' }}</h4>
            <div id="mentionLanguageChart2" class="pie-chart"></div>
          </div>
        </div>
      </div>

      <!-- 地区提及数量对比（两个饼图） -->
      <div v-show="showMentionRegionChart" class="chart-section">
        <div class="section-header">
          <h3>地区提及数量对比</h3>
          <p class="section-desc">两个项目在不同地区的提及数量分布对比</p>
        </div>
        <div class="dual-pie-chart-container">
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project1) || '项目1' }}</h4>
            <div id="mentionRegionChart1" class="pie-chart"></div>
          </div>
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project2) || '项目2' }}</h4>
            <div id="mentionRegionChart2" class="pie-chart"></div>
          </div>
        </div>
      </div>

      <!-- 情感分布对比（两个饼图） -->
      <div v-show="showSentimentTypeChart" class="chart-section">
        <div class="section-header">
          <h3>情感分布对比</h3>
          <p class="section-desc">两个项目的情感分布对比</p>
        </div>
        <div class="dual-pie-chart-container">
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project1) || '项目1' }}</h4>
            <div id="sentimentTypeChart1" class="pie-chart"></div>
          </div>
          <div class="pie-chart-wrapper">
            <h4>{{ getProjectName(filter.project2) || '项目2' }}</h4>
            <div id="sentimentTypeChart2" class="pie-chart"></div>
          </div>
        </div>
      </div>

      <!-- 社媒情感分布对比（两个堆叠柱状图） -->
      <div v-show="showSentimentMediaChart" class="chart-section">
        <div class="section-header">
          <h3>社媒情感分布对比</h3>
          <p class="section-desc">两个项目在不同社交媒体平台的情感分布对比</p>
        </div>
        <div class="dual-bar-chart-container">
          <div class="bar-chart-wrapper">
            <h4>{{ getProjectName(filter.project1) || '项目1' }}</h4>
            <div id="sentimentMediaChart1" class="bar-chart"></div>
          </div>
          <div class="bar-chart-wrapper">
            <h4>{{ getProjectName(filter.project2) || '项目2' }}</h4>
            <div id="sentimentMediaChart2" class="bar-chart"></div>
          </div>
        </div>
      </div>

      <!-- 语言情感分布对比（两个堆叠柱状图） -->
      <div v-show="showSentimentLanguageChart" class="chart-section">
        <div class="section-header">
          <h3>语言情感分布对比</h3>
          <p class="section-desc">两个项目在不同语言的情感分布对比</p>
        </div>
        <div class="dual-bar-chart-container">
          <div class="bar-chart-wrapper">
            <h4>{{ getProjectName(filter.project1) || '项目1' }}</h4>
            <div id="sentimentLanguageChart1" class="bar-chart"></div>
          </div>
          <div class="bar-chart-wrapper">
            <h4>{{ getProjectName(filter.project2) || '项目2' }}</h4>
            <div id="sentimentLanguageChart2" class="bar-chart"></div>
          </div>
        </div>
      </div>

      <!-- 地区情感分布对比（两个堆叠柱状图） -->
      <div v-show="showSentimentRegionChart" class="chart-section">
        <div class="section-header">
          <h3>地区情感分布对比</h3>
          <p class="section-desc">两个项目在不同地区的情感分布对比</p>
        </div>
        <div class="dual-bar-chart-container">
          <div class="bar-chart-wrapper">
            <h4>{{ getProjectName(filter.project1) || '项目1' }}</h4>
            <div id="sentimentRegionChart1" class="bar-chart"></div>
          </div>
          <div class="bar-chart-wrapper">
            <h4>{{ getProjectName(filter.project2) || '项目2' }}</h4>
            <div id="sentimentRegionChart2" class="bar-chart"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getProjectList } from '@/api/project/project';
import type { ProjectSummary } from '@/api/project/project.type';
import { getComparisonData } from '@/api/comparison/comparison';
import type { ComparisonFilter, ComparisonData, ComparisonDataItem, ComparisonGroupData } from '@/api/comparison/comparison.type';
import * as echarts from 'echarts';

// 加载状态
const loading = ref(false);
const error = ref('');
const hasData = ref(false);

// 项目选项
const projectOptions = ref<ProjectSummary[]>([]);

// 平台选项（可以从API获取，这里先硬编码）
const platformOptions = ref(['YouTube', 'Facebook', 'X', 'Instagram']);

const filter = ref({
  project1: '',
  project2: '',
  platforms: [] as string[],
  dateRange: [] as string[],
});

// 控制图表显示的响应式变量
const showMentionChart = ref(false);
const showVideoViewChart = ref(false);
const showVideoViewIncrementChart = ref(false);
const showVideoCommentChart = ref(false);
const showVideoCommentIncrementChart = ref(false);
const showVideoLikeChart = ref(false);
const showVideoLikeIncrementChart = ref(false);
const showPostViewChart = ref(false);
const showPostViewIncrementChart = ref(false);
const showPostCommentChart = ref(false);
const showPostCommentIncrementChart = ref(false);
const showPostLikeChart = ref(false);
const showPostLikeIncrementChart = ref(false);
const showPositiveChart = ref(false);
const showNeutralChart = ref(false);
const showNegativeChart = ref(false);
const showMentionMediaChart = ref(false);
const showMentionLanguageChart = ref(false);
const showMentionRegionChart = ref(false);
const showSentimentTypeChart = ref(false);
const showSentimentMediaChart = ref(false);
const showSentimentLanguageChart = ref(false);
const showSentimentRegionChart = ref(false);

// ECharts实例
let mentionChart: echarts.ECharts | null = null;
let videoViewChart: echarts.ECharts | null = null;
let videoViewIncrementChart: echarts.ECharts | null = null;
let videoCommentChart: echarts.ECharts | null = null;
let videoCommentIncrementChart: echarts.ECharts | null = null;
let videoLikeChart: echarts.ECharts | null = null;
let videoLikeIncrementChart: echarts.ECharts | null = null;
let postViewChart: echarts.ECharts | null = null;
let postViewIncrementChart: echarts.ECharts | null = null;
let postCommentChart: echarts.ECharts | null = null;
let postCommentIncrementChart: echarts.ECharts | null = null;
let postLikeChart: echarts.ECharts | null = null;
let postLikeIncrementChart: echarts.ECharts | null = null;
let positiveChart: echarts.ECharts | null = null;
let neutralChart: echarts.ECharts | null = null;
let negativeChart: echarts.ECharts | null = null;

// 饼图实例
let mentionMediaChart1: echarts.ECharts | null = null;
let mentionMediaChart2: echarts.ECharts | null = null;
let mentionLanguageChart1: echarts.ECharts | null = null;
let mentionLanguageChart2: echarts.ECharts | null = null;
let mentionRegionChart1: echarts.ECharts | null = null;
let mentionRegionChart2: echarts.ECharts | null = null;
let sentimentTypeChart1: echarts.ECharts | null = null;
let sentimentTypeChart2: echarts.ECharts | null = null;

// 堆叠柱状图实例
let sentimentMediaChart1: echarts.ECharts | null = null;
let sentimentMediaChart2: echarts.ECharts | null = null;
let sentimentLanguageChart1: echarts.ECharts | null = null;
let sentimentLanguageChart2: echarts.ECharts | null = null;
let sentimentRegionChart1: echarts.ECharts | null = null;
let sentimentRegionChart2: echarts.ECharts | null = null;

// 统一的颜色配置
const COLORS = {
  project1: '#409eff',    // 项目1颜色
  project2: '#67c23a',    // 项目2颜色
  positive: 'rgb(92, 147, 235)',   // 正面情感：深蓝色（与情感分析页面一致）
  neutral: '#8c8c8c',              // 中立情感：灰色（与情感分析页面一致）
  negative: 'rgb(254, 111, 111)',  // 负面情感：浅红色（与情感分析页面一致）
  pieColors: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#26a69a', '#ab47bc', '#ff9800']
};

// 根据情感标签获取颜色（与情感分析页面保持一致）
const getSentimentColor = (label: string): string => {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel === 'positive' || label === '正面') {
    return COLORS.positive;
  } else if (normalizedLabel === 'neutral' || label === '中性') {
    return COLORS.neutral;
  } else if (normalizedLabel === 'negative' || label === '负面') {
    return COLORS.negative;
  }
  return COLORS.neutral; // 默认颜色
};

// 获取项目名称
const getProjectName = (projectId: string): string => {
  const project = projectOptions.value.find(p => p.projectId === projectId);
  return project ? project.projectName : '';
};

// 处理后端返回的对比分析数据
const processComparisonData = (data: ComparisonData, retryCount = 0) => {
  console.log('📊 处理对比分析数据:', data, 'retryCount:', retryCount);

  // 检查是否有两个项目被选中
  if (!filter.value.project1 || !filter.value.project2) {
    console.warn('需要选择两个项目进行对比');
    return;
  }

  // 处理折线图数据
  processLineChartData(data.mentimentTrendAnalysis, mentionChart);
  processLineChartData(data.videoViewTrendAnalysis, videoViewChart);
  processLineChartData(data.videoViewIncrementTrendAnalysis, videoViewIncrementChart);
  processLineChartData(data.videoCommentTrendAnalysis, videoCommentChart);
  processLineChartData(data.videoCommentIncrementTrendAnalysis, videoCommentIncrementChart);
  processLineChartData(data.videoLikeTrendAnalysis, videoLikeChart);
  processLineChartData(data.videoLikeIncrementTrendAnalysis, videoLikeIncrementChart);
  processLineChartData(data.postViewTrendAnalysis, postViewChart);
  processLineChartData(data.postViewIncrementTrendAnalysis, postViewIncrementChart);
  processLineChartData(data.postCommentTrendAnalysis, postCommentChart);
  processLineChartData(data.postCommentIncrementTrendAnalysis, postCommentIncrementChart);
  processLineChartData(data.postLikeTrendAnalysis, postLikeChart);
  processLineChartData(data.postLikeIncrementTrendAnalysis, postLikeIncrementChart);
  processLineChartData(data.positiveOverTime, positiveChart);
  processLineChartData(data.neutralOverTime, neutralChart);
  processLineChartData(data.negativeOverTime, negativeChart);

  // 处理饼图对比数据
  processDualPieChartData(data.mentionByMediaType, mentionMediaChart1, mentionMediaChart2);
  processDualPieChartData(data.mentionByLanguage, mentionLanguageChart1, mentionLanguageChart2);
  processDualPieChartData(data.mentionByRegion, mentionRegionChart1, mentionRegionChart2);
  processDualPieChartData(data.sentimentByType, sentimentTypeChart1, sentimentTypeChart2);

  // 处理堆叠柱状图对比数据
  processDualStackedBarData(data.sentimentByMediaType, sentimentMediaChart1, sentimentMediaChart2);
  processDualStackedBarData(data.sentimentByLanguage, sentimentLanguageChart1, sentimentLanguageChart2);
  processDualStackedBarData(data.sentimentByRegion, sentimentRegionChart1, sentimentRegionChart2);

  // 设置显示状态
  setChartVisibility(data);
  hasData.value = true;
};

// 通用折线图数据处理函数（对比两个项目）
const processLineChartData = (trendData: ComparisonDataItem[] | ComparisonGroupData, chart: echarts.ECharts | null) => {
  if (!chart) return;

  let dataArray: ComparisonDataItem[] = [];

  // 处理分组数据
  if (trendData && typeof trendData === 'object' && !Array.isArray(trendData)) {
    // 合并两个项目的数据
    Object.values(trendData).forEach(projectData => {
      if (Array.isArray(projectData)) {
        dataArray = dataArray.concat(projectData);
      }
    });
  } else if (Array.isArray(trendData)) {
    dataArray = trendData;
  }

  if (!dataArray || dataArray.length === 0) return;

  // 按项目ID分组数据
  const dataByProject = new Map<string, Map<string, number>>();
  const dates = new Set<string>();

  dataArray.forEach(item => {
    if (item.stage && item.projectId) {
      dates.add(item.stage);
      if (!dataByProject.has(item.projectId)) {
        dataByProject.set(item.projectId, new Map());
      }
      dataByProject.get(item.projectId)!.set(item.stage, item.value);
    }
  });

  // 转换为图表数据格式
  const sortedDates = Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const formattedDates = sortedDates.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}-${d.getDate()}`;
  });

  // 创建系列数据
  const seriesData: Array<{ name: string; data: number[]; color: string }> = [];

  dataByProject.forEach((timeData, projectId) => {
    const data = sortedDates.map(date => timeData.get(date) || 0);
    const projectName = getProjectName(projectId) || projectId;
    const color = projectId === filter.value.project1 ? COLORS.project1 : COLORS.project2;

    seriesData.push({ name: projectName, data, color });
  });

  updateLineChart(chart, formattedDates, seriesData, sortedDates);
};

// 处理双饼图数据
const processDualPieChartData = (groupData: ComparisonGroupData, chart1: echarts.ECharts | null, chart2: echarts.ECharts | null) => {
  if (!groupData || !chart1 || !chart2) return;

  const project1Data = groupData[filter.value.project1] || [];
  const project2Data = groupData[filter.value.project2] || [];

  const pieData1 = project1Data.map(item => ({
    name: item.stage || item.label || '未知',
    value: item.value
  })).sort((a, b) => b.value - a.value);

  const pieData2 = project2Data.map(item => ({
    name: item.stage || item.label || '未知',
    value: item.value
  })).sort((a, b) => b.value - a.value);

  updatePieChart(chart1, pieData1);
  updatePieChart(chart2, pieData2);
};

// 处理双堆叠柱状图数据
const processDualStackedBarData = (groupData: ComparisonGroupData, chart1: echarts.ECharts | null, chart2: echarts.ECharts | null) => {
  if (!groupData || !chart1 || !chart2) return;

  const project1Data = groupData[filter.value.project1] || [];
  const project2Data = groupData[filter.value.project2] || [];

  updateStackedBarChart(chart1, project1Data);
  updateStackedBarChart(chart2, project2Data);
};

// 设置图表显示状态
const setChartVisibility = (data: ComparisonData) => {
  showMentionChart.value = hasValidData(data.mentimentTrendAnalysis);
  showVideoViewChart.value = hasValidData(data.videoViewTrendAnalysis);
  showVideoViewIncrementChart.value = hasValidData(data.videoViewIncrementTrendAnalysis);
  showVideoCommentChart.value = hasValidData(data.videoCommentTrendAnalysis);
  showVideoCommentIncrementChart.value = hasValidData(data.videoCommentIncrementTrendAnalysis);
  showVideoLikeChart.value = hasValidData(data.videoLikeTrendAnalysis);
  showVideoLikeIncrementChart.value = hasValidData(data.videoLikeIncrementTrendAnalysis);
  showPostViewChart.value = hasValidData(data.postViewTrendAnalysis);
  showPostViewIncrementChart.value = hasValidData(data.postViewIncrementTrendAnalysis);
  showPostCommentChart.value = hasValidData(data.postCommentTrendAnalysis);
  showPostCommentIncrementChart.value = hasValidData(data.postCommentIncrementTrendAnalysis);
  showPostLikeChart.value = hasValidData(data.postLikeTrendAnalysis);
  showPostLikeIncrementChart.value = hasValidData(data.postLikeIncrementTrendAnalysis);
  showPositiveChart.value = hasValidData(data.positiveOverTime);
  showNeutralChart.value = hasValidData(data.neutralOverTime);
  showNegativeChart.value = hasValidData(data.negativeOverTime);
  showMentionMediaChart.value = hasValidData(data.mentionByMediaType);
  showMentionLanguageChart.value = hasValidData(data.mentionByLanguage);
  showMentionRegionChart.value = hasValidData(data.mentionByRegion);
  showSentimentTypeChart.value = hasValidData(data.sentimentByType);
  showSentimentMediaChart.value = hasValidData(data.sentimentByMediaType);
  showSentimentLanguageChart.value = hasValidData(data.sentimentByLanguage);
  showSentimentRegionChart.value = hasValidData(data.sentimentByRegion);
};

// 检查数据是否有效
const hasValidData = (data: any): boolean => {
  if (Array.isArray(data)) {
    return data.length > 0;
  }
  if (data && typeof data === 'object') {
    return Object.keys(data).length > 0 && Object.values(data).some(val => Array.isArray(val) && val.length > 0);
  }
  return false;
};

// 初始化所有图表
const initAllCharts = () => {
  console.log('🎯 开始初始化所有图表');

  nextTick(() => {
    setTimeout(() => {
      // 初始化折线图
      initChart('mentionChart', (chart) => { mentionChart = chart; });
      initChart('videoViewChart', (chart) => { videoViewChart = chart; });
      initChart('videoViewIncrementChart', (chart) => { videoViewIncrementChart = chart; });
      initChart('videoCommentChart', (chart) => { videoCommentChart = chart; });
      initChart('videoCommentIncrementChart', (chart) => { videoCommentIncrementChart = chart; });
      initChart('videoLikeChart', (chart) => { videoLikeChart = chart; });
      initChart('videoLikeIncrementChart', (chart) => { videoLikeIncrementChart = chart; });
      initChart('postViewChart', (chart) => { postViewChart = chart; });
      initChart('postViewIncrementChart', (chart) => { postViewIncrementChart = chart; });
      initChart('postCommentChart', (chart) => { postCommentChart = chart; });
      initChart('postCommentIncrementChart', (chart) => { postCommentIncrementChart = chart; });
      initChart('postLikeChart', (chart) => { postLikeChart = chart; });
      initChart('postLikeIncrementChart', (chart) => { postLikeIncrementChart = chart; });
      initChart('positiveChart', (chart) => { positiveChart = chart; });
      initChart('neutralChart', (chart) => { neutralChart = chart; });
      initChart('negativeChart', (chart) => { negativeChart = chart; });

      // 初始化饼图
      initChart('mentionMediaChart1', (chart) => { mentionMediaChart1 = chart; });
      initChart('mentionMediaChart2', (chart) => { mentionMediaChart2 = chart; });
      initChart('mentionLanguageChart1', (chart) => { mentionLanguageChart1 = chart; });
      initChart('mentionLanguageChart2', (chart) => { mentionLanguageChart2 = chart; });
      initChart('mentionRegionChart1', (chart) => { mentionRegionChart1 = chart; });
      initChart('mentionRegionChart2', (chart) => { mentionRegionChart2 = chart; });
      initChart('sentimentTypeChart1', (chart) => { sentimentTypeChart1 = chart; });
      initChart('sentimentTypeChart2', (chart) => { sentimentTypeChart2 = chart; });

      // 初始化堆叠柱状图
      initChart('sentimentMediaChart1', (chart) => { sentimentMediaChart1 = chart; });
      initChart('sentimentMediaChart2', (chart) => { sentimentMediaChart2 = chart; });
      initChart('sentimentLanguageChart1', (chart) => { sentimentLanguageChart1 = chart; });
      initChart('sentimentLanguageChart2', (chart) => { sentimentLanguageChart2 = chart; });
      initChart('sentimentRegionChart1', (chart) => { sentimentRegionChart1 = chart; });
      initChart('sentimentRegionChart2', (chart) => { sentimentRegionChart2 = chart; });

      setTimeout(() => {
        forceResizeAllCharts();
        console.log('✅ 所有图表初始化和尺寸调整完成');
      }, 200);
    }, 100);
  });
};

// 通用图表初始化函数
const initChart = (chartId: string, setChart: (chart: echarts.ECharts) => void) => {
  const chartDom = document.getElementById(chartId);
  if (chartDom) {
    chartDom.style.width = '100%';
    chartDom.style.height = '450px';
    chartDom.style.minWidth = '400px';

    const chart = echarts.init(chartDom);
    setChart(chart);

    // 多次强制resize确保正确尺寸
    setTimeout(() => chart.resize(), 100);
    setTimeout(() => chart.resize(), 300);
    setTimeout(() => chart.resize(), 500);
  }
};

// 强制重新计算所有图表尺寸
const forceResizeAllCharts = () => {
  const charts = [
    mentionChart, videoViewChart, videoViewIncrementChart, videoCommentChart, videoCommentIncrementChart,
    videoLikeChart, videoLikeIncrementChart, postViewChart, postViewIncrementChart, postCommentChart,
    postCommentIncrementChart, postLikeChart, postLikeIncrementChart, positiveChart, neutralChart, negativeChart,
    mentionMediaChart1, mentionMediaChart2, mentionLanguageChart1, mentionLanguageChart2,
    mentionRegionChart1, mentionRegionChart2, sentimentTypeChart1, sentimentTypeChart2,
    sentimentMediaChart1, sentimentMediaChart2, sentimentLanguageChart1, sentimentLanguageChart2,
    sentimentRegionChart1, sentimentRegionChart2
  ];

  charts.forEach(chart => {
    if (chart) chart.resize();
  });
};

// 更新折线图
const updateLineChart = (
  chart: echarts.ECharts,
  dates: string[],
  series: Array<{ name: string; data: number[]; color: string }>,
  originalDates?: string[]
) => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let dateStr = params[0].name;
        if (originalDates && params[0].dataIndex < originalDates.length) {
          const originalDate = new Date(originalDates[params[0].dataIndex]);
          dateStr = `${originalDate.getFullYear()}-${originalDate.getMonth() + 1}-${originalDate.getDate()}`;
        }

        let result = dateStr + '<br/>';
        params.forEach((param: any) => {
          result += param.marker + param.seriesName + ': ' + param.value + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: '5%',
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {
          title: '保存图片'
        }
      },
      right: '20px',
      top: '10px'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e6eb'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '数量',
      nameTextStyle: {
        color: '#666'
      },
      axisLabel: {
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e6eb'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: series.map(s => ({
      name: s.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: s.color,
        width: 3
      },
      itemStyle: {
        color: s.color
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: s.color + '4D'
          }, {
            offset: 1, color: s.color + '1A'
          }]
        }
      },
      data: s.data
    }))
  };

  chart.setOption(option);
};

// 更新饼图
const updatePieChart = (chart: echarts.ECharts, data: { name: string; value: number }[]) => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: '分布',
        type: 'pie',
        radius: '60%',
        center: ['50%', '55%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          color: function(params: any) {
            return COLORS.pieColors[params.dataIndex % COLORS.pieColors.length];
          }
        },
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside'
        },
        labelLine: {
          show: true
        }
      }
    ]
  };

  chart.setOption(option);
};

// 更新堆叠柱状图（百分比模式）
const updateStackedBarChart = (chart: echarts.ECharts, data: ComparisonDataItem[]) => {
  if (!chart) return;

  // 按stage分组，按label分类
  const categoryMap = new Map<string, Map<string, number>>();
  const categories = new Set<string>();
  const labels = new Set<string>();

  data.forEach(item => {
    if (item.stage && item.label) {
      categories.add(item.stage);
      labels.add(item.label);

      if (!categoryMap.has(item.stage)) {
        categoryMap.set(item.stage, new Map());
      }
      categoryMap.get(item.stage)!.set(item.label, item.value);
    }
  });

  // 计算每个类别的总数并按总数排序
  const categoryTotals: Array<{ category: string; total: number }> = [];
  categoryMap.forEach((categoryData, category) => {
    let sum = 0;
    for (const value of categoryData.values()) {
      sum += value;
    }
    categoryTotals.push({ category, total: sum });
  });

  // 按总数从高到低排序
  categoryTotals.sort((a, b) => b.total - a.total);
  const categoryArray = categoryTotals.map(item => item.category);

  // 始终创建正面、中性、负面三种情感类型的系列
  const series: any[] = [];
  ['positive', 'neutral', 'negative'].forEach(sentiment => {
    const chineseName = sentiment === 'positive' ? '正面' :
                       sentiment === 'neutral' ? '中性' :
                       sentiment === 'negative' ? '负面' : sentiment;

    if (labels.has(sentiment)) {
      const seriesValueData: number[] = categoryArray.map((category) => {
        const categoryData = categoryMap.get(category);
        if (categoryData && categoryData.has(sentiment)) {
          return categoryData.get(sentiment)!;
        }
        return 0;
      });

      series.push({
        name: chineseName,
        type: 'bar',
        stack: 'total',
        barMaxWidth: 80, // 设置最大宽度
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
                data: seriesValueData,
        itemStyle: {
          color: getSentimentColor(chineseName)
        }
      });
    } else {
      // 没有数据的情感类型：创建空数据系列但保持图例可见
      series.push({
        name: chineseName,
        type: 'bar',
        stack: 'total',
        barMaxWidth: 80,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
                data: [],
        itemStyle: {
          color: getSentimentColor(chineseName)
        }
      });
    }
  });

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        let result = params[0].name + '<br/>';
        let totalOriginalCount = 0;

        // 获取该类别的原始数据
        const categoryIndex = params[0].dataIndex;
        const originalValues: { [key: string]: number } = {};

        series.forEach(s => {
          if (s.data[categoryIndex]) {
            originalValues[s.name] = s.data[categoryIndex];
            totalOriginalCount += s.data[categoryIndex];
          }
        });

        // 显示各情感类型的数据和百分比
        params.forEach((param: any) => {
          if (typeof param.value === 'number' && param.value > 0) {
            const originalValue = originalValues[param.seriesName] || 0;
            const percentage = Math.round(param.value * 10) / 10;
            result += param.marker + param.seriesName + ': ' + percentage + '% (' + originalValue + '条)<br/>';
          }
        });

        if (totalOriginalCount > 0) {
          result += '<br/>总计: ' + totalOriginalCount + '条';
        }
        return result;
      }
    },
    legend: {
      data: ['正面', '中性', '负面'],
      selectedMode: true,
      top: '5%',
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    grid: {
      left: 100,
      right: 100,
      top: 50,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      data: categoryArray,
      axisLabel: {
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e6eb'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '占比',
      nameTextStyle: {
        color: '#666'
      },
      axisLabel: {
        color: '#666',
        formatter: '{value}%'
      },
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#e5e6eb'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    // 使用百分比堆叠模式
    series: series.map(s => ({
      ...s,
      data: s.data.map((value: number, dataIndex: number) => {
        // 计算该类别的总数
        let categoryTotal = 0;
        series.forEach(seriesItem => {
          if (seriesItem.data[dataIndex]) {
            categoryTotal += seriesItem.data[dataIndex];
          }
        });

        // 返回百分比
        return categoryTotal > 0 ? (value / categoryTotal) * 100 : 0;
      })
    }))
  };

  chart.setOption(option);

  // 监听图例选择变化事件，重新计算百分比
  chart.off('legendselectchanged'); // 移除之前的监听器
  chart.on('legendselectchanged', function(params: any) {
    const selectedLegends = params.selected;

    // 重新计算百分比数据
    const newSeries = series.map((originalSeries) => {
      const seriesName = originalSeries.name;
      const isSelected = selectedLegends[seriesName];

      if (isSelected) {
        // 计算每个类别的新百分比
        const newData = originalSeries.data.map((value: number, dataIndex: number) => {
          // 计算该类别中所有选中系列的总和
          let categoryTotal = 0;
          series.forEach(s => {
            if (selectedLegends[s.name] && s.data[dataIndex]) {
              categoryTotal += s.data[dataIndex];
            }
          });

          // 返回百分比
          return categoryTotal > 0 ? (value / categoryTotal) * 100 : 0;
        });

        return {
          ...originalSeries,
          data: newData,
          stack: 'total',
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: false
            }
          }
        };
      } else {
        return {
          ...originalSeries,
          data: originalSeries.data.map(() => 0), // 隐藏的系列数据设为0
          stack: 'total',
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: false
            }
          }
        };
      }
    });

    // 更新图表
    chart.setOption({
      series: newSeries
    });
  });
};

// 获取项目列表
const fetchProjectList = async () => {
  try {
    const projects = await getProjectList();
    if (projects && Array.isArray(projects)) {
      projectOptions.value = projects;
    }
  } catch (err) {
    console.error('获取项目列表失败:', err);
    ElMessage.error('获取项目列表失败，请稍后重试');
  }
};

// 获取对比分析数据
const fetchComparisonData = async () => {
  try {
    if (!filter.value.project1 || !filter.value.project2) {
      error.value = '请选择两个项目进行对比';
      return;
    }

    if (filter.value.project1 === filter.value.project2) {
      error.value = '请选择不同的项目进行对比';
      return;
    }

    console.log('🚀 获取对比分析数据:', filter.value);

    // 构建请求参数
    const filterParams: ComparisonFilter = {
      projectIds: [filter.value.project1, filter.value.project2],
      platforms: filter.value.platforms.length > 0 ? filter.value.platforms : undefined,
    };

    // 处理日期范围
    if (filter.value.dateRange && filter.value.dateRange.length === 2) {
      filterParams.publishedAtStart = filter.value.dateRange[0];
      filterParams.publishedAtEnd = filter.value.dateRange[1];
    }

    console.log('📤 发送请求参数:', filterParams);

    const data: ComparisonData = await getComparisonData(filterParams);
    console.log('📥 收到API响应:', data);

    // 处理后端返回的数据
    processComparisonData(data);

    // 数据更新后强制调整图表尺寸
    setTimeout(() => {
      forceResizeAllCharts();
    }, 200);

    ElMessage.success('数据对比分析完成');

  } catch (err) {
    console.error('获取对比分析数据失败:', err);
    ElMessage.error(err instanceof Error ? err.message : '获取数据失败，请稍后重试');
    throw err;
  }
};

// 重置筛选条件
function resetFilter() {
  filter.value = {
    project1: '',
    project2: '',
    platforms: [],
    dateRange: [],
  };
  hasData.value = false;
}

// 搜索数据
async function searchData() {
  console.log('🔍 开始搜索对比分析数据:', filter.value);

  loading.value = true;
  error.value = '';
  hasData.value = false;

  try {
    await fetchComparisonData();
    console.log('✅ 搜索完成');
  } catch (err) {
    console.error('❌ 搜索失败:', err);
    error.value = err instanceof Error ? err.message : '搜索失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

// 组件挂载时初始化
onMounted(async () => {
  console.log('对比分析页面挂载');
  loading.value = true;

  try {
    await fetchProjectList();
    // 延迟初始化图表，确保DOM完全加载
    setTimeout(() => {
      initAllCharts();
    }, 100);
  } catch (err) {
    console.error('页面初始化失败:', err);
    error.value = '页面加载失败，请刷新重试';
  } finally {
    loading.value = false;
  }

  // 页面完全加载后再次确保图表尺寸正确
  setTimeout(() => {
    console.log('🎯 页面加载完成，最终调整图表尺寸');
    forceResizeAllCharts();
  }, 1000);

  // 监听窗口大小变化
  const handleResize = () => {
    setTimeout(() => {
      forceResizeAllCharts();
    }, 100);
  };

  window.addEventListener('resize', handleResize);

  // 监听页面可见性变化
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setTimeout(() => {
        forceResizeAllCharts();
      }, 100);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 组件卸载时清理
  return () => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    // 销毁所有图表实例
    const charts = [
      mentionChart, videoViewChart, videoViewIncrementChart, videoCommentChart, videoCommentIncrementChart,
      videoLikeChart, videoLikeIncrementChart, postViewChart, postViewIncrementChart, postCommentChart,
      postCommentIncrementChart, postLikeChart, postLikeIncrementChart, positiveChart, neutralChart, negativeChart,
      mentionMediaChart1, mentionMediaChart2, mentionLanguageChart1, mentionLanguageChart2,
      mentionRegionChart1, mentionRegionChart2, sentimentTypeChart1, sentimentTypeChart2,
      sentimentMediaChart1, sentimentMediaChart2, sentimentLanguageChart1, sentimentLanguageChart2,
      sentimentRegionChart1, sentimentRegionChart2
    ];

    charts.forEach(chart => {
      if (chart) chart.dispose();
    });
  };
});
</script>

<style scoped>
.comparison-page {
  min-height: 100vh;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
}

/* 筛选面板样式 */
.filter-panel {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-panel .el-row {
  margin-bottom: 16px;
}

.filter-panel .el-row:last-child {
  margin-bottom: 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.form-item label {
  min-width: 80px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}

.date-picker {
  width: 100%;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-reset,
.btn-search {
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-reset {
  background: #f5f5f5;
  color: #333;
}

.btn-reset:hover {
  background: #e8e8e8;
}

.btn-search {
  background: #409eff;
  color: white;
}

.btn-search:hover {
  background: #66b1ff;
}

/* 内容容器 */
.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: none;
}

/* 章节标题 */
.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.section-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* 图表区域 */
.chart-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-container {
  height: 500px;
  width: 100%;
  min-width: 900px !important;
  border-radius: 8px;
  background: #fafbfc;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: auto;
}

.chart {
  width: 100% !important;
  height: 100% !important;
  min-height: 450px !important;
  min-width: 900px !important;
}

/* 双饼图布局 */
.dual-pie-chart-container {
  display: flex;
  gap: 24px;
  min-height: 450px;
}

.pie-chart-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pie-chart-wrapper h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.pie-chart {
  width: 100% !important;
  height: 400px !important;
  min-width: 400px !important;
}

/* 双柱状图布局 */
.dual-bar-chart-container {
  display: flex;
  gap: 24px;
  min-height: 450px;
}

.bar-chart-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bar-chart-wrapper h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.bar-chart {
  width: 100% !important;
  height: 400px !important;
  min-width: 400px !important;
  flex: 1;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.btn-retry {
  height: 36px;
  padding: 0 20px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #fff;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: #409eff;
  color: white;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dual-pie-chart-container,
  .dual-bar-chart-container {
    flex-direction: column;
  }

  .pie-chart-wrapper,
  .bar-chart-wrapper {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .comparison-page {
    padding: 16px;
  }

  .filter-panel,
  .chart-section {
    padding: 16px;
  }

  .form-item label {
    min-width: 60px;
    font-size: 13px;
  }

  .chart-container {
    height: 350px;
    padding: 10px;
  }

  .chart,
  .pie-chart,
  .bar-chart {
    min-height: 320px;
  }
}

@media (max-width: 480px) {
  .form-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .form-item label {
    min-width: auto;
    text-align: left;
  }

  .filter-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn-reset,
  .btn-search {
    width: 100%;
  }
}
</style>
