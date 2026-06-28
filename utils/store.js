/**
 * 本地存储封装
 * 用于收藏、历史记录等数据的持久化
 */

const STORAGE_KEYS = {
  FAVORITES: 'lyotv_favorites',
  HISTORY: 'lyotv_history',
  SETTINGS: 'lyotv_settings',
}

// ===== 收藏 =====

export function getFavorites() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.FAVORITES) || []
  } catch {
    return []
  }
}

export function addFavorite(vod) {
  const list = getFavorites()
  if (list.some((item) => item.vod_id === vod.vod_id)) return list
  list.unshift({ ...vod, fav_time: Date.now() })
  uni.setStorageSync(STORAGE_KEYS.FAVORITES, list)
  return list
}

export function removeFavorite(vodId) {
  const list = getFavorites().filter((item) => item.vod_id !== vodId)
  uni.setStorageSync(STORAGE_KEYS.FAVORITES, list)
  return list
}

export function isFavorite(vodId) {
  return getFavorites().some((item) => item.vod_id === vodId)
}

// ===== 历史记录 =====

export function getHistory() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.HISTORY) || []
  } catch {
    return []
  }
}

export function addHistory(vod, episode = '', progress = 0) {
  let list = getHistory()
  list = list.filter((item) => item.vod_id !== vod.vod_id)
  list.unshift({
    vod_id: vod.vod_id,
    vod_name: vod.vod_name,
    vod_pic: vod.vod_pic,
    vod_remarks: vod.vod_remarks,
    episode,
    progress,
    time: Date.now(),
  })
  uni.setStorageSync(STORAGE_KEYS.HISTORY, list)
  return list
}

export function clearHistory() {
  uni.setStorageSync(STORAGE_KEYS.HISTORY, [])
  return []
}

// ===== 设置 =====

export function getSetting(key, defaultValue = null) {
  try {
    const settings = uni.getStorageSync(STORAGE_KEYS.SETTINGS) || {}
    return key in settings ? settings[key] : defaultValue
  } catch {
    return defaultValue
  }
}

export function setSetting(key, value) {
  try {
    const settings = uni.getStorageSync(STORAGE_KEYS.SETTINGS) || {}
    settings[key] = value
    uni.setStorageSync(STORAGE_KEYS.SETTINGS, settings)
  } catch {
    // ignore
  }
}
