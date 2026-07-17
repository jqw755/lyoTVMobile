<template>
	<view class="page" :style="themeStyle" :class="{ 'fullscreen-active': isFullscreen }">
		<!-- 播放器区域 -->
		<view class="player-area">
		    <video id="live-player" :key="videoKey" :src="videoUrl" :autoplay="hasSource" :muted="muted"
		     :controls="isFullscreen" :page-gesture="true" :show-mute-btn="true" :enable-progress-gesture="false"
		     object-fit="contain" :title="currentChannelName" :enable-play-gesture="true" :vslide-gesture="true"
		     :vslide-gesture-in-fullscreen="true" :mobilenet-hint-type="1" :http-cache="false"
		     play-btn-position="center" :rate="playbackRate" :is-live="true" :header="videoHeaders"
		     :play-strategy="2" style="width: 100%; height: 100%" @error="onVideoError"
		     @fullscreenchange="onFullscreenChange" @tap="onPlayerTap" />

		    <!-- 加载/错误/待播放提示 -->
		    <view class="player-status" v-if="!hasSource && loading">
		     <uni-icons type="spinner-cycle" size="36" color="#888" />
		     <text class="status-text">{{ currentChannel ? '正在获取播放地址...' : '正在加载卫视配置...' }}</text>
		    </view>
		    <view class="player-status" v-else-if="pendingUrl && !hasSource">
		     <uni-icons type="play" size="40" color="#fe8027" />
		     <text class="status-text">点击播放</text>
		    </view>
		    <view class="player-status" v-else-if="errorMsg">
		            <uni-icons type="closeempty" size="36" color="#fe8027" />
		            <text class="status-text error">{{ errorMsg }}</text>
		           </view>

		           <!-- 非全屏时播放器底部控制条（声音开关 + 全屏） -->
		           <cover-view class="player-controls-bar" v-if="hasSource && !isFullscreen">
		            <cover-view class="ctrl-btn left" @tap.stop="toggleMute">
		             <cover-view class="ctrl-icon">{{ muted ? '🔇' : '🔊' }}</cover-view>
		            </cover-view>
		            <cover-view class="ctrl-btn right" @tap.stop="enterFullscreen">
		             <cover-view class="ctrl-icon">⛶</cover-view>
		            </cover-view>
		           </cover-view>
		          </view>

		<!-- 内容区域 -->
		<view class="content-area" v-if="!isFullscreen">
			<!-- 分组标签栏 -->
			<view class="group-tabs" v-if="groups.length > 0">
				<scroll-view scroll-x show-scrollbar="false" class="group-scroll">
					<text v-for="g in groups" :key="g.name" class="group-tab"
						:class="{ active: currentGroup === g.name }" @tap="switchGroup(g.name)">
						{{ g.name }}
						<text class="group-count" v-if="g.channelCount">({{ g.channelCount }})</text>
					</text>
				</scroll-view>
			</view>

			<!-- 分组为空提示 -->
			<view class="empty-hint" v-if="groups.length === 0 && !loading">
				<text class="empty-text" v-if="!store.subUrl">请先在"我的"页面设置订阅源</text>
				<text class="empty-text" v-else>{{ errorMsg || '未解析到卫视分组，请检查订阅源是否包含 lives 字段' }}</text>
			</view>

			<!-- 分组切换加载中（切分组时 channels 暂空，loading=true 期间显示提示） -->
			<view class="empty-hint" v-if="groups.length > 0 && channels.length === 0 && loading">
				<uni-icons type="spinner-cycle" size="28" color="#888" />
				<text class="empty-text">正在加载频道列表...</text>
			</view>

			<!-- 频道列表 -->
			<scroll-view class="channel-list" scroll-y @scrolltolower="onLoadMore" v-if="channels.length > 0">
				<view class="channel-item" v-for="(ch, i) in channels" :key="ch.name + i"
					:class="{ playing: isPlaying(ch) }">
					<!-- 频道行（点击切频道） -->
					<view class="channel-row" @tap="switchChannel(ch)">
						<view class="channel-left">
							<image class="channel-logo" v-if="ch.logo" :src="ch.logo" mode="aspectFit" />
							<view v-else class="channel-logo"></view>
							<text class="channel-name">{{ ch.displayName || ch.name }}</text>
						</view>
						<view class="channel-right">
							<!-- 多源时右侧下拉箭头：点击展/收换源列表，stop 避免触频道切换 -->
							<view class="channel-line-toggle" v-if="ch.urls && ch.urls.length > 1"
								@tap.stop="toggleSourceList(ch)">
								<text class="channel-line-badge">源{{ (ch.currentLine || 0) + 1 }}/{{ ch.urls.length }}</text>
								<uni-icons :type="openSourceKey === (ch.name + i) ? 'up' : 'down'" size="14" color="#fe8027" />
							</view>
						</view>
					</view>
					<!-- 换源列表（展开时显示在频道名下方，浅色样式） -->
					<view class="source-list" v-if="openSourceKey === (ch.name + i)">
						<text v-for="(url, li) in ch.urls" :key="li" class="source-item"
							:class="{ active: li === (ch.currentLine || 0) }"
							@tap.stop="pickSourceLine(ch, li)">线路 {{ li + 1 }}</text>
					</view>
				</view>
				<uni-load-more :status="loadMoreStatus" />
			</scroll-view>

			<!-- 频道列表为空 -->
			<view class="empty-hint" v-else-if="groups.length > 0 && !loading">
				<text class="empty-text">该分组暂无频道</text>
			</view>
		</view>

		<!-- 全屏时的快捷操作覆盖层（视频上叠加） -->
		<cover-view class="fullscreen-overlay" v-if="isFullscreen && hasSource" @tap="onToggleUI">
			<cover-view class="fs-top" v-if="showFSControls">
				<cover-view class="fs-back" @tap.stop="exitFullscreen">
					<uni-icons type="arrowleft" size="20" color="#fff" />
				</cover-view>
				<cover-view class="fs-title">{{ currentChannelName }}</cover-view>
			</cover-view>
			<cover-view class="fs-bottom" v-if="showFSControls">
				<cover-view class="fs-btn" @tap.stop="prevChannel">
					<uni-icons type="arrowleft" size="20" color="#fff" />
					<cover-view class="fs-btn-label">上一个</cover-view>
				</cover-view>
				<cover-view class="fs-btn" @tap.stop="switchLine(null)">
					<cover-view class="fs-btn-label">换源</cover-view>
					<cover-view class="fs-btn-line">源{{ currentLine + 1 }}</cover-view>
				</cover-view>
				<cover-view class="fs-btn" @tap.stop="nextChannel">
					<cover-view class="fs-btn-label">下一个</cover-view>
					<uni-icons type="arrowright" size="20" color="#fff" />
				</cover-view>
			</cover-view>
		</cover-view>

		 </view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onBeforeUnmount,
		nextTick
	} from 'vue'
	import {
		themeStyle
	} from '@/utils/theme.js'
	import {
		usePageListeners
	} from '@/utils/usePageListeners.js'
	import {
		onShow,
		onHide
	} from '@dcloudio/uni-app'
	import {
		store
	} from '@/utils/appState.js'
	import {
		liveGetGroups,
		liveGetChannels,
		liveGetUrl,
		ensureLiveInit
	} from '@/utils/api.js'
	import {
		getSetting
	} from '@/utils/store.js'
	
	
	
	import {
		useVideoPlayer
	} from '@/utils/useVideoPlayer.js'

	// ===== 播放器共享状态（useVideoPlayer） =====
	const {
	   videoKey,
	   muted,
	   playbackRate,
	   isFullscreen,
	   createVideoContext,
	   getVideoContext,
	   setControlsTimer,
	   clearControlsTimer,
	   exitFullscreen,
	   toggleMute,
	  } = useVideoPlayer('live-player')

	// ===== 页面独有状态 =====
	const groups = ref([])
	const channels = ref([])
	const currentGroup = ref('')
	const currentChannel = ref(null)
	const videoUrl = ref('')
	const videoHeaders = ref({})
	const hasSource = ref(false)
	const pendingUrl = ref('')
	const pendingHeaders = ref({})
	// 切页即显示 loading（秒切体感）：initLive 会重置为 true，finally 切 false
	// uni-app onMounted 异步触发，若 loading 初值 false 切页后有白屏间隙
	const loading = ref(true)
	const errorMsg = ref('')
	const showFSControls = ref(false)
	const currentLine = ref(0)
	const lineCount = ref(1)
	// 手动换源下拉：openSourceKey 记录当前展开换源列表的频道 key（ch.name+i），null 表示全收
	const openSourceKey = ref(null)
	const loadMoreStatus = ref('more')
	let channelList = {} // 按分组缓存频道列表
	let isInitialized = false // 防止重复初始化
	let initLivePromise = null // 防止并发 initLive
	let switchingChannel = false // 防止并发 switchChannel

	const currentChannelName = computed(() => {
		return currentChannel.value?.displayName || currentChannel.value?.name || ''
	})

	function isPlaying(ch) {
		return currentChannel.value && ch.name === currentChannel.value.name
	}

	// ===== 生命周期 =====
	onMounted(() => {
		
		muted.value = getSetting('video_muted', true)
		uni.$on('subUpdated', onSubUpdated)
		// 公共监听器：mutedChanged 同步
		usePageListeners({ mutedRef: muted })
		initLive()
	})

	onShow(() => {
		// 切回时如果已有播放源，恢复播放（onHide 时暂停了）
		if (hasSource.value) {
			nextTick(() => {
				const ctx = createVideoContext()
				if (ctx) ctx.play()
			})
		}
		// 如果还没初始化或订阅已变更，重新加载
		if (!isInitialized) {
			initLive()
		}
	})

	onHide(() => {
		clearControlsTimer()
		// 切走时暂停视频，节省流量和电量
		const ctx = getVideoContext()
		if (ctx) ctx.pause()
	})

	onBeforeUnmount(() => {
		uni.$off('subUpdated', onSubUpdated)
		clearControlsTimer()
	})

	/** 订阅源变更时重新加载 */
	function onSubUpdated() {
		isInitialized = false
		channelList = {}
		pendingUrl.value = ''
		currentChannel.value = null
		hasSource.value = false
		videoUrl.value = ''
		initLive()
	}

	// ===== 初始化 =====
	  async function initLive() {
	   // 防止并发调用
	   if (initLivePromise) return initLivePromise
	   const liveUrl = store.liveSubUrl || store.subUrl
	   
	   if (!liveUrl) {
	    
	    loading.value = false
	    return Promise.resolve()
	   }
	   loading.value = true
	   errorMsg.value = ''
	   initLivePromise = (async () => {
	         try {
	          // 确保直播插件已初始化（缓存 Promise，重复调用不阻塞）
	          await ensureLiveInit(liveUrl)

	          const gList = await liveGetGroups()

	          groups.value = gList || []
	          if (groups.value.length > 0) {
	           await switchGroup(groups.value[0].name)
	          }
	          isInitialized = true
	         } catch (e) {
	          errorMsg.value = '加载卫视数据失败: ' + (e.message || '')
	    } finally {
	     loading.value = false
	     initLivePromise = null
	    }
	   })()
	   return initLivePromise
	  }

	// ===== 分组切换 =====
	  async function switchGroup(name) {
	   if (!name) return
	   

	   // 相同分组且有缓存时跳过
	   if (name === currentGroup.value && channels.value.length > 0) {
	    
	    return
	   }
	   // 切分组时清除旧频道状态，避免旧频道干扰新分组点击
	   currentChannel.value = null
	   hasSource.value = false
	   videoUrl.value = ''
	   pendingUrl.value = ''
	   errorMsg.value = ''
	   currentGroup.value = name
	   loading.value = true
	   // 先检查缓存
	   if (channelList[name]) {
	    channels.value = channelList[name]
	    loading.value = false
	    
	    // 自动选中第一个频道
	    if (channels.value.length > 0) {
	     switchChannel(channels.value[0])
	    }
	    return
	   }
	   try {
	         const chList = await liveGetChannels(name)

	        channelList[name] = (chList || []).map((ch) => {
	          return {
	      ...ch,
	      _group: name
	     }
	    })
	    channels.value = channelList[name]
	    // 自动选中第一个频道
	    if (channels.value.length > 0) {
	     switchChannel(channels.value[0])
	    }
	   } catch (e) {
	    
	    errorMsg.value = '加载频道列表失败'
	   } finally {
	    loading.value = false
	   }
	  }

	// ===== 应用播放地址：重建 video 组件（key 变更）后创建 context 并手动 play =====
	// App-Plus 下 <video> 的 autoplay 对动态 src 不可靠，必须手动 play；
	// videoKey++ 会重建组件，旧 videoContext 失效，需在 nextTick 后重新创建
	// 同步 header：uni-app <video> 的 header 属性（App 3.1.19+）直接注入 Referer/UA，比 LiveProxy 代理透传更可靠
	function applyVideoUrl(url) {
		videoKey.value++
		videoUrl.value = url
		videoHeaders.value = pendingHeaders.value || {}
		hasSource.value = true
		
		nextTick(() => {
			const ctx = createVideoContext()
			
			if (ctx) ctx.play()
		})
	}

	// ===== 频道切换 =====
	  async function switchChannel(ch) {
	   if (!ch || !ch.name) return
	   // 防止并发调用
	   if (switchingChannel) {
	    
	    return
	   }
	   
	   

	   // 同频道且已有播放源时跳过
	   if (ch.name === currentChannel.value?.name && (hasSource.value || pendingUrl.value)) {
	    
	    return
	   }
	   currentChannel.value = ch
	   currentLine.value = Number(ch.currentLine) || 0
	   lineCount.value = (ch.urls && ch.urls.length) || 1

	   hasSource.value = false
	   videoUrl.value = ''
	   pendingUrl.value = ''
	   pendingHeaders.value = {}
	   loading.value = true
	   errorMsg.value = ''
	   switchingChannel = true
	   try {
	         const result = await liveGetUrl(ch.displayName, ch._group || currentGroup.value || '', currentLine.value)

	         if (result && result.url) {
	     // 对齐 fongmi 原版：切频道即播，不要求用户再点播放器
	     // uni-app <video> header 属性要 Object 形式；补默认 UA 兜底（咪咕等服务器校验 UA）
	     const h = Object.assign({}, result.header || {})
	     if (!h['User-Agent'] && !h['user-agent']) h['User-Agent'] = 'okhttp/4.12.0'
	     pendingHeaders.value = h
	     applyVideoUrl(result.url)
	     
	    } else {
	     errorMsg.value = '未获取到播放地址'
	    }
	   } catch (e) {
	    
	    errorMsg.value = e.message || '获取播放地址失败'
	   } finally {
	    loading.value = false
	    switchingChannel = false
	   }
	  }

	// ===== 换源（线路切换） =====
	// 下拉展/收换源列表：同一频道再点收起，切别的频道自动收旧的
	function toggleSourceList(ch) {
		const key = ch.name + (channels.value.indexOf(ch))
		openSourceKey.value = openSourceKey.value === key ? null : key
	}
	// 手动选线路：从下拉列表点某线路，切到该线路并播放，成功后收起下拉
	  async function pickSourceLine(ch, line) {
	   if (!ch || !ch.urls || line >= ch.urls.length) return
	   if (ch.currentLine === line && ch === currentChannel.value && hasSource.value) return
	   ch.currentLine = line
	   if (ch === currentChannel.value) {
	    currentLine.value = line
	    await switchLine(ch, 0) // delta=0 直接切到 ch.currentLine=line
	    // 切换成功后才收起
	    if (hasSource.value) {
	     openSourceKey.value = null
	    }
	   } else {
	    // 不是当前播放频道时，仅切频道
	    switchChannel(ch)
	    openSourceKey.value = null
	   }
	  }

	async function switchLine(ch, delta = 1) {
		const target = ch || currentChannel.value
		if (!target || !target.urls || target.urls.length <= 1) return
		const line = ((target.currentLine || 0) + delta + target.urls.length) % target.urls.length
		target.currentLine = line
		currentLine.value = line
		if (target === currentChannel.value) {
			hasSource.value = false
			videoUrl.value = ''
			pendingUrl.value = ''
			loading.value = true
			errorMsg.value = ''
			try {
				const result = await liveGetUrl(target.displayName, target._group || currentGroup.value || '',
					'', line)
				if (result && result.url) {
					const h = Object.assign({}, result.header || {})
					if (!h['User-Agent'] && !h['user-agent']) h['User-Agent'] = 'okhttp/4.12.0'
					pendingHeaders.value = h
					applyVideoUrl(result.url)
					
				} else {
					errorMsg.value = '未获取到播放地址'
				}
			} catch (e) {
				errorMsg.value = e.message || '换源失败'
			} finally {
				loading.value = false
			}
		}
	}

	// 自动尝试切下一线路（存储为待播放，不自动播放）
	async function tryAutoSwitchLine() {
		if (currentChannel.value && lineCount.value > 1) {
			const nextLine = (currentLine.value + 1) % lineCount.value
			if (nextLine !== currentLine.value) {
				currentChannel.value.currentLine = nextLine
				currentLine.value = nextLine
				hasSource.value = false
				videoUrl.value = ''
				pendingUrl.value = ''
				errorMsg.value = '正在尝试下一线路...'
				try {
					const result = await liveGetUrl(currentChannel.value.displayName,
						currentChannel.value._group || currentGroup.value || '', nextLine)
					if (result && result.url) {
						const h = Object.assign({}, result.header || {})
						if (!h['User-Agent'] && !h['user-agent']) h['User-Agent'] = 'okhttp/4.12.0'
						pendingHeaders.value = h
						applyVideoUrl(result.url)
						errorMsg.value = `源${nextLine + 1} 已就绪，自动播放`
						
					} else {
						errorMsg.value = '未获取到播放地址'
					}
				} catch {
					errorMsg.value = '所有线路均不可用'
				}
			}
		}
	}

	// ===== 上下频道 =====
	function prevChannel() {
		if (channels.value.length === 0) return
		const idx = channels.value.findIndex(ch => ch.name === currentChannel.value?.name)
		if (idx > 0) switchChannel(channels.value[idx - 1])
	}

	function nextChannel() {
		if (channels.value.length === 0) return
		const idx = channels.value.findIndex(ch => ch.name === currentChannel.value?.name)
		if (idx < channels.value.length - 1) switchChannel(channels.value[idx + 1])
	}

	// ===== 全屏控制 =====
	function onPlayerTap() {
		
		// 有待播放的直播流 → 触发放映
		if (pendingUrl.value) {
			applyVideoUrl(pendingUrl.value)
			pendingUrl.value = ''
			return
		}
		if (!hasSource.value) return
		if (!isFullscreen.value) {
			enterFullscreen()
		} else {
			toggleFSControls()
		}
	}

	function enterFullscreen() {
		nextTick(() => {
			const ctx = getVideoContext() || createVideoContext()
			ctx.requestFullScreen({
				direction: 0 // 自动横屏
			})
		})
	}

	function onFullscreenChange(e) {
		isFullscreen.value = e.detail.fullscreen
		if (e.detail.fullscreen) {
			showFSControls.value = true
			setControlsTimer(() => {
				showFSControls.value = false
			}, 4000)
		} else {
			showFSControls.value = false
			clearControlsTimer()
		}
	}

	function toggleFSControls() {
		showFSControls.value = !showFSControls.value
		if (showFSControls.value) setControlsTimer(() => {
			showFSControls.value = false
		}, 4000)
	}

	function onToggleUI() {
		toggleFSControls()
	}

	function onPlay() {  }

	function onPause() {  }

	// ===== 错误处理 =====
	function onVideoError(e) {
		// uni-app <video> @error 事件：App-Plus 下 e.detail.errMsg 为字符串描述，
		// 部分平台 e 本身是数字错误码；兜底用 channelName 提供上下文
		const detail = e?.detail || e || {}
		// 尝试多种格式提取错误描述
		let errMsg = ''
		if (typeof detail === 'string') {
			errMsg = detail
		} else if (typeof detail.errMsg === 'string') {
			errMsg = detail.errMsg
		} else if (typeof detail.errmsg === 'string') {
			errMsg = detail.errmsg
		} else if (typeof detail.message === 'string') {
			errMsg = detail.message
		} else if (typeof detail.code === 'number') {
			errMsg = '错误码 ' + detail.code
		} else if (typeof e === 'number') {
			errMsg = '错误码 ' + e
		} else if (typeof e?.message === 'string') {
			errMsg = e.message
		}
		// 如果仍未取到，用频道名提供上下文
		if (!errMsg) {
			errMsg = currentChannelName.value || '视频'
		}

		// 仅在真有频道且 url 非空时报错，不自动换源（用户用手动下拉选源）
		if (currentChannel.value && videoUrl.value) {
			uni.showToast({
				title: '播放失败：' + errMsg.slice(0, 50) + '，请手动换源',
				icon: 'none',
				duration: 3000
			})
		}
	}

	function onLoadMore() {
		loadMoreStatus.value = 'noMore'
	}

	// ===== 调试暴露 =====
	if (typeof uni !== 'undefined') {
		// 暴露给全局调试
	}
