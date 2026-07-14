<template>
	<view>
		<!-- 触发按钮 -->
		<view class="debug-trigger" @tap="show = !show">
			<text class="debug-trigger-icon">🐛</text>
		</view>
		<!-- 日志面板 -->
		<view class="debug-panel" v-if="show">
			<view class="debug-header">
				<text class="debug-title">调试日志 ({{ debugLogs.length }})</text>
				<view class="debug-actions">
					<text class="debug-btn" @tap="onCopy">复制</text>
					<text class="debug-btn" @tap="onClear">清空</text>
					<text class="debug-btn close" @tap="show = false">✕</text>
				</view>
			</view>
			<scroll-view scroll-y class="debug-body">
			 <text class="debug-line" :class="{ 'debug-section': l.includes('═══════') }" v-for="(l, i) in debugLogs" :key="i">{{ l }}</text>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import {
		debugLogs,
		clearDebugLogs
	} from '@/utils/debugLog.js'

	const show = ref(false)

	function onCopy() {
		uni.setClipboardData({
			data: debugLogs.value.join('\n'),
			success: () => uni.showToast({
				title: '已复制',
				icon: 'success',
				duration: 3000
			})
		})
	}

	function onClear() {
		clearDebugLogs()
	}
</script>

<style lang="scss" scoped>
	.debug-trigger {
		position: fixed;
		left: 24rpx;
		bottom: 180rpx;
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 998;
	}

	.debug-trigger-icon {
		font-size: 32rpx;
	}

	.debug-panel {
		position: fixed;
		left: 16rpx;
		right: 16rpx;
		bottom: 260rpx;
		max-height: 45vh;
		background: rgba(0, 0, 0, 0.88);
		border-radius: 16rpx;
		z-index: 999;
		display: flex;
		flex-direction: column;
	}

	.debug-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 20rpx;
		border-bottom: 1rpx solid rgba(255, 255, 255, 0.15);
	}

	.debug-title {
		font-size: 24rpx;
		color: #fe8027;
		font-weight: 600;
	}

	.debug-actions {
		display: flex;
		gap: 20rpx;
	}

	.debug-btn {
		font-size: 22rpx;
		color: #ccc;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		background: rgba(255, 255, 255, 0.1);

		&.close {
			color: #ff6b6b;
		}
	}

	.debug-body {
		max-height: 36vh;
		padding: 12rpx 20rpx;
	}

	.debug-line {
		display: block;
		font-size: 20rpx;
		color: #0f0;
		line-height: 1.6;
		font-family: monospace;
		word-break: break-all;
	}

	.debug-section {
		color: #fe8027;
		font-weight: 600;
		font-size: 22rpx;
		background: rgba(254, 128, 39, 0.12);
		padding: 4rpx 8rpx;
		border-radius: 4rpx;
		margin: 6rpx 0;
	}
</style>
