<template>
  <view class="page">
    <!-- 空状态 -->
    <view class="empty" v-if="list.length === 0">
      <uni-icons type="star" size="60" color="#555" />
      <text class="empty-text">暂无收藏</text>
      <text class="empty-sub">去首页发现喜欢的影片吧</text>
    </view>

    <!-- 列表 -->
    <view class="grid" v-else>
      <view
        v-for="item in list"
        :key="item.vod_id"
        class="grid-item"
        @tap="goDetail(item)"
      >
        <view class="card-wrapper">
          <vod-card :item="item" />
          <view class="remove" @tap.stop="onRemove(item.vod_id)">
            <uni-icons type="closeempty" size="16" color="#fff" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getFavorites, removeFavorite, addHistory } from '@/utils/store.js'
import VodCard from '@/components/vod-card.vue'

const list = ref([])

function load() {
  list.value = getFavorites()
}

// 用 onShow 而非 onMounted，确保每次切到 tab 都刷新
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
onShow(() => load())

onPullDownRefresh(() => {
  load()
  uni.stopPullDownRefresh()
})

function onRemove(vodId) {
  removeFavorite(vodId)
  list.value = getFavorites()
  uni.showToast({ title: '已移除', icon: 'none' })
}

function goDetail(item) {
  addHistory(item)
  uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}` })
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

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  padding: 16rpx 20rpx;
}

.card-wrapper {
  position: relative;
}

.remove {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