</script>

<style lang="scss" scoped>
	.page {
		background: var(--bg-primary);
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		&.fullscreen-active {
			background: #000;
		}
	}

	/* ===== 播放器区域 ===== */
	.player-area {
		position: relative;
		width: 100%;
		height: 460rpx;
		background: #000;
		overflow: hidden;
		flex-shrink: 0;
	}

	.player-status {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		z-index: 5;
		pointer-events: none;
	}

	.status-text {
		font-size: 26rpx;
		color: #999;

		&.error {
			color: #fe8027;
		}
	}

	/* ===== 内容区域 ===== */
	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--bg-primary);
	}

	/* ===== 分组标签栏 ===== */
	.group-tabs {
		flex-shrink: 0;
		background: var(--card);
		padding: 16rpx 0;
		border-bottom: 1rpx solid var(--border);
	}

	.group-scroll {
		display: flex;
		flex-direction: row;
		white-space: nowrap;
		padding: 0 16rpx;
	}

	.group-tab {
		display: inline-flex;
		align-items: center;
		padding: 10rpx 24rpx;
		margin-right: 12rpx;
		border-radius: 30rpx;
		background: var(--card-hover);
		font-size: 24rpx;
		color: var(--text-secondary);
		transition: all 0.15s;

		&.active {
			background: var(--accent);
			color: #fff;
			font-weight: 600;
		}

		&:active {
			opacity: 0.7;
		}
	}

	.group-count {
		font-size: 20rpx;
		margin-left: 6rpx;
		opacity: 0.7;
	}

	/* ===== 频道列表 ===== */
	.channel-list {
		flex: 1;
		overflow-y: auto;
		padding: 8rpx 12rpx;
	}

	.channel-item {
	   display: flex;
	   flex-direction: column;
	   padding: 18rpx 16rpx;
	   margin-bottom: 4rpx;
	   border-radius: 12rpx;
	   background: var(--card);
	   transition: all 0.15s;
	   border-left: 6rpx solid transparent;

		&:active {
			opacity: 0.8;
		}

		&.playing {
			background: rgba(231, 76, 60, 0.08);
			border-left: 6rpx solid var(--accent);
		}
	}

	.channel-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex: 1;
		min-width: 0;
	}

	.channel-logo {
		width: 48rpx;
		height: 48rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		background: #333;
	}

	.channel-num {
		font-size: 24rpx;
		color: var(--text-secondary);
		font-weight: 500;
		min-width: 48rpx;
		flex-shrink: 0;
	}

	.channel-name {
		font-size: 28rpx;
		color: var(--text-primary);
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.channel-right {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.channel-line-badge {
		font-size: 20rpx;
		color: var(--accent);
		background: rgba(254, 128, 39, 0.1);		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}
	.channel-line-toggle {
		display: flex;
		align-items: center;
		gap: 4rpx;
	}

	/* ===== 换源下拉列表（浅色，展在频道名下方） ===== */
	.channel-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.source-list {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		padding: 16rpx 24rpx 20rpx;
		background: rgba(255, 255, 255, 0.04);
		border-top: 1rpx solid rgba(255, 255, 255, 0.06);
	}
	.source-item {
		font-size: 22rpx;
		color: var(--text-secondary);
		padding: 8rpx 24rpx;
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.06);
		&.active {
			color: #fff;
			background: var(--accent);
		}
	}

	/* ===== 空状态 ===== */
	.empty-hint {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx 40rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: var(--text-secondary);
		text-align: center;
		line-height: 1.6;
	}

	/* ===== 全屏覆盖层 ===== */
	.fullscreen-overlay {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 999;
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.fs-top {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
	}

	.fs-back {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fs-title {
		font-size: 28rpx;
		color: #fff;
		font-weight: 600;
		margin-left: 16rpx;
	}

	.fs-bottom {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 60rpx;
		padding: 30rpx 40rpx;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
	}

	.fs-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 24rpx;
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.1);
		min-width: 120rpx;
	}

	.fs-btn-label {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.fs-btn-line {
		font-size: 20rpx;
		color: #fe8027;
	}

	/* ===== 非全屏底部控制条 ===== */
	.player-controls-bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 80rpx;
		z-index: 15;
		text-align: center;
		background: rgba(0, 0, 0, 0.5);
	}

	.ctrl-btn {
		display: inline-block;
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
	}

	.ctrl-btn.left {
		float: left;
		margin-left: 20rpx;
	}

	.ctrl-btn.right {
		float: right;
		margin-right: 20rpx;
	}

	.ctrl-icon {
		font-size: 36rpx;
		color: #fff;
	}

	.ctrl-icon-img {
		width: 40rpx;
		height: 40rpx;
		display: block;
		margin: 20rpx auto 0;
	}
</style>