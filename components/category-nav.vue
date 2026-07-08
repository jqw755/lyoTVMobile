<template>
	<view class="nav-wrapper">
		<scroll-view class="category-nav" scroll-x enhanced show-scrollbar="false">
			<view v-for="item in list" :key="item.type_id" class="tab" :class="{ active: item.type_id === activeId }"
				@tap="$emit('change', item)">
				<text style="margin-left: 4rpx">{{ item.type_name }}</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	defineProps({
		list: {
			type: Array,
			default: () => []
		},
		activeId: {
			type: [String, Number],
			default: ''
		},
	})

	defineEmits(['change'])
</script>

<style lang="scss" scoped>
	.nav-wrapper {
	 padding: 12rpx 0;
	 position: sticky;
	 top: 0;
	 z-index: 10;
	}

	.category-nav {
		display: flex;
		flex-direction: row;
		white-space: nowrap;
		overflow: hidden;
		padding: 0 24rpx;

		.tab {
		 display: inline-flex;
		 align-items: center;
		 justify-content: center;
		 padding: 16rpx 36rpx;
		 margin-right: 20rpx;
		 border-radius: 44rpx;
		 background: var(--card);
		 font-size: var(--text-base);
		 font-weight: var(--weight-medium);
		 color: var(--text-secondary);
		 transition: all 0.2s;
		 flex-shrink: 0;

		 &.active {
		  background: $theme-accent;
		  color: #fff;
		  font-weight: var(--weight-semibold);
		 }

			&:active {
				opacity: 0.8;
			}
		}
	}
</style>