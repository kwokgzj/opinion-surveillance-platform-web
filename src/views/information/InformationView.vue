<template>
  <div class="information-page">
    <!-- 筛选区域 -->
    <div class="filter-panel">
      <!-- 第一行：品牌、SKU、情感倾向、平台 -->
      <div class="form-row">
        <div class="form-item">
          <label>品牌：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="toggleBrandDropdown">
              <div class="selected-items">
                <span v-if="filter.brands.length === 0" class="placeholder">请选择品牌</span>
                <span v-else class="item-tags">
                  <span v-for="brand in filter.brands" :key="brand" class="item-tag">
                    {{ brand }}
                    <span class="tag-close" @click.stop="removeBrand(brand)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: brandDropdownOpen }">▼</span>
            </div>
            <div v-if="brandDropdownOpen" class="dropdown-options">
              <div v-for="brand in brandOptions" :key="brand" class="dropdown-option" @click="toggleBrand(brand)">
                <input type="checkbox" :checked="filter.brands.includes(brand)" @click.stop />
                <label>{{ brand }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>SKU：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="toggleSkuDropdown">
              <div class="selected-items">
                <span v-if="filter.skus.length === 0" class="placeholder">请选择SKU</span>
                <span v-else class="item-tags">
                  <span v-for="sku in filter.skus" :key="sku" class="item-tag">
                    {{ sku }}
                    <span class="tag-close" @click.stop="removeSku(sku)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: skuDropdownOpen }">▼</span>
            </div>
            <div v-if="skuDropdownOpen" class="dropdown-options">
              <div v-for="sku in skuOptions" :key="sku" class="dropdown-option" @click="toggleSku(sku)">
                <input type="checkbox" :checked="filter.skus.includes(sku)" @click.stop />
                <label>{{ sku }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>情感倾向：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="toggleSentimentDropdown">
              <div class="selected-items">
                <span v-if="filter.sentiments.length === 0" class="placeholder">请选择情感倾向</span>
                <span v-else class="item-tags">
                  <span v-for="sentiment in filter.sentiments" :key="sentiment" class="item-tag">
                    {{ sentiment }}
                    <span class="tag-close" @click.stop="removeSentiment(sentiment)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: sentimentDropdownOpen }">▼</span>
            </div>
            <div v-if="sentimentDropdownOpen" class="dropdown-options">
              <div v-for="sentiment in sentimentOptions" :key="sentiment" class="dropdown-option" @click="toggleSentiment(sentiment)">
                <input type="checkbox" :checked="filter.sentiments.includes(sentiment)" @click.stop />
                <label>{{ sentiment }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>平台：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="togglePlatformDropdown">
              <div class="selected-items">
                <span v-if="filter.platforms.length === 0" class="placeholder">请选择平台</span>
                <span v-else class="item-tags">
                  <span v-for="platform in filter.platforms" :key="platform" class="item-tag">
                    {{ platform }}
                    <span class="tag-close" @click.stop="removePlatform(platform)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: platformDropdownOpen }">▼</span>
            </div>
            <div v-if="platformDropdownOpen" class="dropdown-options">
              <div v-for="platform in platformOptions" :key="platform" class="dropdown-option" @click="togglePlatform(platform)">
                <input type="checkbox" :checked="filter.platforms.includes(platform)" @click.stop />
                <label>{{ platform }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：语言、地区、搜索框、排序 -->
      <div class="form-row">
        <div class="form-item">
          <label>语言：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="toggleLanguageDropdown">
              <div class="selected-items">
                <span v-if="filter.languages.length === 0" class="placeholder">请选择语言</span>
                <span v-else class="item-tags">
                  <span v-for="language in filter.languages" :key="language" class="item-tag">
                    {{ language }}
                    <span class="tag-close" @click.stop="removeLanguage(language)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: languageDropdownOpen }">▼</span>
            </div>
            <div v-if="languageDropdownOpen" class="dropdown-options">
              <div v-for="language in languageOptions" :key="language" class="dropdown-option" @click="toggleLanguage(language)">
                <input type="checkbox" :checked="filter.languages.includes(language)" @click.stop />
                <label>{{ language }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>地区：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="toggleRegionDropdown">
              <div class="selected-items">
                <span v-if="filter.regions.length === 0" class="placeholder">请选择地区</span>
                <span v-else class="item-tags">
                  <span v-for="region in filter.regions" :key="region" class="item-tag">
                    {{ region }}
                    <span class="tag-close" @click.stop="removeRegion(region)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: regionDropdownOpen }">▼</span>
            </div>
            <div v-if="regionDropdownOpen" class="dropdown-options">
              <div v-for="region in regionOptions" :key="region" class="dropdown-option" @click="toggleRegion(region)">
                <input type="checkbox" :checked="filter.regions.includes(region)" @click.stop />
                <label>{{ region }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>搜索：</label>
          <input v-model="filter.searchKeyword" type="text" placeholder="请输入搜索关键词" class="search-input" />
        </div>
        <div class="form-item">
          <label>排序：</label>
          <div class="custom-select">
            <div class="select-container" @click="toggleSortDropdown">
              <span class="select-value">{{ filter.sort || '请选择排序' }}</span>
              <span class="dropdown-arrow" :class="{ open: sortDropdownOpen }">▼</span>
            </div>
            <div v-if="sortDropdownOpen" class="dropdown-options">
              <div v-for="sort in sortOptions" :key="sort" class="dropdown-option" @click="selectSort(sort)">
                {{ sort }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三行：视频时长范围、频道、发布起始时间、结束时间 -->
      <div class="form-row">
        <div class="form-item">
          <label>视频时长：</label>
          <div class="custom-select">
            <div class="select-container" @click="toggleDurationDropdown">
              <span class="select-value">{{ filter.duration || '请选择时长范围' }}</span>
              <span class="dropdown-arrow" :class="{ open: durationDropdownOpen }">▼</span>
            </div>
            <div v-if="durationDropdownOpen" class="dropdown-options">
              <div v-for="duration in durationOptions" :key="duration" class="dropdown-option" @click="selectDuration(duration)">
                {{ duration }}
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>频道：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="toggleChannelDropdown">
              <div class="selected-items">
                <span v-if="filter.channels.length === 0" class="placeholder">请选择频道</span>
                <span v-else class="item-tags">
                  <span v-for="channel in filter.channels" :key="channel" class="item-tag">
                    {{ channel }}
                    <span class="tag-close" @click.stop="removeChannel(channel)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: channelDropdownOpen }">▼</span>
            </div>
            <div v-if="channelDropdownOpen" class="dropdown-options">
              <div v-for="channel in channelOptions" :key="channel" class="dropdown-option" @click="toggleChannel(channel)">
                <input type="checkbox" :checked="filter.channels.includes(channel)" @click.stop />
                <label>{{ channel }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>时间范围：</label>
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            range-separator="—"
            start-placeholder="起始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="date-picker"
          />
        </div>
        <div class="form-item">
          <label>标签：</label>
          <div class="custom-multiselect">
            <div class="multiselect-container" @click="toggleTagDropdown">
              <div class="selected-items">
                <span v-if="filter.tags.length === 0" class="placeholder">请选择标签</span>
                <span v-else class="item-tags">
                  <span v-for="tag in filter.tags" :key="tag" class="item-tag">
                    {{ tag }}
                    <span class="tag-close" @click.stop="removeTag(tag)">×</span>
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow" :class="{ open: tagDropdownOpen }">▼</span>
            </div>
            <div v-if="tagDropdownOpen" class="dropdown-options">
              <div v-for="tag in tagOptions" :key="tag" class="dropdown-option" @click="toggleTag(tag)">
                <input type="checkbox" :checked="filter.tags.includes(tag)" @click.stop />
                <label>{{ tag }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button class="btn-reset" @click="resetFilter">重置</button>
        <button class="btn-search" @click="searchData">搜索</button>
      </div>
    </div>

    <!-- 信息展示区域 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载数据...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="btn-retry" @click="fetchInformationData">重试</button>
    </div>

    <div v-else-if="informationList.length === 0" class="empty-container">
      <p>暂无数据</p>
    </div>

    <div v-else class="information-list">
      <div v-for="item in informationList" :key="item.id" class="info-card">
        <!-- 左栏 -->
        <div class="info-left">
          <img :src="item.channelThumbnailUrl" class="info-logo" :class="{ 'inactive': !item.isActive }" />
          <div class="info-channel" :class="{ 'inactive': !item.isActive }" :title="item.channelName">{{ item.channelName }}</div>
          <div class="info-fans" :class="{ 'inactive': !item.isActive }">粉丝：<span>{{ formatNumber(item.subscriberCount) }}</span></div>
        </div>
        <!-- 中栏 -->
        <div class="info-center">
          <div class="info-title-row">
            <img :src="getPlatformIcon(item.platform)" class="info-platform-icon" />
            <a
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="info-title-link"
              :class="{ 'inactive': !item.isActive }"
              :title="item.title"
            >
              {{ item.title }}
            </a>
          </div>
          <div class="info-content-row">
            <img :src="item.thumbnailUrl" class="info-cover" :class="{ 'inactive': !item.isActive }" />
            <div class="info-content-main">
              <div
                v-if="item.description"
                class="info-desc"
                :class="{ 'inactive': !item.isActive }"
                :title="item.description"
              >
                {{ item.description }}
              </div>
            </div>
          </div>
          <div class="info-actions">
            <i class="iconfont icon-like"></i>
            <i class="iconfont icon-comment"></i>
            <i class="iconfont icon-collect"></i>
            <i class="iconfont icon-delete"></i>
          </div>
          <div class="info-meta-row-bottom">
            <div class="info-meta-left">
              <span>发布时间：{{ formatDateYMD(item.publishedAt) }}</span>
              <span v-if="item.platform">| {{ item.platform }}</span>
              <span v-if="item.region">| {{ getRegionLabel(item.region) }}</span>
              <span v-if="item.language">| {{ getLanguageLabel(item.language) }}</span>
            </div>
            <div class="info-meta-actions">
              <button 
                class="action-btn tag-btn" 
                @click="handleAddTag(item)"
                title="添加标签"
              >
                <img src="/src/components/icons/tag.svg" alt="添加标签" />
              </button>
              <button 
                class="action-btn capture-btn" 
                :class="{ active: item.isActive }"
                @click="handleToggleCapture(item)"
                :title="item.isActive ? '停止抓取' : '开始抓取'"
              >
                <img 
                  :src="item.isActive ? '/src/components/icons/capture-active.svg' : '/src/components/icons/capture-inactive.svg'" 
                  :alt="item.isActive ? '停止抓取' : '开始抓取'" 
                />
              </button>
              <button 
                class="action-btn delete-btn" 
                @click="handleDelete(item)"
                title="删除"
              >
                <img src="/src/components/icons/delete.svg" alt="删除" />
              </button>
            </div>
          </div>
        </div>
        <!-- 竖线分割 -->
        <div class="info-divider"></div>
        <!-- 右栏 -->
        <div class="info-right">
          <div class="info-table-2col">
            <div class="info-row-2col">
              <div class="info-cell"><span class="info-label">品牌：</span><span class="info-value">{{ getBrandFromContent(item) }}</span></div>
              <div class="info-cell"><span class="info-label">SKU：</span><span class="info-value">{{ getSkuFromContent(item) }}</span></div>
            </div>
            <div class="info-row-2col">
              <div class="info-cell"><span class="info-label">评论数：</span><span class="info-value">{{ item.commentCount }}</span></div>
              <div class="info-cell"><span class="info-label">点赞数：</span><span class="info-value">{{ item.likeCount }}</span></div>
            </div>
            <div class="info-row-2col">
              <div class="info-cell"><span class="info-label">播放量：</span><span class="info-value">{{ item.viewCount }}</span></div>
              <div class="info-cell"><span class="info-label">情感倾向：</span><span class="info-value info-sentiment"><img :src="getSentimentIcon(getSentimentFromContent(item))" class="sentiment-icon" /></span></div>
            </div>
            <div class="info-row-2col last-row">
              <div class="info-cell" style="width:100%"><span class="info-label">抓取时间：</span><span class="info-value">{{ formatDateYMDOnly(item.captureAt) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { getInformationList, getFilterOptions, updateLinkActiveStatus, deleteProjectLink } from '@/api/information/information';
import type { Information, InformationFilt, FilterOptions } from '@/api/information/information.type';
import { useProjectStore } from '@/stores/project';

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
  labels: []
});

const filter = ref({
  brands: [] as string[],
  skus: [] as string[],
  sentiments: [] as string[],
  platforms: [] as string[],
  languages: [] as string[],
  regions: [] as string[],
  searchKeyword: '',
  sort: '',
  duration: '',
  channels: [] as string[],
  dateRange: [] as string[],
  tags: [] as string[],
});

// 获取筛选选项
const fetchFilterOptions = async () => {
  try {
    const currentProjectId = projectStore.currentProjectId;
    console.log('=== 开始获取筛选选项 ===');
    console.log('当前项目ID:', currentProjectId);
    console.log('当前项目名称:', projectStore.currentProjectName);

    if (!currentProjectId) {
      console.warn('没有项目ID，无法获取筛选选项');
      return;
    }

            const response = await getFilterOptions(currentProjectId);
    console.log('筛选选项响应:', response);

    if (response) {
      filterOptions.value = response;
      console.log('设置筛选选项:', filterOptions.value);
      
      // 设置第一个排序选项为默认值
      if (response.sortBy && response.sortBy.length > 0 && !filter.value.sort) {
        filter.value.sort = response.sortBy[0].label;
      }
    } else {
      console.warn('筛选选项响应为空:', response);
    }
  } catch (error) {
    console.error('获取筛选选项失败:', error);
  }
};

// 选项数据（从API获取，如果没有数据则为空）
const brandOptions = computed(() => {
  console.log('计算品牌选项，filterOptions:', filterOptions.value);
  const options = filterOptions.value.brands?.map(item => item.label) || [];
  console.log('品牌选项:', options);
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
const sortOptions = computed(() => {
  const options = filterOptions.value.sortBy?.map(item => item.label) || [];
  return options;
});

// 获取第一个排序选项的value
const firstSortValue = computed(() => {
  if (filterOptions.value.sortBy && filterOptions.value.sortBy.length > 0) {
    return filterOptions.value.sortBy[0].value;
  }
  return 'publishedAt:desc'; // 默认值
});
const durationOptions = computed(() => {
  const options = filterOptions.value.durations?.map(item => item.label) || [];
  return options;
});
const channelOptions = computed(() => {
  const options = filterOptions.value.channels?.map(item => item.label) || [];
  return options;
});
const tagOptions = computed(() => {
  const options = filterOptions.value.labels?.map(item => item.label) || [];
  return options;
});

// 下拉框状态
const brandDropdownOpen = ref(false);
const skuDropdownOpen = ref(false);
const sentimentDropdownOpen = ref(false);
const platformDropdownOpen = ref(false);
const languageDropdownOpen = ref(false);
const regionDropdownOpen = ref(false);
const sortDropdownOpen = ref(false);
const durationDropdownOpen = ref(false);
const channelDropdownOpen = ref(false);
const tagDropdownOpen = ref(false);

// 品牌相关函数
function toggleBrandDropdown() {
  brandDropdownOpen.value = !brandDropdownOpen.value;
}
function toggleBrand(brand: string) {
  const idx = filter.value.brands.indexOf(brand);
  if (idx === -1) {
    filter.value.brands.push(brand);
  } else {
    filter.value.brands.splice(idx, 1);
  }
}
function removeBrand(brand: string) {
  const idx = filter.value.brands.indexOf(brand);
  if (idx !== -1) {
    filter.value.brands.splice(idx, 1);
  }
}

// SKU相关函数
function toggleSkuDropdown() {
  skuDropdownOpen.value = !skuDropdownOpen.value;
}
function toggleSku(sku: string) {
  const idx = filter.value.skus.indexOf(sku);
  if (idx === -1) {
    filter.value.skus.push(sku);
  } else {
    filter.value.skus.splice(idx, 1);
  }
}
function removeSku(sku: string) {
  const idx = filter.value.skus.indexOf(sku);
  if (idx !== -1) {
    filter.value.skus.splice(idx, 1);
  }
}

// 情感倾向相关函数
function toggleSentimentDropdown() {
  sentimentDropdownOpen.value = !sentimentDropdownOpen.value;
}
function toggleSentiment(sentiment: string) {
  const idx = filter.value.sentiments.indexOf(sentiment);
  if (idx === -1) {
    filter.value.sentiments.push(sentiment);
  } else {
    filter.value.sentiments.splice(idx, 1);
  }
}
function removeSentiment(sentiment: string) {
  const idx = filter.value.sentiments.indexOf(sentiment);
  if (idx !== -1) {
    filter.value.sentiments.splice(idx, 1);
  }
}

// 平台相关函数
function togglePlatformDropdown() {
  platformDropdownOpen.value = !platformDropdownOpen.value;
}
function togglePlatform(platform: string) {
  const idx = filter.value.platforms.indexOf(platform);
  if (idx === -1) {
    filter.value.platforms.push(platform);
  } else {
    filter.value.platforms.splice(idx, 1);
  }
}
function removePlatform(platform: string) {
  const idx = filter.value.platforms.indexOf(platform);
  if (idx !== -1) {
    filter.value.platforms.splice(idx, 1);
  }
}

// 语言相关函数
function toggleLanguageDropdown() {
  languageDropdownOpen.value = !languageDropdownOpen.value;
}
function toggleLanguage(language: string) {
  const idx = filter.value.languages.indexOf(language);
  if (idx === -1) {
    filter.value.languages.push(language);
  } else {
    filter.value.languages.splice(idx, 1);
  }
}
function removeLanguage(language: string) {
  const idx = filter.value.languages.indexOf(language);
  if (idx !== -1) {
    filter.value.languages.splice(idx, 1);
  }
}

// 地区相关函数
function toggleRegionDropdown() {
  regionDropdownOpen.value = !regionDropdownOpen.value;
}
function toggleRegion(region: string) {
  const idx = filter.value.regions.indexOf(region);
  if (idx === -1) {
    filter.value.regions.push(region);
  } else {
    filter.value.regions.splice(idx, 1);
  }
}
function removeRegion(region: string) {
  const idx = filter.value.regions.indexOf(region);
  if (idx !== -1) {
    filter.value.regions.splice(idx, 1);
  }
}

// 排序相关函数
function toggleSortDropdown() {
  sortDropdownOpen.value = !sortDropdownOpen.value;
}
function selectSort(sort: string) {
  filter.value.sort = sort;
  sortDropdownOpen.value = false;
}

// 视频时长相关函数
function toggleDurationDropdown() {
  durationDropdownOpen.value = !durationDropdownOpen.value;
}
function selectDuration(duration: string) {
  filter.value.duration = duration;
  durationDropdownOpen.value = false;
}

// 频道相关函数
function toggleChannelDropdown() {
  channelDropdownOpen.value = !channelDropdownOpen.value;
}
function toggleChannel(channel: string) {
  const idx = filter.value.channels.indexOf(channel);
  if (idx === -1) {
    filter.value.channels.push(channel);
  } else {
    filter.value.channels.splice(idx, 1);
  }
}
function removeChannel(channel: string) {
  const idx = filter.value.channels.indexOf(channel);
  if (idx !== -1) {
    filter.value.channels.splice(idx, 1);
  }
}

// 标签相关函数
function toggleTagDropdown() {
  tagDropdownOpen.value = !tagDropdownOpen.value;
}
function toggleTag(tag: string) {
  const idx = filter.value.tags.indexOf(tag);
  if (idx === -1) {
    filter.value.tags.push(tag);
  } else {
    filter.value.tags.splice(idx, 1);
  }
}
function removeTag(tag: string) {
  const idx = filter.value.tags.indexOf(tag);
  if (idx !== -1) {
    filter.value.tags.splice(idx, 1);
  }
}

// 重置和搜索函数
function resetFilter() {
  filter.value = {
    brands: [],
    skus: [],
    sentiments: [],
    platforms: [],
    languages: [],
    regions: [],
    searchKeyword: '',
    sort: '',
    duration: '',
    channels: [],
    dateRange: [],
    tags: [],
  };
}

async function searchData() {
  console.log('=== 用户点击搜索 ===');
  console.log('搜索条件:', filter.value);
  console.log('==================');

  // 检查排序是否已选择，如果没有选择则提醒用户
  if (!filter.value.sort) {
    alert('请选择排序方式');
    return;
  }

  // 如果项目ID变化，重新获取筛选选项
  // const currentProjectId = projectStore.currentProjectId;
  // if (currentProjectId) {
  //   await fetchFilterOptions();
  // }

  fetchInformationData();
}

// 点击外部关闭下拉框
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;

  // 如果点击的是链接，不处理下拉框关闭逻辑
  if (target.closest('a') || target.tagName === 'A') {
    return;
  }

  // 检查点击的元素是否在下拉框内部
  if (!target.closest('.custom-multiselect') && !target.closest('.custom-select')) {
    brandDropdownOpen.value = false;
    skuDropdownOpen.value = false;
    sentimentDropdownOpen.value = false;
    platformDropdownOpen.value = false;
    languageDropdownOpen.value = false;
    regionDropdownOpen.value = false;
    sortDropdownOpen.value = false;
    durationDropdownOpen.value = false;
    channelDropdownOpen.value = false;
    tagDropdownOpen.value = false;
  }
}

// 监听项目ID变化
watch(() => projectStore.currentProjectId, async (newProjectId, oldProjectId) => {
  console.log('=== 项目ID变化 ===');
  console.log('旧项目ID:', oldProjectId);
  console.log('新项目ID:', newProjectId);

  if (newProjectId && newProjectId !== oldProjectId) {
    console.log('项目ID变化，重新获取筛选选项');
    await fetchFilterOptions();
    fetchInformationData();
  }
});

// 组件挂载时添加全局点击监听
onMounted(async () => {
  document.addEventListener('click', handleClickOutside);

  console.log('=== 组件挂载 ===');
  console.log('当前项目ID:', projectStore.currentProjectId);
  console.log('当前项目名称:', projectStore.currentProjectName);

  // 等待一下确保项目状态已经加载
  await new Promise(resolve => setTimeout(resolve, 100));

  // 先获取筛选选项，再获取数据
  await fetchFilterOptions();
  fetchInformationData();
});

// 组件卸载时移除全局点击监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 信息数据
const informationList = ref<Information[]>([]);

// 获取信息数据
const fetchInformationData = async () => {
  loading.value = true;
  error.value = '';

    try {
    // 获取当前项目ID
    const currentProjectId = projectStore.currentProjectId;
    if (!currentProjectId) {
      error.value = '请先选择一个项目';
      return;
    }

    // 构建过滤条件
    const filterParams: InformationFilt = {
      projectId: currentProjectId,
      brands: filter.value.brands,
      skus: filter.value.skus,
      platforms: filter.value.platforms,
      sentiments: filter.value.sentiments,
      languages: filter.value.languages,
      regions: filter.value.regions,
      sortBy: getSortValue(filter.value.sort),
      minDuration: 0,
      maxDuration: 0,
      channels: filter.value.channels,
      publishedAtStart: filter.value.dateRange[0] || '',
      publishedAtEnd: filter.value.dateRange[1] || '',
      labels: filter.value.tags,
      page: 1,
      size: 20
    };

    // 输出项目ID和过滤条件
    console.log('=== 信息查询参数 ===');
    console.log('项目ID:', currentProjectId);
    console.log('当前项目名称:', projectStore.currentProjectName);
    console.log('当前项目类型:', projectStore.currentProjectType);
    console.log('过滤条件:', filterParams);
    console.log('==================');

    const data = await getInformationList(filterParams);
    console.log('API返回的原始数据:', data);

    // 检查数据结构
    if (data && typeof data === 'object' && 'data' in data) {
      informationList.value = (data as any).data;
    } else {
      informationList.value = data as Information[];
    }
    

  } catch (err) {
    console.error('获取信息数据失败:', err);
    error.value = '获取数据失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

// 新增日期格式化方法
function formatDateYMD(timeStr: string): string {
  if (!timeStr) return '-';

  try {
    // 尝试解析时间字符串
    let date: Date;

    // 如果是时间戳格式
    if (/^\d{10,13}$/.test(timeStr)) {
      // 如果是10位时间戳，转换为13位
      const timestamp = timeStr.length === 10 ? parseInt(timeStr) * 1000 : parseInt(timeStr);
      date = new Date(timestamp);
    } else {
      // 尝试直接解析时间字符串
      date = new Date(timeStr);
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', timeStr);
      return '-';
    }

    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    console.error('日期格式化错误:', error, '原始值:', timeStr);
    return '-';
  }
}

// 只显示年月日的日期格式化方法
function formatDateYMDOnly(timeStr: string): string {
  if (!timeStr) return '-';

  try {
    // 尝试解析时间字符串
    let date: Date;

    // 如果是时间戳格式
    if (/^\d{10,13}$/.test(timeStr)) {
      // 如果是10位时间戳，转换为13位
      const timestamp = timeStr.length === 10 ? parseInt(timeStr) * 1000 : parseInt(timeStr);
      date = new Date(timestamp);
    } else {
      // 尝试直接解析时间字符串
      date = new Date(timeStr);
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', timeStr);
      return '-';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } catch (error) {
    console.error('日期格式化错误:', error, '原始值:', timeStr);
    return '-';
  }
}

// 获取平台图标
function getPlatformIcon(platform: string): string {
  const iconMap: Record<string, string> = {
    'Youtube': '/src/components/icons/youtube.svg',
    'Google new': '/src/components/icons/google_news.svg',
    'X': '/src/components/icons/X.svg'
  };
  return iconMap[platform] || '/src/components/icons/default.svg';
}

// 获取情感图标
function getSentimentIcon(sentiment: number): string {
  let str = 'Neutral';
  if (sentiment <= 30) str = 'Negative';
  if (sentiment >= 71) str = 'Positive';
  if (sentiment >= 31 && sentiment <= 70) str = 'Neutral';
  const iconMap: Record<string, string> = {
    'Positive': '/src/components/icons/positive.svg',
    'Neutral': '/src/components/icons/neutral.svg',
    'Negative': '/src/components/icons/negative.svg'
  };
  return iconMap[str];
}

// 从内容中获取品牌信息
function getBrandFromContent(item: Information): string {
  if (item.contentMentionedBrands && item.contentMentionedBrands.length > 0) {
    return item.contentMentionedBrands[0].brand;
  }
  return '-';
}

// 从内容中获取SKU信息
function getSkuFromContent(item: Information): string {
  if (item.contentMentionedSkus && item.contentMentionedSkus.length > 0) {
    return item.contentMentionedSkus[0].sku;
  }
  return '-';
}

// 从内容中获取情感倾向
function getSentimentFromContent(item: Information): number {
  if (item.contentMentionedBrands && item.contentMentionedBrands.length > 0) {
    // 将0-1的小数转换为0-100的整数
    return Math.round(item.contentMentionedBrands[0].sentiment * 100);
  }
  return 50; // 默认中性
}

// 根据value获取语言的label
function getLanguageLabel(value: string): string {
  if (!value || !filterOptions.value.languages) return value;
  const language = filterOptions.value.languages.find(item => item.value === value);
  return language ? language.label : value;
}

// 根据value获取地区的label
function getRegionLabel(value: string): string {
  if (!value || !filterOptions.value.regions) return value;
  const region = filterOptions.value.regions.find(item => item.value === value);
  return region ? region.label : value;
}

// 根据label获取排序的value
function getSortValue(label: string): string {
  if (!label || !filterOptions.value.sortBy) return firstSortValue.value;
  const sortOption = filterOptions.value.sortBy.find(item => item.label === label);
  return sortOption ? sortOption.value : firstSortValue.value;
}

// 处理添加标签
function handleAddTag(item: Information) {
  console.log('添加标签:', item);
  // TODO: 实现添加标签逻辑
  // 这里可以打开一个弹窗让用户选择或输入标签
}

// 处理切换抓取状态
async function handleToggleCapture(item: Information) {
  try {
    console.log('切换抓取状态:', item);
    
    const currentProjectId = projectStore.currentProjectId;
    if (!currentProjectId) {
      console.error('没有项目ID');
      return;
    }

    // 调用API更新抓取状态
    const response = await updateLinkActiveStatus(currentProjectId, item.id, !item.isActive);
    
    if (response && response.code === 0) {
      // 更新本地数据
      item.isActive = !item.isActive;
      console.log('抓取状态更新成功:', item.isActive);
    } else {
      console.error('抓取状态更新失败:', response);
    }
  } catch (error) {
    console.error('切换抓取状态失败:', error);
  }
}

// 处理删除
async function handleDelete(item: Information) {
  console.log('删除项目:', item);
  
  if (confirm('确定要删除这个信息项吗？')) {
    try {
      const currentProjectId = projectStore.currentProjectId;
      if (!currentProjectId) {
        alert('项目ID不存在，无法删除');
        return;
      }

      console.log('开始删除链接:', item.id);
      const response = await deleteProjectLink(currentProjectId, item.id);
      
      if (response) {
        alert('删除成功');
        // 重新获取数据
        fetchInformationData();
      } else {
        alert('删除失败，请稍后重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    }
  }
}




</script>

<style scoped>
.filter-panel {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.form-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  flex: 1;
}
.form-item label {
  min-width: 80px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}
.custom-multiselect,
.custom-select {
  position: relative;
  flex: 1;
  min-width: 150px;
}
.multiselect-container,
.select-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.3s;
}
.multiselect-container:hover,
.select-container:hover {
  border-color: #c0c4cc;
}
.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}
.placeholder {
  color: #c0c4cc;
  font-size: 14px;
}
.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.item-tag {
  background: #f0f2f5;
  border-radius: 3px;
  padding: 3px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #333;
}
.tag-close {
  margin-left: 4px;
  cursor: pointer;
  color: #999;
  font-size: 14px;
  font-weight: bold;
}
.tag-close:hover {
  color: #ff4d4f;
}
.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.3s;
  color: #999;
  flex-shrink: 0;
}
.dropdown-arrow.open {
  transform: rotate(180deg);
}
.dropdown-options {
  position: absolute;
  left: 0;
  top: 100%;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 10;
  min-width: 100%;
  max-height: 200px;
  overflow-y: auto;
}
.dropdown-option {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
}
.dropdown-option:hover {
  background: #f5f7fa;
}
.dropdown-option input {
  margin-right: 8px;
  pointer-events: none;
}
.dropdown-option label {
  margin: 0;
  cursor: pointer;
  font-size: 14px;
}
.select-value {
  color: #333;
  font-size: 14px;
  flex: 1;
}
.search-input {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  flex: 1;
}
.search-input:hover {
  border-color: #c0c4cc;
}
.search-input:focus {
  border-color: #409eff;
  outline: none;
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
.information-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.info-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 0px 0px;
  align-items: stretch;
  gap: 10px;
}
.info-left {
  min-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-right: 10px;
}
.info-logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 4px;
  transition: filter 0.3s;
}

.info-logo.inactive {
  filter: grayscale(40%) opacity(0.8);
}
.info-channel {
  font-size: 15px;
  color: #222;
  font-weight: 500;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
.info-fans {
  font-size: 12px;
  color: #888;
}
.info-fans span {
  color: #222;
  font-weight: 500;
}
.info-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
  padding-bottom: 28px;
}
.info-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: #222;
  position: relative;
  z-index: 1;
}

.info-title-link {
  color: #222;
  text-decoration: none;
  transition: color 0.3s;
  cursor: pointer;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;      /* 最多显示2行，可根据需求调整 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  max-width: 100%;
}

.info-title-link:hover {
  color: #409eff;
  text-decoration: underline;
}

.info-title-link:active {
  color: #337ecc;
}

.info-title-link.inactive {
  color: #999 !important;
  cursor: not-allowed;
}

.info-title-link.inactive:hover {
  color: #999 !important;
  text-decoration: none;
}
.info-platform-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.info-content-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.info-cover {
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
  flex-shrink: 0;
}
.info-content-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-desc {
  color: #444;
  font-size: 14px;
  line-height: 1.6;
  margin: 2px 0 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多显示2行，可根据需求调整 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  max-width: 100%; /* 保证不会超出父容器 */
  min-height: 40px; /* 可选：保证高度一致 */
}

.info-desc.inactive {
  color: #999 !important;
}
.info-actions {
  margin-top: 6px;
  display: flex;
  gap: 12px;
  color: #b0b0b0;
  font-size: 16px;
}
.info-actions i:hover {
  color: #3a6ff7;
  cursor: pointer;
}
.info-meta-row-bottom {
  color: #aaa;
  font-size: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin-bottom: 6px;
  max-width: calc(100vw - 700px);
  overflow: hidden;
}

.info-meta-left {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.info-meta-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}
.info-meta-row-bottom span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
  padding: 0;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.action-btn img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.tag-btn:hover {
  background: rgba(64, 158, 255, 0.1);
}

.capture-btn {
  opacity: 0.6;
}

.capture-btn.active {
  opacity: 1;
}

.capture-btn:hover {
  background: rgba(103, 194, 58, 0.1);
}

.delete-btn:hover {
  background: rgba(245, 108, 108, 0.1);
}
.info-table-2col {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-row-2col {
  display: flex;
  gap: 16px;
  margin-bottom: 2px;
}
.info-row-2col.last-row {
  gap: 0;
}
.info-row-2col.last-row .info-cell {
  flex: 2 1 0;
}
.info-cell {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  min-width: 0;
}
.info-label {
  width: 70px;
  text-align: right;
  color: #888;
  margin-right: 8px;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 14px;
}
.info-value {
  flex: 1 1 0;
  text-align: left;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 2px;
  font-size: 14px;
  max-width: 120px;
}
.info-sentiment {
  display: flex;
  align-items: center;
}

.sentiment-icon {
  width: 20px;
  height: 20px;
  margin-left: 4px;
}
.info-divider {
  width: 1px;
  background: #e5e6eb;
  height: 100px;
  margin: 0 18px;
  align-self: center;
}
.info-right {
  min-width: 320px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

/* 加载状态样式 */
.loading-container {
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

/* 错误状态样式 */
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

/* 空状态样式 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.empty-container p {
  color: #999;
  font-size: 14px;
  margin: 0;
}

/* 置灰样式补充 */
.info-channel.inactive,
.info-fans.inactive {
  color: #bbb !important;
}
.info-cover.inactive {
  filter: grayscale(40%) opacity(0.8);
}
.info-fans.inactive span {
  color: #bbb !important;
}
</style>
