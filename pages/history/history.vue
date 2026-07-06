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
  uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}&key=${item.site_key || ''}` })
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
  background: var(--bg-primary);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  gap: 12rpx;

  &-text {
    font-size: var(--text-lg);
    letter-spacing: var(--tracking-wide);
    color: var(--text-secondary);
    margin-top: 16rpx;
  }

  &-sub {
    font-size: var(--text-sm);
    color: #555;
  }
}

.list {
  padding: 12rpx 16rpx;
}

.item {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 12rpx;
  background: var(--card);
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  align-items: center;
  box-shadow: 0 1rpx 6rpx rgba(0,0,0,0.04);
  transition: transform 0.15s;

  &:active {
    transform: scale(0.98);
  }

  .thumb {
    width: 120rpx;
    height: 160rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
    background: var(--card-hover);
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
  }

  .title {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--text-primary);
    line-height: var(--leading-tight);
  }

  .episode {
    font-size: var(--text-sm);
    letter-spacing: var(--tracking-normal);
    color: var(--accent);
  }

  .time {
    font-size: var(--text-xs);
    color: var(--text-secondary);
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
  font-size: var(--text-base);
  color: var(--text-secondary);
  padding: 16rpx 48rpx;
  border: 1rpx solid var(--border);
  border-radius: 40rpx;
}
</style>
