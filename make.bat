@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Usage:
rem   make.bat                 Build, then install if an authorized device is connected.
rem   make.bat --no-install    Build APK only.
rem   make.bat --no-pause      Do not pause before returning.

set "NO_INSTALL="
set "NO_PAUSE="
for %%A in (%*) do (
    if /I "%%~A"=="--no-install" set "NO_INSTALL=1"
    if /I "%%~A"=="--no-pause" set "NO_PAUSE=1"
)

set "MOBILE=%~dp0"
if "%MOBILE:~-1%"=="\" set "MOBILE=%MOBILE:~0,-1%"
for %%I in ("%MOBILE%\..") do set "PROGRAMS=%%~fI"
set "PLUGIN=%PROGRAMS%\lyoTV-vod-plugin"
set "RESOURCE_ROOT=%MOBILE%\unpackage\resources"
set "AAR=%PLUGIN%\plugin\build\outputs\aar\plugin-release.aar"
set "PACKAGE_NAME=uni.app.UNI8112C78"

set "PLUGIN_GRADLE="
for /D %%D in ("%PROGRAMS%\gradle-*") do (
    if exist "%%~fD\bin\gradle.bat" if not defined PLUGIN_GRADLE set "PLUGIN_GRADLE=%%~fD\bin\gradle.bat"
)
if not defined PLUGIN_GRADLE (
    set "FAIL_MESSAGE=Standalone Gradle not found under %PROGRAMS%\gradle-*"
    goto :fail
)

set "GRADLE="
for /D %%D in ("%PROGRAMS%\Android-SDK@*") do (
    if exist "%%~fD\HBuilder-Integrate-AS\gradlew.bat" if not defined GRADLE set "GRADLE=%%~fD\HBuilder-Integrate-AS"
)
if not defined GRADLE (
    set "FAIL_MESSAGE=Android offline SDK not found under %PROGRAMS%\Android-SDK@*"
    goto :fail
)

set "ANDROID_SDK="
if defined ANDROID_HOME if exist "%ANDROID_HOME%\platforms\android-35\android.jar" set "ANDROID_SDK=%ANDROID_HOME%"
if not defined ANDROID_SDK if defined ANDROID_SDK_ROOT if exist "%ANDROID_SDK_ROOT%\platforms\android-35\android.jar" set "ANDROID_SDK=%ANDROID_SDK_ROOT%"
if not defined ANDROID_SDK if exist "%LOCALAPPDATA%\Android\Sdk\platforms\android-35\android.jar" set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
if not defined ANDROID_SDK if exist "D:\software\Android Studio\platforms\android-35\android.jar" set "ANDROID_SDK=D:\software\Android Studio"
if not defined ANDROID_SDK (
    set "FAIL_MESSAGE=Android SDK with platform android-35 was not found"
    goto :fail
)
set "ANDROID_HOME=!ANDROID_SDK!"
set "ANDROID_SDK_ROOT=!ANDROID_SDK!"
set "SDK_PROP=!ANDROID_SDK:\=/!"
> "%PLUGIN%\local.properties" echo sdk.dir=!SDK_PROP!
> "%GRADLE%\local.properties" echo sdk.dir=!SDK_PROP!

set "WWW="
set "APPID="
for /D %%D in ("%RESOURCE_ROOT%\__UNI__*") do (
    if exist "%%~fD\www\manifest.json" (
        if defined WWW (
            set "FAIL_MESSAGE=Multiple __UNI__ resource folders found under %RESOURCE_ROOT%"
            goto :fail
        )
        set "APPID=%%~nxD"
        set "WWW=%%~fD\www"
    )
)
if not defined WWW (
    set "FAIL_MESSAGE=HBuilder www not found. Expected: %RESOURCE_ROOT%\__UNI__*\www"
    goto :fail
)

set "BASE=%GRADLE%\simpleDemo"
set "LIBS=%BASE%\libs"
set "DST=%BASE%\src\main\assets\apps\%APPID%\www"
set "APK=%BASE%\build\outputs\apk\debug\simpleDemo-debug.apk"
set "OUTPUT_APK=%MOBILE%\lyoTVMobile-debug.apk"

if not exist "%BASE%\build.gradle" (
    set "FAIL_MESSAGE=Android base project is incomplete: %BASE%"
    goto :fail
)
if not exist "%LIBS%" mkdir "%LIBS%"
if not exist "%LIBS%" (
    set "FAIL_MESSAGE=Cannot create libs folder: %LIBS%"
    goto :fail
)

echo.
echo ============================================================
echo   lyoTVMobile one-click Android build
echo ============================================================
echo [INFO] Mobile : %MOBILE%
echo [INFO] Plugin : %PLUGIN%
echo [INFO] WWW    : %WWW%
echo [INFO] Base   : %BASE%
echo [INFO] SDK    : %ANDROID_SDK%
echo.

