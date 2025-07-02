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
        <label class="section-label required">监控以下视频（至少一条）：</label>
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
  </div>
</template>

<script>
import { createProject, getProjectById, updateProject, deleteProject } from '@/api/project/project';
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

      if (projectId && projectId !== 'new' && isEdit) {
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
          this.crawlTimeRange = project.fetchTime || 720;
          this.crawlFrequency = project.crawlFrequency || 24;

          // 转换监控视频格式
          this.monitoredVideos = project.monitoredVideoLinks && project.monitoredVideoLinks.length > 0
            ? project.monitoredVideoLinks.map(video => ({
                url: video.url,
                brand: video.brand,
                sku: video.sku,
                platform: video.platform,
                platformID: video.platformID
              }))
            : [{ url: '', brand: '', sku: '', platform: '', platformID: '' }];

          this.$nextTick(() => {
            this.saveInitialFormData();
            this.hasChanges = false;
          });

        } else {
          alert(`加载项目数据失败：${response.msg}`);
          this.$router.go(-1);
        }

      } catch (error) {
        console.error('加载项目数据失败:', error);
        alert('网络错误，请检查网络连接后重试');
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

    // 验证视频URL
    validateVideoUrl(index) {
      const video = this.monitoredVideos[index];
      if (!video.url.trim()) {
        video.platform = '';
        video.platformID = '';
        return;
      }

      const platform = this.detectPlatformFromUrl(video.url);
      const platformID = this.generatePlatformID(video.url);

      if (platform === 'Unknown' || !platform) {
        alert(`第 ${index + 1} 行的视频链接无法识别平台，请检查链接格式：${video.url}`);
        return;
      }

      if (platformID === 'unknown' || !platformID) {
        alert(`第 ${index + 1} 行的视频链接无法提取ID，请检查链接格式：${video.url}`);
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
          return videoId || 'unknown';
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

      } catch (e) {
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
        alert('请填写完整的表单信息');
        return;
      }

      const validVideos = this.monitoredVideos.filter(video =>
        video.url.trim() && video.brand.trim() && video.sku.trim()
      );

      if (validVideos.length === 0) {
        alert('请至少添加一个有效的监控视频');
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
          brand: video.brand,
          sku: video.sku,
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

        if (response.code === 0) {
          console.log(`项目${this.isEditMode ? '更新' : '创建'}成功:`, response.data);
          alert(`项目${this.isEditMode ? '更新' : '保存'}成功！`);

          if (!this.isEditMode) {
            this.$router.push({
              name: 'settings',
              query: {
                projectId: response.data.projectId,
                projectName: response.data.name,
                projectType: response.data.type,
                refresh: 'true'
              }
            });
          } else {
            this.saveInitialFormData();
            this.hasChanges = false;
          }
        } else {
          alert(`${this.isEditMode ? '更新' : '保存'}项目失败：${response.msg}`);
        }

      } catch (error) {
        console.error(`${this.isEditMode ? '更新' : '保存'}项目失败:`, error);
        alert('网络错误，请检查网络连接后重试');
      }
    },

    // 确认删除项目
    confirmDelete() {
      if (!this.canClickDelete) {
        return;
      }

      const confirmMessage = `确定要删除项目"${this.projectName}"吗？\n该操作不可撤销，请谨慎操作！`;

      if (confirm(confirmMessage)) {
        this.deleteProject();
      }
    },

    // 删除项目
    async deleteProject() {
      const projectId = this.$route.params.id || this.$route.query.projectId;

      if (!projectId) {
        alert('项目ID不存在，无法删除');
        return;
      }

      try {
        const response = await deleteProject(projectId);

        if (response.code === 0) {
          alert('项目删除成功！');
          this.$router.push({
              name: 'settings',
              query: {
                projectId: null,
                projectName: null,
                refresh: 'true'
              }
            });
        } else {
          alert(`删除项目失败：${response.msg}`);
        }
      } catch (error) {
        console.error('删除项目失败:', error);
        alert('网络错误，请检查网络连接后重试');
      }
    },

    // 搜索测试功能
    testSearch() {
      // TODO: 实现搜索测试功能
      alert('搜索测试功能开发中...');
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

.videos-table-container {
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
}
</style>