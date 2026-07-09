<template>
	<view class="page" :style="themeStyle" :class="{ 'fullscreen-active': isFullscreen }">
		<!-- 播放器区域 -->
		<view class="player-area" @tap="onPlayerTap">
			<video id="live-player" :key="videoKey" :src="videoUrl" :autoplay="hasSource" :muted="muted"
				:controls="isFullscreen" :page-gesture="true" :show-mute-btn="true" :enable-progress-gesture="false"
				object-fit="contain" :title="currentChannelName" :enable-play-gesture="true" :vslide-gesture="true"
				:vslide-gesture-in-fullscreen="true" :mobilenet-hint-type="1" :http-cache="false" :is-live="true"
				play-btn-position="center" :rate="playbackRate" style="width: 100%; height: 100%" @error="onVideoError"
				@fullscreenchange="onFullscreenChange" @play="onPlay" @pause="onPause" />

			<!-- 频道信息浮层（非全屏时显示在播放器上方） -->
			<view class="player-info" v-if="currentChannelName && !isFullscreen">
				<view class="player-info-bg">
					<text class="player-channel-name">{{ currentChannelName }}</text>
					<text class="player-channel-line" v-if="lineCount > 1">源{{ currentLine + 1 }}</text>
				</view>
			</view>

			<!-- 加载/错误提示 -->
			<view class="player-status" v-if="!hasSource && loading">
				<uni-icons type="spinner-cycle" size="36" color="#888" />
				<text class="status-text">加载中...</text>
			</view>
			<view class="player-status" v-else-if="errorMsg">
				<uni-icons type="closeempty" size="36" color="#fe8027" />
				<text class="status-text error">{{ errorMsg }}</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-area" v-if="!isFullscreen">
			<!-- 分组标签栏 -->
			<view class="group-tabs" v-if="groups.length > 0">
				<scroll-view scroll-x show-scrollbar="false" class="group-scroll">
					<text v-for="g in groups" :key="g.name" class="group-tab"
						:class="{ active: currentGroup === g.name }" @tap="switchGroup(g.name)">
						{{ g.name }}
						<text class="group-count" v-if="g.channelCount">({{ g.channelCount }})</text>
					</text>
				</scroll-view>
			</view>

			<!-- 分组为空提示 -->
			<view class="empty-hint" v-if="groups.length === 0 && !loading">
				<text class="empty-text" v-if="!store.subUrl">请先在"我的"页面设置订阅源</text>
				<text class="empty-text" v-else>{{ errorMsg || '未解析到卫视分组，请检查订阅源是否包含 lives 字段' }}</text>
			</view>

			<!-- 频道列表 -->
			<scroll-view class="channel-list" scroll-y @scrolltolower="onLoadMore" v-if="channels.length > 0">
				<view class="channel-item" v-for="(ch, i) in channels" :key="ch.name + i"
					:class="{ playing: isPlaying(ch) }" @tap="switchChannel(ch)">
					<view class="channel-left">
						<image class="channel-logo" v-if="ch.logo" :src="ch.logo" mode="aspectFit" />
						<view v-else class="channel-logo"></view>
						<text class="channel-name">{{ ch.displayName || ch.name }}</text>
					</view>
					<view class="channel-right">
						<text class="channel-line-badge" v-if="ch.urls && ch.urls.length > 1"
							@tap.stop="switchLine(ch)">
							源{{ (ch.currentLine || 0) + 1 }}/{{ ch.urls.length }}
						</text>
					</view>
				</view>
				<uni-load-more :status="loadMoreStatus" />
			</scroll-view>

			<!-- 频道列表为空 -->
			<view class="empty-hint" v-else-if="groups.length > 0 && !loading">
				<text class="empty-text">该分组暂无频道</text>
			</view>
		</view>

		<!-- 全屏时的快捷操作覆盖层（视频上叠加） -->
		<cover-view class="fullscreen-overlay" v-if="isFullscreen && hasSource" @tap="onToggleUI">
			<cover-view class="fs-top" v-if="showFSControls">
				<cover-view class="fs-back" @tap.stop="exitFullscreen">
					<uni-icons type="arrowleft" size="20" color="#fff" />
				</cover-view>
				<cover-view class="fs-title">{{ currentChannelName }}</cover-view>
			</cover-view>
			<cover-view class="fs-bottom" v-if="showFSControls">
				<cover-view class="fs-btn" @tap.stop="prevChannel">
					<uni-icons type="arrowleft" size="20" color="#fff" />
					<cover-view class="fs-btn-label">上一个</cover-view>
				</cover-view>
				<cover-view class="fs-btn" @tap.stop="switchLine(null)">
					<cover-view class="fs-btn-label">换源</cover-view>
					<cover-view class="fs-btn-line">源{{ currentLine + 1 }}</cover-view>
				</cover-view>
				<cover-view class="fs-btn" @tap.stop="nextChannel">
					<cover-view class="fs-btn-label">下一个</cover-view>
					<uni-icons type="arrowright" size="20" color="#fff" />
				</cover-view>
			</cover-view>
		</cover-view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onBeforeUnmount,
		nextTick
	} from 'vue'
	import {
		themeStyle
	} from '@/utils/theme.js'
	import {
		onShow,
		onHide
	} from '@dcloudio/uni-app'
	import {
		store
	} from '@/utils/appState.js'
	import {
		liveInit,
		liveGetGroups,
		liveGetChannels,
		liveGetUrl
	} from '@/utils/api.js'
	import {
		getSetting
	} from '@/utils/store.js'

	// ===== 状态 =====
	const groups = ref([])
	const channels = ref([])
	const currentGroup = ref('')
	const currentChannel = ref(null)
	const videoUrl = ref('')
	const videoKey = ref(0)
	const hasSource = ref(false)
	const loading = ref(false)
	const errorMsg = ref('')
	const isFullscreen = ref(false)
	const showFSControls = ref(false)
	const muted = ref(true)
	const playbackRate = ref(1)
	const currentLine = ref(0)
	const lineCount = ref(1)
	const loadMoreStatus = ref('more')
	let videoContext = null
	let fsTimer = null
	let channelList = {} // 按分组缓存频道列表
	let isInitialized = false // 防止重复初始化

	const currentChannelName = computed(() => {
		return currentChannel.value?.displayName || currentChannel.value?.name || ''
	})

	function isPlaying(ch) {
		return currentChannel.value && ch.name === currentChannel.value.name
	}

	// ===== 生命周期 =====
	onMounted(() => {
		muted.value = getSetting('video_muted', true)
		uni.$on('mutedChanged', (v) => {
			muted.value = v
		})
		uni.$on('subUpdated', onSubUpdated)
		initLive()
	})

	onShow(() => {
		// 如果还没初始化或订阅已变更，重新加载
		if (!isInitialized) {
			initLive()
		}
	})

	onHide(() => {
		clearFSTimer()
	})

	onBeforeUnmount(() => {
		uni.$off('mutedChanged')
		uni.$off('subUpdated', onSubUpdated)
		clearFSTimer()
	})

	/** 订阅源变更时重新加载 */
	function onSubUpdated() {
		isInitialized = false
		channelList = {}
		currentChannel.value = null
		hasSource.value = false
		videoUrl.value = ''
		initLive()
	}

	// ===== 初始化 =====
	async function initLive() {

		if (!store.subUrl) {
	
			loading.value = false
			return
		}
		loading.value = true
		errorMsg.value = ''
		try {
			// 主动初始化直播订阅源（不依赖 App.vue initApp 的时序，避免静默失败）
			try {
		
				const initRet = await liveInit(store.subUrl)
		
			} catch (e) {
		
				errorMsg.value = '直播订阅初始化失败: ' + (e.message || '')
			}
	
			const gList = await liveGetGroups()
	
			groups.value = gList || []
			if (groups.value.length > 0) {
		
				await switchGroup(groups.value[0].name)
			} else {
		
			}
			isInitialized = true
		} catch (e) {
	
			errorMsg.value = '加载卫视数据失败: ' + (e.message || '')
		} finally {
			loading.value = false
		}
	}

	// ===== 分组切换 =====
	async function switchGroup(name) {
		if (!name) return

		// 相同分组且有缓存时跳过
		if (name === currentGroup.value && channels.value.length > 0) {
	
			return
		}
		currentGroup.value = name
		loading.value = true
		errorMsg.value = ''
		// 先检查缓存
		if (channelList[name]) {
	
			channels.value = channelList[name]
			loading.value = false
			return
		}
		try {
	
			const chList = await liveGetChannels(name)
	
			if (chList && chList.length > 0) {
		
			}
			channelList[name] = chList || []
			channels.value = channelList[name]
		} catch (e) {
	
			errorMsg.value = '加载频道列表失败'
		} finally {
			loading.value = false
		}
	}

	// ===== 频道切换 =====
	async function switchChannel(ch) {
		if (!ch || !ch.name) return

		if (ch.name === currentChannel.value?.name && hasSource.value) {
	
			return
		}
		currentChannel.value = ch
		currentLine.value = ch.currentLine || 0
		lineCount.value = (ch.urls && ch.urls.length) || 1

		hasSource.value = false
		videoUrl.value = ''
		loading.value = true
		errorMsg.value = ''
		try {
	
			const result = await liveGetUrl(ch.name, currentGroup.value, currentLine.value)
	
			if (result && result.url) {
		
				videoKey.value++
				videoUrl.value = result.url
				hasSource.value = true
			} else {
		
				errorMsg.value = '未获取到播放地址'
			}
		} catch (e) {
	
			errorMsg.value = e.message || '获取播放地址失败'
			// 尝试降级到下一线路
			if (lineCount.value > 1) {
		
				tryAutoSwitchLine()
			}
		} finally {
			loading.value = false
		}
	}

	// ===== 换源（线路切换） =====
	async function switchLine(ch, delta = 1) {
		const target = ch || currentChannel.value
		if (!target || !target.urls || target.urls.length <= 1) return
		const line = ((target.currentLine || 0) + delta + target.urls.length) % target.urls.length
		target.currentLine = line
		currentLine.value = line
		if (target === currentChannel.value) {
			hasSource.value = false
			videoUrl.value = ''
			loading.value = true
			errorMsg.value = ''
			try {
				const result = await liveGetUrl(target.name, currentGroup.value, line)
				if (result && result.url) {
					videoKey.value++
					videoUrl.value = result.url
					hasSource.value = true
				}
			} catch (e) {
				errorMsg.value = e.message || '换源失败'
			} finally {
				loading.value = false
			}
		}
	}

	// 自动尝试切下一线路
	async function tryAutoSwitchLine() {
		if (currentChannel.value && lineCount.value > 1) {
			const nextLine = (currentLine.value + 1) % lineCount.value
			if (nextLine !== currentLine.value) {
				currentChannel.value.currentLine = nextLine
				currentLine.value = nextLine
				try {
					const result = await liveGetUrl(currentChannel.value.name, currentGroup.value, nextLine)
					if (result && result.url) {
						videoKey.value++
						videoUrl.value = result.url
						hasSource.value = true
						errorMsg.value = ''
						uni.showToast({
							title: `已切换至源${nextLine + 1}`,
							icon: 'none'
						})
					}
				} catch {}
			}
		}
	}

	// ===== 上下频道 =====
	function prevChannel() {
		if (channels.value.length === 0) return
		const idx = channels.value.findIndex(ch => ch.name === currentChannel.value?.name)
		if (idx > 0) switchChannel(channels.value[idx - 1])
	}

	function nextChannel() {
		if (channels.value.length === 0) return
		const idx = channels.value.findIndex(ch => ch.name === currentChannel.value?.name)
		if (idx < channels.value.length - 1) switchChannel(channels.value[idx + 1])
	}

	// ===== 全屏控制 =====
	function onPlayerTap() {
		if (!hasSource.value) return
		if (!isFullscreen.value) {
			enterFullscreen()
		} else {
			toggleFSControls()
		}
	}

	function enterFullscreen() {
		nextTick(() => {
			videoContext = videoContext || uni.createVideoContext('live-player')
			videoContext.requestFullScreen({
				direction: 0 // 自动横屏
			})
		})
	}

	function exitFullscreen() {
		if (videoContext) {
			videoContext.exitFullScreen()
		}
	}

	function onFullscreenChange(e) {
		isFullscreen.value = e.detail.fullscreen
		if (e.detail.fullscreen) {
			showFSControls.value = true
			setFSTimer()
		} else {
			showFSControls.value = false
			clearFSTimer()
		}
	}

	function toggleFSControls() {
		showFSControls.value = !showFSControls.value
		if (showFSControls.value) setFSTimer()
	}

	function onToggleUI() {
		toggleFSControls()
	}

	function setFSTimer() {
		clearFSTimer()
		fsTimer = setTimeout(() => {
			showFSControls.value = false
		}, 4000)
	}

	function clearFSTimer() {
		if (fsTimer) {
			clearTimeout(fsTimer)
			fsTimer = null
		}
	}

	function onPlay() {}

	function onPause() {}

	// ===== 错误处理 =====
	function onVideoError() {
		if (currentChannel.value) {
			uni.showToast({
				title: '播放失败，尝试切换线路',
				icon: 'none'
			})
			tryAutoSwitchLine()
		}
	}

	function onLoadMore() {
		loadMoreStatus.value = 'noMore'
	}

	// ===== 调试暴露 =====
	if (typeof uni !== 'undefined') {
		// 暴露给全局调试
	}
