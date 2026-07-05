@echo off
chcp 65001 >nul
set WWW=D:\jqw\programs\lyoTVMobile\unpackage\dist\build\app-plus
set DST=D:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS\simpleDemo\src\main\assets\apps\__UNI__8112C78\www
set AAR=D:\jqw\programs\lyoTV-vod-plugin\plugin\build\outputs\aar\plugin-release.aar
set LIBS=D:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS\simpleDemo\libs
set PLUGIN=D:\jqw\programs\lyoTV-vod-plugin
set GRADLE=D:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS
set APK=D:\jqw\programs\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS\simpleDemo\build\outputs\apk\debug\simpleDemo-debug.apk
set ADB=D:\software\Android Studio\platform-tools\adb.exe

echo [1/5] compile fat AAR
cd /d "%PLUGIN%"
call gradlew.bat :plugin:fatAar --no-daemon
if %errorlevel% neq 0 ( echo PLUGIN BUILD FAILED && pause && exit /b 1 )

echo [2/5] copy AAR
copy /y "%AAR%" "%LIBS%\" >nul

echo [3/5] sync www
if not exist "%WWW%" ( echo WWW NOT FOUND - export from HBuilderX first && pause && exit /b 1 )
rmdir /s /q "%DST%" 2>nul
mkdir "%DST%" 2>nul
xcopy /e /y "%WWW%\*" "%DST%\" >nul

echo [4/5] build APK
cd /d "%GRADLE%"
call gradlew.bat :simpleDemo:assembleDebug
if %errorlevel% neq 0 ( echo APK BUILD FAILED && pause && exit /b 1 )

echo [5/5] install
"%ADB%" install -r "%APK%"
if %errorlevel% neq 0 ( echo INSTALL FAILED && "%ADB%" devices && pause && exit /b 1 )

echo start
"%ADB%" shell am force-stop uni.app.UNI8112C78 >nul 2>&1
"%ADB%" shell monkey -p uni.app.UNI8112C78 -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo ALL DONE
pause
