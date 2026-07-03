<template>
  <view class="status-page" v-if="loading">
    <uni-icons type="spinner-cycle" size="36" color="#888" />
    <text class="status-text">加载中...</text>
  </view>
  <view class="status-page" v-else-if="error">
    <uni-icons type="closeempty" size="48" color="#888" />
    <text class="status-text">加载失败</text>
    <text class="retry-btn" @tap="loadDetail">点击重试</text>
  </view>
  <view class="page" v-else-if="vod">
    <!-- 播放器 -->
    <view class="player-area">
      <video
        v-if="playerReady"
        id="detail-player"
        :key="videoKey"
        :src="videoUrl"
        :autoplay="true"
        :muted="muted"
        :controls="true"
        :page-gesture="true"
        :show-mute-btn="true"
        :enable-progress-gesture="true"
        object-fit="contain"
        :poster="vod.vod_poster"
        :title="vod.vod_name"
        :enable-play-gesture="true"
        :vslide-gesture="true"
        :vslide-gesture-in-fullscreen="true"
        :http-cache="false"
        play-btn-position="center"
        :rate="playbackRate"
        style="width: 100%; height: 100%"
        @error="onVideoError"
      />
      <!-- 倍速切换按钮（仅在播放器就绪时显示） -->
      <view class="speed-btn" v-if="playerReady" @tap.stop="toggleSpeedMenu">
        <text class="speed-btn-text">{{ playbackRate }}x</text>
      </view>
      <!-- 倍速选择菜单 -->
      <view class="speed-menu" v-if="showSpeedMenu && playerReady">
        <view
          class="speed-option"
          v-for="s in speedOptions"
          :key="s"
          :class="{ active: playbackRate === s }"
          @tap.stop="setSpeed(s)"
        >
          <text>{{ s }}x</text>
        </view>
      </view>
      <view class="poster-overlay" v-if="!playerReady" @tap="playFirst">
        <view class="play-entry">
          <view class="play-icon-circle"
            ><uni-icons type="play-filled" size="48" color="#fff"
          /></view>
          <text class="play-hint">点击播放</text>
          <text class="resume-hint" v-if="savedEpisode"
            >继续播放：{{ savedEpisode }}</text
          >
        </view>
      </view>
    </view>

    <!-- 标题 -->
    <view class="info-section">
      <view class="title-row">
        <text class="vod-title">{{ vod.vod_name }}</text>
        <uni-icons
          :type="isFaved ? 'star-filled' : 'star'"
          :color="isFaved ? '#e74c3c' : '#888'"
          size="22"
          @tap="toggleFav"
        />
      </view>
      <view class="tags">
        <text class="tag status" v-if="vod.vod_remarks && vod.vod_remarks !== '0'">{{
          vod.vod_remarks
        }}</text>
        <text class="tag">{{ vod.vod_year }}</text
        ><text class="tag">{{ vod.vod_area }}</text>
        <text class="tag" v-if="vod.vod_director">{{ vod.vod_director }}</text>
      </view>
      <view class="source-row" v-if="flags.length > 0">
        <uni-icons type="flag" size="14" color="#888" /><text
          class="source-label"
        >
          站源：</text
        >
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
    </view>

    <!-- 选集 -->
    <view class="section" v-if="currentEpisodes.length > 0">
      <view class="section-header">
        <uni-icons type="list" size="16" color="#888" /><text
          class="section-title"
        >
          选集</text
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
          <uni-icons type="arrowdown" size="12" color="#e74c3c"
        /></text>
      </view>
    </view>
    <view class="section" v-if="vod.vod_content">
      <view class="section-header"
        ><uni-icons type="info" size="16" color="#888" /><text
          class="section-title"
        >
          简介</text
        ></view
      >
      <text class="content" :lines="expand ? 100 : 4" @tap="expand = !expand"
        >{{ stripHtml(vod.vod_content) }}<text class="expand-btn"
          ><uni-icons
            :type="expand ? 'arrowup' : 'arrowdown'"
            size="12"
            color="#e74c3c"
          />
          {{ expand ? "收起" : "展开" }}</text
        ></text
      >
    </view>
    <view class="section" v-if="vod.vod_actor">
      <view class="section-header"
        ><uni-icons type="person" size="16" color="#888" /><text
          class="section-title"
        >
          演员</text
        ></view
      >
      <text class="content">{{ vod.vod_actor }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { detail, player } from "@/utils/api.js";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  addHistory,
  getHistory,
  getSetting,
} from "@/utils/store.js";

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
const playerReady = ref(false);
const videoUrl = ref("");
const videoKey = ref(0);
const muted = ref(true);
const savedEpisode = ref("");
const savedProgress = ref(0);
const playbackRate = ref(1);
const showSpeedMenu = ref(false);
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
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
  playerReady.value = false;
});

