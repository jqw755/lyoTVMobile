<template>
	<view class="grid-wrapper">
		<view class="grid" :style="{ gridTemplateColumns: gridTemplateCols, gap: gap + 'rpx' }">
			<view v-for="(item, idx) in items" :key="(item.vod_id && item.vod_id !== '0') ? item.vod_id : (item._key || ('idx-' + idx))" class="grid-item"
				@tap="onItemTap(item)">
				<view class="grid-card">
					<view class="grid-poster-wrap">
						<image class="grid-poster" :src="item.vod_pic" mode="aspectFill" lazy-load />
						<text v-if="formatBadge(item.vod_remarks)" class="grid-badge">
						  {{ formatBadge(item.vod_remarks) }}
						 </text>
						<slot name="overlay" :item="item" />
					</view>
					<view class="grid-info">
						<text class="grid-title" :lines="1">{{ item.vod_name }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 格式化角标：去除"评分"前缀和尾部标点，只保留数值，0不展示
	function formatBadge(text) {
		if (!text || text === '0') return ''
		const cleaned = text.replace(/^评分|[，,。、；：""''「」【】《》（）!！?？\s]+$/g, '')
		if (cleaned === '0') return ''
		return cleaned
	}

	// 网格列数 3/4/5，用于 CSS Grid repeat(N, 1fr)
	import {
		getSetting
	} from '@/utils/store.js'

	export default {
		props: {
			items: {
				type: Array,
				required: true
			},
			// 可选：外部显式传入尺寸级别，不传则自动读取设置
			gridSize: {
				type: Number,
				default: null
			},
		},
		emits: ['itemTap'],
		data() {
			return {
				gap: 20, // rpx
				cols: 3,
			}
		},
		computed: {
			gridTemplateCols() {
				return `repeat(${this.cols}, 1fr)`
			}
		},
		mounted() {
			this.loadSize()
			uni.$on('gridColsChanged', (val) => {
				if (val != null) this.cols = val
			})
		},
		beforeDestroy() {
			uni.$off('gridColsChanged')
		},
		methods: {
			loadSize() {
				this.cols = this.gridSize ?? getSetting('grid_cols', 3)
			},
			onItemTap(item) {
				this.$emit('itemTap', item)
			},
		},
	}
</script>

<style lang="scss" scoped>
	.grid-wrapper {
		max-width: 750rpx;
		margin: 0 auto;
		padding: 0 24rpx;
	}

	.grid {
		display: grid;
	}

	.grid-item {
		box-sizing: border-box;
	}

	.grid-card {
		border-radius: 14rpx;
		overflow: hidden;
		background: var(--card);
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.08);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.98);
		}
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
		background: rgba($theme-accent, 0.9);
		color: #fff;
		font-size: 18rpx;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
		line-height: 1.4;
		font-weight: 500;
	}

	.grid-info {
	   padding: 16rpx 14rpx 16rpx;
	   background-color: var(--card);
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
</style>