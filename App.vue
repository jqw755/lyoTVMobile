<template>
	<view :class="themeClass" />
	</template>

<script setup>
 import {
  ref,
  computed,
  onMounted
 } from 'vue'
 import {
  onHide
 } from '@dcloudio/uni-app'
 import {
  initApp
 } from '@/utils/api.js'
 import {
  initAuth,
  getSetting,
  flushPreferences
 } from '@/utils/store.js'

 const isLight = ref(false)
 const themeClass = computed(() => isLight.value ? 'light' : '')

 onMounted(async () => {
  // 初始化 Supabase 登录态
  await initAuth()

  // 从云端读取主题偏好
  const theme = getSetting('theme', 'dark')
  isLight.value = theme === 'light'

  // 监听主题变化（来自其他页面的修改）
  uni.$on('themeChange', (val) => {
   isLight.value = val === 'light'
   // 同步到 :root/html 元素，确保 page 背景色也生效
   applyThemeToRoot(isLight.value)
  })
  // 启动时同步一次
  applyThemeToRoot(isLight.value)
  // 启动时自动加载已存储的订阅源并拉取首页
  initApp()
 })

 // App 进入后台时提交待同步的偏好设置
 onHide(() => {
  flushPreferences()
 })

	function applyThemeToRoot(light) {
		// #ifdef H5
		document.documentElement.classList.toggle('light', light)
		// #endif
	}

	// 暴露给全局使用
	if (typeof uni !== 'undefined') {}
</script>

<style>
	/* 全局样式已在 uni.scss 定义 */
</style>