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

## 离线打包基座完整流程（2026-07-07）

### 背景
项目是 uni-app，使用 Fongmi-VodPlugin 原生插件实现 CatVod 源解析。
插件源码在 `E:\jqw\programs\lyoTV-vod-plugin`，编译为 fat AAR 后供离线 SDK 使用。

### 涉及目录

| 路径 | 说明 |
|---|---|
| `E:\jqw\programs\lyoTVMobile` | 前端 uni-app 项目（Vue） |
| `E:\jqw\programs\lyoTV-vod-plugin` | 原生插件 Android 源码项目（含 LiveModule） |
| `E:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS` | 离线打包 Gradle 宿主项目 |

### 打包步骤（一步执行）

```bash
cd E:\jqw\programs\lyoTVMobile
make.bat
```

`make.bat` 自动完成：
1. **编译 AAR** — 进 `lyoTV-vod-plugin` 执行 `gradlew.bat :plugin:fatAar`
2. **同步 www** — 从 `unpackage/dist/build/app-plus` 复制到 SDK 的 `assets/apps/__UNI__8112C78/www`
3. **编译 APK** — 进 SDK 目录执行 `gradlew.bat :simpleDemo:assembleDebug`
4. **ADB 安装** — 自动装到已连接的设备/模拟器并启动

### 已知坑

- **doh_name/doh_url 资源冲突**：catvod 模块的 `values-zh-rCN/strings.xml` 和 `values-zh-rTW/strings.xml` 中定义了 `doh_name`/`doh_url` 字符串数组，与宿主 SDK 重复导致 aapt2 报错 `Duplicate key`。解决办法：从 catvod 的这两个 xml 文件中删掉 `doh_name`/`doh_url` 数组即可。
- **原生插件方法缺失**：旧的 `plugin-release.aar` 不包含 `LiveModule`（直播相关方法）。需要在 `dcloud_uniplugins.json` 中注册 `Fongmi-LivePlugin`（class: `com.fongmi.vod.LiveModule`），前端 `api.js` 中通过 `uni.requireNativePlugin('Fongmi-LivePlugin')` 加载直播插件。
- **必须用自定义基座**：浏览器基座不支持原生插件，需要真机或模拟器运行。
