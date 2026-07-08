<template>
	<view />
</template>

<script setup>
	import {
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
		flushProfile,
		loadLocalPreferences
	} from '@/utils/store.js'
	import {
		initTheme,
		setTheme
	} from '@/utils/theme.js'

	onMounted(async () => {
		// 1. 读取主题（theme ref 响应式，各页面 :style="themeStyle" 自动跟随）
		initTheme()
		// 2. 从本地缓存加载偏好（未登录也能用上次设定）
		loadLocalPreferences()
		// 3. 初始化登录态（已登录则用云端偏好覆盖本地）
		await initAuth()
		// 4. 登录后重新读取主题（云端可能覆盖了本地缓存的值）
		initTheme()
		// 5. 启动订阅源并拉取首页
		initApp()
		// 6. 监听登录/退出导致的偏好变化
		uni.$on('preferencesLoaded', (prefs) => {
			if (prefs && typeof prefs === 'object' && 'theme' in prefs) {
				initTheme()
			} else if (!prefs) {
				// 退出登录 -> 重置为默认深色
				setTheme('dark')
			}
		})
	})

	// App 进入后台时提交待同步的偏好设置和历史记录
	onHide(() => {
		flushPreferences()
		flushProfile()
	})

	// 监听 token 过期事件 -> 弹登录失效提示 -> 跳转登录页
	let _tokenExpiredTimer = null
	uni.$on('auth:tokenExpired', () => {
		// 防抖：短时间内多次 401 只弹一次
		if (_tokenExpiredTimer) return
		_tokenExpiredTimer = setTimeout(() => {
			_tokenExpiredTimer = null
		}, 5000)

		uni.showModal({
			title: '登录已失效',
			content: '您的登录状态已过期，请重新登录',
			confirmText: '去登录',
			cancelText: '暂不登录',
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			}
		})
	})

	// 组件卸载时清理全局监听
	onUnmounted(() => {
		uni.$off('themeChange')
		uni.$off('preferencesLoaded')
	})
</script>

<style>
	/* 滚动条隐藏 */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
	}
</style>