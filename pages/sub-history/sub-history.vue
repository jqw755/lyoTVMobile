<template>
	<view class="page">
		<!-- 空状态 -->
		<view v-if="list.length === 0" class="empty">
			<uni-icons type="link" size="60" color="#555" />
			<text class="empty-text">暂无历史订阅</text>
			<text class="empty-sub">订阅成功后自动记录</text>
		</view>

		<!-- 列表 -->
		<view v-else class="list">
			<view class="list-item" v-for="(item, index) in list" :key="item.url">
				<view class="item-main">
					<text class="item-index">#{{ index + 1 }}</text>
					<view class="item-content">
						<text class="item-url" lines="2">{{ item.url }}</text>
						<text class="item-time">{{ formatTime(item.time) }}</text>
					</view>
				</view>
				<view class="item-actions">
					<text class="action-btn copy" @tap="copyUrl(item.url)">复制</text>
					<text class="action-btn delete" @tap="deleteUrl(item.url)">删除</text>
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
		getSubHistory,
		removeSubHistory
	} from '@/utils/store.js'

	const list = ref([])

	onMounted(() => {
		loadList()
	})

	function loadList() {
		list.value = getSubHistory()
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
					icon: 'success'
				})
			}
		})
	}

	function deleteUrl(url) {
		removeSubHistory(url)
		loadList()
		uni.showToast({
			title: '已删除',
			icon: 'none'
		})
	}

	function clearAll() {
		uni.showModal({
			title: '清空历史',
			content: '确定要清空所有订阅历史吗？',
			success: (res) => {
				if (res.confirm) {
					list.value.forEach(item => removeSubHistory(item.url))
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