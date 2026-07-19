/**
 * 数据存储封装
 *
 * 核心规则：
 *   - 收藏：即时云端读写，不存本地
 *   - 观看历史：纯本地存储，不走云端
 *   - 登录时：自动合并本地订阅历史到云端（无收藏/历史遗留数据）
 *   - 退出时：清空本地历史缓存，保留偏好/订阅源
 *   - 偏好设置：本地内存双缓存 + 防抖批量同步云端
 *   - 纯用户名登录：内部拼接 @lyo.tv 后缀适配 Supabase email 格式
 */
import { supabase } from '@/utils/supabase.js'

// 用户名转邮箱后缀（用户只需记自己的用户名）
const EMAIL_SUFFIX = '@lyo.tv'

const STORAGE_KEYS = {
  HISTORY: 'lyotv_history',
  SUB_HISTORY: 'lyotv_sub_history',
  LIVE_SUB_HISTORY: 'lyotv_live_sub_history',
  SUB_URL: 'lyotv_sub_url',
  PROFILE_CACHE: 'lyotv_profile_cache', // 用户资料本地缓存：减云端调用，token失效/退出/重登才拉云端
}

// ==================== 认证 ====================

let _currentUser = null
let _profile = null
let _preferences = null       // 内存缓存（当前会话）
let _prefsDirty = false       // 是否有未同步的变更
let _prefsSyncTimer = null    // 防抖定时器
let _loginInProgress = false  // 登录中标记，避免 onAuthStateChange 重复拉取

const PREFS_CACHE_KEY = 'lyotv_prefs_cache'

// ==================== 偏好设置：本地优先 + 批量云端同步 ====================
//
// 设计：
//   setSetting → 写内存 + 写本地缓存（即时）→ 标记 dirty → 30s 防抖后 batch 提交云端
//   getSetting → 读内存（启动时从本地缓存加载，登录后从云端覆盖）
//   触发刷新的时机：App 进入后台 (onHide)、退出登录、主动调 flushPreferences()
//

/**
 * 从本地缓存加载偏好设置（未登录时也能用上次的偏好）
 *
 * 关键时序：必须在任何页面 onMounted 之前同步执行。
 * uni-app 中各 tab 页的 onLoad/onMounted 与 App 的 onMounted 触发顺序
 * 不保证 App 在前，若放在 App.onMounted 里调用，页面读 getSetting 时
 * _preferences 仍是 null，会拿到默认值而非用户上次设置。
 * 因此这里在模块加载时（store.js 被 import 时）同步从 storage 读取，
 * 保证页面 onMounted 调用 getSetting 时已有正确值。
 */
export function loadLocalPreferences() {
  _loadLocalPreferences()
}

function _loadLocalPreferences() {
  try {
    const saved = uni.getStorageSync(PREFS_CACHE_KEY)
    if (saved && typeof saved === 'object') _preferences = saved
  } catch {
    // ignore
  }
}

// 模块加载时同步预热偏好缓存，保证页面 onMounted 之前 _preferences 已填充。
loadLocalPreferences()

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

 // ==================== 用户资料：本地优先 + 批量云端同步 ====================

 let _profileDirty = false
 let _profilePendingUpdates = {}
 let _profileSyncTimer = null
 const PROFILE_SYNC_DELAY = 30000

 function _markProfileDirty(updates) {
   Object.assign(_profilePendingUpdates, updates)
   _profileDirty = true
   if (_profileSyncTimer) clearTimeout(_profileSyncTimer)
   _profileSyncTimer = setTimeout(() => _syncProfileToCloud(), PROFILE_SYNC_DELAY)
 }

 async function _syncProfileToCloud() {
   if (!_currentUser || !_profileDirty) return
   _profileSyncTimer = null

   const updates = { ..._profilePendingUpdates }
   try {
     await supabase.from('profiles').update(updates).eq('id', _currentUser.id)
     // 成功才清除待同步状态
     _profileDirty = false
     _profilePendingUpdates = {}
   } catch {
     // 失败保留 dirty + pending，等待下次重试
   }
 }

 /**
  * 立即将待同步的用户资料提交到云端
  */
 export function flushProfile() {
   if (_profileDirty) {
     if (_profileSyncTimer) clearTimeout(_profileSyncTimer)
     _profileSyncTimer = null
     return _syncProfileToCloud()
   }
 }

