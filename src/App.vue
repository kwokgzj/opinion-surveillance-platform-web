<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/utils/theme'

const { initTheme } = useTheme()

onMounted(() => {
  console.log('App mounted')
  // 初始化主题系统
  initTheme()
})
</script>

<template>
  <RouterView />
</template>

<style lang="less" scoped></style>
