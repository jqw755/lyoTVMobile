<template>
  <view class="vod-card" @tap="onTap">
    <view class="poster-wrap">
      <image class="poster" :src="posterSrc" mode="aspectFill" lazy-load />
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
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
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
  background: var(--card);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.96);
  }

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
    height: 200rpx;
    display: block;
    background: var(--card-hover);
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
    color: var(--text-primary);
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
      color: var(--text-secondary);
    }

    .dot {
      font-size: 18rpx;
      color: var(--text-secondary);
    }
  }
}
</style>
