<template>
	<view :class="themeClass" />
</template>

<script setup>
 import {
  ref,
  computed,
  onMounted,
  onUnmounted
 } from 'vue'
 import {
  onHide
 } from '@dcloudio/uni-app'
 import {
  initApp
 } from '@/utils/api.js'
 import {
   initAuth,
   flushPreferences,
   loadLocalPreferences,
   getSetting
  } from '@/utils/store.js'

  const isLight = ref(false)
  const themeClass = computed(() => isLight.value ? 'light' : '')

  /** 统一应用主题 */
  function applyTheme(themeVal) {
   isLight.value = themeVal === 'light'
  }

 onMounted(async () => {
   // 1. 从本地缓存加载偏好（未登录也能用上次设定）
   loadLocalPreferences()
   // 2. 读取主题并应用
   applyTheme(getSetting('theme', 'dark'))
   // 3. 初始化登录态（如果已登录，_loadProfile 会用云端偏好覆盖 _preferences）
   await initAuth()
   // 4. 登录后重新读取主题（云端可能覆盖了本地缓存的值）
   applyTheme(getSetting('theme', 'dark'))
   // 5. 启动订阅源并拉取首页
   initApp()
   // 6. 监听主题变化（来自 mine.vue 的切换）
   uni.$on('themeChange', (val) => {
    applyTheme(val)
   })
   // 7. 监听登录/退出导致的偏好变化
   uni.$on('preferencesLoaded', (prefs) => {
    if (prefs && typeof prefs === 'object' && 'theme' in prefs) {
     applyTheme(prefs.theme)
    } else if (!prefs) {
     // 退出登录 → 重置为默认
     applyTheme('dark')
    }
   })
  })

 // App 进入后台时提交待同步的偏好设置
 onHide(() => {
  flushPreferences()
 })

 // 组件卸载时清理全局监听
 onUnmounted(() => {
  uni.$off('themeChange')
  uni.$off('preferencesLoaded')
 })
</script>

<style>
	/* 全局样式已在 uni.scss 定义 */
</style>