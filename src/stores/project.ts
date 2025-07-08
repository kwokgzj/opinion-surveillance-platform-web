import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface ProjectInfo {
  projectId: string
  projectName: string
  projectType: string
}

export const useProjectStore = defineStore('project', () => {
  // 当前选中的项目
  const currentProject = ref<ProjectInfo | null>(null)

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
  }

  // 设置项目列表
  function setProjectList(projects: ProjectInfo[]) {
    projectList.value = projects
  }

  // 根据项目ID设置当前项目
  function setCurrentProjectById(projectId: string) {
    const project = projectList.value.find(p => p.projectId === projectId)
    if (project) {
      currentProject.value = project
    }
  }

  // 清除当前项目
  function clearCurrentProject() {
    currentProject.value = null
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
