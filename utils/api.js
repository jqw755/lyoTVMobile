/**
 * 插件桥接 API 封装
 * 调用 uni 原生插件 Fongmi-VodPlugin
 * 插件未就绪时返回模拟数据供前端开发调试
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

/** 调用插件方法，返回 Promise（支持超时） */
function callPlugin(method, args = {}, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const plugin = getPlugin()
    if (!plugin) {
      resolve(getMockData(method, args))
      return
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
        // ret 可能为 null / 直接是数据对象 / {code,msg,data} 包装结构
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

// ===== 模拟数据（供前端开发调试用） =====

function getMockData(method, args) {
  switch (method) {
    case 'init':
      return { class: mockClasses, list: mockList }
    case 'home':
      return { class: mockClasses, list: mockList }
    case 'category':
      return { list: mockList }
    case 'detail':
      return {
        vod: {
          ...mockDetail,
          flags: [
            {
              flag: 'ckm3u8',
              episodes: [
                { name: '第01集', url: 'https://example.com/playlist.m3u8' },
                { name: '第02集', url: 'https://example.com/playlist2.m3u8' },
                { name: '第03集', url: 'https://example.com/playlist3.m3u8' },
                { name: '第04集', url: 'https://example.com/playlist4.m3u8' },
              ],
            },
          ],
        },
      }
    case 'search':
      return { list: mockList.slice(0, 6) }
    case 'player':
      return { url: 'https://example.com/playlist.m3u8', parse: 0, header: {} }
    default:
      return {}
  }
}

const mockClasses = [
  { type_id: '1', type_name: '电影' },
  { type_id: '2', type_name: '电视剧' },
  { type_id: '3', type_name: '综艺' },
  { type_id: '4', type_name: '动漫' },
  { type_id: '5', type_name: '纪录片' },
]

const mockList = Array.from({ length: 20 }, (_, i) => ({
  vod_id: `${i + 1}`,
  vod_name: `影视标题 ${i + 1}`,
  vod_pic: `https://picsum.photos/seed/vod${i}/300/400`,
  vod_remarks: i % 3 === 0 ? '更新至128集' : i % 2 === 0 ? 'HD' : '第2026-06期',
  vod_year: '2026',
  vod_area: i % 2 === 0 ? '中国大陆' : '美国',
  type_name: mockClasses[i % mockClasses.length].type_name,
}))

const mockDetail = {
  vod_id: '1',
  vod_name: '示例影视标题',
  vod_pic: 'https://picsum.photos/seed/detail/400/600',
  vod_remarks: '更新至128集',
  vod_year: '2026',
  vod_area: '中国大陆',
  type_name: '电视剧',
  vod_director: '李导',
  vod_actor: '演员A、演员B、演员C',
  vod_content: '这是一段影视简介，描述剧情内容。讲述了在某个时代背景下，主人公经历了一系列冒险与成长的故事。剧情跌宕起伏，引人入胜。',
}

// ===== 导出 API =====

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

export function detail(id) {
  return callPlugin('detail', { id })
}

export function search(keyword, page = 1) {
  return callPlugin('search', { keyword, page })
}

export function player(flag, id) {
  return callPlugin('player', { flag, id })
}
