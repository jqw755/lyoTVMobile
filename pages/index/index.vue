<template>
	<view class="page">
		<!-- 自定义标题栏 -->
		<view class="title-bar">
			<text class="title-bar-logo">乐意欧TV</text>
			<view class="title-bar-icons">
				<uni-icons type="search" size="26" color="#888" @tap="goSearch" />
				<uni-icons type="star" size="27" color="#888" @tap="goFav" />
				<img src="../../static/image/icon_history.png" alt="" width="24rpx" @tap="goHistory" />
			</view>
		</view>

		<!-- 顶部固定区域：分类导航 -->
		<view class="header">
			<category-nav :list="tabList" :activeId="activeTid" @change="onCategoryChange" />
		</view>

		<!-- 底部悬浮回到顶部按钮 -->
		<view class="fab-top" @tap="scrollToTop" v-if="showTopBtn">
			<uni-icons type="arrowup" size="28" color="#fff" />
		</view>

		<!-- 首次加载中 -->
		<view v-if="loading" class="loading-center">
			<uni-icons type="spinner-cycle" size="32" color="#999" />
			<text class="loading-text">正在加载...</text>
		</view>

		<!-- 无可订阅源 -->
		<view v-else-if="noSource" class="loading-center">
			<uni-icons type="info" size="32" color="#999" />
			<text class="loading-text">请先到"我的"页面设置订阅源</text>
		</view>

		<!-- 可滚动列表 -->
		<scroll-view v-else class="scroll-body" scroll-y @scrolltolower="onLoadMore" lower-threshold="100"
			@scroll="onScroll">
			<view class="grid" :class="'cols-' + gridCols">
				<view class="grid-item" v-for="item in list" :key="item.vod_id" @tap="goDetail(item)">
					<view class="grid-card">
						<view class="grid-poster-wrap">
							<image class="grid-poster" :src="item.vod_pic" mode="aspectFit" lazy-load />
							<text v-if="item.vod_remarks && item.vod_remarks !== '0'" class="grid-badge">
								{{ item.vod_remarks }}
							</text>
						</view>
						<view class="grid-info">
							<text class="grid-title" :lines="1">{{ item.vod_name }}</text>
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
		computed,
		onMounted,
		watch
	} from 'vue'
	import {
		home,
		category
	} from '@/utils/api.js'
	import {
		addHistory
	} from '@/utils/store.js'
	import {
		store,
		updateHome
	} from '@/utils/appState.js'
	import CategoryNav from '@/components/category-nav.vue'

	const RECOMMEND_TAB = {
		type_id: '',
		type_name: '推荐'
	}

	const classes = ref(store.classes)
	const list = ref(store.homeList)
	const loading = ref(true)
	const noSource = ref(false)
	const activeTid = ref('')
	const page = ref(1)
	const loadingMore = ref(false)
	const noMore = ref(false)
	const showTopBtn = ref(false)

	const gridCols = ref(4)

	function loadGridCols() {
		try {
			const saved = uni.getStorageSync('lyotv_grid_cols')
			if (saved) {
				const map = {
					large: 3,
					medium: 4,
					small: 5
				}
				gridCols.value = map[saved] ?? saved
			}
		} catch {}
	}
	loadGridCols()
	uni.$on('gridColsChanged', (val) => {
		if (val != null) gridCols.value = val
	})

	const loadMoreStatus = computed(() => {
		if (loadingMore.value) return 'loading'
		if (noMore.value) return 'noMore'
		return 'more'
	})

	const tabList = computed(() => [RECOMMEND_TAB, ...classes.value])

	watch(() => store.classes, (v) => {
		classes.value = v
	}, {
		immediate: true
	})
	watch(() => store.homeList, (v) => {
		if (activeTid.value === '') list.value = v
	}, {
		immediate: true
	})

	onMounted(async () => {
		if (!store.subUrl) {
			loading.value = false
			noSource.value = true
			return
		}
		loadHome()
	})

	async function loadHome() {
		loading.value = true
		noSource.value = false
		try {
			const data = await home()
			classes.value = data["class"] || data.classes || []
			list.value = data.list || []
			updateHome(data)
			activeTid.value = ''
			noMore.value = true
		} catch (e) {
			uni.showToast({
				title: e?.message || '加载失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	uni.$on('subUpdated', () => {
		if (store.homeList.length === 0) loadHome()
	})

	async function onCategoryChange(item) {
		activeTid.value = item.type_id
		page.value = 1
		noMore.value = false
		loadingMore.value = false

		if (item.type_id === '') {
			list.value = store.homeList
			noMore.value = true
			return
		}

		try {
			const data = await category(item.type_id, 1)
			list.value = data.list || []
			if ((data.list || []).length === 0) noMore.value = true
		} catch (e) {
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		}
	}

	async function onLoadMore() {
		if (loadingMore.value || noMore.value) return
		if (activeTid.value === '') return

		loadingMore.value = true
		try {
			const nextPage = page.value + 1
			const data = await category(activeTid.value, nextPage)
			const newItems = data.list || []
			if (newItems.length > 0) {
				list.value = [...list.value, ...newItems]
				page.value = nextPage
			} else {
				noMore.value = true
			}
		} catch (e) {
			// 忽略加载更多失败
		} finally {
			loadingMore.value = false
		}
	}

	function goDetail(item) {
		addHistory(item)
		const name = item.vod_name || ''
		uni.navigateTo({
			url: '/pages/search/search?keyword=' + encodeURIComponent(name)
		})
	}

	function goSearch() {
		uni.navigateTo({
			url: '/pages/search/search'
		})
	}

	function goFav() {
		uni.navigateTo({
			url: '/pages/favorite/favorite'
		})
	}

	function goHistory() {
		uni.navigateTo({
			url: '/pages/history/history'
		})
	}

	function onScroll(e) {
		showTopBtn.value = e.detail.scrollTop > 600
	}

	function scrollToTop() {
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 300
		})
	}

	//#ifdef APP-PLUS
	uni.addInterceptor('navigateBack', {
		fail() {
			/* ignore */
		}
	})
	//#endif
