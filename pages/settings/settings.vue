<template>
  <view class="page">
    <!-- 设置总说明 ─ 圆形灰色问号 -->
    <view class="section info-section">
      <view class="section-header">
        <view class="circle-help" @tap="showSettingsInfo">
          <uni-icons type="help" size="22" color="#999" />
        </view>
        <text class="info-hint">点击查看设置说明</text>
      </view>
    </view>

    <!-- 播放设置 -->
    <view class="section">
      <view class="section-header">
        <uni-icons type="sound" size="16" color="#888" />
        <text class="section-title"> 播放设置</text>
      </view>
      <view class="setting-item">
        <view class="setting-label">
          <text>视频默认静音播放</text>
          <view class="circle-help small" @tap.stop="showMuteHelp">
            <uni-icons type="help" size="14" color="#999" />
          </view>
        </view>
        <switch :checked="muted" @change="onMutedChange" color="#e74c3c" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getSetting, setSetting } from '@/utils/store.js'

const SETTING_KEY = 'video_muted'

const muted = ref(true)

onMounted(() => {
  muted.value = getSetting(SETTING_KEY, true)
})

function onMutedChange(e) {
  const val = e.detail.value
  muted.value = val
  setSetting(SETTING_KEY, val)
  // 通知其他已打开的页面
  uni.$emit('mutedChanged', val)
}

function showSettingsInfo() {
  uni.showModal({
    title: '设置',
    content: '所有设置保存在您的设备本地，不上传任何云端，删除软件缓存或卸载会恢复以下所有设置项。',
    showCancel: false,
  })
}

function showMuteHelp() {
  uni.showModal({
    title: '静音播放提示',
    content: '为了增强用户体验，所有视频默认静音播放。手动关闭后，后续视频播放会自动播放声音，请控制合理的媒体音量。',
    showCancel: false,
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 20rpx;
}

.section {
  margin: 0 20rpx 20rpx;
  background: var(--card);
  border-radius: 16rpx;
  padding: 24rpx 20rpx;

  &-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  &-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $theme-text;
  }
}

/* 圆形灰色背景问号 */
.circle-help {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $theme-border;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active {
    opacity: 0.6;
  }

  &.small {
    width: 34rpx;
    height: 34rpx;
  }
}

.info-section {
  .section-header {
    justify-content: center;
    gap: 12rpx;
  }
}

.info-hint {
  font-size: 24rpx;
  color: $theme-text-secondary;
}

/* 设置项列表 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 26rpx;
    color: $theme-text;
  }
}
</style>
