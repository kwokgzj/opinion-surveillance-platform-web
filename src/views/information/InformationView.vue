<template>
  <div class="information-page">
    <!-- 筛选区域 -->
    <div class="filter-panel" v-if="!isMultiSelectMode">
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
              <el-option v-for="brand in brandOptions" :key="brand" :label="brand" :value="brand" />
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
              <el-option v-for="sku in skuOptions" :key="sku" :label="sku" :value="sku" />
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
              filterable
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
              filterable
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
        <!-- 第二行：语言、地区、搜索框、排序 -->
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>语言：</label>
            <el-select
              v-model="filter.languages"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
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
              filterable
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
          <div class="form-item search-form-item">
            <label>搜索：</label>
            <el-input v-model="filter.searchKeyword" type="text" placeholder="请输入搜索关键词" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>排序：</label>
            <el-select v-model="filter.sort" placeholder="请选择排序" style="width: 100%" clearable>
              <el-option v-for="sort in sortOptions" :key="sort" :label="sort" :value="sort" />
            </el-select>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <!-- 第三行：视频时长范围、频道、时间范围、标签 -->
        <el-col
          :xs="24"
          :sm="12"
          :md="6"
          :lg="6"
          :xl="6"
          v-if="
            projectStore.currentProjectType === 'VideoList' ||
            projectStore.currentProjectType === 'SocialMediaKeywords'
          "
        >
          <div class="form-item">
            <label>视频时长：</label>
            <div class="duration-range-container">
              <el-input-number
                v-model="filter.minDuration"
                :min="0"
                :max="99999"
                :precision="0"
                :controls="false"
                placeholder="最小分钟"
                class="duration-input"
                size="default"
              />
              <span class="duration-separator">—</span>
              <el-input-number
                v-model="filter.maxDuration"
                :min="0"
                :max="99999"
                :precision="0"
                :controls="false"
                placeholder="最大分钟"
                class="duration-input"
                size="default"
              />
              <span class="duration-unit">分钟</span>
            </div>
          </div>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
          :md="6"
          :lg="6"
          :xl="6"
          v-if="projectStore.currentProjectType !== 'GoogleNews'"
        >
          <div class="form-item">
            <label>频道：</label>
            <el-select
              v-model="filter.channels"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              placeholder="请选择频道"
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="channelCheckAll"
                  :indeterminate="channelIndeterminate"
                  @change="handleChannelCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option
                v-for="channel in channelOptions"
                :key="channel"
                :label="channel"
                :value="channel"
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
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="form-item">
            <label>标签：</label>
            <el-select
              v-model="filter.tags"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              placeholder="请选择标签"
              popper-class="custom-header"
              :max-collapse-tags="1"
              style="width: 100%"
            >
              <template #header>
                <el-checkbox
                  v-model="tagCheckAll"
                  :indeterminate="tagIndeterminate"
                  @change="handleTagCheckAll"
                >
                  全选
                </el-checkbox>
              </template>
              <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </div>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button class="btn-reset" @click="resetFilter">重置</button>
        <button class="btn-search" @click="searchData">搜索</button>
      </div>
    </div>

    <!-- 多选按钮 -->
    <div class="multiselect-toggle" v-if="!isMultiSelectMode">
      <button class="multiselect-btn" @click="toggleMultiSelectMode">批量操作</button>
    </div>

    <!-- 退出多选按钮 -->
    <div class="exit-multiselect-toggle" v-if="isMultiSelectMode">
      <button class="exit-multiselect-btn" @click="toggleMultiSelectMode">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
            fill="currentColor"
          />
        </svg>
        退出批量操作
      </button>
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

    <div v-else class="information-list" :class="{ 'multi-select-mode': isMultiSelectMode }">
      <div
        v-for="item in informationList"
        :key="item.id"
        class="info-card"
        :class="{
          'multi-select-mode': isMultiSelectMode,
          selected: isMultiSelectMode && selectedItems.includes(item.id),
        }"
        @click="isMultiSelectMode && handleCardClick(item.id)"
      >
        <!-- 多选复选框 -->
        <div v-if="isMultiSelectMode" class="info-checkbox" @click.stop>
          <el-checkbox
            :model-value="selectedItems.includes(item.id)"
            @change="toggleItemSelection(item.id)"
            class="checkbox-input"
          />
        </div>

        <!-- 左栏 -->
        <div class="info-left">
          <!-- 新闻类型特殊布局 -->
          <template v-if="isNewsType(item)">
            <img
              :src="getProxiedImageUrl(item.channelThumbnailUrl || noPictureIcon)"
              :data-original-url="item.channelThumbnailUrl"
              :data-platform="item.platform"
              class="info-logo"
              :class="{ inactive: !item.isActive }"
              @load="handleImageLoad"
              @error="handleImageError"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
              loading="lazy"
              :alt="item.channelName || '频道头像'"
            />
            <div
              class="info-channel"
              :class="{ inactive: !item.isActive }"
              :title="item.channelName"
            >
              {{ item.channelName }}
            </div>
            <div
              class="info-platform"
              :class="{ inactive: !item.isActive }"
              v-if="item.newsPlatform"
              :title="`平台：${item.newsPlatform}`"
            >
              {{ item.newsPlatform }}
            </div>
            <div class="info-fans" :class="{ inactive: !item.isActive }">
              月活：<span>{{ item.monthlyActiveUsers || '-' }}</span>
            </div>
            <div
              class="info-region"
              :class="{ inactive: !item.isActive }"
              v-if="item.newsPlatformRegion && item.newsPlatformRegion.length > 0"
              :title="`受众：${item.newsPlatformRegion.join(', ')}`"
            >
              受众：<span>{{ getDisplayRegions(item.newsPlatformRegion) }}</span>
            </div>
          </template>
          <!-- 其他类型布局 -->
          <template v-else>
            <img
              :src="getProxiedImageUrl(item.channelThumbnailUrl || noPictureIcon)"
              :data-original-url="item.channelThumbnailUrl"
              :data-platform="item.platform"
              class="info-logo"
              :class="{ inactive: !item.isActive }"
              @load="handleImageLoad"
              @error="handleImageError"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
              loading="lazy"
              :alt="item.channelName || '频道头像'"
            />
            <div
              class="info-channel"
              :class="{ inactive: !item.isActive }"
              :title="item.channelName"
            >
              {{ item.channelName }}
            </div>
            <div class="info-fans" :class="{ inactive: !item.isActive }">
              粉丝：<span>{{ formatNumber(item.subscriberCount) }}</span>
            </div>
          </template>
        </div>
        <!-- 中栏 -->
        <div class="info-center">
          <div class="info-title-row">
            <img
              :src="getPlatformIcon(item.platform)"
              class="info-platform-icon"
              @error="handleImageError"
            />
            <a
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="info-title-link"
              :class="{ inactive: !item.isActive }"
              :title="getDisplayTitle(item)"
              @click="isMultiSelectMode && $event.preventDefault()"
            >
              {{ getDisplayTitle(item) }}
            </a>
            <!-- 标签显示 -->
            <div v-if="item.labels && item.labels.length > 0" class="info-labels">
              <div v-for="label in item.labels" :key="label" class="info-label-item" :title="label">
                <img :src="tagIcon" alt="标签" class="label-icon" @error="handleImageError" />
                <span class="label-text">{{ label }}</span>
                <button
                  class="label-delete-btn"
                  @click.stop="handleDeleteLabel(item, label)"
                  title="删除标签"
                >
                  <img :src="XIcon" alt="删除" class="delete-icon" />
                </button>
              </div>
            </div>
          </div>
          <div class="info-content-row">
            <img
              v-if="item.thumbnailUrl"
              :src="getProxiedImageUrl(item.thumbnailUrl)"
              :data-original-url="item.thumbnailUrl"
              :data-platform="item.platform"
              class="info-cover"
              :class="{ inactive: !item.isActive }"
              @load="handleImageLoad"
              @error="handleImageError"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
              loading="lazy"
              :alt="item.title || '缩略图'"
            />
            <div class="info-content-main" :class="{ 'no-thumbnail': !item.thumbnailUrl }">
              <div
                v-if="hasDescriptionToShow(item)"
                class="info-desc"
                :class="{ inactive: !item.isActive }"
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
              <!-- 新闻类型特殊显示 -->
              <template v-if="isNewsType(item)">
                <span>发布时间：{{ formatDateYMD(item.publishedAt) }}</span>
                <span style="margin-left: 8px"
                  >| SU：{{ item.su || item.su === 0 ? item.su : '-' }}</span
                >
                <span v-if="item.language">| {{ getLanguageLabel(item.language) }}</span>
              </template>
              <!-- 其他类型显示 -->
              <template v-else>
                <span>发布时间：{{ formatDateYMD(item.publishedAt) }}</span>
                <span v-if="item.platform" :title="`平台：${item.platform}`"
                  >| {{ item.platform }}</span
                >
                <span v-if="item.region">| {{ getRegionLabel(item.region) }}</span>
                <span v-if="item.language">| {{ getLanguageLabel(item.language) }}</span>
                <!-- 视频类型特有的字段 -->
                <span v-if="isVideoType(item) && item.duration"
                  >| 时长：{{ formatDuration(item.duration) }}</span
                >
                <span v-if="isVideoType(item) && item.engagementRate"
                  >| 互动率：{{ item.engagementRate }}%</span
                >
                <!-- 帖子类型特有的字段 -->
                <span v-if="isPostType(item) && item.engagementRate"
                  >| 互动率：{{ item.engagementRate }}%</span
                >
              </template>
            </div>
            <div class="info-meta-actions" v-if="!isMultiSelectMode">
              <button class="action-btn tag-btn" @click="handleAddTag(item)" title="添加标签">
                <img :src="tagIcon" alt="添加标签" />
              </button>
              <button
                class="action-btn capture-btn"
                :class="{ active: item.isActive }"
                @click="handleToggleCapture(item)"
                :title="item.isActive ? '停止抓取' : '开始抓取'"
              >
                <img
                  :src="item.isActive ? captureActiveIcon : captureInactiveIcon"
                  :alt="item.isActive ? '停止抓取' : '开始抓取'"
                />
              </button>
              <button class="action-btn delete-btn" @click="handleDelete(item)" title="删除">
                <!-- <img :src="deleteIcon" alt="删除" /> -->
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </div>
        </div>
        <!-- 竖线分割 -->
        <div class="info-divider"></div>
        <!-- 右栏 -->
        <div class="info-right">
          <div class="info-table-2col">
            <!-- 新闻类型特殊布局 -->
            <template v-if="isNewsType(item)">
              <div class="info-row-2col">
                <div class="info-cell">
                  <span class="info-label">品牌：</span
                  ><span class="info-value" :title="getBrandFromContent(item)">{{
                    getBrandFromContent(item)
                  }}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">SKU：</span
                  ><span class="info-value" :title="getSkuFromContent(item)">{{
                    getSkuFromContent(item)
                  }}</span>
                </div>
              </div>
              <div class="info-row-2col">
                <div class="info-cell" style="width: 100%">
                  <span class="info-label">关键信息：</span>
                  <span class="info-value info-long-text" :title="item.keyInformation">{{
                    item.keyInformation || '-'
                  }}</span>
                </div>
              </div>
              <div class="info-row-2col">
                <div class="info-cell" style="width: 100%">
                  <span class="info-label">中文翻译：</span>
                  <span class="info-value info-long-text" :title="item.titleCN">{{
                    item.titleCN || '-'
                  }}</span>
                </div>
              </div>
              <div class="info-row-2col">
                <div class="info-cell" style="width: 100%">
                  <span class="info-label">情感倾向：</span>
                  <span class="info-value sentiment-icons-container">
                    <template
                      v-if="item.contentMentionedBrands && item.contentMentionedBrands.length > 0"
                    >
                      <img
                        v-for="brand in item.contentMentionedBrands"
                        :key="brand.brand"
                        :src="getSentimentIcon(brand.sentiment)"
                        :title="getBrandSentimentTooltip(brand)"
                        class="sentiment-icon"
                        @error="handleImageError"
                      />
                    </template>
                    <span v-else>-</span>
                  </span>
                </div>
              </div>
              <div class="info-row-2col last-row">
                <div class="info-cell" style="width: 100%">
                  <span class="info-label">抓取时间：</span>
                  <span class="info-value" :title="formatDateYMDOnly(item.captureAt)">{{
                    formatDateYMDOnly(item.captureAt)
                  }}</span>
                </div>
              </div>
            </template>
            <!-- 其他类型布局 -->
            <template v-else>
              <div class="info-row-2col">
                <div class="info-cell">
                  <span class="info-label">品牌：</span
                  ><span class="info-value" :title="getBrandFromContent(item)">{{
                    getBrandFromContent(item)
                  }}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">SKU：</span
                  ><span class="info-value" :title="getSkuFromContent(item)">{{
                    getSkuFromContent(item)
                  }}</span>
                </div>
              </div>
              <div class="info-row-2col">
                <div class="info-cell">
                  <span class="info-label">评论数：</span
                  ><span class="info-value" :title="String(item.commentCount)">{{
                    item.commentCount
                  }}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">点赞数：</span
                  ><span class="info-value" :title="String(item.likeCount)">{{
                    item.likeCount
                  }}</span>
                </div>
              </div>
              <div class="info-row-2col">
                <!-- 根据类型显示不同的字段 -->
                <div class="info-cell" v-if="isVideoType(item)">
                  <span class="info-label">播放量：</span>
                  <span class="info-value" :title="String(item.viewCount)">{{
                    item.viewCount
                  }}</span>
                </div>
                <div class="info-cell" v-else-if="isPostType(item)">
                  <span class="info-label">分享数：</span>
                  <span class="info-value" :title="String(item.shareCount)">{{
                    item.shareCount
                  }}</span>
                </div>
                <div class="info-cell" style="width: 100%">
                  <span class="info-label">情感倾向：</span>
                  <span class="info-value sentiment-icons-container">
                    <template
                      v-if="item.contentMentionedBrands && item.contentMentionedBrands.length > 0"
                    >
                      <img
                        v-for="brand in item.contentMentionedBrands"
                        :key="brand.brand"
                        :src="getSentimentIcon(brand.sentiment)"
                        :title="getBrandSentimentTooltip(brand)"
                        class="sentiment-icon"
                        @error="handleImageError"
                      />
                    </template>
                    <span v-else>-</span>
                  </span>
                </div>
              </div>
              <!-- 帖子类型特有的字段 -->
              <div class="info-row-2col" v-if="isPostType(item) && item.su">
                <div class="info-cell">
                  <span class="info-label">SU值：</span>
                  <span class="info-value" :title="String(item.su)">{{ item.su }}</span>
                </div>
              </div>
              <div class="info-row-2col last-row">
                <div class="info-cell" style="width: 100%">
                  <span class="info-label">抓取时间：</span>
                  <span class="info-value" :title="formatDateYMDOnly(item.captureAt)">{{
                    formatDateYMDOnly(item.captureAt)
                  }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div v-if="!isMultiSelectMode" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ totalCount }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页</span>
        </div>
        <div class="pagination-controls" v-if="totalPages > 1">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            上一页
          </button>

          <!-- 页码按钮 -->
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-btn page-number"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 悬浮固钉 - 多选操作栏 -->
  <div v-if="isMultiSelectMode" class="floating-action-bar">
    <div class="selection-info">
      已选择 {{ selectedItems.length }} 项
      <button class="select-all-btn" @click="toggleSelectAll">
        {{ selectedItems.length === informationList.length ? '取消全选' : '全选' }}
      </button>
    </div>
    <div class="action-buttons">
      <button
        class="action-bar-btn add-tag-btn"
        @click="handleBatchAddTag"
        :disabled="selectedItems.length === 0"
        title="加标签"
      >
        <img :src="tagIcon" alt="加标签" />
      </button>
      <button
        class="action-bar-btn capture-btn"
        @click="handleBatchSetCapture(true)"
        :disabled="selectedItems.length === 0"
        title="设置为抓取状态"
      >
        <img :src="captureActiveIcon" alt="设置为抓取状态" />
      </button>
      <button
        class="action-bar-btn no-capture-btn"
        @click="handleBatchSetCapture(false)"
        :disabled="selectedItems.length === 0"
        title="设置为不抓取状态"
      >
        <img :src="captureInactiveIcon" alt="设置为不抓取状态" />
      </button>
      <button
        class="action-bar-btn delete-btn"
        @click="handleBatchDelete"
        :disabled="selectedItems.length === 0"
        title="删除"
      >
      <el-icon><Delete /></el-icon>
        <!-- <img :src="deleteIcon" style="color: var(--color-text)" alt="删除" /> -->
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getInformationList,
  getFilterOptions,
  updateLinkActiveStatus,
  deleteProjectLink,
  updateLinksLabelsBatch,
} from '@/api/information/information'
import type {
  Information,
  InformationFilt,
  FilterOptions,
  FilterOption,
} from '@/api/information/information.type'
import { useProjectStore } from '@/stores/project'
import youtubeIcon from '@/components/icons/youtube.svg'
import googleIcon from '@/components/icons/google.svg'
import facebookIcon from '@/components/icons/facebook.svg'
import XIcon from '@/components/icons/X.svg'
import instagramIcon from '@/components/icons/instagram.svg'
import noPictureIcon from '@/components/icons/noPicture.svg'
import tagIcon from '@/components/icons/tag.svg'
import captureActiveIcon from '@/components/icons/capture-active.svg'
import captureInactiveIcon from '@/components/icons/capture-inactive.svg'
import deleteIcon from '@/components/icons/delete.svg'
import positiveIcon from '@/components/icons/positive.svg'
import neutralIcon from '@/components/icons/neutral.svg'
import negativeIcon from '@/components/icons/negative.svg'

