<template>
	<view class="page" :style="themeStyle">
		<!-- 顶部背景区 -->
		<view class="header-bg" :style="{ paddingTop: (statusBarHeight + 10) + 'px' }">
			<view class="title-bar">
				<view class="title-bar-left">
					<uni-icons type="left" size="24" color="#888" @tap="goBack" />
					<text class="title-bar-title">我的收藏</text>
				</view>
				<view class="title-bar-icons">
					<text v-if="isEditing" class="title-bar-clear" @tap="onClearAll">清空全部</text>
					<text v-if="isEditing" class="title-bar-done" @tap="exitEditMode">完成</text>
					<uni-icons v-else type="trash" size="22" color="#888" @tap="enterEditMode" />
				</view>
			</view>
		</view>

		<!-- 空状态：未登录 -->
		<view class="empty" v-if="!loggedIn">
			<uni-icons type="star" size="60" color="#555" />
			<text class="empty-text">请先登录</text>
			<text class="empty-sub">登录后收藏数据将同步到云端</text>
			<view class="login-btn" @tap="goLogin">去登录</view>
		</view>

		<!-- 空状态：无收藏 -->
		<view class="empty" v-else-if="list.length === 0 && !loading">
			<uni-icons type="star" size="60" color="#555" />
			<text class="empty-text">暂无收藏</text>
			<text class="empty-sub">去首页发现喜欢的影片吧</text>
		</view>

		<!-- 加载中 -->
		<view class="empty" v-else-if="loading && list.length === 0">
			<uni-icons type="spinner-cycle" size="40" color="#555" />
			<text class="empty-text">加载中...</text>
		</view>

			<!-- 主列表 -->
			<scroll-view v-else class="scroll-body" scroll-y @scrolltolower="onLoadMore" lower-threshold="100">
			 <!-- 按时间线分组渲染 -->
			 <view v-for="(section, si) in visibleSections" :key="si" class="section">
			  <view class="section-header">
			   <text class="section-title">{{ section.key }}</text>
			  </view>
			  <vod-grid :items="section.items" @itemTap="goDetail">
			   <template #overlay="{ item }">
			    <view v-if="isEditing" class="grid-remove" @tap.stop="onRemove(item)">
			     <uni-icons type="closeempty" size="16" color="#fff" />
			    </view>
			   </template>
			  </vod-grid>
			 </view>
				<uni-load-more :status="loadMoreStatus" />
			</scroll-view>

		<!-- ===== 调试面板（定位"云端有数据本地拉不下来"）===== -->
		<view class="debug-panel">
			<view class="debug-header">
				<text class="debug-title">收藏调试日志</text>
				<view class="debug-actions">
					<text class="debug-action" @tap="copyDebugLogs">复制</text>
					<text class="debug-action" @tap="clearDebugLogs">清空</text>
				</view>
			</view>
			<scroll-view scroll-y class="debug-scroll">
				<text v-for="(line, i) in debugLogs" :key="i" class="debug-line">{{ line.text }}</text>
				<text v-if="debugLogs.length === 0" class="debug-line">（无日志，等 onShow 触发）</text>
			</scroll-view>
			<view class="debug-state">
				<text>loggedIn: {{ loggedIn }} | list.length: {{ list.length }} | loading: {{ loading }} | hasMore: {{ hasMore }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import {
		themeStyle
	} from '@/utils/theme.js'
	import {
		onShow,
		onPullDownRefresh
	} from '@dcloudio/uni-app'
	import {
		getFavoritesPaginated,
		removeFavorite,
		addHistory,
		getCurrentUser,
		clearFavorites,
	} from '@/utils/store.js'
	import {
	   useStatusBar
	  } from '@/utils/useStatusBar.js'
	  import {
	   debugLog,
	   debugLogs,
	   clearDebugLogs,
	   copyDebugLogs
	  } from '@/utils/debugLogger.js'

	const {
		statusBarHeight
	} = useStatusBar()

	const PAGE_SIZE = 20

	const list = ref([])
	const loading = ref(false)
	const loggedIn = ref(false)
	const page = ref(1)
	const hasMore = ref(true)
	const isEditing = ref(false)

	  // ===== 调试使用全局 debugLog（见 App.vue 浮动按钮） =====
	  // 直接用 debugLog('FAV', ...) 代替 debugLog('FAV',)

	function groupByTime(items, timeField = 'fav_time') {
		const now = new Date()
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
		const yesterdayStart = todayStart - 86400000
		const dayOfWeek = now.getDay()
		const daysSinceMonday = (dayOfWeek + 6) % 7
		const mondayStart = todayStart - daysSinceMonday * 86400000
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

		const groups = [{
				key: '今天',
				items: []
			},
			{
				key: '昨天',
				items: []
			},
			{
				key: '本周',
				items: []
			},
			{
				key: '本月',
				items: []
			},
			{
				key: '更早',
				items: []
			},
		]

		for (const item of items) {
			const t = item[timeField] || 0
			if (t >= todayStart) {
				groups[0].items.push(item)
			} else if (t >= yesterdayStart) {
				groups[1].items.push(item)
			} else if (t >= mondayStart) {
				groups[2].items.push(item)
			} else if (t >= monthStart) {
				groups[3].items.push(item)
			} else {
				groups[4].items.push(item)
			}
		}
		return groups.filter(g => g.items.length > 0)
	}

	const visibleSections = computed(() => {
	   const result = groupByTime(list.value, 'fav_time')
	   debugLog('FAV', 'visibleSections 计算:', JSON.stringify(result.map(s => ({ key: s.key, count: s.items.length }))))
	   if (list.value.length > 0) {
	    debugLog('FAV', 'list[0].fav_time=', list.value[0].fav_time, 'typeof=', typeof list.value[0].fav_time)
	   }
	   return result
	  })

	const loadMoreStatus = computed(() => {
		if (loading.value) return 'loading'
		if (!hasMore.value) return 'noMore'
		return 'more'
	})

	async function load() {
		debugLog('FAV','load() 开始, getCurrentUser=', getCurrentUser())
		loggedIn.value = !!getCurrentUser()
		debugLog('FAV','loggedIn=', loggedIn.value)
		if (!loggedIn.value) {
			list.value = []
			debugLog('FAV','未登录，list 置空返回')
			return
		}
		loading.value = true
		page.value = 1
		hasMore.value = true
		try {
			debugLog('FAV','调用 getFavoritesPaginated(1, ' + PAGE_SIZE + ')...')
			const result = await getFavoritesPaginated(1, PAGE_SIZE)
			debugLog('FAV','getFavoritesPaginated 返回', result)
			list.value = result.items || []
			hasMore.value = result.hasMore
			debugLog('FAV','list.length=', list.value.length, 'hasMore=', hasMore.value)
			if (list.value.length > 0) {
				debugLog('FAV','第一条 item=', list.value[0])
			}
		} catch (e) {
			debugLog('FAV','load() catch 错误', e?.message || String(e))
			list.value = []
		} finally {
			loading.value = false
			debugLog('FAV','load() finally, loading=false')
		}
	}

	function enterEditMode() {
		isEditing.value = true
	}

	function exitEditMode() {
		isEditing.value = false
	}

	async function onRemove(item) {
		try {
			list.value = await removeFavorite(item.vod_id)
			uni.showToast({
				title: '已删除',
				icon: 'none',
				duration: 3000
			})
		} catch {
			uni.showToast({
				title: '删除失败',
				icon: 'none',
				duration: 3000
			})
		}
	}

	async function onClearAll() {
		if (list.value.length === 0) return
		uni.showModal({
			title: '提示',
			content: '确定清空所有收藏吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						list.value = await clearFavorites()
						isEditing.value = false
						uni.showToast({
							title: '已清空',
							icon: 'success',
							duration: 3000
						})
					} catch {
						uni.showToast({
							title: '清空失败',
							icon: 'none',
							duration: 3000
						})
					}
				}
			},
		})
	}

	function goLogin() {
		uni.navigateTo({
			url: '/pages/login/login'
		})
	}

	function goBack() {
		uni.navigateBack()
	}

	function goDetail(item) {
		if (isEditing.value) return
		addHistory(item)
		uni.navigateTo({
			url: `/pages/detail/detail?id=${item.vod_id}&key=${item.site_key || ''}`
		})
	}

	async function onLoadMore() {
		if (loading.value || !hasMore.value) return
		loading.value = true
		try {
			const nextPage = page.value + 1
			const result = await getFavoritesPaginated(nextPage, PAGE_SIZE)
			if (result.items.length > 0) {
				list.value = [...list.value, ...result.items]
				page.value = nextPage
			}
			hasMore.value = result.hasMore
		} catch {
			// 加载下一页失败，静默处理
		} finally {
			loading.value = false
		}
	}

	onShow(() => {
		debugLog('FAV','=== onShow 触发 ===')
		load()
	})

	onPullDownRefresh(() => {
		load().finally(() => uni.stopPullDownRefresh())
	})
