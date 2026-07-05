<template>
	<view class="page">
	 <!-- 顶部固定区域：分类导航 -->
	 <view class="header">
	  <category-nav :list="tabList" :activeId="activeTid" @change="onCategoryChange" />
	 </view>

	 <!-- 底部悬浮搜索按钮 -->
	 <view class="fab-search" @tap="goSearch">
	  <uni-icons type="search" size="28" color="#fff" />
	 </view>

	 <!-- 首次加载中 -->
	 <view v-if="loading" class="loading-center">
	  <uni-icons type="spinner-cycle" size="32" color="#999" />
	  <text class="loading-text">正在加载...</text>
	 </view>

	 <!-- 无可订阅源 -->
	 <view v-else-if="noSource" class="loading-center">
	  <uni-icons type="info" size="32" color="#999" />
	  <text class="loading-text">请先设置订阅地址</text>
	 </view>

	 <!-- 可滚动列表 -->
	 <scroll-view v-else class="scroll-body" scroll-y @scrolltolower="onLoadMore" lower-threshold="100">
		 <view class="section">
		  <view class="grid" :class="'cols-' + cols">
		   <view class="grid-item" v-for="item in list" :key="item.vod_id" @tap="goDetail(item)">
		    <vod-card :item="item" />
		   </view>
		  </view>
		 </view>

			<!-- 加载中 / 没有更多 -->
			<view v-if="list.length > 0" class="load-more">
				<template v-if="loadingMore">
					<uni-icons type="spinner-cycle" size="14" color="#888" />
					<text class="load-text"> 加载中...</text>
				</template>
				<template v-else-if="noMore">
					<view class="load-line" />
					<text class="load-text">没有更多了</text>
					<view class="load-line" />
				</template>
			</view>
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
	import VodCard from '@/components/vod-card.vue'

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

	const gridCols = ref('medium')

	function loadGridCols() {
		try {
			const saved = uni.getStorageSync('lyotv_grid_cols')
			if (saved) gridCols.value = saved
		} catch {}
	}
	loadGridCols()
	uni.$on('gridColsChanged', (val) => {
		if (val) gridCols.value = val
	})

	const cols = computed(() => {
		const map = { large: 3, medium: 4, small: 5 }
		return map[gridCols.value] || 4
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
	 // 立即显示 loading，异步加载数据
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
	  noMore.value = true // 推荐 tab 不分页
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
		// 推荐 tab 不分页
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

	//#ifdef APP-PLUS
	uni.addInterceptor('navigateBack', {
		fail() {
			/* ignore */ }
	})
	//#endif
</script>

<style lang="scss" scoped>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-primary);
	}

	.header {
	 flex-shrink: 0;
	 background: var(--bg-primary);
	 z-index: 10;
	 padding-bottom: 4rpx;
	}

	/* 底部悬浮搜索按钮 */
	.fab-search {
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

	L .scroll-body {
		flex: 1;
		overflow-y: auto;
	}

	.section {
	 padding: 0 12rpx;
	}

	.grid {
	 display: flex;
	 flex-wrap: wrap;
	}

	.grid-item {
	 box-sizing: border-box;
	 padding: 6rpx;
	}

	.cols-3 .grid-item { width: 33.3333%; }
	.cols-4 .grid-item { width: 25%; }
	.cols-5 .grid-item { width: 20%; }

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
	 font-size: 26rpx;
	 color: var(--text-secondary);
	}

	.load-more {
		padding: 36rpx 0;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}

	.load-line {
		width: 60rpx;
		height: 1rpx;
		background: #555;
	}

	.load-text {
		font-size: 22rpx;
		color: #888;
	}
</style>