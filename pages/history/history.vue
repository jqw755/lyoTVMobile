<template>
	<view class="page" :style="themeStyle">
		<!-- 顶部背景区 -->
		<view class="header-bg" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="title-bar">
				<text class="title-bar-title">观看历史</text>
				<view class="title-bar-icons">
					<text v-if="isEditing" class="title-bar-clear" @tap="onClearAll">清空全部</text>
					<text v-if="isEditing" class="title-bar-done" @tap="exitEditMode">完成</text>
					<uni-icons v-else type="trash" size="22" color="#888" @tap="enterEditMode" />
				</view>
			</view>
		</view>

		<!-- 空状态：未登录 -->
		<view class="empty" v-if="!loggedIn">
			<uni-icons type="clock" size="60" color="#555" />
			<text class="empty-text">请先登录</text>
			<text class="empty-sub">登录后观看历史将同步到云端</text>
			<view class="login-btn" @tap="goLogin">去登录</view>
		</view>

		<!-- 空状态：无历史 -->
		<view class="empty" v-else-if="list.length === 0 && !loading">
			<uni-icons type="clock" size="60" color="#555" />
			<text class="empty-text">暂无观看记录</text>
			<text class="empty-sub">快去观看影片吧</text>
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
				<view class="grid" :class="'cols-' + gridCols">
					<view v-for="item in section.items"
						:key="'hist-' + item.vod_id + '-' + (item.view_time || item.time)" class="grid-item"
						@tap="goDetail(item)">
						<view class="grid-card">
							<view class="grid-poster-wrap">
								<image class="grid-poster" :src="item.vod_pic" mode="aspectFit" lazy-load />
								<text v-if="item.vod_remarks && item.vod_remarks !== '0'" class="grid-badge">
									{{ item.vod_remarks }}
								</text>
								<text v-if="item.episode" class="grid-badge-episode">{{ item.episode }}</text>
								<!-- 编辑模式下的删除按钮 -->
								<view v-if="isEditing" class="grid-remove" @tap.stop="onRemove(item)">
									<uni-icons type="closeempty" size="16" color="#fff" />
								</view>
							</view>
							<view class="grid-info">
								<text class="grid-title" :lines="1">{{ item.vod_name }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<uni-load-more :status="loadMoreStatus" />
		</scroll-view>
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
		getHistory,
		clearHistory,
		addHistory,
		removeHistoryItem,
		getCurrentUser,
		getSetting,
	} from '@/utils/store.js'
	import {
		useStatusBar
	} from '@/utils/useStatusBar.js'

	const {
		statusBarHeight
	} = useStatusBar()

	const list = ref([])
	const loading = ref(false)
	const loggedIn = ref(false)
	const displayCount = ref(20)
	const hasMore = ref(true)
	const gridCols = ref(4)
	const isEditing = ref(false)

	function groupByTime(items, timeField = 'view_time') {
		const groups = []
		const map = {} // "YYYY-MM-DD" -> items

		for (const item of items) {
			const t = item[timeField] || item.time || 0
			if (!t) continue
			const d = new Date(t)
			const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
			if (!map[key]) {
				map[key] = []
				groups.push({
					key,
					date: d,
					items: map[key]
				})
			}
			map[key].push(item)
		}

		// 按日期降序排列
		groups.sort((a, b) => b.date - a.date)

		// 将 key 格式化为显示文本
		for (const g of groups) {
			const d = g.date
			g.key = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
		}
		return groups
	}

	function pad(n) {
		return n < 10 ? '0' + n : '' + n
	}

	const visibleSections = computed(() => {
		let remaining = displayCount.value
		const result = []
		const groups = groupByTime(list.value, 'view_time')
		for (const g of groups) {
			if (remaining <= 0) break
			const slice = g.items.slice(0, remaining)
			result.push({
				key: g.key,
				items: slice
			})
			remaining -= slice.length
		}
		return result
	})

	const loadMoreStatus = computed(() => {
		if (loading.value) return 'loading'
		if (!hasMore.value) return 'noMore'
		return 'more'
	})

	async function load() {
		loggedIn.value = !!getCurrentUser()
		if (!loggedIn.value) {
			list.value = []
			return
		}
		loading.value = true
		displayCount.value = 30
		hasMore.value = true
		try {
			list.value = await getHistory()
		} catch {
			list.value = []
		} finally {
			loading.value = false
		}
	}

	function enterEditMode() {
		isEditing.value = true
	}

	function exitEditMode() {
		isEditing.value = false
	}

	async function onRemove(item) {
		const time = item.view_time || item.time
		if (!time) return
		try {
			list.value = await removeHistoryItem(item.vod_id, time)
			uni.showToast({
				title: '已删除',
				icon: 'none'
			})
		} catch {
			uni.showToast({
				title: '删除失败',
				icon: 'none'
			})
		}
	}

	async function onClearAll() {
		if (list.value.length === 0) return
		uni.showModal({
			title: '提示',
			content: '确定清空所有观看记录吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						list.value = await clearHistory()
						isEditing.value = false
						uni.showToast({
							title: '已清空',
							icon: 'success'
						})
					} catch {
						uni.showToast({
							title: '清空失败',
							icon: 'none'
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

	function goDetail(item) {
		if (isEditing.value) return
		addHistory(item)
		uni.navigateTo({
			url: `/pages/detail/detail?id=${item.vod_id}&key=${item.site_key || ''}`
		})
	}

	function onLoadMore() {
		if (loading.value || !hasMore.value) return
		const total = list.value.length
		if (displayCount.value >= total) {
			hasMore.value = false
			return
		}
		displayCount.value += 20
		const groups = groupByTime(list.value, 'view_time')
		let totalVisible = 0
		for (const g of groups) {
			totalVisible += g.items.length
		}
		if (displayCount.value >= totalVisible) {
			hasMore.value = false
		}
	}

	onShow(() => {
		gridCols.value = getSetting('grid_cols', 4)
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
		padding-top: 10rpx;
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

	.title-bar-title {
		font-size: 44rpx;
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
		padding: 6rpx 12rpx;

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

	/* ===== 网格布局 ===== */
	.grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 0 24rpx;
	}

	.grid-item {
		box-sizing: border-box;
		padding: 6rpx;
	}

	.cols-3 {
		gap: 18rpx;
	}

	.cols-3 .grid-item {
		width: 30%;
	}

	.cols-4 .grid-item {
		width: 25%;
	}

	.cols-5 .grid-item {
		width: 20%;
	}

	.grid-card {
		border-radius: 14rpx;
		overflow: visible;
		background: var(--card);
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.08);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.98);
		}
	}

	.grid-poster-wrap {
		position: relative;
		width: 100%;
	}

	.grid-poster {
		width: 100%;
		height: 200rpx;
		display: block;
		background: var(--card-hover);
	}

	.grid-badge {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		background: $theme-accent;
		color: #fff;
		font-size: 18rpx;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
		line-height: 1.4;
		font-weight: 500;
	}

	.grid-badge-episode {
		position: absolute;
		bottom: 8rpx;
		left: 8rpx;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		font-size: 18rpx;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
		line-height: 1.4;
		font-weight: 500;
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
</style>