// 使用项目store
const projectStore = useProjectStore()

// 加载状态
const loading = ref(false)
const error = ref('')

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
  count: 0,
})

const filter = ref({
  brands: [] as string[],
  skus: [] as string[],
  sentiments: [] as string[],
  platforms: [] as string[],
  languages: [] as string[],
  regions: [] as string[],
  searchKeyword: '',
  sort: '',
  minDuration: null as number | null,
  maxDuration: null as number | null,
  channels: [] as string[],
  dateRange: [] as string[],
  tags: [] as string[],
})

// 获取筛选选项
const fetchFilterOptions = async () => {
  try {
    const currentProjectId = projectStore.currentProjectId

    // 获取筛选选项前先清空现有选项
    filterOptions.value = {
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
      count: 0,
    }

    if (!currentProjectId) {
      console.warn('没有项目ID，无法获取筛选选项')
      return
    }

    const response = await getFilterOptions(currentProjectId)

    if (response) {
      filterOptions.value = response

      // 设置第一个排序选项为默认值
      if (response.sortBy && response.sortBy.length > 0 && !filter.value.sort) {
        filter.value.sort = response.sortBy[0].label
      }

      // 更新分页信息
      if (response.count !== undefined) {
        totalCount.value = response.count
        totalPages.value = Math.ceil(response.count / pageSize.value)
      }
    }
  } catch (err) {
    console.error('获取筛选选项失败:', err)
    throw new Error('获取筛选选项失败，请稍后重试')
  }
}

// 选项数据（从API获取，如果没有数据则为空）
const brandOptions = computed(() => {
  const options = filterOptions.value.brands?.map((item) => item.label) || []
  return options
})
const skuOptions = computed(() => {
  const options = filterOptions.value.skus?.map((item) => item.label) || []
  return options
})
const sentimentOptions = computed(() => {
  const options = filterOptions.value.sentiments?.map((item) => item.label) || []
  return options
})
const platformOptions = computed(() => {
  const options = filterOptions.value.platforms?.map((item) => item.label) || []
  return options
})
const languageOptions = computed(() => {
  const options = filterOptions.value.languages?.map((item) => item.label) || []
  return options
})
const regionOptions = computed(() => {
  const options = filterOptions.value.regions?.map((item) => item.label) || []
  return options
})
const sortOptions = computed(() => {
  const options = filterOptions.value.sortBy?.map((item) => item.label) || []
  return options
})

