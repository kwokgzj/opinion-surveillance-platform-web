<template>
  <div class="trend-analysis-page">
    <!-- 筛选区域 -->
    <div class="filter-panel">
      <el-row :gutter="24">
        <!-- 第一行：品牌、SKU、情感倾向、平台 -->
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>品牌：</label>
            <el-select
              v-model="filter.brands"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              placeholder="请选择品牌"
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="brandCheckAll"
                  :indeterminate="brandIndeterminate"
                  @change="handleBrandCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="brand in brandOptions"
                :key="brand"
                :label="brand"
                :value="brand"
              />
            </el-select>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>SKU：</label>
            <el-select
              v-model="filter.skus"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              placeholder="请选择SKU"
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="skuCheckAll"
                  :indeterminate="skuIndeterminate"
                  @change="handleSkuCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="sku in skuOptions"
                :key="sku"
                :label="sku"
                :value="sku"
              />
            </el-select>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>情感倾向：</label>
            <el-select
              v-model="filter.sentiments"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择情感倾向"
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="sentimentCheckAll"
                  :indeterminate="sentimentIndeterminate"
                  @change="handleSentimentCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="sentiment in sentimentOptions"
                :key="sentiment"
                :label="sentiment"
                :value="sentiment"
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
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="platformCheckAll"
                  :indeterminate="platformIndeterminate"
                  @change="handlePlatformCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="platform in platformOptions"
                :key="platform"
                :label="platform"
                :value="platform"
              />
            </el-select>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <!-- 第二行：语言、地区、起始时间、结束时间 -->
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>语言：</label>
            <el-select
              v-model="filter.languages"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择语言"
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="languageCheckAll"
                  :indeterminate="languageIndeterminate"
                  @change="handleLanguageCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="language in languageOptions"
                :key="language"
                :label="language"
                :value="language"
              />
            </el-select>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>地区：</label>
            <el-select
              v-model="filter.regions"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择地区"
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="regionCheckAll"
                  :indeterminate="regionIndeterminate"
                  @change="handleRegionCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="region in regionOptions"
                :key="region"
                :label="region"
                :value="region"
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
        <button class="btn-search" @click="searchData">搜索</button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-show="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载趋势分析数据...</p>
    </div>

    <div v-show="error && !loading" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="btn-retry" @click="fetchTrendAnalysisData">重试</button>
    </div>

    <div v-show="!loading && !error" class="content-container">
      <!-- 视频总量趋势分析折线图 -->
      <div v-show="showVideoTotalChart" class="chart-section">
        <div class="section-header">
          <h3>视频总量趋势分析</h3>
          <p class="section-desc">视频观看数、评论数、点赞数的总量变化趋势</p>
        </div>
        <div class="chart-container">
          <div id="videoTotalChart" class="chart"></div>
        </div>
      </div>

      <!-- 视频增量趋势分析折线图 -->
      <div v-show="showVideoIncrementalChart" class="chart-section">
        <div class="section-header">
          <h3>视频增量趋势分析</h3>
          <p class="section-desc">视频观看数、评论数、点赞数的增量变化趋势</p>
        </div>
        <div class="chart-container">
          <div id="videoIncrementalChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子总量趋势分析折线图 -->
      <div v-show="showPostTotalChart" class="chart-section">
        <div class="section-header">
          <h3>帖子总量趋势分析</h3>
          <p class="section-desc">帖子数量的总量变化趋势</p>
        </div>
        <div class="chart-container">
          <div id="postTotalChart" class="chart"></div>
        </div>
      </div>

      <!-- 帖子增量趋势分析折线图 -->
      <div v-show="showPostIncrementalChart" class="chart-section">
        <div class="section-header">
          <h3>帖子增量趋势分析</h3>
          <p class="section-desc">帖子数量的增量变化趋势</p>
        </div>
        <div class="chart-container">
          <div id="postIncrementalChart" class="chart"></div>
        </div>
      </div>

      <!-- 提及数量随时间变化折线图 -->
      <div v-show="showMentionTimeChart" class="chart-section">
        <div class="section-header">
          <h3>提及数量随时间变化</h3>
          <p class="section-desc">品牌/产品提及次数的时间趋势</p>
        </div>
        <div class="chart-container">
          <div id="mentionTimeChart" class="chart"></div>
        </div>
      </div>

      <!-- 提及数量按媒体分布饼图 -->
      <div v-show="showMentionMediaChart" class="chart-section">
        <div class="section-header">
          <h3>提及数量按媒体分布</h3>
          <p class="section-desc">不同媒体平台的提及数量分布</p>
        </div>
        <div class="pie-chart-with-table">
          <div class="pie-chart-container">
            <div id="mentionMediaChart" class="pie-chart"></div>
          </div>
          <div class="table-container">
            <h4>Top 10 媒体平台</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>媒体平台</th>
                  <th>提及数量</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in mentionMediaTableData" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 提及数量按语言分布饼图 -->
      <div v-show="showMentionLanguageChart" class="chart-section">
        <div class="section-header">
          <h3>提及数量按语言分布</h3>
          <p class="section-desc">不同语言的提及数量分布</p>
        </div>
        <div class="pie-chart-with-table">
          <div class="pie-chart-container">
            <div id="mentionLanguageChart" class="pie-chart"></div>
          </div>
          <div class="table-container">
            <h4>Top 10 语言</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>语言</th>
                  <th>提及数量</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in mentionLanguageTableData" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 提及数量按地区分布饼图 -->
      <div v-show="showMentionRegionChart" class="chart-section">
        <div class="section-header">
          <h3>提及数量按地区分布</h3>
          <p class="section-desc">不同地区的提及数量分布</p>
        </div>
        <div class="pie-chart-with-table">
          <div class="pie-chart-container">
            <div id="mentionRegionChart" class="pie-chart"></div>
          </div>
          <div class="table-container">
            <h4>Top 10 地区</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>地区</th>
                  <th>提及数量</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in mentionRegionTableData" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getFilterOptions } from '@/api/information/information';