echo [1/4] Building plugin AAR...
set "FAT_AAR_TMP=%PLUGIN%\plugin\build\tmp\fat-aar"
if exist "!FAT_AAR_TMP!" rmdir /S /Q "!FAT_AAR_TMP!"
if exist "!FAT_AAR_TMP!" (
    set "FAIL_MESSAGE=Cannot clean stale fatAar temp folder: !FAT_AAR_TMP!"
    goto :fail
)
pushd "%PLUGIN%"
if errorlevel 1 (
    set "FAIL_MESSAGE=Cannot enter plugin project: %PLUGIN%"
    goto :fail
)
call "%PLUGIN_GRADLE%" :plugin:fatAar --no-daemon
set "RC=!errorlevel!"
popd
if not "!RC!"=="0" (
    set "FAIL_MESSAGE=AAR build failed. Gradle exit code: !RC!"
    goto :fail
)
if not exist "%AAR%" (
    set "FAIL_MESSAGE=AAR task succeeded but output is missing: %AAR%"
    goto :fail
)
copy /Y "%AAR%" "%LIBS%\plugin-release.aar" >nul
if errorlevel 1 (
    set "FAIL_MESSAGE=Failed to copy AAR into Android base"
    goto :fail
)
for %%I in ("%AAR%") do echo [OK] AAR: %%~zI bytes

echo.
echo [2/4] Syncing HBuilder www...
if not exist "%DST%" mkdir "%DST%"
if not exist "%DST%" (
    set "FAIL_MESSAGE=Cannot create www destination: %DST%"
    goto :fail
)
robocopy "%WWW%" "%DST%" /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NP
set "RC=!errorlevel!"
if !RC! GEQ 8 (
    set "FAIL_MESSAGE=www sync failed. Robocopy exit code: !RC!"
    goto :fail
)
if not exist "%DST%\manifest.json" (
    set "FAIL_MESSAGE=manifest.json missing after www sync: %DST%"
    goto :fail
)
echo [OK] www synced into Android base

echo.
echo [3/4] Building Debug APK...
pushd "%GRADLE%"
if errorlevel 1 (
    set "FAIL_MESSAGE=Cannot enter Android base: %GRADLE%"
    goto :fail
)
call gradlew.bat :simpleDemo:assembleDebug --no-daemon
set "RC=!errorlevel!"
popd
if not "!RC!"=="0" (
    set "FAIL_MESSAGE=APK build failed. Gradle exit code: !RC!"
    goto :fail
)
if not exist "%APK%" (
    set "FAIL_MESSAGE=Gradle succeeded but APK is missing: %APK%"
    goto :fail
)
copy /Y "%APK%" "%OUTPUT_APK%" >nul
if errorlevel 1 (
    set "FAIL_MESSAGE=Failed to copy final APK"
    goto :fail
)
for %%I in ("%OUTPUT_APK%") do echo [OK] APK: %%~fI ^(%%~zI bytes^)

if defined NO_INSTALL (
    echo.
    echo [4/4] Install skipped by --no-install
    goto :success
)

echo.
echo [4/4] Detecting Android device...
call :find_adb
if not defined ADB (
    echo [WARN] adb not found. APK was built successfully: %OUTPUT_APK%
    goto :success
)

"%ADB%" start-server >nul 2>&1
set "SERIAL="
for /F "skip=1 tokens=1,2" %%A in ('"%ADB%" devices 2^>nul') do (
    if "%%B"=="device" if not defined SERIAL set "SERIAL=%%A"
)
if not defined SERIAL (
    echo [WARN] No authorized Android device. APK was built successfully.
    echo [WARN] Connect the phone, enable USB debugging, authorize it, then run make.bat again.
    "%ADB%" devices
    goto :success
)

echo [INFO] Installing to device: !SERIAL!
"%ADB%" -s "!SERIAL!" install -r "%OUTPUT_APK%"
if errorlevel 1 (
    echo [HINT] OPPO/ColorOS Failure [-99]: in Developer options enable Install via USB and Disable permission monitoring ^(or Disable system optimization^).
    echo [HINT] Also turn off Verify apps over USB if that option is present.
    set "FAIL_MESSAGE=ADB install failed on device !SERIAL!. APK remains available at %OUTPUT_APK%"
    goto :fail
)
"%ADB%" -s "!SERIAL!" shell am force-stop "%PACKAGE_NAME%" >nul 2>&1
"%ADB%" -s "!SERIAL!" shell monkey -p "%PACKAGE_NAME%" -c android.intent.category.LAUNCHER 1 >nul 2>&1
if errorlevel 1 (
    set "FAIL_MESSAGE=APK installed, but app launch failed: %PACKAGE_NAME%"
    goto :fail
)
echo [OK] Installed and launched %PACKAGE_NAME%
goto :success

:find_adb
set "ADB="
for /F "delims=" %%A in ('where adb 2^>nul') do if not defined ADB set "ADB=%%~fA"
if not defined ADB if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not defined ADB if exist "D:\software\Android Studio\platform-tools\adb.exe" set "ADB=D:\software\Android Studio\platform-tools\adb.exe"
exit /b 0

:success
echo.
echo ============================================================
echo   BUILD SUCCESS
echo   APK: %OUTPUT_APK%
echo ============================================================
if not defined NO_PAUSE pause
exit /b 0

:fail
echo.
echo [ERROR] !FAIL_MESSAGE!
echo [ERROR] BUILD FAILED
if not defined NO_PAUSE pause
exit /b 1