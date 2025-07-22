<template>
  <XProvider :theme="{ token: { colorPrimary: themeColor } }">
    <slot></slot>
  </XProvider>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { XProvider } from 'ant-design-x-vue'

const props = defineProps<{
  theme?: 'light' | 'dark'
  themeColor?: string
}>()

// 计算属性
const isDark = computed(() => props.theme === 'dark')
const themeColor = computed(() => (isDark.value ? '#e64545' : '#ff4d4f'))

// 生成颜色变量
const generateColorPalette = (baseColor: string, isDark: boolean) => {
  // 简单实现，实际项目中可以使用更复杂的算法
  const colors = {
    1: isDark ? adjustBrightness(baseColor, -45) : adjustBrightness(baseColor, 45),
    2: isDark ? adjustBrightness(baseColor, -30) : adjustBrightness(baseColor, 30),
    3: isDark ? adjustBrightness(baseColor, -15) : adjustBrightness(baseColor, 15),
    4: baseColor,
    5: isDark ? adjustBrightness(baseColor, 15) : adjustBrightness(baseColor, -15),
    6: isDark ? adjustBrightness(baseColor, 30) : adjustBrightness(baseColor, -30),
    7: isDark ? adjustBrightness(baseColor, 45) : adjustBrightness(baseColor, -45),
  }

  return colors
}

// 调整颜色亮度
const adjustBrightness = (hex: string, percent: number) => {
  // 将十六进制颜色转换为RGB
  let r = parseInt(hex.substring(1, 3), 16)
  let g = parseInt(hex.substring(3, 5), 16)
  let b = parseInt(hex.substring(5, 7), 16)

  // 调整亮度
  r = Math.max(0, Math.min(255, r + percent))
  g = Math.max(0, Math.min(255, g + percent))
  b = Math.max(0, Math.min(255, b + percent))

  // 转换回十六进制
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g)
    .toString(16)
    .padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

// 设置CSS变量
const setCssVariables = (colorPalette: Record<string, string>, isDark: boolean) => {
  // 设置主题颜色
  document.documentElement.style.setProperty('--color-primary', colorPalette[4])
  document.documentElement.style.setProperty('--color-primary-hover', colorPalette[5])
  document.documentElement.style.setProperty('--color-primary-active', colorPalette[6])
  document.documentElement.style.setProperty('--color-primary-light', colorPalette[3])
  document.documentElement.style.setProperty('--color-primary-lighter', colorPalette[2])
  document.documentElement.style.setProperty('--color-primary-lightest', colorPalette[1])

  // 设置主题色RGB值，用于透明效果
  const r = parseInt(colorPalette[4].substring(1, 3), 16)
  const g = parseInt(colorPalette[4].substring(3, 5), 16)
  const b = parseInt(colorPalette[4].substring(5, 7), 16)
  document.documentElement.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`)

  // 设置背景颜色
  if (isDark) {
    document.documentElement.style.setProperty('--color-bg-1', '#141414')
    document.documentElement.style.setProperty('--color-bg-2', '#1f1f1f')
    document.documentElement.style.setProperty('--color-bg-3', '#2a2a2a')
    document.documentElement.style.setProperty('--color-bg-4', '#353535')
    document.documentElement.style.setProperty('--color-bg-5', '#404040')

    document.documentElement.style.setProperty('--color-text', '#fff')
    document.documentElement.style.setProperty('--color-text-1', 'rgba(255, 255, 255, 0.85)')
    document.documentElement.style.setProperty('--color-text-2', 'rgba(255, 255, 255, 0.65)')
    document.documentElement.style.setProperty('--color-text-3', 'rgba(255, 255, 255, 0.45)')
    document.documentElement.style.setProperty('--color-text-4', 'rgba(255, 255, 255, 0.25)')

    document.documentElement.style.setProperty('--color-border', '#303030')
    document.documentElement.style.setProperty('--color-divider', '#303030')

    document.documentElement.style.setProperty('--shadow-1', '0 1px 2px 0 rgba(0, 0, 0, 0.5)')
    document.documentElement.style.setProperty(
      '--shadow-2',
      '0 3px 6px -4px rgba(0, 0, 0, 0.5), 0 6px 16px 0 rgba(0, 0, 0, 0.4), 0 9px 28px 8px rgba(0, 0, 0, 0.3)',
    )
  } else {
    document.documentElement.style.setProperty('--color-bg-1', '#ffffff')
    document.documentElement.style.setProperty('--color-bg-2', '#f5f5f5')
    document.documentElement.style.setProperty('--color-bg-3', '#f0f0f0')
    document.documentElement.style.setProperty('--color-bg-4', '#e6e6e6')
    document.documentElement.style.setProperty('--color-bg-5', '#d9d9d9')

    document.documentElement.style.setProperty('--color-text', '#000')
    document.documentElement.style.setProperty('--color-text-1', 'rgba(0, 0, 0, 0.85)')
    document.documentElement.style.setProperty('--color-text-2', 'rgba(0, 0, 0, 0.65)')
    document.documentElement.style.setProperty('--color-text-3', 'rgba(0, 0, 0, 0.45)')
    document.documentElement.style.setProperty('--color-text-4', 'rgba(0, 0, 0, 0.25)')

    document.documentElement.style.setProperty('--color-border', '#e8e8e8')
    document.documentElement.style.setProperty('--color-divider', '#e8e8e8')

    document.documentElement.style.setProperty('--shadow-1', '0 1px 2px 0 rgba(0, 0, 0, 0.05)')
    document.documentElement.style.setProperty(
      '--shadow-2',
      '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    )
  }

  // 设置其他变量
  document.documentElement.style.setProperty('--border-radius-base', '4px')
  document.documentElement.style.setProperty('--border-radius-sm', '2px')
  document.documentElement.style.setProperty('--border-radius-lg', '8px')
  document.documentElement.style.setProperty('--transition-duration', '0.3s')
}

// 监听主题和颜色变化
watch(
  [themeColor, isDark],
  ([newColor, newIsDark]) => {
    const colorPalette = generateColorPalette(newColor, newIsDark)
    setCssVariables(colorPalette, newIsDark)
  },
  { immediate: true },
)

// 组件挂载时设置主题
onMounted(() => {
  const colorPalette = generateColorPalette(themeColor.value, isDark.value)
  setCssVariables(colorPalette, isDark.value)
})
</script>

<style lang="scss">
.theme-provider {
  width: 100%;
  height: 100%;
}

:root {
  // 基础变量
  --border-radius-base: 4px;
  --border-radius-sm: 2px;
  --border-radius-lg: 8px;
  --transition-duration: 0.3s;
}
</style>
