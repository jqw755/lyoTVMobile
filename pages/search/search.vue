<template>
	<view class="page" :style="themeStyle">
		<!-- 顶部背景区域（状态栏间距 + 影视背景图） -->
		<view class="header-bg" :style="{ paddingTop: (statusBarHeight + 10) + 'px' }">
			<!-- 顶部自定义导航栏 -->
			<view class="nav-bar">
				<!-- <uni-icons type="left" size="24" color="#888" class="nav-back" @tap="goBack" /> -->
				<view class="nav-search">
					<uni-icons type="search" size="18" color="#888" />
					<input v-model="keyword" placeholder="搜索影片" maxlength="20" placeholder-class="nav-placeholder"
						confirm-type="search" @confirm="doSearch" />
					<text v-if="keyword" class="nav-clear" @tap="clearKeyword">✕</text>
				</view>
				<text class="nav-btn" @tap="doSearch">搜索</text>
			</view>
		</view>

		<!-- 搜索前：热门搜索 + 历史 -->
		<template v-if="!searched">
			<scroll-view class="before-scroll" scroll-y>
				<!-- 搜索历史 -->
				<view class="history-section" v-if="historyTags.length > 0">
					<view class="history-header">
						<text class="section-title">搜索历史</text>
						<view v-if="!editing" class="history-header-right" @tap="editing = true">
							<uni-icons type="trash" size="16" color="#888" />
						</view>
						<view v-else class="history-actions">
							<text class="history-action-btn" @tap.stop="clearAllHistory">全部删除</text>
							<text class="history-action-btn cancel" @tap.stop="editing = false">取消</text>
						</view>
					</view>
					<view class="history-list">
						<view class="history-tag" v-for="(tag, i) in historyTags" :key="i"
							@tap="editing ? removeHistoryItem(i) : tapTag(tag)">
							<text class="history-tag-text">{{ tag }}</text>
							<text v-if="editing" class="history-tag-del">
								<uni-icons type="closeempty" size="14" color="#999" />
							</text>
						</view>
					</view>
				</view>

				<!-- 热门搜索 -->
				<view class="hot-section" v-if="hotTags.length > 0">
					<text class="section-title">热门搜索</text>
					<view class="hot-tags">
						<text v-for="(tag, i) in hotTags" :key="i" class="hot-tag" @tap="tapTag(tag)">{{ tag }}</text>
					</view>
				</view>

				<view v-if="historyTags.length === 0" class="empty-hint">输入关键词搜索影视</view>
			</scroll-view>
		</template>

		<!-- 搜索后：左站点 + 右资源 -->
		<template v-else>
			<view class="split">
				<!-- 左侧：站点列表（竖向） -->
				<scroll-view class="left" scroll-y>
					<view class="site-item" :class="{ active: currentKey === '__all__' }" @tap="selectSite('__all__')">
						<text class="site-name">全部</text>
						<text class="site-num">{{ allResults.length }}</text>
					</view>
					<view v-for="s in siteList" :key="s.key" class="site-item"
						:class="{ active: currentKey === s.key, done: siteDone[s.key] }" @tap="selectSite(s.key)">
						<text class="site-name" :lines="1">{{ s.name }}</text>
						<text class="site-num" v-if="siteDone[s.key]">{{ (siteResults[s.key]||[]).length }}</text>
						<text class="site-loading" v-else>⋯</text>
					</view>
				</scroll-view>

				<!-- 右侧：当前站资源列表 -->
				<scroll-view class="right" scroll-y>
					<view class="right-header">
						<text class="right-title">{{ currentTitle }}</text>
						<text class="right-count">共 {{ currentList.length }} 条</text>
					</view>
					<view class="list" v-if="currentList.length > 0">
						<view class="list-item" v-for="item in currentList" :key="item.vod_id" @tap="goDetail(item)">
							<image class="thumb" :src="item.vod_pic" mode="aspectFill" lazy-load />
							<view class="info">
								<text class="title" :lines="2">{{ item.vod_name }}</text>
								<text class="remark" v-if="item.vod_remarks">{{ item.vod_remarks }}</text>
							</view>
						</view>
					</view>
					<view v-else class="empty">暂无结果</view>
				</scroll-view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { useTabBack } from '@/utils/useTabBack.js'
	import {
	     ref,
	     computed,
	     onMounted,
	     watch
	    } from 'vue'
	  import {
	   onShow
	  } from '@dcloudio/uni-app'
	import {
		themeStyle
	} from '@/utils/theme.js'
	import {
		searchSite
	} from '@/utils/api.js'
	import {
		addHistory
	} from '@/utils/store.js'
	import {
		store
	} from '@/utils/appState.js'
	import {
		useStatusBar
	} from '@/utils/useStatusBar.js'

	useTabBack()

	const {
		statusBarHeight
	} = useStatusBar()

	const keyword = ref('')
	const searched = ref(false)
	const historyTags = ref([])
	const editing = ref(false)
	const hotTags = ref([])

	// 热门搜索：缓存 key
	const HOT_CACHE_KEY = 'lyotv_hot_search'
	const HOT_API = 'https://api.web.360kan.com/v1/rank?cat=1'

	// 加载热门搜索（先缓存，再异步刷新）
	async function loadHot() {
		// 1. 先显示缓存
		try {
			const cached = uni.getStorageSync(HOT_CACHE_KEY)
			if (cached) hotTags.value = cached
		} catch {}
		// 2. 异步请求最新的
		try {
			const res = await uni.request({
				url: HOT_API
			})
			const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
			if (body?.data?.length) {
				const tags = body.data.map(item => item.title).filter(Boolean)
				hotTags.value = tags
				uni.setStorageSync(HOT_CACHE_KEY, tags)
			}
		} catch (e) {
			// 网络失败时保留缓存
		}
	}

	// 站点列表（过滤掉已完成搜索但结果为0的站源）
	const siteList = computed(() => {
		const sites = store.sites || []
		return sites.filter(s => !siteDone.value[s.key] || (siteResults.value[s.key] || []).length > 0)
	})
	const siteResults = ref({})
	const siteDone = ref({})
	const currentKey = ref('__all__')

	const allResults = computed(() => {
		const list = []
		for (const s of siteList.value) {
			const r = siteResults.value[s.key]
			if (r) list.push(...r)
		}
		return list
	})

	const currentList = computed(() => {
		if (currentKey.value === '__all__') return allResults.value
		return siteResults.value[currentKey.value] || []
	})

	const currentTitle = computed(() => {
		if (currentKey.value === '__all__') return '全部'
		const s = siteList.value.find(s => s.key === currentKey.value)
		return s ? s.name : ''
	})

	onMounted(() => {
	 // 加载搜索历史
	 try {
	  historyTags.value = uni.getStorageSync('lyotv_search_history') || []
	 } catch {}

	 // 加载热门搜索（同 fongmi 插件：先从缓存展示，再异步请求刷新）
	 loadHot()
	})

	onShow(() => {
	  // 处理首页跳转入参（switchTab 不支持 URL 参数，用 storage 传递）
	  try {
	   const kw = uni.getStorageSync('lyotv_search_keyword') || ''
	   if (kw) {
	    uni.removeStorageSync('lyotv_search_keyword')
	    keyword.value = kw
	    doSearch()
	   }
	  } catch {}
	 })

	function getPageKeyword() {
		try {
			const pages = getCurrentPages()
			const page = pages[pages.length - 1]
			if (page?.$page?.options?.keyword) return decodeURIComponent(page.$page.options.keyword)
		} catch {}
		return ''
	}

	function saveHistory(kw) {
		if (!kw) return
		let list = [kw, ...historyTags.value.filter(t => t !== kw)].slice(0, 10)
		historyTags.value = list
		uni.setStorageSync('lyotv_search_history', list)
	}

	function tapTag(kw) {
		keyword.value = kw
		doSearch()
	}

	function clearAllHistory() {
		historyTags.value = []
		uni.setStorageSync('lyotv_search_history', [])
		editing.value = false
	}

	function removeHistoryItem(index) {
		historyTags.value = historyTags.value.filter((_, i) => i !== index)
		uni.setStorageSync('lyotv_search_history', historyTags.value)
		if (historyTags.value.length === 0) editing.value = false
	}

	async function doSearch() {
		const kw = keyword.value.trim()
		if (!kw) return
		searched.value = true
		saveHistory(kw)

		const sites = siteList.value
		if (!sites.length) {
			uni.showToast({
				title: '暂无可搜索站点',
				icon: 'none',
				duration: 3000
			})
			return
		}

		siteResults.value = {}
		siteDone.value = {}
		currentKey.value = '__all__'

		sites.forEach(site => {
			searchSite(kw, site.key)
				.then(data => {
					siteResults.value = {
						...siteResults.value,
						[site.key]: data?.list || []
					}
					siteDone.value[site.key] = true
				})
				.catch(() => {
					siteDone.value[site.key] = true
				})
		})
	}

	function clearKeyword() {
		keyword.value = ''
		searched.value = false
	}

	function goBack() {
		uni.navigateBack()
	}

	// 手动清空输入内容时恢复初始状态
	watch(keyword, (val) => {
		if (!val) searched.value = false
	})

	function selectSite(key) {
		currentKey.value = key
	}

	function goDetail(item) {
		addHistory(item)
		uni.navigateTo({
			url: `/pages/detail/detail?id=${item.vod_id}&key=${item.site_key || ''}`
		})
	}
