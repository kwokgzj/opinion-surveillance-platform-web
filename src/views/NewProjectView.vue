<template>
  <div class="new-project">
    <div class="page-header">
      <h1>新建项目</h1>
    </div>

    <div class="project-form">
      <!-- 项目名称输入框 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">项目名称：</label>
          <input
            v-model="projectForm.name"
            type="text"
            placeholder="请输入项目名称"
            maxlength="50"
          />
        </div>
      </div>

      <!-- 项目类型下拉选择框 -->
      <div class="form-row">
        <div class="form-item">
          <label class="required">项目类型：</label>
          <div class="custom-select">
            <div class="select-container" @click="toggleTypeDropdown">
              <span class="select-value">{{ getTypeLabel(projectForm.type) }}</span>
              <span class="dropdown-arrow" :class="{ 'open': typeDropdownOpen }">▼</span>
            </div>
            <div v-if="typeDropdownOpen" class="dropdown-options">
              <div
                v-for="option in projectTypeOptions"
                :key="option.value"
                class="dropdown-option"
                @click="selectType(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下一步按钮 -->
      <div class="form-actions">
        <div class="action-buttons">
          <button class="btn-cancel" @click="handleCancel">取消</button>
          <button
            class="btn-save"
            :class="{ 'btn-save-disabled': !isFormValid }"
            :disabled="!isFormValid || loading"
            @click="handleNextStep"
          >
            {{ loading ? '处理中...' : '下一步' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// 路由实例
const router = useRouter();

// 加载状态
const loading = ref(false);
const typeDropdownOpen = ref(false);

// 项目表单数据
const projectForm = reactive({
  name: '',
  type: ''
});

// 项目类型选项
const projectTypeOptions = [
  { value: 'SocialMediaKeywords', label: '社媒关键字项目' },
  { value: 'VideoList', label: '视频列表项目' },
  { value: 'GoogleNews', label: 'Google新闻项目' },
];

// 表单验证
const isFormValid = computed(() => {
  return projectForm.name.trim().length >= 2 &&
         projectForm.name.trim().length <= 50 &&
         projectForm.type.trim();
});

// 组件挂载时设置点击外部事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载时移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 处理点击外部关闭下拉框
const handleClickOutside = (event: Event) => {
  const customSelects = document.querySelectorAll('.custom-select');
  let clickedInCustomSelect = false;

  customSelects.forEach(select => {
    if (select.contains(event.target as Node)) {
      clickedInCustomSelect = true;
    }
  });

  if (!clickedInCustomSelect) {
    typeDropdownOpen.value = false;
  }
};

// 切换类型下拉框
const toggleTypeDropdown = () => {
  typeDropdownOpen.value = !typeDropdownOpen.value;
};

// 选择项目类型
const selectType = (value: string) => {
  projectForm.type = value;
  typeDropdownOpen.value = false;
};

// 获取类型标签
const getTypeLabel = (value: string) => {
  const option = projectTypeOptions.find(o => o.value === value);
  return option ? option.label : '请选择项目类型';
};

// 处理下一步按钮点击事件
const handleNextStep = async () => {
  if (!isFormValid.value) return;

  loading.value = true;

  // 这里可以添加保存项目基本信息的逻辑
  console.log('提交的项目信息:', projectForm);

  // 模拟API请求
  setTimeout(() => {
    loading.value = false;

    // 导航到下一步 - 跳转到关键字项目设置页面
    if (projectForm.type === 'SocialMediaKeywords') {
      router.push({
        name: 'keywordProjectSetting',
        query: {
          isNew: 'true',
          projectName: projectForm.name,
          projectType: projectForm.type
        }
      });
    } else if (projectForm.type === 'VideoList') {
      router.push({
        name: 'videoListSettingView',
        query: {
          isNew: 'true',
          projectName: projectForm.name,
          projectType: projectForm.type
        }
      });
    } else if (projectForm.type === 'GoogleNews') {
      router.push({
        name: 'googleNewsSettingView',
        query: {
          isNew: 'true',
          projectName: projectForm.name,
          projectType: projectForm.type
        }
      });
    } else {
      // 其他类型项目的设置页面
      router.push({
        name: 'projectDetailSettings',
        params: {
          step: 'keywords'
        },
        query: {
          isNew: 'true',
          projectType: projectForm.type,
          projectName: projectForm.name
        }
      });
    }

    // ElMessage.success('基本信息已保存，进入下一步配置');
  }, 1000);
};

// 取消创建项目
const handleCancel = () => {
  ElMessage.info('已取消创建项目');
  router.back();
};
</script>

<style lang="less" scoped>
.new-project {
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

input[type="text"] {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  transition: border-color 0.3s;
}

input[type="text"]:hover,
input[type="text"]:focus {
  border-color: #1890ff;
  outline: none;
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

.select-value:empty::before {
  content: '请选择项目类型';
  color: #999;
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

.form-actions {
  display: flex;
  justify-content: center; /* 改为居中 */
  margin-top: 50px; /* 增加上边距，从30px改为50px */
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

@media (max-width: 768px) {
  .form-row, .form-actions {
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

  .custom-select {
    width: 100%;
  }

  label {
    text-align: left;
    margin-bottom: 5px;
    width: auto;
  }

  .form-actions {
    justify-content: center; /* 移动端也居中 */
  }
}
</style>