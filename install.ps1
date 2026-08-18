# servathub — installer
# Télécharge servathub depuis GitHub et l'installe pour l'utilisateur courant.
# Usage (dans cmd) :
#   powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/OWNER/servathub/main/install.ps1 | iex"
$ErrorActionPreference = 'Stop'

# Remplacez par le propriétaire du dépôt GitHub (ex: 'dupont').
$owner = 'OWNER'
$repo = 'servathub'
$dest = Join-Path $env:USERPROFILE 'servathub'
$baseUrl = "https://github.com/$owner/$repo/releases/latest/download"

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Installation de servathub' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

# 1. Dossier de destination
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Write-Host "Destination : $dest"

# 2. Téléchargement des fichiers
Write-Host 'Telechargement de servathub.exe ...'
Invoke-WebRequest -Uri "$baseUrl/servathub.exe" -OutFile (Join-Path $dest 'servathub.exe')
Write-Host 'Telechargement de tree-sitter.wasm ...'
Invoke-WebRequest -Uri "$baseUrl/tree-sitter.wasm" -OutFile (Join-Path $dest 'tree-sitter.wasm')

# 3. Ajout au PATH de l'utilisateur
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
