# servathub

Assistant de codage IA gratuit basé sur l'interface de chat, avec les modèles **DeepSeek V4 Flash** et **Claude Fable 5**, sans aucune publicité.

- 🚫 Aucune pub
- 🤖 2 modèles IA : DeepSeek V4 Flash (illimité) + Claude Fable 5 (premium)
- 🔑 Chaque utilisateur se connecte avec son propre compte (gratuit)
- 📋 Commande /model pour changer de modèle

## Installer (Windows)

Ouvre un **invite de commandes (cmd)** et colle une de ces lignes :

**Méthode curl (recommandée) :**
```cmd
curl -fsSL https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/install.bat -o "%TEMP%\sv-install.bat" && "%TEMP%\sv-install.bat"
```

**Méthode PowerShell :**
```cmd
powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/install.ps1 | iex"
```

Puis **ouvre un nouveau cmd** et tape :

```cmd
servathub
```

## Mettre à jour

Re-exécute simplement la commande d'installation : l'installeur ferme automatiquement l'ancienne version et remplace les fichiers.

## Désinstaller (Windows)

**Méthode curl :**
```cmd
curl -fsSL https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/uninstall.bat -o "%TEMP%\sv-uninstall.bat" && "%TEMP%\sv-uninstall.bat"
```

**Méthode PowerShell :**
```cmd
powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/uninstall.ps1 | iex"
```

Ouvre ensuite un nouveau cmd pour que le PATH soit à jour.

## Manuel

- L'installeur copie les fichiers dans `%USERPROFILE%\servathub` et ajoute ce dossier au PATH de l'utilisateur.
- Au premier lancement, connecte-toi avec un compte gratuit (la page de connexion s'ouvre toute seule).
- `servathub.exe` doit toujours rester à côté de `tree-sitter.wasm` (fichier requis au démarrage).
