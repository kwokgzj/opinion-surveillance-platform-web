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

      <!-- 抓取列表 -->
      <div class="form-section">
        <label class="section-label required">监控以下视频：</label>
        <textarea
          v-model="monitoredVideoLinksText"
          @input="handleMonitoredVideoLinksChange"
          placeholder="填写视频的链接，一行一个链接"
          rows="5"
          ref="monitoredVideoLinksTextarea"
          class="exclude-links-textarea"
        ></textarea>
        <!-- 可选：显示解析后的链接数量 -->
        <div v-if="monitoredVideoLinks.length > 0" class="exclude-links-count">
          已添加 {{ monitoredVideoLinks.length }} 个链接
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
import { createProject } from '@/api/project/project';
export default {
  name: 'NewKeywordProjectView',
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
      monitoredVideoLinks: [],
      monitoredVideoLinksText: '',
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
    return this.projectName.trim() &&
           this.crawlTimeRange &&
           this.crawlFrequency &&
           this.monitoredVideoLinks.length > 0; // 添加视频链接必填验证
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
    monitoredVideoLinks: {
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
    // 初始化时将 monitoredVideoLinks 数组内容显示到文本框
    this.initializeMonitoredVideoLinksText();
    // 保存初始表单数据
    this.saveInitialFormData();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    // 初始化页面模式
    initializePageMode() {
    // 可以根据路由参数或props判断模式
    const projectId = this.$route.params.id || this.$route.query.id;
    const projectName = this.$route.query.projectName;

    if (projectId) {
      // 编辑模式
      this.isEditMode = true;
      this.projectStatus = 'saved';
      this.loadProjectData(projectId);
    } else {
      // 新建模式
      this.isEditMode = false;
      this.projectStatus = 'creating';
      // 设置默认值
      this.setDefaultValues();

      // 如果有传入的项目名称，则设置
      if (projectName) {
        this.projectName = projectName;
      }
    }
  },

    // 设置新建时的默认值
    setDefaultValues() {
    this.projectName = '';
    this.crawlTimeRange = '720'; // 默认近30天
    this.crawlFrequency = '24'; // 默认每天抓取
    this.monitoredVideoLinks = [];
  },

    // 加载项目数据（编辑模式）
    loadProjectData(projectId) {
      // 模拟加载数据
      this.projectName = '项目1';
      this.crawlTimeRange = '720';
      this.crawlFrequency = '24';
      this.monitoredVideoLinks = ['fsdddddddd','fskdfjhskdjf','hvoxcjuo'];
    },

    // 保存初始表单数据
    saveInitialFormData() {
      this.initialFormData = {
        projectName: this.projectName,
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        monitoredVideoLinks: [...this.monitoredVideoLinks]
      };
    },

    // 检测表单是否有变更
    checkForChanges() {
      if (!this.initialFormData) return;

      const currentData = {
        projectName: this.projectName,
        crawlTimeRange: this.crawlTimeRange,
        crawlFrequency: this.crawlFrequency,
        monitoredVideoLinks: [...this.monitoredVideoLinks]
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
          this.monitoredVideoLinks = [...this.initialFormData.monitoredVideoLinks];
          this.monitoredVideoLinksText = this.monitoredVideoLinks.join('\n');

          this.hasChanges = false;
          this.projectStatus = this.isEditMode ? 'saved' : 'created';
        }
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
      const platformMultiselect = this.$el.querySelector('.platform-multiselect');
      const timeRangeSelects = this.$el.querySelectorAll('.custom-select');

      if (platformMultiselect && !platformMultiselect.contains(event.target)) {
        this.dropdownOpen = false;
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

    initializeMonitoredVideoLinksText() {
      this.monitoredVideoLinksText = this.monitoredVideoLinks.join('\n');
      this.$nextTick(() => {
        this.autoResizeTextarea();
      });
    },

    handleMonitoredVideoLinksChange() {
      this.monitoredVideoLinks = this.monitoredVideoLinksText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      this.$nextTick(() => {
        this.autoResizeTextarea();
      });
    },

    autoResizeTextarea() {
      const textarea = this.$refs.monitoredVideoLinksTextarea;
      if (textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.max(100, Math.min(300, textarea.scrollHeight));
        textarea.style.height = newHeight + 'px';
      }
    },

    async saveProject() {
      if (!this.isFormValid) {
        alert('请填写完整的必填信息');
        return;
      }

      const validKeywords = this.keywords.filter(keyword => keyword.word.trim());
      this.validatePostSearchCount();
      this.validateVideoSearchCount();
      this.handleMonitoredVideoLinksChange();

      // 构造项目数据
      const projectData = {
        name: this.projectName,
        type: this.projectType,
        monitoredVideoLinks: this.monitoredVideoLinks,
        fetchTime: parseInt(this.crawlTimeRange),
        crawlFrequency: parseInt(this.crawlFrequency),
      };
      console.log('保存的项目数据:', projectData);

      try {
        const response = await createProject(projectData);

        if(response.code === 0) {
          // 保存成功后跳转到项目列表
          // this.$router.push('/projects');
          alert('项目创建成功');
        } else if(response.code === 1) {
          alert('项目创建失败，' + response.msg);
          return;
        } else {
          alert('项目创建失败，请稍后重试');
          return;
        }
      } catch (error) {
        console.error('项目创建失败:', error);
        alert('项目创建失败，请重试');
      }
    },
    testSearch() {
      console.log('执行搜索测试');
    },
    confirmDelete() {
      if (confirm('确定要删除此项目吗？此操作不可撤销。')) {
        console.log('删除项目');
        // 删除后返回项目列表
        this.$router.push('/projects');
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
  color: #666;
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

.btn-test:hover {
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

  .platform-multiselect, .custom-select {
    width: 100%;
  }

  label {
    text-align: left;
    margin-bottom: 5px;
    width: auto;
  }
}
</style>