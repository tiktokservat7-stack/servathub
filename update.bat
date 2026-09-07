@echo off
setlocal
set "DEST=%USERPROFILE%\servathub"
set "URL=https://github.com/tiktokservat7-stack/servathub/releases/download/v1.8"

echo.
echo ============================================
echo   Mise a jour rapide vers v1.8
echo ============================================
echo.

taskkill /IM servathub.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

echo Telechargement en cours...
curl -fsSL --retry 3 -o "%DEST%\servathub.exe" "%URL%/servathub.exe"
if errorlevel 1 goto :err
curl -fsSL --retry 3 -o "%DEST%\tree-sitter.wasm" "%URL%/tree-sitter.wasm"
if errorlevel 1 goto :err

echo.
echo Mise a jour terminee ! Ouvre un nouveau cmd et tape : servathub
echo.
exit /b 0

:err
echo.
echo ERREUR. Verifie ta connexion.
echo.
exit /b 1
