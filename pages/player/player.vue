<template>
  <view class="player-page">
    <!-- MuiPlayer 容器 -->
    <view id="mui-player" class="player-container"></view>

    <!-- 加载状态 -->
    <view class="loading-overlay" v-if="loading">
      <uni-load-more status="loading" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { player } from '@/utils/api.js'
import { addHistory } from '@/utils/store.js'
import { getSetting } from '@/utils/store.js'
import MuiPlayer from 'mui-player'
import 'mui-player/dist/mui-player.min.css'

const SETTING_KEY = 'video_muted'

const loading = ref(true)
const pageFlag = ref('')
const pageId = ref('')
const pageName = ref('')
let mp = null

// 从设置读取默认静音状态
function getMutedSetting() {
  return getSetting(SETTING_KEY, true)
}

// 更新 MuiPlayer 的静音状态
function updateMuted(val) {
  if (!mp) return
  try {
    mp.muted = val
  } catch (e) {
    // 后备方案：重新设置 options
    try {
      mp.updateOptions({ muted: val })
    } catch {}
  }
}

onLoad((options) => {
  pageFlag.value = options?.flag || ''
  pageId.value = options?.id || ''
  pageName.value = options?.name || ''
  uni.setNavigationBarTitle({ title: pageName.value || '播放' })
})

onMounted(async () => {
  if (!pageId.value) return

  try {
    // 调用插件解析视频地址
    const data = await player(pageFlag.value, pageId.value)
    const videoUrl = data.url || pageId.value

    loading.value = false

    await nextTick()

    // 获取静音设置
    const mutedVal = getMutedSetting()

    // 初始化 MuiPlayer
    mp = new MuiPlayer({
      container: '#mui-player',
      src: videoUrl,
      title: pageName.value || '',
      autoplay: true,
      preload: 'auto',
      muted: mutedVal,
      width: '100%',
      height: '100%',
      poster: '',
      live: false,
      config: {
        // 控制栏自动隐藏
        autoHide: 3000,
        // 支持拖拽进度
        draggableProgress: true,
      },
    })

    // 添加播放记录
    addHistory({ vod_name: pageName.value }, pageName.value)

    // 监听全屏退出 - 返回上一页
    mp.on('fullscreenExit', () => {
      uni.navigateBack()
    })

    // 监听设置页发出的静音变更事件
    uni.$on('mutedChanged', (val) => {
      updateMuted(val)
    })
  } catch (e) {
    loading.value = false
    uni.showToast({ title: '播放地址解析失败', icon: 'none' })
  }
})

onBeforeUnmount(() => {
  // 移除事件监听
  uni.$off('mutedChanged')
  if (mp) {
    mp.destroy()
    mp = null
  }
})
</script>

<style lang="scss">
/* 不适用 scoped，MuiPlayer 需要全局样式穿透 */
.player-page {
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
  position: relative;
}

.player-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
}
</style>
