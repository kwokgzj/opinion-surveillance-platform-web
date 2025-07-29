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
          <input v-model="projectName" type="text" placeholder="请输入项目名称" />
        </div>
      </div>

      <!-- 项目类型 -->
      <div class="form-row">
        <div class="form-item">
          <label>项目类型：</label>
          <span class="form-value">Google新闻项目</span>
        </div>
      </div>

      <!-- 搜索条数 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">新闻搜索条数：</label>
          <input
            v-model.number="newsSearchCount"
            type="number"
            min="1"
            max="10000"
            @blur="validateNewsSearchCount"
            @input="validateNewsSearchCount"
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
              <span class="dropdown-arrow" :class="{ 'open': timeRangeDropdownOpen }">▼</span>
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
              <span class="dropdown-arrow" :class="{ 'open': frequencyDropdownOpen }">▼</span>
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

      <!-- 语言选择 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">语言：</label>
          <el-select
            v-model="selectedLanguages"
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
              :key="language.value"
              :label="language.label"
              :value="language.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 地区选择 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">地区：</label>
          <el-select
            v-model="selectedRegions"
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
              :key="region.value"
              :label="region.label"
              :value="region.value"
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
                  <input
                    v-model="keyword.word"
                    placeholder="关键字，逗号分隔"
                  />
                </td>
                <td>
                  <input v-model="keyword.include" placeholder="必须包含的内容，逗号分隔" />
                </td>
                <td>
                  <input v-model="keyword.exclude" placeholder="不包含的内容，逗号分隔" />
                </td>
                <td>
                  <button class="btn-delete" @click="removeKeyword(index)">-</button>
                </td>
              </tr>
              <tr>
                <td colspan="3">
                </td>
                <td>
                  <button class="btn-add" @click="addKeyword">+</button>
                </td>
              </tr>
            </tbody>
          </table>
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
          <button
            v-if="shouldShowCancelButton"
            class="btn-cancel"
            @click="cancelChanges"
          >
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
import { createProject, getProjectById, updateProject, deleteProject, executeDataCrawlTask, getDataCrawlProgress } from '@/api/project/project';
import { ElMessage, ElMessageBox } from 'element-plus';

interface CrawlProgress {
  currentStage: string;
  currentStageProgress: number;
  totalProgress: number;
  estimatedTimeRemaining: number;
  startTime: string;
  estimatedEndTime: string | null;
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
      projectType: 'GoogleNews',
      newsSearchCount: null,
      crawlTimeRange: '',
      crawlFrequency: '',
      selectedLanguages: [],
      selectedRegions: [],
      keywords: [
        { word: '', include: '', exclude: '' }
      ],
      languageDropdownOpen: false,
      regionDropdownOpen: false,
      timeRangeDropdownOpen: false,
      frequencyDropdownOpen: false,

      // Element Plus 全选状态
      languageCheckAll: false,
      languageIndeterminate: false,
      regionCheckAll: false,
      regionIndeterminate: false,

      // 用于检测页面变更
      hasChanges: false,
      initialFormData: null,

      // 搜索测试进度相关
      isSearchTesting: false,
      searchTestProgress: null as CrawlProgress | null,
      progressTimer: null as number | null,
      searchTestButtonDisabled: true, // 初始化时按钮禁用