</script>

<style lang="scss" scoped>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-primary);
	}

	/* ===== 顶部背景 + 自定义标题栏 ===== */
	.header-bg {
		flex-shrink: 0;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(254, 128, 39, 0.18) 0%, transparent 85%),
			linear-gradient(180deg, var(--gradient-from) 0%, var(--gradient-to) 80%);
		background-color: var(--bg-primary);
	}

	.title-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10rpx 24rpx 20rpx;
	}

	.title-bar-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.title-bar-title {
		font-size: 40rpx;
		font-weight: var(--weight-bold);
		color: var(--text-primary);
	}

	.title-bar-icons {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.title-bar-clear {
		font-size: 24rpx;
		color: var(--text-secondary);
		padding: 6rpx 16rpx;

		&:active {
			opacity: 0.6;
		}
	}

	.title-bar-done {
		font-size: 26rpx;
		color: $theme-accent;
		font-weight: 600;
		padding: 6rpx 12rpx;

		&:active {
			opacity: 0.7;
		}
	}

	/* ===== 空状态 ===== */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;
		gap: 12rpx;

		&-text {
			font-size: var(--text-lg);
			letter-spacing: var(--tracking-wide);
			color: var(--text-secondary);
			margin-top: 16rpx;
		}

		&-sub {
			font-size: var(--text-sm);
			color: #555;
		}

		.login-btn {
			margin-top: 24rpx;
			padding: 16rpx 60rpx;
			background: $theme-accent;
			border-radius: 40rpx;
			color: #fff;
			font-size: 28rpx;
			font-weight: 600;

			&:active {
				opacity: 0.8;
			}
		}
	}

	/* ===== 滚动区域 ===== */
	.scroll-body {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 40rpx;
	}

	/* ===== 时间线分组标题 ===== */
	.section {
		margin-top: 12rpx;
	}

	.section-header {
		padding: 20rpx 24rpx 8rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: var(--weight-bold);
		color: var(--text-primary);
		position: relative;
		padding-left: 20rpx;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 6rpx;
			height: 28rpx;
			background: $theme-accent;
			border-radius: 3rpx;
		}
	}

	/* 编辑模式删除按钮 — 全圆灰底 */
	.grid-remove {
		position: absolute;
		top: -12rpx;
		right: -12rpx;
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		background: rgba(150, 150, 150, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);

		&:active {
			opacity: 0.7;
			transform: scale(0.9);
		}
	}

	.grid-info {
		padding: 10rpx 8rpx 12rpx;
	}

	.grid-title {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--text-primary);
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ===== 调试面板 ===== */
	.debug-panel {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		background: rgba(0,0,0,0.92);
		border-top: 2rpx solid #fe8027;
		max-height: 360rpx;
		display: flex;
		flex-direction: column;
	}
	.debug-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8rpx 16rpx;
		background: rgba(254,128,39,0.15);
	}
	.debug-title {
		font-size: 22rpx;
		color: #fe8027;
		font-weight: 600;
	}
	.debug-actions {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}
	.debug-action {
		font-size: 20rpx;
		color: #ccc;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		background: rgba(255,255,255,0.08);
	}
	.debug-action:active {
		opacity: 0.6;
	}
	.debug-scroll {
		flex: 1;
		overflow-y: auto;
		padding: 6rpx 12rpx;
		max-height: 260rpx;
	}
	.debug-line {
		display: block;
		font-size: 18rpx;
		color: #ccc;
		line-height: 1.5;
		font-family: monospace;
		word-break: break-all;
	}
	.debug-state {
		padding: 6rpx 12rpx;
		background: rgba(255,255,255,0.05);
		font-size: 18rpx;
		color: #aaa;
		font-family: monospace;
	}
</style>