/**
 * App 启动时调用，恢复登录态
 */
export async function initAuth() {
  const { data } = await supabase.auth.getSession()
  _currentUser = data?.session?.user || null
  if (_currentUser) {
    // 优先用本地 profile 缓存（减云端调用），无缓存才拉云端
    if (!_loadProfileFromCache()) {
      await _loadProfile()
    }
  }
  // 监听登录态变化：仅 SIGNED_IN/SIGNED_OUT 处理，TOKEN_REFRESHED 等用本地缓存
  supabase.auth.onAuthStateChange(async (event, session) => {
    _currentUser = session?.user || null
    if (event === 'SIGNED_IN') {
      // login() 已显式调用 _loadProfile()，这里跳过避免重复
      if (!_loginInProgress) {
        await _loadProfile()
      }
      _loginInProgress = false
    } else if (event === 'SIGNED_OUT') {
      _profile = null
      _clearProfileCache()
      // 不清 _preferences：logout() 已显式处理缓存恢复
      // 被动登出（session 过期等）也应保留用户的偏好设定
    }
    // TOKEN_REFRESHED / INITIAL_SESSION 等事件：不改 _profile，沿用本地缓存
  })
  return _currentUser
}

export function getCurrentUser() {
  return _currentUser
}

export function getProfile() {
  return _profile
}

/**
 * 从本地缓存载入 profile + preferences（减云端调用）
 * App 启动 / onAuthStateChange 的 TOKEN_REFRESHED 等非登录事件用此，不拉云端
 * 返回 true 表示缓存命中，false 表示无缓存需拉云端
 */
function _loadProfileFromCache() {
  try {
    const cached = uni.getStorageSync(STORAGE_KEYS.PROFILE_CACHE)
    if (cached) {
      _profile = cached
      _preferences = cached.preferences || {}
      uni.$emit('preferencesLoaded', _preferences)
      return true
    }
  } catch { /* ignore */ }
  return false
}

/** profile 存本地缓存（拉云端成功后 / saveProfile 后调用） */
function _saveProfileToCache() {
  try {
    uni.setStorageSync(STORAGE_KEYS.PROFILE_CACHE, _profile || {})
  } catch { /* ignore */ }
}

/** 清本地 profile 缓存（退出登录时） */
function _clearProfileCache() {
  try {
    uni.removeStorageSync(STORAGE_KEYS.PROFILE_CACHE)
  } catch { /* ignore */ }
}

/**
 * 从云端拉 profile：仅 login/register/initAuth 首次调用，拉完后存本地
 * 后续 saveProfile 改本地缓存，token失效/退出/重登才再拉云端
 */
async function _loadProfile() {
  if (!_currentUser) return
  // maybeSingle 兜底：profiles 行不存在时返回 null 不抛错（.single 会抛 PGRST116）
  const { data } = await supabase
    .from('profiles')
    .select('nickname, avatar_url, introduction, preferences')
    .eq('id', _currentUser.id)
    .maybeSingle()
  // 老用户或 register 没 insert 成的兜底：profiles 行不存在时自动创建
  if (!data) {
    try {
      await supabase.from('profiles').insert({
        id: _currentUser.id,
        nickname: '',
        introduction: '观看精彩影视',
        avatar_url: '🐱',
        preferences: {},
      })
      // 重新查一次拿回新创建的行
      const { data: retry } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, introduction, preferences')
        .eq('id', _currentUser.id)
        .maybeSingle()
      _profile = retry || {}
    } catch {
      _profile = {}
    }
  } else {
    _profile = data
  }
  _preferences = _profile?.preferences || {}
  _saveLocalPreferences() // 缓存到本地，下次启动秒回
  _saveProfileToCache() // profile 也存本地，后续减云端调用
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
  if (error) throw new Error(translateAuthError(error.message))
  _currentUser = data.user
  _loginInProgress = true
  await _loadProfile()
  return _currentUser
}

/**
 * 将 Supabase 英文认证错误翻译为中文提示
 */
