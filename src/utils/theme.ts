import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'user-theme-preference'

// 响应式主题状态
export const currentTheme = ref<Theme>('system')
export const isDark = ref(false)

// 获取系统主题偏好
function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 从localStorage获取保存的主题偏好
function getSavedTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved && ['light', 'dark', 'system'].includes(saved)) {
    return saved as Theme
  }
  return 'system'
}

// 保存主题偏好到localStorage
function saveTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

// 应用主题到DOM
function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  const body = document.body

  // 移除所有主题类
  root.removeAttribute('data-theme')
  body.removeAttribute('data-theme')

  // 应用新主题
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
    body.setAttribute('data-theme', 'dark')
    isDark.value = true
  } else {
    root.setAttribute('data-theme', 'light')
    body.setAttribute('data-theme', 'light')
    isDark.value = false
  }
}

// 更新当前主题
function updateTheme() {
  let actualTheme: 'light' | 'dark'

  if (currentTheme.value === 'system') {
    actualTheme = getSystemTheme()
  } else {
    actualTheme = currentTheme.value
  }

  applyTheme(actualTheme)
}

// 设置主题
export function setTheme(theme: Theme) {
  currentTheme.value = theme
  saveTheme(theme)
  updateTheme()
}

// 切换主题（在light、dark、system之间循环）
export function toggleTheme() {
  const themes: Theme[] = ['light', 'dark', 'system']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  setTheme(themes[nextIndex])
}

// 获取主题显示名称
export function getThemeDisplayName(theme: Theme): string {
  const names = {
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
  }
  return names[theme]
}

// 初始化主题系统
export function initTheme() {
  // 从localStorage恢复保存的主题偏好
  currentTheme.value = getSavedTheme()

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (currentTheme.value === 'system') {
      updateTheme()
    }
  })

  // 监听主题变化
  watch(
    currentTheme,
    () => {
      updateTheme()
    },
    { immediate: true },
  )

  // 初始应用主题
  updateTheme()
}

// 组合式函数
export function useTheme() {
  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    getThemeDisplayName,
    initTheme,
  }
}