async function loadDetail() {
  if (!pageId) return;
  loading.value = true;
  error.value = false;
  try {
    const data = await detail(pageId, pageKey);
    const item = data.list?.[0] || data.vod;
    if (!item || !item.vod_name) {
      error.value = true;
      return;
    }
    vod.value = item;
    uni.setNavigationBarTitle({ title: item.vod_name });
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
  } catch {
    error.value = true;
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

function playFirst() {
  playEpisode(currentIndex.value);
}
function switchFlag(f) {
  activeFlag.value = f;
  currentIndex.value = 0;
  showAll.value = false;
  savedEpisode.value = "";
  savedProgress.value = 0;
  if (playerReady.value) {
    playerReady.value = false;
    if (currentEpisodes.value.length > 0) setTimeout(() => playEpisode(0), 100);
  }
}

function playEpisode(index) {
  const ep = currentEpisodes.value[index];
  if (!ep) return;
  currentIndex.value = index;
  showAll.value = true;
  addHistory(vod.value, ep.name, 0);
  player(activeFlag.value, ep.url, pageKey)
    .then((data) => {
      const url = extractUrl(data.url) || ep.url || "";
      if (!url) {
        uni.showToast({ title: "未获取到播放地址", icon: "none" });
        return;
      }
      playerReady.value = false;
      setTimeout(() => {
        videoKey.value++;
        videoUrl.value = url;
        playerReady.value = true;
      }, 80);
    })
    .catch((e) => {
      uni.showToast({
        title: "播放失败: " + (e?.message || "未知"),
        icon: "none",
        duration: 3000,
      });
    });
}

function onVideoError() {
  uni.showToast({ title: "视频加载失败，请切换站源", icon: "none" });
}

function toggleSpeedMenu() {
  showSpeedMenu.value = !showSpeedMenu.value;
}

function setSpeed(s) {
  playbackRate.value = s;
  showSpeedMenu.value = false;
  uni.showToast({ title: s + 'x 倍速', icon: 'none' });
}
function toggleFav() {
  if (isFaved.value) {
    removeFavorite(vod.value.vod_id);
    isFaved.value = false;
    uni.showToast({ title: "已取消收藏", icon: "none" });
  } else {
    addFavorite(vod.value);
    isFaved.value = true;
    uni.showToast({ title: "已收藏", icon: "success" });
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
  color: $theme-text-secondary;
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
.poster-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
}

/* 倍速按钮 */
.speed-btn {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  z-index: 20;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 8rpx;
  padding: 6rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.speed-btn-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

/* 倍速选择菜单 */
.speed-menu {
  position: absolute;
  right: 20rpx;
  top: 68rpx;
  z-index: 20;
  background: rgba(30, 30, 30, 0.92);
  border-radius: 12rpx;
  padding: 8rpx 0;
  overflow: hidden;
  min-width: 120rpx;
}
.speed-option {
  padding: 14rpx 28rpx;
  text-align: center;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.15s;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: #fff;
    font-weight: 600;
  }
}
.play-entry {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}
.play-icon-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.play-hint {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}
.resume-hint {
  font-size: 22rpx;
  color: var(--accent);
  background: rgba(231, 76, 60, 0.2);
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
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
  font-size: 34rpx;
  font-weight: 700;
  color: $theme-text;
  flex: 1;
  line-height: 1.3;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 16rpx;
}
.tag {
  font-size: 22rpx;
  color: $theme-text-secondary;
  background: var(--card-hover);
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  &.status {
    color: var(--accent);
    background: rgba(231, 76, 60, 0.1);
    font-weight: 500;
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
  color: $theme-text-secondary;
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
  color: $theme-text-secondary;
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
    font-size: 28rpx;
    font-weight: 600;
    color: $theme-text;
  }
}
.ep-count {
  font-size: 24rpx;
  color: $theme-text-secondary;
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
  font-size: 24rpx;
  color: $theme-text;
  min-width: 96rpx;
  text-align: center;
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
    background: rgba(231, 76, 60, 0.08);
    min-width: auto;
  }
}
.content {
  font-size: 26rpx;
  color: $theme-text-secondary;
  line-height: 1.7;
  white-space: pre-wrap;
}
.expand-btn {
  color: var(--accent);
  font-size: 24rpx;
}
</style>
