# servathub — installeur silencieux
# Télécharge servathub depuis GitHub et l'installe pour l'utilisateur courant.
# Usage (dans cmd) :
#   powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/install.ps1 | iex"
$ErrorActionPreference = 'Stop'
# Pas de barre de progression pendant le téléchargement.
$ProgressPreference = 'SilentlyContinue'

$owner = 'tiktokservat7-stack'
$repo = 'servathub'
$dest = Join-Path $env:USERPROFILE 'servathub'
$baseUrl = "https://github.com/$owner/$repo/releases/latest/download"

# curl.exe est fourni avec Windows 10/11 (dossier System32). Il télécharge sans
# barre de progression et sans marquer les fichiers comme "venant d'Internet"
# (ce qui évite la demande SmartScreen au premier lancement).
$curl = Join-Path $env:SystemRoot 'System32\curl.exe'
if (-not (Test-Path $curl)) { $curl = 'curl.exe' }

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Installation de servathub' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

# 1. Fermer servathub s'il est en cours d'exécution (sinon les fichiers sont
#    verrouillés et l'installation échoue).
$running = Get-Process -Name 'servathub' -ErrorAction SilentlyContinue
if ($running) {
  $running | Stop-Process -Force
  Write-Host 'servathub a ete ferme (mise a jour).'
  Start-Sleep -Milliseconds 500
}

# 2. Dossier de destination
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# 3. Téléchargement des fichiers
Write-Host 'Telechargement de servathub.exe ...'
& $curl -sSL --retry 3 --retry-all-errors -o (Join-Path $dest 'servathub.exe') "$baseUrl/servathub.exe"
if (-not (Test-Path (Join-Path $dest 'servathub.exe')) -or (Get-Item (Join-Path $dest 'servathub.exe')).Length -lt 10MB) {
  Write-Host 'ERREUR : telechargement de servathub.exe echoue.' -ForegroundColor Red
  exit 1
}
Write-Host 'Telechargement de tree-sitter.wasm ...'
& $curl -sSL --retry 3 --retry-all-errors -o (Join-Path $dest 'tree-sitter.wasm') "$baseUrl/tree-sitter.wasm"
if (-not (Test-Path (Join-Path $dest 'tree-sitter.wasm'))) {
  Write-Host 'ERREUR : telechargement de tree-sitter.wasm echoue.' -ForegroundColor Red
  exit 1
}

# 4. Lever toute marque "venant d'Internet" résiduelle (anti-SmartScreen)
Unblock-File -Path (Join-Path $dest 'servathub.exe') -ErrorAction SilentlyContinue
Unblock-File -Path (Join-Path $dest 'tree-sitter.wasm') -ErrorAction SilentlyContinue

# 5. Ajout au PATH de l'utilisateur (sans doublon)
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (($userPath -split ';') -contains $dest) {
  Write-Host 'Deja dans le PATH.'
} else {
  [Environment]::SetEnvironmentVariable('Path', ($userPath.TrimEnd(';') + ';' + $dest), 'User')
  Write-Host 'PATH utilisateur mis a jour.'
}

Write-Host ''
Write-Host 'Termine !' -ForegroundColor Green
Write-Host 'Ouvre un NOUVEAU invite de commandes et tape :  servathub' -ForegroundColor Green
Write-Host ''
