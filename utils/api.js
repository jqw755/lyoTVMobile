/**
 * 插件桥接 API 封装
 * 调用 uni 原生插件 Fongmi-VodPlugin
 *
 * 核心设计：init / liveInit 是配置解析（快），完成后所有 getter 走内存缓存。
 * 任何页面调数据方法前 await ensureInit() 即可，无需事件/标记。
 */
import { store } from '@/utils/appState.js'
import { addLog as _addLog } from '@/utils/debugLog.js'

// 安全日志：捕获所有异常，不允许任何日志影响插件桥接
function addLog(tag, msg) {
  try { _addLog(tag, msg) } catch (e) { console.warn('log err', e) }
}

const PLUGIN_NAME = 'Fongmi-VodPlugin'
const LIVE_PLUGIN_NAME = 'Fongmi-LivePlugin'

let vodPlugin = null
let livePlugin = null

function getPlugin() {
  if (vodPlugin) return vodPlugin
  try {
    vodPlugin = uni.requireNativePlugin(PLUGIN_NAME)
  } catch (e) {
    vodPlugin = null
  }
  return vodPlugin
}

function getLivePlugin() {
  if (livePlugin) return livePlugin
  try {
    livePlugin = uni.requireNativePlugin(LIVE_PLUGIN_NAME)
  } catch (e) {
    livePlugin = null
  }
  return livePlugin
}

/**
 * 调用插件方法，返回 Promise（支持超时）
 */
function callPlugin(method, args = {}, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const plugin = getPlugin()
    if (!plugin) {
      addLog('API', `✗ ${method} 插件未注册`)
      return reject(new Error('原生插件未注册，请使用自定义基座运行'))
    }
    if (typeof plugin[method] !== 'function') {
      addLog('API', `✗ ${method} 方法不存在`)
      return reject(new Error(`插件未暴露方法: ${method}`))
    }
    const argStr = JSON.stringify(args).slice(0, 80)
    addLog('API→', `${method}(${argStr}) 调用`)
    const t0 = Date.now()

    let settled = false
    const finish = (fn, val) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn(val)
    }

    const timer = setTimeout(() => {
      finish(reject, new Error(`插件 ${method} 超时 (${timeout}ms)`))
    }, timeout)

    try {
      plugin[method](args, (ret) => {
        const dur = Date.now() - t0
        if (!ret) {
          addLog('API<-', `✗ ${method} 返回空 (${dur}ms)`)
          return finish(reject, new Error('插件返回空结果'))
        }
        const hasCode = typeof ret.code !== 'undefined'
        const ok = !hasCode || ret.code === 0 || ret.code === 200
        if (!ok) {
          addLog('API<-', `✗ ${method} code=${ret.code} msg=${ret.msg} (${dur}ms)`)
          return finish(reject, new Error(ret.msg || `插件调用失败 code=${ret.code}`))
        }
        const data = ret.data
        let parsed
        if (data === undefined || data === null || data === '') {
          parsed = ret
        } else if (typeof data === 'string') {
          try { parsed = JSON.parse(data) } catch (e) {
            parsed = data
          }
        } else {
          parsed = data
        }

        const summary = typeof parsed === 'string' ? `${parsed.slice(0, 60)}...` :
          (Array.isArray(parsed) ? `Array[${parsed.length}]` :
            (parsed && typeof parsed === 'object' ? `Object{${Object.keys(parsed).slice(0, 3).join(',')}}` : String(parsed)))
        addLog('API<-', `✓ ${method} (${dur}ms) ${summary}`)

        // 保存完整响应快照，供设置页导出调试
        try {
          if (typeof uni !== 'undefined') {
            const snapKey = '__apiSnapshots'
            uni[snapKey] = uni[snapKey] || {}
            uni[snapKey][method] = JSON.parse(JSON.stringify(parsed))
          }
        } catch {}

        finish(resolve, parsed)
      })
    } catch (e) {
      addLog('API<-', `✗ ${method} 异常: ${e.message}`)
      finish(reject, new Error(`插件调用异常: ${e.message}`))
    }
  })
}

