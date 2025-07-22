<template>
  <div class="sentiment-trend-page">
    <!-- 筛选区域 -->
    <div class="filter-panel">
      <el-row :gutter="24">
        <!-- 第一行：品牌、SKU、时间范围 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
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
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
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
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
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
      <p>正在加载情感趋势数据...</p>
    </div>

    <div v-show="error && !loading" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="btn-retry" @click="fetchSentimentTrendData">重试</button>
    </div>

    <div v-show="!loading && !error" class="content-container">
      <!-- 情感趋势折线图 -->
      <div v-show="showLineChart" class="chart-section">
        <div class="section-header">
          <h3>情感趋势分析</h3>
          <p class="section-desc">情感数据随时间的变化趋势</p>
        </div>
        <div class="chart-container">
          <div id="sentimentLineChart" class="chart"></div>
        </div>
      </div>

      <!-- 情感类型分布饼图 -->
      <div v-show="showPieChart" class="chart-section">
        <div class="section-header">
          <h3>情感类型分布</h3>
          <p class="section-desc">不同情感类型的占比分析</p>
        </div>
        <div class="pie-chart-with-table">
          <div class="pie-chart-container">
            <div id="sentimentPieChart" class="pie-chart"></div>
          </div>
          <div class="table-container">
            <h4>情感分布</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>情感类型</th>
                  <th>数量</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in pieChartTableData" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.value }}</td>
                  <td>{{ item.percentage }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 媒体类型情感分析堆叠柱状图 -->
      <div v-show="showMediaChart" class="chart-section">
        <div class="section-header">
          <h3>各媒体类型情感分析</h3>
          <p class="section-desc">不同媒体平台的情感占比分布</p>
        </div>
        <div class="chart-container">
          <div id="sentimentMediaChart" class="chart"></div>
        </div>
      </div>

      <!-- 语言情感分析堆叠柱状图 -->
      <div v-show="showLanguageChart" class="chart-section">
        <div class="section-header">
          <h3>各语言情感分析</h3>
          <p class="section-desc">不同语言的情感占比分布</p>
        </div>
        <div class="chart-container">
          <div id="sentimentLanguageChart" class="chart"></div>
        </div>
      </div>

      <!-- 地区情感分析堆叠柱状图 -->
      <div v-show="showRegionChart" class="chart-section">
        <div class="section-header">
          <h3>各地区情感分析</h3>
          <p class="section-desc">不同地区的情感占比分布</p>
        </div>
        <div class="chart-container">
          <div id="sentimentRegionChart" class="chart"></div>
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
import { getSentimentTrendData } from '@/api/sentiment/sentiment';
import type { SentimentTrendFilter, SentimentStats, SentimentTrend } from '@/api/sentiment/sentiment.type';
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
  dateRange: [] as string[],
});

// Element Plus 全选状态
const brandCheckAll = ref(false);
const brandIndeterminate = ref(false);
const skuCheckAll = ref(false);
const skuIndeterminate = ref(false);

// 选项数据
const brandOptions = computed(() => {
  const options = filterOptions.value.brands?.map(item => item.label) || [];
  return options;
});

const skuOptions = computed(() => {
  const options = filterOptions.value.skus?.map(item => item.label) || [];
  return options;
});

// 统计数据
const statsData = ref<SentimentStats>({
  positive: 0,
  neutral: 0,
  negative: 0,
  total: 0
});

// 控制图表显示的响应式变量
const showLineChart = ref(false);
const showPieChart = ref(false);
const showMediaChart = ref(false);
const showLanguageChart = ref(false);
const showRegionChart = ref(false);

// 表格数据
const pieChartTableData = ref<Array<{ name: string; value: number; percentage: string }>>([]);



// ECharts实例
let lineChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;
let mediaChart: echarts.ECharts | null = null;
let languageChart: echarts.ECharts | null = null;
let regionChart: echarts.ECharts | null = null;

// 统一的情感颜色配置
const SENTIMENT_COLORS = {
  positive: 'rgb(92, 147, 235)',   // 正面：深蓝色
  neutral: '#8c8c8c',              // 中性：灰色
  negative: 'rgb(254, 111, 111)'   // 负面：浅红色
};

