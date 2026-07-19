<template>
  <view class="page" :style="themeStyle">
    <!-- 状态栏使用独立黑色占位，避免浅色主题露出白底。 -->
    <view
      class="player-status-bar"
      v-if="!isFullscreen"
      :style="{ height: statusBarHeight + 'px' }"
    ></view>
    <!-- 倍速按钮放在原生 video 边界之外，确保点击和长按不会被视频层吞掉。 -->
    <view class="speed-toolbar" v-if="!isFullscreen">
      <view
        class="speed-btn"
        v-if="hasSource && showSpeedControl"
        @tap.stop="onSpeedBtnTap"
        @longpress.stop="onLongPress"
        @touchend.stop="onLongPressEnd"
        @touchcancel.stop="onLongPressEnd"
      >{{ showLongPressHint ? `${longPressHintSpeed}x 快进中` : `${getDisplayRate()}x` }}</view>
    </view>
    <!-- 播放器 -->
    <view class="player-area">
      <video
        id="detail-player"
        :key="videoKey"
        :src="videoUrl"
        :autoplay="autoPlay"
        :muted="muted"
        :controls="true"
        :page-gesture="true"
        :show-mute-btn="true"
        :enable-progress-gesture="true"
        object-fit="contain"
        :poster="vod?.vod_poster || ''"
        :title="vod?.vod_name || ''"
        :enable-play-gesture="true"
        :vslide-gesture="true"
        :vslide-gesture-in-fullscreen="true"
        :http-cache="false"
        play-btn-position="center"
        :mobilenet-hint-type="1"
        :playback-rate="playbackRate"
        :initial-time="resumePosition"
        style="width: 100%; height: 100%"
        @error="onVideoError"
        @timeupdate="onVideoTimeUpdate"
        @pause="savePlaybackProgress(true)"
        @fullscreenchange="onFullscreenChange"
        @play="onVideoPlay"
        @controlstoggle="onVideoControlsToggle"
        @longpress="onLongPress"
        @touchend="onLongPressEnd"
        @touchcancel="onLongPressEnd"
      >
      </video>
      <!-- 原生 video 区域不再覆盖任何触摸层，保留原生全屏、暂停和进度手势。 -->

      <!-- 顶部自定义栏（轻触显示） -->

      <!-- 加载覆盖层（vod 数据到之前显示，不阻塞页面框架） -->
      <view class="player-overlay" v-if="loading && !vod"> </view>
      <!-- 错误覆盖层（vod 到之前） -->
      <view class="player-overlay" v-else-if="error && !vod">
        <uni-icons type="closeempty" size="48" color="#888" />
        <text class="overlay-text">加载失败</text>
        <text class="overlay-detail" v-if="errorMsg">{{ errorMsg }}</text>
        <text class="retry-btn" @tap="loadDetail">点击重试</text>
      </view>

      <!-- 右侧悬浮倍速按钮 -->

      <!-- 长按倍速提示 -->

      <!-- 视频加载错误 / 自动换源提示 -->
      <view
        class="video-error-overlay"
        v-if="videoErrorMsg && !switchingSource"
      >
        <uni-icons type="info" size="20" color="#fe8027" />
        <text class="video-error-text">{{ videoErrorMsg }}</text>
      </view>
      <view class="video-error-overlay" v-if="switchingSource">
        <uni-icons type="spinner-cycle" size="20" color="#fe8027" />
        <text class="video-error-text switching">{{ videoErrorMsg }}</text>
      </view>
    </view>

    <!-- 加载占位（vod 数据到之前，信息区域不白屏） -->
    <view class="loading-placeholder" v-if="loading && !vod">
      <uni-icons type="spinner-cycle" size="20" color="#888" />
      <text class="loading-placeholder-text">正在加载影片信息...</text>
    </view>

    <!-- 内容区域（vod 数据到后显示，不阻塞页面框架） -->
    <view class="content-wrap" v-if="vod">
      <!-- 标题（右侧收藏icon） -->
      <view class="info-section">
        <view class="title-row">
          <text class="vod-title">{{ vod.vod_name }}</text>
          <view class="fav-btn" @tap="toggleFav">
            <uni-icons
              v-if="favLoading"
              type="spinner-cycle"
              color="#fe8027"
              size="24"
            />
            <uni-icons
              v-else
              :type="isFaved ? 'star-filled' : 'star'"
              :color="isFaved ? '#fe8027' : '#888'"
              size="24"
            />
          </view>
        </view>
        <!-- 年份 TC国语（vod_remarks） -->
        <view class="tags" v-if="vod.vod_remarks && vod.vod_remarks !== '0'">
          <text class="tag">{{ vod.vod_year }}</text>
          <text class="tag">{{ vod.vod_remarks }}</text>
        </view>
        <!-- 站源 -->
        <view class="source-row" v-if="flags.length > 0">
			<view class="zy-row">
				<uni-icons type="flag" size="16" color="#888" /><text
				  class="source-label"
				  >站源</text
				>
			</view>
          <scroll-view class="source-tabs" scroll-x show-scrollbar="false">
            <text
              v-for="f in flags"
              :key="f.flag"
              class="source-tab"
              :class="{ active: f.flag === activeFlag }"
              @tap="switchFlag(f.flag)"
              >{{ f.flag }}</text
            >
          </scroll-view>
        </view>
        <!-- 导演 -->
        <view class="section" v-if="vod.vod_director">
          <view class="section-header"
            ><uni-icons type="person" size="16" color="#888" /><text
              class="section-title"
              >导演</text
            ></view
          >
          <text class="content">{{ parseNames(vod.vod_director) }}</text>
        </view>
        <!-- 演员 -->
        <view class="section" v-if="vod.vod_actor">
          <view class="section-header"
            ><uni-icons type="person" size="16" color="#888" /><text
              class="section-title"
              >演员</text
            ></view
          >
          <text class="content">{{ parseNames(vod.vod_actor) }}</text>
        </view>
      </view>

      <!-- 选集 -->
      <view class="section" v-if="currentEpisodes.length > 0">
        <view class="section-header">
          <uni-icons type="list" size="16" color="#888" /><text
            class="section-title"
            >选集</text
          >
          <text class="ep-count">共 {{ currentEpisodes.length }} 集</text>
        </view>
        <view class="episodes">
          <text
            v-for="(ep, i) in displayEpisodes"
            :key="i"
            class="ep"
            :class="{ playing: i === currentIndex }"
            @tap="playEpisode(i)"
            >{{ ep.name }}</text
          >
          <text
            v-if="currentEpisodes.length > COLLAPSE_LIMIT && !showAll"
            class="ep ep-more"
            @tap="showAll = true"
            >展开 {{ currentEpisodes.length - COLLAPSE_LIMIT }} 集
            <uni-icons type="down" size="14" color="#fe8027"
          /></text>
        </view>
      </view>
      <!-- 简介 -->
      <view class="section" v-if="vod.vod_content">
        <view class="section-header">
          <uni-icons type="info" size="16" color="#888" />
          <text class="section-title">简介</text>
        </view>
        <text class="content" @tap="expand = !expand"
          >{{ displayContent
          }}<text class="expand-btn" v-if="isContentLong">
            {{ expand ? "收起" : "展开" }}
            <uni-icons
              :type="expand ? 'up' : 'down'"
              size="12"
              color="#fe8027"
            />
          </text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { themeStyle } from "@/utils/theme.js";
