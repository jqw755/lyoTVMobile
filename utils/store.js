/**
 * 数据存储封装
 *
 * 核心规则：
 *   - 强制登录：未登录时收藏/历史返回空列表
 *   - 登录时：自动合并本地遗留数据到云端
 *   - 退出时：清空收藏/历史本地缓存，保留偏好/订阅源
 *   - 偏好设置：本地内存双缓存 + 防抖批量同步云端
 *   - 纯用户名登录：内部拼接 @lyo.tv 后缀适配 Supabase email 格式
 */
import { supabase } from '@/utils/supabase.js'

// 用户名转邮箱后缀（用户只需记自己的用户名）
const EMAIL_SUFFIX = '@lyo.tv'

const STORAGE_KEYS = {
  FAVORITES: 'lyotv_favorites',
  HISTORY: 'lyotv_history',
  SUB_HISTORY: 'lyotv_sub_history',
  SUB_URL: 'lyotv_sub_url',
}

// ==================== 认证 ====================

let _currentUser = null
let _profile = null
let _preferences = null       // 内存缓存（当前会话）
let _prefsDirty = false       // 是否有未同步的变更
let _prefsSyncTimer = null    // 防抖定时器

const PREFS_CACHE_KEY = 'lyotv_prefs_cache'

// ==================== 偏好设置：本地优先 + 批量云端同步 ====================
//
// 设计：
//   setSetting → 写内存 + 写本地缓存（即时）→ 标记 dirty → 30s 防抖后 batch 提交云端
//   getSetting → 读内存（启动时从本地缓存加载，登录后从云端覆盖）
//   触发刷新的时机：App 进入后台 (onHide)、退出登录、主动调 flushPreferences()
//

/**
 * App 启动时调用：从本地缓存加载偏好设置（未登录时也能用上次的偏好）
 */
export function loadLocalPreferences() {
  _loadLocalPreferences()
}

function _loadLocalPreferences() {
  try {
    const saved = uni.getStorageSync(PREFS_CACHE_KEY)
    if (saved) _preferences = saved
  } catch {
    // ignore
  }
}

function _saveLocalPreferences() {
  try {
    uni.setStorageSync(PREFS_CACHE_KEY, _preferences || {})
  } catch {
    // ignore
  }
}

async function _syncPreferencesToCloud() {
  if (!_currentUser || !_preferences || !_prefsDirty) return
  _prefsDirty = false
  try {
    await supabase
      .from('profiles')
      .update({ preferences: { ..._preferences } })
      .eq('id', _currentUser.id)
  } catch {
    // 同步失败 → 重新标记 dirty，下次重试
    _prefsDirty = true
  }
}

function _schedulePrefsSync() {
  if (_prefsSyncTimer) clearTimeout(_prefsSyncTimer)
  _prefsSyncTimer = setTimeout(() => {
    _prefsSyncTimer = null
    _syncPreferencesToCloud()
  }, 30000) // 30 秒防抖
}

/**
 * 立即将待同步的偏好设置提交到云端
 */
export async function flushPreferences() {
  if (_prefsSyncTimer) {
    clearTimeout(_prefsSyncTimer)
    _prefsSyncTimer = null
  }
  await _syncPreferencesToCloud()
}

/**
 * 获取偏好设置
 * 已登录 → 从内存缓存读取（登录时已从云端加载）
 * 未登录 → 返回默认值
 */
export function getSetting(key, defaultValue = null) {
  if (_preferences && typeof _preferences === 'object' && key in _preferences) {
    return _preferences[key]
  }
  return defaultValue
}

/**
 * 保存偏好设置
 * 本地优先：立即写内存 + 写本地缓存，后台防抖批量提交云端
 */
export async function setSetting(key, value) {
  if (!_preferences) _preferences = {}
  _preferences[key] = value
  _saveLocalPreferences()
  _prefsDirty = true
  _schedulePrefsSync()
}

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
      // 不清 _preferences：logout() 已显式处理缓存恢复
      // 被动登出（session 过期等）也应保留用户的偏好设定
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
    .select('nickname, avatar_url, preferences')
    .eq('id', _currentUser.id)
    .single()
  _profile = data || null
  _preferences = data?.preferences || {}
  _saveLocalPreferences() // 缓存到本地，下次启动秒回
  // 通知 App.vue 重新应用主题（登录后云端偏好已加载）
  uni.$emit('preferencesLoaded', _preferences)
}

/**
 * 登录 - 用户名+密码，内部转为 email 格式
 */
export async function login(username, password) {
  const email = username.trim() + EMAIL_SUFFIX
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw new Error(error.message)
  _currentUser = data.user
  await _loadProfile()
  // 登录成功：合并本地遗留数据到云端
  await _mergeLocalToCloud()
  // 然后缓存云端数据到本地
  await _cacheCloudDataLocally()
  return _currentUser
}

