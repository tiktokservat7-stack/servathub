@echo off
setlocal
set "DEST=%USERPROFILE%\servathub"
set "URL=https://github.com/tiktokservat7-stack/servathub/releases/latest/download"

echo.
echo ============================================
echo   Installation de servathub
echo ============================================
echo.

rem 1. Fermer servathub s'il tourne (sinon fichiers verrouilles)
taskkill /IM servathub.exe /F >nul 2>&1

rem 2. Dossier de destination
if not exist "%DEST%" mkdir "%DEST%"

rem 3. Telechargement avec curl (inclus avec Windows 10/11)
echo Telechargement de servathub.exe ...
curl -fsSL --retry 3 -o "%DEST%\servathub.exe" "%URL%/servathub.exe"
if errorlevel 1 goto :err
for %%A in ("%DEST%\servathub.exe") do if %%~zA LSS 10000000 goto :err
echo Telechargement de tree-sitter.wasm ...
curl -fsSL --retry 3 -o "%DEST%\tree-sitter.wasm" "%URL%/tree-sitter.wasm"
if errorlevel 1 goto :err

rem 4. Ajout au PATH utilisateur (sans doublon, sans troncature)
powershell -NoProfile -Command "$d='%DEST%'; $p=[Environment]::GetEnvironmentVariable('Path','User'); if (($p -split ';') -contains $d) { Write-Host 'Deja dans le PATH.' } else { [Environment]::SetEnvironmentVariable('Path', $p.TrimEnd(';')+';'+$d, 'User'); Write-Host 'PATH utilisateur mis a jour.' }"

echo.
echo Termine ! Ouvre un NOUVEAU cmd et tape :  servathub
echo.
exit /b 0

:err
echo.
echo ERREUR pendant le telechargement. Verifie ta connexion puis reessaie.
echo.
exit /b 1
