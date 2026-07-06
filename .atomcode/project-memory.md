# lyoTVMobile 项目记忆

## Android 调试基座打包流程

当修改了前端代码（pages/ 下的 .vue 文件），要使 Android 模拟器看到最新效果：

1. **HBuilder 编译源码**
   - 在 HBuilder 中「运行 → 运行到模拟器」一次
   - 或任意触发编译的操作
   - 编译产物在 `unpackage/dist/dev/app-plus/`

2. **运行打包脚本**
   ```bash
   bash build-debug-apk.sh
   ```
   该脚本自动完成：
   - 复制编译产物到 `HBuilder-Integrate-AS/simpleDemo/assets/`
   - Gradle 打包 APK
   - 更新 `unpackage/debug/android_debug.apk`

3. **安装到模拟器**
   - 直接拖 APK 到 MuMu 模拟器窗口
   - 或从 HBuilder 运行到模拟器

## SDK 路径
- Android SDK: `D:\MyConfiguration\qiwei.jing\AppData\Local\Android\Sdk`
- HBuilder Integration AS 项目: `E:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS`

## 倍速模块（2026-07-06 修改）
- 仅全屏显示：全圆按钮（80rpx），中间显示当前倍速值（默认1.0）
- 点击弹出右侧侧边栏（200rpx），选择倍速后自动关闭
- 遮罩点击可关闭侧边栏
- 与控制栏同步显示/隐藏（4s 自动消失）