</script>

<style lang="scss" scoped>
	.page {
		background: var(--bg-primary);
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		&.fullscreen-active {
			background: #000;
		}
	}

	/* ===== 播放器区域 ===== */
	.player-area {
		position: relative;
		width: 100%;
		height: 44vh;
		background: #000;
		overflow: hidden;
		flex-shrink: 0;
	}

	.player-info {
		position: absolute;
		bottom: 16rpx;
		left: 16rpx;
		right: 16rpx;
		z-index: 10;
		pointer-events: none;
	}

	.player-info-bg {
		display: inline-flex;
		align-items: center;
		gap: 12rpx;
		background: rgba(0, 0, 0, 0.6);
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
	}

	.player-channel-name {
		font-size: 26rpx;
		color: #fff;
		font-weight: 600;
	}

	.player-channel-line {
		font-size: 22rpx;
		color: #fe8027;
		background: rgba(254, 128, 39, 0.2);
		padding: 2rpx 12rpx;
		border-radius: 20rpx;
	}

	.player-status {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		z-index: 5;
		pointer-events: none;
	}

	.status-text {
		font-size: 26rpx;
		color: #999;

		&.error {
			color: #fe8027;
		}
	}

	/* ===== 内容区域 ===== */
	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--bg-primary);
	}

	/* ===== 分组标签栏 ===== */
	.group-tabs {
		flex-shrink: 0;
		background: var(--card);
		padding: 16rpx 0;
		border-bottom: 1rpx solid var(--border);
	}

	.group-scroll {
		display: flex;
		flex-direction: row;
		white-space: nowrap;
		padding: 0 16rpx;
	}

	.group-tab {
		display: inline-flex;
		align-items: center;
		padding: 10rpx 24rpx;
		margin-right: 12rpx;
		border-radius: 30rpx;
		background: var(--card-hover);
		font-size: 24rpx;
		color: var(--text-secondary);
		transition: all 0.15s;

		&.active {
			background: var(--accent);
			color: #fff;
			font-weight: 600;
		}

		&:active {
			opacity: 0.7;
		}
	}

	.group-count {
		font-size: 20rpx;
		margin-left: 6rpx;
		opacity: 0.7;
	}

	/* ===== 频道列表 ===== */
	.channel-list {
		flex: 1;
		overflow-y: auto;
		padding: 8rpx 12rpx;
	}

	.channel-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18rpx 16rpx;
		margin-bottom: 4rpx;
		border-radius: 12rpx;
		background: var(--card);
		transition: all 0.15s;
		border-left: 6rpx solid transparent;

		&:active {
			opacity: 0.8;
		}

		&.playing {
			background: rgba(231, 76, 60, 0.08);
			border-left: 6rpx solid var(--accent);
		}
	}

	.channel-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex: 1;
		min-width: 0;
	}

	.channel-logo {
		width: 48rpx;
		height: 48rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		background: #333;
	}

	.channel-num {
		font-size: 24rpx;
		color: var(--text-secondary);
		font-weight: 500;
		min-width: 48rpx;
		flex-shrink: 0;
	}

	.channel-name {
		font-size: 28rpx;
		color: var(--text-primary);
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.channel-right {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.channel-line-badge {
		font-size: 20rpx;
		color: var(--accent);
		background: rgba(254, 128, 39, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	/* ===== 空状态 ===== */
	.empty-hint {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx 40rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: var(--text-secondary);
		text-align: center;
		line-height: 1.6;
	}

	/* ===== 全屏覆盖层 ===== */
	.fullscreen-overlay {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 999;
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.fs-top {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
	}

	.fs-back {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fs-title {
		font-size: 28rpx;
		color: #fff;
		font-weight: 600;
		margin-left: 16rpx;
	}

	.fs-bottom {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 60rpx;
		padding: 30rpx 40rpx;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
	}

	.fs-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 24rpx;
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.1);
		min-width: 120rpx;
	}

	.fs-btn-label {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.fs-btn-line {
		font-size: 20rpx;
		color: #fe8027;
	}
</style>