import { usePageListeners } from "@/utils/usePageListeners.js";
import { onLoad, onShow, onHide, onBackPress } from "@dcloudio/uni-app";
import { detail, player, searchSite } from "@/utils/api.js";
import {
  addFavorite,
  removeFavorite,
  isFavorite,
  addHistory,
  getHistory,
  getSetting,
  getCurrentUser,
} from "@/utils/store.js";

import { store } from "@/utils/appState.js";
import { useVideoPlayer } from "@/utils/useVideoPlayer.js";
import { useStatusBar } from "@/utils/useStatusBar.js";

const { statusBarHeight } = useStatusBar();

const COLLAPSE_LIMIT = 30;

const vod = ref(null);
const flags = ref([]);
const activeFlag = ref("");
const currentIndex = ref(0);
const showAll = ref(false);
const expand = ref(false);
const isFaved = ref(false);
const favLoading = ref(false);
const loading = ref(false);
const error = ref(false);
const errorMsg = ref("");
const hasSource = ref(false);
const videoUrl = ref("");
const autoPlay = ref(false);
const savedEpisode = ref("");
const savedProgress = ref(0);
const savedFlag = ref("");
const resumePosition = ref(0);
let currentPlaybackPosition = 0;
let lastProgressSavedAt = 0;
let resumeSeekApplied = true;
const videoErrorMsg = ref("");
const switchingSource = ref(false);
const failedSiteKeys = ref(new Set());
const showLongPressHint = ref(false);
const longPressHintSpeed = ref(2);
const showControls = ref(false);
const showSpeedControl = ref(false);
let longPressActive = false;
let speedBeforeLongPress = 1;
let suppressSpeedTapUntil = 0;
let speedControlTimer = null;
let nativeControlsVisible = false;

