<template>
	<view class="page">
		<!-- 用户头部 -->
		<view class="profile">
			<view class="avatar">
				<uni-icons type="person-filled" size="44" color="#666" />
			</view>
			<view class="profile-info">
				<text class="name">影视爱好者</text>
				<text class="bio">观看精彩世界</text>
			</view>
			<uni-icons type="gear" size="20" color="#888" class="settings-icon" @tap="goPage('settings')" />
		</view>

		<!-- 统计卡片（我的收藏 / 观看历史 / 下载） -->
		<view class="stats-row">
			<view class="stat-card" @tap="goPage('favorite')">
				<text class="stat-count">{{ favCount }}</text>
				<text class="stat-label">我的收藏</text>
				<text class="stat-detail">{{ favCount }}部</text>
			</view>
			<view class="stat-card" @tap="goPage('history')">
				<text class="stat-count">{{ historyCount }}</text>
				<text class="stat-label">观看历史</text>
				<text class="stat-detail">{{ historyCount }}部</text>
			</view>
			<view class="stat-card">
				<text class="stat-count">0</text>
				<text class="stat-label">下载</text>
				<text class="stat-detail">0部</text>
			</view>
		</view>

		<!-- 订阅源设置 -->
		<view class="section">
			<view class="section-header">
				<uni-icons type="link" size="14" color="#888" />
				<text class="section-title">订阅源设置</text>
			</view>
			<view class="sub-input">
				<input v-model="subUrl" placeholder="输入订阅地址（JSON URL）" placeholder-class="placeholder" />
				<text class="sub-btn" @tap="submitSub">确定</text>
			</view>
			<text v-if="store.subUrl && !subUrl" class="sub-hint">
				当前订阅源：{{ store.subUrl }}
			</text>
		</view>

		<!-- 图片设置 -->
		<view class="section">
			<view class="section-header">
				<uni-icons type="image" size="14" color="#888" />
				<text class="section-title">图片设置</text>
			</view>
			<view class="img-size-options">
				<text class="img-size-btn" :class="{ active: currentCols === 'large' }" @tap="setImgSize('large')">
					<text class="img-size-btn-label">大</text>
					<text class="img-size-btn-cols">3列</text>
				</text>
				<text class="img-size-btn" :class="{ active: currentCols === 'medium' }" @tap="setImgSize('medium')">
					<text class="img-size-btn-label">中</text>
					<text class="img-size-btn-cols">4列</text>
				</text>
				<text class="img-size-btn" :class="{ active: currentCols === 'small' }" @tap="setImgSize('small')">
					<text class="img-size-btn-label">小</text>
					<text class="img-size-btn-cols">5列</text>
				</text>
			</view>
		</view>

		<!-- 显示主题（深色/浅色） -->
		<view class="section">
			<view class="section-header">
				<uni-icons type="circle" size="14" color="#888" />
				<text class="section-title">显示主题</text>
			</view>
			<view class="theme-options">
				<text class="theme-btn" :class="{ active: theme === 'dark' }" @tap="setTheme('dark')">
					<uni-icons type="moon" size="16" :color="theme === 'dark' ? '#fe8027' : '#888'" />
					<text class="theme-btn-label">深色</text>
				</text>
				<text class="theme-btn" :class="{ active: theme === 'light' }" @tap="setTheme('light')">
					<uni-icons type="sun-filled" size="16" :color="theme === 'light' ? '#fe8027' : '#888'" />
					<text class="theme-btn-label">浅色</text>
				</text>
			</view>
		</view>

		<!-- 列表布局 -->
		<view class="section">
			<view class="setting-item" @tap="toggleListLayout">
				<view class="setting-item-left">
					<uni-icons type="bars" size="16" color="#888" />
					<text class="setting-item-label">列表布局</text>
				</view>
				<switch :checked="listLayout" @change="onListLayoutChange" color="#fe8027" />
			</view>
		</view>

		<!-- 静音播放 -->
		<view class="section">
			<view class="setting-item" @tap="toggleMuted">
				<view class="setting-item-left">
					<uni-icons type="sound" size="16" color="#888" />
					<text class="setting-item-label">静音播放</text>
				</view>
				<switch :checked="muted" @change="onMutedChange" color="#fe8027" />
			</view>
		</view>

		<!-- 清除缓存 -->
		<view class="section">
			<view class="setting-item" @tap="clearCache">
				<view class="setting-item-left">
					<uni-icons type="trash" size="16" color="#888" />
					<text class="setting-item-label">清除缓存</text>
				</view>
				<view class="setting-item-right">
					<text class="cache-size">{{ cacheSize }}</text>
					<uni-icons type="arrowright" size="14" color="#555" />
				</view>
			</view>
		</view>

		<!-- 关于 -->
		<view class="about">
			<text class="version">乐意欧TV v1.0.0</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue'
	import {
		store,
		setSubUrl,
		updateHome,
		updateSites
	} from '@/utils/appState.js'
	import {
		init as apiInit,
		home,
		getSites
	} from '@/utils/api.js'
	import {
		getFavorites,
		getHistory,
		getSetting,
		setSetting
	} from '@/utils/store.js'

	const subUrl = ref('')
	const currentCols = ref('medium')
	const theme = ref('dark')
	const listLayout = ref(false)
	const muted = ref(true)
	const cacheSize = ref('计算中…')

	onMounted(() => {
		// 图片列数
		try {
			const saved = uni.getStorageSync('lyotv_grid_cols')
			if (saved) currentCols.value = saved
		} catch {}
		// 主题（深色/浅色）
		try {
			const saved = uni.getStorageSync('lyotv_theme')
			if (saved) theme.value = saved
		} catch {}
		// 列表布局
		listLayout.value = getSetting('list_layout', false)
		// 静音播放
		muted.value = getSetting('video_muted', true)
		// 缓存大小
		calcCacheSize()
	})

	/* ========== 统计数据 ========== */
	const favCount = computed(() => getFavorites().length)
	const historyCount = computed(() => getHistory().length)

	/* ========== 缓存计算 ========== */
	function calcCacheSize() {
		try {
			let total = 0
			const keys = uni.getStorageInfoSync().keys || []
			keys.forEach(k => {
				try {
					const v = uni.getStorageSync(k)
					const str = typeof v === 'string' ? v : JSON.stringify(v)
					total += str.length * 2 // 近似 Unicode 字节
				} catch {}
			})
			if (total < 1024) {
				cacheSize.value = total + ' B'
			} else if (total < 1024 * 1024) {
				cacheSize.value = (total / 1024).toFixed(0) + ' KB'
			} else {
				cacheSize.value = (total / (1024 * 1024)).toFixed(1) + ' MB'
			}
		} catch {
			cacheSize.value = '未知'
		}
	}

	function clearCache() {
		uni.showModal({
			title: '清除缓存',
			content: '确定要清除所有本地缓存数据吗？（不会影响收藏和观看历史）',
			success: (res) => {
				if (res.confirm) {
					try {
						// 保留收藏、历史、设置等关键数据
						const keep = ['lyotv_favorites', 'lyotv_history', 'lyotv_settings',
							'lyotv_sub_url', 'lyotv_theme', 'lyotv_theme_color', 'lyotv_grid_cols'
						]
						const keys = uni.getStorageInfoSync().keys || []
						keys.forEach(k => {
							if (!keep.includes(k)) {
								uni.removeStorageSync(k)
							}
						})
						cacheSize.value = '0 B'
						uni.showToast({ title: '缓存已清除', icon: 'success' })
					} catch (e) {
						uni.showToast({ title: '清除失败', icon: 'none' })
					}
				}
			}
		})
	}

	/* ========== 列表布局 ========== */
	function toggleListLayout() {
		listLayout.value = !listLayout.value
		saveListLayout()
	}

	function onListLayoutChange(e) {
		listLayout.value = e.detail.value
		saveListLayout()
	}

	function saveListLayout() {
		setSetting('list_layout', listLayout.value)
		uni.$emit('listLayoutChanged', listLayout.value)
	}

	/* ========== 静音播放 ========== */
	function toggleMuted() {
		muted.value = !muted.value
		saveMuted()
	}

	function onMutedChange(e) {
		muted.value = e.detail.value
		saveMuted()
	}

	function saveMuted() {
		setSetting('video_muted', muted.value)
		uni.$emit('mutedChanged', muted.value)
	}

	/* ========== 已有功能 ========== */
	function setTheme(val) {
		theme.value = val
		if (typeof uni.$lyotvTheme !== 'undefined') {
			uni.$lyotvTheme.set(val)
		} else {
			try {
				uni.setStorageSync('lyotv_theme', val)
			} catch {}
		}
		uni.showToast({
			title: val === 'dark' ? '深色模式' : '浅色模式',
			icon: 'none'
		})
	}

	function setImgSize(cols) {
		currentCols.value = cols
		try {
			uni.setStorageSync('lyotv_grid_cols', cols)
		} catch {}
		uni.$emit('gridColsChanged', cols)
		uni.showToast({
			title: cols === 'large' ? '3列' : cols === 'medium' ? '4列' : '5列',
			icon: 'none'
		})
	}

	async function submitSub() {
		const url = subUrl.value.trim()
		if (!url) return
		try {
			uni.showLoading({ title: '加载订阅...' })
			await apiInit(url)
			setSubUrl(url)
			try {
				const siteData = await getSites()
				updateSites(siteData)
			} catch (e2) { /* ignore */ }
			const data = await home()
			updateHome(data)
			uni.$emit('subUpdated')
			uni.hideLoading()
			uni.showToast({ title: '订阅成功', icon: 'success' })
			subUrl.value = ''
		} catch (e) {
			uni.hideLoading()
			const msg = e && e.message ? e.message : '订阅加载失败'
			if (msg.length > 20) {
				uni.showModal({ title: '订阅失败', content: msg, showCancel: false })
			} else {
				uni.showToast({ title: msg, icon: 'none' })
			}
		}
	}

	function goPage(page) {
		switch (page) {
			case 'favorite':
				uni.navigateTo({ url: '/pages/favorite/favorite' })
				break
			case 'history':
				uni.navigateTo({ url: '/pages/history/history' })
				break
			case 'settings':
				uni.navigateTo({ url: '/pages/settings/settings' })
				break
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: var(--bg-primary);
		padding-bottom: 20rpx;
	}

	/* ========== 用户头部 ========== */
	.profile {
		display: flex;
		align-items: center;
		padding: 40rpx 24rpx 24rpx;
		gap: 16rpx;

		.avatar {
		  width: 100rpx;
		  height: 100rpx;
		  border-radius: 50%;
		  background: var(--card);
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  flex-shrink: 0;
		 }

		.profile-info {
		 flex: 1;
		 display: flex;
		 flex-direction: column;
		 gap: 4rpx;

		 .name {
		  font-size: 32rpx;
		  font-weight: 600;
		  color: var(--text-primary);
		 }

		 .bio {
		  font-size: 22rpx;
		  color: var(--text-secondary);
		 }
		}

		.settings-icon {
			padding: 8rpx;
		}
	}

	/* ========== 统计卡片 ========== */
.stats-row {
	display: flex;
	gap: 12rpx;
	margin: 0 20rpx 20rpx;
}

.stat-card {
	flex: 1;
	background: var(--card);
	border-radius: 16rpx;
	padding: 20rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;

	&:active {
	 opacity: 0.7;
	}

	.stat-count {
	 font-size: 36rpx;
	 font-weight: 700;
	 color: var(--text-primary);
	}

	.stat-label {
	 font-size: 22rpx;
	 color: var(--text-secondary);
	}

	.stat-detail {
	 font-size: 18rpx;
	 color: #555;
	 margin-top: 2rpx;
	}
}

	/* ========== 公共区块 ========== */
	.section {
		margin: 0 20rpx 16rpx;
		background: var(--card);
		border-radius: 16rpx;
		padding: 20rpx;

		&-header {
			display: flex;
			align-items: center;
			gap: 8rpx;
			margin-bottom: 16rpx;
		}

		&-title {
		  font-size: 24rpx;
		  color: var(--text-secondary);
		 }
	}

	/* ========== 设置项 ========== */
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;

		&-left {
			display: flex;
			align-items: center;
			gap: 10rpx;
		}

		&-label {
			font-size: 26rpx;
			color: var(--text-primary);
		}

		&-right {
			display: flex;
			align-items: center;
			gap: 6rpx;
		}
	}

	/* ========== 订阅源输入 ========== */
	.sub-input {
		display: flex;
		gap: 12rpx;

		input {
		 flex: 1;
		 background: var(--bg-primary);
		 border-radius: 12rpx;
		 padding: 16rpx 20rpx;
		 font-size: 24rpx;
		 color: var(--text-primary);
		}

		.placeholder {
		 color: var(--text-secondary);
		 font-size: 24rpx;
		}

		.sub-btn {
		 background: $theme-accent;
			color: #fff;
			border-radius: 12rpx;
			padding: 0 28rpx;
			font-size: 26rpx;
			line-height: 68rpx;
			flex-shrink: 0;
		}
	}

	.sub-hint {
		display: block;
		font-size: 20rpx;
		color: var(--text-secondary);
		margin-top: 10rpx;
		word-break: break-all;
	}

	/* ========== 图片大小选择 ========== */
	.img-size-options {
		display: flex;
		gap: 12rpx;
	}

	.img-size-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
		padding: 16rpx 0;
		border-radius: 12rpx;
		background: var(--bg-primary);
		transition: all 0.2s;

		&.active {
			background: rgba($theme-accent, 0.12);
			outline: 2rpx solid $theme-accent;
		}

		&:active {
			opacity: 0.7;
		}

		&-label {
		 font-size: 28rpx;
		 font-weight: 600;
		 color: var(--text-primary);

		 .active & {
		  color: $theme-accent;
		 }
		}

		&-cols {
		 font-size: 20rpx;
		 color: var(--text-secondary);
		}
	}

	/* ========== 显示主题（深色/浅色） ========== */
	.theme-options {
		display: flex;
		gap: 12rpx;
	}

	.theme-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 18rpx 0;
		border-radius: 12rpx;
		background: var(--bg-primary);
		transition: all 0.2s;

		&.active {
			outline: 2rpx solid $theme-accent;
			background: rgba($theme-accent, 0.08);
		}

		&:active {
			opacity: 0.7;
		}

		&-label {
			font-size: 26rpx;
			color: var(--text-primary);
			font-weight: 500;
		}
	}

	/* ========== 缓存 ========== */
	.cache-size {
		font-size: 22rpx;
		color: var(--text-secondary);
	}

	/* ========== 关于 ========== */
	.about {
		text-align: center;
		padding: 40rpx 0;

		.version {
			font-size: 20rpx;
			color: #555;
		}
	}
</style>