      // 选项数据
      timeRangeOptions: [
        { value: '720', label: '近30天' },
        { value: '2160', label: '近90天' },
        { value: '4320', label: '近180天' },
        { value: '8760', label: '近一年' },
        { value: '0', label: '不限制' },
      ],
      frequencyOptions: [
        { value: '24', label: '每天抓取' },
        { value: '168', label: '每周抓取' },
        { value: '720', label: '每月抓取' }
      ],
      languageOptions: [
        { value: 'zh-CN', label: '中文(简体)' },
        { value: 'zh-TW', label: '中文(繁体)' },
        { value: 'en', label: '英语' },
        { value: 'ja', label: '日语' },
        { value: 'ko', label: '韩语' },
        { value: 'fr', label: '法语' },
        { value: 'de', label: '德语' },
        { value: 'es', label: '西班牙语' },
        { value: 'ru', label: '俄语' },
        { value: 'ar', label: '阿拉伯语' }
      ],
      regionOptions: [
        { value: 'CN', label: '中国' },
        { value: 'US', label: '美国' },
        { value: 'GB', label: '英国' },
        { value: 'JP', label: '日本' },
        { value: 'KR', label: '韩国' },
        { value: 'FR', label: '法国' },
        { value: 'DE', label: '德国' },
        { value: 'CA', label: '加拿大' },
        { value: 'AU', label: '澳大利亚' },
        { value: 'IN', label: '印度' }
      ]
    }
  },
  computed: {
    // 表单验证
    isFormValid() {
      const hasValidKeywords = this.keywords.some(keyword => keyword.word.trim());
      return this.projectName.trim() &&
             this.newsSearchCount > 0 &&
             this.crawlTimeRange &&
             this.crawlFrequency &&
             this.selectedLanguages.length > 0 &&
             this.selectedRegions.length > 0 &&
             hasValidKeywords;
    },

    // 是否可以保存
    canSave() {
      if (this.isEditMode) {
        // 编辑模式：有变更且表单有效
        return this.hasChanges && this.isFormValid;
      } else {
        // 新建模式：表单有效
        return this.isFormValid;
      }
    },

    // 是否显示删除按钮
    shouldShowDeleteButton() {
      return this.isEditMode || this.projectStatus === 'created';
    },

    // 是否可以点击删除
    canClickDelete() {
      return !this.hasChanges;
    },

    // 是否显示取消按钮
    shouldShowCancelButton() {
      if (!this.isEditMode && this.projectStatus === 'creating') {
        // 新建模式，一直显示取消按钮
        return true;
      }
      // 编辑模式或已创建，只有有变更时显示
      return this.hasChanges;
    },

    // 是否显示搜索测试按钮
    shouldShowTestButton() {
      return !this.hasChanges && (this.projectStatus === 'created' || (this.isEditMode && !this.hasChanges));
    },

    // 进度显示文本
    progressDisplayText() {
      if (this.searchTestProgress) {
        const progress = this.searchTestProgress;
        return `${progress.currentStage} ${progress.totalProgress}%`;
      }
      return '测试中...';
    }
  },
  watch: {
    // 添加路由监听
    '$route'(to, from) {
      console.log('路由变化:', { to, from });
      if (to.path === from.path) {
        this.initializePageMode();
      }
    },
    // 监听所有可能变更的字段
    projectName() {
      this.checkForChanges();
    },
    newsSearchCount() {
      this.checkForChanges();
    },
    crawlTimeRange() {
      this.checkForChanges();
    },
    crawlFrequency() {
      this.checkForChanges();
    },
    selectedLanguages: {
      handler() {
        this.checkForChanges();
        // 更新语言全选状态
        if (this.selectedLanguages.length === 0) {
          this.languageCheckAll = false;
          this.languageIndeterminate = false;
        } else if (this.selectedLanguages.length === this.languageOptions.length) {
          this.languageCheckAll = true;
          this.languageIndeterminate = false;
        } else {
          this.languageIndeterminate = true;
        }
      },
      deep: true
    },
    selectedRegions: {
      handler() {
        this.checkForChanges();
        // 更新地区全选状态
        if (this.selectedRegions.length === 0) {
          this.regionCheckAll = false;
          this.regionIndeterminate = false;
        } else if (this.selectedRegions.length === this.regionOptions.length) {
          this.regionCheckAll = true;
          this.regionIndeterminate = false;
        } else {
          this.regionIndeterminate = true;
        }
      },
      deep: true
    },
    keywords: {
      handler() {
        this.checkForChanges();
      },
      deep: true
    }
  },
  mounted() {
    // 根据路由参数判断是新建还是编辑模式
    this.initializePageMode();

    // 点击外部关闭下拉框
    document.addEventListener('click', this.handleClickOutside);
    // 保存初始表单数据
    this.saveInitialFormData();
    
    // 检查是否有正在运行的搜索测试
    this.checkRunningSearchTest();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    // 清理进度轮询定时器
    this.stopProgressPolling();
  },
  methods: {
    // 初始化页面模式
    initializePageMode() {
      const projectId = this.$route.params.id || this.$route.query.projectId;
      const isEdit = this.$route.query.isEdit === 'true';
      const newlyCreated = this.$route.query.newlyCreated === 'true';

      if (projectId && newlyCreated) {
        this.isEditMode = false;
        this.projectStatus = 'created';
        this.$nextTick(() => {
          this.saveInitialFormData();
          this.hasChanges = false;
        });
      } else if (projectId && projectId !== 'new' && isEdit) {
        this.isEditMode = true;
        this.projectStatus = 'editing';
        this.loadProjectData(projectId);
      } else {
        this.isEditMode = false;
        this.projectStatus = 'creating';
        this.setDefaultValues();
      }
    },

    // 设置新建时的默认值
    setDefaultValues() {
    const projectName = this.$route.query.projectName;
    this.projectName = projectName || '';
    this.newsSearchCount = 500; // 默认500
    this.crawlTimeRange = '720'; // 默认近30天
    this.crawlFrequency = '24'; // 默认每天抓取
    this.selectedLanguages = ['zh-CN']; // 默认中文简体
    this.selectedRegions = ['CN']; // 默认中国
    this.keywords = [{ word: '', include: '', exclude: '' }];
  },

    // 加载项目数据（编辑模式）
    async loadProjectData(projectId) {
      this.isLoading = true;
      try {
        const response = await getProjectById(projectId);

        if (response.code === 0) {
          const project = response.data;

          // 填充表单数据
          this.projectName = project.name || '';
          this.newsSearchCount = project.newsSearchCount || 500;
          this.crawlTimeRange = String(project.fetchTime || '720');
          this.crawlFrequency = String(project.crawlFrequency || '24');
          this.selectedLanguages = project.searchLanguages || ['zh-CN'];
          this.selectedRegions = project.searchRegions || ['CN'];

          // 转换关键词格式
          this.keywords = project.monitorKeywords && project.monitorKeywords.length > 0
            ? project.monitorKeywords.map(kw => ({
                word: kw.keywords,
                include: kw.includeWords,
                exclude: kw.excludeWords
              }))
            : [{ word: '', include: '', exclude: '' }];

          this.$nextTick(() => {
            this.saveInitialFormData();
            this.hasChanges = false;
          });

        } else {
          ElMessage.error(`加载项目数据失败：${response.msg}`);
          this.$router.go(-1);
        }

      } catch (error) {
        console.error('加载项目数据失败:', error);
        ElMessage.error('网络错误，请检查网络连接后重试');
        this.$router.go(-1);
      } finally {
        this.isLoading = false;
      }
    },

    // 保存初始表单数据
    saveInitialFormData() {
      this.initialFormData = {
        projectName: this.projectName,
        newsSearchCount: this.newsSearchCount,
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        selectedLanguages: [...this.selectedLanguages],
        selectedRegions: [...this.selectedRegions],
        keywords: JSON.parse(JSON.stringify(this.keywords))
      };
    },

    // 检测表单是否有变更
    checkForChanges() {
      if (!this.initialFormData) return;

      const currentData = {
        projectName: this.projectName,
        newsSearchCount: this.newsSearchCount,
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        selectedLanguages: [...this.selectedLanguages],
        selectedRegions: [...this.selectedRegions],
        keywords: JSON.parse(JSON.stringify(this.keywords))
      };

      this.hasChanges = !this.isDataEqual(this.initialFormData, currentData);

      // 如果有变更，更新项目状态
      if (this.hasChanges && this.projectStatus !== 'creating') {
        this.projectStatus = 'editing';
      }
    },

    // 深度比较两个对象是否相等
    isDataEqual(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    },

    // 取消变更
    cancelChanges() {
      if (!this.isEditMode && this.projectStatus === 'creating') {
        // 新建模式的取消，返回上一页
        this.$router.go(-1);
      } else {
        // 编辑模式的取消，恢复原始数据
        if (this.initialFormData) {
          this.projectName = this.initialFormData.projectName;
          this.newsSearchCount = this.initialFormData.newsSearchCount;
          this.crawlTimeRange = this.initialFormData.crawlTimeRange;
          this.crawlFrequency = this.initialFormData.crawlFrequency;
          this.selectedLanguages = [...this.initialFormData.selectedLanguages];
          this.selectedRegions = [...this.initialFormData.selectedRegions];
          this.keywords = JSON.parse(JSON.stringify(this.initialFormData.keywords));

          this.hasChanges = false;
          this.projectStatus = this.isEditMode ? 'saved' : 'created';
        }
      }
    },

    validateNewsSearchCount() {
      if (this.newsSearchCount < 1) {
        this.newsSearchCount = 1;
      } else if (this.newsSearchCount > 10000) {
        this.newsSearchCount = 10000;
        this.$nextTick(() => {
          ElMessage.warning('新闻搜索条数不能超过10000条');
        });
      }
    },
    addKeyword() {
      this.keywords.push({ word: '', include: '', exclude: '' });
    },
    removeKeyword(index) {
      this.keywords.splice(index, 1);
      if (this.keywords.length === 0) {
        this.keywords.push({ word: '', include: '', exclude: '' });
      }
    },
    toggleLanguageDropdown() {
      this.languageDropdownOpen = !this.languageDropdownOpen;
      this.regionDropdownOpen = false;
      this.timeRangeDropdownOpen = false;
      this.frequencyDropdownOpen = false;
    },
    toggleRegionDropdown() {
      this.regionDropdownOpen = !this.regionDropdownOpen;
      this.languageDropdownOpen = false;
      this.timeRangeDropdownOpen = false;
      this.frequencyDropdownOpen = false;
    },
    toggleTimeRangeDropdown() {
      this.timeRangeDropdownOpen = !this.timeRangeDropdownOpen;
      this.frequencyDropdownOpen = false;
      this.languageDropdownOpen = false;
      this.regionDropdownOpen = false;
    },
    toggleFrequencyDropdown() {
      this.frequencyDropdownOpen = !this.frequencyDropdownOpen;
      this.timeRangeDropdownOpen = false;
      this.languageDropdownOpen = false;
      this.regionDropdownOpen = false;
    },
    selectTimeRange(value) {
      this.crawlTimeRange = value;
      this.timeRangeDropdownOpen = false;
    },
    selectFrequency(value) {
      this.crawlFrequency = value;
      this.frequencyDropdownOpen = false;
    },
    getTimeRangeLabel(value) {
      const option = this.timeRangeOptions.find(o => o.value === value);
      return option ? option.label : '请选择';
    },
    getFrequencyLabel(value) {
      const option = this.frequencyOptions.find(o => o.value === value);
      return option ? option.label : '请选择';
    },
    toggleLanguage(languageValue) {
      const index = this.selectedLanguages.indexOf(languageValue);
      if (index > -1) {
        this.selectedLanguages.splice(index, 1);
      } else {
        this.selectedLanguages.push(languageValue);
      }
    },
    removeLanguage(languageValue) {
      const index = this.selectedLanguages.indexOf(languageValue);
      if (index > -1) {
        this.selectedLanguages.splice(index, 1);
      }
    },
    getLanguageLabel(value) {
      const language = this.languageOptions.find(l => l.value === value);
      return language ? language.label : value;
    },
    toggleRegion(regionValue) {
      const index = this.selectedRegions.indexOf(regionValue);
      if (index > -1) {
        this.selectedRegions.splice(index, 1);
      } else {
        this.selectedRegions.push(regionValue);
      }
    },
    removeRegion(regionValue) {
      const index = this.selectedRegions.indexOf(regionValue);
      if (index > -1) {
        this.selectedRegions.splice(index, 1);
      }
    },
    getRegionLabel(value) {
      const region = this.regionOptions.find(r => r.value === value);
      return region ? region.label : value;
    },

    // Element Plus 全选处理函数
    handleLanguageCheckAll(val) {
      this.languageIndeterminate = false;
      if (val) {
        this.selectedLanguages = this.languageOptions.map(lang => lang.value);
      } else {
        this.selectedLanguages = [];
      }
    },

    handleRegionCheckAll(val) {
      this.regionIndeterminate = false;
      if (val) {
        this.selectedRegions = this.regionOptions.map(region => region.value);
      } else {
        this.selectedRegions = [];
      }
    },
    handleClickOutside(event) {
      const languageMultiselect = this.$el.querySelector('.language-multiselect');
      const regionMultiselect = this.$el.querySelector('.region-multiselect');
      const timeRangeSelects = this.$el.querySelectorAll('.custom-select');

      if (languageMultiselect && !languageMultiselect.contains(event.target)) {
        this.languageDropdownOpen = false;
      }

      if (regionMultiselect && !regionMultiselect.contains(event.target)) {
        this.regionDropdownOpen = false;
      }

      let clickedInCustomSelect = false;
      timeRangeSelects.forEach(select => {
        if (select.contains(event.target)) {
          clickedInCustomSelect = true;
        }
      });

      if (!clickedInCustomSelect) {
        this.timeRangeDropdownOpen = false;
        this.frequencyDropdownOpen = false;
      }
    },

    async saveProject() {
      if (!this.isFormValid) {
        ElMessage.warning('请填写完整的表单信息');
        return;
      }

      const projectData = {
        name: this.projectName,
        type: this.projectType,
        newsSearchCount: this.newsSearchCount,
        fetchTime: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        searchLanguages: this.selectedLanguages,
        searchRegions: this.selectedRegions,
        monitorKeywords: this.keywords.filter(k => k.word.trim()).map((kw, index) => ({
          index: index,
          keywords: kw.word,
          includeWords: kw.include,
          excludeWords: kw.exclude
        }))
      };

      // 如果是编辑模式，需要添加项目ID
      if (this.isEditMode) {
        const projectId = this.$route.params.id || this.$route.query.projectId;
        projectData.projectId = projectId;
      }

      try {
        let response;

        if (this.isEditMode) {
          response = await updateProject(projectData);
        } else {
          response = await createProject(projectData);
        }

        console.log('API响应:', response);

        // 判断响应是否成功 - 支持多种成功码
        const isSuccess = response && (
          response.code === 0 ||
          response.code === '0' ||
          response.code === 200 ||
          response.code === '200'
        );

        if (isSuccess && response.data) {
          console.log(`项目${this.isEditMode ? '更新' : '创建'}成功:`, response.data);
          ElMessage.success(`项目${this.isEditMode ? '更新' : '保存'}成功！`);

          if (!this.isEditMode) {
            const projectId = response.data.projectId || response.data.id;
            const projectName = response.data.name || response.data.projectName;
            const projectType = response.data.type || response.data.projectType;

            const projectIdStr = String(projectId);

            if (projectIdStr && projectIdStr !== 'undefined') {
              this.$router.push({
                name: 'settings',
                query: {
                  projectId: projectIdStr,
                  projectName: projectName,
                  projectType: projectType,
                  refresh: 'true',
                  page: 'settings',
                  newlyCreated: 'true'
                }
              });
            } else {
              console.error('响应数据中缺少项目ID:', response.data);
              ElMessage.error('项目保存成功，但跳转失败，请手动刷新页面');
            }
          } else {
            this.saveInitialFormData();
            this.hasChanges = false;
          }
        } else {
          const errorMsg = response?.msg || response?.message || '保存失败，请重试';
          console.error('项目保存失败:', { response, errorMsg });
          ElMessage.error(`${this.isEditMode ? '更新' : '保存'}项目失败：${errorMsg}`);
        }

      } catch (error) {
        console.error(`${this.isEditMode ? '更新' : '保存'}项目失败:`, error);
        ElMessage.error('网络错误，请检查网络连接后重试');
      }
    },

    // 确认删除项目
    async confirmDelete() {
      if (!this.canClickDelete) {
        return;
      }

      try {
        await ElMessageBox.confirm(`确定要删除项目"${this.projectName}"吗？\n该操作不可撤销，请谨慎操作！`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        this.deleteProject();
      } catch {
        // 用户取消删除
      }
    },

    // 删除项目
    async deleteProject() {
      const projectId = this.$route.params.id || this.$route.query.projectId;

      if (!projectId) {
        ElMessage.error('项目ID不存在，无法删除');
        return;
      }

      try {
        const response = await deleteProject(projectId);

        if (response.code === 0) {
          ElMessage.success('项目删除成功！');
          this.$router.push({
              name: 'settings',
              query: {
                projectId: null,
                projectName: null,
                refresh: 'true'
              }
            });
        } else {
          ElMessage.error(`删除项目失败：${response.msg}`);
        }
      } catch (error) {
        console.error('删除项目失败:', error);
        ElMessage.error('网络错误，请检查网络连接后重试');
      }
    },

    // 搜索测试功能
    testSearch() {
      const projectId = this.$route.params.id || this.$route.query.projectId;

      if (!projectId) {
        ElMessage.error('项目ID不存在，无法执行搜索测试');
        return;
      }

      // 立即设置为测试状态
      this.isSearchTesting = true;
      this.searchTestProgress = null;
      ElMessage.success('搜索测试任务启动中...');

      // 先异步启动搜索测试任务
      this.startSearchTestAsync(projectId);

      // 然后立即开始轮询进度
      this.startProgressPolling(projectId);
    },

    // 异步启动搜索测试
    async startSearchTestAsync(projectId) {
      try {
        // 启动搜索测试任务
        const response = await executeDataCrawlTask(projectId);

        if (response.code === 0) {
          // 不需要再次启动轮询，因为已经在testSearch中启动了
        } else {
          ElMessage.error(`搜索测试启动失败：${response.msg}`);
          // 停止轮询并重置状态
          this.stopProgressPolling();
        }
      } catch (error) {
        ElMessage.error('搜索测试启动失败，请检查网络连接后重试');
        // 停止轮询并重置状态
        this.stopProgressPolling();
      }
    },

    // 开始轮询进度
    startProgressPolling(projectId) {
      // 清除之前的定时器
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
      }

      // 立即获取一次进度
      this.fetchProgress(projectId);

      // 每0.5秒轮询一次进度
      this.progressTimer = setInterval(() => {
        this.fetchProgress(projectId);
      }, 500);
    },

    // 获取进度
    async fetchProgress(projectId) {
      try {
        const response = await getDataCrawlProgress(projectId);
        
        if (response.code === 0) {
          if (response.data) {
            // 有数据，说明任务正在运行
            this.searchTestProgress = response.data;
            
            // 检查是否完成（总进度达到100%）
            if (response.data.totalProgress >= 100) {
              this.stopProgressPolling();
              ElMessage.success('搜索测试完成！');
            }
          } else {
            // 返回null，说明没有任务在运行
            this.stopProgressPolling();
          }
        } else {
          // 接口调用失败
          this.stopProgressPolling();
        }
      } catch (error) {
        // 如果获取进度失败，可能任务已完成或出错，停止轮询
        this.stopProgressPolling();
      }
    },

    // 停止轮询进度
    stopProgressPolling() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
      this.isSearchTesting = false;
      this.searchTestProgress = null;
      this.searchTestButtonDisabled = false;
    },

    // 检查是否有正在运行的搜索测试
    async checkRunningSearchTest() {
      const projectId = this.$route.params.id || this.$route.query.projectId;
      
      // 只有在编辑模式或已创建项目时才检查
      if (!projectId || (!this.isEditMode && this.projectStatus === 'creating')) {
        this.searchTestButtonDisabled = false;
        return;
      }

      try {
        const response = await getDataCrawlProgress(projectId);
        
        if (response.code === 0) {
          if (response.data) {
            // 有数据，检查是否还在运行中
            if (response.data.totalProgress < 100) {
              this.isSearchTesting = true;
              this.searchTestProgress = response.data;
              
              // 开始轮询进度
              this.startProgressPolling(projectId);
            } else {
              // 任务已完成，重置状态
              this.isSearchTesting = false;
              this.searchTestProgress = null;
            }
          } else {
            // 返回null，说明没有任务在运行
            this.isSearchTesting = false;
            this.searchTestProgress = null;
          }
        } else {
          // 接口调用失败，重置状态
          this.isSearchTesting = false;
          this.searchTestProgress = null;
        }
      } catch {
        // 如果获取进度失败，可能是没有正在运行的任务，忽略错误
        this.isSearchTesting = false;
        this.searchTestProgress = null;
      } finally {
        // 无论如何都启用按钮
        this.searchTestButtonDisabled = false;
      }
    },
  }
}
</script>

<style scoped>
.new-keyword-project {
  padding: 20px;
  background-color: #fff;
  max-width: 100%;
  overflow-x: hidden;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  color: #333;
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
  color: #333;
  line-height: 36px;
}

.form-section {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
  text-align: left;
  width: auto;
}

input[type="text"],
input[type="number"] {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  transition: border-color 0.3s;
}

input[type="text"]:hover,
input[type="number"]:hover,
input[type="text"]:focus,
input[type="number"]:focus {
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
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.3s;
}

.select-container:hover {
  border-color: #1890ff;
}

.select-value {
  flex: 1;
  color: #333;
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
  background-color: #fff;
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
.language-multiselect,
.region-multiselect {
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
  background-color: #fff;
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
  background-color: #fff;
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
  background-color: #f5f5f5;
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

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  flex-wrap: wrap;
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
  .form-row, .form-actions, .delete-container {
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

  .language-multiselect, .region-multiselect, .custom-select {
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
