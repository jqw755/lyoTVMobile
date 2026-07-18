import { onBackPress } from '@dcloudio/uni-app'

const HOME_URL = '/pages/index/index'
const EXIT_INTERVAL = 2000

let lastHomeBackAt = 0

export function useTabBack(options = {}) {
  const isHome = options.home === true

  onBackPress((event) => {
    if (event?.from !== 'backbutton') return false

    if (!isHome) {
      lastHomeBackAt = 0
      uni.switchTab({ url: HOME_URL })
      return true
    }

    const now = Date.now()
    if (now - lastHomeBackAt <= EXIT_INTERVAL) {
      lastHomeBackAt = 0
      // 第二次返回由应用直接退出并消费事件，避免 DCloud 基座再次计数。
      // #ifdef APP-PLUS
      plus.runtime.quit()
      return true
      // #endif
      return false
    }

    lastHomeBackAt = now
    uni.showToast({
      title: '再按一次返回即可退出',
      icon: 'none',
      duration: EXIT_INTERVAL,
    })
    return true
  })
}
