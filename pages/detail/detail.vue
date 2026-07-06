<template>
	<view class="status-page" v-if="loading">
		<uni-icons type="spinner-cycle" size="36" color="#888" />
		<text class="status-text">加载中...</text>
	</view>
	<view class="status-page" v-else-if="error">
	 <uni-icons type="closeempty" size="48" color="#888" />
	 <text class="status-text">加载失败</text>
	 <text class="status-detail" v-if="errorMsg">{{ errorMsg }}</text>
	 <text class="retry-btn" @tap="loadDetail">点击重试</text>
	</view>
	<view class="page" v-else-if="vod">
		<!-- 播放器 -->
		<view class="player-area" @tap="onPlayerTap" @longpress="onLongPress" @touchend="onLongPressEnd" @touchcancel="onLongPressEnd">
			<!--
        video 始终渲染，利用 poster 显示海报，
        src 为空时显示原生播放按钮，用户点击触发 onVideoTap 获取真实地址
      -->
			<video id="detail-player" :key="videoKey" :src="videoUrl" :autoplay="autoPlay" :muted="muted"
				:controls="true" :page-gesture="true" :show-mute-btn="true" :enable-progress-gesture="true"
				object-fit="contain" :poster="vod?.vod_poster || ''" :title="vod?.vod_name || ''"
				:enable-play-gesture="true" :vslide-gesture="true" :vslide-gesture-in-fullscreen="true"
				:http-cache="false" play-btn-position="center" :rate="playbackRate" style="width: 100%; height: 100%"
				@error="onVideoError" @tap="onVideoTap" @fullscreenchange="onFullscreenChange" />

			<!-- 倍速控制（仅全屏展示） -->
			<!-- 全圆倍速按钮 -->
			<cover-view class="speed-btn" v-if="hasSource && isFullscreen && showSpeed && !showSidebar"
				@tap="onSpeedBtnTap">
				<cover-view class="speed-circle-txt">{{ displayRate }}</cover-view>
			</cover-view>
			<!-- 侧边栏遮罩 -->
			<cover-view class="speed-mask" v-if="hasSource && isFullscreen && showSidebar" @tap="closeSidebar" />
			<!-- 倍速侧边栏 -->
			<cover-view class="speed-sidebar" v-if="hasSource && isFullscreen && showSidebar">
				<cover-view class="sidebar-title">倍速</cover-view>
				<cover-view class="sidebar-opt" v-for="s in speedOptions" :key="s"
					:class="{ active: playbackRate === s }" @tap="selectSpeed(s)">
					<cover-view>{{ s }}x</cover-view>
				</cover-view>
			</cover-view>

		<!-- 长按倍速提示 -->
		<cover-view class="speed-hint" v-if="showLongPressHint">
			<cover-view class="speed-hint-text">{{ longPressHintSpeed }}倍加速中</cover-view>
		</cover-view>

		<!-- 视频加载错误 / 自动换源提示 -->
			<view class="video-error-overlay" v-if="videoErrorMsg && !switchingSource">
				<uni-icons type="info" size="20" color="#e74c3c" />
				<text class="video-error-text">{{ videoErrorMsg }}</text>
			</view>
			<view class="video-error-overlay" v-if="switchingSource">
				<uni-icons type="spinner-cycle" size="20" color="#fe8027" />
				<text class="video-error-text switching">{{ videoErrorMsg }}</text>
			</view>
		</view>

		<!-- 标题 -->
		<view class="info-section">
			<view class="title-row">
				<text class="vod-title">{{ vod.vod_name }}</text>
				<uni-icons :type="isFaved ? 'star-filled' : 'star'" :color="isFaved ? '#e74c3c' : '#888'" size="22"
					@tap="toggleFav" />
			</view>
			<view class="tags">
				<text class="tag status" v-if="vod.vod_remarks && vod.vod_remarks !== '0'">{{
          vod.vod_remarks
        }}</text>
				<text class="tag">{{ vod.vod_year }}</text><text class="tag">{{ vod.vod_area }}</text>
				<text class="tag" v-if="vod.vod_director">{{ vod.vod_director }}</text>
			</view>
			<view class="source-row" v-if="flags.length > 0">
				<uni-icons type="flag" size="14" color="#888" /><text class="source-label">
					站源：</text>
				<scroll-view class="source-tabs" scroll-x show-scrollbar="false">
					<text v-for="f in flags" :key="f.flag" class="source-tab" :class="{ active: f.flag === activeFlag }"
						@tap="switchFlag(f.flag)">{{ f.flag }}</text>
				</scroll-view>
			</view>
		</view>

		<!-- 选集 -->
		<view class="section" v-if="currentEpisodes.length > 0">
			<view class="section-header">
				<uni-icons type="list" size="16" color="#888" /><text class="section-title">
					选集</text>
				<text class="ep-count">共 {{ currentEpisodes.length }} 集</text>
			</view>
			<view class="episodes">
				<text v-for="(ep, i) in displayEpisodes" :key="i" class="ep" :class="{ playing: i === currentIndex }"
					@tap="playEpisode(i)">{{ ep.name }}</text>
				<text v-if="currentEpisodes.length > COLLAPSE_LIMIT && !showAll" class="ep ep-more"
					@tap="showAll = true">展开 {{ currentEpisodes.length - COLLAPSE_LIMIT }} 集
					<uni-icons type="arrowdown" size="12" color="#e74c3c" /></text>
			</view>
		</view>
		<view class="section" v-if="vod.vod_content">
		 <view class="section-header"><uni-icons type="info" size="16" color="#888" /><text class="section-title">
		   简介</text></view>
		 <text class="content" @tap="expand = !expand">{{ displayContent }}<text class="expand-btn"><uni-icons
		    :type="expand ? 'arrowup' : 'arrowdown'" size="12" color="#e74c3c" />
		   {{ expand ? "收起" : "展开" }}</text></text>
		</view>
		<view class="section" v-if="vod.vod_actor">
			<view class="section-header"><uni-icons type="person" size="16" color="#888" /><text class="section-title">
					演员</text></view>
			<text class="content">{{ vod.vod_actor }}</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onBeforeUnmount
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import {
	 detail,
	 player,
	 searchSite
	} from "@/utils/api.js";
	import {
	 getFavorites,
	 addFavorite,
	 removeFavorite,
	 isFavorite,
	 addHistory,
	 getHistory,
	 getSetting,
	} from "@/utils/store.js";
	import {
	 store
	} from "@/utils/appState.js";

	const COLLAPSE_LIMIT = 30;

	const vod = ref(null);
	const flags = ref([]);
	const activeFlag = ref("");
	const currentIndex = ref(0);
	const showAll = ref(false);
	const expand = ref(false);
	const isFaved = ref(false);
	const loading = ref(false);
	const error = ref(false);
	const errorMsg = ref("");
	const hasSource = ref(false);
	const videoUrl = ref("");
	const videoKey = ref(0);
	const autoPlay = ref(false);
	const muted = ref(true);
	const savedEpisode = ref("");
	const savedProgress = ref(0);
	const playbackRate = ref(1);
	const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
	const showSpeed = ref(false);
	const isFullscreen = ref(false);
	const showSidebar = ref(false);
	const videoErrorMsg = ref("");
	const switchingSource = ref(false);
	const failedSiteKeys = ref(new Set());
	const showLongPressHint = ref(false);
	const longPressHintSpeed = ref(2);
	let speedTimer = null;

	const displayRate = computed(() => playbackRate.value.toFixed(1));

	const COLLAPSE_LENGTH = 120;
	const displayContent = computed(() => {
	 const text = stripHtml(vod.value?.vod_content || "");
	 if (expand.value || text.length <= COLLAPSE_LENGTH) return text;
	 return text.slice(0, COLLAPSE_LENGTH) + "...";
	});

	function clearSpeedTimer() {
		if (speedTimer) {
			clearTimeout(speedTimer);
			speedTimer = null;
		}
	}

	function showSpeedTemporarily() {
		showSpeed.value = true;
		clearSpeedTimer();
		speedTimer = setTimeout(() => {
			showSpeed.value = false;
		}, 4000);
	}

	function onFullscreenChange(e) {
		isFullscreen.value = e.detail.fullscreen;
		if (!e.detail.fullscreen) {
			showSpeed.value = false;
			showSidebar.value = false;
		}
	}

	function onSpeedBtnTap() {
		showSidebar.value = true;
		clearSpeedTimer();
	}

	function selectSpeed(s) {
		playbackRate.value = s;
		showSidebar.value = false;
		showSpeedTemporarily();
	}

	function closeSidebar() {
		showSidebar.value = false;
		showSpeedTemporarily();
	}
	let pageId = "";
	let pageKey = "";

	const currentEpisodes = computed(() => {
		const f = flags.value.find((f) => f.flag === activeFlag.value);
		return f?.episodes || [];
	});
	const displayEpisodes = computed(() => {
		if (showAll.value || currentEpisodes.value.length <= COLLAPSE_LIMIT)
			return currentEpisodes.value;
		return currentEpisodes.value.slice(0, COLLAPSE_LIMIT);
	});

	onLoad((o) => {
		pageId = o?.id || "";
		pageKey = o?.key || "";
	});
	onMounted(() => {
		loadDetail();
		muted.value = getSetting("video_muted", true);
		uni.$on("mutedChanged", (v) => {
			muted.value = v;
		});
	});
	onBeforeUnmount(() => {
		uni.$off("mutedChanged");
		clearSpeedTimer();
	});

	async function loadDetail() {
	 if (!pageId) return;
	 loading.value = true;
	 error.value = false;
	 errorMsg.value = "";
	 try {
	  const data = await detail(pageId, pageKey);
	  const item = data.list?.[0] || data.vod;
	  if (!item || !item.vod_name) {
	   error.value = true;
	   errorMsg.value = "未获取到影片信息";
	   return;
	  }
	  vod.value = item;
	  uni.setNavigationBarTitle({
	   title: item.vod_name
	  });
	  if (!vod.value.site_key && pageKey) vod.value.site_key = pageKey;
	  flags.value = item?.vodFlags || [];
	  if (flags.value.length > 0) activeFlag.value = flags.value[0].flag;
	  isFaved.value = isFavorite(pageId);
	  const hist = getHistory().find((h) => h.vod_id === item.vod_id);
	  if (hist) {
	   savedEpisode.value = hist.episode || "";
	   savedProgress.value = hist.progress || 0;
	   if (savedEpisode.value && currentEpisodes.value.length > 0) {
	    const idx = currentEpisodes.value.findIndex(
	     (ep) => ep.name === savedEpisode.value,
	    );
	    if (idx >= 0) currentIndex.value = idx;
	   }
	  }
	 } catch (e) {
	  error.value = true;
	  errorMsg.value = e?.message || "请求异常";
	 } finally {
	  loading.value = false;
	 }
	}

	function extractUrl(u) {
		let r = "";
		if (!u) return "";
		if (typeof u === "string") r = u;
		else if (u.values?.length > 0) {
			const p = u.position || 0;
			const i = Math.min(p, u.values.length - 1);
			r = u.values[i]?.v || u.values[0]?.v || "";
		}
		if (r.includes("127.0.0.1:-1/")) {
			const m = r.match(/[?&]url=([^&]+)/);
			if (m) {
				try {
					r = decodeURIComponent(m[1]);
				} catch {
					r = m[1];
				}
			}
		}
		return r;
	}

	function switchFlag(f) {
		activeFlag.value = f;
		currentIndex.value = 0;
		showAll.value = false;
		savedEpisode.value = "";
		savedProgress.value = 0;
		if (hasSource.value) {
			hasSource.value = false;
			autoPlay.value = false;
			if (currentEpisodes.value.length > 0) setTimeout(() => playEpisode(0), 100);
		}
	}

	function onVideoTap() {
		// 用户点击了 video（含 poster 上的播放按钮），触发加载真实地址
		if (!hasSource.value && currentEpisodes.value.length > 0) {
			playEpisode(currentIndex.value);
		}
	}

	function playEpisode(index) {
		const ep = currentEpisodes.value[index];
		if (!ep) return;
		currentIndex.value = index;
		showAll.value = true;
		addHistory(vod.value, ep.name, 0);
		videoErrorMsg.value = "";
		switchingSource.value = false;
		loadVideoSource(activeFlag.value, ep);
	}

	function loadVideoSource(flag, ep, isFallback) {
		player(flag, ep.url, pageKey)
			.then((data) => {
				const url = extractUrl(data.url) || ep.url || "";
				if (!url) {
					fallbackToNextLine(flag, ep, "未获取到播放地址");
					return;
				}
				videoKey.value++;
				videoUrl.value = url;
				hasSource.value = true;
				autoPlay.value = true;
				switchingSource.value = false;
				videoErrorMsg.value = "";
				if (isFallback) {
					uni.showToast({
						title: `已切换至「${flag}」`,
						icon: "none"
					});
				}
				if (isFullscreen.value) showSpeedTemporarily();
			})
			.catch((e) => {
				fallbackToNextLine(flag, ep, e?.message || "播放接口异常");
			});
	}

	/**
	 * fongmi 风格：两级降级策略
	 * 1. fallbackToNextLine — 当前视频数据内切换下一个 flag
	 * 2. searchFallback — 跨站搜索同名影片，自动选第一个
	 */
	function fallbackToNextLine(currentFlag, ep, reason) {
		const allFlags = flags.value.map(f => f.flag);
		const currentIdx = allFlags.indexOf(currentFlag);
		for (let i = currentIdx + 1; i < allFlags.length; i++) {
			const nextFlag = allFlags[i];
			const nextEpisodes = flags.value.find(f => f.flag === nextFlag)?.episodes || [];
			const nextEp = nextEpisodes.find(e => e.name === ep.name) || nextEpisodes[0];
			if (nextEp) {
				const idx = nextEpisodes.indexOf(nextEp);
				activeFlag.value = nextFlag;
				currentIndex.value = idx;
				switchingSource.value = true;
				videoErrorMsg.value = `正在切换至「${nextFlag}」...`;
				hasSource.value = false;
				autoPlay.value = false;
				videoUrl.value = "";
				setTimeout(() => loadVideoSource(nextFlag, nextEp, true), 300);
				return;
			}
		}
		// 一级降级失败 → 二级降级：跨站搜索
		searchFallback(ep, reason);
	}

	async function searchFallback(ep, reason) {
		const keyword = vod.value?.vod_name || "";
		if (!keyword) {
			allFailed(reason);
			return;
		}
		// 记录当前 site_key 为失败
		if (vod.value?.site_key) {
			failedSiteKeys.value.add(vod.value.site_key);
		}
		switchingSource.value = true;
		videoErrorMsg.value = `正在搜索其他站源...`;
		// 获取所有可搜索站点，过滤掉已失败的，最多取前3个
		const MAX_FALLBACK = 3;
		const sites = (store.sites || []).filter(s =>
			!failedSiteKeys.value.has(s.key) && s.key !== pageKey
		).slice(0, MAX_FALLBACK);
		if (sites.length === 0) {
			allFailed(reason);
			return;
		}
		// 依次搜索各站点，取第一个有结果的
		for (const site of sites) {
			videoErrorMsg.value = `正在搜索「${site.name}」...`;
			try {
				const data = await searchSite(keyword, site.key);
				const items = data?.list || [];
				if (items.length === 0) continue;
				// 找到名称匹配的影片
				const match = items.find(item =>
					item.vod_name === keyword || item.vod_name.includes(keyword)
				) || items[0];
				// 获取该影片的详情和播放地址
				const detailData = await detail(match.vod_id, site.key);
				const vodItem = detailData.list?.[0] || detailData.vod;
				if (!vodItem) continue;
				const vFlags = vodItem?.vodFlags || [];
				if (vFlags.length === 0) continue;
				// 用第一个 flag 播放当前集
				const firstFlag = vFlags[0].flag;
				const firstEpisodes = vFlags[0].episodes || [];
				const targetEp = firstEpisodes.find(e => e.name === ep.name) || firstEpisodes[0] || ep;
				activeFlag.value = firstFlag;
				// 把新源的 flag 注入到页面
				const existingFlag = flags.value.find(f => f.flag === firstFlag);
				if (!existingFlag) {
					flags.value.push(vFlags[0]);
				}
				currentIndex.value = firstEpisodes.indexOf(targetEp);
				switchingSource.value = true;
				videoErrorMsg.value = `正在尝试「${site.name}」...`;
				hasSource.value = false;
				autoPlay.value = false;
				videoUrl.value = "";
				setTimeout(() => {
					loadVideoSource(firstFlag, targetEp, true);
				}, 300);
				return;
			} catch {
				failedSiteKeys.value.add(site.key);
				continue;
			}
		}
		allFailed(reason);
	}

	function allFailed(reason) {
		switchingSource.value = false;
		videoErrorMsg.value = "所有站源均不可用";
		hasSource.value = false;
		uni.showToast({
			title: `播放失败: ${reason}`,
			icon: "none",
			duration: 3000,
		});
	}

	function onVideoError() {
		const ep = currentEpisodes.value[currentIndex.value];
		if (ep && hasSource.value) {
			fallbackToNextLine(activeFlag.value, ep, "视频加载失败");
		} else {
			uni.showToast({
				title: "视频加载失败",
				icon: "none"
			});
		}
	}

	function setSpeed(s) {
		playbackRate.value = s;
		showSidebar.value = false;
		if (isFullscreen.value) showSpeedTemporarily();
	}

	function onPlayerTap() {
	 if (showSidebar.value) {
	  closeSidebar();
	  return;
	 }
	 if (hasSource.value && isFullscreen.value) {
	  showSpeedTemporarily();
	 }
	}

	function onLongPress() {
	 if (!hasSource.value) return;
	 const speed = getSetting('long_press_speed', 2);
	 playbackRate.value = speed;
	 longPressHintSpeed.value = speed;
	 showLongPressHint.value = true;
	}

	function onLongPressEnd() {
	 showLongPressHint.value = false;
	}

	function toggleFav() {
		if (isFaved.value) {
			removeFavorite(vod.value.vod_id);
			isFaved.value = false;
			uni.showToast({
				title: "已取消收藏",
				icon: "none"
			});
		} else {
			addFavorite(vod.value);
			isFaved.value = true;
			uni.showToast({
				title: "已收藏",
				icon: "success"
			});
		}
	}

	function stripHtml(html) {
		if (!html) return ''
		return html.replace(/<p>/gi, '\n').replace(/<\/p>/gi, '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<[^>]+>/g, '')
			.replace(/&nbsp;/g, ' ')
			.replace(/&#(\d+);/g, (m, c) => String.fromCharCode(c))
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/\n{3,}/g, '\n\n')
			.trim()
	}
</script>

<style lang="scss" scoped>
	.page {
		padding-bottom: 40rpx;
		background: var(--bg-primary);
	}

	.status-page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
		background: var(--bg-primary);
	}

	.status-text {
		font-size: 28rpx;
		color: var(--text-secondary);
	}

	.status-detail {
	 font-size: 24rpx;
	 color: #999;
	 text-align: center;
	 padding: 0 40rpx;
	 line-height: 1.5;
	}

	.retry-btn {
		font-size: 26rpx;
		color: var(--accent);
		padding: 12rpx 40rpx;
		border: 1rpx solid var(--accent);
		border-radius: 30rpx;
		margin-top: 10rpx;
	}

	.retry-btn:active {
		opacity: 0.7;
	}

	.player-area {
		position: relative;
		width: 100%;
		height: 460rpx;
		background: #000;
		overflow: hidden;
	}

	/* 倍速控制（仅全屏展示） */
	.speed-btn {
	 position: absolute;
	 right: 24rpx;
	 top: 24rpx;
	 z-index: 20;
	 width: 80rpx;
	 height: 80rpx;
	 border-radius: 50%;
	 background: rgba(0, 0, 0, 0.55);
	 display: flex;
	 align-items: center;
	 justify-content: center;
	}

	/* 视频错误/换源提示 */
	.video-error-overlay {
	 position: absolute;
	 left: 0;
	 right: 0;
	 bottom: 0;
	 z-index: 15;
	 padding: 8rpx 16rpx;
	 background: rgba(0, 0, 0, 0.6);
	 display: flex;
	 align-items: center;
	 gap: 8rpx;
	}

	.video-error-text {
	 font-size: 22rpx;
	 color: #e74c3c;
	 flex: 1;

	 &.switching {
	  color: #fe8027;
	 }
	}

	.speed-circle-txt {
	 font-size: 30rpx;
	 font-weight: 700;
	 color: #fff;
	 text-align: center;
	 line-height: 1;
	}

	/* 长按倍速提示 */
	.speed-hint {
	 position: absolute;
	 left: 50%;
	 top: 24rpx;
	 transform: translateX(-50%);
	 z-index: 25;
	 display: flex;
	 align-items: center;
	 justify-content: center;
	 pointer-events: none;
	}

	.speed-hint-text {
	 font-size: 28rpx;
	 font-weight: 600;
	 color: #fff;
	 text-align: center;
	 line-height: 1;
	}

	.speed-mask {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 25;
		background: rgba(0, 0, 0, 0.3);
	}

	.speed-sidebar {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 200rpx;
		z-index: 30;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30rpx 0;
		gap: 20rpx;
	}

	.sidebar-title {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 10rpx;
	}

	.sidebar-opt {
		padding: 12rpx 30rpx;
		border-radius: 30rpx;
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
		text-align: center;
		min-width: 120rpx;

		&.active {
			background: $theme-accent;
			color: #fff;
			font-weight: 700;
		}
	}

	.info-section {
		padding: 24rpx 20rpx 16rpx;
		background: var(--card);
		margin: 16rpx 12rpx;
		border-radius: 16rpx;
	}

	.title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12rpx;
	}

	.vod-title {
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: var(--text-primary);
		flex: 1;
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-wide);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8rpx;
		margin-top: 16rpx;
	}

	.tag {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		background: var(--card-hover);
		padding: 4rpx 14rpx;
		border-radius: 6rpx;
		letter-spacing: var(--tracking-normal);

		&.status {
			color: var(--accent);
			background: rgba(254, 128, 39, 0.12);
			font-weight: var(--weight-medium);
		}
	}

	.source-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-top: 20rpx;
		padding: 16rpx 0 0;
		border-top: 1rpx solid var(--border);
	}

	.source-label {
		font-size: 24rpx;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.source-tabs {
		display: flex;
		flex-direction: row;
		white-space: nowrap;
		overflow: hidden;
	}

	.source-tab {
		display: inline-flex;
		padding: 8rpx 20rpx;
		margin-right: 10rpx;
		border-radius: 30rpx;
		background: var(--card-hover);
		font-size: 22rpx;
		color: var(--text-secondary);

		&.active {
			background: var(--accent);
			color: #fff;
		}
	}

	.actor-section {
		padding: 0 20rpx;
		margin-top: 24rpx;
	}

	.section {
		padding: 0 20rpx;
		margin-top: 24rpx;

		&-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 14rpx;
		}

		&-title {
			font-size: var(--text-lg);
			font-weight: var(--weight-semibold);
			color: var(--text-primary);
		}
	}

	.ep-count {
		font-size: 24rpx;
		color: var(--text-secondary);
	}

	.episodes {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.ep {
		padding: 12rpx 24rpx;
		border-radius: 8rpx;
		background: var(--card-hover);
		font-size: var(--text-sm);
		color: var(--text-primary);
		min-width: 96rpx;
		text-align: center;
		letter-spacing: var(--tracking-normal);
		transition: all 0.15s;

		&.playing {
			background: var(--accent);
			color: #fff;
			font-weight: 500;
		}

		&:active {
			opacity: 0.7;
		}

		&.ep-more {
			color: var(--accent);
			background: rgba(254, 128, 39, 0.1);
			min-width: auto;
		}
	}

	.content {
	 font-size: var(--text-base);
	 color: var(--text-secondary);
	 line-height: var(--leading-loose);
	 letter-spacing: var(--tracking-narrow);
	 white-space: pre-wrap;
	}

	.expand-btn {
		color: var(--accent);
		font-size: 24rpx;
	}
</style>