// ===== 播放器共享状态（useVideoPlayer） =====
const {
  videoKey,
  muted,
  playbackRate,
  speedOptions,
  showSpeed,
  showSidebar,
  isFullscreen,
  createVideoContext,
  setControlsTimer,
  clearControlsTimer,
  applyPlaybackRate,
  selectSpeed,
  closeSidebar,
  showSpeedTemporarily,
  getDisplayRate,
  onFullscreenChange,
  exitFullscreen,
} = useVideoPlayer("detail-player");

usePageListeners({ mutedRef: muted });

const COLLAPSE_LENGTH = 120;
const displayContent = computed(() => {
  const text = stripHtml(vod.value?.vod_content || "");
  if (expand.value || text.length <= COLLAPSE_LENGTH) return text;
  return text.slice(0, COLLAPSE_LENGTH) + "...";
});
const isContentLong = computed(() => {
  const text = stripHtml(vod.value?.vod_content || "");
  return text.length > COLLAPSE_LENGTH;
});

// 倍速/全屏/定时器由 useVideoPlayer composable 提供
let pageId = "";
let pageKey = "";
let pageActive = true;
let playbackRequestToken = 0;
let resumeAfterHide = false;

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
});

onShow(() => {
  pageActive = true;
  if (!resumeAfterHide || !vod.value) return;
  resumeAfterHide = false;
  const ep = currentEpisodes.value[currentIndex.value];
  if (!ep) return;
  savedEpisode.value = ep.name;
  savedProgress.value = Math.max(0, currentPlaybackPosition || 0);
  savedFlag.value = activeFlag.value;
  nextTick(() => playEpisode(currentIndex.value, true));
});

onHide(() => {
  onLongPressEnd();
  clearSpeedControlTimer();
  showSpeedControl.value = false;
  releaseDetailPlayer(true);
});

// 全屏时系统返回键先退出全屏，而不是直接 navigateBack/退出应用。
// 非全屏时走默认返回行为。
onBackPress(() => {
  if (isFullscreen.value) {
    exitFullscreen();
    return true; // 消费事件，阻止默认返回
  }
  return false; // 非全屏：走默认 navigateBack
});

onBeforeUnmount(() => {
  onLongPressEnd();
  clearSpeedControlTimer();
  savePlaybackProgress(true);
  releaseDetailPlayer(false);
  clearControlsTimer();
});

function releaseDetailPlayer(rememberPosition) {
  if (rememberPosition && vod.value && currentEpisodes.value.length > 0) {
    savePlaybackProgress(true);
    resumeAfterHide = true;
  } else if (!rememberPosition) {
    resumeAfterHide = false;
  }

  pageActive = false;
  playbackRequestToken++;
  hasSource.value = false;
  autoPlay.value = false;
  try {
    const ctx = createVideoContext();
    if (isFullscreen.value && ctx) ctx.exitFullScreen();
    if (ctx) ctx.stop();
  } catch (e) {}
  videoUrl.value = "";
  videoKey.value++;
}

