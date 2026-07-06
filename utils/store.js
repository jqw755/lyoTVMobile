/**
 * 数据存储封装
 *
 * 双模式：
 *   已登录 → 操作 Supabase 云端，同时缓存到本地
 *   未登录 → 纯本地存储（原逻辑不变）
 *
 * 导出的函数名相同，调用方无需关心模式差异。
 * 获取类函数统一返回 Promise。
 */
import { supabase } from '@/utils/supabase.js'

const STORAGE_KEYS = {
  FAVORITES: 'lyotv_favorites',
  HISTORY: 'lyotv_history',
  SETTINGS: 'lyotv_settings',
}

// ==================== 认证 ====================

let _currentUser = null
let _profile = null

/**
 * App 启动时调用，恢复登录态
 */
export async function initAuth() {
  const { data } = await supabase.auth.getSession()
  _currentUser = data?.session?.user || null
  if (_currentUser) {
    await _loadProfile()
  }
  // 监听登录态变化
  supabase.auth.onAuthStateChange(async (event, session) => {
    _currentUser = session?.user || null
    if (_currentUser) {
      await _loadProfile()
    } else {
      _profile = null
    }
  })
  return _currentUser
}

export function getCurrentUser() {
  return _currentUser
}

export function getProfile() {
  return _profile
}

async function _loadProfile() {
  if (!_currentUser) return
  const { data } = await supabase
    .from('profiles')
    .select('nickname, avatar_url')
    .eq('id', _currentUser.id)
    .single()
  _profile = data || null
}

export async function login(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password,
  })
  if (error) throw new Error(error.message)
  _currentUser = data.user
  await _loadProfile()
  return _currentUser
}

export async function register(nickname, username, password) {
  const { data, error } = await supabase.auth.signUp({
    email: username,
    password,
    options: { data: { nickname } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('注册失败，请重试')
  _currentUser = data.user
  // 创建用户扩展信息
  await supabase.from('profiles').insert({
    id: data.user.id,
    nickname: nickname || '',
    avatar_url: '',
  })
  await _loadProfile()
  return _currentUser
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
  _currentUser = null
  _profile = null
}

/**
 * 更新用户资料（昵称、头像等）
 */
export async function updateProfile(updates) {
  if (!_currentUser) throw new Error('未登录')
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', _currentUser.id)
  if (error) throw new Error(error.message)
  if (_profile) _profile = { ..._profile, ...updates }
  else _profile = updates
}

// ==================== 收藏（本地同步 + 云端） ====================

function getLocalFavorites() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.FAVORITES) || []
  } catch {
    return []
  }
}

function setLocalFavorites(list) {
  try {
    uni.setStorageSync(STORAGE_KEYS.FAVORITES, list)
  } catch {
    // 忽略
  }
}

/**
 * 获取收藏列表（已登录→云端，未登录→本地）
 */
export async function getFavorites() {
  if (_currentUser) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('fav_time', { ascending: false })
    if (!error && data) {
      // 缓存到本地
      setLocalFavorites(data)
      return data
    }
  }
  return getLocalFavorites()
}

/**
 * 添加收藏（已登录→同步云端，未登录→仅本地）
 */
export async function addFavorite(vod) {
  const localList = getLocalFavorites()
  // 去重
  if (localList.some((item) => item.vod_id === vod.vod_id)) return localList

  const favItem = { ...vod, fav_time: Date.now() }

  if (_currentUser) {
    // 云端写入
    const { error } = await supabase.from('favorites').insert({
      user_id: _currentUser.id,
      vod_id: vod.vod_id,
      vod_name: vod.vod_name || '',
      vod_pic: vod.vod_pic || '',
      vod_remarks: vod.vod_remarks || '',
      site_key: vod.site_key || '',
      fav_time: favItem.fav_time,
    })
    if (!error) {
      // 同步本地
      const updated = [favItem, ...localList]
      setLocalFavorites(updated)
      return updated
    }
  }
  // 本地降级
  const updated = [favItem, ...localList]
  setLocalFavorites(updated)
  return updated
}

