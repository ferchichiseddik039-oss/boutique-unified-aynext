@echo off
echo 🚀 DÉPLOIEMENT LOCAL COMPLET
echo =============================

echo.
echo 📋 ÉTAPES DE DÉPLOIEMENT :
echo.

echo 1. 🛑 Arrêt des processus Node.js...
taskkill /f /im node.exe 2>nul
echo ✅ Processus arrêtés

echo.
echo 2. 📦 Installation des dépendances...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)
echo ✅ Dépendances installées

echo.
echo 3. 🏗️ Build de l'application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du build
    pause
    exit /b 1
)
echo ✅ Build réussi

echo.
echo 4. 🚀 Démarrage du serveur...
echo 📱 Frontend accessible sur: http://localhost:5001
echo 🔧 API accessible sur: http://localhost:5001/api
echo.
start "Boutique AYNEXT" http://localhost:5001
npm start

echo.
echo 🎯 DÉPLOIEMENT LOCAL TERMINÉ !
echo Votre boutique est accessible sur : http://localhost:5001
echo.
pause
