@echo off
set PROJECT=E:\jqw\programs
set PLUGIN=%PROJECT%\lyoTV-vod-plugin
set FRONT=%PROJECT%\lyoTVMobile
set AAR_SRC=%PLUGIN%\plugin\build\outputs\aar\plugin-release.aar
set WWW_SRC=%FRONT%\unpackage\dist\build\app-plus
set SHELL=%PROJECT%\Android-SDK@5.07.82603_20260414\HBuilder-Integrate-AS
set LIBS=%SHELL%\simpleDemo\libs
set WWW_DST=%SHELL%\simpleDemo\src\main\assets\apps\__UNI__8112C78\www
set APK=%SHELL%\simpleDemo\build\outputs\apk\debug\simpleDemo-debug.apk
set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe

echo [1/5] compile fat AAR...
cd /d "%PLUGIN%"
call gradlew.bat :plugin:fatAar --no-daemon
if %errorlevel% neq 0 ( echo PLUGIN BUILD FAILED && pause && exit /b 1 )

echo [2/5] copy AAR...
copy /y "%AAR_SRC%" "%LIBS%\" >nul
if %errorlevel% neq 0 ( echo COPY FAILED && pause && exit /b 1 )

echo [3/5] sync www...
if not exist "%WWW_SRC%\" ( echo WWW NOT FOUND && pause && exit /b 1 )
rmdir /s /q "%WWW_DST%" 2>nul
mkdir "%WWW_DST%" 2>nul
xcopy /e /y "%WWW_SRC%\*" "%WWW_DST%\" >nul

echo [4/5] build APK...
cd /d "%SHELL%"
call gradlew.bat :simpleDemo:assembleDebug
if %errorlevel% neq 0 ( echo APK BUILD FAILED && pause && exit /b 1 )

echo [5/5] install...
"%ADB%" install -r "%APK%"
if %errorlevel% neq 0 ( echo INSTALL FAILED && "%ADB%" devices && pause && exit /b 1 )

echo start...
"%ADB%" shell am force-stop uni.app.UNI8112C78 >nul 2>&1
"%ADB%" shell monkey -p uni.app.UNI8112C78 -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo ALL DONE
pause
