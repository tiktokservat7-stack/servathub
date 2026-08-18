# servathub — désinstalleur
# Ferme servathub, supprime le dossier d'installation et retire le PATH.
# Usage (dans cmd) :
#   powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/uninstall.ps1 | iex"
$ErrorActionPreference = 'Stop'

$dest = Join-Path $env:USERPROFILE 'servathub'

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Desinstallation de servathub' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

# 1. Fermer servathub s'il est en cours d'exécution (sinon les fichiers sont verrouillés)
$running = Get-Process -Name 'servathub' -ErrorAction SilentlyContinue
if ($running) {
  $running | Stop-Process -Force
  Write-Host 'servathub a ete ferme.'
  Start-Sleep -Milliseconds 500
} else {
  Write-Host 'servathub n est pas en cours d execution.'
}

# 2. Supprimer le dossier d'installation
if (Test-Path $dest) {
  Remove-Item -Recurse -Force $dest
  Write-Host "Dossier supprime : $dest"
} else {
  Write-Host 'Dossier introuvable (deja supprime ?).'
}

# 3. Retirer l'entree du PATH utilisateur
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath) {
  $parts = $userPath -split ';' | Where-Object { $_ -ne '' -and $_ -ne $dest }
  $newPath = $parts -join ';'
  [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
  Write-Host 'Entree PATH supprimee.'
} else {
  Write-Host 'Aucun PATH utilisateur a nettoyer.'
}

Write-Host ''
Write-Host 'Termine ! servathub a ete desinstalle.' -ForegroundColor Green
Write-Host 'Ouvre un NOUVEAU invite de commandes pour que le PATH soit a jour.'
Write-Host ''
