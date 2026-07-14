<template>
	<view class="page" :style="themeStyle">
		<!-- 顶部背景区域（状态栏间距 + 影视背景图） -->
		<view class="header-bg" :style="{ paddingTop: statusBarHeight + 'px' }">
			<!-- 用户头部 -->
			<view class="profile">
				<view class="avatar" @tap="loggedIn ? showAvatarPicker = true : onProfileTap()">
					<text class="avatar-emoji">{{ displayAvatar }}</text>
				</view>
				<view class="profile-info" @tap="loggedIn ? openProfileEditor() : onProfileTap()">
					<text class="name">{{ loggedIn ? (profile?.nickname || '用户') : '点击登录' }}</text>
					<text class="introduction">{{ loggedIn ? introductionText : '登录后同步收藏和历史到云端' }}</text>
				</view>
				<view class="profile-arrow" v-if="loggedIn" @tap="openProfileEditor()">
					<uni-icons type="arrowright" size="16" color="#555" />
				</view>
			</view>
		</view>

		<view class="scroll-body">

			<!-- 功能卡片（纯图标入口，点击跳转详情页） -->
			<view class="stats-row">
				<view class="stat-card" @tap="goPage('favorite')">
					<uni-icons type="star" size="33" color="#fe8027" />
					<text class="stat-label">我的收藏</text>
				</view>
				<view class="stat-card" @tap="goPage('history')">
					<image class="history-img" src="/static/image/icon_history_sel.png" mode="aspectFit" />
					<text class="stat-label">观看历史</text>
				</view>
				<view class="stat-card">
					<uni-icons type="download" size="30" color="#fe8027" />
					<text class="stat-label">我的下载</text>
				</view>
			</view>

			<!-- 订阅源设置（点播 + 直播 + 历史，共享一个模块背景） -->
			<view class="section">
				<view class="sub-group">
					<view class="section-header">
						<uni-icons type="link" size="18" color="#888" />
						<text class="section-title">点播源</text>
					</view>
					<view class="sub-input">
						<input v-model="subUrl" placeholder="输入点播订阅地址" placeholder-class="placeholder"
							maxlength="100" />
						<uni-icons v-if="subUrl" type="closeempty" size="17" color="#999" class="sub-clear-icon"
							@tap="subUrl = ''" />
						<text class="sub-btn" @tap="submitSub">确定</text>
					</view>
					<view v-if="store.subUrl" class="sub-hint">
						<text class="sub-hint-text">当前点播源：{{ store.subUrl }}</text>
						<text class="sub-copy-btn" @tap="copySubUrl">复制</text>
					</view>
				</view>

				<view class="sub-group">
					<view class="section-header">
						<uni-icons type="link" size="18" color="#888" />
						<text class="section-title">直播源</text>
					</view>
					<view class="sub-input">
						<input v-model="liveSubUrl" placeholder="输入直播订阅地址（留空则用点播源）" placeholder-class="placeholder"
							maxlength="100" />
						<uni-icons v-if="liveSubUrl" type="closeempty" size="17" color="#999" class="sub-clear-icon"
							@tap="liveSubUrl = ''" />
						<text class="sub-btn" @tap="submitLiveSub">确定</text>
					</view>
					<view v-if="store.liveSubUrl" class="sub-hint">
						<text class="sub-hint-text">当前直播源：{{ store.liveSubUrl }}</text>
						<text class="sub-copy-btn" @tap="copyLiveSubUrl">复制</text>
					</view>
				</view>

				<view class="sub-history-link" @tap="goPage('subHistory')">
					<text class="sub-history-text">历史订阅源</text>
					<uni-icons type="arrowright" size="16" color="#666" />
				</view>
			</view>

			<!-- 首页布局 -->
			<view class="section">
				<view class="section-header">
					<uni-icons type="image-filled" size="18" color="#888" />
					<text class="section-title">首页布局</text>
				</view>
				<view class="img-size-options">
					<text class="img-size-btn" v-for="opt in colOptions" :key="opt.value"
						:class="{ active: currentCols === opt.value }" @tap="setImgSize(opt.value)">
						<text class="img-size-btn-label">{{ opt.label }}</text>
						<text class="img-size-btn-cols">一行{{ opt.value }}列</text>
					</text>
				</view>
			</view>

			<!-- 显示主题（深色/浅色） -->
			<view class="section">
				<view class="section-header">
					<uni-icons type="color-filled" size="18" color="#888" />
					<text class="section-title">显示主题</text>
				</view>
				<view class="setting-item">
					<view class="setting-item-left">
						<text class="setting-item-label">深色模式</text>
					</view>
					<switch :checked="theme === 'dark'" @change="onThemeChange" color="#fe8027" />
				</view>
			</view>

			<!-- 播放设置 -->
			<view class="section">
				<view class="section-header">
					<uni-icons type="videocam-filled" size="18" color="#888" />
					<text class="section-title">播放设置</text>
				</view>
				<view class="setting-item">
					<view class="setting-item-left">
						<text class="setting-item-label">静音播放</text>
					</view>
					<switch :checked="muted" @change="onMutedChange" color="#fe8027" />
				</view>
				<view class="setting-divider" />
				<view class="setting-item">
					<view class="setting-item-left">
						<text class="setting-item-label">长按倍速</text>
					</view>
					<view class="speed-picker">
						<text v-for="opt in speedOptions" :key="opt.value" class="speed-picker-item"
							:class="{ active: longPressSpeed === opt.value }"
							@tap="onLongPressSpeedChange(opt.value)">{{ opt.text }}</text>
					</view>
				</view>
			</view>

			<!-- 清除缓存 -->
			<view class="section">
				<view class="setting-item" @tap="clearCache">
					<view class="setting-item-left no-indent">
						<uni-icons type="trash-filled" size="18" color="#888" />
						<text class="setting-item-label">清除缓存</text>
					</view>
					<view class="setting-item-right">
						<text class="cache-size">{{ cacheSize }}</text>
						<uni-icons type="arrowright" size="16" color="#666" />
					</view>
				</view>
			</view>

			<!-- 关于 -->
			<view class="about">
				<text class="version">乐意欧TV v1.0.38</text>
			</view>
		</view>

		<!-- 头像选择弹窗 -->
		<view class="avatar-overlay" v-if="showAvatarPicker" @tap.self="showAvatarPicker = false">
			<view class="avatar-picker">
				<view class="picker-header">
					<text class="picker-title">选择头像</text>
					<text class="picker-close" @tap="showAvatarPicker = false">✕</text>
				</view>
				<view class="picker-grid">
					<view v-for="a in ANIMAL_AVATARS" :key="a" class="picker-item"
						:class="{ active: selectedAvatar === a }" @tap="selectAvatar(a)">
						<text class="picker-emoji">{{ a }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 个人资料编辑弹窗 -->
		<view class="avatar-overlay" v-if="showProfileEditor" @tap.self="closeProfileEditor">
			<view class="profile-editor">
				<view class="picker-header">
					<text class="picker-title">编辑资料</text>
					<text class="picker-close" @tap="closeProfileEditor">✕</text>
				</view>
				<view class="editor-form">
					<view class="editor-field">
						<text class="editor-label">昵称</text>
						<input class="editor-input" v-model="editNickname" placeholder="输入昵称" maxlength="10" />
					</view>
					<view class="editor-field">
						<text class="editor-label">简介</text>
						<input class="editor-input" v-model="editIntro" placeholder="介绍自己" maxlength="20" />
					</view>
					<text v-if="!saveLoading" class="editor-btn" @tap="saveProfile">保存</text>
					<text v-else class="editor-btn loading-btn">
						<uni-icons type="spinner-cycle" size="16" color="#fff" />
						<text>保存中...</text>
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onUnmounted
	} from 'vue'
	import {
		store,
		setSubUrl,
		setLiveSubUrl,
		updateHome,
		updateSites
	} from '@/utils/appState.js'
	import {
		init as apiInit,
		getSites,
		liveInit,
		ensureInit,
		home as apiHome
	} from '@/utils/api.js'
	import {
		addLog,
		logSection
	} from '@/utils/debugLog.js'
	import {
		getSetting,
		setSetting,
		getSubHistory,
		addSubHistory,
		addLiveSubHistory,
		removeSubHistory,
		getCurrentUser,
		getProfile,
		updateProfile,
		logout as cloudLogout,
	} from '@/utils/store.js'
	import {
		theme,
		themeStyle,
		setTheme as applyThemeChange
	} from '@/utils/theme.js'
	import {
		useStatusBar
	} from '@/utils/useStatusBar.js'

	const {
		statusBarHeight
	} = useStatusBar()

	const subUrl = ref('')
	const liveSubUrl = ref('')
	const colOptions = [{
			value: 3,
			label: '大'
		},
		{
			value: 4,
			label: '中'
		},
		{
			value: 5,
			label: '小'
		},
	]
	const currentCols = ref(3)
	const muted = ref(true)
	const longPressSpeed = ref(2)
	const speedOptions = [{
			value: 1.5,
			text: '1.5x'
		},
		{
			value: 2,
			text: '2x'
		},
		{
			value: 3,
			text: '3x'
		},
	]
	const cacheSize = ref('计算中…')

	// ===== 头像 =====
	const ANIMAL_AVATARS = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐯', '🦁', '🐸', '🐵', '🦄', '🐷', '🐨', '🐲', '🦋', '🐙', '🦉',
		'🐧', '🐭', '🐮', '🐻'
	]
	const showAvatarPicker = ref(false)
	const selectedAvatar = ref('')
	const avatarLoading = ref(false)

	const displayAvatar = computed(() => {
		return selectedAvatar.value || profile.value?.avatar_url || '🐱'
	})

	// ===== 个人资料 =====
	const showProfileEditor = ref(false)
	const editNickname = ref('')
	const editIntro = ref('')
	const saveLoading = ref(false)

	const introductionText = computed(() => {
		return profile.value?.introduction || '观看精彩影视'
	})

	// ===== 用户登录态 =====
	const loggedIn = ref(false)
	const profile = ref(null)

	async function loadUserState() {
		const user = getCurrentUser()
		loggedIn.value = !!user
		if (user) {
			profile.value = getProfile()
			selectedAvatar.value = profile.value?.avatar_url || ''
		}
	}

	function onProfileTap() {
		if (!loggedIn.value) {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		} else {
			uni.showActionSheet({
				itemList: ['退出登录'],
				success: (res) => {
					if (res.tapIndex === 0) doLogout()
				}
			})
		}
	}

	async function doLogout() {
		uni.showLoading({
			title: '退出中...',
			mask: true
		})
		try {
			await cloudLogout()
			loggedIn.value = false
			profile.value = null
			selectedAvatar.value = ''
			uni.hideLoading()
			uni.showToast({
				title: '已退出',
				icon: 'success',
				duration: 2000
			})
		} catch (e) {
			uni.hideLoading()
			uni.showToast({
				title: '退出失败',
				icon: 'none',
				duration: 2000
			})
		}
	}

	async function selectAvatar(emoji) {
		if (avatarLoading.value) return
		avatarLoading.value = true
		try {
			await updateProfile({
				avatar_url: emoji
			})
			selectedAvatar.value = emoji
			showAvatarPicker.value = false
			uni.showToast({
				title: '头像已更换',
				icon: 'success',
				duration: 2000
			})
		} catch (e) {
			uni.showToast({
				title: '保存失败',
				icon: 'none',
				duration: 2000
			})
		} finally {
			avatarLoading.value = false
		}
	}

	// ===== 个人资料编辑 =====
	function openProfileEditor() {
		editNickname.value = profile.value?.nickname || ''
		editIntro.value = profile.value?.introduction || ''
		showProfileEditor.value = true
	}

	function closeProfileEditor() {
		showProfileEditor.value = false
	}

	async function saveProfile() {
		const nickname = editNickname.value.trim()
		const introduction = editIntro.value.trim()
		if (!nickname) {
			uni.showToast({
				title: '昵称不能为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		if (saveLoading.value) return
		saveLoading.value = true
		try {
			await updateProfile({
				nickname,
				introduction
			})
			// 更新本地 profile
			if (profile.value) {
				profile.value = {
					...profile.value,
					nickname,
					introduction
				}
			}
			showProfileEditor.value = false
			uni.showToast({
				title: '资料已保存',
				icon: 'success',
				duration: 2000
			})
		} catch (e) {
			uni.showToast({
				title: '保存失败',
				icon: 'none',
				duration: 2000
			})
		} finally {
			saveLoading.value = false
		}
	}

	onMounted(() => {
		// 图片列数（从云端偏好读取）
		currentCols.value = getSetting('grid_cols', 3)
		// 主题：theme ref 已由 App.vue initTheme() 初始化，这里无需重复赋值
		// 静音播放
		muted.value = getSetting('video_muted', true)
		// 长按倍速
		longPressSpeed.value = getSetting('long_press_speed', 2)
		// 缓存大小
		calcCacheSize()
		// 加载用户状态（初始加载一次，后续登录/退出由事件驱动）
		loadUserState()
		// 监听登录/退出事件更新 UI（无需每次切 tab 都刷新）
		uni.$on('preferencesLoaded', () => loadUserState())
	})

	onUnmounted(() => {
		uni.$off('preferencesLoaded')
	})

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
						// 保留收藏/历史缓存（加速用）和订阅源相关
						const keep = ['lyotv_favorites', 'lyotv_history',
							'lyotv_sub_url', 'lyotv_sub_history'
						]
						const keys = uni.getStorageInfoSync().keys || []
						keys.forEach(k => {
							if (!keep.includes(k)) {
								uni.removeStorageSync(k)
							}
						})
						cacheSize.value = '0 B'
						uni.showToast({
							title: '缓存已清除',
							icon: 'success',
							duration: 2000
						})
					} catch (e) {
						uni.showToast({
							title: '清除失败',
							icon: 'none',
							duration: 2000
						})
					}
				}
			}
		})
	}

	/* ========== 静音播放 ========== */
	function onMutedChange(e) {
		muted.value = e.detail.value
		saveMuted()
	}

	function saveMuted() {
		setSetting('video_muted', muted.value)
		uni.$emit('mutedChanged', muted.value)
	}

	function onLongPressSpeedChange(val) {
		longPressSpeed.value = val
		setSetting('long_press_speed', val)
		uni.$emit('longPressSpeedChanged', val)
		uni.showToast({
			title: `播放器长按倍速已设为${val}x`,
			icon: 'none',
			duration: 3000
		})
	}

	/* ========== 显示主题（深色/浅色） ========== */
	function onThemeChange(e) {
		applyThemeChange(e.detail.value ? 'dark' : 'light')
	}

	function setImgSize(cols) {
		currentCols.value = cols
		setSetting('grid_cols', cols)
		uni.$emit('gridColsChanged', cols)
	}

	async function submitSub() {
		const url = subUrl.value.trim()
		if (!url) return
		logSection('提交订阅')
		addLog('MINE', 'submitSub 开始 url=' + url.slice(0, 50))
		uni.showLoading({
			title: '加载订阅...'
		})
		try {
			const t0 = Date.now()
			await ensureInit(url)
			addLog('MINE', `ensureInit 完成 (${Date.now() - t0}ms)`)
			addSubHistory(url)
			setSubUrl(url)
			// 订阅源已生效，隐藏 loading
			uni.hideLoading()
			uni.showToast({
				title: '订阅成功',
				icon: 'success',
				duration: 2000
			})
			subUrl.value = ''
			addLog('MINE', 'submitSub 订阅源设置完成')
			// 后台：获取站点元数据（不阻塞 UI）
			getSites().then(siteData => {
				addLog('MINE', `getSites 完成 sites=${siteData ? siteData.length : 0}`)
				if (siteData) updateSites(siteData)
			}).catch(e2 => {
				addLog('MINE', 'getSites 失败: ' + (e2?.message || ''))
			})
			// 拉首页数据并 updateHome，对齐 index.vue 注释承诺：mine.vue 拉完后 subUpdated 处理器直接同步即可
			try {
				const homeData = await apiHome()
				addLog('MINE',
					`apiHome 完成 list=${(homeData?.list || []).length} classes=${(homeData?.['class'] || homeData?.classes || []).length}`
				)
				updateHome(homeData)
			} catch (e3) {
				addLog('MINE', 'apiHome 失败: ' + (e3?.message || ''))
			}
			// 通知首页加载数据（此时 store.homeList 已填充，index.vue subUpdated 处理器直接同步）
			uni.$emit('subUpdated')
		} catch (e) {
			uni.hideLoading()
			const msg = e && e.message ? e.message : '订阅加载失败'
			addLog('MINE', 'submitSub 失败: ' + msg)
			if (msg.length > 20) {
				uni.showModal({
					title: '订阅失败',
					content: msg,
					showCancel: false
				})
			} else {
				uni.showToast({
					title: msg,
					icon: 'none',
					duration: 3000
				})
			}
		}
	}

	async function submitLiveSub() {
		const url = liveSubUrl.value.trim()
		if (!url) return
		logSection('提交直播源')
		addLog('MINE', 'submitLiveSub 开始 url=' + url.slice(0, 50))
		addLiveSubHistory(url)
		setLiveSubUrl(url)
		uni.showToast({
			title: '直播源已设置',
			icon: 'success',
			duration: 2000
		})
		liveSubUrl.value = ''
		addLog('MINE', 'submitLiveSub 完成')
		// 预热直播初始化：拉订阅 JSON + 解析全频道需 5-10s，提前触发避免切卫视页等待
		liveInit(url).catch(e => addLog('MINE', 'submitLiveSub liveInit 预热失败: ' + (e?.message || '')))
	}

	function goPage(page) {
		switch (page) {
			case 'favorite':
				uni.navigateTo({
					url: '/pages/favorite/favorite'
				})
				break
			case 'history':
				uni.navigateTo({
					url: '/pages/history/history'
				})
				break
			case 'subHistory':
				uni.navigateTo({
					url: '/pages/sub-history/sub-history'
				})
				break
		}
	}

	function copySubUrl() {
		const url = store.subUrl
		if (!url) return
		uni.setClipboardData({
			data: url,
			success: () => {
				uni.showToast({
					title: '已复制点播源地址',
					icon: 'success',
					duration: 2000
				})
			}
		})
	}

	function copyLiveSubUrl() {
		const url = store.liveSubUrl
		if (!url) return
		uni.setClipboardData({
			data: url,
			success: () => {
				uni.showToast({
					title: '已复制直播源地址',
					icon: 'success',
					duration: 2000
				})
			}
		})
	}
