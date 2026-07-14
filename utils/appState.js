/**
 * 全局共享状态：订阅信息 + 站点数据
 * 我的设置订阅后，首页/搜索/详情共享这里的数据
 */
import { reactive } from 'vue'

const SUB_KEY = 'lyotv_sub_url'
const LIVE_SUB_KEY = 'lyotv_live_sub_url'

export const store = reactive({
  /** 当前点播订阅地址 */
  subUrl: uni.getStorageSync(SUB_KEY) || '',
  /** 当前直播订阅地址（独立于点播源） */
  liveSubUrl: uni.getStorageSync(LIVE_SUB_KEY) || '',
  /** 首页分类列表 */
  classes: [],
  /** 首页推荐列表 */
  homeList: [],
  /** 可搜索站点列表（[{key, name}]） */
  sites: [],
})

export function setSubUrl(url) {
  store.subUrl = url
  uni.setStorageSync(SUB_KEY, url)
}

export function setLiveSubUrl(url) {
  store.liveSubUrl = url
  uni.setStorageSync(LIVE_SUB_KEY, url)
}

export function updateHome(data) {
  store.classes = data["class"] || data.classes || []
  store.homeList = data.list || []
}

export function updateSites(list) {
  store.sites = list || []
}