async function loadDetail() {
  if (!pageId) return;
  loading.value = true;
  error.value = false;
  errorMsg.value = "";
  try {
    let data;

    data = await detail(pageId, pageKey);

    const item = data.list?.[0] || data.vod;
    if (!item) {
      error.value = true;
      errorMsg.value = "未获取到影片信息";
      return;
    }
    vod.value = item;
    uni.setNavigationBarTitle({
      title: item.vod_name,
    });
    if (!vod.value.site_key && pageKey) vod.value.site_key = pageKey;
    flags.value = item?.vodFlags || [];
    if (flags.value.length > 0) activeFlag.value = flags.value[0].flag;

    // 收藏状态（非阻塞，查不到或失败静默处理）
    isFavorite(pageId)
      .then((v) => (isFaved.value = v))
      .catch(() => {});

    // 恢复历史线路、集数和播放秒数。旧记录没有 flag 时，按集名反查所在线路。
    const localHist = getHistory();
    const found = localHist.find((h) =>
      h.vod_id === item.vod_id &&
      (!pageKey || !h.site_key || h.site_key === pageKey)
    );
    let shouldResume = false;
    if (found) {
      savedEpisode.value = found.episode || "";
      savedProgress.value = Math.max(0, Number(found.progress) || 0);
      savedFlag.value = found.flag || "";

      const targetFlag =
        flags.value.find((f) => f.flag === savedFlag.value) ||
        flags.value.find((f) =>
          (f.episodes || []).some((ep) => ep.name === savedEpisode.value)
        );
      if (targetFlag) activeFlag.value = targetFlag.flag;

      if (savedEpisode.value && currentEpisodes.value.length > 0) {
        const idx = currentEpisodes.value.findIndex(
          (ep) => ep.name === savedEpisode.value,
        );
        if (idx >= 0) {
          currentIndex.value = idx;
          shouldResume = true;
        }
      }
    }
    // 自动播放第一集，或从历史中的线路、集数和秒数继续播放。
    if (currentEpisodes.value.length > 0) {
      playEpisode(currentIndex.value, shouldResume);
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
  savePlaybackProgress(true);
  activeFlag.value = f;
  currentIndex.value = 0;
  showAll.value = false;
  savedEpisode.value = "";
  savedProgress.value = 0;
  savedFlag.value = "";
  resumePosition.value = 0;
  currentPlaybackPosition = 0;
  resumeSeekApplied = true;
  if (hasSource.value) {
    hasSource.value = false;
    autoPlay.value = false;
    if (currentEpisodes.value.length > 0) setTimeout(() => playEpisode(0), 100);
  }
}

function onVideoTap() {
  // App 端原生 video 的 tap 不会冒泡到外层 view，必须在这里切换自定义栏。
  if (!hasSource.value && currentEpisodes.value.length > 0) {
    playEpisode(currentIndex.value);
    return;
  }
  onPlayerTap();
}

function playEpisode(index, resumeHistory = false) {
  if (hasSource.value) savePlaybackProgress(true);
  const ep = currentEpisodes.value[index];
  if (!ep) return;
  currentIndex.value = index;
  showAll.value = true;

  const canResume = resumeHistory && savedEpisode.value === ep.name;
  resumePosition.value = canResume ? savedProgress.value : 0;
  currentPlaybackPosition = resumePosition.value;
  resumeSeekApplied = resumePosition.value <= 1;
  lastProgressSavedAt = 0;
  addHistory(vod.value, ep.name, resumePosition.value, activeFlag.value);

  videoErrorMsg.value = "";
  switchingSource.value = false;
  loadVideoSource(activeFlag.value, ep);
}

function loadVideoSource(flag, ep, isFallback) {
  if (!pageActive) return;
  const requestToken = ++playbackRequestToken;
  player(flag, ep.url, pageKey)
    .then((data) => {
      if (!pageActive || requestToken !== playbackRequestToken) return;
      const url = extractUrl(data.url) || ep.url || "";
      if (!url) {
        fallbackToNextLine(flag, ep, "未获取到播放地址");
        return;
      }
      videoKey.value++;
      videoUrl.value = url;
      hasSource.value = true;
      autoPlay.value = true;
      showControls.value = true;
      setControlsTimer(() => { showControls.value = false }, 2500);
      switchingSource.value = false;
      videoErrorMsg.value = "";
      if (isFallback) {
        uni.showToast({
          title: `已切换至「${flag}」`,
          icon: "none",
        });
      }
      if (isFullscreen.value) showSpeedTemporarily();
    })
    .catch((e) => {
      if (!pageActive || requestToken !== playbackRequestToken) return;
      fallbackToNextLine(flag, ep, e?.message || "播放接口异常");
    });
}

/**
 * fongmi 风格：两级降级策略
 * 1. fallbackToNextLine — 当前视频数据内切换下一个 flag
 * 2. searchFallback — 跨站搜索同名影片，自动选第一个
 */
function fallbackToNextLine(currentFlag, ep, reason) {
  const allFlags = flags.value.map((f) => f.flag);
  const currentIdx = allFlags.indexOf(currentFlag);
  for (let i = currentIdx + 1; i < allFlags.length; i++) {
    const nextFlag = allFlags[i];
    const nextEpisodes =
      flags.value.find((f) => f.flag === nextFlag)?.episodes || [];
    const nextEp =
      nextEpisodes.find((e) => e.name === ep.name) || nextEpisodes[0];
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
  const sites = (store.sites || [])
    .filter((s) => !failedSiteKeys.value.has(s.key) && s.key !== pageKey)
    .slice(0, MAX_FALLBACK);
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
      const match =
        items.find(
          (item) =>
            item.vod_name === keyword || item.vod_name.includes(keyword),
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
      const targetEp =
        firstEpisodes.find((e) => e.name === ep.name) || firstEpisodes[0] || ep;
      activeFlag.value = firstFlag;
      // 把新源的 flag 注入到页面
      const existingFlag = flags.value.find((f) => f.flag === firstFlag);
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

function onVideoTimeUpdate(e) {
  const reported = Number(e?.detail?.currentTime);
  if (!Number.isFinite(reported) || reported < 0) return;

  // initial-time 在部分 App 端播放器内核上不稳定，首次 timeupdate 再 seek 一次兜底。
  if (!resumeSeekApplied && resumePosition.value > 1) {
    const target = resumePosition.value;
    resumeSeekApplied = true;
    currentPlaybackPosition = target;
    if (Math.abs(reported - target) > 2) {
      try {
        const ctx = createVideoContext();
        if (ctx) ctx.seek(target);
      } catch (e) {}
      return;
    }
  }

  currentPlaybackPosition = reported;
  savePlaybackProgress(false);
}

function savePlaybackProgress(force = false) {
  if (!vod.value || !hasSource.value) return;
  const ep = currentEpisodes.value[currentIndex.value];
  if (!ep) return;

  const now = Date.now();
  if (!force && now - lastProgressSavedAt < 5000) return;
  lastProgressSavedAt = now;
  const progress = Math.max(0, Math.floor(currentPlaybackPosition || 0));
  addHistory(vod.value, ep.name, progress, activeFlag.value);
}
function onVideoError() {
  // video 组件在 src 为空时也会触发 @error，此时没有加载任何源，忽略
  if (!hasSource.value) return;
  const ep = currentEpisodes.value[currentIndex.value];
  if (ep) {
    fallbackToNextLine(activeFlag.value, ep, "视频加载失败");
  } else {
    uni.showToast({
      title: "视频加载失败",
      icon: "none",
    });
  }
}

function setSpeed(s) {
  selectSpeed(s);
  if (isFullscreen.value) showSpeedTemporarily();
}

function onPlayerTap() {
   if (showSidebar.value) {
     closeSidebar();
     return;
   }
   // 切换自定义控制栏显示状态
   showControls.value = !showControls.value;
   if (showControls.value) {
     setControlsTimer(() => { showControls.value = false }, 4000);
   } else {
     clearControlsTimer();
   }
 }

 function onControlsTap() {
   // cover-view 层点击：切换自定义控制栏
   showControls.value = !showControls.value;
   if (showControls.value) {
     setControlsTimer(() => { showControls.value = false }, 4000);
   } else {
     clearControlsTimer();
   }
 }

function clearSpeedControlTimer() {
  if (!speedControlTimer) return;
  clearTimeout(speedControlTimer);
  speedControlTimer = null;
}

function showSpeedControlTemporarily() {
  showSpeedControl.value = true;
  clearSpeedControlTimer();
  if (nativeControlsVisible || longPressActive) return;
  speedControlTimer = setTimeout(() => {
    speedControlTimer = null;
    showSpeedControl.value = false;
  }, 4000);
}

function onVideoPlay() {
  showSpeedControlTemporarily();
}

function onVideoControlsToggle(event) {
  nativeControlsVisible = Boolean(event?.detail?.show);
  clearSpeedControlTimer();
  showSpeedControl.value = nativeControlsVisible;
}

function onSpeedBtnTap() {
  // 长按松手后部分 WebView 还会补发 tap，避免误弹选择框。
  if (longPressActive || Date.now() < suppressSpeedTapUntil) return;
  clearSpeedControlTimer();
  showSpeedControl.value = true;
  uni.showActionSheet({
    itemList: speedOptions.map((s) => `${s}x`),
    success: ({ tapIndex }) => {
      const speed = speedOptions[tapIndex];
      if (speed != null) setSpeed(speed);
    },
    complete: () => showSpeedControlTemporarily(),
  });
}

 function toggleMuteControl() {
   muted.value = !muted.value;
   showControls.value = true;
   setControlsTimer(() => { showControls.value = false }, 4000);
 }

 function onBackTap() {
   if (isFullscreen.value) {
     exitFullscreen();
   } else {
     uni.navigateBack();
   }
 }

 function enterFullscreen() {
   const ctx = createVideoContext();
   if (ctx) ctx.requestFullScreen({ direction: 90 });
 }

function onLongPress() {
  if (!hasSource.value || longPressActive) return;
  const configuredSpeed = Number(getSetting("long_press_speed", 2));
  const speed = Number.isFinite(configuredSpeed) && configuredSpeed > 0
    ? configuredSpeed
    : 2;
  speedBeforeLongPress = Number(playbackRate.value) || 1;
  longPressActive = true;
  clearSpeedControlTimer();
  showSpeedControl.value = true;
  longPressHintSpeed.value = speed;
  showLongPressHint.value = true;
  applyPlaybackRate(speed);
}

function onLongPressEnd() {
  if (!longPressActive) return;
  longPressActive = false;
  showLongPressHint.value = false;
  applyPlaybackRate(speedBeforeLongPress);
  suppressSpeedTapUntil = Date.now() + 500;
  showSpeedControlTemporarily();
}

async function toggleFav() {
  // 未登录先拦截
  if (!getCurrentUser()) {
    uni.showModal({
      title: "提示",
      content: "登录后才能收藏，是否去登录？",
      confirmText: "去登录",
      cancelText: "暂不",
      success: (res) => {
        if (res.confirm) uni.navigateTo({ url: "/pages/login/login" });
      },
    });
    return;
  }
  if (favLoading.value) return; // 防止重复点击
  favLoading.value = true;
  try {
    if (isFaved.value) {
      await removeFavorite(vod.value.vod_id);
      isFaved.value = false;
      uni.showToast({
        title: "已取消收藏",
        icon: "none",
      });
    } else {
      await addFavorite(vod.value);
      isFaved.value = true;
      uni.showToast({
        title: "已收藏",
        icon: "success",
      });
    }
  } finally {
    favLoading.value = false;
  }
}

/**
 * 解析 fongmi 风格的导演/演员数据（[a=cr{...}/a.../a]），提取名称列表
 */
function parseNames(str) {
  if (!str) return "";
  // 不包含标记则原样返回（普通逗号分隔）
  if (!str.includes("[a=cr")) return str;
  // 提取所有 "name":"xxx" 字段
  const names = [];
  const regex = /"name"\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = regex.exec(str)) !== null) {
    names.push(m[1]);
  }
  return names.length > 0 ? names.join(" / ") : str;
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<p>/gi, "\n")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (m, c) => String.fromCharCode(c))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 40rpx;
  background: var(--bg-primary);
  min-height: 100vh;
}

.loading-placeholder {
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.loading-placeholder-text {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

.overlay-text {
  font-size: 28rpx;
  color: #ccc;
}

.overlay-detail {
  font-size: var(--text-sm);
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

/* 透明点击捕获层必须常驻，否则 video 原生控制层会吞掉 tap。 */
.player-tap-layer {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 18;
  background-color: rgba(0, 0, 0, 0.01);
}

/* 顶部自定义栏 */
.top-bar {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 36px;
  z-index: 20;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
  display: flex;
  align-items: center;
  padding: 0 12rpx;
}

.top-bar-back {
  position: absolute;
  left: 12rpx;
  top: 0;
  z-index: 22;
  width: 60rpx;
  height: 60rpx;
  line-height: 56rpx;
  text-align: center;
  font-size: 52rpx;
  color: #fff;
}

.mute-btn {
  position: absolute;
  left: 24rpx;
  bottom: 20rpx;
  z-index: 22;
  min-width: 88rpx;
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 16rpx;
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 24rpx;
  text-align: center;
}

.fullscreen-btn {
  position: absolute;
  right: 24rpx;
  bottom: 20rpx;
  z-index: 22;
  min-width: 88rpx;
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 16rpx;
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 24rpx;
  text-align: center;
}

.player-status-bar {
  width: 100%;
  flex-shrink: 0;
  background: #000;
}

/* 独立于原生 video 的倍速工具条，避免触摸事件被原生层吞掉。 */
.speed-toolbar {
  width: 100%;
  height: 72rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  background: #000;
}

.speed-btn {
  min-width: 88rpx;
  height: 52rpx;
  line-height: 52rpx;
  padding: 0 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.28);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
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
  color: #fe8027;
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
  min-width: 160rpx;
  padding: 14rpx 24rpx;
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
  text-align: center;
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
  color: #ffffff;
  text-align: center;
  min-width: 120rpx;

  &.active {
    background: $theme-accent;
    color: #ffffff;
    font-weight: 700;
  }
}

.sidebar-opt-txt {
  color: #ffffff;
  font-size: 26rpx;
}

.info-section {
  padding: 26rpx 20rpx 16rpx;
  background: var(--card);
  margin: 16rpx 12rpx;
  border-radius: 16rpx;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.vod-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  flex: 1;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-wide);
}

.fav-btn {
  padding: 8rpx;
  margin: -8rpx;
}

.tags {
  display: flex;
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
  flex-direction: column;
  gap: 12rpx;
  margin-top: 20rpx;
  padding: 16rpx 0 0;
  border-top: 1rpx solid var(--border);
  font-size: var(--text-base);
  .zy-row{
	  display: flex;
	  gap: 12rpx;
  }
}

.source-label {
  font-size: var(--text-base);
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

.section {
  padding: 0 10rpx;
  margin-top: 24rpx;

  &-header {
    display: flex;
    align-items: center;
    margin-bottom: 14rpx;
    gap: 12rpx;
  }

  &-title {
	font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    color: var(--text-primary);
  }
}

.ep-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.episodes {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding-left: 10rpx;
  max-height: 600rpx;
  overflow-y: auto;
}

.ep {
  padding: 16rpx 24rpx;
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
  font-size: var(--text-sm);
  margin-left: 10rpx;
}
</style>
