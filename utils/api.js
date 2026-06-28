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
  try {
    vodPlugin = uni.requireNativePlugin(PLUGIN_NAME)
  } catch (e) {
    console.warn('原生插件未就绪，使用模拟数据模式')
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

    const timer = setTimeout(() => {
      reject(new Error(`插件 ${method} 超时 (${timeout}ms)`))
    }, timeout)

    console.log(`[插件] 调用 ${method}`, JSON.stringify(args))
    plugin[method](args, (ret) => {
      clearTimeout(timer)
      console.log(`[插件] ${method} 返回`, JSON.stringify(ret))
      if (ret && ret.code === 0) {
        resolve(ret.data ? JSON.parse(ret.data) : ret)
      } else {
        reject(new Error(ret?.msg || '插件调用失败'))
      }
    })
  })
}

/** App 启动时自动加载已存储的订阅并获取首页 */
export async function initApp() {
  if (!store.subUrl) return
  try {
    const initRet = await callPlugin('init', { url: store.subUrl })
    const homeData = await callPlugin('home')
    const { updateHome } = await import('@/utils/appState.js')
    updateHome(homeData)
    return homeData
  } catch (e) {
    console.warn('自动加载订阅失败:', e)
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
  return callPlugin('init', { url: sites })
}

export function home() {
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
