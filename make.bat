@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set WWW=E:\jqw\programs\lyoTVMobile\unpackage\dist\build\app-plus
set DST=E:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS\simpleDemo\src\main\assets\apps\__UNI__8112C78\www
set AAR=E:\jqw\programs\lyoTV-vod-plugin\plugin\build\outputs\aar\plugin-release.aar
set LIBS=E:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS\simpleDemo\libs
set PLUGIN=E:\jqw\programs\lyoTV-vod-plugin
set GRADLE=E:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS
set APK=E:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS\simpleDemo\build\outputs\apk\debug\simpleDemo-debug.apk

:: ========== step 1/4: 编译 AAR（插件项目存在时） ==========
if exist "%PLUGIN%\build.gradle" (
	echo [1/4] 编译 AAR...
	cd /d "%PLUGIN%"
	call gradlew.bat :plugin:fatAar --no-daemon
	if !errorlevel! neq 0 (
		echo ⚠️  AAR 编译失败，继续打包（仅前端变更）
	) else (
		echo ✅ AAR 编译完成
		copy /y "%AAR%" "%LIBS%\" >nul
	)
) else (
	echo [1/4] 跳过 AAR（无插件项目）
)

:: ========== step 2/4: 同步 www ==========
echo [2/4] 同步 www...
if not exist "%WWW%" (
	echo ❌ 未找到 www 资源: %WWW%
	echo 请先在 HBuilder 中执行：发行 → 原生App-本地打包
	pause
	exit /b 1
)
if exist "%DST%" (
	set BACKUP=%DST%.bak
	echo 📦 备份旧 www → !BACKUP!
	if exist "!BACKUP!" rmdir /s /q "!BACKUP!"
	ren "%DST%" "www.bak" >nul 2>&1
)
mkdir "%DST%" 2>nul
xcopy /e /y "%WWW%\*" "%DST%\" >nul
echo ✅ www 同步完成

:: ========== step 3/4: 编译 APK ==========
echo [3/4] 编译 APK...
cd /d "%GRADLE%"
call gradlew.bat :simpleDemo:assembleDebug --no-daemon
if !errorlevel! neq 0 (
	echo ❌ APK 编译失败
	pause
	exit /b 1
)
echo ✅ APK 编译完成

:: ========== step 4/4: 安装 ==========
echo [4/4] 尝试 ADB 安装...
set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
if not exist "!ADB!" (
	set ADB=D:\software\Android Studio\platform-tools\adb.exe
)
if exist "!ADB!" (
	"!ADB!" install -r "%APK%" >nul 2>&1
	if !errorlevel! equ 0 (
		echo ✅ ADB 安装成功
		"!ADB!" shell am force-stop uni.app.UNI8112C78 >nul 2>&1
		"!ADB!" shell monkey -p uni.app.UNI8112C78 -c android.intent.category.LAUNCHER 1 >nul 2>&1
		echo 🚀 已启动 App
	) else (
		echo ⚠️  ADB 安装失败，请手动拖 APK 到 MuMu
	)
) else (
	echo ⚠️  未找到 adb，请手动拖 APK 到 MuMu
	echo    路径: %APK%
)

echo.
echo =====================================
echo   ✅ 完成
echo   大小: 3.6 MB
for %%I in ("%APK%") do echo   大小: %%~zI 字节
echo =====================================
pause