// 根据情感标签获取颜色
const getSentimentColor = (label: string): string => {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel === 'positive' || label === '正面') {
    return SENTIMENT_COLORS.positive;
  } else if (normalizedLabel === 'neutral' || label === '中性') {
    return SENTIMENT_COLORS.neutral;
  } else if (normalizedLabel === 'negative' || label === '负面') {
    return SENTIMENT_COLORS.negative;
  }
  return SENTIMENT_COLORS.neutral; // 默认颜色
};

// 趋势数据
const trendData = ref({
  dates: [] as string[],
  positiveData: [] as number[],
  neutralData: [] as number[],
  negativeData: [] as number[],
  originalDates: [] as string[]
});

// 处理后端返回的情感趋势数据
const processSentimentTrendData = (data: SentimentTrend, retryCount = 0) => {
  console.log('📊 处理情感趋势数据:', data, 'retryCount:', retryCount);

  // 检查图表实例是否存在，如果不存在则重新初始化（最多重试3次）
  if ((!lineChart || !pieChart || !mediaChart || !languageChart || !regionChart) && retryCount < 3) {
    console.log('⚠️ 检测到图表实例缺失，重新初始化...', 'retryCount:', retryCount);
    setTimeout(() => {
      initAllCharts();
      // 重新处理数据，增加重试计数
      setTimeout(() => {
        processSentimentTrendData(data, retryCount + 1);
      }, 200);
    }, 100);
    return;
  }

  // 如果重试次数超过限制，停止递归并记录错误
  if (retryCount >= 3) {
    console.error('❌ 图表初始化失败，已达到最大重试次数');
    return;
  }

  // 1. 处理sentimentOverTime数据用于折线图
  if (data.sentimentOverTime && data.sentimentOverTime.length > 0) {
    processLineChartData(data.sentimentOverTime);
    showLineChart.value = true;
  } else {
    showLineChart.value = false;
  }

  // 2. 处理sentimentByType数据用于饼图
  if (data.sentimentByType && data.sentimentByType.length > 0) {
    processPieChartData(data.sentimentByType);
    showPieChart.value = true;
  } else {
    showPieChart.value = false;
  }

  // 3. 处理sentimentByMediaType数据用于堆叠柱状图
  if (data.sentimentByMediaType && data.sentimentByMediaType.length > 0) {
    processStackedBarChartDataWithTable(data.sentimentByMediaType, 'media');
    showMediaChart.value = true;
  } else {
    showMediaChart.value = false;
  }

  // 4. 处理sentimentByLanguage数据用于堆叠柱状图
  if (data.sentimentByLanguage && data.sentimentByLanguage.length > 0) {
    processStackedBarChartDataWithTable(data.sentimentByLanguage, 'language');
    showLanguageChart.value = true;
  } else {
    showLanguageChart.value = false;
  }

  // 5. 处理sentimentByRegion数据用于堆叠柱状图
  if (data.sentimentByRegion && data.sentimentByRegion.length > 0) {
    processStackedBarChartDataWithTable(data.sentimentByRegion, 'region');
    showRegionChart.value = true;
  } else {
    showRegionChart.value = false;
  }

  // 6. 计算统计数据
  processStatsData(data);
};

