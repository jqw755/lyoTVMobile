/**
 * 插件桥接 API 封装
 * 调用 uni 原生插件 Fongmi-VodPlugin
 * 不提供任何 mock 兜底：插件未就绪或调用失败一律 reject，确保前端只展示真实订阅数据
 */
import { store } from '@/utils/appState.js'

const PLUGIN_NAME = 'Fongmi-VodPlugin'

let vodPlugin = null

function getPlugin() {
  if (vodPlugin) return vodPlugin
  console.log('[插件] 开始 requireNativePlugin:', PLUGIN_NAME)
  try {
    vodPlugin = uni.requireNativePlugin(PLUGIN_NAME)
    if (vodPlugin) {
      const methods = []
      for (const k in vodPlugin) methods.push(k)
      console.log('[插件] 加载成功，暴露方法:', methods.join(', ') || '(无)')
    } else {
      console.error('[插件] requireNativePlugin 返回 null，插件未注册到基座')
    }
  } catch (e) {
    console.error('[插件] requireNativePlugin 抛错:', e && e.message, e)
    vodPlugin = null
  }
  return vodPlugin
}

/**
 * 调用插件方法，返回 Promise（支持超时）
 * 插件未就绪、回调为空、code 非 0/200 一律 reject，绝不返回假数据
 */
function callPlugin(method, args = {}, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const plugin = getPlugin()
    if (!plugin) {
      // 不再兜底 mock，让上层以 toast 暴露"插件未就绪"
      return reject(new Error('原生插件未注册，请使用自定义基座运行'))
    }
    if (typeof plugin[method] !== 'function') {
      return reject(new Error(`插件未暴露方法: ${method}`))
    }

    // 保证 Promise 一定会 settle，避免回调抛错 / 不触发导致永久 loading
    let settled = false
    const finish = (fn, val) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn(val)
    }

    const timer = setTimeout(() => {
      console.error(`[插件] ${method} 超时 (${timeout}ms)，回调始终未触发`)
      finish(reject, new Error(`插件 ${method} 超时 (${timeout}ms)`))
    }, timeout)

    console.log(`[插件] 调用 ${method}`, JSON.stringify(args))
    try {
      plugin[method](args, (ret) => {
        console.log(`[插件] ${method} 回调触发`, JSON.stringify(ret))
        if (!ret) {
          console.error(`[插件] ${method} 返回空结果`)
          return finish(reject, new Error('插件返回空结果'))
        }
        const hasCode = typeof ret.code !== 'undefined'
        // 无 code 字段视为直接返回数据；有 code 时 0/200 视为成功
        const ok = !hasCode || ret.code === 0 || ret.code === 200
        if (!ok) {
          console.error(`[插件] ${method} 失败 code=${ret.code} msg=${ret.msg}`)
          return finish(reject, new Error(ret.msg || `插件调用失败 code=${ret.code}`))
        }
        const data = ret.data
        let parsed
        if (data === undefined || data === null || data === '') {
          // 没有外层 data，ret 本身就是数据（或包装体）
          parsed = ret
        } else if (typeof data === 'string') {
          // data 是 JSON 字符串才解析，解析失败则原样返回，绝不让回调抛错
          try { parsed = JSON.parse(data) } catch (e) {
            console.warn(`[插件] ${method} data 不是合法 JSON，按原始字符串返回`)
            parsed = data
          }
        } else {
          // data 已经是对象/数组，直接用
          parsed = data
        }
        console.log(`[插件] ${method} 解析完成`, JSON.stringify(parsed).substring(0, 300))
        finish(resolve, parsed)
      })
    } catch (e) {
      // 插件方法不存在 / 调用方式不符等同步异常，也要 settle
      console.error(`[插件] ${method} 调用同步抛错:`, e && e.message, e)
      finish(reject, new Error(`插件调用异常: ${e.message}`))
    }
  })
}

/** App 启动时自动加载已存储的订阅并获取首页 */
export async function initApp() {
  console.log('[App] initApp 启动，订阅地址:', store.subUrl || '(空)')
  if (!store.subUrl) {
    console.log('[App] 无订阅地址，跳过')
    return
  }
  try {
    console.log('[App] 步骤1/2 调用 init 加载订阅源...')
    const initRet = await callPlugin('init', { url: store.subUrl })
    console.log('[App] init 完成', JSON.stringify(initRet).substring(0, 200))
    // 加载站点列表
    try {
      const siteData = await callPlugin('getSites')
      const { updateSites } = await import('@/utils/appState.js')
      updateSites(siteData)
      console.log('[App] 站点列表已加载:', siteData?.length || 0)
    } catch (e2) {
      console.warn('[App] 获取站点列表失败:', e2 && e2.message)
    }
    console.log('[App] 步骤2/2 调用 home 获取首页...')
    const homeData = await callPlugin('home')
    console.log('[App] home 完成, class=', homeData?.class?.length, 'list=', homeData?.list?.length)
    const { updateHome } = await import('@/utils/appState.js')
    updateHome(homeData)
    return homeData
  } catch (e) {
    console.error('[App] 自动加载订阅失败:', e && e.message, e)
    return null
  }
}

// ===== 导出 API =====

export function getSites() {
  return callPlugin('getSites')
}

export function init(sites) {
  console.log('[API] init 传入订阅地址:', sites)
  // init 需下载订阅源，网络耗时较长；超时设为 35s，超过 OkHttp 的 30s，
  // 让插件侧真正的网络错误（DNS/cleartext/连接失败）能回调出来，而非被前端抢超时掩盖
  return callPlugin('init', { url: sites }, 35000)
}

export function home() {
  console.log('[API] home 请求首页数据')
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

/** 搜索单个站点，结果含 site_name 字段方便前端分组 */
export function searchSite(keyword, siteKey) {
  return callPlugin('searchSite', { keyword, siteKey }, 8000)
}

export function player(flag, id, siteKey) {
  return callPlugin('player', { flag, id, key: siteKey })
}