import type { FilterOptions } from '@/api/information/information.type';
import { getTrendAnalysisData } from '@/api/trend/trend';
import type { TrendAnalysisFilter, TrendStats, TrendAnalysisData } from '@/api/trend/trend.type';
import { useProjectStore } from '@/stores/project';
import * as echarts from 'echarts';

// 使用项目store
const projectStore = useProjectStore();

// 加载状态
const loading = ref(false);
const error = ref('');

// 筛选选项
const filterOptions = ref<FilterOptions>({
  brands: [],
  skus: [],
  sentiments: [],
  platforms: [],
  languages: [],
  regions: [],
  sortBy: [],
  channels: [],
  durations: [],
  labels: [],
  count: 0
});

const filter = ref({
  brands: [] as string[],
  skus: [] as string[],
  sentiments: [] as string[],
  platforms: [] as string[],
  languages: [] as string[],
  regions: [] as string[],
  dateRange: [] as string[],
});

// Element Plus 全选状态
const brandCheckAll = ref(false);
const brandIndeterminate = ref(false);
const skuCheckAll = ref(false);
const skuIndeterminate = ref(false);
const sentimentCheckAll = ref(false);
const sentimentIndeterminate = ref(false);
const platformCheckAll = ref(false);
const platformIndeterminate = ref(false);
const languageCheckAll = ref(false);
const languageIndeterminate = ref(false);
const regionCheckAll = ref(false);
const regionIndeterminate = ref(false);

// 选项数据
const brandOptions = computed(() => {
  const options = filterOptions.value.brands?.map(item => item.label) || [];
  return options;
});

const skuOptions = computed(() => {
  const options = filterOptions.value.skus?.map(item => item.label) || [];
  return options;
});

const sentimentOptions = computed(() => {
  const options = filterOptions.value.sentiments?.map(item => item.label) || [];
  return options;
});