// 处理折线图数据
const processLineChartData = (sentimentOverTime: any[]) => {
  if (!sentimentOverTime || sentimentOverTime.length === 0) return;

  // 按日期分组数据，label是情感类型，stage是日期
  const timeDataMap = new Map<string, { positive: number; neutral: number; negative: number }>();

  sentimentOverTime.forEach(item => {
    const date = item.stage; // stage字段是日期
    const sentiment = item.label; // label字段是情感类型

    if (!date) return; // 跳过没有日期的数据

    if (!timeDataMap.has(date)) {
      timeDataMap.set(date, { positive: 0, neutral: 0, negative: 0 });
    }

    const currentData = timeDataMap.get(date)!;
    if (sentiment === 'positive') {
      currentData.positive = item.value;
    } else if (sentiment === 'neutral') {
      currentData.neutral = item.value;
    } else if (sentiment === 'negative') {
      currentData.negative = item.value;
    }
  });

  // 转换为图表数据格式，按日期排序
  const dates = Array.from(timeDataMap.keys()).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const positiveData = dates.map(date => timeDataMap.get(date)!.positive);
  const neutralData = dates.map(date => timeDataMap.get(date)!.neutral);
  const negativeData = dates.map(date => timeDataMap.get(date)!.negative);

  // 格式化日期显示（只显示月-日）
  const formattedDates = dates.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}-${d.getDate()}`;
  });

  // 保存原始日期用于tooltip显示
  const originalDates = [...dates];

  trendData.value = {
    dates: formattedDates,
    positiveData,
    neutralData,
    negativeData,
    originalDates // 添加原始日期
  };

  console.log(`折线图: ${dates.length}个日期点`);

  // 更新折线图
  updateLineChart();
};

// 处理饼图数据
const processPieChartData = (sentimentByType: any[]) => {
  if (!sentimentByType || sentimentByType.length === 0) return;

  const pieData = sentimentByType.map(item => ({
    name: item.label === 'positive' ? '正面' :
          item.label === 'neutral' ? '中性' :
          item.label === 'negative' ? '负面' : item.label,
    value: item.value
  }));

  // 计算总数和百分比
  const total = pieData.reduce((sum, item) => sum + item.value, 0);
  const tableData = pieData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
  })).sort((a, b) => b.value - a.value);

  pieChartTableData.value = tableData;

  console.log(`饼图: ${pieData.length}个分类`);
  updatePieChart(pieData);
};

// 处理带表格数据的堆叠柱状图数据
const processStackedBarChartDataWithTable = (data: any[], chartType: 'media' | 'language' | 'region') => {
  if (!data || data.length === 0) {
    // 如果没有数据，创建空图表但保持图例完整
    const seriesData = [
      {
        name: '正面',
        type: 'bar',
        stack: 'total',
        data: [],
        barWidth: '60%',
        itemStyle: { color: getSentimentColor('正面') },
        label: {
          show: false // 不在柱子上显示标签
        }
      },
      {
        name: '中性',
        type: 'bar',
        stack: 'total',
        data: [],
        barWidth: '60%',
        itemStyle: { color: getSentimentColor('中性') },
        label: {
          show: false // 不在柱子上显示标签
        }
      },
      {
        name: '负面',
        type: 'bar',
        stack: 'total',
        data: [],
        barWidth: '60%',
        itemStyle: { color: getSentimentColor('负面') },
        label: {
          show: false // 不在柱子上显示标签
        }
      }
    ];

    if (chartType === 'media') {
      updateStackedBarChart([], seriesData, 'sentimentMediaChart');
    } else if (chartType === 'language') {
      updateStackedBarChart([], seriesData, 'sentimentLanguageChart');
    } else if (chartType === 'region') {
      updateStackedBarChart([], seriesData, 'sentimentRegionChart');
    }
    return;
  }

  // 按stage分组，label作为系列
  const groupedData = new Map<string, Map<string, number>>();
  const sentimentTypes = new Set<string>();

  data.forEach(item => {
    const stage = item.stage;
    const sentiment = item.label;

    if (!stage) return;

    if (!groupedData.has(stage)) {
      groupedData.set(stage, new Map());
    }

    groupedData.get(stage)!.set(sentiment, item.value);
    sentimentTypes.add(sentiment);
  });

  // 计算每个类别的总数并按总数排序
  const categoryTotals: Array<{ category: string; total: number }> = [];

  groupedData.forEach((categoryData, category) => {
    let sum = 0;
    for (const value of categoryData.values()) {
      sum += value;
    }
    categoryTotals.push({ category, total: sum });
  });

  // 按总数从高到低排序
  categoryTotals.sort((a, b) => b.total - a.total);

  // 提取排序后的类别名称
  const categories = categoryTotals.map(item => item.category);

  // 始终创建所有三种情感类型的系列，确保图例完整
  const seriesData: any[] = [];

  // 按固定顺序创建所有系列
  ['positive', 'neutral', 'negative'].forEach(sentiment => {
    const chineseName = sentiment === 'positive' ? '正面' :
                       sentiment === 'neutral' ? '中性' :
                       sentiment === 'negative' ? '负面' : sentiment;

    if (sentimentTypes.has(sentiment)) {
      // 有数据的情感类型：直接使用原始数据
      const seriesValueData: number[] = categories.map((category) => {
        const categoryData = groupedData.get(category);
        if (categoryData && categoryData.has(sentiment)) {
          return categoryData.get(sentiment)!;
        }
        return 0;
      });

      seriesData.push({
        name: chineseName,
        type: 'bar',
        stack: 'total',
        barWidth: '60%',
        label: {
          show: false // 不在柱子上显示标签
        },
        emphasis: {
          label: {
            show: false // 鼠标悬停时也不显示标签
          }
        },
        data: seriesValueData,
        itemStyle: { color: getSentimentColor(chineseName) }
      });
    } else {
      // 没有数据的情感类型：创建空数据系列但保持图例可见
      seriesData.push({
        name: chineseName,
        type: 'bar',
        stack: 'total',
        barWidth: '60%',
        label: {
          show: false // 不在柱子上显示标签
        },
        emphasis: {
          label: {
            show: false // 鼠标悬停时也不显示标签
          }
        },
        data: [], // 完全空的数据数组
        itemStyle: { color: getSentimentColor(chineseName) }
      });
    }
  });

  console.log(`${chartType}堆叠图: ${Array.from(sentimentTypes).join(',')} | 类别: ${categories.length}个`);

  if (chartType === 'media') {
    updateStackedBarChart(categories, seriesData, 'sentimentMediaChart');
  } else if (chartType === 'language') {
    updateStackedBarChart(categories, seriesData, 'sentimentLanguageChart');
  } else if (chartType === 'region') {
    updateStackedBarChart(categories, seriesData, 'sentimentRegionChart');
  }
};

// 处理统计数据
const processStatsData = (data: SentimentTrend) => {
  let totalPositive = 0;
  let totalNeutral = 0;
  let totalNegative = 0;

  if (data.sentimentByType && data.sentimentByType.length > 0) {
    data.sentimentByType.forEach(item => {
      const sentiment = item.label;
      if (sentiment === 'positive') {
        totalPositive += item.value;
      } else if (sentiment === 'neutral') {
        totalNeutral += item.value;
      } else if (sentiment === 'negative') {
        totalNegative += item.value;
      }
    });
  } else if (data.sentimentOverTime) {
    // 如果sentimentByType没有数据，从sentimentOverTime计算总数
    data.sentimentOverTime.forEach(item => {
      const sentiment = item.label;
      if (sentiment === 'positive') {
        totalPositive += item.value;
      } else if (sentiment === 'neutral') {
        totalNeutral += item.value;
      } else if (sentiment === 'negative') {
        totalNegative += item.value;
      }
    });
  }

  statsData.value = {
    positive: totalPositive,
    neutral: totalNeutral,
    negative: totalNegative,
    total: totalPositive + totalNeutral + totalNegative
  };

  console.log(`统计: 正面${statsData.value.positive} 中性${statsData.value.neutral} 负面${statsData.value.negative}`);
};

// 初始化所有图表
const initAllCharts = () => {
  console.log('🎯 开始初始化所有图表');

  // 确保DOM元素存在后再初始化，并添加多重延迟确保尺寸正确
  nextTick(() => {
    setTimeout(() => {
      initLineChart();
      initPieChart();
      initStackedCharts();

      // 初始化完成后强制resize所有图表
      setTimeout(() => {
        forceResizeAllCharts();
        console.log('✅ 所有图表初始化和尺寸调整完成');
      }, 200);
    }, 100);
  });
};

// 强制重新计算所有图表尺寸
const forceResizeAllCharts = () => {
  if (lineChart) lineChart.resize();
  if (pieChart) pieChart.resize();
  if (mediaChart) mediaChart.resize();
  if (languageChart) languageChart.resize();
  if (regionChart) regionChart.resize();
};

// 初始化折线图
const initLineChart = () => {
  console.log('🔄 初始化折线图...');
  const chartDom = document.getElementById('sentimentLineChart');
  if (chartDom) {
    console.log('✅ 找到折线图DOM元素，原始尺寸:', chartDom.offsetWidth, 'x', chartDom.offsetHeight);

    // 强制设置容器尺寸
    chartDom.style.width = '100%';
    chartDom.style.height = '450px';
    chartDom.style.minWidth = '900px';
    chartDom.parentElement!.style.width = '100%';
    chartDom.parentElement!.style.minWidth = '900px';

    console.log('✅ 设置后折线图尺寸:', chartDom.offsetWidth, 'x', chartDom.offsetHeight);

    lineChart = echarts.init(chartDom);
    updateLineChart();

    // 多次强制resize确保正确尺寸
    setTimeout(() => {
      if (lineChart) {
        lineChart.resize();
      }
    }, 100);
    setTimeout(() => {
      if (lineChart) {
        lineChart.resize();
      }
    }, 300);
    setTimeout(() => {
      if (lineChart) {
        lineChart.resize();
      }
    }, 500);

    console.log('✅ 折线图初始化完成');
  } else {
    console.error('❌ 未找到折线图DOM元素: sentimentLineChart');
  }
};

// 初始化饼图
const initPieChart = () => {
  console.log('🔄 初始化饼图...');
  const chartDom = document.getElementById('sentimentPieChart');
  if (chartDom) {
        console.log('✅ 找到饼图DOM元素，原始尺寸:', chartDom.offsetWidth, 'x', chartDom.offsetHeight);

    // 强制设置容器尺寸
    chartDom.style.width = '100%';
    chartDom.style.height = '450px';
    chartDom.style.minWidth = '900px';
    chartDom.parentElement!.style.width = '100%';
    chartDom.parentElement!.style.minWidth = '900px';

    console.log('✅ 设置后饼图尺寸:', chartDom.offsetWidth, 'x', chartDom.offsetHeight);

        pieChart = echarts.init(chartDom);

    // 多次强制resize确保正确尺寸
    setTimeout(() => {
      if (pieChart) {
        pieChart.resize();
      }
    }, 100);
    setTimeout(() => {
      if (pieChart) {
        pieChart.resize();
      }
    }, 300);
    setTimeout(() => {
      if (pieChart) {
        pieChart.resize();
      }
    }, 500);

    console.log('✅ 饼图初始化完成');
  } else {
    console.error('❌ 未找到饼图DOM元素: sentimentPieChart');
  }
};

// 初始化堆叠图表
const initStackedCharts = () => {
  console.log('🔄 初始化堆叠图表...');

  const mediaChartDom = document.getElementById('sentimentMediaChart');
  if (mediaChartDom) {
    console.log('✅ 找到媒体图表DOM元素，原始尺寸:', mediaChartDom.offsetWidth, 'x', mediaChartDom.offsetHeight);
    mediaChartDom.style.width = '100%';
    mediaChartDom.style.height = '450px';
    mediaChartDom.style.minWidth = '900px';
    mediaChartDom.parentElement!.style.width = '100%';
    mediaChartDom.parentElement!.style.minWidth = '900px';
    console.log('✅ 设置后媒体图表尺寸:', mediaChartDom.offsetWidth, 'x', mediaChartDom.offsetHeight);
    mediaChart = echarts.init(mediaChartDom);
    setTimeout(() => mediaChart?.resize(), 100);
    setTimeout(() => mediaChart?.resize(), 300);
    setTimeout(() => mediaChart?.resize(), 500);
  }

  const languageChartDom = document.getElementById('sentimentLanguageChart');
  if (languageChartDom) {
    console.log('✅ 找到语言图表DOM元素，原始尺寸:', languageChartDom.offsetWidth, 'x', languageChartDom.offsetHeight);
    languageChartDom.style.width = '100%';
    languageChartDom.style.height = '450px';
    languageChartDom.style.minWidth = '900px';
    languageChartDom.parentElement!.style.width = '100%';
    languageChartDom.parentElement!.style.minWidth = '900px';
    console.log('✅ 设置后语言图表尺寸:', languageChartDom.offsetWidth, 'x', languageChartDom.offsetHeight);
    languageChart = echarts.init(languageChartDom);
    setTimeout(() => languageChart?.resize(), 100);
    setTimeout(() => languageChart?.resize(), 300);
    setTimeout(() => languageChart?.resize(), 500);
  }

  const regionChartDom = document.getElementById('sentimentRegionChart');
  if (regionChartDom) {
    console.log('✅ 找到地区图表DOM元素，原始尺寸:', regionChartDom.offsetWidth, 'x', regionChartDom.offsetHeight);
    regionChartDom.style.width = '100%';
    regionChartDom.style.height = '450px';
    regionChartDom.style.minWidth = '900px';
    regionChartDom.parentElement!.style.width = '100%';
    regionChartDom.parentElement!.style.minWidth = '900px';
    console.log('✅ 设置后地区图表尺寸:', regionChartDom.offsetWidth, 'x', regionChartDom.offsetHeight);
    regionChart = echarts.init(regionChartDom);
    setTimeout(() => regionChart?.resize(), 100);
    setTimeout(() => regionChart?.resize(), 300);
    setTimeout(() => regionChart?.resize(), 500);
  }

  console.log('✅ 堆叠图表初始化完成');
};

// 更新折线图数据
const updateLineChart = () => {
  if (!lineChart) {
    console.error('❌ 折线图实例不存在');
    return;
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        // 如果有原始日期数据，使用原始日期格式化为年月日
        let dateStr = params[0].name;
        if (trendData.value.originalDates && params[0].dataIndex < trendData.value.originalDates.length) {
          const originalDate = new Date(trendData.value.originalDates[params[0].dataIndex]);
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
      data: ['正面', '中性', '负面'],
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
      data: trendData.value.dates,
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
    series: [
      {
        name: '正面',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: SENTIMENT_COLORS.positive,
          width: 3
        },
        itemStyle: {
          color: SENTIMENT_COLORS.positive
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(92, 147, 235, 0.3)'
            }, {
              offset: 1, color: 'rgba(92, 147, 235, 0.1)'
            }]
          }
        },
        data: trendData.value.positiveData
      },
      {
        name: '中性',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: SENTIMENT_COLORS.neutral,
          width: 3
        },
        itemStyle: {
          color: SENTIMENT_COLORS.neutral
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(140, 140, 140, 0.3)'
            }, {
              offset: 1, color: 'rgba(140, 140, 140, 0.1)'
            }]
          }
        },
        data: trendData.value.neutralData
      },
      {
        name: '负面',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: SENTIMENT_COLORS.negative,
          width: 3
        },
        itemStyle: {
          color: SENTIMENT_COLORS.negative
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(254, 111, 111, 0.3)'
            }, {
              offset: 1, color: 'rgba(254, 111, 111, 0.1)'
            }]
          }
        },
        data: trendData.value.negativeData
      }
    ]
  };

  lineChart.setOption(option);
};

// 更新饼图
const updatePieChart = (data: { name: string; value: number }[]) => {
  if (!pieChart) return;

  // 按指定顺序排列数据：正面、中性、负面，始终包含所有三种类型
  const dataMap = new Map(data.map(item => [item.name, item.value]));

  // 确保所有情感类型都存在，没有数据的设为0
  const orderedData = [
    { name: '正面', value: dataMap.get('正面') || 0 },
    { name: '中性', value: dataMap.get('中性') || 0 },
    { name: '负面', value: dataMap.get('负面') || 0 }
  ];

  // console.log('饼图完整数据:', orderedData);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      top: '5%',
      data: ['正面', '中性', '负面'],
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    color: [
      getSentimentColor('正面'),
      getSentimentColor('中性'),
      getSentimentColor('负面')
    ],
    series: [
      {
        name: '情感分布',
        type: 'pie',
        radius: '60%',
        center: ['50%', '55%'],
        data: orderedData, // 使用完整数据，包括值为0的项
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          color: function(params: any) {
            return getSentimentColor(params.name);
          }
        },
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: function(params: any) {
            return params.value > 0 ? params.name : '';
          }
        },
        labelLine: {
          show: function(params: any) {
            return params.value > 0;
          }
        }
      }
    ]
  };

  pieChart.setOption(option);
};

// 更新堆叠柱状图
const updateStackedBarChart = (
  categories: string[],
  seriesData: any[],
  chartId: string
) => {
  let chart: echarts.ECharts | null = null;

  if (chartId === 'sentimentMediaChart') {
    chart = mediaChart;
  } else if (chartId === 'sentimentLanguageChart') {
    chart = languageChart;
  } else if (chartId === 'sentimentRegionChart') {
    chart = regionChart;
  }

  if (!chart) return;

      // 为所有堆叠柱状图添加最大宽度限制
  const processedSeriesData = seriesData.map(series => {
    return {
      ...series,
      barMaxWidth: 80 // 为所有图表设置最大宽度为80px
    };
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

        // 从原始数据获取实际数值
        const categoryIndex = params[0].dataIndex;
        const originalValues: { [key: string]: number } = {};

        // 获取该类别的原始数据
        processedSeriesData.forEach(series => {
          if (series.data[categoryIndex]) {
            originalValues[series.name] = series.data[categoryIndex];
            totalOriginalCount += series.data[categoryIndex];
          }
        });

        // 显示各情感类型的数据和百分比
        params.forEach((param: any) => {
          if (typeof param.value === 'number' && param.value > 0) {
            const originalValue = originalValues[param.seriesName] || 0;
            const percentage = Math.round(param.value * 10) / 10; // param.value已经是百分比
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
      data: ['正面', '中性', '负面'], // 固定显示所有情感类型
      selectedMode: true, // 启用图例选择，允许点击过滤
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
      data: categories,
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
    series: processedSeriesData.map(series => ({
      ...series,
      stack: 'total',
      label: {
        show: false // 不显示柱子上的标签
      },
      emphasis: {
        label: {
          show: false // 鼠标悬停时也不显示标签
        }
      },
      data: series.data.map((value: number, dataIndex: number) => {
        // 计算该类别的总数
        let categoryTotal = 0;
        processedSeriesData.forEach(s => {
          if (s.data[dataIndex]) {
            categoryTotal += s.data[dataIndex];
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
    const newSeries = processedSeriesData.map((series) => {
      const seriesName = series.name;
      const isSelected = selectedLegends[seriesName];

      if (isSelected) {
        // 计算每个类别的新百分比
        const newData = series.data.map((value: number, dataIndex: number) => {
          // 计算该类别中所有选中系列的总和
          let categoryTotal = 0;
          processedSeriesData.forEach(s => {
            if (selectedLegends[s.name] && s.data[dataIndex]) {
              categoryTotal += s.data[dataIndex];
            }
          });

          // 返回百分比
          return categoryTotal > 0 ? (value / categoryTotal) * 100 : 0;
        });

        return {
          ...series,
          data: newData,
          stack: 'total',
          label: {
            show: false // 不显示柱子上的标签
          },
          emphasis: {
            label: {
              show: false // 鼠标悬停时也不显示标签
            }
          }
        };
      } else {
        return {
          ...series,
          data: series.data.map(() => 0), // 隐藏的系列数据设为0
          stack: 'total',
          label: {
            show: false // 不显示柱子上的标签
          },
          emphasis: {
            label: {
              show: false // 鼠标悬停时也不显示标签
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

// 获取情感趋势数据
const fetchSentimentTrendData = async () => {
  try {
    const currentProjectId = projectStore.currentProjectId;
    if (!currentProjectId) {
      error.value = '请先选择一个项目';
      return;
    }

    console.log('🚀 获取情感趋势数据:', {
      projectId: currentProjectId,
      brands: filter.value.brands,
      skus: filter.value.skus,
      dateRange: filter.value.dateRange
    });

    // 在获取数据前先清除所有旧数据
    console.log('🧹 清除旧数据...');
    trendData.value = {
      dates: [],
      positiveData: [],
      neutralData: [],
      negativeData: [],
      originalDates: []
    };
    statsData.value = {
      positive: 0,
      neutral: 0,
      negative: 0,
      total: 0
    };

    // 清空所有图表并更新为空状态
    if (lineChart) {
      lineChart.clear();
      updateLineChart(); // 更新为空的折线图
    }
    if (pieChart) {
      pieChart.clear();
      updatePieChart([]); // 更新为空的饼图
    }
    if (mediaChart) {
      mediaChart.clear();
      // 创建空的系列数据但保持图例
      const emptySeriesData = [
        {
          name: '正面',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('正面') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        },
        {
          name: '中性',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('中性') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        },
        {
          name: '负面',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('负面') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        }
      ];
      updateStackedBarChart([], emptySeriesData, 'sentimentMediaChart');
    }
    if (languageChart) {
      languageChart.clear();
      const emptySeriesData = [
        {
          name: '正面',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('正面') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        },
        {
          name: '中性',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('中性') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        },
        {
          name: '负面',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('负面') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        }
      ];
      updateStackedBarChart([], emptySeriesData, 'sentimentLanguageChart');
    }
    if (regionChart) {
      regionChart.clear();
      const emptySeriesData = [
        {
          name: '正面',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('正面') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        },
        {
          name: '中性',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('中性') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        },
        {
          name: '负面',
          type: 'bar',
          stack: 'total',
          data: [],
          barWidth: '60%',
          itemStyle: { color: getSentimentColor('负面') },
          label: {
            show: true,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
          }
        }
      ];
      updateStackedBarChart([], emptySeriesData, 'sentimentRegionChart');
    }

    // 构建请求参数
    const filterParams: SentimentTrendFilter = {
      projectId: currentProjectId,
      brands: filter.value.brands.length > 0 ? filter.value.brands : undefined,
      skus: filter.value.skus.length > 0 ? filter.value.skus : undefined,
    };

    // 处理日期范围
    if (filter.value.dateRange && filter.value.dateRange.length === 2) {
      filterParams.publishedAtStart = filter.value.dateRange[0];
      filterParams.publishedAtEnd = filter.value.dateRange[1];
    }

            // 调用实际的情感趋势分析API
    console.log('📤 发送请求参数:', filterParams);

    try {
      const data: SentimentTrend = await getSentimentTrendData(filterParams);
      console.log('📥 收到API响应:', data);

      // 处理后端返回的数据，转换为前端图表需要的格式
      processSentimentTrendData(data);
    } catch (apiError) {
      console.error('API调用失败:', apiError);
      // 直接抛出错误，不使用模拟数据
      throw apiError;
    }

    // 图表会在数据处理过程中自动更新

    // 数据更新后强制调整图表尺寸
    setTimeout(() => {
      forceResizeAllCharts();
    }, 200);

    ElMessage.success('数据加载成功');

  } catch (err) {
    console.error('获取情感趋势数据失败:', err);
    ElMessage.error(err instanceof Error ? err.message : '获取数据失败，请稍后重试');
    throw err;
  }
};

// 重置筛选条件
function resetFilter() {
  filter.value = {
    brands: [],
    skus: [],
    dateRange: [],
  };
}



// 搜索数据
async function searchData() {
  console.log('🔍 开始搜索情感趋势数据:', filter.value);
  console.log('🏗️ 当前项目ID:', projectStore.currentProjectId);

  loading.value = true;
  error.value = '';

  try {
    await fetchSentimentTrendData();
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

// 监听项目ID变化
watch(() => projectStore.currentProjectId, async (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log('项目ID变化，重新获取筛选选项');
    loading.value = true;
    error.value = '';

    try {
      // 先清空所有数据和图表
      console.log('🧹 项目切换，清除所有数据...');
      trendData.value = {
        dates: [],
        positiveData: [],
        neutralData: [],
        negativeData: [],
        originalDates: []
      };
      statsData.value = { positive: 0, neutral: 0, negative: 0, total: 0 };

      // 清空所有图表并更新为空状态
      if (lineChart) {
        lineChart.clear();
        updateLineChart(); // 更新为空的折线图
      }
      if (pieChart) {
        pieChart.clear();
        updatePieChart([]); // 更新为空的饼图
      }
      if (mediaChart) {
        mediaChart.clear();
        const emptySeriesData = [
          {
            name: '正面',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('正面') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          },
          {
            name: '中性',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('中性') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          },
          {
            name: '负面',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('负面') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          }
        ];
        updateStackedBarChart([], emptySeriesData, 'sentimentMediaChart');
      }
      if (languageChart) {
        languageChart.clear();
        const emptySeriesData = [
          {
            name: '正面',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('正面') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          },
          {
            name: '中性',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('中性') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          },
          {
            name: '负面',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('负面') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          }
        ];
        updateStackedBarChart([], emptySeriesData, 'sentimentLanguageChart');
      }
      if (regionChart) {
        regionChart.clear();
        const emptySeriesData = [
          {
            name: '正面',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('正面') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          },
          {
            name: '中性',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('中性') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          },
          {
            name: '负面',
            type: 'bar',
            stack: 'total',
            data: [],
            barWidth: '60%',
            itemStyle: { color: getSentimentColor('负面') },
            label: {
              show: true,
              formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
            }
          }
        ];
        updateStackedBarChart([], emptySeriesData, 'sentimentRegionChart');
      }

      await fetchFilterOptions();
      // 重置筛选条件
      resetFilter();

      // 自动获取新项目的情感趋势数据
      console.log('项目切换完成，自动加载情感趋势数据...');
      await fetchSentimentTrendData();
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
  console.log('情感趋势分析页面挂载');
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
      console.log('自动加载情感趋势数据...');
      await fetchSentimentTrendData();
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
    if (lineChart) lineChart.dispose();
    if (pieChart) pieChart.dispose();
    if (mediaChart) mediaChart.dispose();
    if (languageChart) languageChart.dispose();
    if (regionChart) regionChart.dispose();
  };
});
</script>

<style scoped>
.sentiment-trend-page {
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

/* 堆叠图表+表格布局 */
.stacked-chart-with-table {
  display: flex;
  gap: 24px;
  min-height: 450px;
}

.stacked-chart-container {
  flex: 1.5;
  min-width: 400px;
}

.stacked-chart {
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

/* 删除不需要的占位符样式 */

/* 图表区域 */
.chart-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: none;
  overflow: visible;
}

/* 合并到通用chart样式中 */



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
  .sentiment-trend-page {
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
