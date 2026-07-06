<template>
	<view class="page">
		<view class="header">
			<text class="title">注册</text>
			<text class="subtitle">创建账号，数据跨设备同步</text>
		</view>

		<view class="form">
			<view class="field">
				<text class="label">昵称</text>
				<input v-model="nickname" class="input" placeholder="给自己起个名字" placeholder-class="ph" />
			</view>
			<view class="field">
				<text class="label">用户名（作为登录账号）</text>
				<input v-model="username" class="input" placeholder="输入用户名" placeholder-class="ph" type="text" />
			</view>
			<view class="field">
				<text class="label">密码</text>
				<input v-model="password" class="input" password placeholder="至少 6 位" placeholder-class="ph" />
			</view>
			<view class="field">
				<text class="label">确认密码</text>
				<input v-model="confirmPassword" class="input" password placeholder="再次输入密码" placeholder-class="ph" />
			</view>

			<view class="btn" @tap="onRegister" v-if="!loading">
				<text>注册</text>
			</view>
			<view class="btn loading-btn" v-else>
				<uni-icons type="spinner-cycle" size="18" color="#fff" />
				<text>注册中...</text>
			</view>

			<view class="switch" @tap="goLogin">
				<text>已有账号？去登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { register } from '@/utils/store.js'

	const nickname = ref('')
	const username = ref('')
	const password = ref('')
	const confirmPassword = ref('')
	const loading = ref(false)

	async function onRegister() {
		const nick = nickname.value.trim()
		const u = username.value.trim()
		const p = password.value
		const cp = confirmPassword.value

		if (!nick || !u || !p) {
			uni.showToast({ title: '请填写完整', icon: 'none' })
			return
		}
		if (p.length < 6) {
			uni.showToast({ title: '密码至少 6 位', icon: 'none' })
			return
		}
		if (p !== cp) {
			uni.showToast({ title: '两次密码不一致', icon: 'none' })
			return
		}

		loading.value = true
		try {
		 await register(nick, u, p)
		 uni.showToast({ title: '注册成功', icon: 'success' })
		 setTimeout(() => uni.switchTab({ url: '/pages/mine/mine' }), 500)
		} catch (e) {
		 uni.showToast({ title: e.message || '注册失败', icon: 'none' })
		} finally {
		 // 无论成功失败，清除密码变量
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
		min-height: 100vh;
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
</style>