/**
 * 调用直播插件方法（Fongmi-LivePlugin），返回 Promise（支持超时）
 */
function callLivePlugin(method, args = {}, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const plugin = getLivePlugin()
    if (!plugin) {
      return reject(new Error('直播插件未注册，请使用自定义基座运行'))
    }
    if (typeof plugin[method] !== 'function') {
      addLog('LIVE', `✗ ${method} 方法不存在`)
      return reject(new Error(`直播插件未暴露方法: ${method}`))
    }
    const argStr = JSON.stringify(args).slice(0, 80)
    addLog('LIVE->', `${method}(${argStr}) 调用`)
    const t0 = Date.now()

    let settled = false
    const finish = (fn, val) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn(val)
    }

    const timer = setTimeout(() => {
      addLog('LIVE<-', `✗ ${method} 超时 (${timeout}ms)`)
      finish(reject, new Error(`直播插件 ${method} 超时 (${timeout}ms)`))
    }, timeout)

    try {
      plugin[method](args, (ret) => {
        const dur = Date.now() - t0
        if (!ret) {
          addLog('LIVE<-', `✗ ${method} 返回空 (${dur}ms)`)
          return finish(reject, new Error('直播插件返回空结果'))
        }
        const hasCode = typeof ret.code !== 'undefined'
        const ok = !hasCode || ret.code === 0 || ret.code === 200
        if (!ok) {
          addLog('LIVE<-', `✗ ${method} code=${ret.code} msg=${ret.msg} (${dur}ms)`)
          return finish(reject, new Error(ret.msg || `直播插件调用失败 code=${ret.code}`))
        }
        const data = ret.data
        let parsed
        if (data === undefined || data === null || data === '') {
          parsed = ret
        } else if (typeof data === 'string') {
          try { parsed = JSON.parse(data) } catch (e) {
            parsed = data
          }
        } else {
          parsed = data
        }
        const summary = Array.isArray(parsed) ? `Array[${parsed.length}]` :
          (parsed && typeof parsed === 'object' ? `Object{${Object.keys(parsed).slice(0, 3).join(',')}}` : String(parsed))
        addLog('LIVE<-', `✓ ${method} (${dur}ms) ${summary}`)
        finish(resolve, parsed)
      })
    } catch (e) {
      addLog('LIVE<-', `✗ ${method} 异常: ${e.message}`)
      finish(reject, new Error(`直播插件调用异常: ${e.message}`))
    }
  })
}

/** App 启动时初始化插件（仅初始化配置，不预拉数据） */
export async function initApp() {
  if (!store.subUrl) return
  try {
    await ensureInit(store.subUrl)
    const siteData = await getSites()
    const { updateSites } = await import('@/utils/appState.js')
    updateSites(siteData)
  } catch (e) {
    addLog('API', `initApp 失败: ${e?.message || ''}`)
  }
  // 预热卫视初始化：fongmi 原版在 App 启动即异初始化 LiveConfig，切页命中缓存秒切。
  // 冷启动拉直播订阅 JSON + LiveParser 解析全频道需 5-10s，提前触发避免切卫视页等待。
  if (store.liveSubUrl) {
    ensureLiveInit(store.liveSubUrl).catch(e => addLog('API', `initApp 预热 liveInit 失败: ${e?.message || ''}`))
  }
}

// ===== 点播链路：init 缓存（同一 URL 只初始化一次） =====

let _initUrl = ''
let _initPromise = null

/**
 * 确保点播插件已初始化，返回缓存的 init Promise
 * 任何页面调 home()/category() 前 await 这个即可
 */
export function ensureInit(url) {
  if (!url) return Promise.reject(new Error('need url'))
  if (url === _initUrl && _initPromise) {
    addLog('API', `ensureInit 命中缓存: ${url.slice(0, 40)}`)
    return _initPromise
  }
  _initUrl = url
  // 对齐 fongmi BaseConfig.ensureLoaded 同步阻塞加载：冷启动拉订阅 JSON + 解析 sites 可能 10-30s，10s 超时会误杀
  _initPromise = callPlugin('init', { url }, 30000).catch(e => {
    _initUrl = ''
    _initPromise = null
    throw e
  })
  return _initPromise
}

