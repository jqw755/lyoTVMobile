<template>
  <view class="page">
    <!-- 用户头部 -->
    <view class="profile">
      <view class="avatar">
        <uni-icons type="person-filled" size="40" color="#888" />
      </view>
      <text class="name">影视爱好者</text>
      <text class="bio">观看精彩世界</text>
    </view>

    <!-- 订阅源设置 -->
  <view class="section subscribe">
    <view class="section-header">
      <uni-icons type="download" size="16" color="#888" />
      <text class="section-title"> 订阅源设置</text>
    </view>
    <view class="sub-input">
      <uni-icons type="link" size="16" color="#555" style="position:absolute;left:24rpx;top:50%;transform:translateY(-50%);z-index:1" />
      <input
        v-model="subUrl"
        placeholder="输入订阅地址（JSON URL）"
        placeholder-class="placeholder"
        style="padding-left:44rpx"
      />
      <text class="sub-btn" @tap="submitSub">
        <uni-icons type="checkmark" size="16" color="#fff" />
        <text style="margin-left:4rpx">确定</text>
      </text>
    </view>
    <text v-if="store.subUrl && !subUrl" class="sub-hint">
      当前订阅：{{ store.subUrl.substring(0, 40) }}...
    </text>
  </view>

  <!-- 功能入口 -->
    <view class="menu">
      <view class="menu-item" @tap="goPage('favorite')">
        <view class="icon-box fav">
          <uni-icons type="star-filled" size="22" color="#f39c12" />
        </view>
        <text class="label">我的收藏</text>
        <uni-icons type="arrowright" size="16" color="#555" />
      </view>
      <view class="menu-item" @tap="goPage('history')">
        <view class="icon-box clock">
          <uni-icons type="clock" size="22" color="#3498db" />
        </view>
        <text class="label">观看历史</text>
        <uni-icons type="arrowright" size="16" color="#555" />
      </view>
    </view>

    <!-- 图片设置 ─ 小字分类 -->
    <view class="img-setting">
      <view class="img-setting-header">
        <uni-icons type="image" size="14" color="#888" />
        <text class="img-setting-label"> 图片设置</text>
      </view>
      <view class="img-size-options">
        <text
          class="img-size-btn"
          :class="{ active: currentSize === 'large' }"
          @tap="setImgSize('large')"
        >
          <text class="img-size-btn-label">大</text>
          <text class="img-size-btn-cols">3列</text>
          <view class="img-size-preview">
            <view class="preview-dot" v-for="i in 3" :key="i" :class="{ active: currentSize === 'large' }" />
          </view>
        </text>
        <text
          class="img-size-btn"
          :class="{ active: currentSize === 'medium' }"
          @tap="setImgSize('medium')"
        >
          <text class="img-size-btn-label">中</text>
          <text class="img-size-btn-cols">4列</text>
          <view class="img-size-preview">
            <view class="preview-dot" v-for="i in 4" :key="i" :class="{ active: currentSize === 'medium' }" />
          </view>
        </text>
        <text
          class="img-size-btn"
          :class="{ active: currentSize === 'small' }"
          @tap="setImgSize('small')"
        >
          <text class="img-size-btn-label">小</text>
          <text class="img-size-btn-cols">5列</text>
          <view class="img-size-preview">
            <view class="preview-dot" v-for="i in 5" :key="i" :class="{ active: currentSize === 'small' }" />
          </view>
        </text>
      </view>
    </view>

    <!-- 主题切换 ─ 小字分类 -->
    <view class="img-setting">
      <view class="img-setting-header">
        <uni-icons type="circle" size="14" color="#888" />
        <text class="img-setting-label"> 显示主题</text>
      </view>
      <view class="theme-options">
        <text
          class="theme-btn"
          :class="{ active: theme === 'dark' }"
          @tap="setTheme('dark')"
        >
          <uni-icons type="moon" size="16" :color="theme === 'dark' ? '#e74c3c' : '#888'" />
          <text class="theme-btn-label">深色</text>
        </text>
        <text
          class="theme-btn"
          :class="{ active: theme === 'light' }"
          @tap="setTheme('light')"
        >
          <uni-icons type="sun-filled" size="16" :color="theme === 'light' ? '#e74c3c' : '#888'" />
          <text class="theme-btn-label">浅色</text>
        </text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="about">
      <text class="version">lyoTV v1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { store, setSubUrl, updateHome } from '@/utils/appState.js'
import { init as apiInit, home } from '@/utils/api.js'

const subUrl = ref('')
const currentSize = ref('medium')
const theme = ref('dark')

try {
  const saved = uni.getStorageSync('lyotv_image_size')
  if (saved) currentSize.value = saved
} catch {}

