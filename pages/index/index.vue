<template>
	<view class="page" :style="themeStyle">
		<!-- 顶部背景区域（动态状态栏间距 + 影视背景图） -->
		<view class="header-bg" :style="{ paddingTop: (statusBarHeight + 10) + 'px' }">
			<!-- 自定义标题栏 -->
			<view class="title-bar">
				<text class="title-bar-logo">乐意欧TV</text>
				<view class="title-bar-icons">
					<uni-icons type="search" size="26" color="#888" @tap="goSearch" />
					<uni-icons type="star" size="27" color="#888" @tap="goFav" />
					<image class="title-bar-history" src="/static/image/icon_history.png" mode="aspectFit"
						@tap="goHistory" />
				</view>
			</view>

			<!-- 顶部固定区域：分类导航 -->
			<view class="header">
				<category-nav :list="tabList" :activeId="activeTid" @change="onCategoryChange" />
			</view>
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
			<vod-grid :items="list" @itemTap="goDetail" />
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
		themeStyle
	} from '@/utils/theme.js'
	import {
		home,
		category
	} from '@/utils/api.js'
	import {
		addHistory,
	} from '@/utils/store.js'
	import {
		store,
		updateHome,
		updateSites
	} from '@/utils/appState.js'
	import CategoryNav from '@/components/category-nav.vue'
	import VodGrid from '@/components/vod-grid.vue'
	import {
		useStatusBar
	} from '@/utils/useStatusBar.js'

	const {
		statusBarHeight
	} = useStatusBar()

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

	// App.vue 的 initApp() 是异步的，重启时首页 onMounted 可能先于插件就绪。
	// 监听 appReady 事件：插件初始化完成后通知首页拉取数据。
	uni.$on('appReady', () => {
		if (store.homeList.length === 0) loadHome()
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

		loadingMore.value = true
		try {
			const data = await category(item.type_id, 1)
			list.value = data.list || []
			if ((data.list || []).length === 0) noMore.value = true
		} catch (e) {
			uni.showToast({
				title: '加载失败: ' + (e?.message || ''),
				icon: 'none',
				duration: 2000,
			})
		} finally {
			loadingMore.value = false
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

	/* 顶部背景区域（深色渐变，模拟影院氛围） */
	.header-bg {
		flex-shrink: 0;
		position: relative;
		z-index: 1;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(254, 128, 39, 0.18) 0%, transparent 85%),
			linear-gradient(180deg, var(--gradient-from) 0%, var(--gradient-to) 80%);
		background-color: var(--bg-primary);
	}

	.header {
		flex-shrink: 0;
		z-index: 10;
		padding-bottom: 16rpx;
	}

	/* 自定义标题栏 */
	.title-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10rpx 24rpx 28rpx;
		flex-shrink: 0;
	}

	.title-bar-logo {
		font-size: 44rpx;
		font-weight: bolder;
		font-weight: 800;
		color: var(--text-primary);
		letter-spacing: var(--tracking-wide);
		letter-spacing: 2px;
	}

	.title-bar-icons {
		display: flex;
		align-items: center;
		gap: 36rpx;
	}

	.title-bar-history {
		width: 26px;
		height: 26px;
	}

	/* 底部悬浮回到顶部按钮 */
	.fab-top {
		position: fixed;
		right: 32rpx;
		bottom: 150rpx;
		width: 100rpx;
		height: 100rpx;
		line-height: 90rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, $theme-accent, #f9631e);
		text-align: center;
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