// ===== 导出 API =====

export function getSites() {
  return callPlugin('getSites')
}

export function init(sites) {
  return callPlugin('init', { url: sites }, 30000)
}

export function home() {
  // 对齐 fongmi SiteApi.homeContent 同步调用爬虫：冷启动首次拉首页可能 10-30s（爬虫初始化 + 网络）
  return callPlugin('home', {}, 30000)
}

export function category(tid, page = 1, extend = {}) {
  // 对齐 fongmi SiteApi.categoryContent 同步调用爬虫：首次拉分类可能 10-30s
  return callPlugin('category', { tid, page, extend }, 30000)
}

export function detail(id, siteKey) {
  // 对齐 fongmi SiteApi.detailContent 同步调用爬虫：首次拉详情可能 10-30s
  return callPlugin('detail', siteKey ? { id, key: siteKey } : { id }, 30000)
}

export function search(keyword, page = 1) {
  return callPlugin('search', { keyword, page })
}

export function searchSite(keyword, siteKey) {
  return callPlugin('searchSite', { keyword, siteKey }, 30000)
}

export function player(flag, id, siteKey) {
  // 对齐 fongmi SiteApi.playerContent 同步调用爬虫：解析播放地址可能 10-30s
  return callPlugin('player', { flag, id, key: siteKey }, 30000)
}

// ===== 卫视直播 API（LiveModule 平行链路） =====

let _liveUrl = ''
let _livePromise = null

/**
 * 确保直播插件已初始化，返回缓存的 Promise
 * 任何页面调 liveGetGroups/liveGetUrl 前 await 这个即可
 */
export function ensureLiveInit(url) {
  if (!url) return Promise.reject(new Error('need url'))
  if (url === _liveUrl && _livePromise) {
    addLog('LIVE', `ensureLiveInit 命中缓存: ${url.slice(0, 40)}`)
    return _livePromise
  }
  _liveUrl = url
  // 对齐 fongmi LiveConfig.ensureLoaded：冷启动拉订阅 JSON + LiveParser 解析全频道可能 10-30s，10s 超时会误杀
  _livePromise = callLivePlugin('liveInit', { url }, 30000).catch(e => {
    _liveUrl = ''
    _livePromise = null
    throw e
  })
  return _livePromise
}

// 向后兼容
export const liveInit = ensureLiveInit

/**
 * 获取直播分组列表
 * @returns [{name, channelCount}]
 */
export function liveGetGroups() {
  // 对齐 fongmi LiveConfig.getHome().getGroups() 内存直读：插件侧已是内存直读，30s 超时仅兜底
  return callLivePlugin('liveGetGroups', {}, 30000)
}

/**
 * 获取指定分组的频道列表
 * @param {string} groupName 分组名
 * @returns [{number, name, logo, urls, tvgId}]
 */
export function liveGetChannels(groupName) {
  // 对齐 fongmi LiveConfig.getHome().getGroups() 内存直读：插件侧已是内存直读，30s 超时仅兜底
  return callLivePlugin('liveGetChannels', { group: groupName }, 30000)
}

/**
 * 获取频道播放地址
 * @param {string} channelName 频道名
 * @param {string} groupName 分组名
 * @param {number} line 线路索引（0开始），跨线切换
 * @returns {url, header}
 */
export function liveGetUrl(channelName, groupName, line = 0) {
  // channelName 可能是字符串形式的数字（如 "3"），转成数字让插件用 number 匹配
  const id = /^\d+$/.test(channelName) ? Number(channelName) : channelName
  // 对齐 fongmi LiveApi.getUrl 同步 Source.fetch 嗅探：Force/JianPian/Video 等 Extractor 可能同步 HTTP 嗅探，10s 超时易误杀
  return callLivePlugin('liveGetUrl', { channelId: id, group: groupName, line }, 30000)
}
