@echo off
echo 🚀 DÉPLOIEMENT AUTOMATIQUE RENDER
echo ==================================

echo.
echo 📋 VÉRIFICATION DES FICHIERS...
echo.

REM Vérifier les fichiers essentiels
if not exist "package.json" (
    echo ❌ package.json manquant
    pause
    exit /b 1
)

if not exist "server.js" (
    echo ❌ server.js manquant
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Dossier frontend manquant
    pause
    exit /b 1
)

echo ✅ Tous les fichiers essentiels sont présents
echo.

echo 🔧 INSTALLATION DES DÉPENDANCES...
npm install

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

echo ✅ Dépendances installées
echo.

echo 🏗️ BUILD DE L'APPLICATION...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Erreur lors du build
    pause
    exit /b 1
)

echo ✅ Build réussi
echo.

echo 📤 PUSH VERS GITHUB...
git add .
git commit -m "Fix deployment configuration - add missing package.json"
git push

if %errorlevel% neq 0 (
    echo ❌ Erreur lors du push GitHub
    pause
    exit /b 1
)

echo ✅ Code poussé vers GitHub
echo.

echo 🌐 OUVERTURE DU GUIDE DE DÉPLOIEMENT...
start GUIDE-DEPLOIEMENT-RENDER.md

echo.
echo 🎯 ÉTAPES SUIVANTES :
echo.
echo 1. 🌐 Allez sur https://render.com
echo 2. 📦 Ouvrez votre service : boutique-aynext-unified
echo 3. ⚙️ Vérifiez que "Root Directory" est VIDE
echo 4. 🔄 Cliquez sur "Manual Deploy" → "Deploy latest commit"
echo 5. ⏱️ Attendez 5-8 minutes
echo.
echo 🎯 Votre site sera accessible sur :
echo https://boutique-aynext-unified.onrender.com
echo.
pause
