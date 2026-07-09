/**
 * 主题管理（从零重写）
 *
 * 核心方案：响应式 CSS 变量对象绑定到每个页面根元素的 :style
 * - theme 是响应式 ref，setTheme 改变它 -> 当前 webview 根元素 :style 自动更新
 * - 跨 webview 同步：setTheme 写入 storage + uni.$emit 广播，
 *   每个页面 onShow 监听 themeChange 事件，从 storage 重读并更新本地 theme ref
 * - CSS 变量从根元素级联到所有子元素，现有 var(--bg-primary) 等全部继续生效
 * - 深色为默认
 *
 * 参考：https://juejin.cn/post/7541935177007087656
 */
import { ref, computed } from 'vue'
import { getSetting, setSetting } from './store.js'

const THEME_KEY = 'theme'

/** 当前主题，全局响应式（每个 webview 独立一份，通过 storage + 事件同步） */
export const theme = ref(uni.getStorageSync(THEME_KEY) || 'dark')

/** 深色主题 CSS 变量 */
const DARK = {
  '--bg-primary': '#141414',
  '--card': '#1e1e1e',
  '--card-hover': '#2a2a2a',
  '--text-primary': '#ffffff',
  '--text-secondary': '#888888',
  '--border': '#333333',
  '--accent': '#fe8027',
  '--gradient-from': '#1c1512',
  '--gradient-to': '#141414',
  // 字号
  '--text-xs': '20rpx',
  '--text-sm': '24rpx',
  '--text-base': '28rpx',
  '--text-lg': '32rpx',
  '--text-xl': '36rpx',
  // 字重
  '--weight-medium': '500',
  '--weight-semibold': '600',
  '--weight-bold': '700',
  // 字距
  '--tracking-narrow': '-0.3px',
  '--tracking-normal': '0',
  '--tracking-wide': '1px',
  // 行高
  '--leading-tight': '1.2',
  '--leading-loose': '1.8',
  backgroundColor: '#141414',
  color: '#ffffff',
}

/** 浅色主题 CSS 变量 */
const LIGHT = {
  '--bg-primary': '#ffffff',
  '--card': '#f5f5f5',
  '--card-hover': '#e8e8e8',
  '--text-primary': '#000000',
  '--text-secondary': '#666666',
  '--border': '#eeeeee',
  '--accent': '#fe8027',
  '--gradient-from': '#fef0e8',
  '--gradient-to': '#f5f5f5',
  // 字号
  '--text-xs': '20rpx',
  '--text-sm': '24rpx',
  '--text-base': '28rpx',
  '--text-lg': '32rpx',
  '--text-xl': '36rpx',
  // 字重
  '--weight-medium': '500',
  '--weight-semibold': '600',
  '--weight-bold': '700',
  // 字距
  '--tracking-narrow': '-0.3px',
  '--tracking-normal': '0',
  '--tracking-wide': '1px',
  // 行高
  '--leading-tight': '1.2',
  '--leading-loose': '1.8',
  backgroundColor: '#ffffff',
  color: '#000000',
}

/** 响应式主题样式对象，绑定到页面根元素 :style="themeStyle" */
export const themeStyle = computed(() => theme.value === 'light' ? LIGHT : DARK)

/**
 * 从 storage 读取主题并更新当前 webview 的 theme ref
 * 用于跨 webview 同步：其它页面改了主题，本页面切回前台时从 storage 拉最新值
 */
export function syncThemeFromStorage() {
  const saved = uni.getStorageSync(THEME_KEY) || 'dark'
  if (saved !== theme.value) theme.value = saved
}

/** 切换主题：更新 ref -> 持久化到 storage -> 广播通知所有 webview */
export function setTheme(val) {
  theme.value = val
  uni.setStorageSync(THEME_KEY, val)
  try { setSetting('theme', val) } catch (e) {}
  uni.$emit('themeChange', val)
}

/** 初始化：从本地偏好读取主题（兼容云端同步的 getSetting） */
export function initTheme() {
  theme.value = getSetting('theme', 'dark')
  uni.setStorageSync(THEME_KEY, theme.value)
}