function translateAuthError(msg) {
  // 后台邮箱禁用错误：Supabase GoTrue 返回 "Email address \"xxx@lyo.tv\" is invalid"
  // 这种动态邮箱地址用正则匹配前缀，给用户更友好提示
  if (/Email address .* is invalid/i.test(msg)) {
    return '该邮箱地址被服务端禁用，请联系管理员检查 Supabase 后台 Email Auth 域名配置'
  }
  const map = {
    'Invalid login credentials': '账号不存在或密码错误，请检查后重试',
    'Email not confirmed': '邮箱尚未验证，请先验证邮箱',
    'User already registered': '该账号已注册，请直接登录',
    'Invalid email': '邮箱格式不正确',
    'Password should be at least 6 characters': '密码长度不能少于 6 位',
    'signUp': '注册失败，请稍后重试',
    'Invalid email or password': '账号或密码错误',
    'Email rate limit exceeded': '注册请求过于频繁，每小时仅限 2 次，请稍后再试',
    'User already registered': '该账号已注册，请直接登录',
    'For security purposes, you can not re-use an email address': '该邮箱已被注册，请直接登录',
  }
  return map[msg] || msg
}

/**
 * 注册 - 注册后需管理员在 Supabase 后台确认邮箱方可登录
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>} 注册请求是否提交成功
 */
export async function register(username, password) {
  const email = username.trim() + EMAIL_SUFFIX
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw new Error(translateAuthError(error.message))
  // 注册成功后立即创建 profiles 行：后续 _loadProfile/.single() 查空会抛错，
  // 且 updateProfile/favorites 的 .eq('id', user.id) 因无行 + RLS 拒写
  if (data?.user?.id) {
    try {
      await supabase.from('profiles').insert({
        id: data.user.id,
        nickname: username.trim(),
        introduction: '观看精彩影视',
        avatar_url: '🐱',
        preferences: {},
      })
    } catch {
      // profiles 行可能由数据库 trigger 自动创建（若配了），insert 冲突静默
    }
  }
  // 注册后自动清除当前 session，避免产生歧义
  await supabase.auth.signOut()
  return true
}

/**
 * 退出登录 → 先提交未同步的偏好 → 清空本地缓存 → 通知主题重置
 */
export async function logout() {
  // 先把偏好、资料等待同步数据提交到云端
  await flushPreferences()
  await flushProfile()
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
    // 清空：本地历史记录（登录用户相关）
    const keep = [
      STORAGE_KEYS.HISTORY,
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
 * 更新用户资料（本地优先，防抖批量同步云端）
 * 昵称/简介/头像都即时更新本地缓存，云端在后台统一提交
 */
export async function updateProfile(updates) {
  if (!_currentUser) throw new Error('未登录')

  // 立即更新本地缓存
  if (_profile) _profile = { ..._profile, ...updates }
  else _profile = updates
  // 存本地缓存：后续读 profile 不拉云端，token失效/退出/重登才再拉
  _saveProfileToCache()

  // 标记待同步（防抖 30s 后批量上传云端）
  _markProfileDirty(updates)
}

// ==================== 登录提示 ====================

/** 登录失效/未登录时弹窗提示，跳转到登录页（登录后自动返回） */
function _promptLogin() {
  if (_loginPrompting) return
  _loginPrompting = true
  uni.showModal({
    title: '登录已失效',
    content: '请重新登录后继续操作',
    confirmText: '去登录',
    cancelText: '暂不登录',
    success: (res) => {
      _loginPrompting = false
      if (res.confirm) {
        uni.navigateTo({ url: '/pages/login/login' })
      }
    },
    fail: () => { _loginPrompting = false },
  })
}
let _loginPrompting = false

// ==================== 收藏（直查云端，无本地缓存） ====================

/**
 * 获取收藏列表
 * 未登录 → 返回空数组
 */
export async function getFavorites() {
  if (!_currentUser) return []
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', _currentUser.id)
      .order('fav_time', { ascending: false })
    if (!error && data) return data
  } catch { /* ignore */ }
  return []
}

/**
 * 服务端分页获取收藏
 * @param {number} page 页码（从1开始）
 * @param {number} pageSize 每页条数（默认20）
 * @returns {{ items: Array, hasMore: boolean }}
 */
export async function getFavoritesPaginated(page = 1, pageSize = 20) {
  if (!_currentUser) return { items: [], hasMore: false }
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', _currentUser.id)
      .order('fav_time', { ascending: false })
      .range(start, end)
    if (!error && data) {
      return { items: data, hasMore: data.length >= pageSize }
    }
  } catch { /* ignore */ }
  return { items: [], hasMore: false }
}

