<template>
  <div class="new-keyword-project">
    <div class="page-header">
      <h1>{{ isEditMode ? '设置项目' : '新建项目' }}</h1>
    </div>

    <div class="project-form">
      <!-- 项目名称 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">项目名称：</label>
          <el-input v-model="projectName" type="text" placeholder="请输入项目名称" />
        </div>
      </div>

      <!-- 项目类型 -->
      <div class="form-row">
        <div class="form-item">
          <label>项目类型：</label>
          <span class="form-value">社媒关键字项目</span>
        </div>
      </div>

      <!-- 搜索条数 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">帖子搜索条数：</label>
          <el-input
            v-model.number="postSearchCount"
            type="number"
            min="1"
            max="10000"
            @blur="validatePostSearchCount"
            @input="validatePostSearchCount"
          />
        </div>
        <div class="form-item">
          <label class="required">视频搜索条数：</label>
          <el-input
            v-model.number="videoSearchCount"
            type="number"
            min="1"
            max="5000"
            @blur="validateVideoSearchCount"
            @input="validateVideoSearchCount"
          />
        </div>
      </div>

      <!-- 抓取时间与频率 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">抓取时间：</label>
          <div class="custom-select">
            <div class="select-container" @click="toggleTimeRangeDropdown">
              <span class="select-value">{{ getTimeRangeLabel(crawlTimeRange) }}</span>
              <span class="dropdown-arrow" :class="{ open: timeRangeDropdownOpen }">▼</span>
            </div>
            <div v-if="timeRangeDropdownOpen" class="dropdown-options">
              <div
                v-for="option in timeRangeOptions"
                :key="option.value"
                class="dropdown-option"
                @click="selectTimeRange(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label class="required">抓取频率：</label>
          <div class="custom-select">
            <div class="select-container" @click="toggleFrequencyDropdown">
              <span class="select-value">{{ getFrequencyLabel(crawlFrequency) }}</span>
              <span class="dropdown-arrow" :class="{ open: frequencyDropdownOpen }">▼</span>
            </div>
            <div v-if="frequencyDropdownOpen" class="dropdown-options">
              <div
                v-for="option in frequencyOptions"
                :key="option.value"
                class="dropdown-option"
                @click="selectFrequency(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 抓取平台 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">抓取平台：</label>
          <el-select
            v-model="searchPlatforms"
            multiple
            clearable
            collapse-tags
            collapse-tags-tooltip
            filterable
            placeholder="请选择抓取平台"
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
              :key="platform.value"
              :label="platform.label"
              :value="platform.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 关键字表格 -->
      <div class="form-section">
        <label class="section-label required">要监控的关键字（至少一条）：</label>
        <div class="keywords-table-container">
          <table>
            <thead>
              <tr>
                <th width="35%">关键字</th>
                <th width="30%">包含</th>
                <th width="30%">不包含</th>
                <th width="5%">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(keyword, index) in keywords" :key="index">
                <td>
                  <el-input v-model="keyword.word" placeholder="关键字，逗号分隔" />
                </td>
                <td>
                  <el-input v-model="keyword.include" placeholder="必须包含的内容，逗号分隔" />
                </td>
                <td>
                  <el-input v-model="keyword.exclude" placeholder="不包含的内容，逗号分隔" />
                </td>
                <td>
                  <button class="btn-delete" @click="removeKeyword(index)">-</button>
                </td>
              </tr>
              <tr>
                <td colspan="3"></td>
                <td>
                  <button class="btn-add" @click="addKeyword">+</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 不抓取列表 -->
      <div class="form-section">
        <label class="section-label">不抓取以下视频/帖子：</label>
        <el-input
          type="textarea"
          v-model="excludeLinksText"
          @input="handleExcludeLinksChange"
          @blur="handleExcludeLinksBlur"
          placeholder="填写视频/帖子的链接，一行一个链接"
          :rows="5"
          ref="excludeLinksTextarea"
          class="exclude-links-textarea"
        />
        <!-- 可选：显示解析后的链接数量 -->
        <div v-if="excludeLinks.length > 0" class="exclude-links-count">
          已添加 {{ excludeLinks.length }} 个链接
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <div class="delete-container">
          <button
            v-if="shouldShowDeleteButton"
            class="btn-delete-project"
            :class="{ 'btn-disabled': !canClickDelete }"
            :disabled="!canClickDelete"
            @click="confirmDelete"
          >
            删除项目
          </button>
          <span v-if="shouldShowDeleteButton && !canClickDelete" class="delete-warning">
            修改时不可删除
          </span>
          <span v-else-if="shouldShowDeleteButton" class="delete-warning">
            该操作不可撤销，请谨慎操作
          </span>
        </div>
        <div class="action-buttons">
          <button v-if="shouldShowCancelButton" class="btn-cancel" @click="cancelChanges">
            取消
          </button>
          <button
            v-if="shouldShowTestButton"
            class="btn-test"
            :class="{ 'btn-testing': isSearchTesting, 'btn-disabled': searchTestButtonDisabled }"
            :disabled="searchTestButtonDisabled || isSearchTesting"
            @click="testSearch"
          >
            <span v-if="searchTestButtonDisabled">检查中...</span>
            <span v-else-if="!isSearchTesting">搜索测试</span>
            <span v-else-if="searchTestProgress">
              {{ progressDisplayText }}
            </span>
            <span v-else>启动中...</span>
          </button>
          <button
            class="btn-save"
            :class="{ 'btn-save-disabled': !canSave }"
            :disabled="!canSave"
            @click="saveProject"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  executeDataCrawlTask,
  getDataCrawlProgress,
} from '@/api/project/project'
import { ElMessage, ElMessageBox } from 'element-plus'

