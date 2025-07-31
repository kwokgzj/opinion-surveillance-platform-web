/**
 * 获取当前时间的用户上下文字符串
 * @returns 格式化的时间上下文字符串
 */
export function getCurrentTimeContext(): string {
  const now = new Date()
  const isoString = now.toISOString()

  return `---------------------------
# 用户上下文
## 当前时间为
${isoString}（标准时间格式）`
}

/**
 * 获取选择的项目信息的用户上下文字符串
 * @param selectedProjects 选择的项目列表，包含 projectId 和 projectName
 * @returns 格式化的项目选择上下文字符串
 */
export function getSelectedProjectsContext(selectedProjects: Array<{ projectId: string; projectName: string }>): string {
  if (!selectedProjects || selectedProjects.length === 0) {
    return `## 当前选择的projectId
暂无选择的项目`
  }

  const projectLines = selectedProjects.map(project =>
    `项目名称：${project.projectName} ，projectId：${project.projectId}；`
  ).join('\n')

  return `## 当前选择的projectId
${projectLines}`
}

/*
使用示例：

1. 获取当前时间上下文：
import { getCurrentTimeContext } from '@/RevoAI/utils/contextUtils'

const timeContext = getCurrentTimeContext()
console.log(timeContext)
// 输出：
// ---------------------------
// # 用户上下文
// ## 当前时间为
// 2025-01-15T09:00:44.123Z（标准时间格式）

2. 在 AIAnalysisView 组件中获取项目选择上下文：
// 在组件内部调用：
const projectContext = getSelectedProjectsContextString()
console.log(projectContext)
// 输出：
// ## 当前选择的projectId
// 项目名称：示例项目1 ，projectId：6864bea4448aa10f09b304b6；
// 项目名称：示例项目2 ，projectId：6864bf1c448aa10f09b304b7

3. 或者直接使用 getSelectedProjectsContext 函数：
import { getSelectedProjectsContext } from '@/RevoAI/utils/contextUtils'

const selectedProjects = [
  { projectId: '6864bea4448aa10f09b304b6', projectName: '示例项目1' },
  { projectId: '6864bf1c448aa10f09b304b7', projectName: '示例项目2' }
]
const projectContext = getSelectedProjectsContext(selectedProjects)
*/
