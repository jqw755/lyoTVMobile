<template>
	<view>
		<!-- 全局浮动调试按钮（点击展开/收起日志面板） -->
		<view class="debug-fab" @tap="togglePanel">
			<text class="debug-fab-icon">🐛</text>
		</view>

		<!-- 调试日志面板 -->
		<view class="debug-panel" v-if="panelVisible.value">
			<view class="debug-header">
				<text class="debug-title">调试日志</text>
				<view class="debug-actions">
					<text class="debug-action" @tap="copyDebugLogs">复制</text>
					<text class="debug-action" @tap="clearDebugLogs">清空</text>
					<text class="debug-action close" @tap="togglePanel">✕</text>
				</view>
			</view>
			<scroll-view scroll-y class="debug-scroll">
				<text v-for="(line, i) in debugLogs" :key="i" class="debug-line">{{ line.text }}</text>
				<text v-if="debugLogs.length === 0" class="debug-line dim">（暂无日志）</text>
			</scroll-view>
		</view>
	</view>
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
		loadLocalPreferences,
		getSetting
	} from '@/utils/store.js'
	import {
		initTheme
	} from '@/utils/theme.js'
	import {
		debugLog,
		debugLogs,
		panelVisible,
		togglePanel,
		clearDebugLogs,
		copyDebugLogs
	} from '@/utils/debugLogger.js'

	const handlePreferencesLoaded = (prefs) => {
		debugLog('APP', 'preferencesLoaded fired, prefs=', prefs)
		// 主题使用共享 ref，重新读取后所有已挂载页面都会立即更新。
		initTheme()
		// 通知当前仍挂载的 tab 页和播放器即时应用其余偏好。
		uni.$emit('gridColsChanged', getSetting('grid_cols', 3))
		uni.$emit('mutedChanged', getSetting('video_muted', true))
		uni.$emit('longPressSpeedChanged', getSetting('long_press_speed', 2))
	}

	onMounted(async () => {
	   debugLog('APP', 'App onMounted 开始')
	   // 1. 先加载本地偏好，再初始化主题，避免首次渲染使用错误的默认值。
	   loadLocalPreferences()
	   initTheme()
	   // 2. 先注册监听器，避免 initAuth 内部 emit 的 preferencesLoaded 漏掉。
	   uni.$on('preferencesLoaded', handlePreferencesLoaded)
	   // 4. 与 fongmi HomeActivity 一致：订阅配置从启动时就并行预热，不等待云端认证。
	   const appInitPromise = initApp()
	   // 5. 初始化登录态（已登录则用云端偏好覆盖本地）
	   await initAuth()
	   // 6. 登录后重新读取主题（云端可能覆盖了本地缓存的值）
	   initTheme()
	   // 页面不等待配置网络请求；首页和卫视页各自复用同一初始化 Promise。
	   appInitPromise.catch(() => {})
	   debugLog('APP', 'App onMounted 完成')
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
		uni.$off('preferencesLoaded', handlePreferencesLoaded)
	})
</script>

<style>
	/* 滚动条隐藏 */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
	}

	/* ===== 全局浮动调试按钮 ===== */
	.debug-fab {
		position: fixed;
		right: 16rpx;
		top: 50%;
		transform: translateY(-50%);
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99999;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.4);
	}
	.debug-fab-icon {
		font-size: 36rpx;
		line-height: 1;
	}
	.debug-fab:active {
		opacity: 0.7;
		transform: translateY(-50%) scale(0.9);
	}

	/* ===== 调试日志面板 ===== */
	.debug-panel {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 99998;
		background: rgba(0, 0, 0, 0.92);
		border-top: 3rpx solid #fe8027;
		max-height: 50vh;
		display: flex;
		flex-direction: column;
	}
	.debug-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10rpx 20rpx;
		background: rgba(254, 128, 39, 0.15);
		flex-shrink: 0;
	}
	.debug-title {
		font-size: 24rpx;
		color: #fe8027;
		font-weight: 700;
	}
	.debug-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	.debug-action {
		font-size: 22rpx;
		color: #ccc;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		background: rgba(255, 255, 255, 0.08);
	}
	.debug-action:active {
		opacity: 0.6;
	}
	.debug-action.close {
		font-size: 28rpx;
		background: none;
		padding: 4rpx 8rpx;
		color: #fff;
	}
	.debug-scroll {
		flex: 1;
		overflow-y: auto;
		padding: 8rpx 16rpx;
		max-height: calc(50vh - 80rpx);
	}
	.debug-line {
		display: block;
		font-size: 18rpx;
		color: #bbb;
		line-height: 1.6;
		font-family: monospace;
		word-break: break-all;
		white-space: pre-wrap;
	}
	.debug-line.dim {
		color: #555;
	}
</style>