interface CrawlProgress {
  currentStage: string
  currentStageProgress: number
  totalProgress: number
  estimatedTimeRemaining: number
  startTime: string
  estimatedEndTime: string | null
}

export default {
  name: 'NewKeywordProjectView',
  data() {
    return {
      // 页面模式：true为编辑模式，false为新建模式
      isEditMode: false,
      // 项目状态：'creating'新建中, 'created'已创建, 'editing'编辑中, 'saved'已保存
      projectStatus: 'creating',

      projectName: '',
      projectType: 'SocialMediaKeywords',
      postSearchCount: null,
      videoSearchCount: null,
      crawlTimeRange: '',
      crawlFrequency: '',
      searchPlatforms: [],
      keywords: [{ word: '', include: '', exclude: '' }],
      excludeLinks: [], // 现在存储 ExcludedVideoLink 对象数组
      excludeLinksText: '',
      dropdownOpen: false,
      timeRangeDropdownOpen: false,
      frequencyDropdownOpen: false,

      // Element Plus 全选状态
      platformCheckAll: false,
      platformIndeterminate: false,

      // 用于检测页面变更
      hasChanges: false,
      initialFormData: null,

      // 搜索测试进度相关
      isSearchTesting: false,
      searchTestProgress: null as CrawlProgress | null,
      progressTimer: null as number | null,
      searchTestButtonDisabled: true, // 初始化时按钮禁用
      lastSearchTestTime: 0, // 上次点击搜索测试的时间戳

      // 选项数据
      timeRangeOptions: [
        { value: '168', label: '近7天' },
        { value: '720', label: '近30天' },
        { value: '2160', label: '近90天' },
        { value: '4320', label: '近180天' },
        { value: '8760', label: '近一年' },
        { value: '0', label: '不限制' },
      ],
      frequencyOptions: [
        { value: '24', label: '每天抓取' },
        { value: '168', label: '每周抓取' },
        { value: '720', label: '每月抓取' },
      ],
      platformOptions: [
        { value: 'YouTube', label: 'YouTube' },
        { value: 'X', label: 'X(Twitter)' },
        { value: 'Instagram', label: 'Instagram' },
        { value: 'Facebook', label: 'Facebook' },
      ],
    }
  },
  computed: {
    // 表单验证
    isFormValid() {
      const hasValidKeywords = this.keywords.some((keyword) => keyword.word.trim())
      return (
        this.projectName.trim() &&
        this.postSearchCount > 0 &&
        this.videoSearchCount > 0 &&
        this.crawlTimeRange &&
        this.crawlFrequency &&
        this.searchPlatforms.length > 0 &&
        hasValidKeywords
      )
    },

    // 是否可以保存
    canSave() {
      if (this.isEditMode) {
        // 编辑模式：有变更且表单有效
        return this.hasChanges && this.isFormValid
      } else {
        // 新建模式：表单有效
        return this.isFormValid
      }
    },

    // 是否显示删除按钮
    shouldShowDeleteButton() {
      return this.isEditMode || this.projectStatus === 'created'
    },

    // 是否可以点击删除
    canClickDelete() {
      return !this.hasChanges
    },

    // 是否显示取消按钮
    shouldShowCancelButton() {
      if (!this.isEditMode && this.projectStatus === 'creating') {
        // 新建模式，一直显示取消按钮
        return true
      }
      // 编辑模式或已创建，只有有变更时显示
      return this.hasChanges
    },

    // 是否显示搜索测试按钮
    shouldShowTestButton() {
      return (
        !this.hasChanges &&
        (this.projectStatus === 'created' || (this.isEditMode && !this.hasChanges))
      )
    },

    // 进度显示文本
    progressDisplayText() {
      if (this.searchTestProgress) {
        const progress = this.searchTestProgress
        return `${progress.currentStage} ${progress.totalProgress}%`
      }
      return '测试中...'
    },
  },
  watch: {
    // 添加路由监听
    $route(to, from) {
      // 当路由参数变化时重新初始化页面
      if (to.path === from.path) {
        // 停止之前的进度轮询
        this.stopProgressPolling()
        // 重置按钮状态
        this.searchTestButtonDisabled = true
        // 同一个路由但参数变化，重新初始化
        this.initializePageMode()
        // 检查新项目的搜索测试状态
        this.$nextTick(() => {
          this.checkRunningSearchTest()
        })
      }
    },
    // 监听所有可能变更的字段
    projectName() {
      this.checkForChanges()
    },
    postSearchCount() {
      this.checkForChanges()
    },
    videoSearchCount() {
      this.checkForChanges()
    },
    crawlTimeRange() {
      this.checkForChanges()
    },
    crawlFrequency() {
      this.checkForChanges()
    },
    searchPlatforms: {
      handler() {
        this.checkForChanges()
        // 更新平台全选状态
        if (this.searchPlatforms.length === 0) {
          this.platformCheckAll = false
          this.platformIndeterminate = false
        } else if (this.searchPlatforms.length === this.platformOptions.length) {
          this.platformCheckAll = true
          this.platformIndeterminate = false
        } else {
          this.platformIndeterminate = true
        }
      },
      deep: true,
    },
    keywords: {
      handler() {
        this.checkForChanges()
      },
      deep: true,
    },
    excludeLinks: {
      handler() {
        this.checkForChanges()
      },
      deep: true,
    },
  },
  mounted() {
    // 根据路由参数判断是新建还是编辑模式
    this.initializePageMode()

    // 点击外部关闭下拉框
    document.addEventListener('click', this.handleClickOutside)
    // 初始化时将 excludeLinks 数组内容显示到文本框
    this.initializeExcludeLinksText()
    // 保存初始表单数据
    this.saveInitialFormData()

    // 检查是否有正在运行的搜索测试
    this.checkRunningSearchTest()
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    // 清理进度轮询定时器
    this.stopProgressPolling()
  },
  methods: {
    // 初始化页面模式
    initializePageMode() {
      const projectId = this.$route.params.id || this.$route.query.projectId
      const isEdit = this.$route.query.isEdit === 'true'
      const newlyCreated = this.$route.query.newlyCreated === 'true'

      if (projectId && newlyCreated) {
        // 新创建的项目，设置为已创建状态，使用当前表单数据
        this.isEditMode = false
        this.projectStatus = 'created'
        // 重新保存表单数据为初始状态
        this.$nextTick(() => {
          this.saveInitialFormData()
          this.hasChanges = false
        })
      } else if (projectId && isEdit) {
        this.isEditMode = true
        this.projectStatus = 'editing'
        this.loadProjectData(projectId)
      } else {
        this.isEditMode = false
        this.projectStatus = 'creating'
        this.setDefaultValues()
      }
    },

    // 设置新建时的默认值
    setDefaultValues() {
      const projectName = this.$route.query.projectName
      this.projectName = projectName || ''
      this.postSearchCount = 100 // 默认100
      this.videoSearchCount = 100 // 默认100
      this.crawlTimeRange = '720' // 默认近30天
      this.crawlFrequency = '168' // 默认每周抓取
      this.searchPlatforms = ['YouTube', 'X', 'Instagram', 'Facebook'] // 全选平台
      this.keywords = [{ word: '', include: '', exclude: '' }]
      this.excludeLinks = [] // 空的 ExcludedVideoLink 数组
    },

    // 加载项目数据（编辑模式）
    async loadProjectData(projectId) {
      this.isLoading = true
      try {
        const response = await getProjectById(projectId)

        // 判断响应是否成功
        if (response.code === 0) {
          const project = response.data

          // 填充表单数据
          this.projectName = project.name || ''
          this.postSearchCount = project.postSearchCount || 500
          this.videoSearchCount = project.videoSearchCount || 100
          this.crawlTimeRange = String(project.fetchTime || '720')
          this.crawlFrequency = String(project.crawlFrequency || '24')
          this.searchPlatforms = project.searchPlatforms || []

          // 转换关键词格式
          this.keywords =
            project.monitorKeywords && project.monitorKeywords.length > 0
              ? project.monitorKeywords.map((kw) => ({
                  word: kw.keywords,
                  include: kw.includeWords,
                  exclude: kw.excludeWords,
                }))
              : [{ word: '', include: '', exclude: '' }]

          // 转换排除链接格式
          this.excludeLinks = project.excludedVideoLinks || []
          this.excludeLinksText = this.excludeLinks.map((link) => link.url).join('\n')

          // 重新保存初始数据
          this.$nextTick(() => {
            this.saveInitialFormData()
            this.hasChanges = false
            // 检查是否有正在运行的搜索测试
            this.checkRunningSearchTest()
          })
        } else {
          // 响应失败，显示后端返回的错误信息
          ElMessage.error(`加载项目数据失败：${response.msg}`)
          this.$router.go(-1)
        }
      } catch (error) {
        console.error('加载项目数据失败:', error)
        ElMessage.error('网络错误，请检查网络连接后重试')
        this.$router.go(-1)
      } finally {
        this.isLoading = false
      }
    },

    // 保存初始表单数据
    saveInitialFormData() {
      this.initialFormData = {
        projectName: this.projectName,
        postSearchCount: this.postSearchCount,
        videoSearchCount: this.videoSearchCount,
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        searchPlatforms: [...this.searchPlatforms],
        keywords: JSON.parse(JSON.stringify(this.keywords)),
        excludeLinks: JSON.parse(JSON.stringify(this.excludeLinks)),
      }
    },

    // 检测表单是否有变更
    checkForChanges() {
      if (!this.initialFormData) return

      const currentData = {
        projectName: this.projectName,
        postSearchCount: this.postSearchCount,
        videoSearchCount: this.videoSearchCount,
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        searchPlatforms: [...this.searchPlatforms],
        keywords: JSON.parse(JSON.stringify(this.keywords)),
        excludeLinks: JSON.parse(JSON.stringify(this.excludeLinks)),
      }

      this.hasChanges = !this.isDataEqual(this.initialFormData, currentData)

      // 如果有变更，更新项目状态
      if (this.hasChanges && this.projectStatus !== 'creating') {
        this.projectStatus = 'editing'
      }
    },

    // 深度比较两个对象是否相等
    isDataEqual(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify(obj2)
    },

    // 取消变更
    cancelChanges() {
      if (!this.isEditMode && this.projectStatus === 'creating') {
        // 新建模式的取消，返回上一页
        this.$router.go(-1)
      } else {
        // 编辑模式的取消，恢复原始数据
        if (this.initialFormData) {
          this.projectName = this.initialFormData.projectName
          this.postSearchCount = this.initialFormData.postSearchCount
          this.videoSearchCount = this.initialFormData.videoSearchCount
          this.crawlTimeRange = this.initialFormData.crawlTimeRange
          this.crawlFrequency = this.initialFormData.crawlFrequency
          this.searchPlatforms = [...this.initialFormData.searchPlatforms]
          this.keywords = JSON.parse(JSON.stringify(this.initialFormData.keywords))
          this.excludeLinks = JSON.parse(JSON.stringify(this.initialFormData.excludeLinks))
          this.excludeLinksText = this.excludeLinks.map((link) => link.url).join('\n')

          this.hasChanges = false
          this.projectStatus = this.isEditMode ? 'saved' : 'created'
        }
      }
    },

    validatePostSearchCount() {
      if (this.postSearchCount < 1) {
        this.postSearchCount = 1
      } else if (this.postSearchCount > 10000) {
        this.postSearchCount = 10000
        this.$nextTick(() => {
          ElMessage.warning('帖子搜索条数不能超过10000条')
        })
      }
    },

    validateVideoSearchCount() {
      if (this.videoSearchCount < 1) {
        this.videoSearchCount = 1
      } else if (this.videoSearchCount > 5000) {
        this.videoSearchCount = 5000
        this.$nextTick(() => {
          ElMessage.warning('视频搜索条数不能超过5000条')
        })
      }
    },

    addKeyword() {
      this.keywords.push({ word: '', include: '', exclude: '' })
    },

    removeKeyword(index) {
      this.keywords.splice(index, 1)
      if (this.keywords.length === 0) {
        this.keywords.push({ word: '', include: '', exclude: '' })
      }
    },

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
      this.timeRangeDropdownOpen = false
      this.frequencyDropdownOpen = false
    },

    toggleTimeRangeDropdown() {
      this.timeRangeDropdownOpen = !this.timeRangeDropdownOpen
      this.frequencyDropdownOpen = false
      this.dropdownOpen = false
    },

    toggleFrequencyDropdown() {
      this.frequencyDropdownOpen = !this.frequencyDropdownOpen
      this.timeRangeDropdownOpen = false
      this.dropdownOpen = false
    },

    selectTimeRange(value) {
      this.crawlTimeRange = value
      this.timeRangeDropdownOpen = false
    },

    selectFrequency(value) {
      this.crawlFrequency = value
      this.frequencyDropdownOpen = false
    },

    getTimeRangeLabel(value) {
      const option = this.timeRangeOptions.find((o) => o.value === value)
      return option ? option.label : '请选择'
    },

    getFrequencyLabel(value) {
      const option = this.frequencyOptions.find((o) => o.value === value)
      return option ? option.label : '请选择'
    },

    togglePlatform(platformValue) {
      const index = this.searchPlatforms.indexOf(platformValue)
      if (index > -1) {
        this.searchPlatforms.splice(index, 1)
      } else {
        this.searchPlatforms.push(platformValue)
      }
    },

    removePlatform(platformValue) {
      const index = this.searchPlatforms.indexOf(platformValue)
      if (index > -1) {
        this.searchPlatforms.splice(index, 1)
      }
    },

    getPlatformLabel(value) {
      const platform = this.platformOptions.find((p) => p.value === value)
      return platform ? platform.label : value
    },

    // Element Plus 全选处理函数
    handlePlatformCheckAll(val) {
      this.platformIndeterminate = false
      if (val) {
        this.searchPlatforms = this.platformOptions.map((platform) => platform.value)
      } else {
        this.searchPlatforms = []
      }
    },

    handleClickOutside(event) {
      const platformMultiselect = this.$el.querySelector('.platform-multiselect')
      const timeRangeSelects = this.$el.querySelectorAll('.custom-select')

      if (platformMultiselect && !platformMultiselect.contains(event.target)) {
        this.dropdownOpen = false
      }

      let clickedInCustomSelect = false
      timeRangeSelects.forEach((select) => {
        if (select.contains(event.target)) {
          clickedInCustomSelect = true
        }
      })

      if (!clickedInCustomSelect) {
        this.timeRangeDropdownOpen = false
        this.frequencyDropdownOpen = false
      }
    },

    initializeExcludeLinksText() {
      // 从 ExcludedVideoLink 对象数组中提取 URL 显示在文本框中
      this.excludeLinksText = this.excludeLinks.map((link) => link.url).join('\n')
      this.$nextTick(() => {
        this.autoResizeTextarea()
      })
    },

    handleExcludeLinksBlur() {
      this.validateAndUpdateExcludeLinks()
    },

    validateAndUpdateExcludeLinks() {
      // 解析文本框中的 URL，并转换为 ExcludedVideoLink 对象
      const urls = this.excludeLinksText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      // 如果没有输入任何链接，直接清空数组
      if (urls.length === 0) {
        this.excludeLinks = []
        this.$nextTick(() => {
          this.autoResizeTextarea()
        })
        return
      }

      const validLinks = []

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const platform = this.detectPlatformFromUrl(url)
        const platformID = this.generatePlatformID(url)

        // 检查平台和ID是否有效
        if (platform === 'Unknown' || !platform) {
          ElMessage.warning(`第 ${i + 1} 行的链接无法识别平台，请检查链接格式：${url}`)
          return // 停止处理，保持原有数据
        }

        if (platformID === 'unknown' || !platformID) {
          ElMessage.warning(`第 ${i + 1} 行的链接无法提取ID，请检查链接格式：${url}`)
          return // 停止处理，保持原有数据
        }

        validLinks.push({
          url: url,
          platform: platform,
          platformID: platformID,
        })
      }

      // 只有所有链接都有效时才更新数据
      this.excludeLinks = validLinks

      this.$nextTick(() => {
        this.autoResizeTextarea()
      })
    },

    handleExcludeLinksChange() {
      // 只处理文本框高度调整，不验证链接
      this.$nextTick(() => {
        this.autoResizeTextarea()
      })
    },

    // 根据 URL 检测平台
    detectPlatformFromUrl(url) {
      if (!url || typeof url !== 'string') {
        return 'Unknown'
      }

      const lowerUrl = url.toLowerCase()

      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'YouTube'
      } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
        return 'X'
      } else if (lowerUrl.includes('instagram.com')) {
        return 'Instagram'
      } else if (lowerUrl.includes('facebook.com')) {
        return 'Facebook'
      } else {
        return 'Unknown'
      }
    },

    // 生成平台ID（这里可以根据实际需求实现）
    generatePlatformID(url) {
      if (!url || typeof url !== 'string') {
        return 'unknown'
      }

      try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname

        // YouTube 处理
        if (url.includes('youtube.com/watch')) {
          const videoId = urlObj.searchParams.get('v')
          return videoId || 'unknown'
        } else if (url.includes('youtu.be')) {
          const parts = pathname.split('/')
          const videoId = parts[1]
          return videoId || 'unknown'
        }
        // Twitter/X 处理
        else if (url.includes('twitter.com') || url.includes('x.com')) {
          const parts = pathname.split('/').filter((part) => part.length > 0)
          // Twitter URL 格式通常是 /username/status/tweetId
          if (parts.length >= 3 && parts[1] === 'status') {
            return parts[2] || 'unknown'
          }
          // 或者直接取最后一部分
          return parts[parts.length - 1] || 'unknown'
        }
        // Instagram 处理
        else if (url.includes('instagram.com')) {
          const parts = pathname.split('/').filter((part) => part.length > 0)
          // Instagram URL 格式通常是 /p/postId/ 或 /reel/reelId/
          if (parts.length >= 2 && (parts[0] === 'p' || parts[0] === 'reel')) {
            return parts[1] || 'unknown'
          }
          return 'unknown'
        }
        // Facebook 处理
        else if (url.includes('facebook.com')) {
          const parts = pathname.split('/').filter((part) => part.length > 0)
          // Facebook URL 格式比较复杂，尝试提取最后的数字ID
          const lastPart = parts[parts.length - 1]
          if (lastPart && /^\d+$/.test(lastPart)) {
            return lastPart
          }
          // 如果没有找到数字ID，返回unknown
          return 'unknown'
        }

        // 其他情况，尝试提取路径最后一部分
        const lastSegment = pathname.split('/').pop()
        return lastSegment || 'unknown'
      } catch {
        // URL 格式错误
        return 'unknown'
      }
    },

    autoResizeTextarea() {
      const textarea = this.$refs.excludeLinksTextarea
      if (textarea) {
        textarea.style.height = 'auto'
        const newHeight = Math.max(100, Math.min(300, textarea.scrollHeight))
        textarea.style.height = newHeight + 'px'
      }
    },

    async saveProject() {
      if (!this.isFormValid) {
        ElMessage.warning('请填写完整的表单信息')
        return
      }

      // 构造项目数据
      const projectData = {
        name: this.projectName,
        type: this.projectType,
        postSearchCount: this.postSearchCount,
        videoSearchCount: this.videoSearchCount,
        fetchTime: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        searchPlatforms: this.searchPlatforms,
        monitorKeywords: this.keywords
          .filter((k) => k.word.trim())
          .map((kw, index) => ({
            index: index,
            keywords: kw.word,
            includeWords: kw.include,
            excludeWords: kw.exclude,
          })),
        excludedVideoLinks: this.excludeLinks,
      }

      // 如果是编辑模式，需要添加项目ID
      if (this.isEditMode) {
        const projectId = this.$route.params.id || this.$route.query.projectId
        projectData.projectId = projectId
      }

      try {
        let response

        if (this.isEditMode) {
          // 编辑模式：调用更新接口
          response = await updateProject(projectData)
        } else {
          // 新建模式：调用创建接口
          response = await createProject(projectData)
        }

        // 判断响应是否成功 - 支持多种成功码
        const isSuccess =
          response &&
          (response.code === 0 ||
            response.code === '0' ||
            response.code === 200 ||
            response.code === '200')

        if (isSuccess && response.data) {
          ElMessage.success(`项目${this.isEditMode ? '更新' : '保存'}成功！`)

          if (!this.isEditMode) {
            // 新建模式：跳转到设置页面并更新侧边栏
            const projectId = response.data.projectId || response.data.id
            const projectName = response.data.name || response.data.projectName
            const projectType = response.data.type || response.data.projectType

            // 确保projectId是字符串
            const projectIdStr = String(projectId)

            if (projectIdStr && projectIdStr !== 'undefined') {
              // 新建项目成功后，跳转到项目设置页面，但不立即进入编辑模式
              // 而是显示为"已创建"状态，避免立即重新加载可能还未完全保存的数据
              this.$router.push({
                name: 'settings',
                query: {
                  projectId: projectIdStr,
                  projectName: projectName,
                  projectType: projectType,
                  refresh: 'true',
                  page: 'settings',
                  newlyCreated: 'true', // 标记为新创建的项目
                },
              })
            } else {
              ElMessage.error('项目保存成功，但跳转失败，请手动刷新页面')
            }
          } else {
            // 编辑模式：重新保存初始数据并重置变更状态
            this.saveInitialFormData()
            this.hasChanges = false

            // 更新MainLayout中的项目选择（如果项目名称有变更）
            const projectName = response.data.name || response.data.projectName
            if (projectName) {
              this.$router.replace({
                path: this.$route.path,
                query: {
                  ...this.$route.query,
                  projectName: projectName, // 更新项目名称
                },
              })
            }
          }
        } else {
          // 保存失败，显示后端返回的错误信息
          const errorMsg = response?.msg || response?.message || '保存失败，请重试'
          ElMessage.error(`${this.isEditMode ? '更新' : '保存'}项目失败：${errorMsg}`)
        }
      } catch (error) {
        console.error(`${this.isEditMode ? '更新' : '保存'}项目失败:`, error)
        ElMessage.error('网络错误，请检查网络连接后重试')
      }
    },

    // 确认删除项目
    async confirmDelete() {
      if (!this.canClickDelete) {
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要删除项目"${this.projectName}"吗？\n该操作不可撤销，请谨慎操作！`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
        this.deleteProject()
      } catch {
        // 用户取消删除
      }
    },

    // 删除项目
    async deleteProject() {
      const projectId = this.$route.params.id || this.$route.query.projectId

      if (!projectId) {
        ElMessage.error('项目ID不存在，无法删除')
        return
      }

      try {
        const response = await deleteProject(projectId)

        if (response.code === 0) {
          ElMessage.success('项目删除成功！')
          this.$router.push({
            name: 'settings',
            query: {
              projectId: null,
              projectName: null,
              refresh: 'true',
            },
          })
        } else {
          ElMessage.error(`删除项目失败：${response.msg}`)
        }
      } catch (error) {
        console.error('删除项目失败:', error)
        ElMessage.error('网络错误，请检查网络连接后重试')
      }
    },

    // 搜索测试功能
    testSearch() {
      const currentTime = Date.now()
      const timeDiff = currentTime - this.lastSearchTestTime

      // 防止双击，至少间隔5秒
      if (timeDiff < 5000) {
        ElMessage.warning('请勿频繁点击，请等待5秒后再试')
        return
      }

      this.lastSearchTestTime = currentTime

      const projectId = this.$route.params.id || this.$route.query.projectId
      console.log('点击搜索测试按钮，项目ID:', projectId)

      if (!projectId) {
        ElMessage.error('项目ID不存在，无法执行搜索测试')
        return
      }

      // 立即设置为测试状态
      console.log('设置测试状态为true')
      this.isSearchTesting = true
      this.searchTestProgress = null
      ElMessage.success('搜索测试任务启动中...')

      // 先异步启动搜索测试任务
      console.log('先启动搜索测试任务')
      this.startSearchTestAsync(projectId)

      // 然后立即开始轮询进度
      console.log('然后立即开始轮询进度')
      this.startProgressPolling(projectId)
    },

    // 异步启动搜索测试
    async startSearchTestAsync(projectId) {
      try {
        // 启动搜索测试任务
        const response = await executeDataCrawlTask(projectId)

        if (response.code === 0) {
          console.log('搜索测试任务已启动')
          // 不需要再次启动轮询，因为已经在testSearch中启动了
        } else {
          ElMessage.error(`搜索测试启动失败：${response.msg}`)
          // 停止轮询并重置状态
          this.stopProgressPolling()
        }
      } catch (error) {
        console.error('搜索测试启动失败:', error)
        ElMessage.error('搜索测试启动失败，请检查网络连接后重试')
        // 停止轮询并重置状态
        this.stopProgressPolling()
      }
    },

    // 开始轮询进度
    startProgressPolling(projectId) {
      console.log('开始轮询搜索测试进度，项目ID:', projectId)
      // 清除之前的定时器
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
      }

      // 立即获取一次进度
      console.log('立即执行第一次进度获取')
      this.fetchProgress(projectId)

      // 每0.5秒轮询一次进度
      console.log('设置定时器，每0.5秒轮询一次')
      this.progressTimer = setInterval(() => {
        console.log('定时器触发，获取进度')
        this.fetchProgress(projectId)
      }, 500)
    },

    // 获取进度
    async fetchProgress(projectId) {
      console.log('正在获取搜索测试进度...', projectId)
      try {
        const response = await getDataCrawlProgress(projectId)
        console.log('进度响应:', response)

        if (response.code === 0) {
          if (response.data) {
            // 有数据，说明任务正在运行
            console.log('更新进度数据:', {
              阶段: response.data.currentStage,
              当前阶段进度: response.data.currentStageProgress + '%',
              总进度: response.data.totalProgress + '%',
              预计剩余时间: response.data.estimatedTimeRemaining + '秒',
              开始时间: response.data.startTime,
              预计结束时间: response.data.estimatedEndTime,
            })
            this.searchTestProgress = response.data

            // 检查是否完成（总进度达到100%）
            if (response.data.totalProgress >= 100) {
              this.stopProgressPolling()
              ElMessage.success('搜索测试完成！')
            }
          } else {
            // 返回null，说明没有任务在运行
            console.log('没有任务在运行，停止轮询')
            this.stopProgressPolling()
          }
        } else {
          // 接口调用失败
          console.error('获取搜索进度失败:', response.msg)
          this.stopProgressPolling()
        }
      } catch (error) {
        console.error('获取搜索进度异常:', error)
        // 如果获取进度失败，可能任务已完成或出错，停止轮询
        this.stopProgressPolling()
      }
    },

    // 停止轮询进度
    stopProgressPolling() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
      this.isSearchTesting = false
      this.searchTestProgress = null
      this.searchTestButtonDisabled = false
    },

    // 检查是否有正在运行的搜索测试
    async checkRunningSearchTest() {
      const projectId = this.$route.params.id || this.$route.query.projectId

      // 只有在编辑模式或已创建项目时才检查
      if (!projectId || (!this.isEditMode && this.projectStatus === 'creating')) {
        this.searchTestButtonDisabled = false
        return
      }

      try {
        const response = await getDataCrawlProgress(projectId)

        if (response.code === 0) {
          if (response.data) {
            // 有数据，检查是否还在运行中
            if (response.data.totalProgress < 100) {
              this.isSearchTesting = true
              this.searchTestProgress = response.data

              // 开始轮询进度
              this.startProgressPolling(projectId)
            } else {
              // 任务已完成，重置状态
              this.isSearchTesting = false
              this.searchTestProgress = null
            }
          } else {
            // 返回null，说明没有任务在运行
            this.isSearchTesting = false
            this.searchTestProgress = null
          }
        } else {
          // 接口调用失败，重置状态
          this.isSearchTesting = false
          this.searchTestProgress = null
        }
      } catch {
        // 如果获取进度失败，可能是没有正在运行的任务，忽略错误
        console.log('没有正在运行的搜索测试任务')
        this.isSearchTesting = false
        this.searchTestProgress = null
      } finally {
        // 无论如何都启用按钮
        this.searchTestButtonDisabled = false
      }
    },
  },
}
</script>

<style scoped>
.new-keyword-project {
  padding: 20px;
  background-color: var(--el-bg-color);
  max-width: 100%;
  overflow-x: hidden;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text);
}

.project-form {
  width: 100%;
  max-width: 1200px;
}

.form-row {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  align-items: center;
  margin-right: 30px;
  margin-bottom: 10px;
}

label {
  margin-right: 10px;
  font-weight: 500;
  width: 120px;
  text-align: right;
  flex-shrink: 0;
}

.required::after {
  content: ' *';
  color: #ff4d4f;
}

.form-value {
  color: var(--color-text);
  line-height: 36px;
}

.form-section {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: var(--color-text);
  text-align: left;
  width: auto;
}

input[type='text'],
input[type='number'] {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  transition: border-color 0.3s;
}

input[type='text']:hover,
input[type='number']:hover,
input[type='text']:focus,
input[type='number']:focus {
  border-color: #1890ff;
  outline: none;
}

.input-hint {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

/* 自定义下拉框样式 */
.custom-select {
  position: relative;
  min-width: 200px;
}

.select-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: var(--el-bg-color);
  cursor: pointer;
  transition: border-color 0.3s;
}

.select-container:hover {
  border-color: #1890ff;
}

.select-value {
  flex: 1;
  color: var(--color-text);
  font-size: 14px;
}

.custom-select .dropdown-arrow {
  transition: transform 0.3s;
  color: #999;
  font-size: 12px;
  flex-shrink: 0;
}

.custom-select .dropdown-arrow.open {
  transform: rotate(180deg);
}

.custom-select .dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--el-bg-color);
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-select .dropdown-option {
  padding: 8px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  color: #333;
}

.custom-select .dropdown-option:hover {
  background-color: #f5f5f5;
}

select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  transition: border-color 0.3s;
}

select:hover,
select:focus {
  border-color: #1890ff;
  outline: none;
}

/* 多选框样式 */
.platform-multiselect {
  position: relative;
  min-width: 200px;
  max-width: 400px;
}

.multiselect-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 36px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: var(--el-bg-color);
  cursor: pointer;
  transition: border-color 0.3s;
}

.multiselect-container:hover {
  border-color: #1890ff;
}

.selected-platforms {
  flex: 1;
  display: flex;
  align-items: flex-start;
  margin-right: 10px;
}

.placeholder {
  color: #999;
  line-height: 20px;
}

.platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
}

.platform-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background-color: #f0f2f5;
  border-radius: 3px;
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  margin-bottom: 2px;
}

.tag-close {
  margin-left: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #999;
  font-size: 14px;
}

.tag-close:hover {
  color: #ff4d4f;
}

.dropdown-arrow {
  transition: transform 0.3s;
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  flex-shrink: 0;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--el-bg-color);
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-option {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-option:hover {
  background-color: #f5f5f5;
}

.dropdown-option input {
  margin-right: 8px;
  pointer-events: none;
}

.dropdown-option label {
  margin: 0;
  cursor: pointer;
  min-width: auto;
}

.keywords-table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  table-layout: fixed;
}

th {
  text-align: left;
  padding: 10px;
  /* background-color: #f5f5f5; */
  border-bottom: 1px solid #ddd;
}

td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

td input {
  width: 95%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

td input:hover,
td input:focus {
  border-color: #1890ff;
  outline: none;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.3s;
}

textarea:hover,
textarea:focus {
  border-color: #1890ff;
  outline: none;
}

.exclude-links-textarea {
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  transition: height 0.2s ease;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  flex-wrap: wrap;
}

.exclude-links-count {
  margin-top: 5px;
  font-size: 12px;
  color: var(--color-text);
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

button {
  height: 36px;
  padding: 0 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-modify {
  background-color: #f0f0f0;
  color: #333;
  margin-left: 10px;
}

.btn-modify:hover {
  background-color: #e0e0e0;
}

.btn-delete {
  background-color: #f0f0f0;
  color: #333;
  padding: 0 10px;
  width: 28px;
}

.btn-delete:hover {
  background-color: #ffeded;
  color: #ff4d4f;
}

.btn-add {
  background-color: #f0f0f0;
  color: #333;
  padding: 0 10px;
  width: 28px;
}

.btn-add:hover {
  background-color: #e0e0e0;
}

.btn-delete-project {
  background-color: #ff4d4f;
  color: white;
}

.btn-delete-project:hover:not(:disabled) {
  background-color: #ff7875;
}

.btn-disabled {
  background-color: #d9d9d9 !important;
  color: #ffffff !important;
  cursor: not-allowed !important;
}

.delete-warning {
  font-size: 12px;
  color: #ff4d4f;
  margin-left: 10px;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-test {
  background-color: #f0f0f0;
  color: #333;
}

.btn-test:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-testing {
  background-color: #1890ff !important;
  color: white !important;
  cursor: not-allowed !important;
}

.btn-testing:hover {
  background-color: #1890ff !important;
}

.btn-save {
  background-color: #1890ff;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-save-disabled {
  background-color: #d9d9d9 !important;
  color: #ffffff !important;
  cursor: not-allowed !important;
}

.btn-save-disabled:hover {
  background-color: #d9d9d9 !important;
}

.delete-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .form-row,
  .form-actions,
  .delete-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-item {
    margin-right: 0;
    width: 100%;
  }

  .action-buttons {
    margin-top: 15px;
  }

  .delete-warning {
    margin-left: 0;
    margin-top: 5px;
  }

  .platform-multiselect,
  .custom-select {
    width: 100%;
  }

  label {
    text-align: left;
    margin-bottom: 5px;
    width: auto;
  }
}

/* Element Plus 自定义样式 */
:deep(.custom-header) {
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.custom-header .el-checkbox) {
  margin: 0;
}

:deep(.el-select-dropdown__item) {
  padding: 0 12px;
}

:deep(.el-select__tags) {
  max-width: calc(100% - 30px);
}
</style>