// 获取第一个排序选项的value
const firstSortValue = computed(() => {
  if (filterOptions.value.sortBy && filterOptions.value.sortBy.length > 0) {
    return filterOptions.value.sortBy[0].value
  }
  return 'publishedAt:desc' // 默认值
})
// durationOptions 已移除，现在使用用户直接输入的时长
const channelOptions = computed(() => {
  const options = filterOptions.value.channels?.map((item) => item.label) || []
  return options
})
const tagOptions = computed(() => {
  const options = filterOptions.value.labels?.map((item) => item.label) || []
  return options
})

// 全选状态计算属性 - 已移除，使用Element Plus组件

// 下拉框状态
const sortDropdownOpen = ref(false)

// 多选模式状态
const isMultiSelectMode = ref(false)
const selectedItems = ref<string[]>([])

// Element Plus 全选状态
const brandCheckAll = ref(false)
const brandIndeterminate = ref(false)
const skuCheckAll = ref(false)
const skuIndeterminate = ref(false)
const sentimentCheckAll = ref(false)
const sentimentIndeterminate = ref(false)
const platformCheckAll = ref(false)
const platformIndeterminate = ref(false)
const languageCheckAll = ref(false)
const languageIndeterminate = ref(false)
const regionCheckAll = ref(false)
const regionIndeterminate = ref(false)
const channelCheckAll = ref(false)
const channelIndeterminate = ref(false)
const tagCheckAll = ref(false)
const tagIndeterminate = ref(false)

// 品牌相关函数 - 已移除，使用Element Plus组件

// Element Plus 全选处理函数
function handleBrandCheckAll(val: boolean) {
  brandIndeterminate.value = false
  if (val) {
    filter.value.brands = [...brandOptions.value]
  } else {
    filter.value.brands = []
  }
}

function handleSkuCheckAll(val: boolean) {
  skuIndeterminate.value = false
  if (val) {
    filter.value.skus = [...skuOptions.value]
  } else {
    filter.value.skus = []
  }
}

function handleSentimentCheckAll(val: boolean) {
  sentimentIndeterminate.value = false
  if (val) {
    filter.value.sentiments = [...sentimentOptions.value]
  } else {
    filter.value.sentiments = []
  }
}

function handlePlatformCheckAll(val: boolean) {
  platformIndeterminate.value = false
  if (val) {
    filter.value.platforms = [...platformOptions.value]
  } else {
    filter.value.platforms = []
  }
}

function handleLanguageCheckAll(val: boolean) {
  languageIndeterminate.value = false
  if (val) {
    filter.value.languages = [...languageOptions.value]
  } else {
    filter.value.languages = []
  }
}

function handleRegionCheckAll(val: boolean) {
  regionIndeterminate.value = false
  if (val) {
    filter.value.regions = [...regionOptions.value]
  } else {
    filter.value.regions = []
  }
}

function handleChannelCheckAll(val: boolean) {
  channelIndeterminate.value = false
  if (val) {
    filter.value.channels = [...channelOptions.value]
  } else {
    filter.value.channels = []
  }
}

function handleTagCheckAll(val: boolean) {
  tagIndeterminate.value = false
  if (val) {
    filter.value.tags = [...tagOptions.value]
  } else {
    filter.value.tags = []
  }
}

// SKU、情感倾向、平台、语言、地区相关函数 - 已移除，使用Element Plus组件

// 排序相关函数已移除，现在使用Element UI组件

// 视频时长相关函数已移除，现在使用用户直接输入的minDuration和maxDuration

// 格式化时间为标准格式
function formatDateTime(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', dateString)
      return ''
    }

    // 格式化为标准ISO格式：YYYY-MM-DDTHH:mm:ss.SSSZ
    return date.toISOString()
  } catch (error) {
    console.error('日期格式化错误:', error, '原始值:', dateString)
    return ''
  }
}

// 分页相关计算属性
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5 // 最多显示5个页码按钮

  if (totalPages.value <= maxVisible) {
    // 如果总页数小于等于最大显示数，显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // 否则显示当前页附近的页码
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages.value, start + maxVisible - 1)

    // 调整起始位置，确保显示maxVisible个页码
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// 分页相关函数
async function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    loading.value = true
    error.value = ''

    try {
      await fetchInformationData()
    } catch (err) {
      console.error('分页切换失败:', err)
      error.value = err instanceof Error ? err.message : '分页切换失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }
}

function resetPagination() {
  currentPage.value = 1
  // 重置为筛选选项中的值
  totalCount.value = totalCountFromOptions.value
  totalPages.value = Math.ceil(totalCountFromOptions.value / pageSize.value)
}

// 频道、标签相关函数 - 已移除，使用Element Plus组件
// 全选切换函数 - 已移除，使用Element Plus组件

// 多选模式相关函数
function toggleMultiSelectMode() {
  isMultiSelectMode.value = !isMultiSelectMode.value
  if (isMultiSelectMode.value) {
    // 进入多选模式时，清空所有已选的筛选条件
    filter.value = {
      brands: [],
      skus: [],
      sentiments: [],
      platforms: [],
      languages: [],
      regions: [],
      searchKeyword: '',
      sort: '',
      minDuration: null,
      maxDuration: null,
      channels: [],
      dateRange: [],
      tags: [],
    }
    // 重置分页
    resetPagination()
    // 清空已选项目
    selectedItems.value = []
  } else {
    // 退出多选模式时，清空已选项目
    selectedItems.value = []
  }
}

// 切换单个项目的选择状态
function toggleItemSelection(itemId: string) {
  const index = selectedItems.value.indexOf(itemId)
  if (index === -1) {
    selectedItems.value.push(itemId)
  } else {
    selectedItems.value.splice(index, 1)
  }
}

// 全选/取消全选
function toggleSelectAll() {
  if (selectedItems.value.length === informationList.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = informationList.value.map((item) => item.id)
  }
}

// 处理卡片点击
function handleCardClick(itemId: string) {
  toggleItemSelection(itemId)
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
    minDuration: null,
    maxDuration: null,
    channels: [],
    dateRange: [],
    tags: [],
  }

  // 设置排序为第一个选项
  if (filterOptions.value.sortBy && filterOptions.value.sortBy.length > 0) {
    filter.value.sort = filterOptions.value.sortBy[0].label
  }

  // 重置分页
  resetPagination()
}

async function searchData() {
  // 检查排序是否已选择，如果没有选择则提醒用户
  if (!filter.value.sort) {
    ElMessage.warning('请选择排序方式')
    return
  }

  // 重置分页到第一页
  currentPage.value = 1

  loading.value = true
  error.value = ''

  try {
    await fetchInformationData()
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = err instanceof Error ? err.message : '搜索失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 点击外部关闭下拉框
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement

  // 如果点击的是链接，不处理下拉框关闭逻辑
  if (target.closest('a') || target.tagName === 'A') {
    return
  }

  // 检查点击的元素是否在下拉框内部
  if (!target.closest('.custom-select')) {
    sortDropdownOpen.value = false
  }
}

// 监听筛选条件变化，更新全选状态
watch(
  () => filter.value.brands,
  (val) => {
    if (val.length === 0) {
      brandCheckAll.value = false
      brandIndeterminate.value = false
    } else if (val.length === brandOptions.value.length) {
      brandCheckAll.value = true
      brandIndeterminate.value = false
    } else {
      brandIndeterminate.value = true
    }
  },
)

watch(
  () => filter.value.skus,
  (val) => {
    if (val.length === 0) {
      skuCheckAll.value = false
      skuIndeterminate.value = false
    } else if (val.length === skuOptions.value.length) {
      skuCheckAll.value = true
      skuIndeterminate.value = false
    } else {
      skuIndeterminate.value = true
    }
  },
)

watch(
  () => filter.value.sentiments,
  (val) => {
    if (val.length === 0) {
      sentimentCheckAll.value = false
      sentimentIndeterminate.value = false
    } else if (val.length === sentimentOptions.value.length) {
      sentimentCheckAll.value = true
      sentimentIndeterminate.value = false
    } else {
      sentimentIndeterminate.value = true
    }
  },
)

watch(
  () => filter.value.platforms,
  (val) => {
    if (val.length === 0) {
      platformCheckAll.value = false
      platformIndeterminate.value = false
    } else if (val.length === platformOptions.value.length) {
      platformCheckAll.value = true
      platformIndeterminate.value = false
    } else {
      platformIndeterminate.value = true
    }
  },
)

watch(
  () => filter.value.languages,
  (val) => {
    if (val.length === 0) {
      languageCheckAll.value = false
      languageIndeterminate.value = false
    } else if (val.length === languageOptions.value.length) {
      languageCheckAll.value = true
      languageIndeterminate.value = false
    } else {
      languageIndeterminate.value = true
    }
  },
)

watch(
  () => filter.value.regions,
  (val) => {
    if (val.length === 0) {
      regionCheckAll.value = false
      regionIndeterminate.value = false
    } else if (val.length === regionOptions.value.length) {
      regionCheckAll.value = true
      regionIndeterminate.value = false
    } else {
      regionIndeterminate.value = true
    }
  },
)

watch(
  () => filter.value.channels,
  (val) => {
    if (val.length === 0) {
      channelCheckAll.value = false
      channelIndeterminate.value = false
    } else if (val.length === channelOptions.value.length) {
      channelCheckAll.value = true
      channelIndeterminate.value = false
    } else {
      channelIndeterminate.value = true
    }
  },
)

watch(
  () => filter.value.tags,
  (val) => {
    if (val.length === 0) {
      tagCheckAll.value = false
      tagIndeterminate.value = false
    } else if (val.length === tagOptions.value.length) {
      tagCheckAll.value = true
      tagIndeterminate.value = false
    } else {
      tagIndeterminate.value = true
    }
  },
)

// 监听项目ID变化
watch(
  () => projectStore.currentProjectId,
  async (newProjectId, oldProjectId) => {
    try {
      if (newProjectId && newProjectId !== oldProjectId) {
        loading.value = true
        error.value = ''

        // 重置分页状态到第一页
        resetPagination()

        try {
          // 执行获取筛选选项
          const [filterResult] = await Promise.allSettled([
            fetchFilterOptions(),
            fetchInformationData(),
          ])

          // 检查是否有失败的请求
          const failedRequests = []
          if (filterResult.status === 'rejected') {
            console.error('获取筛选选项失败:', filterResult.reason)
            failedRequests.push('筛选选项')
          }
          // if (dataResult.status === 'rejected') {
          //   console.error('获取数据失败:', dataResult.reason)
          //   failedRequests.push('数据')
          // }

          if (failedRequests.length > 0) {
            error.value = `${failedRequests.join('和')}加载失败，请刷新重试`
          }
        } catch (err) {
          console.error('项目切换失败:', err)
          error.value = err instanceof Error ? err.message : '项目切换失败，请稍后重试'
        } finally {
          loading.value = false
        }

        // if (failedRequests.length > 0) {
        //   error.value = `${failedRequests.join('和')}加载失败，请刷新重试`
        // }
      }
    } catch (err) {
      console.error('项目切换失败:', err)
      error.value = err instanceof Error ? err.message : '项目切换失败，请稍后重试'
    } finally {
      loading.value = false
    }
  },
)

// 组件挂载时添加全局点击监听
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  // 显示初始loading状态
  loading.value = true

  // 等待一下确保项目状态已经加载
  await new Promise((resolve) => setTimeout(resolve, 100))

  try {
    // 执行获取筛选选项
    const [filterResult] = await Promise.allSettled([fetchFilterOptions(), fetchInformationData()])

    // 检查是否有失败的请求
    const failedRequests = []
    if (filterResult.status === 'rejected') {
      console.error('获取筛选选项失败:', filterResult.reason)
      failedRequests.push('筛选选项')
    }

    if (failedRequests.length > 0) {
      error.value = `${failedRequests.join('和')}加载失败，请刷新重试`
    }
  } catch (err) {
    console.error('组件初始化失败:', err)
    error.value = '页面加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
})

