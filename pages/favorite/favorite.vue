<template>
	<view class="page">
	  <!-- 空状态 -->
	  <view class="empty" v-if="!loggedIn">
	   <uni-icons type="star" size="60" color="#555" />
	   <text class="empty-text">请先登录</text>
	   <text class="empty-sub">登录后收藏数据将同步到云端</text>
	   <view class="login-btn" @tap="goLogin">去登录</view>
	  </view>

	  <view class="empty" v-else-if="list.length === 0 && !loading">
	   <uni-icons type="star" size="60" color="#555" />
	   <text class="empty-text">暂无收藏</text>
	   <text class="empty-sub">去首页发现喜欢的影片吧</text>
	  </view>

	  <!-- 列表 -->
	  <view class="list" v-else-if="list.length > 0">
	   <view v-for="item in list" :key="item.vod_id" class="item" @tap="goDetail(item)">
	    <image class="thumb" :src="item.vod_pic" mode="aspectFill" />
	    <view class="info">
	     <text class="title" :lines="1">{{ item.vod_name }}</text>
	     <text class="remark" v-if="item.vod_remarks && item.vod_remarks !== '0'">{{ item.vod_remarks }}</text>
	    </view>
	    <view class="close" @tap.stop="onRemove(item.vod_id)">
	     <uni-icons type="closeempty" size="18" color="#555" />
	    </view>
	   </view>
	  </view>

	  <!-- loading -->
	  <view class="empty" v-else>
	   <uni-icons type="spinner-cycle" size="40" color="#555" />
	   <text class="empty-text">加载中...</text>
	  </view>
	 </view>
</template>

<script setup>
	import { ref } from 'vue'
	import { getFavorites, removeFavorite, addHistory, getCurrentUser } from '@/utils/store.js'

	const list = ref([])
	const loading = ref(false)
	const loggedIn = ref(false)

	async function load() {
	 loggedIn.value = !!getCurrentUser()
	 if (!loggedIn.value) {
	  list.value = []
	  return
	 }
	 loading.value = true
	 try {
	  list.value = await getFavorites()
	 } catch {
	  list.value = []
	 } finally {
	  loading.value = false
	 }
	}

	 // 用 onShow 而非 onMounted，确保每次切到 tab 都刷新
	 import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
	 onShow(() => load())

	 onPullDownRefresh(() => {
	  load().finally(() => uni.stopPullDownRefresh())
	 })

	 async function onRemove(vodId) {
	  try {
	   list.value = await removeFavorite(vodId)
	   uni.showToast({ title: '已移除', icon: 'none' })
	  } catch {
	   uni.showToast({ title: '移除失败', icon: 'none' })
	  }
	 }

	 function goLogin() {
	  uni.navigateTo({ url: '/pages/login/login' })
	 }

	function goDetail(item) {
		addHistory(item)
		uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}&key=${item.site_key || ''}` })
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: var(--bg-primary);
	}

	/* 列表 */
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
		box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.04);
		transition: transform 0.15s;

		&:active {
			transform: scale(0.98);
		}
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

	.remark {
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-normal);
		color: var(--accent);
	}

	.close {
		padding: 12rpx;
		flex-shrink: 0;
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

		 .login-btn {
		  margin-top: 24rpx;
		  padding: 16rpx 60rpx;
		  background: $theme-accent;
		  border-radius: 40rpx;
		  color: #fff;
		  font-size: 28rpx;
		  font-weight: 600;

		  &:active {
		   opacity: 0.8;
		  }
		 }
		}
</style>
