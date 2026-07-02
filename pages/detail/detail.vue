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
        :enable-progress-gesture="true"
        object-fit="contain"
        style="width:100%;height:100%"
        @error="onVideoError"
      />
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

    <!-- 标题 -->
    <view class="info-section">
      <view class="title-row">
        <text class="vod-title">{{ vod.vod_name }}</text>
        <uni-icons :type="isFaved ? 'star-filled' : 'star'" :color="isFaved ? '#e74c3c' : '#888'" size="22" @tap="toggleFav" />
      </view>
      <view class="tags">
        <text class="tag status" v-if="vod.vod_remarks">{{ vod.vod_remarks }}</text>
        <text class="tag">{{ vod.vod_year }}</text>
        <text class="tag">{{ vod.vod_area }}</text>
        <text class="tag" v-if="vod.vod_director">{{ vod.vod_director }}</text>
      </view>
      <view class="source-row" v-if="flags.length > 0">
        <uni-icons type="flag" size="14" color="#888" />
        <text class="source-label"> 站源：</text>
        <scroll-view class="source-tabs" scroll-x show-scrollbar="false">
          <text v-for="f in flags" :key="f.flag" class="source-tab" :class="{ active: f.flag === activeFlag }" @tap="switchFlag(f.flag)">{{ f.flag }}</text>
        </scroll-view>
      </view>
    </view>

    <!-- 选集 -->
    <view class="section" v-if="currentEpisodes.length > 0">
      <view class="section-header">
        <uni-icons type="list" size="16" color="#888" />
        <text class="section-title"> 选集</text>
        <text class="ep-count">共 {{ currentEpisodes.length }} 集</text>
      </view>
      <view class="episodes">
        <text v-for="(ep,i) in displayEpisodes" :key="i" class="ep" :class="{ playing: i === playingIndex }" @tap="playEpisode(i)">{{ ep.name }}</text>
        <text v-if="currentEpisodes.length > COLLAPSE_LIMIT && !showAll" class="ep ep-more" @tap="showAll = true">展开 {{ currentEpisodes.length - COLLAPSE_LIMIT }} 集 <uni-icons type="arrowdown" size="12" color="#e74c3c" /></text>
      </view>
    </view>

    <!-- 简介 -->
    <view class="section" v-if="vod.vod_content">
      <view class="section-header"><uni-icons type="info" size="16" color="#888" /><text class="section-title"> 简介</text></view>
      <text class="content" :lines="expand ? 100 : 4" @tap="expand = !expand">{{ vod.vod_content }}<text class="expand-btn"><uni-icons :type="expand ? 'arrowup' : 'arrowdown'" size="12" color="#e74c3c" /> {{ expand ? '收起' : '展开' }}</text></text>
    </view>

    <!-- 演员 -->
    <view class="section" v-if="vod.vod_actor">
      <view class="section-header"><uni-icons type="person" size="16" color="#888" /><text class="section-title"> 演员</text></view>
      <text class="content">{{ vod.vod_actor }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { detail, player } from '@/utils/api.js'
import { getFavorites, addFavorite, removeFavorite, isFavorite, addHistory, getSetting } from '@/utils/store.js'

const COLLAPSE_LIMIT = 30

const vod = ref(null)
const flags = ref([])
const activeFlag = ref('')
const playingIndex = ref(-1)
const playerReady = ref(false)
const videoUrl = ref('')
const videoKey = ref(0)
const expand = ref(false)
const showAll = ref(false)
const isFaved = ref(false)
const loading = ref(false)
const error = ref(false)

const muted = ref(true)

let pageId = ''
let pageKey = ''

const currentEpisodes = computed(() => {
  const f = flags.value.find(f => f.flag === activeFlag.value)
  return f?.episodes || []
})

const displayEpisodes = computed(() => {
  if (showAll.value || currentEpisodes.value.length <= COLLAPSE_LIMIT) return currentEpisodes.value
  return currentEpisodes.value.slice(0, COLLAPSE_LIMIT)
})

onLoad(options => { pageId = options?.id || ''; pageKey = options?.key || '' })

async function loadDetail() {
  if (!pageId) return
  loading.value = true; error.value = false
  try {
    const data = await detail(pageId, pageKey)
    const item = data.list?.[0] || data.vod
    if (!item || !item.vod_name) { error.value = true; return }
    vod.value = item
    // 确保 site_key 存在（爬虫返回的详情数据可能不含 site_key，从 pageKey 补上）
    if (!vod.value.site_key && pageKey) vod.value.site_key = pageKey
    flags.value = item?.vodFlags || []
    if (flags.value.length > 0) activeFlag.value = flags.value[0].flag
    isFaved.value = isFavorite(pageId)
  } catch { error.value = true }
  finally { loading.value = false }
}

onMounted(() => {
  loadDetail()
  muted.value = getSetting('video_muted', true)
  uni.$on('mutedChanged', v => { muted.value = v })
})

onBeforeUnmount(() => {
  uni.$off('mutedChanged')
  playerReady.value = false
  videoUrl.value = ''
})

// 从 Result 的 Url 对象中提取真实视频地址
function extractUrl(urlField) {
  let raw = ''
  if (!urlField) return ''
  if (typeof urlField === 'string') raw = urlField
  else if (urlField.values && urlField.values.length > 0) {
    const pos = urlField.position || 0
    const idx = Math.min(pos, urlField.values.length - 1)
    raw = urlField.values[idx]?.v || urlField.values[0]?.v || ''
  }
  // 代理未启动时会返回 http://127.0.0.1:-1/proxy?... 格式，提取原始 URL 直接播放
  if (raw.includes('127.0.0.1:-1/proxy') || raw.includes('127.0.0.1:-1/img')) {
    const match = raw.match(/[?&]url=([^&]+)/)
    if (match) {
      try { raw = decodeURIComponent(match[1]) } catch { raw = match[1] }
    }
  }
  return raw
}

function playFirst() {
  if (currentEpisodes.value.length > 0) playEpisode(0)
}

function switchFlag(flag) {
  activeFlag.value = flag
  playingIndex.value = -1
  showAll.value = false
  playerReady.value = false
  videoUrl.value = ''
}

function playEpisode(index) {
  const ep = currentEpisodes.value[index]
  if (!ep) return
  playingIndex.value = index
  showAll.value = true
  addHistory(vod.value, ep.name)

  player(activeFlag.value, ep.url, pageKey).then(data => {
    const playUrl = extractUrl(data.url)
    if (!playUrl) return
    playerReady.value = false
    setTimeout(() => {
      videoKey.value++
      videoUrl.value = playUrl
      playerReady.value = true
    }, 50)
  }).catch(() => {})
}

function onVideoError(e) {
  debugInfo.value += '\nVIDEO_ERROR: ' + JSON.stringify(e.detail)
}

function copyDebug() {
  uni.setClipboardData({ data: debugInfo.value })
  uni.showToast({ title: '已复制', icon: 'success', duration: 1500 })
}

function toggleFav() {
  if (isFaved.value) { removeFavorite(vod.value.vod_id); isFaved.value = false; uni.showToast({ title: '已取消收藏', icon: 'none' }) }
  else { addFavorite(vod.value); isFaved.value = true; uni.showToast({ title: '已收藏', icon: 'success' }) }
}
</script>

<style lang="scss" scoped>
.page { padding-bottom: 40rpx; background: var(--bg-primary); }
.status-page { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20rpx; background: var(--bg-primary); }
.status-text { font-size: 28rpx; color: $theme-text-secondary; }
.retry-btn { font-size: 26rpx; color: $theme-accent; padding: 12rpx 40rpx; border: 1rpx solid $theme-accent; border-radius: 30rpx; margin-top: 10rpx; }
.retry-btn:active { opacity: 0.7; }

.player-area { position: relative; width: 100%; height: 460rpx; background: #000; overflow: hidden; }

.poster-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10; }
.poster-bg { position: absolute; inset: 0; width: 100%; height: 460rpx; filter: blur(30rpx); opacity: 0.4; }
.poster-gradient { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%); }
.poster-info { position: absolute; bottom: 80rpx; left: 20rpx; right: 20rpx; display: flex; gap: 20rpx; align-items: flex-end; z-index: 2; }
.poster-cover { width: 180rpx; height: 250rpx; border-radius: 12rpx; flex-shrink: 0; }
.poster-meta { flex: 1; padding-bottom: 8rpx; }
.poster-title { font-size: 34rpx; font-weight: 700; color: #fff; display: block; }
.poster-sub { font-size: 24rpx; color: rgba(255,255,255,0.7); margin-top: 8rpx; display: block; }
.play-icon { position: absolute; z-index: 3; width: 100rpx; height: 100rpx; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }

.info-section { padding: 20rpx; }
.title-row { display: flex; align-items: center; justify-content: space-between; }
.vod-title { font-size: 34rpx; font-weight: 700; color: $theme-text; flex: 1; }
.tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 16rpx; }
.tag { font-size: 22rpx; color: $theme-text-secondary; background: $theme-card; padding: 4rpx 14rpx; border-radius: 6rpx;
  &.status { color: $theme-accent; background: rgba($theme-accent,0.12); }
}
.source-row { display: flex; align-items: center; gap: 12rpx; margin-top: 20rpx; }
.source-label { font-size: 24rpx; color: $theme-text-secondary; flex-shrink: 0; }
.source-tabs { display: flex; flex-direction: row; white-space: nowrap; overflow: hidden; }
.source-tab { display: inline-flex; padding: 8rpx 24rpx; margin-right: 12rpx; border-radius: 30rpx; background: $theme-card; font-size: 24rpx; color: $theme-text-secondary;
  &.active { background: $theme-accent; color: #fff; }
}

.debug-section { background: #2d2d10; border: 2rpx solid #665500; border-radius: 8rpx; padding: 16rpx; margin: 8rpx 20rpx; }
.debug-text { font-size: 22rpx; color: #fff; font-family: monospace; white-space: pre-wrap; word-break: break-all; line-height: 1.6; }
.debug-action { font-size: 22rpx; color: #ff0; padding: 4rpx 16rpx; }

.section { padding: 0 20rpx; margin-top: 24rpx;
  &-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14rpx; }
  &-title { font-size: 30rpx; font-weight: 600; color: $theme-text; }
}
.ep-count { font-size: 24rpx; color: $theme-text-secondary; }
.episodes { display: flex; flex-wrap: wrap; gap: 12rpx; }
.ep { padding: 12rpx 28rpx; border-radius: 8rpx; background: $theme-card; font-size: 24rpx; color: $theme-text; min-width: 100rpx; text-align: center;
  &.playing { background: $theme-accent; color: #fff; }
  &:active { opacity: 0.7; }
  &.ep-more { color: $theme-accent; background: rgba($theme-accent,0.1); min-width: auto; }
}
.content { font-size: 26rpx; color: $theme-text-secondary; line-height: 1.7; }
.expand-btn { color: $theme-accent; font-size: 24rpx; }
</style>