// 组件卸载时移除全局点击监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 信息数据
const informationList = ref<Information[]>([])

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(30) // 默认30条
const totalCount = ref(0)
const totalPages = ref(0)

// 从筛选选项中获取分页信息的计算属性
const totalCountFromOptions = computed(() => filterOptions.value.count || 0)

// 信息类型判断函数
function isVideoType(item: Information): boolean {
  return item.type === 'video'
}

function isPostType(item: Information): boolean {
  return item.type === 'post'
}

function isNewsType(item: Information): boolean {
  return item.type === 'new'
}

// 获取信息数据
const fetchInformationData = async () => {
  try {
    // 获取当前项目ID
    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      error.value = '请先选择一个项目'
      return
    }

    // 构建过滤条件 - 安全地处理筛选选项可能尚未加载的情况
    const filterParams: InformationFilt = {
      projectId: currentProjectId,
      brands: filterOptions.value.brands
        ? convertLabelsToValues(filterOptions.value.brands, filter.value.brands)
        : filter.value.brands,
      skus: filterOptions.value.skus
        ? convertLabelsToValues(filterOptions.value.skus, filter.value.skus)
        : filter.value.skus,
      platforms: filterOptions.value.platforms
        ? convertLabelsToValues(filterOptions.value.platforms, filter.value.platforms)
        : filter.value.platforms,
      sentiments: filterOptions.value.sentiments
        ? convertLabelsToValues(filterOptions.value.sentiments, filter.value.sentiments)
        : filter.value.sentiments,
      languages: filterOptions.value.languages
        ? convertLabelsToValues(filterOptions.value.languages, filter.value.languages)
        : filter.value.languages,
      regions: filterOptions.value.regions
        ? convertLabelsToValues(filterOptions.value.regions, filter.value.regions)
        : filter.value.regions,
      keyword: filter.value.searchKeyword || '',
      sortBy: filter.value.sort ? getSortValue(filter.value.sort) : firstSortValue.value,
      minDuration: filter.value.minDuration ? filter.value.minDuration * 60 : 0,
      maxDuration: filter.value.maxDuration ? filter.value.maxDuration * 60 : 0,
      channels: filterOptions.value.channels
        ? convertLabelsToValues(filterOptions.value.channels, filter.value.channels)
        : filter.value.channels,
      publishedAtStart: formatDateTime(filter.value.dateRange[0]),
      publishedAtEnd: formatDateTime(filter.value.dateRange[1]),
      labels: filterOptions.value.labels
        ? convertLabelsToValues(filterOptions.value.labels, filter.value.tags)
        : filter.value.tags,
      page: currentPage.value,
      size: pageSize.value,
    }

    const data = await getInformationList(filterParams)

    // 处理API响应格式：{ code: 0, data: { records: [...], totalCount: 239, ... }, msg: "成功" }
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      const resultData = data.data as any
      if (resultData && 'records' in resultData && 'totalCount' in resultData) {
        // 新的InformationsResult格式
        informationList.value = resultData.records || []
        totalCount.value = resultData.totalCount || 0
        totalPages.value = resultData.totalPages || Math.ceil(totalCount.value / pageSize.value)
        currentPage.value = resultData.currentPage || 1
        pageSize.value = resultData.pageSize || 30
      } else {
        // 兼容性处理：如果不是新格式，使用默认值
        informationList.value = []
        totalCount.value = totalCountFromOptions.value || 0
        totalPages.value = Math.ceil(totalCount.value / pageSize.value)
      }
    } else {
      // 兼容性处理：如果不是新格式，使用默认值
      informationList.value = []
      totalCount.value = totalCountFromOptions.value || 0
      totalPages.value = Math.ceil(totalCount.value / pageSize.value)
    }

    // 在多选模式下，如果数据发生变化，清空已选项目
    if (isMultiSelectMode.value) {
      selectedItems.value = []
    }

    // 调试：显示当前加载的平台信息
    const platforms = informationList.value
      .map((item) => item.platform)
      .filter((platform, index, self) => self.indexOf(platform) === index)
    console.log('当前加载的平台:', platforms)
    console.log('总项目数量:', informationList.value.length)
  } catch (err) {
    console.error('获取信息数据失败:', err)
    throw new Error('获取数据失败，请稍后重试')
  }
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 新增日期格式化方法
function formatDateYMD(timeStr: string): string {
  if (!timeStr) return '-'

  try {
    console.log('formatDateYMD - 原始时间字符串:', timeStr)

    // 尝试解析时间字符串
    let date: Date

    // 如果是时间戳格式
    if (/^\d{10,13}$/.test(timeStr)) {
      // 如果是10位时间戳，转换为13位
      const timestamp = timeStr.length === 10 ? parseInt(timeStr) * 1000 : parseInt(timeStr)
      date = new Date(timestamp)
    } else {
      // 处理 ISO 8601 格式，如 "2025-07-25T09:20:05+08:00"
      if (timeStr.includes('T') && (timeStr.includes('+') || timeStr.includes('Z'))) {
        // 解析ISO 8601格式并转换为北京时间显示
        date = new Date(timeStr)

        // 转换为北京时间 (UTC+8)
        const beijingTime = new Date(
          date.getTime() + 8 * 60 * 60 * 1000 + date.getTimezoneOffset() * 60 * 1000,
        )

        console.log('formatDateYMD - ISO 8601转北京时间:', {
          原始: timeStr,
          解析后UTC: date.toISOString(),
          北京时间: beijingTime.toString(),
          时区偏移: date.getTimezoneOffset(),
        })

        const result = `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')} ${String(beijingTime.getHours()).padStart(2, '0')}:${String(beijingTime.getMinutes()).padStart(2, '0')}:${String(beijingTime.getSeconds()).padStart(2, '0')}`
        console.log('formatDateYMD - 北京时间格式化结果:', result)
        return result
      }
      // 处理 CST 时间格式，如 "Thu Jul 24 19:20:05 CST 2025"
      else if (timeStr.includes('CST')) {
        // 解析 CST 时间格式: "Thu Jul 24 19:20:05 CST 2025"
        const cstRegex = /(\w{3})\s+(\w{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})\s+CST\s+(\d{4})/
        const match = timeStr.match(cstRegex)

        if (match) {
          const [, , monthStr, day, hour, minute, second, year] = match

          // 月份映射
          const monthMap: { [key: string]: number } = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          }

          const month = monthMap[monthStr]

          // CST已经是北京时间，直接创建本地时间对象
          const beijingTime = new Date(
            parseInt(year),
            month,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second),
          )

          console.log('formatDateYMD - CST时间手动解析:', {
            原始: timeStr,
            解析结果: match,
            年: year,
            月: monthStr,
            日: day,
            时: hour,
            分: minute,
            秒: second,
            最终Date对象: beijingTime,
            最终时间戳: beijingTime.getTime(),
          })

          const result = `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')} ${String(beijingTime.getHours()).padStart(2, '0')}:${String(beijingTime.getMinutes()).padStart(2, '0')}:${String(beijingTime.getSeconds()).padStart(2, '0')}`
          console.log('formatDateYMD - CST北京时间格式化结果:', result)
          return result
        } else {
          // 如果正则匹配失败，尝试移除CST后解析
          const cleanTimeStr = timeStr.replace(' CST', '')
          date = new Date(cleanTimeStr)
          console.log('formatDateYMD - CST正则匹配失败，使用简单方式解析')
        }
      } else {
        // 尝试直接解析时间字符串
        date = new Date(timeStr)
      }
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', timeStr)
      return '-'
    }

    // 转换为北京时间显示
    const beijingTime = new Date(
      date.getTime() + 8 * 60 * 60 * 1000 + date.getTimezoneOffset() * 60 * 1000,
    )

    const result = `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')} ${String(beijingTime.getHours()).padStart(2, '0')}:${String(beijingTime.getMinutes()).padStart(2, '0')}:${String(beijingTime.getSeconds()).padStart(2, '0')}`
    console.log('formatDateYMD - 北京时间格式化结果:', result)

    return result
  } catch (error) {
    console.error('日期格式化错误:', error, '原始值:', timeStr)
    return '-'
  }
}

