<template>
	<view class="page" :style="themeStyle">
		<!-- 顶部 tab -->
		<view class="tabs">
			<text class="tab" :class="{ active: activeTab === 'vod' }" @tap="switchTab('vod')">点播</text>
			<text class="tab" :class="{ active: activeTab === 'live' }" @tap="switchTab('live')">直播</text>
		</view>

		<!-- 空状态 -->
		<view v-if="list.length === 0" class="empty">
			<uni-icons type="link" size="60" color="#555" />
			<text class="empty-text">暂无{{ activeTab === 'vod' ? '点播' : '直播' }}订阅历史</text>
			<text class="empty-sub">订阅成功后自动记录</text>
		</view>

		<!-- 列表 -->
		<view v-else class="list">
			<view class="list-item" v-for="(item, index) in list" :key="item.url">
				<view class="item-main">
					<text class="item-index">{{ index + 1 }}</text>
					<view class="item-content">
						<text class="item-url" lines="2">{{ item.url }}</text>
						<text class="item-time">{{ formatTime(item.time) }}</text>
					</view>
					<text v-if="isCurrentUrl(item.url)" class="item-badge">使用中</text>
				</view>
				<view class="item-actions">
					<text class="action-btn copy" @tap="copyUrl(item.url)">复制</text>
					<text v-if="!isCurrentUrl(item.url)" class="action-btn delete"
						@tap="deleteUrl(item.url, index + 1)">删除</text>
				</view>
			</view>
		</view>

		<!-- 底部清空按钮 -->
		<view v-if="list.length > 0" class="footer">
			<text class="clear-btn" @tap="clearAll">清空全部</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		themeStyle
	} from '@/utils/theme.js'
	import {
		getSubHistory,
		removeSubHistory,
		getLiveSubHistory,
		removeLiveSubHistory
	} from '@/utils/store.js'
	import {
		store
	} from '@/utils/appState.js'

	const activeTab = ref('vod')
	const list = ref([])

	onMounted(() => {
		loadList()
	})

	function switchTab(tab) {
		activeTab.value = tab
		loadList()
	}

	function loadList() {
		const raw = activeTab.value === 'vod' ? (getSubHistory() || []) : (getLiveSubHistory() || [])
		list.value = [...raw]
	}

	function isCurrentUrl(url) {
		if (activeTab.value === 'vod') return url === store.subUrl
		return url === store.liveSubUrl
	}

	function formatTime(ts) {
		if (!ts) return ''
		const d = new Date(ts)
		const pad = (n) => (n < 10 ? '0' : '') + n
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
	}

	function copyUrl(url) {
		uni.setClipboardData({
			data: url,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'success',
					duration: 3000
				})
			}
		})
	}

	function deleteUrl(url, idx) {
		uni.showModal({
			title: '提示',
			content: `确定删除第${idx}个${activeTab.value === 'vod' ? '点播' : '直播'}订阅吗？`,
			success: (res) => {
				if (res.confirm) {
					if (activeTab.value === 'vod') {
						removeSubHistory(url)
					} else {
						removeLiveSubHistory(url)
					}
					loadList()
					uni.showToast({
						title: '已删除',
						icon: 'none'
					})
				}
			}
		})
	}

	function clearAll() {
		uni.showModal({
			title: '清空历史',
			content: `确定要清空所有${activeTab.value === 'vod' ? '点播' : '直播'}订阅历史吗？（当前使用中的订阅不会被清除）`,
			success: (res) => {
				if (res.confirm) {
					list.value.forEach(item => {
						if (!isCurrentUrl(item.url)) {
							if (activeTab.value === 'vod') {
								removeSubHistory(item.url)
							} else {
								removeLiveSubHistory(item.url)
							}
						}
					})
					loadList()
					uni.showToast({
						title: '已清空',
						icon: 'success'
					})
				}
			}
		})
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: var(--bg-primary);
		padding-bottom: 100rpx;
	}

	/* 顶部 tab */
	.tabs {
		display: flex;
		background: var(--card);
		border-bottom: 1rpx solid var(--border);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		font-size: 28rpx;
		color: var(--text-secondary);
		font-weight: 500;
		position: relative;
		transition: all 0.15s;

		&.active {
			color: $theme-accent;
			font-weight: 600;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 20%;
				right: 20%;
				height: 4rpx;
				background: $theme-accent;
				border-radius: 4rpx 4rpx 0 0;
			}
		}

		&:active {
			opacity: 0.6;
		}
	}

	/* 空状态 */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		gap: 16rpx;

		.empty-text {
			font-size: 28rpx;
			color: var(--text-secondary);
		}

		.empty-sub {
			font-size: 22rpx;
			color: var(--text-secondary);
			opacity: 0.7;
		}
	}

	/* 列表 */
	.list {
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.list-item {
		background: var(--card);
		border-radius: 16rpx;
		padding: 20rpx;

		.item-main {
			display: flex;
			gap: 12rpx;

			.item-index {
				font-size: 22rpx;
				color: var(--text-secondary);
				flex-shrink: 0;
				line-height: 1.6;
				min-width: 40rpx;
			}

			.item-content {
				flex: 1;
				min-width: 0;

				.item-url {
					font-size: 24rpx;
					color: var(--text-primary);
					line-height: 1.5;
					word-break: break-all;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}

				.item-time {
					font-size: 20rpx;
					color: var(--text-secondary);
					margin-top: 6rpx;
					display: block;
				}
			}
		}

		.item-badge {
			font-size: 20rpx;
			color: $theme-accent;
			background: rgba($theme-accent, 0.12);
			padding: 4rpx 14rpx;
			border-radius: 6rpx;
			flex-shrink: 0;
			align-self: flex-start;
			margin-left: 12rpx;
			font-weight: 500;
		}

		.item-actions {
			display: flex;
			gap: 16rpx;
			justify-content: flex-end;
			margin-top: 16rpx;
			padding-top: 12rpx;
			border-top: 1rpx solid var(--border);

			.action-btn {
				font-size: 24rpx;
				padding: 8rpx 24rpx;
				border-radius: 8rpx;
				line-height: 1.6;

				&:active {
					opacity: 0.6;
				}

				&.copy {
					color: $theme-accent;
					background: rgba($theme-accent, 0.1);
				}

				&.delete {
					color: #fe8027;
					background: rgba(#fe8027, 0.1);
				}
			}
		}
	}

	/* 底部 */
	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 40rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background: var(--bg-primary);

		.clear-btn {
			display: block;
			text-align: center;
			font-size: 26rpx;
			color: #fe8027;
			background: var(--card);
			border-radius: 16rpx;
			padding: 20rpx 0;
			line-height: 1.4;

			&:active {
				opacity: 0.6;
			}
		}
	}
</style>