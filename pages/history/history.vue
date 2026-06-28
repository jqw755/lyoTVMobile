<template>
  <view class="page">
    <!-- 空状态 -->
    <view class="empty" v-if="list.length === 0">
      <uni-icons type="clock" size="60" color="#555" />
      <text class="empty-text">暂无观看记录</text>
      <text class="empty-sub">快去观看影片吧</text>
    </view>

    <!-- 列表 -->
    <view class="list" v-else>
      <view
        v-for="item in list"
        :key="item.vod_id + item.time"
        class="item"
        @tap="goDetail(item)"
      >
        <image class="thumb" :src="item.vod_pic" mode="aspectFill" />
        <view class="info">
          <text class="title" :lines="1">{{ item.vod_name }}</text>
          <text class="episode" v-if="item.episode">{{ item.episode }}</text>
          <text class="time">{{ formatTime(item.time) }}</text>
        </view>
        <view class="close" @tap.stop="remove(item.vod_id, item.time)">
          <uni-icons type="closeempty" size="18" color="#555" />
        </view>
      </view>
    </view>

    <!-- 清空按钮 -->
    <view class="footer" v-if="list.length > 0">
      <view class="clear-btn" @tap="onClear">
        <uni-icons type="trash" size="14" color="#888" />
        <text style="margin-left:6rpx">清空全部记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getHistory, clearHistory, addHistory } from '@/utils/store.js'

const list = ref([])

function load() {
  list.value = getHistory()
}

// 用 onShow 确保每次切到 tab 都刷新
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
onShow(() => load())

onPullDownRefresh(() => {
  load()
  uni.stopPullDownRefresh()
})

function remove(vodId, time) {
  list.value = list.value.filter(
    (item) => !(item.vod_id === vodId && item.time === time)
  )
  uni.setStorageSync('lyotv_history', list.value)
}

function onClear() {
  uni.showModal({
    title: '提示',
    content: '确定清空所有观看记录吗？',
    success: (res) => {
      if (res.confirm) {
        clearHistory()
        list.value = []
      }
    },
  })
}

function goDetail(item) {
  addHistory(item)
  uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}` })
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  if (diff < 172800000 && d.getDate() === now.getDate() - 1) {
    return `昨天 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--page-bg);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  gap: 12rpx;

  &-text {
    font-size: 28rpx;
    color: $theme-text-secondary;
    margin-top: 16rpx;
  }

  &-sub {
    font-size: 24rpx;
    color: #555;
  }
}

.list {
  padding: 0 20rpx;
}

.item {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $theme-border;
  align-items: center;

  .thumb {
    width: 140rpx;
    height: 190rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
    background: $theme-card-hover;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .title {
    font-size: 28rpx;
    font-weight: 600;
    color: $theme-text;
  }

  .episode {
    font-size: 24rpx;
    color: $theme-accent;
  }

  .time {
    font-size: 22rpx;
    color: #555;
  }

  .close {
    padding: 12rpx;
    flex-shrink: 0;
  }
}

.footer {
  padding: 40rpx 20rpx;
  display: flex;
  justify-content: center;
}

.clear-btn {
  font-size: 26rpx;
  color: $theme-text-secondary;
  padding: 16rpx 48rpx;
  border: 1rpx solid $theme-border;
  border-radius: 40rpx;
}
</style>
