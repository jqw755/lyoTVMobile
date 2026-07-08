import { ref } from 'vue'

/**
 * 获取设备状态栏高度（px），用于自定义标题栏的顶部间距补偿
 * 适配异形屏 / 刘海屏，避免内容与系统状态栏（时间、信号等）重叠
 */
export function useStatusBar() {
  const statusBarHeight = ref(0)

  try {
    const sysInfo = uni.getSystemInfoSync()
    // 状态栏高度（px），Android 通常 24~48，iOS 刘海屏最高 88
    statusBarHeight.value = sysInfo.statusBarHeight || 0
  } catch (e) {
    statusBarHeight.value = 0
  }

  return { statusBarHeight }
}