const platformOptions = computed(() => {
  const options = filterOptions.value.platforms?.map(item => item.label) || [];
  return options;
});

const languageOptions = computed(() => {
  const options = filterOptions.value.languages?.map(item => item.label) || [];
  return options;
});

const regionOptions = computed(() => {
  const options = filterOptions.value.regions?.map(item => item.label) || [];
  return options;
});

// 统计数据
const statsData = ref<TrendStats>({
  totalVideos: 0,
  totalPosts: 0,
  totalMentions: 0,
  totalViews: 0,
  totalComments: 0,
  totalLikes: 0
});

// 控制图表显示的响应式变量
const showVideoTotalChart = ref(false);
const showVideoIncrementalChart = ref(false);
const showPostTotalChart = ref(false);
const showPostIncrementalChart = ref(false);
const showMentionTimeChart = ref(false);
const showMentionMediaChart = ref(false);
const showMentionLanguageChart = ref(false);
const showMentionRegionChart = ref(false);

// 表格数据
const mentionMediaTableData = ref<Array<{ name: string; value: number }>>([]);
const mentionLanguageTableData = ref<Array<{ name: string; value: number }>>([]);
const mentionRegionTableData = ref<Array<{ name: string; value: number }>>([]);

// ECharts实例
let videoTotalChart: echarts.ECharts | null = null;
let videoIncrementalChart: echarts.ECharts | null = null;
let postTotalChart: echarts.ECharts | null = null;
let postIncrementalChart: echarts.ECharts | null = null;
let mentionTimeChart: echarts.ECharts | null = null;
let mentionMediaChart: echarts.ECharts | null = null;
let mentionLanguageChart: echarts.ECharts | null = null;
let mentionRegionChart: echarts.ECharts | null = null;

// 统一的颜色配置
const COLORS = {
  primary: '#409eff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  info: '#909399',
  viewCount: '#5c93eb',    // 观看数
  commentCount: '#ffa726',  // 评论数
  likeCount: '#ef5350',     // 点赞数
  postCount: '#ab47bc',     // 帖子数
  mentionCount: '#26a69a'   // 提及数
};

// 处理后端返回的趋势分析数据
const processTrendAnalysisData = (data: TrendAnalysisData) => {
  console.log('📊 处理趋势分析数据:', data);

  // 检查图表实例是否存在，如果不存在则重新初始化
  if (!videoTotalChart || !videoIncrementalChart || !postTotalChart ||
      !postIncrementalChart || !mentionTimeChart || !mentionMediaChart ||
      !mentionLanguageChart || !mentionRegionChart) {
    console.log('⚠️ 检测到图表实例缺失，重新初始化...');
    setTimeout(() => {
      initAllCharts();
      // 重新处理数据
      setTimeout(() => {
        processTrendAnalysisData(data);
      }, 200);
    }, 100);
    return;
  }

  // 1. 处理视频趋势分析数据
  if (data.videoTrendAnalysis && data.videoTrendAnalysis.length > 0) {
    processLineChartData(data.videoTrendAnalysis, videoTotalChart);
    showVideoTotalChart.value = true;
  } else {
    showVideoTotalChart.value = false;
  }

  // 2. 处理视频增量趋势分析数据
  if (data.videoIncrementTrendAnalysis && data.videoIncrementTrendAnalysis.length > 0) {
    processLineChartData(data.videoIncrementTrendAnalysis, videoIncrementalChart);
    showVideoIncrementalChart.value = true;
  } else {
    showVideoIncrementalChart.value = false;
  }

  // 3. 处理帖子趋势分析数据
  if (data.postTrendAnalysis && data.postTrendAnalysis.length > 0) {
    processLineChartData(data.postTrendAnalysis, postTotalChart);
    showPostTotalChart.value = true;
  } else {
    showPostTotalChart.value = false;
  }

  // 4. 处理帖子增量趋势分析数据
  if (data.postIncrementTrendAnalysis && data.postIncrementTrendAnalysis.length > 0) {
    processLineChartData(data.postIncrementTrendAnalysis, postIncrementalChart);
    showPostIncrementalChart.value = true;
  } else {
    showPostIncrementalChart.value = false;
  }

  // 5. 处理提及趋势分析数据
  if (data.mentimentTrendAnalysis && data.mentimentTrendAnalysis.length > 0) {
    processLineChartData(data.mentimentTrendAnalysis, mentionTimeChart);
    showMentionTimeChart.value = true;
  } else {
    showMentionTimeChart.value = false;
  }

  // 6. 处理提及数量按媒体类型分布数据
  if (data.mentionByMediaType && data.mentionByMediaType.length > 0) {
    processPieChartWithTableData(data.mentionByMediaType, 'mentionMediaChart');
    showMentionMediaChart.value = true;
  } else {
    showMentionMediaChart.value = false;
  }

  // 7. 处理提及数量按语言分布数据
  if (data.mentionByLanguage && data.mentionByLanguage.length > 0) {
    processPieChartWithTableData(data.mentionByLanguage, 'mentionLanguageChart');
    showMentionLanguageChart.value = true;
  } else {
    showMentionLanguageChart.value = false;
  }

  // 8. 处理提及数量按地区分布数据
  if (data.mentionByRegion && data.mentionByRegion.length > 0) {
    processPieChartWithTableData(data.mentionByRegion, 'mentionRegionChart');
    showMentionRegionChart.value = true;
  } else {
    showMentionRegionChart.value = false;
  }

  // 9. 计算统计数据
  processStatsData(data);
};

