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
    <div class="information-list">
      <div v-for="item in informationList" :key="item.id" class="info-card">
        <!-- 左栏 -->
        <div class="info-left">
          <img :src="item.channelAvatar" class="info-logo" />
          <div class="info-channel">{{ item.channelName }}</div>
          <div class="info-fans">粉丝：<span>{{ formatNumber(item.fansCount) }}</span></div>
        </div>
        <!-- 中栏 -->
        <div class="info-center">
          <div class="info-title-row">
            <img :src="getPlatformIcon(item.platform)" class="info-platform-icon" />
            <span class="info-title">{{ item.title }}</span>
          </div>
          <div class="info-content-row">
            <img :src="item.channelAvatar" class="info-cover" />
            <div class="info-content-main">
              <div v-if="item.description" class="info-desc">{{ item.description }}</div>
            </div>
          </div>
          <div class="info-actions">
            <i class="iconfont icon-like"></i>
            <i class="iconfont icon-comment"></i>
            <i class="iconfont icon-collect"></i>
            <i class="iconfont icon-delete"></i>
          </div>
          <div class="info-meta-row-bottom">
            <span>发布时间：{{ formatDateYMD(item.publishTime) }}</span>
            <span v-if="item.platform">| {{ item.platform }}</span>
          </div>
        </div>
        <!-- 竖线分割 -->
        <div class="info-divider"></div>
        <!-- 右栏 -->
        <div class="info-right">
          <div class="info-table-2col">
            <div class="info-row-2col">
              <div class="info-cell"><span class="info-label">品牌：</span><span class="info-value">{{ item.brand }}</span></div>
              <div class="info-cell"><span class="info-label">SKU：</span><span class="info-value">{{ item.sku }}</span></div>
            </div>
            <div class="info-row-2col">
              <div class="info-cell"><span class="info-label">评论数：</span><span class="info-value">{{ item.commentCount }}</span></div>
              <div class="info-cell"><span class="info-label">点赞数：</span><span class="info-value">{{ item.likeCount }}</span></div>
            </div>
            <div class="info-row-2col">
              <div class="info-cell"><span class="info-label">播放量：</span><span class="info-value">{{ item.viewCount }}</span></div>
              <div class="info-cell"><span class="info-label">情感倾向：</span><span class="info-value info-sentiment">{{ getSentimentIcon(item.sentiment) }}</span></div>
            </div>
            <div class="info-row-2col last-row">
              <div class="info-cell" style="width:100%"><span class="info-label">抓取时间：</span><span class="info-value">{{ formatDateYMD(item.crawlTime) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

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

// 选项数据
const brandOptions = ['Revopoint', 'Creality', 'Anycubic', 'Elegoo'];
const skuOptions = ['POP3', 'POP2', 'MINI', 'GO', 'PRO'];
const sentimentOptions = ['正面', '负面', '中性'];
const platformOptions = ['YouTube', 'Bilibili', '抖音', '快手', '小红书'];
const languageOptions = ['中文(简体)', '中文(繁体)', '英语', '日语', '韩语'];
const regionOptions = ['中国', '美国', '日本', '韩国', '欧洲'];
const sortOptions = ['发布时间', '观看量', '点赞数', '评论数', '分享数'];
const durationOptions = ['0-5分钟', '5-15分钟', '15-30分钟', '30分钟以上'];
const channelOptions = ['官方频道', 'KOL频道', '用户频道', '媒体频道'];
const tagOptions = ['3D打印', '扫描仪', '建模', '教程', '评测'];

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

function searchData() {
  console.log('搜索条件:', filter.value);
  // 这里添加搜索逻辑
}

// 点击外部关闭下拉框
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;

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

// 组件挂载时添加全局点击监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载时移除全局点击监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 模拟信息数据
const informationList = ref([
  {
    id: 1,
    channelName: 'Revopoint官方',
    channelAvatar: '/api/avatar/revopoint.jpg',
    channelType: 'official',
    fansCount: 125000,
    platform: 'YouTube',
    title: 'POP3 3D扫描仪开箱评测 - 超高精度扫描体验',
    description: '今天为大家带来Revopoint POP3 3D扫描仪的开箱评测，这款扫描仪具有超高精度和便携性，非常适合3D建模爱好者使用。',
    publishTime: '2024-01-15T10:30:00Z',
    brand: 'Revopoint',
    commentCount: 156,
    sku: 'POP3',
    likeCount: 2340,
    viewCount: 45600,
    sentiment: 'positive',
    crawlTime: '2024-01-15T11:00:00Z'
  },
  {
    id: 2,
    channelName: '3D打印达人',
    channelAvatar: '/api/avatar/3d-print.jpg',
    channelType: 'kol',
    fansCount: 89000,
    platform: 'Bilibili',
    title: '',
    description: 'Creality MINI打印机使用体验分享，小巧便携但功能强大，适合入门用户。',
    publishTime: '2024-01-14T15:20:00Z',
    brand: 'Creality',
    commentCount: 89,
    sku: 'MINI',
    likeCount: 1200,
    viewCount: 23400,
    sentiment: 'neutral',
    crawlTime: '2024-01-14T16:00:00Z'
  },
  {
    id: 3,
    channelName: '用户12345',
    channelAvatar: '/api/avatar/user.jpg',
    channelType: 'user',
    fansCount: 1200,
    platform: '抖音',
    title: 'Anycubic GO打印机问题求助',
    description: '我的Anycubic GO打印机最近总是出现卡料问题，有朋友遇到过类似情况吗？求解决方案。',
    publishTime: '2024-01-13T09:15:00Z',
    brand: 'Anycubic',
    commentCount: 23,
    sku: 'GO',
    likeCount: 45,
    viewCount: 1200,
    sentiment: 'negative',
    crawlTime: '2024-01-13T10:00:00Z'
  }
]);

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

// 新增日期格式化方法
function formatDateYMD(timeStr: string): string {
  const date = new Date(timeStr);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

// 获取平台图标
function getPlatformIcon(platform: string): string {
  const iconMap: Record<string, string> = {
    'YouTube': '/api/icons/youtube.png',
    'Bilibili': '/api/icons/bilibili.png',
    '抖音': '/api/icons/douyin.png',
    '快手': '/api/icons/kuaishou.png',
    '小红书': '/api/icons/xiaohongshu.png'
  };
  return iconMap[platform] || '/api/icons/default.png';
}

// 获取情感图标
function getSentimentIcon(sentiment: string): string {
  const iconMap: Record<string, string> = {
    'positive': '😊',
    'neutral': '😐',
    'negative': '😞'
  };
  return iconMap[sentiment] || '😐';
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
  padding: 0px 24px;
  align-items: stretch;
  gap: 18px;
}
.info-left {
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-left: 10px;
  margin-right: 10px;
}
.info-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: contain;
  margin-bottom: 4px;
}
.info-channel {
  font-size: 15px;
  color: #222;
  font-weight: 500;
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
  max-height: 3.2em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  position: absolute;
  bottom: 0;
  left: 0;
}
.info-meta-row-bottom span {
  white-space: pre;
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
  width: 60px;
  text-align: right;
  color: #888;
  margin-right: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.info-value {
  flex: 1 1 0;
  text-align: left;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 2px;
}
.info-sentiment {
  font-size: 18px;
  margin-left: 4px;
}
.info-divider {
  width: 1px;
  background: #e5e6eb;
  height: 80px;
  margin: 0 18px;
  align-self: center;
}
.info-right {
  min-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}
</style>
