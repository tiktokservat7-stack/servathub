# servathub v1.7

Assistant de codage IA gratuit basé sur l'interface de chat, avec le modèle **DeepSeek V4 Flash**, sans aucune publicité.

> **Version stable** - Sans le bug Claude/freebuff

-   🚫 Aucune pub
-   🤖 1 modèle IA : DeepSeek V4 Flash (illimité)
-   🔑 Chaque utilisateur se connecte avec son propre compte (gratuit)
-   ✅ Pas de bug "freebuff CLI"

## Installer (Windows)

Ouvre un **invite de commandes (cmd)** et colle une de ces lignes :

**Méthode curl (recommandée) :**

```
curl -fsSL https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/servathub-v1.7/install.bat -o "%TEMP%\sv-install.bat" && "%TEMP%\sv-install.bat"
```

**Méthode PowerShell :**

```
powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/servathub-v1.7/install.ps1 | iex"
```

Puis **ouvre un nouveau cmd** et tape :

```
servathub
```

## Pourquoi cette version ?

La version v1.0.6+ (avec Claude Fable 5) affiche cette erreur :

```
ErrorFree mode is only available through the freebuff CLI. 
Install it with `npm i -g freebuff`, then run `freebuff`.
```

Cette version v1.7 utilise la v1.0.5 (stable) qui ne contient que DeepSeek V4 Flash.

## Mettre à jour

Re-exécute simplement la commande d'installation.

## Manuel

-   L'installeur copie les fichiers dans `%USERPROFILE%\servathub` et ajoute ce dossier au PATH de l'utilisateur.
-   Au premier lancement, connecte-toi avec un compte gratuit (la page de connexion s'ouvre toute seule).
-   `servathub.exe` doit toujours rester à côté de `tree-sitter.wasm` (fichier requis au démarrage).