</script>

<style lang="scss" scoped>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--bg-primary);
	}

	/* 顶部背景区域（深色渐变，模拟影院氛围） */
	.header-bg {
		flex-shrink: 0;
		position: relative;
		z-index: 1;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(254, 128, 39, 0.18) 0%, transparent 85%),
			linear-gradient(180deg, var(--gradient-from) 0%, var(--gradient-to) 65%);
		background-color: var(--bg-primary);
	}

	.scroll-body {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 20rpx;
	}

	/* ========== 用户头部 ========== */
	.profile {
		display: flex;
		align-items: center;
		padding: 10rpx 24rpx 28rpx;
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

			.avatar-emoji {
				font-size: 52rpx;
				line-height: 1;
			}
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

			.introduction {
				font-size: 22rpx;
				color: var(--text-secondary);
			}
		}
	}

	/* ========== 头像选择弹窗 ========== */
	.avatar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-picker {
		background: var(--card, #1e1e1e);
		border-radius: 24rpx;
		padding: 32rpx;
		width: 560rpx;
		max-height: 70vh;
		overflow-y: auto;
	}

	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;

		.picker-title {
			font-size: 32rpx;
			font-weight: var(--weight-semibold);
			color: var(--text-primary, #ffffff);
		}

		.picker-close {
			font-size: 28rpx;
			color: var(--text-secondary);
			padding: 8rpx;

			&:active {
				opacity: 0.6;
			}
		}
	}

	.picker-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		justify-content: center;
	}

	.picker-item {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: var(--bg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;

		.picker-emoji {
			font-size: 44rpx;
			line-height: 1;
		}

		&.active {
			background: rgba($theme-accent, 0.15);
			outline: 3rpx solid $theme-accent;
		}

		&:active {
			transform: scale(0.9);
		}
	}

	/* ========== 个人资料编辑弹窗 ========== */
	.profile-editor {
		background: var(--card, #1e1e1e);
		border-radius: 24rpx;
		padding: 32rpx;
		width: 560rpx;
	}

	.editor-form {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.editor-field {
		display: flex;
		flex-direction: column;
		gap: 10rpx;

		.editor-label {
			font-size: 26rpx;
			font-weight: var(--weight-medium);
			color: var(--text-primary);
		}

		.editor-input {
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: 12rpx;
			padding: 20rpx 24rpx;
			font-size: 26rpx;
			color: var(--text-primary);
		}
	}

	.editor-btn {
		background: $theme-accent;
		color: #fff;
		text-align: center;
		border-radius: 12rpx;
		padding: 20rpx 0;
		font-size: 28rpx;
		font-weight: var(--weight-semibold);
		margin-top: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;

		&.loading-btn {
			opacity: 0.7;
		}

		&:active {
			opacity: 0.85;
		}
	}

	/* ========== 统计卡片 ========== */
	.stats-row {
		display: flex;
		gap: 12rpx;
		margin: 0 20rpx 26rpx;
	}

	.stat-card {
		flex: 1;
		background: var(--card);
		border-radius: 16rpx;
		padding: 24rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;

		&:active {
			opacity: 0.7;
		}

		.stat-label {
			font-size: var(--text-xs);
			color: var(--text-secondary);
		}

		.stat-detail {
			font-size: 18rpx;
			color: #555;
			margin-top: 2rpx;
		}

		.history-img {
			width: 60rpx;
			height: 60rpx;
		}
	}

	/* ========== 公共区块 ========== */
	.section {
		margin: 0 20rpx 20rpx;
		background: var(--card);
		border-radius: 16rpx;
		padding: 28rpx;

		&-header {
			--icon-size: 14rpx;
			display: flex;
			align-items: center;
			gap: 8rpx;
			margin-bottom: 16rpx;
		}

		&-title {
			font-size: var(--text-sm);
			color: var(--text-secondary);
		}
	}

	/* 订阅源分组间距（点播/直播组之间分隔线） */
	.sub-group {
		padding-bottom: 24rpx;
		margin-bottom: 24rpx;
		border-bottom: 1rpx solid var(--border);
	}

	.sub-group:last-of-type {
		padding-bottom: 0;
		margin-bottom: 0;
		border-bottom: none;
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
			padding-left: calc(var(--icon-size, 14rpx) + 8rpx);

			&.no-indent {
				padding-left: 0;
			}
		}

		&-label {
			font-size: var(--text-base);
			font-weight: var(--weight-medium);
			color: var(--text-primary);
		}

		&-right {
			display: flex;
			align-items: center;
			gap: 6rpx;
		}
	}

	/* 设置项分割线 */
	.setting-divider {
		height: 1rpx;
		background: var(--border);
		margin: 20rpx 0;
	}

	/* 长按倍速选项 */
	.speed-picker {
		display: flex;
		gap: 6rpx;
		flex-shrink: 0;
	}

	.speed-picker-item {
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		background: var(--card-hover);
		font-size: 24rpx;
		color: var(--text-secondary);
		text-align: center;
		line-height: 1.6;

		&.active {
			background: $theme-accent;
			color: #fff;
			font-weight: 600;
		}

		&:active {
			opacity: 0.7;
		}
	}

	/* ========== 订阅源输入 ========== */
	.sub-input {
		display: flex;
		gap: 12rpx;
		margin-top: 22rpx;

		input {
			flex: 1;
			background: var(--bg-primary);
			border-radius: 12rpx;
			padding: 16rpx 20rpx;
			font-size: 24rpx;
			color: var(--text-primary);
			border: 1px solid var(--text-secondary);
		}

		.sub-clear-icon {
			margin-left: -90rpx;
			align-self: center;
			z-index: 1;
			padding: 8rpx 24rpx;
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 24rpx;
		color: var(--text-secondary);
		margin-top: 20rpx;
		gap: 12rpx;

		&-text {
			flex: 1;
			word-break: break-all;
			margin-left: 8rpx;
		}
	}

	.sub-copy-btn {
		flex-shrink: 0;
		font-size: 22rpx;
		color: $theme-accent;
		padding: 4rpx 8rpx;

		&:active {
			opacity: 0.6;
		}
	}

	.sub-history-link {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 22rpx;
		padding: 12rpx calc(var(--icon-size, 14rpx) + 8rpx);

		&:active {
			opacity: 0.6;
		}

		.sub-history-text {
			flex: 1;
			font-size: var(--text-base);
			color: var(--text-primary);
		}
	}

	/* ========== 图片大小选择 ========== */
	.img-size-options {
		display: flex;
		gap: 12rpx;
	}

	.img-size-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4rpx;
		padding: 16rpx 0;
		border-radius: 12rpx;
		background: var(--bg-primary);

		&.active {
			background: rgba($theme-accent, 0.12);
		}

		&:active {
			opacity: 0.7;
		}

		&-label {
			font-size: 28rpx;
			font-weight: 600;
			color: var(--text-primary);
			margin-right: 10rpx;

			.active & {
				color: $theme-accent;
			}
		}

		&-cols {
			font-size: 20rpx;
			color: var(--text-secondary);
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