<template>
	<view class="page">
		<!-- 搜索框 -->
		<view class="search-bar">
			<view class="search-input">
				<uni-icons type="search" size="18" color="#888" />
				<input v-model="keyword" placeholder="搜影视、演员..." placeholder-class="placeholder" confirm-type="search"
					@confirm="doSearch" />
				<text v-if="keyword" class="clear" @tap="keyword = ''">✕</text>
				<text class="search-btn" @tap="doSearch">搜索</text>
			</view>
		</view>

		<!-- 搜索前：历史 -->
		<template v-if="!searched">
			<view class="section" v-if="historyTags.length > 0">
				<view class="section-header">
					<uni-icons type="clock" size="14" color="#888" />
					<text class="section-title"> 搜索历史</text>
					<view class="clear-btn" @tap="clearHistory">
						<uni-icons type="trash" size="14" color="#888" /><text style="margin-left:4rpx">清空</text>
					</view>
				</view>
				<view class="tags">
					<text v-for="(tag,i) in historyTags" :key="i" class="tag" @tap="tapHistory(tag)">{{ tag }}</text>
				</view>
			</view>
			<view v-else class="empty-hint">输入关键词搜索影视</view>
		</template>

		<!-- 搜索后：左站点 + 右资源 -->
		<template v-else>
			<view class="split">
				<!-- 左侧：站点列表（竖向） -->
				<scroll-view class="left" scroll-y>
					<!-- "全部" tab -->
					<view class="site-item" :class="{ active: currentKey === '__all__' }" @tap="selectSite('__all__')">
						<text class="site-name">全部</text>
						<text class="site-num">{{ allResults.length }}</text>
					</view>
					<!-- 各站点 -->
					<view v-for="s in siteList" :key="s.key" class="site-item"
						:class="{ active: currentKey === s.key, done: siteDone[s.key] }" @tap="selectSite(s.key)">
						<text class="site-name" :lines="1">{{ s.name }}</text>
						<text class="site-num" v-if="siteDone[s.key]">{{ (siteResults[s.key]||[]).length }}</text>
						<text class="site-loading" v-else>⋯</text>
					</view>
				</scroll-view>

				<!-- 右侧：当前站资源列表（单列瀑布流） -->
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
	import { ref, computed } from 'vue'
	import { searchSite } from '@/utils/api.js'
	import { addHistory } from '@/utils/store.js'
	import { store } from '@/utils/appState.js'

	const keyword = ref('')
	const searched = ref(false)
	const historyTags = ref([])
	// 站点列表（直接从 store.sites 取，启动时已加载）
	const siteList = computed(() => store.sites || [])
	// 每个站点的搜索结果
	const siteResults = ref({})
	// 每个站点是否已搜完
	const siteDone = ref({})
	// 当前选中的 key（'__all__' 表示全部）
	const currentKey = ref('__all__')

	// "全部" 合并结果
	const allResults = computed(() => {
		const list = []
		for (const s of siteList.value) {
			const r = siteResults.value[s.key]
			if (r) list.push(...r)
		}
		return list
	})

	// 当前显示的结果列表
	const currentList = computed(() => {
		if (currentKey.value === '__all__') return allResults.value
		return siteResults.value[currentKey.value] || []
	})

	// 当前标题
	const currentTitle = computed(() => {
		if (currentKey.value === '__all__') return '全部'
		const s = siteList.value.find(s => s.key === currentKey.value)
		return s ? s.name : ''
	})

	try {
		historyTags.value = uni.getStorageSync('lyotv_search_history') || []
	} catch {}

	// 接收首页传入的搜索词
	function getPageKeyword() {
		try {
			const pages = getCurrentPages()
			const page = pages[pages.length - 1]
			if (page?.$page?.options?.keyword) return decodeURIComponent(page.$page.options.keyword)
		} catch {}
		return ''
	}

	// 页面加载时自动处理首页跳转
	const pendingKw = getPageKeyword()
	if (pendingKw) {
		keyword.value = pendingKw
		setTimeout(() => doSearch(), 200)
	}

	function saveHistory(kw) {
		if (!kw) return
		let list = [kw, ...historyTags.value.filter(t => t !== kw)].slice(0, 10)
		historyTags.value = list
		uni.setStorageSync('lyotv_search_history', list)
	}

	function tapHistory(kw) {
		keyword.value = kw
		doSearch()
	}

	function clearHistory() {
		historyTags.value = []
		uni.setStorageSync('lyotv_search_history', [])
	}

	async function doSearch() {
		const kw = keyword.value.trim()
		if (!kw) return
		searched.value = true
		saveHistory(kw)

		// 直接取 store.sites（启动/订阅时已加载）
		const sites = siteList.value
		if (!sites.length) {
			uni.showToast({ title: '暂无可搜索站点', icon: 'none' })
			return
		}

		siteResults.value = {}
		siteDone.value = {}
		currentKey.value = '__all__'

		// 逐站提交搜索，谁返回谁渲染（对标 ViewModelSearchRunner）
		sites.forEach(site => {
			searchSite(kw, site.key)
				.then(data => {
					siteResults.value = { ...siteResults.value, [site.key]: data?.list || [] }
					siteDone.value[site.key] = true
				})
				.catch(() => {
					siteDone.value[site.key] = true
				})
		})
	}

	function selectSite(key) { currentKey.value = key }

	function goDetail(item) {
		addHistory(item)
		uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}&key=${item.site_key || ''}` })
	}
</script>

<style lang="scss" scoped>
	.page { height: 100vh; display: flex; flex-direction: column; background: var(--bg-primary); }
	.search-bar { padding: 12rpx 20rpx; background: var(--bg-primary); flex-shrink: 0; }
	.search-input { display: flex; align-items: center; gap: 12rpx; background: var(--card); border-radius: 40rpx; padding: 12rpx 20rpx;
		input { flex: 1; font-size: 28rpx; color: #000; }
		.placeholder { color: $theme-text-secondary; font-size: 28rpx; }
		.clear { color: $theme-text-secondary; font-size: 28rpx; padding: 0 8rpx; }
		.search-btn { color: #fff; background: $theme-accent; font-size: 26rpx; padding: 8rpx 24rpx; border-radius: 30rpx; flex-shrink: 0; }
	}
	.section { padding: 0 20rpx; margin-top: 16rpx;
		&-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
		&-title { font-size: 28rpx; font-weight: 600; color: $theme-text; }
		.clear-btn { font-size: 24rpx; color: $theme-text-secondary; }
	}
	.tags { display: flex; flex-wrap: wrap; gap: 12rpx;
		.tag { background: var(--card); color: var(--text-secondary); font-size: 24rpx; padding: 10rpx 24rpx; border-radius: 30rpx; }
	}
	.empty-hint { text-align: center; padding: 80rpx 0; color: $theme-text-secondary; font-size: 28rpx; }

	.split { flex: 1; display: flex; overflow: hidden; }

	/* 左侧站点列表（竖向） */
	.left { width: 200rpx; background: var(--card); flex-shrink: 0;
		.site-item { display: flex; align-items: center; justify-content: space-between; padding: 18rpx 14rpx; border-bottom: 1rpx solid $theme-border;
			&.active { background: $theme-accent; .site-name { color: #fff; } .site-num { color: rgba(255,255,255,0.8); } }
			&:first-child { border-top: none; }
		}
		.site-name { font-size: 24rpx; color: $theme-text; flex: 1; }
		.site-num { font-size: 20rpx; color: $theme-text-secondary; background: rgba(0,0,0,0.06); padding: 2rpx 12rpx; border-radius: 20rpx; }
		.site-loading { font-size: 24rpx; color: $theme-accent; animation: pulse 1s infinite; }
	}
	@keyframes pulse { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }

	.right { flex: 1; padding: 0 16rpx;
		.right-header { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 0 8rpx; position: sticky; top: 0; background: var(--bg-primary); z-index: 2; }
		.right-title { font-size: 28rpx; font-weight: 600; color: $theme-text; }
		.right-count { font-size: 22rpx; color: $theme-text-secondary; }
	}

	/* 单列瀑布流 */
	.list { display: flex; flex-direction: column; gap: 16rpx; padding-bottom: 20rpx;
		.list-item { display: flex; gap: 16rpx; border-radius: 8rpx; overflow: hidden; background: $theme-card; padding: 16rpx;
			&:active { opacity: 0.7; }
			.thumb { width: 140rpx; height: 190rpx; flex-shrink: 0; border-radius: 8rpx; display: block; background: $theme-card-hover; }
			.info { flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
			.title { font-size: 28rpx; font-weight: 600; color: $theme-text; display: block; line-height: 1.3; margin-bottom: 6rpx; }
			.remark { display: inline-block; font-size: 22rpx; color: $theme-accent; background: rgba($theme-accent, 0.1); padding: 2rpx 12rpx; border-radius: 4rpx; align-self: flex-start; }
		}
	}

	.empty { text-align: center; padding: 80rpx 0; color: $theme-text-secondary; font-size: 28rpx; }
</style>
