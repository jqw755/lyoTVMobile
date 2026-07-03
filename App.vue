<template>
  <view :class="themeClass">
    <page-meta
      :page-style="'overflow:hidden;background:#f4f4f4'"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { initApp } from '@/utils/api.js'

const isLight = ref(false)
const themeClass = computed(() => isLight.value ? 'light' : '')

onMounted(async () => {
  try {
    const saved = uni.getStorageSync('lyotv_theme')
    isLight.value = saved === 'light'
  } catch {}
  // 监听主题变化（来自其他页面的修改）
  uni.$on('themeChange', (val) => {
    isLight.value = val === 'light'
  })
  // 启动时自动加载已存储的订阅源并拉取首页
  initApp()
})

// 暴露给全局使用
if (typeof uni !== 'undefined') {
  uni.$lyotvTheme = {
    get() { return isLight.value ? 'light' : 'dark' },
    set(val) {
      isLight.value = val === 'light'
      uni.setStorageSync('lyotv_theme', val)
      uni.$emit('themeChange', val)
    }
  }
}
</script>

<style>
/* 全局样式已在 uni.scss 定义 */
</style>
