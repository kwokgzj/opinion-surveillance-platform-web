import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface ProjectInfo {
  projectId: string
  projectName: string
  projectType: string
}

export const useProjectStore = defineStore('project', () => {
  // 从localStorage恢复当前选中的项目
  const getStoredCurrentProject = (): ProjectInfo | null => {
    try {
      const stored = localStorage.getItem('currentProject')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('解析存储的项目信息失败:', error)
      return null
    }
  }

  // 当前选中的项目
  const currentProject = ref<ProjectInfo | null>(getStoredCurrentProject())

  // 项目列表
  const projectList = ref<ProjectInfo[]>([])

  // 计算属性：当前项目ID
  const currentProjectId = computed(() => currentProject.value?.projectId || '')

  // 计算属性：当前项目名称
  const currentProjectName = computed(() => currentProject.value?.projectName || '')

  // 计算属性：当前项目类型
  const currentProjectType = computed(() => currentProject.value?.projectType || '')

  // 设置当前项目
  function setCurrentProject(project: ProjectInfo) {
    currentProject.value = project
    // 保存到localStorage
    try {
      localStorage.setItem('currentProject', JSON.stringify(project))
    } catch (error) {
      console.error('保存项目信息到localStorage失败:', error)
    }
  }

  // 设置项目列表
  function setProjectList(projects: ProjectInfo[]) {
    projectList.value = projects
  }

  // 根据项目ID设置当前项目
  function setCurrentProjectById(projectId: string) {
    const project = projectList.value.find(p => p.projectId === projectId)
    if (project) {
      setCurrentProject(project)
    }
  }

  // 清除当前项目
  function clearCurrentProject() {
    currentProject.value = null
    // 清除localStorage
    try {
      localStorage.removeItem('currentProject')
    } catch (error) {
      console.error('清除localStorage中的项目信息失败:', error)
    }
  }

  return {
    currentProject,
    projectList,
    currentProjectId,
    currentProjectName,
    currentProjectType,
    setCurrentProject,
    setProjectList,
    setCurrentProjectById,
    clearCurrentProject
  }
})
