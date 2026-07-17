/**
 * 全局可视化日志工具
 * 所有日志渲染到页面上的浮动面板，支持复制，真机上也能看到。
 */
import { reactive } from 'vue'

const MAX_LOG = 200

/** 全局日志数组（响应式，面板直接绑定） */
export const debugLogs = reactive([])

/** 是否展开面板 */
export const panelVisible = reactive({ value: false })

export function togglePanel() {
  panelVisible.value = !panelVisible.value
}

/**
 * 追加一条日志
 * @param {string} tag 标签，如 THEME / APP / FAV / MUTED
 * @param {...any} args 日志内容
 */
export function debugLog(tag, ...args) {
  const t = new Date().toLocaleTimeString()
  const msg = args.map(a => {
    if (typeof a === 'string') return a
    try {
      const s = JSON.stringify(a)
      return s && s.length > 500 ? s.slice(0, 500) + '…' : s
    } catch { return String(a) }
  }).join(' ')
  const line = `[${t}][${tag}] ${msg}`
  debugLogs.unshift({ text: line, tag })
  if (debugLogs.length > MAX_LOG) debugLogs.pop()
  // 同时也输出到控制台，HBuilder 调试时能用
  console.log(line)
  return line
}

/** 清空日志 */
export function clearDebugLogs() {
  debugLogs.splice(0, debugLogs.length)
}

/** 复制全部日志到剪贴板 */
export function copyDebugLogs() {
  const text = debugLogs.map(l => l.text).join('\n')
  if (!text) {
    uni.showToast({ title: '暂无日志', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '日志已复制', icon: 'success' }),
    fail: () => uni.showToast({ title: '复制失败', icon: 'none' }),
  })
}