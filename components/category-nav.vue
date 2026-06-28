<template>
  <view class="nav-wrapper">
    <scroll-view class="category-nav" scroll-x enhanced show-scrollbar="false">
      <view
        v-for="item in list"
        :key="item.type_id"
        class="tab"
        :class="{ active: item.type_id === activeId }"
        @tap="$emit('change', item)"
      >
        <uni-icons
          v-if="item.type_id === ''"
          type="home-filled"
          size="14"
          color="currentColor"
        />
        <text style="margin-left: 4rpx">{{ item.type_name }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
defineProps({
  list: { type: Array, default: () => [] },
  activeId: { type: [String, Number], default: '' },
})

defineEmits(['change'])
</script>

<style lang="scss" scoped>
.nav-wrapper {
  padding: 12rpx 0;
  background: var(--page-bg);
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
    font-size: 28rpx;
    color: var(--text-secondary);
    transition: all 0.2s;
    flex-shrink: 0;

    &.active {
      background: $theme-accent;
      color: #fff;
      font-weight: 600;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
