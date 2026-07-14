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

		<!-- 调试面板 -->
		<DebugPanel />

		<!-- 首次加载中 -->
		<view v-if="loading" class="loading-center">
		 <uni-icons type="spinner-cycle" size="32" color="#999" />
		 <text class="loading-text">正在加载首页数据...</text>
		</view>

		<!-- 无可订阅源 -->
		<view v-else-if="noSource" class="loading-center">
		 <uni-icons type="info" size="32" color="#999" />
		 <text class="loading-text">请先到"我的"页面设置订阅源</text>
		</view>

		<!-- 可滚动列表（内联 v-for 替换 vod-grid 子组件：uni-app x 下 Options API 子组件对 ref prop 响应式追踪断链） -->
		<scroll-view ref="scrollView" :scroll-top="scrollTop" v-show="!loading && !noSource" class="scroll-body" scroll-y @scrolltolower="onLoadMore" lower-threshold="100"
		 @scroll="onScroll">
		 <view class="grid-wrapper">
		  <view class="grid">
		   <view v-for="(item, idx) in list" :key="(item.vod_id && item.vod_id !== '0') ? item.vod_id : ('idx-' + idx)" class="grid-item" :style="{ width: itemWidth + 'rpx' }" @tap="goDetail(item)">
		    <view class="grid-card">
		     <view class="grid-poster-wrap">
		      <image class="grid-poster" :src="item.vod_pic" mode="aspectFill" lazy-load />
		      <text v-if="formatBadge(item.vod_remarks)" class="grid-badge">{{ formatBadge(item.vod_remarks) }}</text>
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
	  computed,
	  onMounted,
	  nextTick
	 } from 'vue'
	import {
	  onShow
	} from '@dcloudio/uni-app'
	import {
		themeStyle
	} from '@/utils/theme.js'
	import {
	 home,
	 category
	} from '@/utils/api.js'
	import {
	 ensureInit
	} from '@/utils/api.js'
	import {
		addHistory,
		getSetting,
	} from '@/utils/store.js'
	import {
		store,
		updateHome,
		updateSites
	} from '@/utils/appState.js'
	import CategoryNav from '@/components/category-nav.vue'
	import VodGrid from '@/components/vod-grid.vue'
	import DebugPanel from '@/components/debug-panel.vue'
	import { addLog } from '@/utils/debugLog.js'
	import { logSection } from '@/utils/debugLog.js'
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
	// 内联 v-for 卡片宽度：对齐 vod-grid 的 SIZE_WIDTH_MAP（3=大图200rpx 默认）
	const SIZE_WIDTH_MAP = { 3: 200, 4: 150, 5: 120 }
	const itemWidth = ref(SIZE_WIDTH_MAP[getSetting('grid_cols', 3)] || 200)
	// 格式化角标：去除"评分"前缀和尾部标点，只保留数值，0不展示（复刻 vod-grid formatBadge）
	function formatBadge(text) {
		if (!text || text === '0') return ''
		const cleaned = text.replace(/^评分|[，,。、；：""''「」【】《》（）!！?？\s]+$/g, '')
		if (cleaned === '0') return ''
		return cleaned
	}
	// 如果 store 已有缓存数据（如已订阅），直接显示，不等待网络请求阻塞页面
	const loading = ref(store.homeList.length === 0)
	const noSource = ref(false)
	const activeTid = ref('')
	const page = ref(1)
	const loadingMore = ref(false)
	const noMore = ref(false)
	const showTopBtn = ref(false)
	const scrollView = ref(null)
	const scrollTop = ref(0)
	let _scrollKey = 0

	const loadMoreStatus = computed(() => {
		if (loadingMore.value) return 'loading'
		if (noMore.value) return 'noMore'
		return 'more'
	})

	const tabList = computed(() => [RECOMMEND_TAB, ...classes.value])

	// watch 移除：store.classes / store.homeList 的同步已由 loadHome / subUpdated / appReady
	// 等事件处理器手动赋值完成，watch 与之重复且不必要的。

	onMounted(async () => {
		logSection('首页加载')
		initPage()
	})

	// 从 mine 页切回时，store 可能已有新数据
	onShow(() => {
		if (!isInitialized) {
			initPage()
		} else if (store.homeList.length > 0 && list.value.length === 0) {
			// 切回时如果 store 有数据但页面列表为空，同步
			addLog('INDEX', `onShow 同步: store.homeList=${store.homeList.length} list=${list.value.length}`)
			classes.value = store.classes
			list.value = store.homeList
			loading.value = false
			noSource.value = false
		}
	})

	let isInitialized = false

	function initPage() {
		if (!store.subUrl) {
			loading.value = false
			noSource.value = true
			isInitialized = true
			return
		}
		// 有缓存直接显示，网络请求后台刷新，不阻塞页面
		if (store.homeList.length > 0) {
			classes.value = store.classes
			list.value = store.homeList
			activeTid.value = ''
			noMore.value = true
			loading.value = false
			addLog('INDEX', `onMounted 显示缓存: classes=${classes.value.length} list=${list.value.length}`)
			// 后台刷新
			loadHome(true)
		} else {
			loadHome()
		}
		isInitialized = true
	}

	/**
	 * 加载首页数据
	 * @param {boolean} background - 后台刷新模式：不改变 loading 状态，已在显示的缓存不闪烁
	 */
	async function loadHome(background = false) {
	 addLog('INDEX', `loadHome 开始${background ? ' (后台刷新)' : ''}`)
	 noSource.value = false
	 if (!background) loading.value = true
	 try {
	  // 确保插件已初始化（缓存 Promise，重复调用不阻塞）
	  if (store.subUrl) await ensureInit(store.subUrl)
	  const t0 = Date.now()
	  const data = await home()
			addLog('INDEX', `home() 完成 (${Date.now() - t0}ms) classes=${(data["class"] || data.classes || []).length} list=${(data.list || []).length}`)
			classes.value = data["class"] || data.classes || []
			list.value = data.list || []
			updateHome(data)
			activeTid.value = ''
			noMore.value = true
			addLog('INDEX', `状态已更新: loading=${loading.value} noSource=${noSource.value} classes=${classes.value.length} list=${list.value.length} tabList=${tabList.value.length}`)
		} catch (e) {
			addLog('INDEX', 'loadHome 失败: ' + (e?.message || ''))
			uni.showToast({
				title: e?.message || '加载失败',
				icon: 'none',
				duration: 3000
			})
		} finally {
			if (!background) loading.value = false
		}
	}

	uni.$on('subUpdated', () => {
		logSection('订阅更新')
		addLog('INDEX', `subUpdated 收到 homeList.length=${store.homeList.length}`)
		// mine.vue 已 await apiHome() + updateHome 后才 emit，此时 store 已填充首页数据，直接同步本地状态即可
		if (store.homeList.length > 0) {
			classes.value = store.classes
			list.value = store.homeList
			activeTid.value = ''
			page.value = 1
			noMore.value = true
			loadingMore.value = false
			loading.value = false
			noSource.value = false
			addLog('INDEX', `subUpdated 同步完成 classes=${classes.value.length} list=${list.value.length}`)
		} else {
			// mine.vue 拉首页失败时兜底：自己再拉一次，并重置 loading/noSource 标志避免页面停留空状态
			noSource.value = false
			loadHome()
		}
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
				duration: 3000,
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
		_scrollKey++
		scrollTop.value = -_scrollKey
		nextTick(() => {
			scrollTop.value = 0
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

	/* 内联 v-for 卡片样式（复刻 vod-grid） */
	.grid-wrapper {
		max-width: 750rpx;
		margin: 0 auto;
		padding: 0 24rpx;
	}
	.grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 24rpx;
	}
	.grid-item {
		box-sizing: border-box;
	}
	.grid-card {
		border-radius: 14rpx;
		overflow: hidden;
		background: var(--card);
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.08);
	}
	.grid-poster-wrap {
		position: relative;
		width: 100%;
	}
	.grid-poster {
		width: 100%;
		height: 220rpx;
		display: block;
		background: var(--card-hover);
	}
	.grid-badge {
		position: absolute;
		top: 10rpx;
		left: 10rpx;
		background: rgba(254, 128, 39, 0.9);
		color: #fff;
		font-size: 18rpx;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
		line-height: 1.4;
		font-weight: 500;
	}
	.grid-info {
		padding: 16rpx 14rpx 16rpx;
		background-color: #212121;
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