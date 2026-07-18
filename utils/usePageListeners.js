/**
 * 页面公共监听器 composable
 *
 * 统一注册 mutedChanged 等全局事件，避免各页面重复写。
 * uni.$emit / $on 是 App 全局级别，跨任意组件、页面、nvue 均可到达。
 *
 * 注意：themeChange 不需要页面级监听，setTabBarStyle 是全局 API，
 * 在 setTheme / initTheme 中调用一次即可全 App 生效。
 */
import { onMounted, onUnmounted } from 'vue'

/**
 * 注册页面级全局监听器
 * @param {Object} options
 * @param {import('vue').Ref<boolean>} [options.mutedRef] - 静音状态的 ref，传了则自动监听 mutedChanged
 */
export function usePageListeners({ mutedRef } = {}) {
  // 静音状态变更
  if (mutedRef) {
    const handleMutedChanged = (v) => {
      mutedRef.value = v
    }
    onMounted(() => {
      uni.$on('mutedChanged', handleMutedChanged)
    })
    onUnmounted(() => {
      uni.$off('mutedChanged', handleMutedChanged)
    })
  }
}
