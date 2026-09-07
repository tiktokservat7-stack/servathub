# servathub - DeepSeek V4 Flash (Gratuit et illimite)
# Version stable sans le bug freebuff CLI

$ErrorActionPreference = "Stop"
$dest = Join-Path $env:USERPROFILE "servathub"
$url = "https://github.com/tiktokservat7-stack/servathub/releases/download/v1.0.5"

Write-Host ""
Write-Host "============================================"
Write-Host "  servathub v1.8 - DeepSeek V4 Flash"
Write-Host "  Version finale - Gratuit & Illimite"
Write-Host "============================================"
Write-Host ""

# 1. Fermer servathub s'il tourne
Get-Process -Name "servathub" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Dossier de destination
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }

# 3. Telechargement
Write-Host "Telechargement de servathub.exe (v1.0.5 - DeepSeek V4 Flash) ..."
Invoke-WebRequest -Uri "$url/servathub.exe" -OutFile "$dest\servathub.exe" -UseBasicParsing
Write-Host "Telechargement de tree-sitter.wasm ..."
Invoke-WebRequest -Uri "$url/tree-sitter.wasm" -OutFile "$dest\tree-sitter.wasm" -UseBasicParsing

# 4. Ajout au PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($currentPath -split ";") -notcontains $dest) {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$dest", "User")
    Write-Host "PATH utilisateur mis a jour."
} else {
    Write-Host "Deja dans le PATH."
}

Write-Host ""
Write-Host "============================================"
Write-Host "  servathub v1.8 - DeepSeek V4 Flash"
Write-Host "  Modele : DeepSeek V4 Flash"
Write-Host "  Statut : GRATUIT & ILLIMITE"
Write-Host "  Publicite : AUCUNE"
Write-Host "============================================"
Write-Host ""
