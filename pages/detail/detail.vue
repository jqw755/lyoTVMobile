<template>
  <view class="page" v-if="vod">
    <!-- 顶部播放器区域 -->
    <view class="player-area">
      <view id="detail-player" class="mui-player-container" v-if="playerReady"></view>

      <!-- 未播放时显示封面 -->
      <view class="poster-overlay" v-if="!playerReady" @tap="playFirst">
        <image class="poster-bg" :src="vod.vod_pic" mode="aspectFill" />
        <view class="poster-gradient" />
        <view class="poster-info">
          <image class="poster-cover" :src="vod.vod_pic" mode="aspectFill" />
          <view class="poster-meta">
            <text class="poster-title">{{ vod.vod_name }}</text>
            <text class="poster-sub" v-if="vod.vod_remarks">{{ vod.vod_remarks }}</text>
          </view>
        </view>
        <view class="play-icon">
          <uni-icons type="play-filled" size="60" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 标题区 -->
    <view class="info-section">
      <view class="title-row">
        <text class="vod-title">{{ vod.vod_name }}</text>
        <view class="title-actions">
          <uni-icons
            :type="isFaved ? 'star-filled' : 'star'"
            :color="isFaved ? '#e74c3c' : '#888'"
            size="22"
            @tap="toggleFav"
          />
        </view>
      </view>
      <view class="tags">
        <text class="tag status" v-if="vod.vod_remarks">{{ vod.vod_remarks }}</text>
        <text class="tag">{{ vod.vod_year }}</text>
        <text class="tag">{{ vod.vod_area }}</text>
        <text class="tag" v-if="vod.vod_director">{{ vod.vod_director }}</text>
      </view>

      <!-- 站源切换 -->
      <view class="source-row" v-if="flags.length > 0">
        <uni-icons type="flag" size="14" color="#888" />
        <text class="source-label"> 站源：</text>
        <scroll-view class="source-tabs" scroll-x show-scrollbar="false">
          <text
            v-for="f in flags"
            :key="f.flag"
            class="source-tab"
            :class="{ active: f.flag === activeFlag }"
            @tap="switchFlag(f.flag)"
          >{{ f.flag }}</text>
        </scroll-view>
      </view>
    </view>

    <!-- 选集区 -->
    <view class="section" v-if="currentEpisodes.length > 0">
      <view class="section-header">
        <uni-icons type="list" size="16" color="#888" />
        <text class="section-title"> 选集</text>
        <text class="ep-count">共 {{ currentEpisodes.length }} 集</text>
      </view>
      <view class="episodes">
        <text
          v-for="(ep, i) in displayEpisodes"
          :key="i"
          class="ep"
          :class="{ playing: i === playingIndex }"
          @tap="playEpisode(i)"
        >{{ ep.name }}</text>
        <text
          v-if="currentEpisodes.length > COLLAPSE_LIMIT && !showAll"
          class="ep ep-more"
          @tap="showAll = true"
        >展开 {{ currentEpisodes.length - COLLAPSE_LIMIT }} 集 <uni-icons type="arrowdown" size="12" color="#e74c3c" /></text>
      </view>
      <!-- 集切换导航 -->
      <view class="player-nav" v-if="playingIndex >= 0">
        <view class="nav-btn" @tap="prevEpisode">
          <uni-icons type="arrowleft" size="20" color="#fff" />
        </view>
        <text class="nav-label">{{ playingIndex + 1 }}/{{ currentEpisodes.length }}</text>
        <view class="nav-btn" @tap="nextEpisode">
          <uni-icons type="arrowright" size="20" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 简介 -->
    <view class="section" v-if="vod.vod_content">
      <view class="section-header">
        <uni-icons type="info" size="16" color="#888" />
        <text class="section-title"> 简介</text>
      </view>
      <text class="content" :lines="expand ? 100 : 4" @tap="expand = !expand">
        {{ vod.vod_content }}
        <text class="expand-btn">
          <uni-icons :type="expand ? 'arrowup' : 'arrowdown'" size="12" color="#e74c3c" />
          {{ expand ? '收起' : '展开' }}
        </text>
      </text>
    </view>

    <!-- 演员 -->
    <view class="section" v-if="vod.vod_actor">
      <view class="section-header">
        <uni-icons type="person" size="16" color="#888" />
        <text class="section-title"> 演员</text>
      </view>
      <text class="content">{{ vod.vod_actor }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { detail, player } from '@/utils/api.js'
import { getFavorites, addFavorite, removeFavorite, isFavorite, addHistory } from '@/utils/store.js'
import MuiPlayer from 'mui-player'
import 'mui-player/dist/mui-player.min.css'

const COLLAPSE_LIMIT = 30

const vod = ref(null)
const flags = ref([])
const activeFlag = ref('')
const playingIndex = ref(-1)
const playerReady = ref(false)
const expand = ref(false)
const showAll = ref(false)
const isFaved = ref(false)

let pageId = ''
let mp = null

const currentEpisodes = computed(() => {
  const f = flags.value.find((f) => f.flag === activeFlag.value)
  return f?.episodes || []
})

const displayEpisodes = computed(() => {
  if (showAll.value || currentEpisodes.value.length <= COLLAPSE_LIMIT) {
    return currentEpisodes.value
  }
  return currentEpisodes.value.slice(0, COLLAPSE_LIMIT)
})

onLoad((options) => {
  pageId = options?.id || ''
})

onMounted(async () => {
  if (!pageId) return
  try {
    const data = await detail(pageId)
    vod.value = data.vod
    flags.value = data.vod?.flags || []
    if (flags.value.length > 0) {
      activeFlag.value = flags.value[0].flag
    }
    isFaved.value = isFavorite(pageId)
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})

onBeforeUnmount(() => {
  destroyPlayer()
})

function destroyPlayer() {
  if (mp) {
    mp.destroy()
    mp = null
  }
}

function initPlayer(url, title) {
  destroyPlayer()
  playerReady.value = true
  nextTick(() => {
    mp = new MuiPlayer({
      container: '#detail-player',
      src: url,
      title: title || '',
      autoplay: true,
      preload: 'auto',
      muted: false,
      width: '100%',
      height: '100%',
      poster: '',
      live: false,
      config: {
        autoHide: 3000,
        draggableProgress: true,
      },
    })
    // 滚动到播放器
    uni.pageScrollTo({ selector: '.player-area', duration: 300 })
  })
}

function playFirst() {
  if (currentEpisodes.value.length > 0) {
    playEpisode(0)
  }
}

function switchFlag(flag) {
  activeFlag.value = flag
  playingIndex.value = -1
  showAll.value = false
  destroyPlayer()
  playerReady.value = false
}

async function playEpisode(index) {
  const ep = currentEpisodes.value[index]
  if (!ep) return
  playingIndex.value = index
  showAll.value = true
  addHistory(vod.value, ep.name)

  let videoUrl = ep.url
  try {
    const data = await player(activeFlag.value, ep.url)
    videoUrl = data.url || ep.url
  } catch {
    // 使用原始地址
  }

  initPlayer(videoUrl, vod.value?.vod_name)
}

function prevEpisode() {
  if (playingIndex.value > 0) {
    playEpisode(playingIndex.value - 1)
  }
}

function nextEpisode() {
  if (playingIndex.value < currentEpisodes.value.length - 1) {
    playEpisode(playingIndex.value + 1)
  }
}

function toggleFav() {
  if (isFaved.value) {
    removeFavorite(vod.value.vod_id)
    isFaved.value = false
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } else {
    addFavorite(vod.value)
    isFaved.value = true
    uni.showToast({ title: '已收藏', icon: 'success' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 40rpx;
  background: var(--page-bg);
}

/* ===== 播放器 ===== */
.player-area {
  position: relative;
  width: 100%;
  height: 460rpx;
  background: #000;
  overflow: hidden;
}

.mui-player-container {
  width: 100%;
  height: 100%;
}

/* ===== 封面覆盖层 ===== */
.poster-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.poster-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 460rpx;
  filter: blur(30rpx);
  opacity: 0.4;
}

.poster-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%);
}

.poster-info {
  position: absolute;
  bottom: 80rpx;
  left: 20rpx;
  right: 20rpx;
  display: flex;
  gap: 20rpx;
  align-items: flex-end;
  z-index: 2;
}

.poster-cover {
  width: 180rpx;
  height: 250rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.poster-meta {
  flex: 1;
  padding-bottom: 8rpx;
}

.poster-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  display: block;
}

.poster-sub {
  font-size: 24rpx;
  color: rgba(255,255,255,0.7);
  margin-top: 8rpx;
  display: block;
}

.play-icon {
  position: absolute;
  z-index: 3;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  margin-top: 20rpx;
}

.nav-label {
  font-size: 24rpx;
  color: $theme-text-secondary;
}

.nav-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #fff;

  &.play-btn {
    width: 80rpx;
    height: 80rpx;
    font-size: 40rpx;
    background: rgba(255,255,255,0.3);
  }
}

/* ===== 信息区 ===== */
.info-section {
  padding: 20rpx;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vod-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $theme-text;
  flex: 1;
}

.title-actions {
  padding: 8rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.tag {
  font-size: 22rpx;
  color: $theme-text-secondary;
  background: $theme-card;
  padding: 4rpx 14rpx;
  border-radius: 6rpx;

  &.status {
    color: $theme-accent;
    background: rgba($theme-accent, 0.12);
  }
}

.source-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 20rpx;
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
  padding: 8rpx 24rpx;
  margin-right: 12rpx;
  border-radius: 30rpx;
  background: $theme-card;
  font-size: 24rpx;
  color: $theme-text-secondary;

  &.active {
    background: $theme-accent;
    color: #fff;
  }
}

/* ===== 选集 ===== */
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
    font-size: 30rpx;
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
  gap: 12rpx;
}

.ep {
  padding: 12rpx 28rpx;
  border-radius: 8rpx;
  background: $theme-card;
  font-size: 24rpx;
  color: $theme-text;
  min-width: 100rpx;
  text-align: center;

  &.playing {
    background: $theme-accent;
    color: #fff;
  }

  &:active {
    opacity: 0.7;
  }

  &.ep-more {
    color: $theme-accent;
    background: rgba($theme-accent, 0.1);
    min-width: auto;
  }
}

/* ===== 简介 ===== */
.content {
  font-size: 26rpx;
  color: $theme-text-secondary;
  line-height: 1.7;
}

.expand-btn {
  color: $theme-accent;
  font-size: 24rpx;
}
</style>
