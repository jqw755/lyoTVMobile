<template>
  <view class="vod-card" :class="[layout]" @tap="onTap">
    <!-- 网格布局 -->
    <template v-if="layout === 'grid'">
      <view class="poster-wrap">
        <image class="poster" :src="posterSrc" mode="aspectFill" lazy-load
          :style="{ aspectRatio: aspectRatio }" />
        <view class="play-overlay">
          <uni-icons type="play-filled" size="24" color="#fff" />
        </view>
        <view class="badge" v-if="showRemarks">
          <text>{{ displayRemarks }}</text>
        </view>
      </view>
      <view class="info">
        <text class="title" :lines="1">{{ item.vod_name }}</text>
        <view class="meta" v-if="item.vod_year || item.vod_area">
          <text class="year" v-if="item.vod_year">{{ item.vod_year }}</text>
          <text class="dot" v-if="item.vod_year && item.vod_area">·</text>
          <text class="area" v-if="item.vod_area">{{ item.vod_area }}</text>
        </view>
      </view>
    </template>
    <!-- 列表布局 -->
    <template v-else>
      <image class="list-poster" :src="posterSrc" mode="aspectFill" lazy-load
        :style="{ aspectRatio: aspectRatio }" />
      <view class="list-info">
        <text class="list-title" :lines="1">{{ item.vod_name }}</text>
        <view class="list-meta" v-if="item.vod_year || item.vod_area || item.type_name">
          <text class="list-type" v-if="item.type_name">{{ item.type_name }}</text>
          <text class="list-year" v-if="item.vod_year">{{ item.vod_year }}</text>
          <text class="list-area" v-if="item.vod_area">{{ item.vod_area }}</text>
        </view>
        <view class="list-remarks" v-if="displayRemarks">
          <text>{{ displayRemarks }}</text>
        </view>
      </view>
      <view class="list-arrow">
        <uni-icons type="arrowright" size="20" color="#888" />
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  /** 布局模式: 'grid' 网格 | 'list' 列表 */
  layout: { type: String, default: 'grid', validator: v => ['grid', 'list'].includes(v) },
  /** 海报宽高比，可传 '3/4'、'2/3'、'1/1'、'16/9' 等 */
  aspectRatio: { type: String, default: '3/4' },
})
const emit = defineEmits(['tap'])

const posterSrc = computed(() => {
  const url = props.item.vod_pic
  if (!url || url === '') {
    return ''
  }
  return url
})

const displayRemarks = computed(() => {
  const r = props.item.vod_remarks
  if (!r || r === '0' || r === '') return ''
  return r
})

const showRemarks = computed(() => displayRemarks.value !== '')

function onTap() {
  emit('tap', props.item)
}
</script>

<style lang="scss" scoped>
.vod-card {
  border-radius: 12rpx;
  overflow: hidden;
  background: $theme-card;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.96);
  }

  // ===== 网格布局 =====
  &.grid {
    width: 100%;

    .poster-wrap {
      position: relative;
      width: 100%;
    }

    .play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      background: rgba(0,0,0,0.3);
      transition: opacity 0.2s;
    }

    &:active .play-overlay {
      opacity: 1;
    }

    .poster {
      width: 100%;
      display: block;
      background: $theme-card-hover;
    }

    .badge {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      background: $theme-accent;
      color: #fff;
      font-size: 18rpx;
      padding: 2rpx 10rpx;
      border-radius: 6rpx;
      line-height: 1.4;
      font-weight: 500;
    }

    .info {
      padding: 10rpx 8rpx 12rpx;
    }

    .title {
      font-size: 24rpx;
      font-weight: 500;
      color: $theme-text;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 4rpx;
      margin-top: 4rpx;

      .year, .area {
        font-size: 18rpx;
        color: $theme-text-secondary;
      }

      .dot {
        font-size: 18rpx;
        color: $theme-text-secondary;
      }
    }
  }

  // ===== 列表布局 =====
  &.list {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 20rpx 24rpx;
    border-radius: 16rpx;
    margin-bottom: 12rpx;

    &:active {
      transform: scale(0.98);
    }

    .list-poster {
      width: 120rpx;
      border-radius: 8rpx;
      flex-shrink: 0;
      display: block;
      background: $theme-card-hover;
    }

    .list-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;
      min-width: 0;
    }

    .list-title {
      font-size: 28rpx;
      font-weight: 600;
      color: $theme-text;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .list-meta {
      display: flex;
      align-items: center;
      gap: 8rpx;
      flex-wrap: wrap;

      .list-type,
      .list-year,
      .list-area {
        font-size: 22rpx;
        color: $theme-text-secondary;
      }
    }

    .list-remarks {
      font-size: 24rpx;
      color: $theme-accent;

      text {
        display: inline;
      }
    }

    .list-arrow {
      flex-shrink: 0;
      padding: 8rpx;
    }
  }
}
</style>