// 只显示年月日的日期格式化方法
function formatDateYMDOnly(timeStr: string): string {
  if (!timeStr) return '-'

  try {
    // 尝试解析时间字符串
    let date: Date

    // 如果是时间戳格式
    if (/^\d{10,13}$/.test(timeStr)) {
      // 如果是10位时间戳，转换为13位
      const timestamp = timeStr.length === 10 ? parseInt(timeStr) * 1000 : parseInt(timeStr)
      date = new Date(timestamp)
    } else {
      // 处理 ISO 8601 格式，如 "2025-07-25T09:20:05+08:00"
      if (timeStr.includes('T') && (timeStr.includes('+') || timeStr.includes('Z'))) {
        // 解析ISO 8601格式并转换为北京时间显示
        date = new Date(timeStr)

        // 转换为北京时间 (UTC+8)
        const beijingTime = new Date(
          date.getTime() + 8 * 60 * 60 * 1000 + date.getTimezoneOffset() * 60 * 1000,
        )

        return `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')}`
      }
      // 处理 CST 时间格式，如 "Thu Jul 24 19:20:05 CST 2025"
      else if (timeStr.includes('CST')) {
        // 解析 CST 时间格式: "Thu Jul 24 19:20:05 CST 2025"
        const cstRegex = /(\w{3})\s+(\w{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})\s+CST\s+(\d{4})/
        const match = timeStr.match(cstRegex)

        if (match) {
          const [, , monthStr, day, hour, minute, second, year] = match

          // 月份映射
          const monthMap: { [key: string]: number } = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          }

          const month = monthMap[monthStr]

          // CST已经是北京时间，直接创建本地时间对象
          const beijingTime = new Date(
            parseInt(year),
            month,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second),
          )

          return `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')}`
        } else {
          // 如果正则匹配失败，尝试移除CST后解析
          const cleanTimeStr = timeStr.replace(' CST', '')
          date = new Date(cleanTimeStr)
        }
      } else {
        // 尝试直接解析时间字符串
        date = new Date(timeStr)
      }
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', timeStr)
      return '-'
    }

    // 转换为北京时间显示
    const beijingTime = new Date(
      date.getTime() + 8 * 60 * 60 * 1000 + date.getTimezoneOffset() * 60 * 1000,
    )

    return `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')}`
  } catch (error) {
    console.error('日期格式化错误:', error, '原始值:', timeStr)
    return '-'
  }
}

// 获取平台图标
function getPlatformIcon(platform: string): string {
  const iconMap: Record<string, string> = {
    YouTube: youtubeIcon,
    GoogleNews: googleIcon,
    Facebook: facebookIcon,
    X: XIcon,
    Instagram: instagramIcon,
  }
  return iconMap[platform] || noPictureIcon
}

// 获取情感图标
function getSentimentIcon(sentiment: number): string {
  console.log('getSentimentIcon - 输入情感分数:', sentiment)

  // 处理不同的数据格式
  let normalizedSentiment = sentiment
  if (sentiment <= 1) {
    // 如果是0-1之间的小数，转换为0-100
    normalizedSentiment = Math.round(sentiment * 100)
  }

  console.log('getSentimentIcon - 标准化后的情感分数:', normalizedSentiment)

  let str = 'Neutral'
  if (normalizedSentiment <= 40) str = 'Negative'
  if (normalizedSentiment >= 61) str = 'Positive'
  if (normalizedSentiment >= 41 && normalizedSentiment <= 60) str = 'Neutral'

  console.log('getSentimentIcon - 计算得到的情感类型:', str)

  const iconMap: Record<string, string> = {
    Positive: positiveIcon,
    Neutral: neutralIcon,
    Negative: negativeIcon,
  }
  return iconMap[str]
}

// 获取情感文本
function getSentimentText(sentiment: number): string {
  if (sentiment <= 40) return '负面'
  if (sentiment >= 61) return '正面'
  if (sentiment >= 41 && sentiment <= 60) return '中性'
  return '中性'
}

// 根据label获取对应的value
function getValueByLabel(options: FilterOption[], label: string): string {
  const option = options.find((opt) => opt.label === label)
  return option ? option.value : label
}

// 将label数组转换为value数组
function convertLabelsToValues(options: FilterOption[], labels: string[]): string[] {
  return labels.map((label) => getValueByLabel(options, label))
}

// 从内容中获取品牌信息
function getBrandFromContent(item: Information): string {
  if (item.contentMentionedBrands && item.contentMentionedBrands.length > 0) {
    return item.contentMentionedBrands.map((brand) => brand.brand).join(', ')
  }
  return '-'
}

// 从内容中获取SKU信息
function getSkuFromContent(item: Information): string {
  if (item.contentMentionedSkus && item.contentMentionedSkus.length > 0) {
    return item.contentMentionedSkus.map((sku) => sku.sku).join(', ')
  }
  return '-'
}

// 获取单个品牌的情感依据（用于单个图标tooltip）
function getBrandSentimentTooltip(brand: any): string {
  // 使用相同的标准化逻辑
  let normalizedSentiment = brand.sentiment
  if (brand.sentiment <= 1) {
    normalizedSentiment = Math.round(brand.sentiment * 100)
  }

  const sentimentText = getSentimentText(normalizedSentiment)
  return `${brand.brand}（${sentimentText}）：${brand.evidence || '无具体依据'}`
}

// 根据value获取语言的label
function getLanguageLabel(value: string): string {
  if (!value || !filterOptions.value.languages) return value
  const language = filterOptions.value.languages.find((item) => item.value === value)
  return language ? language.label : value
}

// 根据value获取地区的label
function getRegionLabel(value: string): string {
  if (!value || !filterOptions.value.regions) return value
  const region = filterOptions.value.regions.find((item) => item.value === value)
  return region ? region.label : value
}

// 获取显示的地区文本（如果太长则截断）
function getDisplayRegions(regions: string[]): string {
  if (!regions || regions.length === 0) return '-'

  const fullText = regions.join(', ')
  const maxLength = 20 // 最大显示长度

  if (fullText.length <= maxLength) {
    return fullText
  }

  // 如果太长，显示前几个地区加省略号
  let displayText = ''
  let count = 0

  for (const region of regions) {
    const testText = displayText ? `${displayText}, ${region}` : region
    if (testText.length > maxLength - 3) {
      // 为 "..." 预留3个字符
      break
    }
    displayText = testText
    count++
  }

  if (count < regions.length) {
    displayText += '...'
  }

  return displayText
}

// 根据label获取排序的value
function getSortValue(label: string): string {
  if (!label || !filterOptions.value.sortBy) return firstSortValue.value
  const sortOption = filterOptions.value.sortBy.find((item) => item.label === label)
  return sortOption ? sortOption.value : firstSortValue.value
}

// 格式化视频时长
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '-'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  } else {
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }
}

