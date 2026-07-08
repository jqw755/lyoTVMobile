<template>
	<view class="page" :style="themeStyle">
		<view class="header">
			<text class="title">登录</text>
			<text class="subtitle">登录后收藏和历史将同步到云端</text>
		</view>

		<view class="form">
			<view class="field">
				<text class="label">用户名</text>
				<input v-model="username" class="input" placeholder="输入用户名" placeholder-class="ph" maxlength="10" />
			</view>
			<view class="field">
				<text class="label">密码</text>
				<input v-model="password" class="input" password placeholder="输入密码" placeholder-class="ph"
					maxlength="18" />
			</view>

			<view class="btn" @tap="onLogin" v-if="!loading">
				<text>登录</text>
			</view>
			<view class="btn loading-btn" v-else>
				<uni-icons type="spinner-cycle" size="18" color="#fff" />
				<text>登录中...</text>
			</view>
		</view>

		<view class="skip" @tap="goBack">
			<text>暂不登录，继续浏览</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import { themeStyle } from '@/utils/theme.js'
	import {
		login
	} from '@/utils/store.js'

	const username = ref('')
	const password = ref('')
	const loading = ref(false)

	async function onLogin() {
		const u = username.value.trim()
		const p = password.value.trim()
		if (!u || !p) {
			uni.showToast({
				title: '请填写完整',
				icon: 'none'
			})
			return
		}
		loading.value = true
		try {
			await login(u, p)
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})
			setTimeout(() => {
			  const pages = getCurrentPages()
			  if (pages.length <= 1) {
			   uni.switchTab({ url: '/pages/mine/mine' })
			  } else {
			   uni.navigateBack()
			  }
			 }, 500)
		} catch (e) {
			uni.showToast({
				title: e.message || '登录失败',
				icon: 'none'
			})
		} finally {
			// 无论成功失败，清除密码变量
			password.value = ''
			loading.value = false
		}
	}

	function goBack() {
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.page {
		background: var(--bg-primary);
		padding: 40rpx 32rpx;
		display: flex;
		flex-direction: column;
	}

	.header {
		margin-top: 60rpx;
		margin-bottom: 60rpx;

		.title {
			font-size: 44rpx;
			font-weight: 700;
			color: var(--text-primary);
		}

		.subtitle {
			font-size: 26rpx;
			color: var(--text-secondary);
			margin-top: 12rpx;
			display: block;
		}
	}

	.form {
		flex: 1;
	}

	.field {
		margin-bottom: 36rpx;

		.label {
			font-size: 26rpx;
			color: var(--text-secondary);
			display: block;
			margin-bottom: 12rpx;
		}

		.input {
			background: var(--card);
			border-radius: 12rpx;
			padding: 24rpx 28rpx;
			font-size: 28rpx;
			color: var(--text-primary);
			border: 1px solid var(--border);
		}

		.ph {
			color: #555;
			font-size: 26rpx;
		}
	}

	.btn {
		background: $theme-accent;
		border-radius: 12rpx;
		padding: 24rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		margin-top: 20rpx;

		text {
			color: #fff;
			font-size: 30rpx;
			font-weight: 600;
		}

		&:active {
			opacity: 0.8;
		}
	}

	.loading-btn {
		opacity: 0.7;
	}

	.switch {
		text-align: center;
		margin-top: 36rpx;
		padding: 16rpx 0;

		text {
			font-size: 26rpx;
			color: $theme-accent;
		}

		&:active {
			opacity: 0.6;
		}
	}

	.skip {
		text-align: center;
		padding: 50rpx 0 40rpx;

		text {
			font-size: 24rpx;
			color: var(--text-secondary);
		}

		&:active {
			opacity: 0.6;
		}
	}
</style>