/**
 * 退出登录 → 先提交未同步的偏好 → 清空本地缓存 → 通知主题重置
 */
export async function logout() {
  // 先把偏好提交到云端
  await flushPreferences()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
  _currentUser = null
  _profile = null
  _clearLocalCache()
  // 从保留的磁盘缓存重新加载偏好（主题、列数等保持不变，不清用户的个人设置）
  _loadLocalPreferences()
  // 通知 App.vue 重新应用主题（此时 _preferences 已从缓存恢复）
  uni.$emit('preferencesLoaded', _preferences)
}

function _clearLocalCache() {
  try {
    // 退出时保留：订阅源历史、偏好缓存（下次启动未登录也能用上次设定）
    // 清空：收藏、历史（这些属于已登录用户的数据）
    const keep = [
      STORAGE_KEYS.SUB_URL,
      STORAGE_KEYS.SUB_HISTORY,
      PREFS_CACHE_KEY,
    ]
    const keys = uni.getStorageInfoSync().keys || []
    keys.forEach((k) => {
      if (!keep.includes(k)) uni.removeStorageSync(k)
    })
  } catch {
    // ignore
  }
}

/**
 * 更新用户资料
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

// ==================== 登录时：合并本地→云端 ====================

async function _mergeLocalToCloud() {
  if (!_currentUser) return

  // 合并收藏
  const localFavs = _getRawLocalFavorites()
  if (localFavs.length > 0) {
    for (const item of localFavs) {
      await supabase.from('favorites').upsert(
        {
          user_id: _currentUser.id,
          vod_id: item.vod_id,
          vod_name: item.vod_name || '',
          vod_pic: item.vod_pic || '',
          vod_remarks: item.vod_remarks || '',
          site_key: item.site_key || '',
          fav_time: item.fav_time || Date.now(),
        },
        { onConflict: 'user_id,vod_id', ignoreDuplicates: false }
      )
    }
  }

  // 合并历史
  const localHist = _getRawLocalHistory()
  if (localHist.length > 0) {
    for (const item of localHist) {
      const { data: existing } = await supabase
        .from('histories')
        .select('id')
        .eq('user_id', _currentUser.id)
        .eq('vod_id', item.vod_id)
        .eq('view_time', item.time || item.view_time || 0)
        .limit(1)
      if (!existing || existing.length === 0) {
        await supabase.from('histories').insert({
          user_id: _currentUser.id,
          vod_id: item.vod_id,
          vod_name: item.vod_name || '',
          vod_pic: item.vod_pic || '',
          vod_remarks: item.vod_remarks || '',
          site_key: item.site_key || '',
          episode: item.episode || '',
          progress: item.progress || 0,
          view_time: item.time || item.view_time || Date.now(),
        })
      }
    }
  }

  // 合并完后清空本地遗留数据（后续靠云端缓存）
  _setRawLocalFavorites([])
  _setRawLocalHistory([])
}

// ==================== 登录后：缓存云端数据到本地 ====================

async function _cacheCloudDataLocally() {
  if (!_currentUser) return
  try {
    const { data: favs } = await supabase
      .from('favorites')
      .select('*')
      .order('fav_time', { ascending: false })
    if (favs) _setRawLocalFavorites(favs)
  } catch {
    // ignore
  }
  try {
    const { data: hist } = await supabase
      .from('histories')
      .select('*')
      .order('view_time', { ascending: false })
    if (hist) _setRawLocalHistory(hist)
  } catch {
    // ignore
  }
}

// ==================== 收藏 ====================

function _getRawLocalFavorites() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.FAVORITES) || []
  } catch {
    return []
  }
}

function _setRawLocalFavorites(list) {
  try {
    uni.setStorageSync(STORAGE_KEYS.FAVORITES, list)
  } catch {
    // ignore
  }
}

/**
 * 获取收藏列表
 * 未登录 → 返回空数组
 * 已登录 → 从本地缓存读取（瞬间返回），后台静默刷新云端最新数据
 */
export async function getFavorites() {
  if (!_currentUser) return []

  // 先返回本地缓存（瞬间）
  const cached = _getRawLocalFavorites()
  if (cached.length > 0) {
    // 后台静默刷新
    _refreshFavoritesCache()
  }
  if (cached.length > 0) return cached

  // 无缓存则直接从云端拉
  return _refreshFavoritesCache()
}

async function _refreshFavoritesCache() {
  if (!_currentUser) return []
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('fav_time', { ascending: false })
    if (!error && data) {
      _setRawLocalFavorites(data)
      return data
    }
  } catch {
    // ignore
  }
  return _getRawLocalFavorites()
}

