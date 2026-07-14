<template>
	<view class="page" :style="themeStyle">
		<view class="header">
			<text class="title">注册</text>
			<text class="subtitle">注册后影视收藏将同步到云端</text>
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
			<view class="field">
				<text class="label">确认密码</text>
				<input v-model="confirmPassword" class="input" password placeholder="再次输入密码" placeholder-class="ph"
					maxlength="18" />
			</view>

			<view class="btn" @tap="onRegister" v-if="!loading">
				<text>注册</text>
			</view>
			<view class="btn loading-btn" v-else>
			  <view class="loading-icon"><uni-icons type="spinner-cycle" size="18" color="#fff" /></view>
			  <text>注册中...</text>
			 </view>
		</view>

		<view class="login-link" @tap="goLogin">
			<text>已有账号？去登录</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		themeStyle
	} from '@/utils/theme.js'
	import {
		register
	} from '@/utils/store.js'

	const username = ref('')
	const password = ref('')
	const confirmPassword = ref('')
	const loading = ref(false)

	async function onRegister() {
		const u = username.value.trim()
		const p = password.value
		const cp = confirmPassword.value

		if (!u || !p || !cp) {
			uni.showToast({
				title: '请填写完整表单',
				icon: 'none',
				duration: 3000
			})
			return
		}
		if (u.length < 3) {
			uni.showToast({
				title: '用户名至少3个字符',
				icon: 'none',
				duration: 3000
			})
			return
		}
		if (p.length < 6) {
			uni.showToast({
				title: '密码至少6个字符',
				icon: 'none',
				duration: 3000
			})
			return
		}
		if (p !== cp) {
			uni.showToast({
				title: '两次密码不一致',
				icon: 'none',
				duration: 3000
			})
			return
		}
		loading.value = true
		try {
			await register(u, p)
			uni.showToast({
				title: '注册成功，等待管理员审批',
				icon: 'success',
				duration: 3000
			})
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} catch (e) {
			uni.showToast({
				title: e.message || '注册失败',
				icon: 'none',
				duration: 3000
			})
		} finally {
			password.value = ''
			confirmPassword.value = ''
			loading.value = false
		}
	}

	function goLogin() {
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.page {
		height: 100vh;
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

	.loading-icon {
		display: inline-flex;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.login-link {
		text-align: center;
		margin-top: 50rpx;

		text {
			font-size: 24rpx;
			color: $theme-accent;
		}

		&:active {
			opacity: 0.6;
		}
	}
</style>