// 通用折线图数据处理函数
const processLineChartData = (trendData: any[], chart: echarts.ECharts | null) => {
  if (!trendData || trendData.length === 0 || !chart) return;

  // 按label分组数据，stage是时间
  const dataByLabel = new Map<string, Map<string, number>>();
  const dates = new Set<string>();

  trendData.forEach(item => {
    if (item.stage && item.label) {
      dates.add(item.stage);
      if (!dataByLabel.has(item.label)) {
        dataByLabel.set(item.label, new Map());
      }
      dataByLabel.get(item.label)!.set(item.stage, item.value);
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

  // 根据label创建对应的系列
  dataByLabel.forEach((timeData, label) => {
    const data = sortedDates.map(date => timeData.get(date) || 0);
    let color = COLORS.primary;
    let name = label;

    // 根据label设置颜色和名称
    if (label.includes('viewCount') || label.includes('incrementViewCount')) {
      color = COLORS.viewCount;
      name = label.includes('increment') ? '观看数增量' : '观看数';
    } else if (label.includes('commentCount') || label.includes('incrementCommentCount')) {
      color = COLORS.commentCount;
      name = label.includes('increment') ? '评论数增量' : '评论数';
    } else if (label.includes('likeCount') || label.includes('incrementLikeCount')) {
      color = COLORS.likeCount;
      name = label.includes('increment') ? '点赞数增量' : '点赞数';
    } else if (label.includes('post')) {
      color = COLORS.postCount;
      name = '帖子数';
    } else if (label === 'total') {
      color = COLORS.viewCount;  // 使用蓝色
      name = '提及总数';
    } else if (label === 'video') {
      color = COLORS.commentCount;  // 使用橙色
      name = '视频提及数';
    } else if (label === 'post') {
      color = COLORS.likeCount;
      name = '帖子提及数';
    } else {
      // 其他类型使用默认颜色
      color = COLORS.info;
      name = label;
    }

    seriesData.push({ name, data, color });
  });

  updateLineChart(chart, formattedDates, seriesData);
};



// 处理带表格的饼图数据
const processPieChartWithTableData = (data: any[], chartId: string) => {
  if (!data || data.length === 0) return;

  // 按value值降序排序
  const sortedData = data
    .map(item => ({
      name: item.stage || item.label || '未知',
      value: item.value
    }))
    .sort((a, b) => b.value - a.value);

  // 取前10条数据用于表格显示
  const top10Data = sortedData.slice(0, 10);

  let chart: echarts.ECharts | null = null;
  if (chartId === 'mentionMediaChart') {
    chart = mentionMediaChart;
    mentionMediaTableData.value = top10Data;
  } else if (chartId === 'mentionLanguageChart') {
    chart = mentionLanguageChart;
    mentionLanguageTableData.value = top10Data;
  } else if (chartId === 'mentionRegionChart') {
    chart = mentionRegionChart;
    mentionRegionTableData.value = top10Data;
  }

  if (chart) {
    updatePieChart(chart, sortedData);
  }
};

// 处理统计数据
const processStatsData = (data: TrendAnalysisData) => {
  let totalViews = 0;
  let totalComments = 0;
  let totalLikes = 0;
  let totalPosts = 0;
  let totalMentions = 0;

  // 从视频趋势分析计算视频相关统计
  if (data.videoTrendAnalysis) {
    data.videoTrendAnalysis.forEach(item => {
      if (item.label?.includes('view')) {
        totalViews += item.value;
      } else if (item.label?.includes('comment')) {
        totalComments += item.value;
      } else if (item.label?.includes('like')) {
        totalLikes += item.value;
      }
    });
  }

  // 从帖子趋势分析计算帖子统计
  if (data.postTrendAnalysis) {
    totalPosts = data.postTrendAnalysis.reduce((sum, item) => sum + item.value, 0);
  }

  // 从提及趋势分析计算提及统计
  if (data.mentimentTrendAnalysis) {
    totalMentions = data.mentimentTrendAnalysis.reduce((sum, item) => sum + item.value, 0);
  }

  statsData.value = {
    totalVideos: 0, // 这个需要根据实际情况计算
    totalPosts,
    totalMentions,
    totalViews,
    totalComments,
    totalLikes
  };

  console.log('统计数据:', statsData.value);
};

// 初始化所有图表
const initAllCharts = () => {
  console.log('🎯 开始初始化所有图表');

  nextTick(() => {
    setTimeout(() => {
      initChart('videoTotalChart', (chart) => { videoTotalChart = chart; });
      initChart('videoIncrementalChart', (chart) => { videoIncrementalChart = chart; });
      initChart('postTotalChart', (chart) => { postTotalChart = chart; });
      initChart('postIncrementalChart', (chart) => { postIncrementalChart = chart; });
      initChart('mentionTimeChart', (chart) => { mentionTimeChart = chart; });
      initChart('mentionMediaChart', (chart) => { mentionMediaChart = chart; });
      initChart('mentionLanguageChart', (chart) => { mentionLanguageChart = chart; });
      initChart('mentionRegionChart', (chart) => { mentionRegionChart = chart; });

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
    chartDom.style.minWidth = '900px';
    chartDom.parentElement!.style.width = '100%';
    chartDom.parentElement!.style.minWidth = '900px';

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
  if (videoTotalChart) videoTotalChart.resize();
  if (videoIncrementalChart) videoIncrementalChart.resize();
  if (postTotalChart) postTotalChart.resize();
  if (postIncrementalChart) postIncrementalChart.resize();
  if (mentionTimeChart) mentionTimeChart.resize();
  if (mentionMediaChart) mentionMediaChart.resize();
  if (mentionLanguageChart) mentionLanguageChart.resize();
  if (mentionRegionChart) mentionRegionChart.resize();
};

// 更新折线图
const updateLineChart = (
  chart: echarts.ECharts,
  dates: string[],
  series: Array<{ name: string; data: number[]; color: string }>
) => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let result = params[0].name + '<br/>';
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
            offset: 0, color: s.color + '4D' // 30% opacity
          }, {
            offset: 1, color: s.color + '1A' // 10% opacity
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

// Element Plus 全选处理函数
function handleBrandCheckAll(val: boolean) {
  brandIndeterminate.value = false;
  if (val) {
    filter.value.brands = [...brandOptions.value];
  } else {
    filter.value.brands = [];
  }
}

function handleSkuCheckAll(val: boolean) {
  skuIndeterminate.value = false;
  if (val) {
    filter.value.skus = [...skuOptions.value];
  } else {
    filter.value.skus = [];
  }
}

function handleSentimentCheckAll(val: boolean) {
  sentimentIndeterminate.value = false;
  if (val) {
    filter.value.sentiments = [...sentimentOptions.value];
  } else {
    filter.value.sentiments = [];
  }
}

function handlePlatformCheckAll(val: boolean) {
  platformIndeterminate.value = false;
  if (val) {
    filter.value.platforms = [...platformOptions.value];
  } else {
    filter.value.platforms = [];
  }
}

function handleLanguageCheckAll(val: boolean) {
  languageIndeterminate.value = false;
  if (val) {
    filter.value.languages = [...languageOptions.value];
  } else {
    filter.value.languages = [];
  }
}

function handleRegionCheckAll(val: boolean) {
  regionIndeterminate.value = false;
  if (val) {
    filter.value.regions = [...regionOptions.value];
  } else {
    filter.value.regions = [];
  }
}

// 获取筛选选项
const fetchFilterOptions = async () => {
  try {
    const currentProjectId = projectStore.currentProjectId;
    if (!currentProjectId) {
      console.warn('没有项目ID，无法获取筛选选项');
      return;
    }

    const response = await getFilterOptions(currentProjectId);
    if (response) {
      filterOptions.value = response;
    }
  } catch (err) {
    console.error('获取筛选选项失败:', err);
    throw new Error('获取筛选选项失败，请稍后重试');
  }
};

// 获取趋势分析数据
const fetchTrendAnalysisData = async () => {
  try {
    const currentProjectId = projectStore.currentProjectId;
    if (!currentProjectId) {
      error.value = '请先选择一个项目';
      return;
    }

    console.log('🚀 获取趋势分析数据:', {
      projectId: currentProjectId,
      ...filter.value
    });

    // 清除旧数据
    statsData.value = {
      totalVideos: 0,
      totalPosts: 0,
      totalMentions: 0,
      totalViews: 0,
      totalComments: 0,
      totalLikes: 0
    };

    // 构建请求参数
    const filterParams: TrendAnalysisFilter = {
      projectId: currentProjectId,
      brands: filter.value.brands.length > 0 ? filter.value.brands : undefined,
      skus: filter.value.skus.length > 0 ? filter.value.skus : undefined,
      sentiments: filter.value.sentiments.length > 0 ? filter.value.sentiments : undefined,
      platforms: filter.value.platforms.length > 0 ? filter.value.platforms : undefined,
      languages: filter.value.languages.length > 0 ? filter.value.languages : undefined,
      regions: filter.value.regions.length > 0 ? filter.value.regions : undefined,
    };

    // 处理日期范围
    if (filter.value.dateRange && filter.value.dateRange.length === 2) {
      filterParams.publishedAtStart = filter.value.dateRange[0];
      filterParams.publishedAtEnd = filter.value.dateRange[1];
    }

    console.log('📤 发送请求参数:', filterParams);

    try {
      const data: TrendAnalysisData = await getTrendAnalysisData(filterParams);
      console.log('📥 收到API响应:', data);

      // 处理后端返回的数据
      processTrendAnalysisData(data);
    } catch (apiError) {
      console.warn('API调用失败，使用模拟数据:', apiError);

      // 使用基于真实数据格式的模拟数据进行测试
      const mockData: TrendAnalysisData = {
        videoTrendAnalysis: [
          { projectId: "test", label: "viewCount", stage: "2025-04-23", value: 11336465 },
          { projectId: "test", label: "commentCount", stage: "2025-04-23", value: 21770 },
          { projectId: "test", label: "likeCount", stage: "2025-04-23", value: 343072 },
          { projectId: "test", label: "viewCount", stage: "2025-04-24", value: 11439437 },
          { projectId: "test", label: "commentCount", stage: "2025-04-24", value: 21946 },
          { projectId: "test", label: "likeCount", stage: "2025-04-24", value: 346126 },
        ],
        videoIncrementTrendAnalysis: [
          { projectId: "test", label: "incrementViewCount", stage: "2025-04-23", value: 95788 },
          { projectId: "test", label: "incrementCommentCount", stage: "2025-04-23", value: 163 },
          { projectId: "test", label: "incrementLikeCount", stage: "2025-04-23", value: 2896 },
        ],
        postTrendAnalysis: [],
        postIncrementTrendAnalysis: [],
        mentimentTrendAnalysis: [
          { projectId: "test", label: "total", stage: "2025-05-03", value: 1 },
          { projectId: "test", label: "total", stage: "2025-05-02", value: 1 },
          { projectId: "test", label: "total", stage: "2025-04-25", value: 1 },
          { projectId: "test", label: "video", stage: "2025-04-25", value: 1 },
          { projectId: "test", label: "video", stage: "2025-05-05", value: 2 },
          { projectId: "test", label: "video", stage: "2025-05-04", value: 1 },
        ],
        mentionByMediaType: [
          { projectId: "test", label: "", stage: "Youtube", value: 7 },
        ],
        mentionByLanguage: [
          { projectId: "test", label: "", stage: "英语", value: 6 },
          { projectId: "test", label: "", stage: "法语", value: 1 },
        ],
        mentionByRegion: [
          { projectId: "test", label: "", stage: "比利时", value: 1 },
          { projectId: "test", label: "", stage: "英国", value: 2 },
          { projectId: "test", label: "", stage: "美国", value: 2 },
          { projectId: "test", label: "", stage: "加拿大", value: 2 },
        ]
      };

      console.log('使用模拟数据:', mockData);
      processTrendAnalysisData(mockData);

      // 重新抛出错误以便上层处理
      throw apiError;
    }

    // 数据更新后强制调整图表尺寸
    setTimeout(() => {
      forceResizeAllCharts();
    }, 200);

    ElMessage.success('数据加载成功');

  } catch (err) {
    console.error('获取趋势分析数据失败:', err);
    ElMessage.error(err instanceof Error ? err.message : '获取数据失败，请稍后重试');
    throw err;
  }
};

// 重置筛选条件
function resetFilter() {
  filter.value = {
    brands: [],
    skus: [],
    sentiments: [],
    platforms: [],
    languages: [],
    regions: [],
    dateRange: [],
  };
}

// 搜索数据
async function searchData() {
  console.log('🔍 开始搜索趋势分析数据:', filter.value);
  console.log('🏗️ 当前项目ID:', projectStore.currentProjectId);

  loading.value = true;
  error.value = '';

  try {
    await fetchTrendAnalysisData();
    console.log('✅ 搜索完成');
  } catch (err) {
    console.error('❌ 搜索失败:', err);
    error.value = err instanceof Error ? err.message : '搜索失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

// 监听筛选条件变化，更新全选状态
watch(() => filter.value.brands, (val) => {
  if (val.length === 0) {
    brandCheckAll.value = false;
    brandIndeterminate.value = false;
  } else if (val.length === brandOptions.value.length) {
    brandCheckAll.value = true;
    brandIndeterminate.value = false;
  } else {
    brandIndeterminate.value = true;
  }
});

watch(() => filter.value.skus, (val) => {
  if (val.length === 0) {
    skuCheckAll.value = false;
    skuIndeterminate.value = false;
  } else if (val.length === skuOptions.value.length) {
    skuCheckAll.value = true;
    skuIndeterminate.value = false;
  } else {
    skuIndeterminate.value = true;
  }
});

watch(() => filter.value.sentiments, (val) => {
  if (val.length === 0) {
    sentimentCheckAll.value = false;
    sentimentIndeterminate.value = false;
  } else if (val.length === sentimentOptions.value.length) {
    sentimentCheckAll.value = true;
    sentimentIndeterminate.value = false;
  } else {
    sentimentIndeterminate.value = true;
  }
});

watch(() => filter.value.platforms, (val) => {
  if (val.length === 0) {
    platformCheckAll.value = false;
    platformIndeterminate.value = false;
  } else if (val.length === platformOptions.value.length) {
    platformCheckAll.value = true;
    platformIndeterminate.value = false;
  } else {
    platformIndeterminate.value = true;
  }
});

watch(() => filter.value.languages, (val) => {
  if (val.length === 0) {
    languageCheckAll.value = false;
    languageIndeterminate.value = false;
  } else if (val.length === languageOptions.value.length) {
    languageCheckAll.value = true;
    languageIndeterminate.value = false;
  } else {
    languageIndeterminate.value = true;
  }
});

watch(() => filter.value.regions, (val) => {
  if (val.length === 0) {
    regionCheckAll.value = false;
    regionIndeterminate.value = false;
  } else if (val.length === regionOptions.value.length) {
    regionCheckAll.value = true;
    regionIndeterminate.value = false;
  } else {
    regionIndeterminate.value = true;
  }
});

// 监听项目ID变化
watch(() => projectStore.currentProjectId, async (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log('项目ID变化，重新获取筛选选项');
    loading.value = true;
    error.value = '';

    try {
      await fetchFilterOptions();
      // 重置筛选条件
      resetFilter();
    } catch (err) {
      console.error('项目切换失败:', err);
      error.value = err instanceof Error ? err.message : '项目切换失败，请稍后重试';
    } finally {
      loading.value = false;
    }
  }
});

// 组件挂载时初始化
onMounted(async () => {
  console.log('趋势分析页面挂载');
  console.log('当前项目ID:', projectStore.currentProjectId);
  loading.value = true;

  try {
    await fetchFilterOptions();
    // 延迟初始化图表，确保DOM完全加载
    setTimeout(() => {
      initAllCharts();
    }, 100);

    // 如果有项目ID，自动加载默认数据
    if (projectStore.currentProjectId) {
      console.log('自动加载趋势分析数据...');
      await fetchTrendAnalysisData();
    } else {
      console.warn('没有项目ID，请先选择项目');
      error.value = '请先选择一个项目';
    }
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
    if (videoTotalChart) videoTotalChart.dispose();
    if (videoIncrementalChart) videoIncrementalChart.dispose();
    if (postTotalChart) postTotalChart.dispose();
    if (postIncrementalChart) postIncrementalChart.dispose();
    if (mentionTimeChart) mentionTimeChart.dispose();
    if (mentionMediaChart) mentionMediaChart.dispose();
    if (mentionLanguageChart) mentionLanguageChart.dispose();
    if (mentionRegionChart) mentionRegionChart.dispose();
  };
});
</script>

<style scoped>
.trend-analysis-page {
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

/* Element Plus 全选样式 */
:deep(.custom-header) {
  .el-checkbox {
    display: flex;
    height: unset;
    padding: 8px 12px;
    margin: 0;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
  }

  .el-checkbox__label {
    font-weight: 500;
    color: #409eff;
  }
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

/* 饼图+表格布局 */
.pie-chart-with-table {
  display: flex;
  gap: 24px;
  min-height: 450px;
}

.pie-chart-container {
  flex: 1.5;
  min-width: 400px;
}

.pie-chart {
  width: 100% !important;
  height: 450px !important;
  min-width: 400px !important;
}

.table-container {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  background: #fff;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e5e6eb;
}

.table-container h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th,
.data-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.data-table td:first-child {
  font-weight: 600;
  color: #409eff;
}

.data-table td:last-child {
  font-weight: 600;
  color: #333;
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
@media (max-width: 768px) {
  .trend-analysis-page {
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

  .chart {
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