// 处理删除标签
async function handleDeleteLabel(item: Information, labelToDelete: string) {
  try {
    await ElMessageBox.confirm(`确定要删除标签"${labelToDelete}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      ElMessage.error('项目ID不存在，无法删除标签')
      return
    }

    console.log('删除标签:', {
      projectId: currentProjectId,
      linkId: item.id,
      labelToDelete: labelToDelete,
    })

    // 构建新的标签列表（移除要删除的标签）
    const currentLabels = item.labels || []
    const newLabels = currentLabels.filter((label) => label !== labelToDelete)

    const response = await updateLinksLabelsBatch(currentProjectId, [item.id], [newLabels])
    console.log('删除标签响应:', response)

    if (response) {
      if (response.code === 0 || response.success === true || response.status === 200) {
        ElMessage.success(`删除标签成功，已删除标签"${labelToDelete}"`)
        // 更新本地数据
        item.labels = newLabels
        // 重新获取数据以确保数据同步
        await fetchInformationData()
      } else {
        const errorMsg = response.message || response.msg || response.error || '未知错误'
        console.error('API返回错误:', response)
        ElMessage.error(`删除标签失败：${errorMsg}`)
      }
    } else {
      ElMessage.error('删除标签失败：响应为空')
    }
  } catch (error: any) {
    console.error('删除标签失败:', error)
    // 显示更详细的错误信息
    let errorMessage = '删除标签失败，请稍后重试'
    if (error.response) {
      errorMessage = `请求失败 (${error.response.status}): ${error.response.data?.message || error.response.statusText}`
    } else if (error.request) {
      errorMessage = '网络请求失败，请检查网络连接'
    } else if (error.message) {
      errorMessage = `请求错误: ${error.message}`
    }
    ElMessage.error(errorMessage)
  }
}

// 处理添加标签
async function handleAddTag(item: Information) {
  console.log('添加标签:', item)

  try {
    const { value: tag } = await ElMessageBox.prompt('请输入要添加的标签名称：', '添加标签', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '标签名称不能为空'
        }
        return true
      },
    })

    if (!tag || tag.trim() === '') {
      return
    }

    const trimmedTag = tag.trim()

    try {
      await ElMessageBox.confirm(`确定要为"${item.title}"添加标签"${trimmedTag}"吗？`, '确认添加', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      // 用户点击取消，直接返回，不显示错误
      return
    }

    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      ElMessage.error('项目ID不存在，无法添加标签')
      return
    }

    console.log('添加标签:', {
      projectId: currentProjectId,
      linkId: item.id,
      tag: trimmedTag,
    })

    // 构建新的标签列表
    const currentLabels = item.labels || []
    const newLabels = [...currentLabels, trimmedTag]

    const response = await updateLinksLabelsBatch(currentProjectId, [item.id], [newLabels])
    console.log('添加标签响应:', response)

    if (response) {
      if (response.code === 0 || response.success === true || response.status === 200) {
        ElMessage.success(`添加标签成功，已添加标签"${trimmedTag}"`)
        // 更新本地数据
        item.labels = newLabels
        // 重新获取数据以确保数据同步
        await fetchInformationData()
      } else {
        const errorMsg = response.message || response.msg || response.error || '未知错误'
        console.error('API返回错误:', response)
        ElMessage.error(`添加标签失败：${errorMsg}`)
      }
    } else {
      ElMessage.error('添加标签失败：响应为空')
    }
  } catch (error: any) {
    // 检查是否是用户取消操作
    if (error === 'cancel' || error.action === 'cancel') {
      // 用户点击取消，直接返回，不显示错误
      return
    }

    console.error('添加标签失败:', error)
    // 显示更详细的错误信息
    let errorMessage = '添加标签失败，请稍后重试'
    if (error.response) {
      errorMessage = `请求失败 (${error.response.status}): ${error.response.data?.message || error.response.statusText}`
    } else if (error.request) {
      errorMessage = '网络请求失败，请检查网络连接'
    } else if (error.message) {
      errorMessage = `请求错误: ${error.message}`
    }
    ElMessage.error(errorMessage)
  }
}

// 处理切换抓取状态
async function handleToggleCapture(item: Information) {
  try {
    console.log('切换抓取状态:', item)

    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      console.error('没有项目ID')
      return
    }

    // 调用API更新抓取状态
    const response = await updateLinkActiveStatus(currentProjectId, [item.id], !item.isActive)

    if (response && response.code === 0) {
      // 更新本地数据
      item.isActive = !item.isActive
      console.log('抓取状态更新成功:', item.isActive)
    } else {
      console.error('抓取状态更新失败:', response)
    }
  } catch (error) {
    console.error('切换抓取状态失败:', error)
  }
}

// 处理删除
async function handleDelete(item: Information) {
  console.log('删除项目:', item)

  try {
    await ElMessageBox.confirm('确定要删除这个信息项吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      ElMessage.error('项目ID不存在，无法删除')
      return
    }

    console.log('开始删除链接:', item.id)
    const response = await deleteProjectLink(currentProjectId, [item.id])

    if (response) {
      ElMessage.success('删除成功')
      // 重新获取数据
      fetchInformationData()
    } else {
      ElMessage.error('删除失败，请稍后重试')
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败，请稍后重试')
  }
}

// 批量添加标签
async function handleBatchAddTag() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要添加标签的项目')
    return
  }

  try {
    const { value: tag } = await ElMessageBox.prompt('请输入要添加的标签名称：', '批量添加标签', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '标签名称不能为空'
        }
        return true
      },
    })

    if (!tag || tag.trim() === '') {
      return
    }

    const trimmedTag = tag.trim()

    try {
      await ElMessageBox.confirm(
        `确定要为选中的 ${selectedItems.value.length} 项添加标签"${trimmedTag}"吗？`,
        '确认批量添加',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
    } catch {
      // 用户点击取消，直接返回，不显示错误
      return
    }

    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      ElMessage.error('项目ID不存在，无法添加标签')
      return
    }

    console.log('批量添加标签:', {
      projectId: currentProjectId,
      linkIds: selectedItems.value,
      tag: trimmedTag,
    })

    // 为每个选中的项目添加标签
    const labelsList: string[][] = []
    for (const linkId of selectedItems.value) {
      // 找到对应的信息项
      const item = informationList.value.find((info) => info.id === linkId)
      if (item) {
        // 如果项目已有标签，则添加新标签；否则创建新标签数组
        const currentLabels = item.labels || []
        const newLabels = [...currentLabels, trimmedTag]
        labelsList.push(newLabels)
      } else {
        // 如果找不到项目，则只添加新标签
        labelsList.push([trimmedTag])
      }
    }

    const response = await updateLinksLabelsBatch(currentProjectId, selectedItems.value, labelsList)
    console.log('批量添加标签响应:', response)

    if (response) {
      if (response.code === 0 || response.success === true || response.status === 200) {
        ElMessage.success(`批量添加标签成功，已添加标签"${trimmedTag}"`)
        // 清空已选项目
        selectedItems.value = []
        // 重新获取数据
        await fetchInformationData()
      } else {
        const errorMsg = response.message || response.msg || response.error || '未知错误'
        console.error('API返回错误:', response)
        ElMessage.error(`批量添加标签失败：${errorMsg}`)
      }
    } else {
      ElMessage.error('批量添加标签失败：响应为空')
    }
  } catch (error: any) {
    // 检查是否是用户取消操作
    if (error === 'cancel' || error.action === 'cancel') {
      // 用户点击取消，直接返回，不显示错误
      return
    }

    console.error('批量添加标签失败:', error)
    // 显示更详细的错误信息
    let errorMessage = '批量添加标签失败，请稍后重试'
    if (error.response) {
      errorMessage = `请求失败 (${error.response.status}): ${error.response.data?.message || error.response.statusText}`
    } else if (error.request) {
      errorMessage = '网络请求失败，请检查网络连接'
    } else if (error.message) {
      errorMessage = `请求错误: ${error.message}`
    }
    ElMessage.error(errorMessage)
  }
}

// 批量设置抓取状态
async function handleBatchSetCapture(isActive: boolean) {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要设置抓取状态的项目')
    return
  }

  const actionText = isActive ? '抓取' : '不抓取'

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedItems.value.length} 项设置为${actionText}状态吗？`,
      '确认设置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  try {
    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      ElMessage.error('项目ID不存在，无法设置抓取状态')
      return
    }

    console.log('批量设置抓取状态:', {
      projectId: currentProjectId,
      linkIds: selectedItems.value,
      isActive: isActive,
    })

    const response = await updateLinkActiveStatus(currentProjectId, selectedItems.value, isActive)
    console.log('批量设置抓取状态响应:', response)

    // 处理不同的响应格式
    if (response) {
      if (response.code === 0 || response.success === true || response.status === 200) {
        ElMessage.success(`批量设置抓取状态成功，已设置为${actionText}`)
        // 清空已选项目
        selectedItems.value = []
        // 重新获取数据
        await fetchInformationData()
      } else {
        const errorMsg = response.message || response.msg || response.error || '未知错误'
        console.error('API返回错误:', response)
        ElMessage.error(`批量设置抓取状态失败：${errorMsg}`)
      }
    } else {
      ElMessage.error('批量设置抓取状态失败：响应为空')
    }
  } catch (error: any) {
    console.error('批量设置抓取状态失败:', error)
    // 显示更详细的错误信息
    let errorMessage = '批量设置抓取状态失败，请稍后重试'
    if (error.response) {
      errorMessage = `请求失败 (${error.response.status}): ${error.response.data?.message || error.response.statusText}`
    } else if (error.request) {
      errorMessage = '网络请求失败，请检查网络连接'
    } else if (error.message) {
      errorMessage = `请求错误: ${error.message}`
    }
    ElMessage.error(errorMessage)
  }
}

// 处理图片加载错误
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  const originalUrl = target.dataset.originalUrl
  const platform = target.dataset.platform

  if (!originalUrl) {
    // 如果没有原始URL，直接显示占位符
    showImagePlaceholder(target)
    return
  }

  // 获取当前尝试次数
  const retryCount = parseInt(target.dataset.retryCount || '0')
  const maxRetries = imageProxyConfigs.length

  // 记录失败的代理
  if (retryCount > 0) {
    const failedProxyConfig = imageProxyConfigs[retryCount - 1]
    const failedProxyKey = `${failedProxyConfig.name}:${originalUrl}`
    failedProxyCache.add(failedProxyKey)

    // 更新代理统计
    const stats = proxyStats.get(failedProxyConfig.name) || { success: 0, total: 0 }
    stats.total += 1
    proxyStats.set(failedProxyConfig.name, stats)

    console.warn(`代理${failedProxyConfig.name}加载失败:`, originalUrl)
  } else {
    // 第一次失败，记录原始图片加载失败
    console.log('原始图片加载失败，开始尝试代理:', platform, originalUrl)
  }

  if (retryCount >= maxRetries) {
    // 所有代理都尝试过了，显示占位符
    console.warn('所有图片代理都失败，显示占位符:', originalUrl)
    showImagePlaceholder(target)
    return
  }

  // 尝试下一个代理
  const nextProxyConfig = imageProxyConfigs[retryCount]
  console.log(`图片加载失败，尝试第${retryCount + 1}个代理:`, nextProxyConfig.name, originalUrl)

  try {
    const nextProxiedUrl = nextProxyConfig.template(originalUrl)
    target.dataset.retryCount = String(retryCount + 1)
    target.src = nextProxiedUrl

    // 设置超时，如果这个代理也失败了会自动重试下一个
    setTimeout(() => {
      if (target.complete && target.naturalWidth === 0) {
        // 图片还是没有加载成功，触发下一次重试
        handleImageError(event)
      }
    }, nextProxyConfig.timeout)
  } catch (error) {
    console.warn(`代理${nextProxyConfig.name}配置失败:`, error)
    // 直接尝试下一个代理
    target.dataset.retryCount = String(retryCount + 1)
    setTimeout(() => handleImageError(event), 100)
  }
}

// 显示图片占位符
function showImagePlaceholder(target: HTMLImageElement) {
  target.dataset.errorHandled = 'true'

  // 根据图片类型生成不同的占位符
  const isLogo = target.classList.contains('info-logo')
  let placeholderSvg

  if (isLogo) {
    // 圆形头像占位符 - 简洁无文字版本
    placeholderSvg = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="24" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
        <circle cx="24" cy="18" r="8" fill="#ddd"/>
        <path d="M8 40c0-8.8 7.2-16 16-16s16 7.2 16 16" fill="#ddd"/>
      </svg>
    `)}`
  } else {
    // 矩形封面占位符 - 简洁无文字版本
    placeholderSvg = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="68" viewBox="0 0 120 68">
        <rect width="120" height="68" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
        <circle cx="45" cy="25" r="8" fill="#ddd"/>
        <polygon points="35,45 35,35 55,25 65,35 75,30 85,40 85,45" fill="#ddd"/>
      </svg>
    `)}`
  }

  target.src = placeholderSvg
  target.onerror = null // 清除错误处理，避免再次触发
}