</script>

<style lang="scss" scoped>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-primary);
	}

	/* ========== 背景区域（深色渐变） ========== */
	.header-bg {
		flex-shrink: 0;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(254, 128, 39, 0.18) 0%, transparent 85%),
			linear-gradient(180deg, var(--gradient-from) 0%, var(--gradient-to) 80%);
		background-color: var(--bg-primary);
	}

	/* ========== 顶栏 ========== */
	.nav-bar {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 6rpx 16rpx 16rpx;
	}

	.nav-back {
		padding: 8rpx 4rpx;
		flex-shrink: 0;

		&:active {
			opacity: 0.6;
		}
	}

	.nav-search {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10rpx;
		background: var(--card-hover);
		border-radius: 40rpx;
		padding: 4rpx 20rpx;
		height: 60rpx;
		border: 2rpx solid var(--border);

		input {
			flex: 1;
			font-size: 26rpx;
			color: var(--text-primary);
		}

		.nav-placeholder {
			color: var(--text-secondary);
			font-size: 26rpx;
		}

		.nav-clear {
			color: var(--text-secondary);
			font-size: 26rpx;
			padding: 0 8rpx;
			font-weight: bolder;
		}
	}

	.nav-btn {
		background: $theme-accent;
		color: #fff;
		font-size: 26rpx;
		padding: 16rpx 28rpx;
		border-radius: 40rpx;
		flex-shrink: 0;

		&:active {
			opacity: 0.8;
		}
	}

	/* ========== 搜索前滚动区域 ========== */
	.before-scroll {
		flex: 1;
	}

	/* ========== 热门搜索 ========== */
	.hot-section {
		padding: 20rpx 20rpx 0;
	}

	.section-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		color: var(--text-primary);
		display: block;
		margin-bottom: 16rpx;
	}

	.hot-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.hot-tag {
		background: var(--card);
		color: var(--text-primary);
		font-size: 24rpx;
		padding: 10rpx 24rpx;
		border-radius: 30rpx;

		&:active {
			opacity: 0.7;
		}
	}

	/* ========== 搜索历史 ========== */
	.history-section {
		padding: 0 20rpx 30rpx;
	}

	.history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;

		.section-title {
			margin-bottom: 0;
		}
	}

	.history-header-right {
		padding: 8rpx;

		&:active {
			opacity: 0.6;
		}
	}

	.history-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.history-action-btn {
		font-size: 24rpx;
		color: var(--accent);
		padding: 8rpx 12rpx;
		border-radius: 6rpx;

		&.cancel {
			color: var(--text-secondary);
		}

		&:active {
			opacity: 0.7;
		}
	}

	.history-list {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.history-tag {
		position: relative;
		background: var(--card);
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
		display: inline-flex;
		align-items: center;
		gap: 6rpx;

		&:active {
			opacity: 0.7;
		}

		.history-tag-text {
			font-size: 24rpx;
			color: var(--text-primary);
		}

		.history-tag-del {
			width: 28rpx;
			height: 28rpx;
			border-radius: 50%;
			background: var(--card-hover);
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	/* ========== 搜索前空状态 ========== */
	.empty-hint {
		text-align: center;
		padding: 80rpx 0;
		color: var(--text-secondary);
		font-size: 28rpx;
	}

	/* ========== 搜索结果：左右分栏 ========== */
	.split {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.left {
		width: 226rpx;
		background: var(--card);
		flex-shrink: 0;

		.site-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 28rpx 18rpx;
			border-bottom: 1rpx solid var(--border);
			font-size: var(--text-base);

			&.active {
				background: var(--accent);

				.site-name {
					color: #fff;
				}

				.site-num {
					color: rgba(255, 255, 255, 0.8);
				}
			}
		}

		.site-name {
			font-size: 24rpx;
			color: var(--text-primary);
			flex: 1;
		}

		.site-num {
			font-size: 20rpx;
			color: var(--text-secondary);
			background: rgba(0, 0, 0, 0.06);
			padding: 2rpx 12rpx;
			border-radius: 20rpx;
		}

		.site-loading {
			font-size: 24rpx;
			color: var(--accent);
			animation: pulse 1s infinite;
		}
	}

	@keyframes pulse {

		0%,
		100% {
			opacity: 0.3;
		}

		50% {
			opacity: 1;
		}
	}

	.right {
		flex: 1;
		padding: 0 16rpx;

		.right-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16rpx 0 12rpx;
			position: sticky;
			top: 0;
			background: var(--bg-primary);
			z-index: 2;
		}

		.right-title {
			font-size: 28rpx;
			font-weight: 600;
			color: var(--text-primary);
			padding-left: 6rpx;
		}

		.right-count {
			font-size: 22rpx;
			color: var(--text-secondary);
		}
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		padding: 0 8rpx 20rpx;

		.list-item {
			display: flex;
			gap: 16rpx;
			border-radius: 12rpx;
			overflow: hidden;
			background: var(--card);
			padding: 14rpx;
			box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.04);

			&:active {
				opacity: 0.7;
			}

			.thumb {
				width: 140rpx;
				height: 190rpx;
				flex-shrink: 0;
				border-radius: 8rpx;
				display: block;
				background: var(--card-hover);
			}

			.info {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-width: 0;
			}

			.title {
				font-size: var(--text-lg);
				font-weight: var(--weight-semibold);
				color: var(--text-primary);
				display: block;
				line-height: var(--leading-tight);
				margin-bottom: 6rpx;
			}

			.remark {
				display: inline-block;
				font-size: var(--text-sm);
				letter-spacing: var(--tracking-normal);
				color: var(--accent);
				background: rgba(254, 128, 39, 0.1);
				padding: 2rpx 12rpx;
				border-radius: 4rpx;
				align-self: flex-start;
			}
		}
	}

	.empty {
		text-align: center;
		padding: 80rpx 0;
		color: var(--text-secondary);
		font-size: 28rpx;
	}
</style>