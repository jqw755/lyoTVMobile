<template>
  <view class="vod-card" @tap="onTap">
    <view class="poster-wrap">
      <image class="poster" :src="item.vod_pic" mode="aspectFill" lazy-load />
      <view class="play-overlay">
        <uni-icons type="play-filled" size="20" color="#fff" />
      </view>
    </view>
    <view class="info">
      <text class="title" :lines="1">{{ item.vod_name }}</text>
      <view class="meta">
        <text class="tag" v-if="item.vod_remarks">{{ item.vod_remarks }}</text>
        <text class="year" v-if="item.vod_year">{{ item.vod_year }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['tap'])

function onTap() {
  emit('tap', props.item)
}
</script>

<style lang="scss" scoped>
.vod-card {
  width: 100%;
  border-radius: 8rpx;
  overflow: hidden;
  background: $theme-card;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.96);
  }
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

.vod-card:active .play-overlay {
  opacity: 1;
}

.poster {
  width: 100%;
  aspect-ratio: 3 / 4;
  display: block;
  background: $theme-card-hover;
}

.info {
  padding: 8rpx 6rpx 10rpx;
}

.title {
  font-size: 22rpx;
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
  gap: 6rpx;
  margin-top: 4rpx;

  .tag {
    font-size: 18rpx;
    color: $theme-accent;
    background: rgba($theme-accent, 0.15);
    padding: 1rpx 8rpx;
    border-radius: 4rpx;
    line-height: 1.4;
  }

  .year {
    font-size: 18rpx;
    color: $theme-text-secondary;
  }
}
</style>
