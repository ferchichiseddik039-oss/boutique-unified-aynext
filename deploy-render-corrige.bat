@echo off
echo 🚀 DÉPLOIEMENT RENDER - SCRIPT CORRIGÉ
echo =======================================

echo.
echo ✅ CORRECTION APPLIQUÉE :
echo Script de build compatible Linux (Render)
echo.

echo 📋 CHANGEMENTS EFFECTUÉS :
echo ❌ Windows: if exist build rmdir /s /q build
echo ✅ Linux: rm -rf build
echo.
echo ❌ Windows: xcopy /E /I frontend\build build
echo ✅ Linux: cp -r frontend/build/* build/
echo.

echo 🌐 OUVERTURE DU GUIDE...
start CORRECTION-SCRIPT-LINUX.md

echo.
echo 📋 ÉTAPES SUIVANTES :
echo.
echo 1. 🌐 Allez sur https://render.com
echo 2. 📦 Ouvrez votre service : boutique-aynext-unified
echo 3. 🔄 Cliquez sur "Manual Deploy"
echo 4. 📋 Sélectionnez "Deploy latest commit"
echo 5. ⏱️ Attendez 5-8 minutes
echo.
echo 🎯 RÉSULTAT : Votre boutique sera accessible sur :
echo https://boutique-aynext-unified.onrender.com
echo.
echo ✅ LE SCRIPT EST MAINTENANT COMPATIBLE LINUX !
echo Le déploiement devrait réussir.
echo.
pause
