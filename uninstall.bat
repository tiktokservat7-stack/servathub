@echo off
setlocal
set "DEST=%USERPROFILE%\servathub"

echo.
echo ============================================
echo   Desinstallation de servathub
echo ============================================
echo.

rem 1. Fermer servathub s'il tourne
taskkill /IM servathub.exe /F >nul 2>&1

rem 2. Supprimer le dossier
if not exist "%DEST%" goto :notfound
rmdir /s /q "%DEST%"
echo Dossier supprime : %DEST%
goto :path

:notfound
echo Dossier introuvable (deja supprime ?).

:path
rem 3. Retirer l'entree du PATH utilisateur (sans troncature)
powershell -NoProfile -Command "$d='%DEST%'; $p=[Environment]::GetEnvironmentVariable('Path','User'); if ($p) { $parts = ($p -split ';') | Where-Object { $_ -ne '' -and $_ -ne $d }; [Environment]::SetEnvironmentVariable('Path', ($parts -join ';'), 'User'); Write-Host 'Entree PATH supprimee.' }"

echo.
echo Termine ! servathub a ete desinstalle.
echo Ouvre un NOUVEAU cmd pour que le PATH soit a jour.
echo.
exit /b 0
