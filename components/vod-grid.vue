<template>
	<view class="grid-wrapper">
		<view class="grid" :style="{ gap: gap + 'rpx' }">
			<view v-for="item in items" :key="item.vod_id || item._key" class="grid-item"
				:style="{ width: itemWidth + 'rpx' }" @tap="onItemTap(item)">
				<view class="grid-card">
					<view class="grid-poster-wrap">
						<image class="grid-poster" :src="item.vod_pic" mode="aspectFill" lazy-load />
						<text v-if="item.vod_remarks && item.vod_remarks !== '0'" class="grid-badge">
							{{ item.vod_remarks }}
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
	// 从「我的」页面设置的尺寸级别 → 卡片基础宽度(rpx)
	// 3=大图(宽卡片), 4=中图(适中), 5=小图(窄卡片)
	const SIZE_WIDTH_MAP = {
		3: 210,
		4: 155,
		5: 120,
	}
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
				gap: 24, // rpx
				itemWidth: SIZE_WIDTH_MAP[3],
			}
		},
		mounted() {
			this.loadSize()
			uni.$on('gridColsChanged', (val) => {
				if (val != null) this.itemWidth = SIZE_WIDTH_MAP[val] || SIZE_WIDTH_MAP[3]
			})
		},
		beforeDestroy() {
			uni.$off('gridColsChanged')
		},
		methods: {
			loadSize() {
				const level = this.gridSize ?? getSetting('grid_cols', 4)
				this.itemWidth = SIZE_WIDTH_MAP[level] || SIZE_WIDTH_MAP[3]
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
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
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
		height: 200rpx;
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
		background-color: #212121;
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