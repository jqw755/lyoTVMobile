/**
 * 播放器共享组合式函数
 * 提取 live.vue 和 detail.vue 中的公共逻辑：
 *  - 倍速控制（playbackRate / speedOptions / showSpeed / showSidebar）
 *  - 全屏状态跟踪 + 退出全屏
 *  - 自动隐藏定时器（setControlsTimer / clearControlsTimer）
 *  - 静音状态
 *  - videoKey 重建 & videoContext 管理
 */
import { ref, onBeforeUnmount } from 'vue'

export function useVideoPlayer(videoId) {
	const videoKey = ref(0)
	const muted = ref(true)
	const playbackRate = ref(1)
	const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]
	const showSpeed = ref(false)
	const showSidebar = ref(false)
	const isFullscreen = ref(false)

	let videoContext = null
	let controlsTimer = null

	// ===== Video Context =====
	function createVideoContext() {
		videoContext = uni.createVideoContext(videoId)
		return videoContext
	}

	function getVideoContext() {
		return videoContext
	}

	// ===== 自动隐藏定时器（各页面传入自己的回调） =====
	function setControlsTimer(callback, delay = 4000) {
		clearControlsTimer()
		controlsTimer = setTimeout(callback, delay)
	}

	function clearControlsTimer() {
		if (controlsTimer) {
			clearTimeout(controlsTimer)
			controlsTimer = null
		}
	}

	// ===== 倍速控制 =====
	// 同时更新响应式属性和原生 VideoContext，兼容 App 端原生 video。
	function applyPlaybackRate(s) {
		const rate = Number(s)
		if (!Number.isFinite(rate) || rate <= 0) return
		playbackRate.value = rate
		try {
			const context = videoContext || createVideoContext()
			if (context && typeof context.playbackRate === 'function') {
				context.playbackRate(rate)
			}
		} catch (e) {}
	}

	function selectSpeed(s) {
		applyPlaybackRate(s)
		showSidebar.value = false
		// 选中后短暂显示倍速按钮再自动隐藏
		showSpeed.value = true
		setControlsTimer(() => { showSpeed.value = false }, 4000)
	}

	function onSpeedBtnTap() {
		showSidebar.value = true
		clearControlsTimer()
	}

	function closeSidebar() {
		showSidebar.value = false
		showSpeed.value = true
		setControlsTimer(() => { showSpeed.value = false }, 4000)
	}

	function showSpeedTemporarily() {
		showSpeed.value = true
		clearControlsTimer()
		setControlsTimer(() => { showSpeed.value = false }, 4000)
	}

	function getDisplayRate() {
		return playbackRate.value.toFixed(1)
	}

	// ===== 全屏 =====
	function onFullscreenChange(e) {
		isFullscreen.value = e.detail.fullscreen
		if (!e.detail.fullscreen) {
			showSpeed.value = false
			showSidebar.value = false
		}
	}

	function exitFullscreen() {
		if (videoContext) videoContext.exitFullScreen()
	}

	// ===== 静音 =====
	function toggleMute() {
		muted.value = !muted.value
	}

	// 销毁时清理定时器
	onBeforeUnmount(() => {
		clearControlsTimer()
	})

	return {
		// 状态
		videoKey, muted, playbackRate, speedOptions,
		showSpeed, showSidebar, isFullscreen,
		// 方法
		createVideoContext, getVideoContext,
		setControlsTimer, clearControlsTimer,
		applyPlaybackRate, selectSpeed, onSpeedBtnTap, closeSidebar,
		showSpeedTemporarily, getDisplayRate,
		onFullscreenChange, exitFullscreen, toggleMute,
	}
}