/**
 * 移除收藏
 */
export async function removeFavorite(vodId) {
  if (_currentUser) {
    await supabase.from('favorites').delete().eq('user_id', _currentUser.id).eq('vod_id', vodId)
  }
  const updated = getLocalFavorites().filter((item) => item.vod_id !== vodId)
  setLocalFavorites(updated)
  return updated
}

/**
 * 检查是否已收藏
 */
export async function isFavorite(vodId) {
  if (_currentUser) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', _currentUser.id)
      .eq('vod_id', vodId)
      .maybeSingle()
    if (data) return true
  }
  return getLocalFavorites().some((item) => item.vod_id === vodId)
}

// ==================== 历史记录 ====================

function getLocalHistory() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.HISTORY) || []
  } catch {
    return []
  }
}

function setLocalHistory(list) {
  try {
    uni.setStorageSync(STORAGE_KEYS.HISTORY, list)
  } catch {
    // 忽略
  }
}

export async function getHistory() {
  if (_currentUser) {
    const { data, error } = await supabase
      .from('histories')
      .select('*')
      .order('view_time', { ascending: false })
    if (!error && data) {
      setLocalHistory(data)
      return data
    }
  }
  return getLocalHistory()
}

export async function addHistory(vod, episode = '', progress = 0) {
  const now = Date.now()
  const histItem = {
    vod_id: vod.vod_id,
    vod_name: vod.vod_name,
    vod_pic: vod.vod_pic,
    vod_remarks: vod.vod_remarks,
    site_key: vod.site_key || '',
    episode,
    progress,
    view_time: now,
  }

  if (_currentUser) {
    // 云端替换：同名影片保留最新一条
    const { data: existing } = await supabase
      .from('histories')
      .select('id')
      .eq('user_id', _currentUser.id)
      .eq('vod_id', vod.vod_id)
      .limit(1)
    if (existing && existing.length > 0) {
      await supabase
        .from('histories')
        .update({ episode, progress, view_time: now })
        .eq('id', existing[0].id)
    } else {
      await supabase.from('histories').insert({
        user_id: _currentUser.id,
        ...histItem,
      })
    }
  }

  // 本地替换
  let localList = getLocalHistory()
  localList = localList.filter((item) => item.vod_id !== vod.vod_id)
  localList.unshift({ ...histItem, time: now })
  setLocalHistory(localList)
  return localList
}

/**
 * 删除单条历史（按 vod_id + view_time 定位）
 */
export async function removeHistoryItem(vodId, viewTime) {
  if (_currentUser) {
    await supabase
      .from('histories')
      .delete()
      .eq('user_id', _currentUser.id)
      .eq('vod_id', vodId)
      .eq('view_time', viewTime)
  }
  const localList = getLocalHistory().filter(
    (item) => !(item.vod_id === vodId && item.time === viewTime)
  )
  setLocalHistory(localList)
  return localList
}

export async function clearHistory() {
  if (_currentUser) {
    await supabase.from('histories').delete().eq('user_id', _currentUser.id)
  }
  setLocalHistory([])
  return []
}

// ==================== 本地设置（始终存本地） ====================

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

// ==================== 订阅历史（始终存本地） ====================

const SUB_HISTORY_KEY = 'lyotv_sub_history'

export function getSubHistory() {
  try {
    return uni.getStorageSync(SUB_HISTORY_KEY) || []
  } catch {
    return []
  }
}

export function addSubHistory(url) {
  if (!url) return
  try {
    const list = getSubHistory().filter(item => item.url !== url)
    list.unshift({ url, time: Date.now() })
    uni.setStorageSync(SUB_HISTORY_KEY, list)
  } catch {
    // ignore
  }
}

export function removeSubHistory(url) {
  try {
    const list = getSubHistory().filter(item => item.url !== url)
    uni.setStorageSync(SUB_HISTORY_KEY, list)
  } catch {
    // ignore
  }
}