</script>

<style lang="scss" scoped>
	.page {
	 height: 100vh;
	 display: flex;
	 flex-direction: column;
	 background: var(--bg-primary);
	 overflow-x: hidden;
	}

	.header {
		flex-shrink: 0;
		background: var(--bg-primary);
		z-index: 10;
		padding-bottom: 4rpx;
	}

	/* 自定义标题栏 */
	.title-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 42rpx 24rpx 28rpx;
		flex-shrink: 0;
	}

	.title-bar-logo {
		font-size: 44rpx;
		font-weight: var(--weight-bold);
		color: var(--text-primary);
		letter-spacing: var(--tracking-wide);
	}

	.title-bar-icons {
		display: flex;
		align-items: center;
		gap: 36rpx;
	}

	/* 底部悬浮回到顶部按钮 */
	.fab-top {
		position: fixed;
		right: 32rpx;
		bottom: 80rpx;
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #fe8027, #f9631e);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99;
		box-shadow: 0 6rpx 20rpx rgba(254, 128, 39, 0.4);

		&:active {
			opacity: 0.85;
			transform: scale(0.95);
		}
	}

	/* 滚动区域 */
	.scroll-body {
		flex: 1;
		overflow-y: auto;
	}

	/* 网格布局 */
	.grid {
		display: flex;
		flex-wrap: wrap;
		padding: 0 12rpx;
	}

	.grid-item {
		box-sizing: border-box;
		padding: 6rpx;
	}

	.cols-3 .grid-item {
		width: 33.3333%;
	}

	.cols-4 .grid-item {
		width: 25%;
	}

	.cols-5 .grid-item {
		width: 20%;
	}

	.grid-card {
		border-radius: 12rpx;
		overflow: hidden;
		background: var(--card);
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.08);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.96);
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

	/* 首次加载 / 无订阅 居中状态 */
	.loading-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
	}

	.loading-text {
		font-size: var(--text-base);
		color: var(--text-secondary);
	}
</style>