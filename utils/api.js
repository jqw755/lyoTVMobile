/**
 * 插件桥接 API 封装
 * 调用 uni 原生插件 Fongmi-VodPlugin
 */
import { store } from '@/utils/appState.js'

const PLUGIN_NAME = 'Fongmi-VodPlugin'

let vodPlugin = null

function getPlugin() {
  if (vodPlugin) return vodPlugin
  try {
    vodPlugin = uni.requireNativePlugin(PLUGIN_NAME)
  } catch (e) {
    vodPlugin = null
  }
  return vodPlugin
}

/**
 * 调用插件方法，返回 Promise（支持超时）
 */
function callPlugin(method, args = {}, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const plugin = getPlugin()
    if (!plugin) {
      return reject(new Error('原生插件未注册，请使用自定义基座运行'))
    }
    if (typeof plugin[method] !== 'function') {
      return reject(new Error(`插件未暴露方法: ${method}`))
    }

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
        if (!ret) {
          return finish(reject, new Error('插件返回空结果'))
        }
        const hasCode = typeof ret.code !== 'undefined'
        const ok = !hasCode || ret.code === 0 || ret.code === 200
        if (!ok) {
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
      finish(reject, new Error(`插件调用异常: ${e.message}`))
    }
  })
}

/** App 启动时自动加载已存储的订阅并获取首页 */
export async function initApp() {
  if (!store.subUrl) {
    return
  }
  try {
    const initRet = await init(store.subUrl)
    try {
      const siteData = await getSites()
      const { updateSites } = await import('@/utils/appState.js')
      updateSites(siteData)
    } catch (e2) {
      // ignore
    }
    const homeData = await home()
    const { updateHome } = await import('@/utils/appState.js')
    updateHome(homeData)
    return homeData
  } catch (e) {
    return null
  }
}

// ===== 导出 API =====

export function getSites() {
  return callPlugin('getSites')
}

export function init(sites) {
  return callPlugin('init', { url: sites }, 35000)
}

export function home() {
  return callPlugin('home')
}

export function category(tid, page = 1, extend = {}) {
  return callPlugin('category', { tid, page, extend })
}

export function detail(id, siteKey) {
  return callPlugin('detail', siteKey ? { id, key: siteKey } : { id })
}

export function search(keyword, page = 1) {
  return callPlugin('search', { keyword, page })
}

export function searchSite(keyword, siteKey) {
  return callPlugin('searchSite', { keyword, siteKey }, 8000)
}

export function player(flag, id, siteKey) {
  return callPlugin('player', { flag, id, key: siteKey })
}