try {
  const saved = uni.getStorageSync('lyotv_theme')
  if (saved) theme.value = saved
} catch {}

function setTheme(val) {
  theme.value = val
  if (typeof uni.$lyotvTheme !== 'undefined') {
    uni.$lyotvTheme.set(val)
  } else {
    try { uni.setStorageSync('lyotv_theme', val) } catch {}
  }
  uni.showToast({ title: val === 'dark' ? '深色模式' : '浅色模式', icon: 'none' })
}

function setImgSize(size) {
  currentSize.value = size
  try { uni.setStorageSync('lyotv_image_size', size) } catch {}
  uni.showToast({ title: size === 'large' ? '大图模式' : size === 'medium' ? '中图模式' : '小图模式', icon: 'none' })
}

async function submitSub() {
  const url = subUrl.value.trim()
  if (!url) return
  try {
    uni.showLoading({ title: '加载订阅...' })
    await apiInit(url)
    const data = await home()
    setSubUrl(url)
    updateHome(data)
    uni.hideLoading()
    uni.showToast({ title: '订阅成功', icon: 'success' })
    subUrl.value = ''
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '订阅加载失败', icon: 'none' })
  }
}

function goPage(page) {
  switch (page) {
    case 'favorite':
      uni.switchTab({ url: '/pages/favorite/favorite' })
      break
    case 'history':
      uni.navigateTo({ url: '/pages/history/history' })
      break
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--page-bg);
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  gap: 12rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: $theme-card;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .name {
    font-size: 32rpx;
    font-weight: 600;
    color: $theme-text;
  }

  .bio {
    font-size: 24rpx;
    color: $theme-text-secondary;
  }
}

.menu {
  margin: 0 20rpx;
  background: $theme-card;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid $theme-border;

  &:last-child {
    border-bottom: none;
  }

  .icon-box {
    width: 50rpx;
    height: 50rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &.fav {
      background: rgba($theme-warning, 0.15);
    }
    &.clock {
      background: rgba(#3498db, 0.15);
    }
    &.set {
      background: rgba(#2ecc71, 0.15);
    }
  }

  .label {
    flex: 1;
    font-size: 28rpx;
    color: $theme-text;
  }
}

.about {
  text-align: center;
  padding: 60rpx 0;

  .version {
    font-size: 22rpx;
    color: #555;
  }
}

/* 图片设置 ─ 小字分类 */
.img-setting {
  margin: 12rpx 20rpx 0;

  &-header {
    display: flex;
    align-items: center;
    margin-bottom: 14rpx;
  }

  &-label {
    font-size: 22rpx;
    color: $theme-text-secondary;
  }
}

.img-size-options {
  display: flex;
  gap: 12rpx;
}

.img-size-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx 0;
  border-radius: 12rpx;
  background: $theme-card;
  transition: all 0.2s;

  &.active {
    background: rgba($theme-accent, 0.12);
    outline: 2rpx solid $theme-accent;
  }

  &:active {
    opacity: 0.7;
  }
}

.img-size-btn-label {
  font-size: 28rpx;
  font-weight: 600;
  color: $theme-text;

  .active & {
    color: $theme-accent;
  }
}

.img-size-btn-cols {
  font-size: 20rpx;
  color: $theme-text-secondary;
}

.img-size-preview {
  display: flex;
  gap: 4rpx;
  align-items: center;
}

.preview-dot {
  width: 10rpx;
  height: 14rpx;
  border-radius: 2rpx;
  background: #444;
  aspect-ratio: 3 / 4;

  &.active {
    background: $theme-accent;
  }
}

/* 主题切换 */
.theme-options {
  display: flex;
  gap: 12rpx;
}

.theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
  border-radius: 12rpx;
  background: var(--card);
  transition: all 0.2s;

  &.active {
    outline: 2rpx solid $theme-accent;
    background: rgba($theme-accent, 0.08);
  }

  &:active {
    opacity: 0.7;
  }
}

.theme-btn-label {
  font-size: 26rpx;
  color: var(--text);
  font-weight: 500;
}

/* 订阅源设置 */
.subscribe {
  margin: 24rpx 20rpx 0;
}

.sub-input {
  display: flex;
  gap: 12rpx;

  input {
    flex: 1;
    background: $theme-card;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 26rpx;
    color: $theme-text;
  }

  .placeholder {
    color: $theme-text-secondary;
    font-size: 26rpx;
  }

  .sub-btn {
    background: $theme-accent;
    color: #fff;
    border-radius: 12rpx;
    padding: 0 32rpx;
    font-size: 28rpx;
    line-height: 80rpx;
  }
}

.sub-hint {
  display: block;
  font-size: 22rpx;
  color: $theme-text-secondary;
  margin-top: 12rpx;
  word-break: break-all;
}
</style>