export async function addFavorite(vod) {
  if (!_currentUser) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return _getRawLocalFavorites()
  }

  const cached = _getRawLocalFavorites()
  if (cached.some((item) => item.vod_id === vod.vod_id)) return cached

  const favTime = Date.now()
  await supabase.from('favorites').insert({
    user_id: _currentUser.id,
    vod_id: vod.vod_id,
    vod_name: vod.vod_name || '',
    vod_pic: vod.vod_pic || '',
    vod_remarks: vod.vod_remarks || '',
    site_key: vod.site_key || '',
    fav_time: favTime,
  })

  // 更新本地缓存
  const updated = [{ vod_id: vod.vod_id, vod_name: vod.vod_name, vod_pic: vod.vod_pic, vod_remarks: vod.vod_remarks, site_key: vod.site_key, fav_time: favTime }, ...cached]
  _setRawLocalFavorites(updated)
  return updated
}

export async function removeFavorite(vodId) {
  if (_currentUser) {
    await supabase.from('favorites').delete().eq('user_id', _currentUser.id).eq('vod_id', vodId)
  }
  const updated = _getRawLocalFavorites().filter((item) => item.vod_id !== vodId)
  _setRawLocalFavorites(updated)
  return updated
}

export async function isFavorite(vodId) {
  if (!_currentUser) return false
  return _getRawLocalFavorites().some((item) => item.vod_id === vodId)
}

// ==================== 历史记录 ====================

function _getRawLocalHistory() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.HISTORY) || []
  } catch {
    return []
  }
}

function _setRawLocalHistory(list) {
  try {
    uni.setStorageSync(STORAGE_KEYS.HISTORY, list)
  } catch {
    // ignore
  }
}

export async function getHistory() {
  if (!_currentUser) return []

  const cached = _getRawLocalHistory()
  if (cached.length > 0) {
    _refreshHistoryCache()
  }
  if (cached.length > 0) return cached

  return _refreshHistoryCache()
}

async function _refreshHistoryCache() {
  if (!_currentUser) return []
  try {
    const { data, error } = await supabase
      .from('histories')
      .select('*')
      .order('view_time', { ascending: false })
    if (!error && data) {
      _setRawLocalHistory(data)
      return data
    }
  } catch {
    // ignore
  }
  return _getRawLocalHistory()
}

export async function addHistory(vod, episode = '', progress = 0) {
  if (!_currentUser) {
    // 未登录不存历史
    return []
  }

  const now = Date.now()

  // 云端 upsert
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
      vod_id: vod.vod_id,
      vod_name: vod.vod_name || '',
      vod_pic: vod.vod_pic || '',
      vod_remarks: vod.vod_remarks || '',
      site_key: vod.site_key || '',
      episode,
      progress,
      view_time: now,
    })
  }

  // 更新本地缓存
  let cached = _getRawLocalHistory()
  cached = cached.filter((item) => item.vod_id !== vod.vod_id)
  cached.unshift({
    vod_id: vod.vod_id,
    vod_name: vod.vod_name,
    vod_pic: vod.vod_pic,
    vod_remarks: vod.vod_remarks,
    site_key: vod.site_key || '',
    episode,
    progress,
    view_time: now,
    time: now,
  })
  _setRawLocalHistory(cached)
  return cached
}

export async function removeHistoryItem(vodId, viewTime) {
  if (_currentUser) {
    await supabase
      .from('histories')
      .delete()
      .eq('user_id', _currentUser.id)
      .eq('vod_id', vodId)
      .eq('view_time', viewTime)
  }
  const cached = _getRawLocalHistory().filter(
    (item) => !(item.vod_id === vodId && (item.view_time === viewTime || item.time === viewTime))
  )
  _setRawLocalHistory(cached)
  return cached
}

export async function clearHistory() {
  if (_currentUser) {
    await supabase.from('histories').delete().eq('user_id', _currentUser.id)
  }
  _setRawLocalHistory([])
  return []
}



// ==================== 订阅历史（始终本地，退出不清） ====================

export function getSubHistory() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.SUB_HISTORY) || []
  } catch {
    return []
  }
}

export function addSubHistory(url) {
  if (!url) return
  try {
    const list = getSubHistory().filter(item => item.url !== url)
    list.unshift({ url, time: Date.now() })
    uni.setStorageSync(STORAGE_KEYS.SUB_HISTORY, list)
  } catch {
    // ignore
  }
}

export function removeSubHistory(url) {
  try {
    const list = getSubHistory().filter(item => item.url !== url)
    uni.setStorageSync(STORAGE_KEYS.SUB_HISTORY, list)
  } catch {
    // ignore
  }
}