// 处理图片加载成功
function handleImageLoad(event: Event) {
  const target = event.target as HTMLImageElement
  const originalUrl = target.dataset.originalUrl
  const platform = target.dataset.platform
  const retryCount = parseInt(target.dataset.retryCount || '0')

  if (originalUrl) {
    // 缓存成功的代理URL
    workingProxyCache.set(originalUrl, target.src)

    // 更新代理成功统计
    if (retryCount > 0) {
      const successProxyConfig = imageProxyConfigs[retryCount - 1]
      const stats = proxyStats.get(successProxyConfig.name) || { success: 0, total: 0 }
      stats.success += 1
      stats.total += 1
      proxyStats.set(successProxyConfig.name, stats)

      console.log(
        `代理${successProxyConfig.name}加载成功:`,
        originalUrl,
        `成功率: ${((stats.success / stats.total) * 100).toFixed(1)}%`,
      )
    } else {
      console.log('原始图片加载成功:', platform, originalUrl)
    }
  }
}

// 获取显示标题（如果没有标题则使用描述）
function getDisplayTitle(item: Information): string {
  if (item.title && item.title.trim()) {
    return item.title
  }
  if (item.description && item.description.trim()) {
    return item.description
  }
  return '暂无标题'
}

// 检查是否需要显示描述（如果标题已经是描述，则不重复显示）
function hasDescriptionToShow(item: Information): boolean {
  // 如果有标题且不为空，则显示描述
  if (item.title && item.title.trim()) {
    return !!(item.description && item.description.trim() !== '')
  }
  // 如果没有标题，描述已经作为标题显示，不再重复显示
  return false
}

// 批量删除
async function handleBatchDelete() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的项目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 项信息吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  try {
    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      ElMessage.error('项目ID不存在，无法删除')
      return
    }

    console.log('批量删除:', {
      projectId: currentProjectId,
      linkIds: selectedItems.value,
    })

    const response = await deleteProjectLink(currentProjectId, selectedItems.value)
    console.log('批量删除响应:', response)

    // 处理不同的响应格式
    if (response) {
      if (response.code === 0 || response.success === true || response.status === 200) {
        ElMessage.success('批量删除成功')
        // 清空已选项目
        selectedItems.value = []
        // 重新获取数据
        await fetchInformationData()
      } else {
        const errorMsg = response.message || response.msg || response.error || '未知错误'
        console.error('API返回错误:', response)
        ElMessage.error(`批量删除失败：${errorMsg}`)
      }
    } else {
      ElMessage.error('批量删除失败：响应为空')
    }
  } catch (error: any) {
    console.error('批量删除失败:', error)
    // 显示更详细的错误信息
    let errorMessage = '批量删除失败，请稍后重试'
    if (error.response) {
      errorMessage = `请求失败 (${error.response.status}): ${error.response.data?.message || error.response.statusText}`
    } else if (error.request) {
      errorMessage = '网络请求失败，请检查网络连接'
    } else if (error.message) {
      errorMessage = `请求错误: ${error.message}`
    }
    ElMessage.error(errorMessage)
  }
}

// 图片代理配置
const imageProxyConfigs = [
  {
    name: 'weserv',
    template: (url: string) =>
      `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=200&fit=cover&we&output=webp`,
    timeout: 3000,
    priority: 1,
  },
  {
    name: 'imageproxy',
    template: (url: string) =>
      `https://imageproxy.pimg.tw/resize?url=${encodeURIComponent(url)}&width=300&height=200`,
    timeout: 3000,
    priority: 2,
  },
  {
    name: 'allorigins',
    template: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    timeout: 5000,
    priority: 3,
  },
  {
    name: 'proxy-api',
    template: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    timeout: 5000,
    priority: 4,
  },
]

// 缓存已测试成功的代理和失败的代理
const workingProxyCache = new Map<string, string>()
const failedProxyCache = new Set<string>()

// 代理成功率统计
const proxyStats = new Map<string, { success: number; total: number }>()

// 获取图片URL（初始加载时使用原始URL）
function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) {
    return noPictureIcon
  }

  // 初始加载时直接返回原始URL，失败时由错误处理函数进行代理重试
  return originalUrl
}
</script>

<style scoped>
.information-page {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
}

/* WebKit 浏览器原生滚动条样式 */
.information-page::-webkit-scrollbar {
  width: 14px;
  background-color: transparent;
}

.information-page::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 7px;
  margin: 4px 0;
}

.information-page::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 7px;
  border: 2px solid #f5f5f5;
  background-clip: content-box;
  min-height: 30px;
}

.information-page::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.information-page::-webkit-scrollbar-thumb:active {
  background: #909399;
}

/* 支持 Firefox 的滚动条样式 */
.information-page {
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc #f5f5f5;
}

/* filter-panel 样式现在由全局样式处理 */
/* 筛选面板布局 */
.filter-panel .el-row {
  margin-bottom: 16px;
}

.filter-panel .el-row:last-child {
  margin-bottom: 0;
}

/* 确保栅格列宽度正确 */
.filter-panel .el-col {
  box-sizing: border-box;
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
  color: var(--color-text);
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}

/* 响应式标签样式 */
@media (max-width: 768px) {
  .form-item label {
    min-width: 60px;
    font-size: 13px;
  }

  .form-item {
    margin-bottom: 12px;
  }

  /* 中等屏幕下的时长选择器样式 */
  .duration-range-container {
    gap: 5px;
  }

  .duration-input {
    min-width: 55px;
    max-width: calc(50% - 18px);
  }

  .duration-input :deep(.el-input__inner) {
    font-size: 13px;
    padding: 0 7px;
  }

  .duration-separator {
    font-size: 11px;
    width: 11px;
  }

  .duration-unit {
    font-size: 11px;
    width: 26px;
  }
}

/* 确保搜索输入框不会超出容器 */
.search-form-item {
  overflow: hidden;
  min-width: 0;
}

@media (max-width: 480px) {
  .form-item label {
    min-width: 50px;
    font-size: 12px;
  }

  .form-item {
    margin-bottom: 16px;
  }

  .filter-panel .el-row {
    margin-bottom: 20px;
  }

  /* 小屏幕下的时长选择器样式 */
  .duration-range-container {
    gap: 4px;
  }

  .duration-input {
    min-width: 50px;
    max-width: calc(50% - 16px);
  }

  .duration-input :deep(.el-input__inner) {
    font-size: 13px;
    padding: 0 6px;
  }

  .duration-separator {
    font-size: 11px;
    width: 10px;
  }

  .duration-unit {
    font-size: 11px;
    width: 24px;
  }
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
  background: var(--el-bg-color);
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
  max-height: 60px;
  overflow-y: auto;
  overflow-x: hidden;
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
  background: var(--el-bg-color);
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 100%;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  /* 确保下拉框不会超出屏幕边界 */
  max-width: calc(100vw - 40px);
  /* 添加内边距，让滚动条不贴边 */
  padding: 4px 0;
}
.dropdown-option {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  min-height: 36px;
  margin: 2px 4px;
  border-radius: 4px;
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
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 20px;
}

/* 全选按钮样式 */
.select-all-option {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 500;
  min-height: 36px;
  margin: 2px 4px;
  border-radius: 4px;
}

.select-all-option:hover {
  background: #e9ecef;
}

.select-all-option input {
  margin-right: 8px;
  pointer-events: none;
}

.select-all-option label {
  margin: 0;
  cursor: pointer;
  font-size: 14px;
  color: #409eff;
}

/* 分割线样式 */
.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 6px 8px;
}

/* 自定义滚动条样式 */
.dropdown-options::-webkit-scrollbar,
.selected-items::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track,
.selected-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb,
.selected-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb:hover,
.selected-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  flex-shrink: 1;
  max-width: 100%;
  overflow: hidden;
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

/* 视频时长范围选择器样式 */
.duration-range-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.duration-input {
  flex: 1;
  min-width: 60px;
  max-width: calc(50% - 20px);
}

.duration-input :deep(.el-input__inner) {
  text-align: center;
  font-size: 14px;
  padding: 0 8px;
}

.duration-separator {
  color: #909399;
  font-weight: 500;
  flex-shrink: 0;
  font-size: 12px;
  width: 12px;
  text-align: center;
}

.duration-unit {
  color: #606266;
  font-size: 12px;
  flex-shrink: 0;
  white-space: nowrap;
  width: 28px;
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color);
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

/* 多选按钮样式 */
.multiselect-toggle {
  display: flex;
  justify-content: flex-start;
  margin: 20px 0;
  padding-left: 20px;
}

.multiselect-btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: var(--el-bg-color);
  color: #409eff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.multiselect-btn:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.multiselect-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

/* 退出多选按钮样式 */
.exit-multiselect-toggle {
  display: flex;
  justify-content: flex-start;
  margin: 20px 0;
  padding-left: 20px;
}

.exit-multiselect-btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: var(--el-bg-color);
  color: #f56c6c;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.exit-multiselect-btn:hover {
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}
.information-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 多选模式下的信息列表样式 */
.information-list.multi-select-mode {
  gap: 12px;
}
.info-card {
  display: flex;
  background: var(--el-bg-color);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0px 0px;
  align-items: stretch;
  gap: 10px;
  position: relative;
  transition: all 0.3s;
}

/* 多选模式下选中状态的样式 */
.info-card.multi-select-mode.selected {
  border: 2px solid #409eff;
}