export async function addFavorite(vod) {
  if (!_currentUser) {
    _promptLogin()
    return
  }
  try {
    await supabase.from('favorites').insert({
      user_id: _currentUser.id,
      vod_id: vod.vod_id,
      vod_name: vod.vod_name || '',
      vod_pic: vod.vod_pic || '',
      vod_remarks: vod.vod_remarks || '',
      site_key: vod.site_key || '',
      fav_time: Date.now(),
    })
  } catch {
    // 重复收藏或网络错误静默处理
  }
}

export async function removeFavorite(vodId) {
  if (!_currentUser) {
    _promptLogin()
    return
  }
  await supabase.from('favorites').delete().eq('user_id', _currentUser.id).eq('vod_id', vodId)
}

export async function clearFavorites() {
  if (!_currentUser) {
    _promptLogin()
    return
  }
  await supabase.from('favorites').delete().eq('user_id', _currentUser.id)
}

export async function isFavorite(vodId) {
  if (!_currentUser) return false
  try {
    const { data } = await supabase
      .from('favorites')
      .select('vod_id')
      .eq('user_id', _currentUser.id)
      .eq('vod_id', vodId)
      .limit(1)
    return data && data.length > 0
  } catch {
    return false
  }
}

// ==================== 历史记录（纯本地存储） ====================

export function getHistory() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.HISTORY) || []
  } catch {
    return []
  }
}

export function addHistory(vod, episode, progress, flag) {
  if (!vod?.vod_id) return getHistory()

  const now = Date.now()
  let cached = []
  try {
    cached = uni.getStorageSync(STORAGE_KEYS.HISTORY) || []
  } catch { /* ignore */ }

  const siteKey = vod.site_key || ''
  const isSameItem = (item) => {
    if (item.vod_id !== vod.vod_id) return false
    const itemSiteKey = item.site_key || ''
    return !siteKey || !itemSiteKey || itemSiteKey === siteKey
  }
  const existing = cached.find(isSameItem)
  cached = cached.filter((item) => !isSameItem(item))

  // 仅浏览/打开详情时不再把已有播放状态覆盖成空集、0 秒。
  // 只有播放器显式传入 episode/progress 时才更新续播位置。
  const resolvedEpisode = episode === undefined
    ? (vod.episode || existing?.episode || '')
    : episode
  const resolvedProgress = progress === undefined
    ? Number(vod.progress ?? existing?.progress ?? 0) || 0
    : Number(progress) || 0
  const resolvedFlag = flag === undefined
    ? (vod.flag || existing?.flag || '')
    : flag

  cached.unshift({
    vod_id: vod.vod_id,
    vod_name: vod.vod_name,
    vod_pic: vod.vod_pic,
    vod_remarks: vod.vod_remarks,
    site_key: siteKey || existing?.site_key || '',
    episode: resolvedEpisode,
    progress: resolvedProgress,
    flag: resolvedFlag,
    view_time: now,
    time: now,
  })
  try {
    uni.setStorageSync(STORAGE_KEYS.HISTORY, cached)
  } catch { /* ignore */ }
  return cached
}

export function removeHistoryItem(vodId, viewTime) {
  let cached = []
  try {
    cached = uni.getStorageSync(STORAGE_KEYS.HISTORY) || []
  } catch { /* ignore */ }
  cached = cached.filter(
    (item) => !(item.vod_id === vodId && (item.view_time === viewTime || item.time === viewTime))
  )
  try {
    uni.setStorageSync(STORAGE_KEYS.HISTORY, cached)
  } catch { /* ignore */ }
  return cached
}

export function clearHistory() {
  try {
    uni.setStorageSync(STORAGE_KEYS.HISTORY, [])
  } catch { /* ignore */ }
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

// ====== 直播订阅历史 ======

export function getLiveSubHistory() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.LIVE_SUB_HISTORY) || []
  } catch {
    return []
  }
}

export function addLiveSubHistory(url) {
  if (!url) return
  try {
    const list = getLiveSubHistory().filter(item => item.url !== url)
    list.unshift({ url, time: Date.now() })
    uni.setStorageSync(STORAGE_KEYS.LIVE_SUB_HISTORY, list)
  } catch {
    // ignore
  }
}

export function removeLiveSubHistory(url) {
  try {
    const list = getLiveSubHistory().filter(item => item.url !== url)
    uni.setStorageSync(STORAGE_KEYS.LIVE_SUB_HISTORY, list)
  } catch {
    // ignore
  }
}
