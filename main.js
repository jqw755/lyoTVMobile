import App from './App'
import { createSSRApp } from 'vue'
import { syncThemeFromStorage } from './utils/theme.js'

export function createApp() {
  const app = createSSRApp(App)
  // uni-app App端每个页面是独立 webview（独立 JS 上下文），
  // mine.vue 改 theme 只影响自己的 webview。
  // 通过全局 mixin 在每个页面 onLoad/onShow 时从 storage 同步 theme ref，
  // ref 变化 -> :style="themeStyle" 自动更新，CSS 变量级联生效。
  app.mixin({
    onLoad() { syncThemeFromStorage() },
    onShow() { syncThemeFromStorage() }
  })
  return {
    app
  }
}