/* 多选模式下的信息卡片基础样式 */
.info-card.multi-select-mode {
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

/* 多选模式下的鼠标样式 */
.info-card.multi-select-mode {
  cursor: pointer;
}

.info-card.multi-select-mode:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 多选复选框样式 */
.info-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.checkbox-input {
  /* Element Plus checkbox 自带样式，这里只做必要的调整 */
}

.info-left {
  min-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
  margin-bottom: 6px;
  margin-right: 10px;
  padding-left: 0; /* 默认不添加左边距 */
  flex-shrink: 0; /* 防止被压缩 */
}

/* 多选模式下的左边距调整 */
.info-card.multi-select-mode .info-left {
  padding-left: 40px; /* 为多选框留出空间 */
}

/* 多选模式下的信息卡片布局优化 */
.info-card.multi-select-mode .info-center {
  padding-bottom: 20px; /* 减少底部间距 */
}

.info-card.multi-select-mode .info-meta-row-bottom {
  position: relative;
  margin-bottom: 0;
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
  color: var(--color-text);
  font-weight: 500;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
.info-fans {
  font-size: 12px;
  color: var(--color-text);
}
.info-fans span {
  color: var(--color-text);
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
  padding-top: 4px; /* 在标题上面添加4px空白 */
  min-width: 0; /* 允许容器收缩 */
  max-width: calc(100% - 16px); /* 确保不会超出父容器 */
}
.info-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  position: relative;
  z-index: 1;
  width: 100%; /* 确保占满宽度 */
  min-width: 0; /* 允许收缩 */
}

.info-title-link {
  flex: 1;
  min-width: 0; /* 允许标题收缩 */
  max-width: calc(100% - 200px); /* 为标签预留空间 */
}

.info-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  flex-shrink: 0; /* 防止标签被压缩 */
  margin-left: auto; /* 标签靠右 */
  max-width: 300px; /* 限制标签区域宽度 */
}

.info-label-item {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 11px;
  color: #409eff;
  white-space: nowrap;
  max-width: 120px;
  overflow: visible; /* 改为visible，让删除按钮不被截断 */
  transition: all 0.2s ease;
  animation: fadeInUp 0.3s ease;
  position: relative; /* 为删除按钮定位 */
}

.info-label-item:hover {
  background: rgba(64, 158, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-label-item .label-icon {
  width: 10px;
  height: 10px;
  object-fit: contain;
  flex-shrink: 0;
}

.info-label-item .label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.info-label-item .label-delete-btn {
  display: none;
  position: absolute;
  top: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  border: none;
  background: #ff4d4f;
  border-radius: 50%;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.info-label-item .label-delete-btn:hover {
  background: #ff7875;
  transform: scale(1.1);
}

.info-label-item .delete-icon {
  width: 6px;
  height: 6px;
  object-fit: contain;
  filter: brightness(0) invert(1); /* 将图标变为白色 */
}

.info-label-item:hover .label-delete-btn {
  display: flex;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .info-label-item {
    max-width: 100px;
    font-size: 10px;
    padding: 1px 4px;
  }

  .info-label-item .label-icon {
    width: 8px;
    height: 8px;
  }

  .info-right {
    min-width: 280px;
    max-width: 320px;
  }

  .info-left {
    min-width: 140px;
  }

  .info-title-link {
    max-width: calc(100% - 160px); /* 为标签预留空间 */
  }

  .info-labels {
    max-width: 300px; /* 限制标签区域宽度 */
  }
}

@media (max-width: 768px) {
  .info-card {
    flex-direction: column;
    gap: 16px;
  }

  .info-left {
    min-width: auto;
    margin-right: 0;
    margin-bottom: 8px;
  }

  .info-right {
    min-width: auto;
    max-width: none;
    width: 100%;
    margin-left: 0; /* 移除左边距 */
  }

  .info-divider {
    display: none; /* 隐藏分割线 */
  }

  .info-title-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .info-title-link {
    max-width: 100%; /* 小屏幕下标题占满宽度 */
  }

  .info-labels {
    gap: 2px;
    margin-left: 0; /* 小屏幕下标签不靠右 */
    width: 100%; /* 占满宽度 */
    justify-content: flex-end; /* 标签靠右对齐 */
    max-width: 100%; /* 移除宽度限制 */
  }

  .info-label-item {
    max-width: auto;
    font-size: 9px;
    padding: 1px 3px;
  }

  .info-content-main {
    max-width: 100%; /* 小屏幕下内容占满宽度 */
  }

  /* 小屏幕下限制下拉框高度 */
  .dropdown-options {
    max-height: 200px;
  }
}

.info-title-link {
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.3s;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* 标题只显示一行 */
  max-width: 100%;
  min-width: 0; /* 允许标题收缩 */
  flex: 1; /* 标题占据剩余空间 */
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

/* 多选模式下的链接样式 */
.info-card.multi-select-mode .info-title-link {
  pointer-events: none;
  color: var(--color-text) !important;
  text-decoration: none !important;
}

.info-card.multi-select-mode .info-title-link:hover {
  color: var(--color-text) !important;
  text-decoration: none !important;
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
  min-width: 0; /* 允许容器收缩 */
  width: 100%; /* 确保占满宽度 */
}
.info-cover {
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
  flex-shrink: 0;
  background: #f8f9fa;
  transition:
    opacity 0.3s ease,
    filter 0.3s ease;
  position: relative;
}

.info-cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 10px 10px;
  background-position:
    0 0,
    0 5px,
    5px -5px,
    -5px 0px;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 6px;
  pointer-events: none;
}

.info-cover[src=''],
.info-cover:not([src]) {
  opacity: 0.5;
}

.info-cover[src='']:before,
.info-cover:not([src]):before {
  opacity: 0.3;
}
.info-content-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* 允许收缩 */
  max-width: calc(100% - 136px); /* 为封面图预留空间 */
}

.info-content-main.no-thumbnail {
  max-width: 100%; /* 没有缩略图时占满宽度 */
}
.info-desc {
  color: var(--color-text);
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

/* 多选模式下的操作按钮样式 */
.info-card.multi-select-mode .info-actions i {
  pointer-events: none;
  color: #b0b0b0 !important;
  cursor: default !important;
}

.info-card.multi-select-mode .info-actions i:hover {
  color: #b0b0b0 !important;
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

.action-btn .delete-btn {
  color: var(--color-text);
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.action-btn img {
  color: var(--color-text);
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
.info-table-2col {
  width: 100%;
  max-width: 380px; /* 确保不超过info-right的宽度 */
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden; /* 防止内容溢出 */
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
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 2px;
  font-size: 14px;
  max-width: 120px;
}

/* 长文本样式 - 比品牌和抓取时间更长的宽度 */
.info-long-text {
  max-width: 260px !important;
  white-space: nowrap !important;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info-sentiment {
  display: flex;
  align-items: center;
}

.sentiment-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin: 0;
}

.sentiment-icons-container {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  flex-wrap: wrap;
  max-width: 260px !important; /* 为标签留空间，适配固定宽度 */
  width: fit-content;
  overflow: hidden;
  white-space: normal !important; /* 允许换行 */
  line-height: 1.2;
  min-height: 20px;
}
.info-divider {
  width: 1px;
  background: #e5e6eb;
  height: 100px;
  margin: 0 18px;
  align-self: center;
}
.info-right {
  width: 380px; /* 固定宽度 */
  min-width: 380px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex-shrink: 0; /* 防止被压缩 */
  margin-left: 16px; /* 添加左边距 */
  overflow: hidden; /* 防止内容溢出撑宽 */
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
  background: var(--el-bg-color);
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
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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

/* 新闻类型特有的样式 */
.info-platform {
  font-size: 12px;
  color: #888;
  text-align: center;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-platform span {
  color: var(--color-text);
  font-weight: 500;
}

.info-platform.inactive {
  color: #bbb !important;
}

.info-platform.inactive span {
  color: #bbb !important;
}

.info-region {
  font-size: 12px;
  color: #888;
  text-align: center;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-region span {
  color: var(--color-text);
  font-weight: 500;
}

.info-region.inactive {
  color: #bbb !important;
}

.info-region.inactive span {
  color: #bbb !important;
}

/* 分页组件样式 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  color: var(--color-text);
  font-size: 14px;
  text-align: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  background: var(--el-bg-color);
  color: var(--color-text);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  min-width: 32px;
  text-align: center;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.pagination-btn:disabled {
  /* background: #f5f7fa; */
  color: var(--color-text);
  cursor: not-allowed;
  border-color: #e4e7ed;
}

.pagination-btn.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 悬浮固钉样式 */
.floating-action-bar {
  position: fixed;
  bottom: 30px; /* 距离底部30px */
  left: 50%; /* 水平居中 */
  right: 20px; /* 为滚动条留出空间 */
  transform: translateX(-50%); /* 水平居中 */
  background: rgba(255, 255, 255, 0.95); /* 半透明背景 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1000; /* 确保在其他元素之上 */
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 400px;
  max-width: calc(90vw - 20px); /* 为滚动条预留空间 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-action-bar {
    min-width: 300px;
    padding: 8px 16px;
    gap: 12px;
  }

  .action-buttons {
    gap: 6px;
  }

  .action-bar-btn {
    width: 36px;
    height: 36px;
  }

  .action-bar-btn img {
    width: 18px;
    height: 18px;
  }

  .selection-info {
    font-size: 12px;
    gap: 8px;
  }

  .select-all-btn {
    padding: 4px 8px;
    font-size: 11px;
  }

  /* 多选模式下的响应式设计 */
  .info-card.multi-select-mode {
    flex-direction: column;
    gap: 8px;
  }

  .info-left {
    min-width: auto;
    padding-left: 0;
    flex-direction: row;
    justify-content: center;
    gap: 16px;
  }

  .info-checkbox {
    top: 8px;
    left: 8px;
  }

  .checkbox-input {
    /* Element Plus checkbox 在移动端使用默认尺寸 */
  }
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.select-all-btn {
  padding: 6px 12px;
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 20px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.select-all-btn:hover {
  background: rgba(64, 158, 255, 0.2);
  border-color: rgba(64, 158, 255, 0.5);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-bar-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-bar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-bar-btn:disabled {
  background: rgba(245, 247, 250, 0.8);
  color: #c0c4cc;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-bar-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 不同按钮的特殊样式 */
.add-tag-btn:hover:not(:disabled) {
  background: rgba(64, 158, 255, 0.1);
}

.capture-btn:hover:not(:disabled) {
  background: rgba(103, 194, 58, 0.1);
}

.no-capture-btn:hover:not(:disabled) {
  background: rgba(230, 162, 60, 0.1);
}

.delete-btn:hover:not(:disabled) {
  background: rgba(245, 108, 108, 0.1);
}
</style>
