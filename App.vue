<template>
  <view :class="themeClass">
    <page-meta
      :page-style="'overflow:hidden;background:' + (isLight ? '#f5f5f5' : '#141414')"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const isLight = ref(false)
const themeClass = computed(() => isLight.value ? 'light' : '')

onMounted(() => {
  try {
    const saved = uni.getStorageSync('lyotv_theme')
    isLight.value = saved === 'light'
  } catch {}
  // 监听主题变化（来自其他页面的修改）
  uni.$on('themeChange', (val) => {
    isLight.value = val === 'light'
  })
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
