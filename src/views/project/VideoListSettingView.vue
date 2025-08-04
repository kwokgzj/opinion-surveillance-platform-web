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
          <span class="form-value">视频列表项目</span>
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

      <!-- 监控视频表格 -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-label required">监控以下视频（至少一条）：</label>
          <div class="header-actions">
            <span class="video-count">当前共 {{ validVideosCount }} 条有效视频</span>
            <button class="btn-batch-import" @click="showBatchImport">批量导入</button>
          </div>
        </div>
        <div class="videos-table-container">
          <table>
            <thead>
              <tr>
                <th width="45%">视频链接</th>
                <th width="25%">品牌</th>
                <th width="25%">SKU</th>
                <th width="5%">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(video, index) in monitoredVideos" :key="index">
                <td>
                  <input
                    v-model="video.url"
                    @blur="validateVideoUrl(index)"
                    placeholder="视频链接"
                  />
                </td>
                <td>
                  <input
                    v-model="video.brand"
                    placeholder="品牌名称，逗号分隔"
                  />
                </td>
                <td>
                  <input
                    v-model="video.sku"
                    placeholder="SKU编码，逗号分隔"
                  />
                </td>
                <td>
                  <button class="btn-delete" @click="removeVideo(index)">-</button>
                </td>
              </tr>
              <tr>
                <td colspan="3">
                </td>
                <td>
                  <button class="btn-add" @click="addVideo">+</button>
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

    <!-- 批量导入模态框 -->
    <div v-if="batchImportVisible" class="batch-import-modal" @click="closeBatchImport">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>批量导入视频</h3>
          <button class="btn-close" @click="closeBatchImport">×</button>
        </div>
        <div class="modal-body">
          <div class="import-instructions">
            <p>请上传Excel表格进行批量导入：</p>
            <p class="format-example">表格格式要求：</p>
            <ul class="format-list">
              <li>第一列：视频链接（URL）</li>
              <li>第二列：品牌（brands）</li>
              <li>第三列：SKU编码（skus）</li>
            </ul>
            <p class="format-note">支持 .xlsx 和 .xls 格式，会自动跳过标题行</p>
          </div>

          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".xlsx,.xls"
              style="display: none"
            />
            <div
              class="upload-zone"
              :class="{ 'drag-over': isDragOver }"
              @click="triggerFileSelect"
              @drop="handleFileDrop"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
            >
              <div class="upload-icon">📁</div>
              <p v-if="!selectedFile">点击选择或拖拽Excel文件到此处</p>
              <p v-else class="selected-file">已选择文件：{{ selectedFile.name }}</p>
            </div>
          </div>

          <!-- 预览表格 -->
          <div v-if="previewData.length > 0" class="preview-section">
            <h4>数据预览（前5行）：</h4>
            <div class="preview-table-container">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>视频链接</th>
                    <th>品牌</th>
                    <th>SKU</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                    <td>{{ row.url || '-' }}</td>
                    <td>{{ row.brand || '-' }}</td>
                    <td>{{ row.sku || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="preview-info">总共 {{ previewData.length }} 行数据</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeBatchImport">取消</button>
          <button class="btn-import" @click="processBatchImport" :disabled="previewData.length === 0">确认导入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createProject, getProjectById, updateProject, deleteProject, executeDataCrawlTask } from '@/api/project/project';
import { ElMessage, ElMessageBox } from 'element-plus';
export default {
  name: 'VideoListSettingView',
  data() {
    return {
      // 页面模式：true为编辑模式，false为新建模式
      isEditMode: false,
      // 项目状态：'creating'新建中, 'created'已创建, 'editing'编辑中, 'saved'已保存
      projectStatus: 'creating',

      projectName: '',
      projectType: 'VideoList',
      crawlTimeRange: '',
      crawlFrequency: '',
      monitoredVideos: [
        { url: '', brand: '', sku: '', platform: '', platformID: '' }
      ],
      dropdownOpen: false,
      timeRangeDropdownOpen: false,
      frequencyDropdownOpen: false,

      // 用于检测页面变更
      hasChanges: false,
      initialFormData: null,

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
        { value: '720', label: '每月抓取' }
      ],

      // 批量导入相关
      batchImportVisible: false,
      selectedFile: null,
      previewData: [],
      isDragOver: false,
    }
  },
  computed: {
    // 表单验证
    isFormValid() {
      const hasValidVideos = this.monitoredVideos.some(video =>
        video.url.trim() && video.brand.trim() && video.sku.trim()
      );
      return this.projectName.trim() &&
             this.crawlTimeRange &&
             this.crawlFrequency &&
             hasValidVideos;
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

    // 有效视频数量
    validVideosCount() {
      return this.monitoredVideos.filter(video =>
        video.url.trim() && video.brand.trim() && video.sku.trim()
      ).length;
    },
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
    crawlTimeRange() {
      this.checkForChanges();
    },
    crawlFrequency() {
      this.checkForChanges();
    },
    monitoredVideos: {
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
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
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
      this.crawlTimeRange = '720'; // 默认近30天
      this.crawlFrequency = '24'; // 默认每天抓取
      this.monitoredVideos = [{ url: '', brand: '', sku: '', platform: '', platformID: '' }];
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
          this.crawlTimeRange = String(project.fetchTime || '720');
          this.crawlFrequency = String(project.crawlFrequency || '24');

          // 转换监控视频格式
          this.monitoredVideos = project.monitoredVideoLinks && project.monitoredVideoLinks.length > 0
            ? project.monitoredVideoLinks.map(video => ({
                url: video.url,
                brand: Array.isArray(video.brand) ? video.brand.join(', ') : (video.brand || ''),
                sku: Array.isArray(video.sku) ? video.sku.join(', ') : (video.sku || ''),
                platform: video.platform,
                platformID: video.platformID
              }))
            : [{ url: '', brand: '', sku: '', platform: '', platformID: '' }];

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
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        monitoredVideos: JSON.parse(JSON.stringify(this.monitoredVideos))
      };
    },

    // 检测表单是否有变更
    checkForChanges() {
      if (!this.initialFormData) return;

      const currentData = {
        projectName: this.projectName,
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        monitoredVideos: JSON.parse(JSON.stringify(this.monitoredVideos))
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
          this.crawlTimeRange = this.initialFormData.crawlTimeRange;
          this.crawlFrequency = this.initialFormData.crawlFrequency;
          this.monitoredVideos = JSON.parse(JSON.stringify(this.initialFormData.monitoredVideos));

          this.hasChanges = false;
          this.projectStatus = this.isEditMode ? 'saved' : 'created';
        }
      }
    },

    // 添加视频
    addVideo() {
      this.monitoredVideos.push({ url: '', brand: '', sku: '', platform: '', platformID: '' });
    },

    // 删除视频
    removeVideo(index) {
      this.monitoredVideos.splice(index, 1);
      if (this.monitoredVideos.length === 0) {
        this.monitoredVideos.push({ url: '', brand: '', sku: '', platform: '', platformID: '' });
      }
    },

    // 规范化YouTube URL
    normalizeYouTubeUrl(url) {
      if (!url || typeof url !== 'string') {
        return url;
      }

      try {
        const urlObj = new URL(url);

        // 处理 youtube.com/watch 格式
        if (url.includes('youtube.com/watch')) {
          const videoId = urlObj.searchParams.get('v');
          if (videoId) {
            // 只保留视频ID，去掉所有其他参数
            return `https://www.youtube.com/watch?v=${videoId}`;
          }
        }
        // 处理 youtu.be 格式
        else if (url.includes('youtu.be')) {
          const parts = urlObj.pathname.split('/');
          const videoId = parts[1];
          if (videoId) {
            // 转换为标准格式，去掉查询参数
            const cleanVideoId = videoId.split('?')[0];
            return `https://www.youtube.com/watch?v=${cleanVideoId}`;
          }
        }
      } catch (error) {
        console.warn('URL格式错误:', url, error);
      }

      return url;
    },

    // 验证视频URL
    validateVideoUrl(index) {
      const video = this.monitoredVideos[index];
      if (!video.url.trim()) {
        video.platform = '';
        video.platformID = '';
        return;
      }

      // 如果是YouTube链接，先规范化URL格式
      if (video.url.includes('youtube.com') || video.url.includes('youtu.be')) {
        video.url = this.normalizeYouTubeUrl(video.url);
      }

      const platform = this.detectPlatformFromUrl(video.url);
      const platformID = this.generatePlatformID(video.url);

      if (platform === 'Unknown' || !platform) {
        ElMessage.warning(`第 ${index + 1} 行的视频链接无法识别平台，请检查链接格式：${video.url}`);
        return;
      }

      if (platformID === 'unknown' || !platformID) {
        ElMessage.warning(`第 ${index + 1} 行的视频链接无法提取ID，请检查链接格式：${video.url}`);
        return;
      }

      video.platform = platform;
      video.platformID = platformID;
    },

    // 根据 URL 检测平台
    detectPlatformFromUrl(url) {
      if (!url || typeof url !== 'string') {
        return 'Unknown';
      }

      const lowerUrl = url.toLowerCase();

      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'Youtube';
      } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
        return 'X';
      } else if (lowerUrl.includes('instagram.com')) {
        return 'Instagram';
      } else if (lowerUrl.includes('facebook.com')) {
        return 'Facebook';
      } else {
        return 'Unknown';
      }
    },

    // 生成平台ID
    generatePlatformID(url) {
      if (!url || typeof url !== 'string') {
        return 'unknown';
      }

      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        // YouTube 处理
        if (url.includes('youtube.com/watch')) {
          const videoId = urlObj.searchParams.get('v');
          return videoId || 'unknown';
        } else if (url.includes('youtu.be')) {
          const parts = pathname.split('/');
          const videoId = parts[1];
          // 去掉youtu.be链接中可能存在的查询参数
          return videoId ? videoId.split('?')[0] : 'unknown';
        }
        // Twitter/X 处理
        else if (url.includes('twitter.com') || url.includes('x.com')) {
          const parts = pathname.split('/').filter(part => part.length > 0);
          // Twitter URL 格式通常是 /username/status/tweetId
          if (parts.length >= 3 && parts[1] === 'status') {
            return parts[2] || 'unknown';
          }
          // 或者直接取最后一部分
          return parts[parts.length - 1] || 'unknown';
        }
        // Instagram 处理
        else if (url.includes('instagram.com')) {
          const parts = pathname.split('/').filter(part => part.length > 0);
          // Instagram URL 格式通常是 /p/postId/ 或 /reel/reelId/
          if (parts.length >= 2 && (parts[0] === 'p' || parts[0] === 'reel')) {
            return parts[1] || 'unknown';
          }
          return 'unknown';
        }
        // Facebook 处理
        else if (url.includes('facebook.com')) {
          const parts = pathname.split('/').filter(part => part.length > 0);
          // Facebook URL 格式比较复杂，尝试提取最后的数字ID
          const lastPart = parts[parts.length - 1];
          if (lastPart && /^\d+$/.test(lastPart)) {
            return lastPart;
          }
          // 如果没有找到数字ID，返回unknown
          return 'unknown';
        }

        // 其他情况，尝试提取路径最后一部分
        const lastSegment = pathname.split('/').pop();
        return lastSegment || 'unknown';

      } catch {
        // URL 格式错误
        return 'unknown';
      }
    },

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
      this.timeRangeDropdownOpen = false;
      this.frequencyDropdownOpen = false;
    },
    toggleTimeRangeDropdown() {
      this.timeRangeDropdownOpen = !this.timeRangeDropdownOpen;
      this.frequencyDropdownOpen = false;
      this.dropdownOpen = false;
    },
    toggleFrequencyDropdown() {
      this.frequencyDropdownOpen = !this.frequencyDropdownOpen;
      this.timeRangeDropdownOpen = false;
      this.dropdownOpen = false;
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
    handleClickOutside(event) {
      const timeRangeSelects = this.$el.querySelectorAll('.custom-select');

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

      const validVideos = this.monitoredVideos.filter(video =>
        video.url.trim() && video.brand.trim() && video.sku.trim()
      );

      if (validVideos.length === 0) {
        ElMessage.warning('请至少添加一个有效的监控视频');
        return;
      }

      const projectData = {
        name: this.projectName,
        type: this.projectType,
        fetchTime: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        monitoredVideoLinks: validVideos.map((video, index) => ({
          index: index,
          url: video.url,
          brand: video.brand ? video.brand.split(',').map(item => item.trim()).filter(item => item) : [],
          sku: video.sku ? video.sku.split(',').map(item => item.trim()).filter(item => item) : [],
          platform: video.platform,
          platformID: video.platformID
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
    async testSearch() {
      const projectId = this.$route.params.id || this.$route.query.projectId;

      if (!projectId) {
        ElMessage.error('项目ID不存在，无法执行搜索测试');
        return;
      }

      try {
        const response = await executeDataCrawlTask(projectId);

        if (response.code === 0) {
          ElMessage.success('搜索测试任务已启动，请稍后查看结果');
        } else {
          ElMessage.error(`搜索测试失败：${response.msg}`);
        }
      } catch (error) {
        console.error('搜索测试失败:', error);
        ElMessage.error('网络错误，请检查网络连接后重试');
      }
    },

    // 显示批量导入模态框
    showBatchImport() {
      this.batchImportVisible = true;
      this.selectedFile = null;
      this.previewData = [];
      this.isDragOver = false;
    },

    // 关闭批量导入模态框
    closeBatchImport() {
      this.batchImportVisible = false;
      this.selectedFile = null;
      this.previewData = [];
      this.isDragOver = false;
    },

    // 触发文件选择
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    // 处理文件上传
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        await this.processExcelFile(file);
      }
    },

    // 处理文件拖拽
    async handleFileDrop(event) {
      event.preventDefault();
      this.isDragOver = false;

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          await this.processExcelFile(file);
        } else {
          ElMessage.error('请选择Excel文件（.xlsx或.xls格式）');
        }
      }
    },

    // 处理Excel文件
    async processExcelFile(file) {
      this.selectedFile = file;

      try {
        // 动态导入xlsx库
        const XLSX = await import('xlsx');

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // 读取第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // 转换为JSON格式
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 处理数据
            this.parseExcelData(jsonData);

          } catch (error) {
            console.error('解析Excel文件失败:', error);
            ElMessage.error('解析Excel文件失败，请检查文件格式');
          }
        };

        reader.readAsArrayBuffer(file);

      } catch (error) {
        console.error('加载Excel解析库失败:', error);
        ElMessage.error('加载Excel解析库失败，请刷新页面重试');
      }
    },

    // 解析Excel数据
    parseExcelData(jsonData) {
      if (!jsonData || jsonData.length === 0) {
        ElMessage.warning('Excel文件为空');
        return;
      }

      // 跳过第一行（标题行），从第二行开始处理数据
      const dataRows = jsonData.slice(1);
      const parsedData = [];

      dataRows.forEach((row, index) => {
        // 确保行有数据
        if (!row || row.length === 0) return;

        const url = row[0] ? String(row[0]).trim() : '';
        const brand = row[1] ? String(row[1]).trim() : '';
        const sku = row[2] ? String(row[2]).trim() : '';

        // 至少要有URL
        if (url) {
          parsedData.push({
            url,
            brand,
            sku,
            rowIndex: index + 2 // 实际行号（考虑标题行）
          });
        }
      });

      this.previewData = parsedData;

      if (parsedData.length === 0) {
        ElMessage.warning('Excel文件中没有找到有效数据');
      } else {
        ElMessage.success(`成功解析 ${parsedData.length} 行数据`);
      }
    },

        // 处理批量导入
    processBatchImport() {
      if (this.previewData.length === 0) {
        ElMessage.warning('请先选择并解析Excel文件');
        return;
      }

      const newVideos = [];
      const errors = [];

      this.previewData.forEach((row) => {
        let { url } = row;
        const { brand, sku, rowIndex } = row;

        // 检查必填字段
        if (!url) {
          errors.push(`第 ${rowIndex} 行缺少视频链接`);
          return;
        }

        if (!brand) {
          errors.push(`第 ${rowIndex} 行缺少品牌信息`);
          return;
        }

        if (!sku) {
          errors.push(`第 ${rowIndex} 行缺少SKU信息`);
          return;
        }

        // 如果是YouTube链接，先规范化URL格式
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          url = this.normalizeYouTubeUrl(url);
        }

        // 检测平台和生成平台ID
        const platform = this.detectPlatformFromUrl(url);
        const platformID = this.generatePlatformID(url);

        if (platform === 'Unknown' || !platform) {
          errors.push(`第 ${rowIndex} 行的视频链接无法识别平台：${url}`);
          return;
        }

        if (platformID === 'unknown' || !platformID) {
          errors.push(`第 ${rowIndex} 行的视频链接无法提取ID：${url}`);
          return;
        }

        newVideos.push({
          url,
          brand,
          sku,
          platform,
          platformID
        });
      });

      if (errors.length > 0) {
        ElMessage.error(`导入失败：\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
        return;
      }

      if (newVideos.length === 0) {
        ElMessage.warning('没有有效的视频数据可以导入');
        return;
      }

      // 移除现有的空行（如果只有一行且为空）
      if (this.monitoredVideos.length === 1 &&
          !this.monitoredVideos[0].url &&
          !this.monitoredVideos[0].brand &&
          !this.monitoredVideos[0].sku) {
        this.monitoredVideos = [];
      }

      // 添加新视频
      this.monitoredVideos.push(...newVideos);

      ElMessage.success(`成功导入 ${newVideos.length} 条视频`);
      this.closeBatchImport();
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
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.section-label {
  display: block;
  font-weight: 500;
  color: #333;
  text-align: left;
  width: auto;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-count {
  font-size: 14px;
  color: #666;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.btn-batch-import {
  background-color: #52c41a;
  color: white;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-batch-import:hover {
  background-color: #73d13d;
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

.videos-table-container {
  width: 100%;
  max-height: 400px;
  overflow: auto;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

/* 自定义滚动条样式 */
.videos-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.videos-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.videos-table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.videos-table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
  table-layout: fixed;
}

th {
  text-align: left;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 10;
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

  .custom-select {
    width: 100%;
  }

  label {
    text-align: left;
    margin-bottom: 5px;
    width: auto;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .video-count {
    align-self: flex-start;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .modal-content {
    width: 98%;
    max-width: none;
    margin: 10px;
  }

  .upload-zone {
    padding: 20px;
  }

  .upload-icon {
    font-size: 36px;
  }

  .preview-table th,
  .preview-table td {
    padding: 6px 8px;
    font-size: 12px;
  }

  .preview-table th:nth-child(1),
  .preview-table td:nth-child(1) {
    width: 45%;
  }

  .preview-table th:nth-child(2),
  .preview-table td:nth-child(2) {
    width: 27.5%;
  }

  .preview-table th:nth-child(3),
  .preview-table td:nth-child(3) {
    width: 27.5%;
  }
}

/* 批量导入模态框样式 */
.batch-import-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.import-instructions {
  margin-bottom: 16px;
}

.import-instructions p {
  margin: 8px 0;
  color: #333;
}

.format-example {
  font-weight: 500;
  color: #1890ff;
}

.format-list {
  margin: 8px 0;
  padding-left: 20px;
  color: #333;
}

.format-list li {
  margin: 4px 0;
}

.format-note {
  font-size: 14px;
  color: #666;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.upload-area {
  margin: 16px 0;
}

.upload-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-zone:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.upload-zone.drag-over {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-zone p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.selected-file {
  color: #1890ff !important;
  font-weight: 500;
}

.preview-section {
  margin-top: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.preview-table-container {
  overflow-x: auto;
  margin-bottom: 12px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  table-layout: fixed;
}

.preview-table th,
.preview-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
}

.preview-table th {
  background-color: #f5f5f5;
  font-weight: 500;
  color: #333;
}

.preview-table th:nth-child(1),
.preview-table td:nth-child(1) {
  width: 50%;
}

.preview-table th:nth-child(2),
.preview-table td:nth-child(2) {
  width: 25%;
}

.preview-table th:nth-child(3),
.preview-table td:nth-child(3) {
  width: 25%;
}

.preview-table td {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-info {
  margin: 0;
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}



.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.btn-import {
  background-color: #1890ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-import:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-import:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}
</style>
