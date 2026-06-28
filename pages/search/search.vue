<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input">
        <uni-icons type="search" size="18" color="#888" />
        <input
          v-model="keyword"
          placeholder="搜影视、演员..."
          placeholder-class="placeholder"
          confirm-type="search"
          @confirm="doSearch"
          @input="onInput"
        />
        <text v-if="keyword" class="clear" @tap="keyword = ''">✕</text>
      </view>
    </view>

    <!-- 搜索历史 -->
    <view class="section" v-if="!searched && historyTags.length > 0">
      <view class="section-header">
        <uni-icons type="clock" size="14" color="#888" />
        <text class="section-title"> 搜索历史</text>
        <view class="clear-btn" @tap="clearHistory">
          <uni-icons type="trash" size="14" color="#888" />
          <text style="margin-left:4rpx">清空</text>
        </view>
      </view>
      <view class="tags">
        <text
          v-for="(tag, i) in historyTags"
          :key="i"
          class="tag"
          @tap="tapHistory(tag)"
        >{{ tag }}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="result-list" v-else>
      <view
        class="result-item"
        v-for="item in resultList"
        :key="item.vod_id"
        @tap="goDetail(item)"
      >
        <image class="thumb" :src="item.vod_pic" mode="aspectFill" />
        <view class="info">
          <text class="title" :lines="1">{{ item.vod_name }}</text>
          <text class="desc" :lines="2">
            {{ item.vod_remarks }} · {{ item.vod_year }} · {{ item.vod_area }}
          </text>
          <text class="type-tag">{{ item.type_name }}</text>
        </view>
      </view>

      <uni-load-more
        v-if="resultList.length > 0"
        :status="loadStatus"
      />
      <view v-if="searched && resultList.length === 0" class="empty">
        <uni-icons type="search" size="32" color="#555" />
        <text>未找到 "{{ lastKeyword }}" 相关结果</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { search } from '@/utils/api.js'
import { addHistory } from '@/utils/store.js'

const keyword = ref('')
const lastKeyword = ref('')
const resultList = ref([])
const searched = ref(false)
const loadStatus = ref('more')
const historyTags = ref([])

// 加载搜索历史
try {
  historyTags.value = uni.getStorageSync('lyotv_search_history') || []
} catch {}

function saveHistory(kw) {
  if (!kw) return
  let list = [kw, ...historyTags.value.filter((t) => t !== kw)].slice(0, 10)
  historyTags.value = list
  uni.setStorageSync('lyotv_search_history', list)
}

function tapHistory(kw) {
  keyword.value = kw
  doSearch()
}

function clearHistory() {
  historyTags.value = []
  uni.setStorageSync('lyotv_search_history', [])
}

let timer = null
function onInput() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (keyword.value.trim()) doSearch()
  }, 500)
}

async function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  lastKeyword.value = kw
  searched.value = true
  saveHistory(kw)
  try {
    const data = await search(kw)
    resultList.value = data.list || []
  } catch {
    resultList.value = []
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
  background: var(--page-bg);
}

.search-bar {
  padding: 16rpx 20rpx;
  background: var(--page-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: var(--card);
  border-radius: 40rpx;
  padding: 16rpx 24rpx;

  input {
    flex: 1;
    font-size: 28rpx;
    color: $theme-text;
  }

  .placeholder {
    color: $theme-text-secondary;
    font-size: 28rpx;
  }

  .clear {
    color: $theme-text-secondary;
    font-size: 28rpx;
    padding: 0 8rpx;
  }
}

.section {
  padding: 0 20rpx;
  margin-top: 16rpx;

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  &-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $theme-text;
  }

  .clear-btn {
    font-size: 24rpx;
    color: $theme-text-secondary;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

  .tag {
    background: var(--card);
    color: var(--text-secondary);
    font-size: 24rpx;
    padding: 10rpx 24rpx;
    border-radius: 30rpx;
  }
}

.result-list {
  padding: 0 20rpx;
}

.result-item {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $theme-border;

  .thumb {
    width: 160rpx;
    height: 220rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
    background: $theme-card-hover;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--text);
  }

  .desc {
    font-size: 24rpx;
    color: $theme-text-secondary;
    line-height: 1.5;
  }

  .type-tag {
    font-size: 22rpx;
    color: $theme-accent;
    background: rgba($theme-accent, 0.12);
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
    align-self: flex-start;
  }
}

.empty {
  text-align: center;
  padding: 80rpx 0;
  color: $theme-text-secondary;
  font-size: 28rpx;
}
</style>
