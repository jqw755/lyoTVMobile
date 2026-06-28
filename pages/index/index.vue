<template>
  <view class="page">
    <!-- 分类导航（含"推荐"前置tab） -->
    <category-nav
      :list="tabList"
      :activeId="activeTid"
      @change="onCategoryChange"
    />

    <!-- 影视列表 -->
    <view class="section">
      <view class="grid" :style="gridStyle">
        <view
          class="grid-item"
          v-for="item in list"
          :key="item.vod_id"
          @tap="goDetail(item)"
        >
          <vod-card :item="item" />
        </view>
      </view>
    </view>

    <!-- 加载更多 / 结尾 -->
    <view v-if="list.length > 0" class="load-more">
      <uni-icons type="more" size="14" color="#555" />
      <text class="load-text"> 没有更多了</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { home, category } from '@/utils/api.js'
import { addHistory } from '@/utils/store.js'
import { store, updateHome } from '@/utils/appState.js'
import CategoryNav from '@/components/category-nav.vue'
import VodCard from '@/components/vod-card.vue'

/** 前置"推荐"tab（type_id 为空字符串表示首页推荐） */
const RECOMMEND_TAB = { type_id: '', type_name: '推荐' }

const classes = ref(store.classes)
const list = ref(store.homeList)
const activeTid = ref('')
const page = ref(1)

/** 图片尺寸设置：large=3列，medium=4列，small=5列 */
const imageSize = ref('medium')
try {
  const saved = uni.getStorageSync('lyotv_image_size')
  if (saved) imageSize.value = saved
} catch {}

const gridStyle = computed(() => {
  const config = {
    large: { cols: 3, gap: '16rpx' },
    medium: { cols: 4, gap: '12rpx' },
    small: { cols: 5, gap: '10rpx' },
  }
  const c = config[imageSize.value] || config.medium
  return {
    gridTemplateColumns: `repeat(${c.cols}, 1fr)`,
    gap: c.gap,
  }
})

/** 在原始分类前插入"推荐"tab */
const tabList = computed(() => [RECOMMEND_TAB, ...classes.value])

// 订阅状态变化时同步更新
watch(() => store.classes, (v) => { classes.value = v }, { immediate: true })
watch(() => store.homeList, (v) => {
  // 只有当前在推荐tab时才更新显示
  if (activeTid.value === '') list.value = v
}, { immediate: true })

onMounted(async () => {
  // 已有缓存数据则直接显示
  if (store.homeList.length > 0) {
    list.value = store.homeList
    return
  }
  try {
    const data = await home()
    classes.value = data["class"] || data.classes || []
    list.value = data.list || []
    updateHome(data)
    activeTid.value = ''
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})

async function onCategoryChange(item) {
  activeTid.value = item.type_id
  page.value = 1

  // "推荐"tab → 显示首页列表（已缓存）
  if (item.type_id === '') {
    list.value = store.homeList
    return
  }

  // 其他分类 → 调 API 获取
  try {
    const data = await category(item.type_id, 1)
    list.value = data.list || []
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function goDetail(item) {
  addHistory(item)
  uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: 12rpx;
  background: var(--page-bg);
}

.section {
  padding: 0 16rpx;
}

.grid {
  display: grid;
}

.load-more {
  padding: 36rpx 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.load-more::before,
.load-more::after {
  content: '';
  width: 60rpx;
  height: 1rpx;
  background: #333;
}

.load-text {
  font-size: 22rpx;
  color: #555;
}
</style>
