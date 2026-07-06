<template>
	<view class="page">
		<!-- 空状态 -->
		<view class="empty" v-if="list.length === 0">
			<uni-icons type="star" size="60" color="#555" />
			<text class="empty-text">暂无收藏</text>
			<text class="empty-sub">去首页发现喜欢的影片吧</text>
		</view>

		<!-- 列表 -->
		<view class="list" v-else>
			<view v-for="item in list" :key="item.vod_id" class="item" @tap="goDetail(item)">
				<image class="thumb" :src="item.vod_pic" mode="aspectFill" />
				<view class="info">
					<text class="title" :lines="1">{{ item.vod_name }}</text>
					<text class="remark" v-if="item.vod_remarks && item.vod_remarks !== '0'">{{ item.vod_remarks }}</text>
				</view>
				<view class="close" @tap.stop="onRemove(item.vod_id)">
					<uni-icons type="closeempty" size="18" color="#555" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { getFavorites, removeFavorite, addHistory } from '@/utils/store.js'

	const list = ref([])

	function load() {
		list.value = getFavorites()
	}

	// 用 onShow 而非 onMounted，确保每次切到 tab 都刷新
	import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
	onShow(() => load())

	onPullDownRefresh(() => {
		load()
		uni.stopPullDownRefresh()
	})

	function onRemove(vodId) {
		removeFavorite(vodId)
		list.value = getFavorites()
		uni.showToast({ title: '已移除', icon: 'none' })
	}

	function goDetail(item) {
		addHistory(item)
		uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}&key=${item.site_key || ''}` })
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: var(--bg-primary);
	}

	/* 列表 */
	.list {
		padding: 12rpx 16rpx;
	}

	.item {
		display: flex;
		gap: 16rpx;
		padding: 16rpx 12rpx;
		background: var(--card);
		border-radius: 12rpx;
		margin-bottom: 12rpx;
		align-items: center;
		box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.04);
		transition: transform 0.15s;

		&:active {
			transform: scale(0.98);
		}
	}

	.thumb {
		width: 120rpx;
		height: 160rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		background: var(--card-hover);
	}

	.info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		min-width: 0;
	}

	.title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		color: var(--text-primary);
		line-height: var(--leading-tight);
	}

	.remark {
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-normal);
		color: var(--accent);
	}

	.close {
		padding: 12rpx;
		flex-shrink: 0;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;
		gap: 12rpx;

		&-text {
			font-size: var(--text-lg);
			letter-spacing: var(--tracking-wide);
			color: var(--text-secondary);
			margin-top: 16rpx;
		}

		&-sub {
			font-size: var(--text-sm);
			color: #555;
		}
	}
</style>
